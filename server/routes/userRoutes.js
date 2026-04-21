const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin); // Bảo vệ tất cả các route bên dưới

router.route('/')
    .get(userController.getUsers);

router.route('/:id')
    .patch(userController.updateUserStatus) // Cập nhật vai trò/trạng thái
    .delete(userController.deleteUser); // Xóa mềm

router.get('/:id/activity', userController.getUserActivityLogs);
router.post('/:id/reset-password', userController.adminResetPassword);

module.exports = router;
