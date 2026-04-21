const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

// Chỉ Admin mới được xem phân tích
router.get('/overview', protect, admin, analyticsController.getOverviewStats);

module.exports = router;
