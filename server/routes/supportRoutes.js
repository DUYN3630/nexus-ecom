const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const repairController = require('../controllers/repairController');
const { protect } = require('../middleware/auth');

// --- PUBLIC ROUTES ---
// Tra cứu bảo hành
router.get('/warranty/:serialNumber', warrantyController.check);
// Gửi yêu cầu sửa chữa
router.post('/repair', repairController.create);

// --- USER ROUTES ---
router.get('/my-repairs', protect, repairController.getMyRepairs);

// --- ADMIN/STAFF ROUTES ---
// Route test công khai (Xóa sau khi test)
router.get('/test-repairs', (req, res) => res.json({ message: "Route repairs is visible!" }));

// Lấy toàn bộ danh sách yêu cầu
router.get('/repairs', protect, repairController.getAll);
// Cập nhật trạng thái yêu cầu
router.patch('/repair/:id', protect, repairController.updateStatus);

module.exports = router;
