const { tronWeb, USDT_CONTRACT_ADDRESS } = require('../config/tron');
const { decrypt } = require('../utils/encrypt');

const generateWallet = async () => {
    try {
        const account = await tronWeb.createAccount();
        return {
            address: account.address.base58,
            privateKey: account.privateKey,
        };
    } catch (error) {
        console.error('Error generating wallet:', error);
        throw error;
    }
};

const getUSDTBalance = async (address) => {
    try {
        const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
        const balance = await contract.balanceOf(address).call();
        return tronWeb.toBigNumber(balance).div(1e6).toNumber();
    } catch (error) {
        console.error('Error getting USDT balance:', error);
        return 0;
    }
};

const getRecentTRC20Transactions = async (address) => {
    try {
        // Note: This requires a TronGrid account with API key for better reliability
        const response = await tronWeb.fullNode.request(
            `v1/accounts/${address}/transactions/trc20?limit=20&contract_address=${USDT_CONTRACT_ADDRESS}`,
            {},
            'get'
        );
        return response.data || [];
    } catch (error) {
        console.error('Error getting TRC20 transactions:', error);
        return [];
    }
};

const sendUSDT = async (fromPrivateKeyEncrypted, toAddress, amount) => {
    try {
        const privateKey = decrypt(fromPrivateKeyEncrypted);
        const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);

        // Set the private key for this transaction
        tronWeb.setPrivateKey(privateKey);

        const txn = await contract.transfer(
            toAddress,
            tronWeb.toBigNumber(amount).times(1e6).integerValue().toString()
        ).send();

        return txn;
    } catch (error) {
        console.error('Error sending USDT:', error);
        throw error;
    }
};

module.exports = {
    generateWallet,
    getUSDTBalance,
    getRecentTRC20Transactions,
    sendUSDT,
};
