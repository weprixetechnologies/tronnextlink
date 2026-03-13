const { pool } = require('../config/db');
const { formatResponse } = require('../utils/helpers');

const getTree = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch only Level 1 (direct referrals) with their referral count and slot data
        const [l1Rows] = await pool.execute(
            `SELECT u.id, u.full_name, u.email, u.referral_code, u.status,
              p.name as plan_name,
              up.slots_total, up.slots_used, up.slots_remaining,
              (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as direct_referrals_count
       FROM users u
       LEFT JOIN user_plans up ON u.id = up.user_id AND up.is_active = true
       LEFT JOIN plans p ON up.plan_id = p.id
       WHERE u.referred_by = ?
       ORDER BY u.created_at ASC`,
            [userId]
        );

        res.json(formatResponse(true, l1Rows));
    } catch (error) {
        console.error('getTree error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getChildren = async (req, res) => {
    const { userId } = req.params;

    try {
        const [rows] = await pool.execute(
            `SELECT 
              u.id, u.full_name, u.email, u.status,
              u.created_at, u.referral_code,
              p.name as plan_name,
              up.slots_remaining, up.slots_total, up.slots_used,
              (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as direct_referrals_count
            FROM users u
            LEFT JOIN user_plans up ON up.user_id = u.id AND up.is_active = 1
            LEFT JOIN plans p ON p.id = up.plan_id
            WHERE u.referred_by = ?
            ORDER BY u.created_at ASC`,
            [userId]
        );

        res.json(formatResponse(true, {
            parent_id: userId,
            children: rows,
            total: rows.length
        }));
    } catch (error) {
        console.error('getChildren error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getStats = async (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    try {
        // Level 1: Direct Referrals
        const [l1Rows] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE referred_by = ?', [userId]);

        // Level 2: Referrals of L1
        const [l2Rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE referred_by IN (SELECT id FROM users WHERE referred_by = ?)',
            [userId]
        );

        // Level 3: Referrals of L2
        const [l3Rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE referred_by IN (SELECT id FROM users WHERE referred_by IN (SELECT id FROM users WHERE referred_by = ?))',
            [userId]
        );

        // Earnings from network (direct sales commissions)
        // We sum all affiliate types: affiliate_l1, affiliate_l2, affiliate_l3
        const [earnedRows] = await pool.execute(
            "SELECT SUM(amount) as sum FROM transactions WHERE to_user_id = ? AND type LIKE 'affiliate_l%'",
            [userId]
        );

        // Daily affiliate log
        const [affiliateRows] = await pool.execute(
            'SELECT total_affiliate_earned, cap_remaining FROM affiliate_daily_log WHERE user_id = ? AND log_date = ?',
            [userId, today]
        );

        // Active Plan Details
        const [planRows] = await pool.execute(`
            SELECT p.*, up.slots_used, up.slots_total 
            FROM user_plans up 
            JOIN plans p ON up.plan_id = p.id 
            WHERE up.user_id = ? AND up.is_active = true
        `, [userId]);

        // Referral Code
        const [userRows] = await pool.execute('SELECT referral_code FROM users WHERE id = ?', [userId]);

        const l1Count = parseInt(l1Rows[0].count);
        const l2Count = parseInt(l2Rows[0].count);
        const l3Count = parseInt(l3Rows[0].count);

        res.json(formatResponse(true, {
            level1Count: l1Count,
            level2Count: l2Count,
            level3Count: l3Count,
            totalNetworkCount: l1Count + l2Count + l3Count,
            totalAffiliateIncome: parseFloat(earnedRows[0].sum || 0),
            affiliateStats: {
                earned_today: parseFloat(affiliateRows[0]?.total_affiliate_earned || 0),
                cap_remaining: parseFloat(affiliateRows[0]?.cap_remaining || 10.00)
            },
            activePlan: planRows[0] || null,
            referralCode: userRows[0]?.referral_code
        }));
    } catch (error) {
        console.error('getStats error:', error);
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

module.exports = {
    getTree,
    getStats,
    getChildren,
};
