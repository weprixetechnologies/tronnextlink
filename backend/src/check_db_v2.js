require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDB() {
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

    console.log('Connecting with:', { ...config, password: '***' });

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected successfully');

        const [users] = await connection.execute('SELECT id, full_name, email, role, status FROM users');
        console.log('All Users:', JSON.stringify(users, null, 2));

        const [userRoleUsers] = await connection.execute("SELECT * FROM users WHERE role = 'user'");
        console.log("Users with role='user':", userRoleUsers.length);

        const [wallets] = await connection.execute('SELECT * FROM wallets');
        console.log('Total Wallets:', wallets.length);

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDB();
