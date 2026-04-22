const express = require('express');
const router = express.Router();
const aiHubController = require('../controllers/aiHubController');
const { protect, admin } = require('../middleware/auth');

// 1. Cấu hình (Tab Config)
router.get('/', protect, admin, aiHubController.getAISettings);
router.post('/update', protect, admin, aiHubController.updateAISettings);

// 2. Phân tích (Tab Intelligence)
router.get('/analytics', protect, admin, aiHubController.getAIAnalytics);

// 3. Hiệu suất nhân sự (Tab Experts)
router.get('/experts-performance', protect, admin, aiHubController.getExpertPerformance);

module.exports = router;
