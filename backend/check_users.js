const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        const [rows] = await connection.execute('SELECT id, full_name, email, role, status, password_hash FROM users');
        console.log('--- Users in Database ---');
        rows.forEach(user => {
            console.log(`ID: ${user.id} | Name: ${user.full_name} | Email: ${user.email} | Role: ${user.role} | Status: ${user.status} | Hash: ${user.password_hash.substring(0, 10)}...`);
        });
        console.log('-------------------------');
    } catch (err) {
        console.error('Error querying users:', err);
    } finally {
        await connection.end();
    }
}

checkUsers();
