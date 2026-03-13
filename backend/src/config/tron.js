const { TronWeb } = require('tronweb');
require('dotenv').config();

const TRON_NETWORK = process.env.TRON_NETWORK || 'shasta';
const fullHost = TRON_NETWORK === 'mainnet'
    ? process.env.TRON_FULL_HOST_MAINNET
    : process.env.TRON_FULL_HOST_TESTNET;

const tronWeb = new TronWeb({
    fullHost: fullHost,
    headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY },
    privateKey: process.env.MASTER_WALLET_PRIVATE_KEY
});

const USDT_CONTRACT_ADDRESS = TRON_NETWORK === 'mainnet'
    ? process.env.USDT_CONTRACT_MAINNET
    : process.env.USDT_CONTRACT_TESTNET;

module.exports = {
    tronWeb,
    USDT_CONTRACT_ADDRESS,
    TRON_NETWORK
};
