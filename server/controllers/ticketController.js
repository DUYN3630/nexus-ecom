const SupportTicket = require('../models/SupportTicket');

// Lấy danh sách ticket (có phân trang và lọc)
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .populate('expert', 'name')
      .sort({ createdAt: -1 });

    // Đảm bảo tên người dùng mặc định nếu không tìm thấy
    const formattedTickets = tickets.map(ticket => {
      const ticketObj = ticket.toObject();
      if (!ticketObj.user) {
        ticketObj.user = { name: "Khách vãng lai" };
      } else if (!ticketObj.user.name) {
        ticketObj.user.name = "Khách vãng lai";
      }
      return ticketObj;
    });

    res.json({ success: true, data: formattedTickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo ticket mới từ AI Chat
exports.createTicket = async (req, res) => {
  try {
    const { phoneNumber, deviceType, chatHistory, intent, aiSummary, userId } = req.body;
    
    const newTicket = new SupportTicket({
      user: userId || null,
      phoneNumber,
      deviceType: deviceType || 'iPhone',
      chatHistory: chatHistory || [],
      intent: intent || 'repair',
      aiSummary: aiSummary || '',
      subject: `Yêu cầu hỗ trợ từ SĐT ${phoneNumber}`,
      status: 'diagnosing'
    });

    const savedTicket = await newTicket.save();
    res.status(201).json({ success: true, data: savedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Chỉ định hoặc chuyên gia tự nhận ticket
exports.claimTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { expertId } = req.body; // Đây là User ID của người đang đăng nhập

    console.log(`[CLAIM DEBUG] Ticket ID: ${id}, User ID: ${expertId}`);

    if (!expertId) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin ID chuyên gia (User ID)" });
    }

    // Tìm hồ sơ Expert tương ứng với User ID này
    const Expert = require('../models/Expert');
    const expertProfile = await Expert.findOne({ user: expertId });
    
    if (!expertProfile) {
      console.log(`[CLAIM DEBUG] No Expert profile found for User ID: ${expertId}`);
      return res.status(400).json({ 
        success: false, 
        message: "Tài khoản của bạn chưa được thiết lập hồ sơ Chuyên gia kỹ thuật. Vui lòng liên hệ Admin." 
      });
    }

    const ticket = await SupportTicket.findById(id).populate('user');
    if (!ticket) {
      console.log(`[CLAIM DEBUG] Ticket NOT FOUND for ID: ${id}`);
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu hỗ trợ (Ticket) này" });
    }

    console.log(`[CLAIM DEBUG] Found ticket: ${ticket.subject}`);

    // Cập nhật Ticket (Gán Expert Profile ID)
    ticket.expert = expertProfile._id;
    ticket.status = 'in-progress';
    ticket.priority = 'high';
    await ticket.save();

    // Tự động tạo đơn sửa chữa (RepairRequest)
    const RepairRequest = require('../models/RepairRequest');
    const ticketNumber = `REP-CLAIM-${Date.now()}`;
    
    const guestInfo = ticket.user ? undefined : { 
      name: ticket.guestInfo?.name || "Khách từ AI Chat", 
      phone: ticket.phoneNumber || "0000000000" 
    };

    const newRepair = new RepairRequest({
      ticketNumber,
      user: ticket.user?._id,
      guestInfo,
      deviceType: ticket.deviceType || 'iPhone',
      description: `[TỰ NHẬN TỪ TICKET]: ${ticket.subject}\n\nLịch sử hội thoại đã có sẵn trong bối cảnh.`,
      expert: expertProfile._id, // Quan trọng: Dùng Expert Profile ID
      status: 'Confirmed', 
      startTime: new Date()
    });

    await newRepair.save();

    res.json({ 
      success: true, 
      message: "Đã nhận xử lý và tạo đơn sửa chữa thành công", 
      data: { ticket, repair: newRepair } 
    });
  } catch (error) {
    console.error("[CLAIM ERROR]", error.message);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi nhận xử lý ticket: " + error.message });
  }
};

// Chuyên gia gửi tin nhắn trực tiếp vào hội thoại
exports.sendExpertMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, expertName } = req.body;

    console.log(`[DEBUG] Attempting to send message for ticket: ${id} from expert: ${expertName}`);

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      console.log(`[DEBUG] Ticket not found: ${id}`);
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }

    ticket.chatHistory.push({
      role: 'ai',
      content: `[Expert ${expertName}]: ${message}`,
      timestamp: new Date()
    });

    await ticket.save();
    console.log(`[DEBUG] Message saved successfully for ticket: ${id}`);
    res.json({ success: true, message: "Đã gửi tin nhắn thành công", data: ticket });
  } catch (error) {
    console.error(`[ERROR] sendExpertMessage error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái hoặc gán chuyên gia cho ticket (Admin)
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expert, priority } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status, expert, priority },
      { new: true }
    );

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy lịch sử ticket của người dùng (theo userId hoặc phoneNumber)
exports.getTicketHistory = async (req, res) => {
  try {
    const { phoneNumber, userId } = req.query;
    const query = {};
    if (userId) query.user = userId;
    else if (phoneNumber) query.phoneNumber = phoneNumber;
    else return res.status(400).json({ message: "Thiếu thông tin tra cứu" });

    const ticket = await SupportTicket.findOne(query)
      .populate('expert', 'name avatar role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa ticket
exports.deleteTicket = async (req, res) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa yêu cầu hỗ trợ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
