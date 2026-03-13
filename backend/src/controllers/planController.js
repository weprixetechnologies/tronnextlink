const { pool } = require('../config/db');
const { processJoinIncome } = require('../services/joinIncomeService');
const { formatResponse } = require('../utils/helpers');

const getPlans = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM plans WHERE is_active = true ORDER BY price_usdt ASC');
        res.json(formatResponse(true, rows));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const purchasePlan = async (req, res) => {
    const { plan_id } = req.body;
    const userId = req.user.id;

    try {
        // 1. Check if user already has active slots
        const [rows] = await pool.execute(
            'SELECT id FROM user_plans WHERE user_id = ? AND slots_remaining > 0 AND is_active = true',
            [userId]
        );

        if (rows.length > 0) {
            return res.status(400).json(formatResponse(false, {}, 'You still have active slots'));
        }

        // 2. Process purchase
        await processJoinIncome(userId, plan_id);

        res.json(formatResponse(true, {}, 'Plan purchased successfully'));
    } catch (error) {
        res.status(400).json(formatResponse(false, {}, error.message));
    }
};

module.exports = {
    getPlans,
    purchasePlan,
};
