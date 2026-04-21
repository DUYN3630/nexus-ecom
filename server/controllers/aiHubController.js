const SupportTicket = require('../models/SupportTicket');
const Expert = require('../models/Expert');
const { generateText } = require('../utils/gemini');

// 1. Lấy thống kê tổng quan và phân tích AI về các vấn đề hiện tại
exports.getSupportAnalytics = async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const activeTickets = await SupportTicket.countDocuments({ status: { $ne: 'resolved' } });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
    
    const recentTickets = await SupportTicket.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('subject aiSummary chatHistory status');

    const ticketDataString = recentTickets.map(t => 
      `Chủ đề: ${t.subject}, Tóm tắt: ${t.aiSummary || 'Chưa có'}, Trạng thái: ${t.status}`
    ).join('\n');

    const analysisPrompt = `
      Dựa trên dữ liệu các yêu cầu hỗ trợ sau đây, hãy thực hiện bằng TIẾNG VIỆT:
      1. Tóm tắt 3 vấn đề chính mà khách hàng đang gặp phải nhiều nhất.
      2. Đánh giá mức độ hài lòng chung của khách hàng (thang điểm 1-10).
      3. Đưa ra 1 lời khuyên ngắn gọn để cải thiện dịch vụ.
      
      Dữ liệu:
      ${ticketDataString}

      Yêu cầu trả lời định dạng JSON:
      {
        "topIssues": ["vấn đề 1", "vấn đề 2", "vấn đề 3"],
        "satisfactionScore": 8.5,
        "advice": "nội dung lời khuyên bằng tiếng Việt"
      }
    `;

    let aiAnalysis = { topIssues: [], satisfactionScore: 0, advice: "Chưa có đủ dữ liệu để phân tích." };
    try {
      const aiResponse = await generateText(analysisPrompt, "Bạn là chuyên gia phân tích dữ liệu vận hành. Hãy trả lời hoàn toàn bằng tiếng Việt.");
      const jsonStr = aiResponse.replace(/```json|```/g, '').trim();
      aiAnalysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Lỗi phân tích AI:", e);
    }

    res.json({
      stats: {
        total: totalTickets,
        active: activeTickets,
        resolved: resolvedTickets,
        resolutionRate: totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0
      },
      aiAnalysis,
      recentTickets
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy thông tin hiệu năng chuyên gia
exports.getExpertPerformance = async (req, res) => {
  try {
    const experts = await Expert.find();
    const performance = await Promise.all(experts.map(async (expert) => {
      const assignedTickets = await SupportTicket.countDocuments({ expert: expert._id });
      const resolvedTickets = await SupportTicket.countDocuments({ expert: expert._id, status: 'resolved' });
      
      return {
        _id: expert._id,
        name: expert.name,
        avatar: expert.avatar,
        specialty: expert.specialty,
        isOnline: expert.isOnline,
        stats: {
          assigned: assignedTickets,
          resolved: resolvedTickets,
          efficiency: assignedTickets > 0 ? ((resolvedTickets / assignedTickets) * 100).toFixed(1) : 0
        }
      };
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
