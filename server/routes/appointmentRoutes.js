const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// Public: Lấy khung giờ trống của chuyên gia
router.get('/expert/:expertId/availability', appointmentController.getExpertAvailability);

// Expert/Admin: Lấy toàn bộ lịch hẹn của một chuyên gia
router.get('/expert/:expertId', protect, appointmentController.getExpertAppointments);

// User: Đặt lịch hẹn
router.post('/', protect, appointmentController.create);

// User: Lấy danh sách lịch hẹn của tôi
router.get('/my-appointments', protect, appointmentController.getMyAppointments);

module.exports = router;
