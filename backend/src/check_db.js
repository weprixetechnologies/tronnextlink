const { pool } = require('./config/db');

async function checkDB() {
    try {
        const [users] = await pool.execute('SELECT * FROM users');
        console.log('Users:', JSON.stringify(users, null, 2));

        const [wallets] = await pool.execute('SELECT * FROM wallets');
        console.log('Wallets:', JSON.stringify(wallets, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
