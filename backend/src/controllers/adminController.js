const { pool } = require('../config/db');
const { formatResponse } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { getUSDTBalance, sendUSDT } = require('../services/tronService');
const { runAffiliatePayouts } = require('../services/affiliateCron');
const { distributeAffiliateCommissions } = require('../services/affiliateService');
const { tronWeb } = require('../config/tron');

const getDashboardStats = async (req, res) => {
    try {
        const [userRows] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', ['user']);
        const [activeRows] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE status = 'active' AND role = 'user'");
        const [joinRows] = await pool.execute("SELECT COUNT(*) as count FROM transactions WHERE type = 'join_income' AND DATE(created_at) = CURDATE()");
        const [earnRows] = await pool.execute('SELECT SUM(amount) as sum FROM platform_earnings');
        const [earnTodayRows] = await pool.execute('SELECT SUM(amount) as sum FROM platform_earnings WHERE DATE(created_at) = CURDATE()');
        const [pendingWithRows] = await pool.execute("SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = 'pending'");

        const [recentTxns] = await pool.execute(`
            SELECT t.*, u1.full_name as from_name, u2.full_name as to_name
            FROM transactions t
            LEFT JOIN users u1 ON u1.id = t.from_user_id
            LEFT JOIN users u2 ON u2.id = t.to_user_id
            ORDER BY t.created_at DESC LIMIT 10
        `);

        res.json(formatResponse(true, {
            totalUsers: parseInt(userRows[0].count),
            activeUsers: parseInt(activeRows[0].count),
            todayJoins: parseInt(joinRows[0].count),
            platformEarnings: parseFloat(earnRows[0].sum || 0),
            platformEarningsToday: parseFloat(earnTodayRows[0].sum || 0),
            pendingWithdrawalsCount: parseInt(pendingWithRows[0].count),
            recentTransactions: recentTxns
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getUsers = async (req, res) => {
    const { search, page = 1, limit = 20, status } = req.query;
    const nLimit = parseInt(limit);
    const nOffset = (parseInt(page) - 1) * nLimit;

    try {
        let whereClause = "WHERE u.role = 'user'";
        const params = [];

        if (search) {
            whereClause += " AND (u.full_name LIKE ? OR u.email LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            whereClause += " AND u.status = ?";
            params.push(status);
        }

        const sql = `
            SELECT u.id, u.full_name, u.email, u.status, u.created_at, 
              (SELECT name FROM plans p JOIN user_plans up ON p.id = up.plan_id WHERE up.user_id = u.id AND up.is_active = true LIMIT 1) as plan_name,
              w.balance_usdt
            FROM users u
            LEFT JOIN wallets w ON u.id = w.user_id
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.execute(sql, [...params, nLimit, nOffset]);

        const [totalRows] = await pool.execute(`SELECT COUNT(*) as count FROM users u ${whereClause}`, params);

        res.json(formatResponse(true, {
            users: rows,
            pagination: {
                total: totalRows[0].count,
                page: parseInt(page),
                limit: nLimit,
                pages: Math.ceil(totalRows[0].count / nLimit)
            }
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getUserDetail = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT 
                u.id, u.full_name, u.email, u.tron_address,
                u.referral_code, u.referred_by, u.status,
                u.role, u.created_at,
                w.balance_usdt, w.total_earned, w.total_withdrawn,
                p.name as plan_name, p.price_usdt as plan_price,
                up.id as user_plan_id, up.slots_total, 
                up.slots_used, up.slots_remaining,
                up.purchased_at as plan_purchased_at, up.is_active,
                ru.full_name as referred_by_name,
                ru.email as referred_by_email,
                (SELECT COUNT(*) FROM users WHERE referred_by = u.id) 
                as total_direct_referrals,
                (SELECT COUNT(*) FROM users 
                WHERE referred_by IN 
                    (SELECT id FROM users WHERE referred_by = u.id)) 
                as total_level2_referrals,
                (SELECT COALESCE(SUM(amount),0) FROM transactions 
                WHERE to_user_id = u.id AND type = 'join_income') 
                as total_join_income,
                (SELECT COALESCE(SUM(amount),0) FROM transactions 
                WHERE to_user_id = u.id 
                AND type IN ('affiliate_l1','affiliate_l2')) 
                as total_affiliate_income
            FROM users u
            LEFT JOIN wallets w ON w.user_id = u.id
            LEFT JOIN user_plans up ON up.user_id = u.id 
                AND up.is_active = 1
            LEFT JOIN plans p ON p.id = up.plan_id
            LEFT JOIN users ru ON ru.id = u.referred_by
            WHERE u.id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).json(formatResponse(false, {}, 'User not found'));
        }

        res.json(formatResponse(true, { user: rows[0] }));
    } catch (error) {
        console.error('Error in getUserDetail:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { full_name, email, status, role, new_password } = req.body;

    try {
        // 1. Validate email if changing
        if (email) {
            const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (existing.length > 0) {
                return res.status(400).json(formatResponse(false, {}, 'Email already in use'));
            }
        }

        // 2. Build dynamic update
        const updates = [];
        const params = [];

        if (full_name) { updates.push('full_name = ?'); params.push(full_name); }
        if (email) { updates.push('email = ?'); params.push(email); }
        if (status) { updates.push('status = ?'); params.push(status); }
        if (role) { updates.push('role = ?'); params.push(role); }
        if (new_password) {
            const hash = await bcrypt.hash(new_password, 10);
            updates.push('password_hash = ?');
            params.push(hash);
        }

        if (updates.length === 0) {
            return res.status(400).json(formatResponse(false, {}, 'No fields to update'));
        }

        params.push(userId);
        await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

        // 3. Return updated user
        const [updated] = await pool.execute('SELECT id, full_name, email, status, role FROM users WHERE id = ?', [userId]);
        res.json(formatResponse(true, { user: updated[0] }, 'User updated successfully'));
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const adjustBalance = async (req, res) => {
    const { userId } = req.params;
    const { type, amount, reason } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json(formatResponse(false, {}, 'Invalid amount'));
    }
    if (!['credit', 'debit'].includes(type)) {
        return res.status(400).json(formatResponse(false, {}, 'Invalid adjustment type'));
    }
    if (!reason) {
        return res.status(400).json(formatResponse(false, {}, 'Reason is required'));
    }

    const client = await pool.getConnection();
    try {
        await client.beginTransaction();
        const fAmount = parseFloat(amount);

        // 1. Get current balance
        const [walletRows] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
        if (walletRows.length === 0) throw new Error('Wallet not found');
        const currentBalance = parseFloat(walletRows[0].balance_usdt);

        if (type === 'debit' && currentBalance < fAmount) {
            throw new Error('Insufficient balance for debit');
        }

        // 2. Update wallet
        if (type === 'credit') {
            await client.execute(
                'UPDATE wallets SET balance_usdt = balance_usdt + ?, total_earned = total_earned + ?, updated_at = NOW() WHERE user_id = ?',
                [fAmount, fAmount, userId]
            );
        } else {
            await client.execute(
                'UPDATE wallets SET balance_usdt = balance_usdt - ?, total_withdrawn = total_withdrawn + ?, updated_at = NOW() WHERE user_id = ?',
                [fAmount, fAmount, userId]
            );
        }

        // 3. Insert transaction
        await client.execute(
            'INSERT INTO transactions (id, to_user_id, from_user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), type === 'credit' ? userId : null, type === 'debit' ? userId : null, `admin_${type}`, fAmount, reason, 'completed']
        );

        await client.commit();
        const [newWallet] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ?', [userId]);
        res.json(formatResponse(true, { balance: parseFloat(newWallet[0].balance_usdt) }, 'Balance adjusted successfully'));
    } catch (error) {
        await client.rollback();
        res.status(400).json(formatResponse(false, {}, error.message));
    } finally {
        client.release();
    }
};

const changeUserPlan = async (req, res) => {
    const { userId } = req.params;
    const { plan_id, action, charge_user, note } = req.body;

    const client = await pool.getConnection();
    try {
        await client.beginTransaction();

        // 1. Get plan details
        const [planRows] = await client.execute('SELECT * FROM plans WHERE id = ?', [plan_id]);
        if (planRows.length === 0) throw new Error('Plan not found');
        const plan = planRows[0];

        // 2. Charge user if required
        if (charge_user) {
            const [walletRows] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
            const balance = parseFloat(walletRows[0]?.balance_usdt || 0);
            if (balance < plan.price_usdt) throw new Error('Insufficient balance to charge for plan');

            await client.execute('UPDATE wallets SET balance_usdt = balance_usdt - ?, updated_at = NOW() WHERE user_id = ?', [plan.price_usdt, userId]);

            // 3-Level Affiliate distribution
            await distributeAffiliateCommissions(client, userId, plan.price_usdt);

            // Platform earnings log
            await client.execute('INSERT INTO platform_earnings (id, source_user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), userId, plan.price_usdt, 'plan_fee_admin', `Full plan purchase (admin assigned) from ${userId} - Plan: ${plan.name}`]);
        }

        // 3. Deactivate current plan
        await client.execute('UPDATE user_plans SET is_active = 0 WHERE user_id = ? AND is_active = 1', [userId]);

        // 4. Insert new plan
        await client.execute(
            'INSERT INTO user_plans (id, user_id, plan_id, slots_total, slots_used, slots_remaining, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), userId, plan.id, plan.slots, 0, plan.slots, 1]
        );

        // 5. Transaction log
        await client.execute(
            'INSERT INTO transactions (id, to_user_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), userId, 'plan_change', charge_user ? plan.price_usdt : 0, note || `Plan ${action} by admin`]
        );

        await client.commit();
        res.json(formatResponse(true, { plan_name: plan.name }, 'Plan changed successfully'));
    } catch (error) {
        await client.rollback();
        res.status(400).json(formatResponse(false, {}, error.message));
    } finally {
        client.release();
    }
};

const blockUser = async (req, res) => {
    try {
        await pool.execute("UPDATE users SET status = 'blocked' WHERE id = ?", [req.params.id]);
        res.json(formatResponse(true, {}, 'User blocked'));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const unblockUser = async (req, res) => {
    try {
        await pool.execute("UPDATE users SET status = 'active' WHERE id = ?", [req.params.id]);
        res.json(formatResponse(true, {}, 'User unblocked'));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getUserTransactions = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const nLimit = parseInt(limit);
    const nOffset = (parseInt(page) - 1) * nLimit;

    try {
        let whereClause = 'WHERE (t.from_user_id = ? OR t.to_user_id = ?)';
        const params = [userId, userId];

        if (type) {
            whereClause += ' AND t.type = ?';
            params.push(type);
        }

        const sql = `
            SELECT t.*,
                u1.full_name as from_name, u1.email as from_email,
                u2.full_name as to_name, u2.email as to_email
            FROM transactions t
            LEFT JOIN users u1 ON u1.id = t.from_user_id
            LEFT JOIN users u2 ON u2.id = t.to_user_id
            ${whereClause}
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.execute(sql, [...params, nLimit, nOffset]);
        const [totalRows] = await pool.execute(`SELECT COUNT(*) as count FROM transactions t ${whereClause}`, params);

        res.json(formatResponse(true, {
            transactions: rows,
            pagination: {
                total: totalRows[0].count,
                page: parseInt(page),
                limit: nLimit,
                pages: Math.ceil(totalRows[0].count / nLimit)
            }
        }));
    } catch (error) {
        console.error('Error in getUserTransactions:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getUserNetwork = async (req, res) => {
    const { userId } = req.params;
    try {
        // Level 1
        const [l1] = await pool.execute(`
            SELECT u.id, u.full_name, u.email, u.tron_address, u.status, u.created_at,
                   p.name as plan_name, w.balance_usdt,
                   (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as direct_referrals_count
            FROM users u
            LEFT JOIN user_plans up ON u.id = up.user_id AND up.is_active = 1
            LEFT JOIN plans p ON up.plan_id = p.id
            LEFT JOIN wallets w ON u.id = w.user_id
            WHERE u.referred_by = ?
        `, [userId]);

        // Level 2
        const [l2] = await pool.execute(`
            SELECT u.id, u.full_name, u.email, u.referred_by as referred_by_id, 
                   ru.full_name as referred_by_name, u.status, u.created_at,
                   p.name as plan_name, w.balance_usdt
            FROM users u
            JOIN users ru ON u.referred_by = ru.id
            LEFT JOIN user_plans up ON u.id = up.user_id AND up.is_active = 1
            LEFT JOIN plans p ON up.plan_id = p.id
            LEFT JOIN wallets w ON u.id = w.user_id
            WHERE u.referred_by IN (SELECT id FROM users WHERE referred_by = ?)
        `, [userId]);

        // Stats
        const [earned] = await pool.execute(`
            SELECT SUM(amount) as total FROM transactions 
            WHERE to_user_id = ? AND type IN ('affiliate_l1', 'affiliate_l2')
        `, [userId]);

        res.json(formatResponse(true, {
            level1: l1,
            level2: l2,
            stats: {
                total_level1: l1.length,
                total_level2: l2.length,
                active_level1: l1.filter(u => u.status === 'active').length,
                active_level2: l2.filter(u => u.status === 'active').length,
                total_earned_from_network: parseFloat(earned[0].total || 0)
            }
        }));
    } catch (error) {
        console.error('Error in getUserNetwork:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getUserWithdrawals = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT wr.*, u.full_name, u.email
            FROM withdrawal_requests wr
            JOIN users u ON u.id = wr.user_id
            WHERE wr.user_id = ?
            ORDER BY wr.requested_at DESC
        `, [userId]);

        res.json(formatResponse(true, { withdrawals: rows }));
    } catch (error) {
        console.error('Error in getUserWithdrawals:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getWithdrawals = async (req, res) => {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const nLimit = parseInt(limit);
    const nOffset = (parseInt(page) - 1) * nLimit;

    try {
        const [rows] = await pool.execute(
            `SELECT wr.*, u.full_name, u.email 
             FROM withdrawal_requests wr
             JOIN users u ON wr.user_id = u.id
             WHERE wr.status = ?
             ORDER BY wr.requested_at DESC
             LIMIT ? OFFSET ?`,
            [status, nLimit, nOffset]
        );

        const [totalRows] = await pool.execute('SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = ?', [status]);

        res.json(formatResponse(true, {
            requests: rows,
            pagination: {
                total: totalRows[0].count,
                page: parseInt(page),
                limit: nLimit,
                pages: Math.ceil(totalRows[0].count / nLimit)
            }
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const approveWithdrawal = async (req, res) => {
    const { txn_hash } = req.body;
    const client = await pool.getConnection();
    try {
        await client.beginTransaction();
        const [wrRows] = await client.execute('SELECT * FROM withdrawal_requests WHERE id = ? AND status = ?', [req.params.id, 'pending']);
        if (wrRows.length === 0) throw new Error('Request not found or not pending');

        await client.execute(
            "UPDATE withdrawal_requests SET status = 'approved', txn_hash = ?, processed_at = NOW() WHERE id = ?",
            [txn_hash, req.params.id]
        );

        await client.execute(
            'INSERT INTO transactions (id, to_user_id, type, amount, status, txn_hash, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), wrRows[0].user_id, 'withdrawal', wrRows[0].amount, 'completed', txn_hash, 'Withdrawal processed']
        );

        await client.commit();
        res.json(formatResponse(true, {}, 'Withdrawal approved'));
    } catch (error) {
        await client.rollback();
        res.status(400).json(formatResponse(false, {}, error.message));
    } finally {
        client.release();
    }
};

const rejectWithdrawal = async (req, res) => {
    const { admin_note } = req.body;
    const client = await pool.getConnection();
    try {
        await client.beginTransaction();
        const [wrRows] = await client.execute('SELECT * FROM withdrawal_requests WHERE id = ? AND status = ?', [req.params.id, 'pending']);
        if (wrRows.length === 0) throw new Error('Request not found or not pending');

        const amount = parseFloat(wrRows[0].amount);
        const userId = wrRows[0].user_id;

        // Refund to wallet
        await client.execute(
            'UPDATE wallets SET balance_usdt = balance_usdt + ?, total_withdrawn = total_withdrawn - ?, updated_at = NOW() WHERE user_id = ?',
            [amount, amount, userId]
        );

        await client.execute(
            "UPDATE withdrawal_requests SET status = 'rejected', admin_note = ?, processed_at = NOW() WHERE id = ?",
            [admin_note, req.params.id]
        );

        await client.commit();
        res.json(formatResponse(true, {}, 'Withdrawal rejected and funds refunded'));
    } catch (error) {
        await client.rollback();
        res.status(400).json(formatResponse(false, {}, error.message));
    } finally {
        client.release();
    }
};

const getWallets = async (req, res) => {
    const { page = 1, limit = 20, search, sort } = req.query;
    const nLimit = parseInt(limit);
    const nOffset = (parseInt(page) - 1) * nLimit;

    try {
        let whereClause = "WHERE u.role = 'user'";
        const params = [];

        if (search) {
            whereClause += " AND (u.full_name LIKE ? OR u.email LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        let orderBy = "w.balance_usdt DESC";
        if (sort === 'earned') orderBy = "w.total_earned DESC";
        if (sort === 'recent') orderBy = "u.created_at DESC";
        if (sort === 'balance') orderBy = "w.balance_usdt DESC";

        const sql = `
            SELECT 
                u.id, u.full_name, u.email, u.tron_address, 
                u.referral_code, u.status, u.created_at,
                w.balance_usdt, w.total_earned, w.total_withdrawn,
                p.name as plan_name,
                up.slots_remaining, up.slots_total, up.slots_used
            FROM users u
            LEFT JOIN wallets w ON w.user_id = u.id
            LEFT JOIN user_plans up ON up.user_id = u.id AND up.is_active = 1
            LEFT JOIN plans p ON p.id = up.plan_id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.execute(sql, [...params, nLimit, nOffset]);

        // ENHANCEMENT: Fetch on-chain balances for the current page
        const walletsWithOnChain = await Promise.all(rows.map(async (row) => {
            try {
                if (row.tron_address) {
                    const onChain = await getUSDTBalance(row.tron_address);
                    return { ...row, on_chain_balance: onChain };
                }
                return { ...row, on_chain_balance: 0 };
            } catch (err) {
                console.error(`Error fetching on-chain for ${row.id}:`, err);
                return { ...row, on_chain_balance: null };
            }
        }));

        const [totalRows] = await pool.execute(`SELECT COUNT(*) as count FROM users u ${whereClause}`, params);

        res.json(formatResponse(true, {
            wallets: walletsWithOnChain,
            pagination: {
                total: totalRows[0].count,
                page: parseInt(page),
                limit: nLimit,
                pages: Math.ceil(totalRows[0].count / nLimit)
            }
        }));
    } catch (error) {
        console.error('Error in getWallets:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getOnChainBalance = async (req, res) => {
    const { userId } = req.params;
    try {
        const [userRows] = await pool.execute('SELECT tron_address FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return res.status(404).json(formatResponse(false, {}, 'User not found'));

        const address = userRows[0].tron_address;
        if (!address || address.length !== 34 || !address.startsWith('T')) {
            return res.json(formatResponse(true, { on_chain_balance_usdt: 0, error: "Invalid address" }));
        }

        const onChainBalance = await getUSDTBalance(address);

        const [walletRows] = await pool.execute('SELECT balance_usdt FROM wallets WHERE user_id = ?', [userId]);
        const dbBalance = parseFloat(walletRows[0]?.balance_usdt || 0);

        res.json(formatResponse(true, {
            tron_address: address,
            on_chain_balance_usdt: onChainBalance,
            db_balance_usdt: dbBalance,
            difference: Math.max(0, onChainBalance - dbBalance),
            last_checked: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error fetching on-chain balance:', error);
        res.json(formatResponse(true, { on_chain_balance_usdt: null, error: "Could not fetch" }));
    }
};

const syncBalance = async (req, res) => {
    const { userId } = req.params;
    const client = await pool.getConnection();
    try {
        await client.beginTransaction();

        const [userRows] = await client.execute('SELECT tron_address FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) throw new Error('User not found');

        const address = userRows[0].tron_address;
        const onChainBalance = await getUSDTBalance(address);

        const [walletRows] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ?', [userId]);
        const dbBalance = parseFloat(walletRows[0]?.balance_usdt || 0);

        if (onChainBalance > dbBalance) {
            const difference = onChainBalance - dbBalance;

            // FIX: Ensure wallet exists before update (Upsert)
            if (walletRows.length === 0) {
                await client.execute(
                    'INSERT INTO wallets (id, user_id, balance_usdt, total_earned) VALUES (?, ?, ?, ?)',
                    [uuidv4(), userId, onChainBalance, onChainBalance]
                );
            } else {
                await client.execute(
                    'UPDATE wallets SET balance_usdt = balance_usdt + ?, total_earned = total_earned + ?, updated_at = NOW() WHERE user_id = ?',
                    [difference, difference, userId]
                );
            }

            const txnId = uuidv4();
            await client.execute(
                'INSERT INTO transactions (id, to_user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)',
                [txnId, userId, 'deposit', difference, 'Manual sync by admin', 'completed']
            );

            await client.execute(
                'INSERT INTO deposits (id, user_id, tron_txn_id, amount_usdt, status) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), userId, `SYNC-${Date.now()}`, difference, 'confirmed']
            );

            const [newWalletRows] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ?', [userId]);
            const newDbBalance = parseFloat(newWalletRows[0]?.balance_usdt || 0);

            await client.commit();
            res.json(formatResponse(true, {
                synced: true,
                amount_added: parseFloat(difference.toFixed(6)),
                new_db_balance: parseFloat(newDbBalance.toFixed(6)),
                on_chain_balance: parseFloat(onChainBalance.toFixed(6))
            }));
        } else {
            await client.rollback();
            res.json(formatResponse(true, { synced: false, message: "No difference found" }));
        }
    } catch (error) {
        await client.rollback();
        console.error(error);
        res.status(500).json(formatResponse(false, {}, error.message || 'Server error'));
    } finally {
        client.release();
    }
};

const sendFromUserWallet = async (req, res) => {
    const { userId } = req.params;
    const { to_address, amount, note } = req.body;

    if (!to_address || !to_address.startsWith('T') || to_address.length !== 34) {
        return res.status(400).json(formatResponse(false, {}, 'Invalid destination TRON address'));
    }

    if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json(formatResponse(false, {}, 'Amount must be greater than zero'));
    }

    const client = await pool.getConnection();
    try {
        await client.beginTransaction();

        const [userRows] = await client.execute('SELECT tron_address, tron_private_key_encrypted FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) throw new Error('User not found');

        const { tron_address, tron_private_key_encrypted } = userRows[0];

        // Check on-chain balance
        const onChainBalance = await getUSDTBalance(tron_address);
        if (onChainBalance < amount) {
            throw new Error(`Insufficient on-chain balance. Available: ${onChainBalance} USDT`);
        }

        // Check TRX for gas
        const trxBalanceInSun = await tronWeb.trx.getBalance(tron_address);
        const trxBalance = trxBalanceInSun / 1e6;
        if (trxBalance < 5) {
            throw new Error(`Insufficient TRX for gas fees. Required: 5 TRX, Available: ${trxBalance} TRX`);
        }

        // Send USDT
        const txnHash = await sendUSDT(tron_private_key_encrypted, to_address, amount);

        // Update DB
        const [walletRows] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);

        if (walletRows.length === 0) {
            // Create wallet if it doesn't exist (unlikely but safe)
            await client.execute(
                'INSERT INTO wallets (id, user_id, balance_usdt, total_withdrawn) VALUES (?, ?, ?, ?)',
                [uuidv4(), userId, -amount, amount]
            );
        } else {
            await client.execute(
                'UPDATE wallets SET balance_usdt = balance_usdt - ?, total_withdrawn = total_withdrawn + ?, updated_at = NOW() WHERE user_id = ?',
                [amount, amount, userId]
            );
        }

        const txnId = uuidv4();
        await client.execute(
            'INSERT INTO transactions (id, from_user_id, type, amount, txn_hash, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [txnId, userId, 'withdrawal', amount, txnHash, note || 'Admin initiated send', 'completed']
        );

        await client.execute(
            'INSERT INTO withdrawal_requests (id, user_id, amount, to_tron_address, status, txn_hash, admin_note, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [uuidv4(), userId, amount, to_address, 'approved', txnHash, 'Admin direct send']
        );

        await client.commit();
        res.json(formatResponse(true, {
            txn_hash: txnHash,
            amount: parseFloat(amount),
            to_address
        }, 'Transaction broadcast successfully'));

    } catch (error) {
        await client.rollback();
        console.error('Error in sendFromUserWallet:', error);
        res.status(500).json(formatResponse(false, {}, error.message || 'Server error'));
    } finally {
        client.release();
    }
};

const getLedger = async (req, res) => {
    const { page = 1, limit = 20, type, search } = req.query;
    const nLimit = parseInt(limit);
    const nOffset = (parseInt(page) - 1) * nLimit;

    try {
        let sql = `
            SELECT t.*, u1.full_name as from_name, u2.full_name as to_name
            FROM transactions t
            LEFT JOIN users u1 ON u1.id = t.from_user_id
            LEFT JOIN users u2 ON u2.id = t.to_user_id
            WHERE 1=1
        `;
        const params = [];

        if (type) {
            sql += " AND t.type = ?";
            params.push(type);
        }

        if (search) {
            sql += " AND (t.id LIKE ? OR u1.full_name LIKE ? OR u2.full_name LIKE ?)";
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        sql += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
        params.push(nLimit, nOffset);

        const [rows] = await pool.execute(sql, params);

        let countSql = "SELECT COUNT(*) as count FROM transactions t LEFT JOIN users u1 ON u1.id = t.from_user_id LEFT JOIN users u2 ON u2.id = t.to_user_id WHERE 1=1";
        const countParams = [];
        if (type) { countSql += " AND t.type = ?"; countParams.push(type); }
        if (search) {
            countSql += " AND (t.id LIKE ? OR u1.full_name LIKE ? OR u2.full_name LIKE ?)";
            const term = `%${search}%`;
            countParams.push(term, term, term);
        }

        const [totalRows] = await pool.execute(countSql, countParams);

        res.json(formatResponse(true, {
            transactions: rows,
            pagination: {
                total: totalRows[0].count,
                page: parseInt(page),
                limit: nLimit,
                pages: Math.ceil(totalRows[0].count / nLimit)
            }
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getPlatformEarnings = async (req, res) => {
    try {
        const [totalRows] = await pool.execute('SELECT SUM(amount) as sum FROM platform_earnings');
        const [todayRows] = await pool.execute('SELECT SUM(amount) as sum FROM platform_earnings WHERE DATE(created_at) = CURDATE()');
        const [monthRows] = await pool.execute('SELECT SUM(amount) as sum FROM platform_earnings WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())');

        const [dailyBreakdown] = await pool.execute(`
            SELECT DATE(created_at) as day, SUM(amount) as total
            FROM platform_earnings
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY day ASC
        `);

        const [typeBreakdown] = await pool.execute(`
            SELECT type, SUM(amount) as total
            FROM platform_earnings
            GROUP BY type
        `);

        res.json(formatResponse(true, {
            total_all_time: parseFloat(totalRows[0].sum || 0),
            today: parseFloat(todayRows[0].sum || 0),
            this_month: parseFloat(monthRows[0].sum || 0),
            daily_breakdown: dailyBreakdown,
            type_breakdown: typeBreakdown
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getWalletSummary = async (req, res) => {
    try {
        const [sumRows] = await pool.execute(`
            SELECT 
                COUNT(*) as total_users,
                SUM(balance_usdt) as total_db_balance,
                SUM(total_earned) as total_earned_platform,
                SUM(total_withdrawn) as total_withdrawn_platform
            FROM wallets w
            JOIN users u ON u.id = w.user_id
            WHERE u.role = 'user'
        `);

        const [pendingRows] = await pool.execute("SELECT SUM(amount) as pending_withdrawals FROM withdrawal_requests WHERE status = 'pending'");

        res.json(formatResponse(true, {
            total_users: parseInt(sumRows[0].total_users || 0),
            total_db_balance: parseFloat(sumRows[0].total_db_balance || 0),
            total_earned_platform: parseFloat(sumRows[0].total_earned_platform || 0),
            total_withdrawn_platform: parseFloat(sumRows[0].total_withdrawn_platform || 0),
            pending_withdrawals_amount: parseFloat(pendingRows[0].pending_withdrawals || 0),
            platform_wallet_address: process.env.MASTER_WALLET_ADDRESS,
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const triggerAffiliatePayouts = async (req, res) => {
    try {
        // This is a manual trigger of the daily cron job
        await runAffiliatePayouts();
        res.json(formatResponse(true, {}, 'Daily affiliate payout protocol initiated and processed.'));
    } catch (error) {
        console.error('Error triggering payouts:', error);
        res.status(500).json(formatResponse(false, {}, 'Failed to process payouts.'));
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserDetail,
    updateUser,
    adjustBalance,
    changeUserPlan,
    getUserTransactions,
    getUserNetwork,
    getUserWithdrawals,
    blockUser,
    unblockUser,
    getWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    getWallets,
    getOnChainBalance,
    syncBalance,
    getWalletSummary,
    getLedger,
    getPlatformEarnings,
    triggerAffiliatePayouts,
    sendFromUserWallet,
};
