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

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái hoặc gán chuyên gia cho ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expert, priority } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status, expert, priority },
      { new: true }
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa ticket
exports.deleteTicket = async (req, res) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa yêu cầu hỗ trợ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
