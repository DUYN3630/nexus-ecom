const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// 1. Frontend gọi để lấy link thanh toán MoMo
router.post('/momo/create', protect, paymentController.createMomoPayment);

// 2. MoMo gọi Webhook này sau khi thanh toán (Route công khai - IPN)
router.post('/momo/ipn', paymentController.handleMomoIPN);

// 3. Frontend poll trạng thái thanh toán sau khi người dùng quay lại
router.get('/momo/status/:orderId', protect, paymentController.checkPaymentStatus);

module.exports = router;
