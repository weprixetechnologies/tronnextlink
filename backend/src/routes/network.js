const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const auth = require('../middlewares/auth');

router.get('/tree', auth, networkController.getTree);
router.get('/stats', auth, networkController.getStats);
router.get('/children/:userId', auth, networkController.getChildren);

module.exports = router;
