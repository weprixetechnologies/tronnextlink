const { v4: uuidv4 } = require('uuid');

/**
 * Distributes affiliate commissions across 3 levels with daily capping.
 * @param {Object} client - Database connection/transaction client
 * @param {string} buyerUserId - The user who bought/received the plan
 * @param {number} planPrice - The price of the plan in USDT
 */
const distributeAffiliateCommissions = async (client, buyerUserId, planPrice) => {
    const today = new Date().toISOString().split('T')[0];
    const DAILY_CAP = parseFloat(process.env.DAILY_AFFILIATE_CAP) || 10.00;

    // Commission Rates
    const L1_RATE = 0.75;
    const L2_OF_L1_RATE = 0.05; // 5% of the 75%
    const L3_OF_L1_RATE = 0.02; // 2% of the 75%

    // 1. Level 1 - Direct Referrer
    const [userRows] = await client.execute('SELECT referred_by FROM users WHERE id = ?', [buyerUserId]);
    const l1Id = userRows[0]?.referred_by;
    if (!l1Id) return; // No referral chain

    const l1Commission = planPrice * L1_RATE;
    await processWithCap(client, l1Id, l1Commission, 'affiliate_l1', today, buyerUserId, `Level 1 Commission from ${buyerUserId}`, DAILY_CAP);

    // 2. Level 2 - Referrer of L1
    const [l1Rows] = await client.execute('SELECT referred_by FROM users WHERE id = ?', [l1Id]);
    const l2Id = l1Rows[0]?.referred_by;
    if (!l2Id) return;

    const l2Commission = l1Commission * L2_OF_L1_RATE;
    await processWithCap(client, l2Id, l2Commission, 'affiliate_l2', today, buyerUserId, `Level 2 Commission from ${buyerUserId}`, DAILY_CAP);

    // 3. Level 3 - Referrer of L2
    const [l2Rows] = await client.execute('SELECT referred_by FROM users WHERE id = ?', [l2Id]);
    const l3Id = l2Rows[0]?.referred_by;
    if (!l3Id) return;

    const l3Commission = l1Commission * L3_OF_L1_RATE;
    await processWithCap(client, l3Id, l3Commission, 'affiliate_l3', today, buyerUserId, `Level 3 Commission from ${buyerUserId}`, DAILY_CAP);
};

/**
 * Processes a single commission with capping logic.
 */
const processWithCap = async (client, userId, amount, type, date, sourceUserId, description, dailyCap) => {
    // Check/Create daily log
    const [logRows] = await client.execute(
        'SELECT * FROM affiliate_daily_log WHERE user_id = ? AND log_date = ? FOR UPDATE',
        [userId, date]
    );

    let log;
    if (logRows.length === 0) {
        const logId = uuidv4();
        await client.execute(
            'INSERT INTO affiliate_daily_log (id, user_id, date, log_date, total_affiliate_earned, cap_remaining) VALUES (?, ?, ?, ?, 0, ?)',
            [logId, userId, date, date, dailyCap]
        );
        log = { id: logId, user_id: userId, log_date: date, total_affiliate_earned: 0, cap_remaining: dailyCap, cap_reached: 0 };
    } else {
        log = logRows[0];
    }

    if (log.cap_reached) {
        // Log as platform profit (uncapped portion)
        await client.execute(
            'INSERT INTO platform_earnings (id, source_user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), sourceUserId, amount, 'capped_profit', `Capped affiliate (${type}) from ${sourceUserId} for ${userId} (Cap Reached)`]
        );
        return;
    }

    const amountToCredit = Math.min(amount, parseFloat(log.cap_remaining));
    const cappedAmount = amount - amountToCredit;

    if (amountToCredit > 0) {
        // Credit user wallet
        await client.execute(
            'UPDATE wallets SET balance_usdt = balance_usdt + ?, total_earned = total_earned + ?, updated_at = NOW() WHERE user_id = ?',
            [amountToCredit, amountToCredit, userId]
        );

        // Update daily log
        const newCapRemaining = Math.max(0, parseFloat(log.cap_remaining) - amountToCredit);
        await client.execute(
            'UPDATE affiliate_daily_log SET total_affiliate_earned = total_affiliate_earned + ?, cap_remaining = ?, cap_reached = ? WHERE id = ?',
            [amountToCredit, newCapRemaining, newCapRemaining <= 0.000001 ? 1 : 0, log.id]
        );

        // Record transaction
        await client.execute(
            'INSERT INTO transactions (id, from_user_id, to_user_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), sourceUserId, userId, type, amountToCredit, description, 'completed']
        );
    }

    // If there was a capped amount, log it as platform profit
    if (cappedAmount > 0) {
        await client.execute(
            'INSERT INTO platform_earnings (id, source_user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), sourceUserId, cappedAmount, 'capped_profit', `Capped affiliate (${type}) from ${sourceUserId} - Amount: ${cappedAmount}`]
        );
    }
};

module.exports = {
    distributeAffiliateCommissions
};
