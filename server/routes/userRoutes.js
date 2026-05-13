const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// --- PUBLIC/AUTHENTICATED ROUTES ---
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// --- ADMIN ONLY ROUTES ---
router.use(protect, admin); 

router.route('/')
    .get(userController.getUsers)
    .post(userController.createUser);

router.route('/:id')
    .patch(userController.updateUserStatus) 
    .delete(userController.deleteUser); 

router.get('/:id/activity', userController.getUserActivityLogs);
router.post('/:id/reset-password', userController.adminResetPassword);

module.exports = router;
