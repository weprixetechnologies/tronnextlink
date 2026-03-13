const crypto = require('crypto');

const generateReferralCode = (length = 8) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
};

const formatResponse = (success, data = {}, message = "") => {
    return { success, data, message };
};

module.exports = {
    generateReferralCode,
    formatResponse,
};
