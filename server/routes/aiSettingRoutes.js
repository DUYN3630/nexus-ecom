const express = require('express');
const router = express.Router();
const aiHubController = require('../controllers/aiHubController');
const { protect, admin, adminOrExpert } = require('../middleware/auth');

// 1. Cấu hình (Tab Config) - Admin và Expert có thể xem
router.get('/', protect, adminOrExpert, aiHubController.getAISettings);
router.post('/update', protect, adminOrExpert, aiHubController.updateAISettings);

// 2. Phân tích (Tab Intelligence) - Admin và Expert có thể xem
router.get('/analytics', protect, adminOrExpert, aiHubController.getAIAnalytics);

// 3. Hiệu suất nhân sự (Tab Experts) - Admin và Expert có thể xem
router.get('/experts-performance', protect, adminOrExpert, aiHubController.getExpertPerformance);
router.get('/experts-performance/:id', protect, adminOrExpert, aiHubController.getSingleExpertPerformance);

// 4. Giám sát hội thoại (Tab Chat Monitor) - Admin và Expert có thể xem
router.get('/tickets', protect, adminOrExpert, aiHubController.getSupportTickets);
router.post('/convert-repair', protect, adminOrExpert, aiHubController.convertToRepair);

module.exports = router;
