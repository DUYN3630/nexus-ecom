const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { protect, adminOrExpert } = require('../middleware/auth');

router.post('/create-order', protect, adminOrExpert, logisticsController.createShippingOrder);

module.exports = router;
