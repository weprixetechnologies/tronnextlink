require('dotenv').config();
const { pool } = require('./config/db');

async function testFetch() {
    try {
        const page = 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const whereClause = "WHERE u.role = 'user'";
        const orderBy = "w.balance_usdt DESC";
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
        console.log('Executing SQL...');
        const [rows] = await pool.execute(sql, [String(limit), String(offset)]);
        console.log('Rows Found:', rows.length);
        console.log('Rows:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testFetch();
