const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const repairController = require('../controllers/repairController');
const { protect, adminOrExpert } = require('../middleware/auth');

// --- PUBLIC ROUTES ---
// Tra cứu bảo hành
router.get('/warranty/:serialNumber', warrantyController.check);
// Gửi yêu cầu sửa chữa
router.post('/repair', repairController.create);
// Tra cứu sửa chữa theo SĐT
router.get('/repair/track/:phone', repairController.getByPhone);

// --- USER ROUTES ---
router.get('/my-repairs', protect, repairController.getMyRepairs);

// --- ADMIN/STAFF ROUTES ---
// Route test công khai (Xóa sau khi test)
router.get('/test-repairs', (req, res) => res.json({ message: "Route repairs is visible!" }));

// Lấy toàn bộ danh sách yêu cầu
router.get('/repairs', protect, adminOrExpert, repairController.getAll);

// Lấy danh sách sửa chữa cho chuyên gia cụ thể
router.get('/repairs/expert/:expertId', protect, adminOrExpert, repairController.getExpertRepairs);

// Cập nhật trạng thái yêu cầu
router.patch('/repair/:id', protect, adminOrExpert, repairController.updateStatus);

module.exports = router;
