const express = require('express');
const router = express.Router();
const { trackEventHandler } = require('../controllers/trackingController');
const optionalAuth = require('../middleware/optionalAuth');

// @route   POST api/track
// @desc    Track a user behavior event
// @access  Public (with optional authentication)
router.post('/', optionalAuth, trackEventHandler);

module.exports = router;
