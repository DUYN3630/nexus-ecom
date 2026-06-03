const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, admin, adminOrExpert } = require('../middleware/auth');

// Chỉ Admin mới được xem phân tích tổng quan
router.get('/overview', protect, admin, analyticsController.getOverviewStats);
// Admin và Expert có thể xem phân tích sửa chữa
router.get('/repairs', protect, adminOrExpert, analyticsController.getRepairAnalytics);

module.exports = router;
