const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { distributeAffiliateCommissions } = require('./affiliateService');
require('dotenv').config();

const processJoinIncome = async (buyerUserId, planId) => {
    const client = await pool.getConnection();
    try {
        await client.beginTransaction();

        // 1. Get plan details
        const [planRows] = await client.execute('SELECT * FROM plans WHERE id = ? AND is_active = true', [planId]);
        if (planRows.length === 0) throw new Error('Plan not found or inactive');
        const plan = planRows[0];

        // 2. Get buyer's wallet
        const [walletRows] = await client.execute('SELECT balance_usdt FROM wallets WHERE user_id = ? FOR UPDATE', [buyerUserId]);
        if (walletRows.length === 0) throw new Error('Wallet not found');
        const buyerBalance = parseFloat(walletRows[0]?.balance_usdt || 0);

        if (buyerBalance < parseFloat(plan.price_usdt)) {
            throw new Error('Insufficient wallet balance');
        }

        // 3. Find buyer's upline
        const [buyerRows] = await client.execute('SELECT referred_by FROM users WHERE id = ?', [buyerUserId]);
        const referrerId = buyerRows[0].referred_by;

        let uplineUserId = null;

        // Find a valid upline with slots
        if (referrerId) {
            const [uplinePlanRows] = await client.execute(
                'SELECT id, user_id FROM user_plans WHERE user_id = ? AND slots_remaining > 0 AND is_active = true LIMIT 1',
                [referrerId]
            );
            if (uplinePlanRows.length > 0) {
                uplineUserId = referrerId;
            }
        }

        // If no valid upline with slots, the platform (master) gets the income
        // In this simplified logic, we'll track platform income in its own table
        // and potentially a 'master' system user in the 'users' table if needed.
        // Let's assume the first admin handles platform earnings.

        const uplineAmount = plan.price_usdt; // This is the total to be distributed/kept

        // 4. Update buyer (deduct balance)
        await client.execute(
            'UPDATE wallets SET balance_usdt = balance_usdt - ?, updated_at = NOW() WHERE user_id = ?',
            [plan.price_usdt, buyerUserId]
        );

        // 5. Distribute Affiliate Commissions (3 Levels)
        await distributeAffiliateCommissions(client, buyerUserId, plan.price_usdt);

        // 6. Record Platform Participation (Remaining is effectively profit)
        // Note: Affiliate distribution handles its own platform_earnings logging for capped portions.
        // We log the full purchase as a starting point.
        await client.execute(
            'INSERT INTO platform_earnings (id, source_user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), buyerUserId, plan.price_usdt, 'plan_purchase_total', `Full plan purchase from ${buyerUserId} - Plan: ${plan.name}`]
        );

        // 7. Deactivate old plans for this user
        await client.execute(
            'UPDATE user_plans SET is_active = false WHERE user_id = ?',
            [buyerUserId]
        );

        // 8. Create buyer's new user_plan
        await client.execute(
            'INSERT INTO user_plans (id, user_id, plan_id, slots_total, slots_used, slots_remaining, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), buyerUserId, plan.id, plan.slots, 0, plan.slots, true]
        );

        // Record the purchase transaction
        await client.execute(
            'INSERT INTO transactions (id, from_user_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), buyerUserId, 'plan_purchase', plan.price_usdt, `Purchased plan: ${plan.name}`]
        );

        await client.commit();
        return { success: true };
    } catch (error) {
        await client.rollback();
        console.error('Error processing join income:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    processJoinIncome,
};
