const CryptoJS = require('crypto-js');
require('dotenv').config();

const SECRET_KEY = process.env.WALLET_ENCRYPTION_SECRET;

const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (encryptedText) => {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
    encrypt,
    decrypt,
};
