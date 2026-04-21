const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- PUBLIC ROUTES (User Access) ---
router.get('/public', marketingController.getPublicBanners); // Lấy banner hiển thị
router.post('/track/:id/click', marketingController.trackClick); // Ghi nhận click

// --- PROTECTED ROUTES (Admin Access) ---
// Thống kê Dashboard
router.get('/stats', protect, admin, marketingController.getDashboardStats);

// CRUD Banners
router.get('/banners', protect, admin, marketingController.getBanners);
router.post('/banners/bulk-status', protect, admin, marketingController.updateBannersStatus);
router.post('/banners', protect, admin, upload.single('mediaFile'), marketingController.addBanner);
router.put('/banners/:id', protect, admin, upload.single('mediaFile'), marketingController.updateBanner);
router.delete('/banners', protect, admin, marketingController.deleteBanners);

module.exports = router;
