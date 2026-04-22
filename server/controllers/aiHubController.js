const Setting = require('../models/Setting');
const RepairRequest = require('../models/RepairRequest');
const Expert = require('../models/Expert');

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
    const experts = await Expert.find({ status: 'active' });
    
    // Thống kê cho từng chuyên gia
    const performanceData = await Promise.all(experts.map(async (expert) => {
      const assigned = await RepairRequest.countDocuments({ expert: expert._id });
      const resolved = await RepairRequest.countDocuments({ expert: expert._id, status: 'Completed' });
      
      return {
        _id: expert._id,
        name: expert.name,
        role: expert.role,
        avatar: expert.avatar,
        specialty: expert.specialty,
        isOnline: expert.isOnline,
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
