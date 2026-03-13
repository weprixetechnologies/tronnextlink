const { pool } = require('../config/db');
const { formatResponse } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

const getWallet = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT balance_usdt, total_earned, total_withdrawn FROM wallets WHERE user_id = ?',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.json(formatResponse(true, {
                balance_usdt: 0,
                total_earned: 0,
                total_withdrawn: 0
            }));
        }

        const wallet = rows[0];
        res.json(formatResponse(true, {
            balance_usdt: parseFloat(wallet.balance_usdt || 0),
            total_earned: parseFloat(wallet.total_earned || 0),
            total_withdrawn: parseFloat(wallet.total_withdrawn || 0)
        }));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getTransactions = async (req, res) => {
    const { type, page = 1, limit = 10 } = req.query;
    const nPage = parseInt(page);
    const nLimit = parseInt(limit);
    const offset = (nPage - 1) * nLimit;

    try {
        let sql;
        let params = [];

        if (type === 'withdrawal') {
            // Combine completed withdrawals from transactions and pending/rejected from withdrawal_requests
            sql = `
                SELECT * FROM (
                    SELECT id, amount, status, created_at, type, description, txn_hash
                    FROM transactions
                    WHERE from_user_id = ? AND type = 'withdrawal'
                    UNION ALL
                    SELECT id, amount, status, requested_at as created_at, 'withdrawal' as type, to_tron_address as description, txn_hash
                    FROM withdrawal_requests
                    WHERE user_id = ? AND status IN ('pending', 'rejected')
                ) as combined_history
            `;
            params = [req.user.id, req.user.id];
        } else {
            // General transaction filtering
            sql = 'SELECT * FROM transactions WHERE ((to_user_id = ?) OR (from_user_id = ? AND type NOT IN ("join_income", "platform_fee")))';
            params = [req.user.id, req.user.id];

            if (type) {
                sql += ' AND type = ?';
                params.push(type);
            }
        }

        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as count FROM (${sql}) as t`,
            params
        );

        let finalSql = sql + ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const finalParams = [...params, nLimit, offset];

        const [rows] = await pool.execute(finalSql, finalParams);

        res.json(formatResponse(true, {
            transactions: rows,
            pagination: {
                page: nPage,
                limit: nLimit,
                total: countRows[0].count,
                pages: Math.ceil(countRows[0].count / nLimit)
            }
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const requestWithdrawal = async (req, res) => {
    const { amount, to_tron_address } = req.body;
    const userId = req.user.id;

    if (!amount || amount < 5) {
        return res.status(400).json(formatResponse(false, {}, 'Minimum withdrawal is 5 USDT'));
    }

    const client = await pool.getConnection();
    try {
        await client.beginTransaction();

        // 1. Check wallet balance
        const [walletRows] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
        const balance = parseFloat(walletRows[0]?.balance_usdt || 0);

        if (balance < amount) {
            throw new Error('Insufficient balance');
        }

        // 2. Check for pending requests
        const [pendingRows] = await client.execute(
            "SELECT id FROM withdrawal_requests WHERE user_id = ? AND status = 'pending'",
            [userId]
        );
        if (pendingRows.length > 0) {
            throw new Error('You already have a pending withdrawal request');
        }

        // 3. Deduct balance and insert request
        await client.execute(
            'UPDATE wallets SET balance_usdt = balance_usdt - ?, total_withdrawn = total_withdrawn + ?, updated_at = NOW() WHERE user_id = ?',
            [amount, amount, userId]
        );

        await client.execute(
            'INSERT INTO withdrawal_requests (id, user_id, amount, to_tron_address, status) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), userId, amount, to_tron_address, 'pending']
        );

        await client.commit();
        res.json(formatResponse(true, {}, 'Withdrawal request submitted successfully'));
    } catch (error) {
        await client.rollback();
        res.status(400).json(formatResponse(false, {}, error.message));
    } finally {
        client.release();
    }
};

module.exports = {
    getWallet,
    getTransactions,
    requestWithdrawal,
};
