const cron = require('node-cron');
const { pool } = require('../config/db');
const { getRecentTRC20Transactions } = require('./tronService');
require('dotenv').config();

const pollDeposits = async () => {
    try {
        // 1. Get all active users with a valid tron_address (34 chars)
        const [users] = await pool.execute('SELECT id, tron_address FROM users WHERE status = ? AND LENGTH(tron_address) = 34', ['active']);

        for (const user of users) {
            // 2. Fetch recent TRC20 transactions for the user's address
            const transactions = await getRecentTRC20Transactions(user.tron_address);

            for (const txn of transactions) {
                // 3. Filter for USDT (to this user)
                // Note: TronGrid returns amount in Sun (6 decimals for USDT)
                if (txn.to === user.tron_address && txn.type === 'Transfer' && txn.token_info?.symbol === 'USDT') {
                    const amount = parseFloat(txn.value) / 1e6;
                    const txnHash = txn.transaction_id;

                    // 4. Check if this deposit has already been processed
                    const [depositRows] = await pool.execute('SELECT id FROM deposits WHERE tron_txn_id = ?', [txnHash]);

                    if (depositRows.length === 0) {
                        console.log(`New deposit detected: ${amount} USDT for user ${user.id} (Hash: ${txnHash})`);

                        // 5. Start a DB transaction to credit the user
                        const client = await pool.getConnection();
                        try {
                            await client.beginTransaction();

                            // Insert into deposits
                            await client.execute(
                                'INSERT INTO deposits (id, user_id, tron_txn_id, amount_usdt, from_address, status) VALUES (?, ?, ?, ?, ?, ?)',
                                [require('uuid').v4(), user.id, txnHash, amount, txn.from, 'confirmed']
                            );

                            // Update wallet balance
                            await client.execute(
                                'UPDATE wallets SET balance_usdt = balance_usdt + ?, updated_at = NOW() WHERE user_id = ?',
                                [amount, user.id]
                            );

                            // Record transaction
                            await client.execute(
                                'INSERT INTO transactions (id, to_user_id, type, amount, description, status, txn_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [require('uuid').v4(), user.id, 'deposit', amount, `On-chain USDT deposit: ${txnHash}`, 'completed', txnHash]
                            );

                            await client.commit();
                            console.log(`Successfully credited ${amount} USDT to user ${user.id}`);
                        } catch (err) {
                            await client.rollback();
                            console.error('Error processing deposit transaction:', err);
                        } finally {
                            client.release();
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in deposit poller:', error);
    }
};

// Start cron job every 30 seconds (or as configured)
const pollInterval = process.env.DEPOSIT_POLL_INTERVAL_SECONDS || 30;
cron.schedule(`*/${pollInterval} * * * * *`, pollDeposits);

module.exports = { pollDeposits };
