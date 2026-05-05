const Setting = require('../models/Setting');
const RepairRequest = require('../models/RepairRequest');
const Expert = require('../models/Expert');
const SupportTicket = require('../models/SupportTicket');

// 1. Lấy cấu hình AI
exports.getAISettings = async (req, res) => {
  try {
    const keys = ['ai_system_instruction', 'ai_model_name', 'ai_temperature', 'ai_max_tokens'];
    const settings = await Setting.find({ key: { $in: keys } });
    
    const configMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json(configMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Cập nhật cấu hình AI
exports.updateAISettings = async (req, res) => {
  try {
    const updates = req.body;
    const results = [];

    for (const [key, value] of Object.entries(updates)) {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
      results.push(setting);
    }

    res.json({ message: 'Cập nhật cấu hình AI thành công', data: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. API Phân tích Thông minh (Tab Intelligence)
exports.getAIAnalytics = async (req, res) => {
  try {
    const total = await RepairRequest.countDocuments();
    const resolved = await RepairRequest.countDocuments({ status: 'Completed' });
    const active = await RepairRequest.countDocuments({ status: { $in: ['Pending', 'Confirmed', 'Repairing'] } });
    
    const recentTickets = await RepairRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('ticketNumber deviceType status description createdAt');

    // Giả lập phân tích từ AI (Trong thực tế bạn có thể gọi Gemini để tóm tắt)
    const aiAnalysis = {
      topIssues: [
        "Lỗi sạc Pin và Nguồn chiếm 45%",
        "Vỡ màn hình/Mặt lưng chiếm 30%",
        "Lỗi phần mềm sau khi cập nhật chiếm 15%"
      ],
      satisfactionScore: 8.5,
      advice: "Nhu cầu sửa chữa Pin tăng cao trong tháng này, hãy nhập thêm linh kiện Pin chính hãng để tối ưu thời gian chờ."
    };

    res.json({
      stats: {
        total,
        active,
        resolved,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
      },
      recentTickets,
      aiAnalysis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. API Giám sát Chuyên gia (Tab Experts)
exports.getExpertPerformance = async (req, res) => {
  try {
    // Sử dụng .lean() để lấy dữ liệu thô, tránh việc Mongoose lọc bỏ do thiếu field required
    const experts = await Expert.find().lean();
    
    // Thống kê cho từng chuyên gia
    const performanceData = await Promise.all(experts.map(async (expert) => {
      const assigned = await RepairRequest.countDocuments({ expert: expert._id });
      const resolved = await RepairRequest.countDocuments({ expert: expert._id, status: 'Completed' });
      
      return {
        _id: expert._id,
        name: expert.name || "Chuyên gia chưa rõ tên",
        role: expert.role || "Technician",
        avatar: expert.avatar || 'https://via.placeholder.com/150',
        specialty: expert.specialty || [],
        isOnline: expert.isOnline !== undefined ? expert.isOnline : true,
        stats: {
          assigned,
          resolved,
          efficiency: assigned > 0 ? Math.round((resolved / assigned) * 100) : 100
        }
      };
    }));

    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. API Lấy danh sách hội thoại hỗ trợ (Tab Chat Monitor)
exports.getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(50);
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Chuyển hội thoại AI thành đơn sửa chữa
exports.convertToRepair = async (req, res) => {
  try {
    const { ticketId, expertId } = req.body;
    const ticket = await SupportTicket.findById(ticketId).populate('user');
    
    if (!ticket) return res.status(404).json({ message: "Không tìm thấy hội thoại." });

    const ticketNumber = `REP-AI-${Date.now()}`;
    const guestInfo = ticket.user ? undefined : { 
      name: ticket.guestInfo?.name || "Khách từ AI Chat", 
      phone: ticket.phoneNumber || "0000000000" 
    };

    const newRepair = new RepairRequest({
      ticketNumber,
      user: ticket.user?._id,
      guestInfo,
      deviceType: ticket.deviceType || 'iPhone',
      description: `[TỪ AI CHAT]: ${ticket.subject}\n\nTóm tắt hội thoại: ${ticket.chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`,
      expert: expertId || null, // Lưu ID chuyên gia được chọn
      status: 'Pending',
      urgency: 'Normal'
    });

    await newRepair.save();
    
    // Cập nhật trạng thái ticket
    ticket.status = 'converted';
    await ticket.save();

    res.json({ success: true, message: "Đã chuyển thành đơn sửa chữa thành công!", data: newRepair });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
