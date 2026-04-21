const express = require('express');
const router = express.Router();
const aiSettingController = require('../controllers/aiSettingController');
const aiHubController = require('../controllers/aiHubController');
const { protect, admin } = require('../middleware/auth');

// Đảm bảo các route này khớp chính xác với frontend gọi
router.get('/settings', protect, admin, aiSettingController.getAISettings);
router.post('/settings', protect, admin, aiSettingController.updateAISettings);

router.get('/analytics', protect, admin, aiHubController.getSupportAnalytics);
router.get('/experts', protect, admin, aiHubController.getExpertPerformance);

module.exports = router;
