const { pool } = require('../config/db');
const { formatResponse } = require('../utils/helpers');

/**
 * GET /api/admin/analytics/platform-health
 */
const getPlatformHealth = async (req, res) => {
    try {
        // 1. Total DB Balances Owed
        const [dbBalRows] = await pool.execute('SELECT SUM(balance_usdt) as total FROM wallets');
        const totalDbBalances = parseFloat(dbBalRows[0].total || 0);

        // 2. Total On-Chain Balance (Live from Platform Master Wallet)
        const { tronWeb, USDT_CONTRACT_ADDRESS } = require('../config/tron');
        let totalOnChain = 0;
        let lastSynced = new Date();
        try {
            const masterAddress = tronWeb.defaultAddress.base58;
            if (masterAddress) {
                const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
                const balance = await contract.balanceOf(masterAddress).call();
                totalOnChain = tronWeb.toBigNumber(balance).div(1e6).toNumber();
            }
        } catch (err) {
            console.error('Failed to live-sync master wallet on-chain balance:', err);
            // Fallback if network is down
            const [onChainRows] = await pool.execute('SELECT SUM(balance_onchain) as total, MAX(balance_synced_at) as last_synced FROM wallets');
            totalOnChain = parseFloat(onChainRows[0]?.total || 0);
            lastSynced = onChainRows[0]?.last_synced;
        }

        // 3. Platform Earnings
        const [earningsRows] = await pool.execute('SELECT SUM(amount) as total FROM platform_earnings');
        const totalPlatformEarnings = parseFloat(earningsRows[0].total || 0);

        // 4. Distrubuted Income
        const [joinIncomeRows] = await pool.execute("SELECT SUM(amount) as total FROM transactions WHERE type = 'join_income'");
        const [affiliateRows] = await pool.execute("SELECT SUM(amount) as total FROM transactions WHERE type LIKE 'affiliate_%'");
        const [adminCreditRows] = await pool.execute("SELECT SUM(amount) as total FROM transactions WHERE type = 'admin_credit'");

        // 5. Flow Totals & Counts
        const [depositRows] = await pool.execute("SELECT SUM(amount_usdt) as total, COUNT(*) as count FROM deposits WHERE status = 'confirmed'");
        const totalDeposits = parseFloat(depositRows[0].total || 0);
        const totalDepositCount = depositRows[0].count || 0;

        const [withdrawalRows] = await pool.execute("SELECT SUM(amount) as total, COUNT(*) as count FROM withdrawal_requests WHERE status = 'approved'");
        const totalWithdrawals = parseFloat(withdrawalRows[0].total || 0);
        const totalWithdrawalCount = withdrawalRows[0].count || 0;

        // 6. Pending Totals
        const [pendingWithdrawalRows] = await pool.execute("SELECT COUNT(*) as count, SUM(amount) as total FROM withdrawal_requests WHERE status = 'pending'");

        res.json(formatResponse(true, {
            total_db_balances: totalDbBalances,
            total_onchain_balance: totalOnChain,
            net_profit: totalDeposits - totalWithdrawals, // Changed to: Total Deposits - Total Withdrawals
            total_platform_earnings: totalPlatformEarnings,
            total_join_income_paid: parseFloat(joinIncomeRows[0].total || 0),
            total_affiliate_paid: parseFloat(affiliateRows[0].total || 0),
            total_admin_credits: parseFloat(adminCreditRows[0].total || 0),
            total_deposits: totalDeposits,
            total_deposit_count: totalDepositCount,
            total_withdrawals: totalWithdrawals,
            approved_withdrawals_count: totalWithdrawalCount,
            pending_withdrawals_count: pendingWithdrawalRows[0].count,
            pending_withdrawals_amount: parseFloat(pendingWithdrawalRows[0].total || 0),
            onchain_last_synced: lastSynced
        }));
    } catch (error) {
        console.error('getPlatformHealth error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

/**
 * GET /api/admin/analytics/growth?range=30d
 */
const getGrowthStats = async (req, res) => {
    const { range = '30d' } = req.query;
    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === 'all') days = 3650; // 10 years

    try {
        // Daily breakdown query
        // We use a date generator or subqueries. For MySQL, subqueries per date is safer for small sets.
        // Better: Query all events and aggregate in JS for flexibility.

        const [dailyStats] = await pool.execute(`
            SELECT 
                DATE(created_at) as date,
                COUNT(CASE WHEN role='user' THEN 1 END) as new_users
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `, [days]);

        const [dailyDeposits] = await pool.execute(`
            SELECT DATE(created_at) as date, SUM(amount_usdt) as amount
            FROM deposits
            WHERE status = 'confirmed' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
        `, [days]);

        const [dailyWithdrawals] = await pool.execute(`
            SELECT DATE(requested_at) as date, SUM(amount) as amount
            FROM withdrawal_requests
            WHERE status = 'approved' AND requested_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(requested_at)
        `, [days]);

        const [dailyEarnings] = await pool.execute(`
            SELECT DATE(created_at) as date, SUM(amount) as amount
            FROM platform_earnings
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
        `, [days]);

        // Plan distribution
        const [planDist] = await pool.execute(`
            SELECT 
                p.name as plan_name,
                COUNT(up.id) as user_count,
                SUM(p.price_usdt) as total_revenue,
                (COUNT(up.id) * 100 / (SELECT COUNT(*) FROM user_plans WHERE is_active = 1)) as percentage
            FROM user_plans up
            JOIN plans p ON up.plan_id = p.id
            WHERE up.is_active = 1
            GROUP BY p.id
        `);

        // Merge daily data
        const dateMap = {};
        const processData = (data, key) => {
            data.forEach(item => {
                const d = item.date.toISOString().split('T')[0];
                if (!dateMap[d]) dateMap[d] = { date: d, new_users: 0, deposits: 0, withdrawals: 0, platform_fees: 0 };
                dateMap[d][key] = parseFloat(item.amount || item.new_users || 0);
            });
        };

        processData(dailyStats, 'new_users');
        processData(dailyDeposits, 'deposits');
        processData(dailyWithdrawals, 'withdrawals');
        processData(dailyEarnings, 'platform_fees');

        const dailyArray = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));

        res.json(formatResponse(true, {
            daily: dailyArray,
            plan_distribution: planDist
        }));
    } catch (error) {
        console.error('getGrowthStats error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

/**
 * GET /api/admin/analytics/joinings
 */
const getJoinings = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    try {
        const [rows] = await pool.execute(`
            SELECT 
                up.purchased_at as date,
                u.full_name as user_name,
                u.email as user_email,
                p.name as plan_name,
                p.price_usdt as plan_price,
                upline.full_name as upline_name,
                upline.email as upline_email,
                (p.price_usdt * 0.75) as upline_received,
                (p.price_usdt * 0.25) as platform_received,
                (upline.id IS NOT NULL) as has_valid_upline
            FROM user_plans up
            JOIN users u ON u.id = up.user_id
            JOIN plans p ON p.id = up.plan_id
            LEFT JOIN users upline ON upline.id = u.referred_by
            ORDER BY up.purchased_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [totalRows] = await pool.execute('SELECT COUNT(*) as count FROM user_plans');
        const total = totalRows[0].count;

        res.json(formatResponse(true, {
            data: rows,
            total,
            page,
            pages: Math.ceil(total / limit)
        }));
    } catch (error) {
        console.error('getJoinings error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

/**
 * GET /api/admin/analytics/user-statement/:userId
 */
const getUserStatement = async (req, res) => {
    const { userId } = req.params;

    try {
        const [userRows] = await pool.execute('SELECT id, full_name, email, status, created_at FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return res.status(404).json(formatResponse(false, {}, 'User not found'));

        const [planRows] = await pool.execute(`
            SELECT p.name, p.price_usdt, up.slots_total, up.slots_used 
            FROM user_plans up 
            JOIN plans p ON up.plan_id = p.id 
            WHERE up.user_id = ? AND up.is_active = 1
        `, [userId]);

        const [summaryRows] = await pool.execute(`
            SELECT
                COALESCE(SUM(CASE WHEN type='deposit' THEN amount END), 0) as total_deposited,
                COALESCE(SUM(CASE WHEN type='plan_purchase' THEN amount END), 0) as total_plan_spend,
                COALESCE(SUM(CASE WHEN type='join_income' THEN amount END), 0) as join_income_earned,
                COALESCE(SUM(CASE WHEN type='affiliate_l1' THEN amount END), 0) as affiliate_l1_earned,
                COALESCE(SUM(CASE WHEN type='affiliate_l2' THEN amount END), 0) as affiliate_l2_earned,
                COALESCE(SUM(CASE WHEN type='admin_credit' THEN amount END), 0) as admin_credits_received,
                COALESCE(SUM(CASE WHEN type='admin_debit' THEN amount END), 0) as admin_debits,
                COALESCE(SUM(CASE WHEN type='withdrawal' THEN amount END), 0) as total_withdrawn
            FROM transactions
            WHERE to_user_id = ? OR from_user_id = ?
        `, [userId, userId]);

        const [txRows] = await pool.execute(`
            SELECT id, created_at, type, amount, description 
            FROM transactions 
            WHERE to_user_id = ? OR from_user_id = ?
            ORDER BY created_at DESC
        `, [userId, userId]);

        // Calculate running balance
        let balance = 0;
        const transactions = txRows.reverse().map(tx => {
            if (['deposit', 'join_income', 'affiliate_l1', 'affiliate_l2', 'admin_credit'].includes(tx.type)) {
                balance += parseFloat(tx.amount);
            } else if (['plan_purchase', 'withdrawal', 'admin_debit'].includes(tx.type)) {
                balance -= parseFloat(tx.amount);
            }
            return { ...tx, balance_after: balance };
        }).reverse();

        const [networkRows] = await pool.execute(`
            SELECT 
                COUNT(*) as total_referred,
                SUM(p.price_usdt) as referred_users_total_paid
            FROM users u
            JOIN user_plans up ON u.id = up.user_id
            JOIN plans p ON up.plan_id = p.id
            WHERE u.referred_by = ?
        `, [userId]);

        const summary = summaryRows[0];
        const totalEarned = parseFloat(summary.join_income_earned) + parseFloat(summary.affiliate_l1_earned) + parseFloat(summary.affiliate_l2_earned) + parseFloat(summary.admin_credits_received);

        const platformCollectedFromUser = planRows[0] ? parseFloat(planRows[0].price_usdt) * 0.25 : 0;
        const platformPaidToUser = totalEarned;

        res.json(formatResponse(true, {
            user: userRows[0],
            plan: planRows[0] || null,
            summary: {
                ...summary,
                total_earned: totalEarned,
                current_balance: balance,
                platform_collected_from_user: platformCollectedFromUser,
                platform_paid_to_user: platformPaidToUser,
                net_platform_position: platformCollectedFromUser - platformPaidToUser
            },
            transactions,
            network_contribution: {
                total_referred: networkRows[0].total_referred,
                referred_users_total_paid: parseFloat(networkRows[0].referred_users_total_paid || 0),
                platform_earned_from_network: parseFloat(networkRows[0].referred_users_total_paid || 0) * 0.25,
                user_earned_from_network: parseFloat(summary.join_income_earned)
            }
        }));
    } catch (error) {
        console.error('getUserStatement error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

/**
 * GET /api/admin/analytics/withdrawals/pending
 */
const getPendingWithdrawals = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                wr.id, wr.user_id, u.full_name as user_name, u.email as user_email,
                wr.amount, wr.requested_at, wr.to_tron_address,
                u.tron_address as user_wallet_address,
                w.balance_onchain as user_onchain_balance
            FROM withdrawal_requests wr
            JOIN users u ON wr.user_id = u.id
            JOIN wallets w ON u.id = w.user_id
            WHERE wr.status = 'pending' OR wr.status = 'sourced'
            ORDER BY wr.requested_at ASC
        `);

        res.json(formatResponse(true, rows));
    } catch (error) {
        console.error('getPendingWithdrawals error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

/**
 * POST /api/admin/analytics/withdrawals/:id/source-funds
 */
const sourceWithdrawalFunds = async (req, res) => {
    const { id } = req.params;
    const { sources, total_sourced } = req.body;

    try {
        await pool.execute(
            "UPDATE withdrawal_requests SET status = 'sourced', sourcing_notes = ?, sourced_at = NOW() WHERE id = ?",
            [JSON.stringify(sources), id]
        );

        res.json(formatResponse(true, {}, 'Funds sourced successfully'));
    } catch (error) {
        console.error('sourceWithdrawalFunds error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

/**
 * PATCH /api/admin/analytics/withdrawals/:id/complete
 */
const completeWithdrawal = async (req, res) => {
    const { id } = req.params;
    const { txn_hash } = req.body;

    try {
        const [wrRows] = await pool.execute('SELECT * FROM withdrawal_requests WHERE id = ?', [id]);
        if (wrRows.length === 0) return res.status(404).json(formatResponse(false, {}, 'Withdrawal not found'));

        const wr = wrRows[0];

        // Update withdrawal request
        await pool.execute(
            "UPDATE withdrawal_requests SET status = 'approved', txn_hash = ?, completed_at = NOW(), processed_at = NOW() WHERE id = ?",
            [txn_hash, id]
        );

        // Update wallet totals (actual balance reduction happens at request time usually)
        await pool.execute(
            "UPDATE wallets SET total_withdrawn = total_withdrawn + ? WHERE user_id = ?",
            [wr.amount, wr.user_id]
        );

        // Record in transactions if not already recorded
        await pool.execute(
            "INSERT INTO transactions (id, to_user_id, from_user_id, type, amount, description, txn_hash, status) VALUES (UUID(), ?, NULL, 'withdrawal', ?, ?, ?, 'completed')",
            [wr.user_id, wr.amount, 'Withdrawal to ' + wr.to_tron_address, txn_hash]
        );

        res.json(formatResponse(true, {}, 'Withdrawal completed successfully'));
    } catch (error) {
        console.error('completeWithdrawal error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

/**
 * GET /api/admin/analytics/platform-earnings
 */
const getPlatformEarningsLedger = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                pe.created_at as date,
                u.full_name as from_user,
                p.name as plan_name,
                pe.amount,
                pe.type,
                pe.description
            FROM platform_earnings pe
            LEFT JOIN users u ON pe.source_user_id = u.id
            LEFT JOIN user_plans up ON u.id = up.user_id AND up.is_active = 1
            LEFT JOIN plans p ON up.plan_id = p.id
            ORDER BY pe.created_at DESC
        `);

        const [summaryRows] = await pool.execute(`
            SELECT 
                SUM(amount) as total_collected,
                (SELECT SUM(amount) FROM transactions WHERE type LIKE 'affiliate_%') as paid_as_affiliate
            FROM platform_earnings
        `);

        const summary = summaryRows[0];
        const total_collected = parseFloat(summary.total_collected || 0);
        const paid_as_affiliate = parseFloat(summary.paid_as_affiliate || 0);

        res.json(formatResponse(true, {
            entries: rows,
            summary: {
                total_collected,
                paid_as_affiliate,
                net_remaining: total_collected - paid_as_affiliate
            }
        }));
    } catch (error) {
        console.error('getPlatformEarningsLedger error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

module.exports = {
    getPlatformHealth,
    getGrowthStats,
    getJoinings,
    getUserStatement,
    getPendingWithdrawals,
    sourceWithdrawalFunds,
    completeWithdrawal,
    getPlatformEarningsLedger
};
