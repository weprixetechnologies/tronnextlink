const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const auth = require('../middlewares/auth');

router.get('/', auth, planController.getPlans);
router.post('/purchase', auth, planController.purchasePlan);

module.exports = router;
