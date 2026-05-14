const Setting = require('../models/Setting');
const RepairRequest = require('../models/RepairRequest');
const Expert = require('../models/Expert');
const SupportTicket = require('../models/SupportTicket');

// 1. Lấy cấu hình AI
exports.getAISettings = async (req, res) => {
  try {
    console.log("--- [DEBUG] Fetching AI Settings ---");
    const keys = ['ai_system_instruction', 'ai_model_name', 'ai_temperature', 'ai_max_tokens'];
    const settings = await Setting.find({ key: { $in: keys } });
    
    const configMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json(configMap);
  } catch (error) {
    console.error("--- [ERROR] getAISettings Failed:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 2. Cập nhật cấu hình AI
exports.updateAISettings = async (req, res) => {
  try {
    console.log("--- [DEBUG] Updating AI Settings ---", req.body);
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
    console.error("--- [ERROR] updateAISettings Failed:", error.message);
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
    console.log("--- [DEBUG] Fetching Expert Performance ---");
    
    // Tìm các hồ sơ chuyên gia và populate thông tin User
    const experts = await Expert.find()
      .populate({
        path: 'user',
        select: 'role name email'
      })
      .lean();
    
    if (!experts || experts.length === 0) {
      console.log("--- [DEBUG] No experts found in database ---");
      return res.json([]);
    }

    // Thống kê cho từng chuyên gia
    const performanceData = await Promise.all(experts.map(async (expert) => {
      try {
        const assigned = await RepairRequest.countDocuments({ expert: expert._id });
        const resolved = await RepairRequest.countDocuments({ expert: expert._id, status: { $in: ['Done', 'Returned'] } });
        
        return {
          _id: expert._id,
          user: expert.user?._id || expert.user, // Bổ sung ID User để frontend khớp lệnh
          name: expert.name || expert.user?.name || "Chuyên gia chưa rõ tên",
          role: expert.role || "Technician",
          avatar: expert.avatar || null,
          specialty: expert.specialty || [],
          isOnline: expert.isOnline !== undefined ? expert.isOnline : true,
          stats: {
            assigned,
            resolved,
            efficiency: assigned > 0 ? Math.round((resolved / assigned) * 100) : 100
          }
        };
      } catch (err) {
        console.error(`--- [ERROR] Stats failed for expert ${expert._id}:`, err.message);
        return null;
      }
    }));

    // Lọc bỏ các kết quả null nếu có lỗi trong vòng lặp
    const cleanData = performanceData.filter(item => item !== null);
    
    console.log(`--- [DEBUG] Sending performance data for ${cleanData.length} experts ---`);
    res.json(cleanData);
  } catch (error) {
    console.error("--- [ERROR] getExpertPerformance Crash:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi tải dữ liệu chuyên gia" });
  }
};

// 5. API Lấy danh sách hội thoại hỗ trợ (Tab Chat Monitor)
exports.getSupportTickets = async (req, res) => {
  try {
    console.log("--- [DEBUG] Fetching Support Tickets ---");
    const tickets = await SupportTicket.find()
      .populate('user', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(50);
    
    console.log(`--- [DEBUG] Found ${tickets.length} tickets ---`);
    res.json(tickets);
  } catch (error) {
    console.error("--- [ERROR] Get Support Tickets Failed:", error.message);
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
