const RepairRequest = require('../models/RepairRequest');
const mongoose = require('mongoose');

const repairController = {
  create: async (req, res) => {
    try {
      const { deviceType, description, urgency, selectedExpertId, userId, guestInfo } = req.body;

      // Tạo ticketNumber theo phong cách chuẩn của OrderController (Dùng Date.now và Random)
      const ticketNumber = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Xử lý ObjectId an toàn
      const cleanUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;
      const cleanExpertId = (selectedExpertId && mongoose.Types.ObjectId.isValid(selectedExpertId)) ? selectedExpertId : null;

      const newRequest = new RepairRequest({
        ticketNumber,
        user: cleanUserId,
        guestInfo: guestInfo || { name: "Guest", phone: "0000000000" },
        deviceType,
        description,
        urgency: urgency || 'Normal',
        expert: cleanExpertId,
        status: 'Pending'
      });

      const savedRequest = await newRequest.save();
      
      res.status(201).json({
        success: true,
        message: "Yêu cầu sửa chữa đã được tiếp nhận.",
        data: savedRequest
      });
    } catch (error) {
      console.error("❌ REPAIR ERROR:", error.message);
      res.status(500).json({ 
        message: "Lỗi hệ thống khi gửi yêu cầu.",
        error: error.message 
      });
    }
  },
// Lấy toàn bộ danh sách cho Admin (Có phân trang)
getAll: async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await RepairRequest.countDocuments();
    const requests = await RepairRequest.find()
      .populate('user', 'name email phone')
      .populate('expert', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách yêu cầu." });
  }
},

  // Lấy danh sách của chính người dùng đó
  getMyRepairs: async (req, res) => {
    try {
      const userId = req.user._id;
      const requests = await RepairRequest.find({ user: userId })
        .populate('expert', 'name role avatar')
        .sort({ createdAt: -1 });
      
      console.log(`--- [DEBUG] Found ${requests.length} repairs for user ${userId} ---`);
      res.json(requests); // Trả về mảng trực tiếp
    } catch (error) {
      console.error("getMyRepairs Error:", error.message);
      res.status(500).json({ message: "Không thể lấy lịch sử sửa chữa." });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, repairNotes, expertResponse } = req.body;
      const updated = await RepairRequest.findByIdAndUpdate(
        id, 
        { status, repairNotes, expertResponse }, 
        { new: true }
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật yêu cầu." });
    }
  }
};

module.exports = repairController;
