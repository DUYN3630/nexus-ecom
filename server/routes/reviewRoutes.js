const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// --- PUBLIC ROUTES ---
router.get('/public', reviewController.getPublicReviews);
router.get('/product/:productId', reviewController.getProductReviews);

// --- PRIVATE ROUTES (Requires Login) ---
router.get('/check-permission/:productId', protect, reviewController.checkReviewPermission);
router.post('/product/:productId', protect, reviewController.createReview);

// --- ADMIN ROUTES ---
router.get('/', protect, admin, reviewController.getAllReviews);
router.post('/:id/reply', protect, admin, reviewController.replyReview);
router.patch('/:id/status', protect, admin, reviewController.updateStatus);
router.patch('/:id/spam', protect, admin, reviewController.toggleSpam);
router.delete('/:id', protect, admin, reviewController.deleteReview);

module.exports = router;
