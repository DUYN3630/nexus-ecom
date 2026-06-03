const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const RepairRequest = require('../models/RepairRequest');
const Expert = require('../models/Expert');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Part = require('../models/Part');

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
    const RepairRequest = require('../models/RepairRequest');
    
    // Tìm các hồ sơ chuyên gia và populate thông tin User
    const experts = await Expert.find({ status: 'active' })
      .populate({
        path: 'user',
        select: 'role name email'
      })
      .lean();
    
    if (!experts || experts.length === 0) {
      return res.json([]);
    }

    // Thống kê cho từng chuyên gia
    const performanceData = await Promise.all(experts.map(async (expert) => {
      try {
        // 1. Số lượng công việc hoàn tất
        const completedCount = await RepairRequest.countDocuments({ 
            expert: expert._id, 
            status: { $in: ['Done', 'Returned'] } 
        });

        // 2. Tổng doanh thu (Dựa trên serviceFee + giá linh kiện của các đơn đã hoàn thành)
        const revenueResult = await RepairRequest.aggregate([
            { 
                $match: { 
                    expert: expert._id, 
                    status: { $in: ['Done', 'Returned'] }
                } 
            },
            {
                $lookup: {
                    from: "parts",
                    localField: "usedParts.part",
                    foreignField: "_id",
                    as: "partsData"
                }
            },
            {
                $addFields: {
                    partsRevenue: {
                        $sum: {
                            $map: {
                                input: "$usedParts",
                                as: "up",
                                in: {
                                    $multiply: [
                                        "$$up.quantity",
                                        {
                                            $let: {
                                                vars: {
                                                    matchedPart: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$partsData",
                                                                    as: "pd",
                                                                    cond: { $eq: ["$$pd._id", "$$up.part"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                },
                                                in: { $ifNull: ["$$matchedPart.price", 0] }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: { $add: ["$serviceFee", "$partsRevenue"] } } 
                } 
            }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        return {
          _id: expert._id,
          name: expert.name || expert.user?.name || "Kỹ thuật viên",
          role: expert.role || "Apple Certified Technician",
          avatar: expert.avatar || null,
          specialty: expert.specialty || [],
          isOnline: expert.isOnline !== undefined ? expert.isOnline : true,
          // Các trường frontend mong đợi
          completedRepairs: completedCount,
          totalRevenue: totalRevenue,
          avgRating: expert.rating || 5.0,
          efficiency: 100 // Có thể tính toán sau
        };
      } catch (err) {
        console.error(`--- [ERROR] Stats failed for expert ${expert._id}:`, err.message);
        return null;
      }
    }));

    const cleanData = performanceData.filter(item => item !== null);
    res.json(cleanData);
  } catch (error) {
    console.error("--- [ERROR] getExpertPerformance Crash:", error.message);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi tải dữ liệu chuyên gia" });
  }
};

// 4b. API Chi tiết hiệu suất một chuyên gia
exports.getSingleExpertPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`--- [DEBUG] Fetching Detail for Expert ID: ${id} ---`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`--- [DEBUG] Invalid Expert ID format: ${id} ---`);
      return res.status(400).json({ message: "ID chuyên gia không hợp lệ" });
    }

    const expert = await Expert.findById(id).populate('user', 'name email').lean();
    if (!expert) {
      console.log(`--- [DEBUG] Expert not found in DB: ${id} ---`);
      return res.status(404).json({ message: "Không tìm thấy chuyên gia" });
    }

    // 1. Lấy danh sách 10 đơn sửa chữa gần nhất
    const recentRepairs = await RepairRequest.find({ expert: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    console.log(`--- [DEBUG] Found ${recentRepairs.length} recent repairs ---`);

    // 2. Thống kê theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await RepairRequest.aggregate([
      { 
        $match: { 
          expert: new mongoose.Types.ObjectId(id), 
          status: { $in: ['Done', 'Returned'] },
          updatedAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
          revenue: { $sum: "$serviceFee" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    console.log(`--- [DEBUG] Monthly stats count: ${monthlyStats.length} ---`);

    // 3. Phân bổ loại thiết bị đã xử lý
    const deviceStats = await RepairRequest.aggregate([
      { $match: { expert: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$deviceType",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      expert: {
        ...expert,
        name: expert.name || expert.user?.name || "Kỹ thuật viên",
        email: expert.user?.email || ""
      },
      stats: {
        recentRepairs,
        monthlyStats,
        deviceStats
      }
    });
  } catch (error) {
    console.error("--- [ERROR] getSingleExpertPerformance failed:", error.stack);
    res.status(500).json({ message: "Lỗi khi tải chi tiết chuyên gia: " + error.message });
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
    
    try {
      const notificationService = require('../services/notificationService');
      const userEmail = ticket.user?.email || ticket.guestInfo?.email;
      if (userEmail) {
        await notificationService.notifyNewRepair(userEmail, newRepair);
      }
    } catch (notifyErr) {
      console.error("Lỗi gửi email xác nhận convert:", notifyErr);
    }

    // Đánh dấu là đã xử lý nhưng không khóa hoàn toàn để có thể tạo thêm đơn
    ticket.status = 'diagnosing'; 
    await ticket.save();

    res.json({ success: true, message: "Đã chuyển thành đơn sửa chữa thành công!", data: newRepair });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
