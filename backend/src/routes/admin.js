const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');

router.use(auth, adminAuth);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.get('/withdrawals', adminController.getWithdrawals);
router.patch('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.patch('/withdrawals/:id/reject', adminController.rejectWithdrawal);

router.get('/ledger', adminController.getLedger);
router.get('/platform-earnings', adminController.getPlatformEarnings);
router.post('/trigger-payouts', adminController.triggerAffiliatePayouts);

// User management detail routes
router.get('/users/:userId', adminController.getUserDetail);
router.put('/users/:userId', adminController.updateUser);
router.post('/users/:userId/adjust-balance', adminController.adjustBalance);
router.post('/users/:userId/change-plan', adminController.changeUserPlan);
router.get('/users/:userId/transactions', adminController.getUserTransactions);
router.get('/users/:userId/network', adminController.getUserNetwork);
router.get('/users/:userId/withdrawals', adminController.getUserWithdrawals);

// Wallet management
router.get('/wallets', adminController.getWallets);
router.get('/wallets/summary', adminController.getWalletSummary);
router.get('/wallets/:userId/onchain-balance', adminController.getOnChainBalance);
router.post('/wallets/:userId/sync-balance', adminController.syncBalance);
router.post('/wallets/:userId/send', adminController.sendFromUserWallet);

module.exports = router;
