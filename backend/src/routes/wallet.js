const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middlewares/auth');

router.get('/', auth, walletController.getWallet);
router.get('/transactions', auth, walletController.getTransactions);
router.post('/withdraw', auth, walletController.requestWithdrawal);

module.exports = router;
