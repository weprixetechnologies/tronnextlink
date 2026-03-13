/**
 * Send USDT from MLM User Wallet → External Wallet (Trust Wallet etc)
 * 
 * Use case: Testing withdrawal flow
 * The MLM user wallet private key is stored encrypted in your DB.
 * This script decrypts it and sends USDT to any external address.
 * 
 * Run: node withdraw-to-external.js
 */

require('dotenv').config();
const { TronWeb } = require('tronweb');
const CryptoJS = require('crypto-js');
const mysql = require('mysql2/promise');

// ═══════════════════════════════════════════
// CONFIGURE THESE
// ═══════════════════════════════════════════

const USER_EMAIL = 'ronit@gmail.com';
// The MLM user whose wallet you want to send FROM
// Example: 'alice@test.com'

const RECEIVER_ADDRESS = 'TG4pyHYEFW1yTNgbe6RdLk2H2DTb3dukNU';
// Your Trust Wallet / any external TRON wallet address
// Must be a valid TRON address starting with T

const AMOUNT_USDT = 1;
// How much to send

// ═══════════════════════════════════════════
// CONFIG (from .env automatically)
// ═══════════════════════════════════════════
const USDT_CONTRACT = process.env.USDT_CONTRACT_TESTNET;
const TRON_HOST = 'https://api.shasta.trongrid.io';
const ENCRYPTION_SECRET = process.env.WALLET_ENCRYPTION_SECRET;
const API_KEY = process.env.TRONGRID_API_KEY;

// ═══════════════════════════════════════════
// DECRYPT PRIVATE KEY (same as your tronService)
// ═══════════════════════════════════════════
function decryptPrivateKey(encryptedKey) {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
async function sendFromUserWallet() {
    console.log('\n🚀 MLM WALLET → EXTERNAL WALLET\n');
    console.log('═'.repeat(50));

    // Validate
    if (USER_EMAIL === 'PASTE_USER_EMAIL_HERE') {
        console.error('❌ Set USER_EMAIL in the script'); process.exit(1);
    }
    if (RECEIVER_ADDRESS === 'PASTE_TRUST_WALLET_ADDRESS_HERE') {
        console.error('❌ Set RECEIVER_ADDRESS in the script'); process.exit(1);
    }
    if (!RECEIVER_ADDRESS.startsWith('T') || RECEIVER_ADDRESS.length !== 34) {
        console.error('❌ Invalid TRON address. Must start with T and be 34 chars.');
        process.exit(1);
    }

    // Connect DB
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: 3306,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        // Step 1 — Get user from DB
        console.log(`🔍 Looking up user: ${USER_EMAIL}`);
        //     const [rows] = await db.execute(
        //         `SELECT u.id, u.full_name, u.email, u.tron_address, 
        //           u.tron_private_key_encrypted, w.balance_usdt
        //    FROM users u
        //    JOIN wallets w ON w.user_id = u.id
        //    WHERE u.email = ?`,
        //         [USER_EMAIL]
        //     );

        //     if (!rows.length) {
        //         console.error(`❌ User not found: ${USER_EMAIL}`); process.exit(1);
        //     }

        // const user = rows[0];
        // console.log(`✅ Found: ${user.full_name}`);
        console.log(`   TRON Address: ${'TUyHdYbJsHgLYGGPCQpXgiNdFScb5VLmZz'}`);
        // console.log(`   DB Balance:   $${user.balance_usdt} USDT`);

        // Step 2 — Decrypt private key
        console.log('\n🔓 Decrypting private key...');
        let privateKey;
        try {
            privateKey = decryptPrivateKey('U2FsdGVkX1/UWA5YCbYXCKj0Husvngll+Ku2Z/dY5xENAFxRmQ3WJIyfh2sGuX/UkpnMHDge0yzaqlKRf65Fi4ct3qzfMvSmNVI1jJUsGaiDEGJOF7mxDnS1aXK5N8xz');
            if (!privateKey || privateKey.length < 60) throw new Error('Decryption failed');
            console.log('✅ Private key decrypted successfully');
        } catch (e) {
            console.error('❌ Could not decrypt private key:', e.message);
            console.error('   Check WALLET_ENCRYPTION_SECRET in your .env');
            process.exit(1);
        }

        // Step 3 — Initialize TronWeb with user's private key
        const tronWeb = new TronWeb({
            fullHost: TRON_HOST,
            headers: { 'TRON-PRO-API-KEY': API_KEY },
            privateKey: privateKey
        });

        // Step 4 — Check on-chain USDT balance
        console.log('\n🔍 Checking on-chain USDT balance...');
        const contract = await tronWeb.contract().at(USDT_CONTRACT);
        const rawBalance = await contract.balanceOf('TUyHdYbJsHgLYGGPCQpXgiNdFScb5VLmZz').call();
        const onChainBalance = Number(rawBalance) / 1_000_000;
        console.log(`   On-chain USDT: ${onChainBalance} USDT`);

        if (onChainBalance < AMOUNT_USDT) {
            console.error(`❌ Not enough on-chain USDT.`);
            console.error(`   On-chain: ${onChainBalance} USDT`);
            console.error(`   Trying to send: ${AMOUNT_USDT} USDT`);
            process.exit(1);
        }

        // Step 5 — Check TRX balance for gas
        console.log('\n🔍 Checking TRX balance for gas...');
        const trxBalance = await tronWeb.trx.getBalance('TUyHdYbJsHgLYGGPCQpXgiNdFScb5VLmZz');
        const trxReadable = trxBalance / 1_000_000;
        console.log(`   TRX Balance: ${trxReadable} TRX`);

        if (trxBalance < 5_000_000) {
            console.error('❌ NOT ENOUGH TRX FOR GAS!');
            console.error(`   You have: ${trxReadable} TRX`);
            console.error('   You need: at least 5 TRX to pay for transaction');
            console.error('\n💡 FIX: Send some TRX to this address first:');
            console.error(`   ${'TUyHdYbJsHgLYGGPCQpXgiNdFScb5VLmZz'}`);
            console.error('   Get free TRX: Discord → !shasta ' + 'TUyHdYbJsHgLYGGPCQpXgiNdFScb5VLmZz');
            process.exit(1);
        }

        // Step 6 — Confirm before sending
        console.log('\n📋 TRANSACTION SUMMARY:');
        console.log('─'.repeat(50));
        console.log(`   From:     ${'TUyHdYbJsHgLYGGPCQpXgiNdFScb5VLmZz'} )`);
        console.log(`   To:       ${RECEIVER_ADDRESS} (External/Trust Wallet)`);
        console.log(`   Amount:   ${AMOUNT_USDT} USDT`);
        console.log(`   Network:  Shasta Testnet`);
        console.log('─'.repeat(50));
        console.log('\n📡 Sending now...\n');

        // Step 7 — Send USDT
        const amountInSun = Math.floor(AMOUNT_USDT * 1_000_000);

        const txn = await contract.transfer(
            RECEIVER_ADDRESS,
            amountInSun.toString()
        ).send({
            feeLimit: 100_000_000,
            callValue: 0,
            shouldPollResponse: false
        });

        console.log('✅ TRANSACTION BROADCAST SUCCESSFULLY!');
        console.log('═'.repeat(50));
        console.log(`   TXN Hash: ${txn}`);
        console.log(`\n   🔗 View on Tronscan:`);
        console.log(`   https://shasta.tronscan.org/#/transaction/${txn}`);

        // Step 8 — Wait and verify
        console.log('\n⏳ Waiting 15 seconds for confirmation...');
        await new Promise(r => setTimeout(r, 15000));

        const rawAfter = await contract.balanceOf(RECEIVER_ADDRESS).call();
        const balanceAfter = Number(rawAfter) / 1_000_000;
        console.log(`\n📥 Receiver balance now: ${balanceAfter} USDT`);

        if (balanceAfter >= AMOUNT_USDT) {
            console.log(`🎉 SUCCESS! ${AMOUNT_USDT} USDT arrived at ${RECEIVER_ADDRESS}`);
        } else {
            console.log('⏳ Still confirming — check Tronscan link above in 1-2 minutes');
        }

        console.log('\n✅ WITHDRAWAL TEST COMPLETE!');
        console.log('This confirms your withdrawal flow works end-to-end.\n');

    } catch (err) {
        console.error('\n❌ ERROR:', err.message || err);

        if (err.message?.includes('bandwidth') || err.message?.includes('BANDWIDTH')) {
            console.error('\n💡 FIX: Need more TRX for bandwidth.');
            console.error('   Send TRX to: ' + USER_EMAIL + "'s wallet address");
        }
        if (err.message?.includes('insufficient')) {
            console.error('\n💡 FIX: Insufficient balance or TRX for fees.');
        }
    } finally {
        await db.end();
    }
}

sendFromUserWallet();