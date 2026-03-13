const cron = require('node-cron');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const runAffiliatePayouts = async () => {
    const client = await pool.getConnection();
    try {
        console.log('Starting daily affiliate payout job...');
        await client.beginTransaction();

        // 1. Get today's date
        const today = new Date().toISOString().split('T')[0];

        // 2. Query all join_income transactions for today
        const [earners] = await client.execute(`
      SELECT to_user_id as earner_id, SUM(amount) as total_earned
      FROM transactions
      WHERE type = 'join_income' AND DATE(created_at) = ?
      GROUP BY to_user_id
    `, [today]);

        const L1_PERCENT = parseFloat(process.env.AFFILIATE_L1_PERCENT) / 100 || 0.05;
        const L2_PERCENT = parseFloat(process.env.AFFILIATE_L2_PERCENT) / 100 || 0.02;

        for (const earner of earners) {
            // LEVEL 1 AFFILIATE: (Upline of the earner)
            const [earnerRows] = await client.execute('SELECT referred_by FROM users WHERE id = ?', [earner.earner_id]);
            const l1UplineId = earnerRows[0]?.referred_by;

            if (l1UplineId) {
                await processWithCap(client, l1UplineId, earner.total_earned * L1_PERCENT, 'affiliate_l1', today, earner.earner_id);

                // LEVEL 2 AFFILIATE: (Upline of the L1 upline)
                const [l1Rows] = await client.execute('SELECT referred_by FROM users WHERE id = ?', [l1UplineId]);
                const l2UplineId = l1Rows[0]?.referred_by;

                if (l2UplineId) {
                    await processWithCap(client, l2UplineId, earner.total_earned * L2_PERCENT, 'affiliate_l2', today, earner.earner_id);
                }
            }
        }

        await client.commit();
        console.log('Daily affiliate payouts completed.');
    } catch (error) {
        await client.rollback();
        console.error('Error in affiliate cron job:', error);
    } finally {
        client.release();
    }
};

const processWithCap = async (client, userId, calculatedAmount, type, date, sourceUserId) => {
    // Check daily log/cap
    const [logRows] = await client.execute(
        'SELECT * FROM affiliate_daily_log WHERE user_id = ? AND log_date = ? FOR UPDATE',
        [userId, date]
    );

    let log;
    if (logRows.length === 0) {
        // Initialize log for today
        const logId = uuidv4();
        const dailyCap = parseFloat(process.env.DAILY_AFFILIATE_CAP) || 10.00;
        await client.execute(
            'INSERT INTO affiliate_daily_log (id, user_id, log_date, total_affiliate_earned, cap_remaining) VALUES (?, ?, ?, 0, ?)',
            [logId, userId, date, dailyCap]
        );
        log = { id: logId, user_id: userId, log_date: date, total_affiliate_earned: 0, cap_remaining: dailyCap, cap_reached: false };
    } else {
        log = logRows[0];
    }

    if (log.cap_reached) return;

    const amountToCredit = Math.min(calculatedAmount, parseFloat(log.cap_remaining));
    if (amountToCredit <= 0) return;

    // Credit member wallet
    await client.execute(
        'UPDATE wallets SET balance_usdt = balance_usdt + ?, total_earned = total_earned + ?, updated_at = NOW() WHERE user_id = ?',
        [amountToCredit, amountToCredit, userId]
    );

    // Update daily log
    const newCapRemaining = parseFloat(log.cap_remaining) - amountToCredit;
    await client.execute(
        'UPDATE affiliate_daily_log SET total_affiliate_earned = total_affiliate_earned + ?, cap_remaining = ?, cap_reached = ? WHERE id = ?',
        [amountToCredit, newCapRemaining, newCapRemaining <= 0.000001, log.id]
    );

    // Record transaction
    await client.execute(
        'INSERT INTO transactions (id, from_user_id, to_user_id, type, amount, description) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), sourceUserId, userId, type, amountToCredit, `Affiliate earnings (${type}) from user ${sourceUserId}`]
    );

    // Log as platform expense (payout)
    await client.execute(
        'INSERT INTO platform_earnings (id, source_user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), userId, -amountToCredit, 'affiliate_payout', `Affiliate payout (${type}) to ${userId}`]
    );
};

// The cron is typically horizontal across the app, but here we export the function too
module.exports = { runAffiliatePayouts };
