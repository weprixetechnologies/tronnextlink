const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');

// All analytics routes require admin authentication
router.use(auth, adminAuth);

// Platform Overview
router.get('/platform-health', analyticsController.getPlatformHealth);
router.get('/growth', analyticsController.getGrowthStats);
router.get('/platform-earnings', analyticsController.getPlatformEarningsLedger);

// Network & Sales
router.get('/joinings', analyticsController.getJoinings);

// User Deep Dive
router.get('/user-statement/:userId', analyticsController.getUserStatement);

// Withdrawal Sourcing & Completion
router.get('/withdrawals/pending', analyticsController.getPendingWithdrawals);
router.post('/withdrawals/:id/source-funds', analyticsController.sourceWithdrawalFunds);
router.patch('/withdrawals/:id/complete', analyticsController.completeWithdrawal);

module.exports = router;
