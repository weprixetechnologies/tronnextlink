const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.put('/update-profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);
router.get('/referrer/:referralCode', authController.getReferrer);

module.exports = router;
