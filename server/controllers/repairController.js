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
        status: 'Pending',
        receptionTime: new Date()
      });

      const savedRequest = await newRequest.save();
      
      try {
        const notificationService = require('../services/notificationService');
        const userEmail = savedRequest.user?.email || savedRequest.guestInfo?.email;
        if (userEmail) {
          await notificationService.notifyNewRepair(userEmail, savedRequest);
        }
      } catch (notifyErr) {
        console.error("Lỗi gửi email xác nhận:", notifyErr);
      }
      
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

  // Lấy danh sách sửa chữa được gán cho một chuyên gia cụ thể
  getExpertRepairs: async (req, res) => {
    try {
      const { expertId } = req.params;
      
      // Tìm xem expertId này là Expert Profile ID hay User ID
      // Để hỗ trợ cả đơn cũ (User ID) và đơn mới (Expert Profile ID)
      const Expert = require('../models/Expert');
      const profile = await Expert.findById(expertId);
      const userProfile = await Expert.findOne({ user: expertId });

      let queryIds = [expertId];
      if (profile && profile.user) queryIds.push(profile.user.toString());
      if (userProfile) queryIds.push(userProfile._id.toString());

      const requests = await RepairRequest.find({ 
        expert: { $in: queryIds } 
      })
      .populate('user', 'name email phone')
      .populate('expert', 'name role')
      .populate('usedParts.part') // Thêm populate ở đây
      .sort({ createdAt: -1 });

      console.log(`--- [DEBUG] Found ${requests.length} repairs for ID(s): ${queryIds.join(', ')} ---`);
      res.json(requests);
    } catch (error) {
      console.error("getExpertRepairs Error:", error.message);
      res.status(500).json({ message: "Không thể lấy danh sách sửa chữa của chuyên gia." });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, repairNotes, expertResponse, estimatedCost, serviceFee, progressImages, startTime, endTime, usedParts, customerPhone } = req.body;
      
      const updateData = { status, repairNotes, expertResponse, estimatedCost, serviceFee };
      
      if (progressImages) updateData.progressImages = progressImages;
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;

      // Cập nhật SĐT vào guestInfo nếu có (để phục vụ tra cứu sau này)
      if (customerPhone) {
        updateData['guestInfo.phone'] = customerPhone;
      }

      const Part = require('../models/Part');
      const notificationService = require('../services/notificationService');

      // --- LOGIC TRỪ KHO CHÍNH XÁC ---
      if (usedParts && Array.isArray(usedParts)) {
        const existingRepair = await RepairRequest.findById(id);
        
        // 1. Hoàn lại kho cho các linh kiện cũ (nếu có) để tránh trừ trùng lặp
        if (existingRepair && existingRepair.usedParts && existingRepair.usedParts.length > 0) {
          for (const oldItem of existingRepair.usedParts) {
            if (oldItem.part) {
              await Part.findByIdAndUpdate(oldItem.part, { $inc: { stock: oldItem.quantity } });
            }
          }
        }

        // 2. Trừ kho theo danh sách linh kiện mới
        for (const item of usedParts) {
          if (item.part && mongoose.Types.ObjectId.isValid(item.part)) {
            await Part.findByIdAndUpdate(item.part, { $inc: { stock: -item.quantity } });
          }
        }
        updateData.usedParts = usedParts;
      }

      const updated = await RepairRequest.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).populate('user', 'name email phone').populate('expert', 'name role').populate('usedParts.part');

      // Gửi thông báo nếu có sự thay đổi trạng thái quan trọng
      try {
        const userEmail = updated.user ? updated.user.email : updated.guestInfo?.email;
        if (userEmail) {
          if (status === 'AwaitingApproval') {
            await notificationService.notifyQuotationReady(userEmail, updated);
          } else if (status === 'Done') {
            await notificationService.notifyRepairDone(userEmail, updated);
            try {
              const invoiceController = require('./invoiceController');
              const invoice = await invoiceController.generateFromRepair(id);
              await notificationService.notifyInvoiceCreated(userEmail, invoice);
            } catch (invErr) {
              console.error("Lỗi tạo/gửi hóa đơn khi Done:", invErr);
            }
          }
        }
      } catch (notifyErr) {
        console.error("Lỗi gửi thông báo:", notifyErr);
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("updateStatus Error:", error.message);
      res.status(500).json({ message: "Lỗi khi cập nhật yêu cầu." });
    }
  },

  // Khách hàng xác nhận báo giá (Công khai hoặc User)
  confirmRepair: async (req, res) => {
    try {
      const { id } = req.params;
      const { phone } = req.body; // Dùng SĐT để bảo mật nhẹ

      const repair = await RepairRequest.findById(id);
      
      if (!repair) {
        return res.status(404).json({ message: "Không tìm thấy yêu cầu sửa chữa." });
      }

      // Kiểm tra xem SĐT gửi lên có khớp với SĐT trong đơn không
      const repairPhone = repair.guestInfo?.phone || (repair.user && (await mongoose.model('User').findById(repair.user))?.phone);
      
      if (phone && repairPhone && phone !== repairPhone) {
        return res.status(403).json({ message: "Số điện thoại không khớp với thông tin đơn hàng." });
      }

      // Chỉ cho phép xác nhận khi đang ở trạng thái Chờ duyệt
      if (repair.status !== 'AwaitingApproval') {
        return res.status(400).json({ message: "Đơn hàng hiện không ở trạng thái chờ xác nhận báo giá." });
      }

      repair.status = 'Confirmed';
      await repair.save();

      res.json({ success: true, message: "Đã xác nhận báo giá thành công.", data: repair });
    } catch (error) {
      console.error("confirmRepair Error:", error.message);
      res.status(500).json({ message: "Lỗi khi xác nhận báo giá." });
    }
  },

  // Tra cứu sửa chữa theo số điện thoại (Public)
  getByPhone: async (req, res) => {
    try {
      const { phone } = req.params;
      console.log(`[REPAIR CONTROLLER] Searching for phone: ${phone}`);

      // 1. Tìm User có SĐT này trước

      const User = require('../models/User');
      const targetUser = await User.findOne({ phone });

      // 2. Query tìm đơn: hoặc là Guest có SĐT này, hoặc là User đã tìm thấy
      const query = {
        $or: [
          { 'guestInfo.phone': phone }
        ]
      };
      
      if (targetUser) {
        query.$or.push({ user: targetUser._id });
      }

      const request = await RepairRequest.findOne(query)
      .populate('expert', 'name role avatar')
      .populate('user', 'name email phone')
      .populate('usedParts.part')
      .sort({ createdAt: -1 }); // Lấy đơn mới nhất
      
      if (!request) {
        return res.json(null);
      }
      res.json(request);
    } catch (error) {
      console.error("getByPhone Error:", error.message);
      res.status(500).json({ message: "Lỗi khi tra cứu thông tin sửa chữa." });
    }
  },

  getMedicalRecord: async (req, res) => {
    try {
      const { serialNumber } = req.params;
      const uppercaseSN = serialNumber.toUpperCase();
      
      const repairs = await RepairRequest.find({ 
        serialNumber: uppercaseSN,
        status: { $in: ['Done', 'Returned'] }
      })
      .populate('expert', 'name role avatar')
      .populate('usedParts.part')
      .sort({ createdAt: -1 });

      const Warranty = require('../models/Warranty');
      const warranty = await Warranty.findOne({ serialNumber: uppercaseSN });

      res.json({
        serialNumber: uppercaseSN,
        repairs,
        warranty
      });
    } catch (error) {
      console.error("getMedicalRecord Error:", error.message);
      res.status(500).json({ message: "Lỗi khi lấy bệnh án thiết bị." });
    }
  }
};

module.exports = repairController;
;
