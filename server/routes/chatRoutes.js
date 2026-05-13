const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/chat', optionalAuth, handleChat);

module.exports = router;
