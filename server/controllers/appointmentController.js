const Appointment = require('../models/Appointment');

const DEFAULT_SLOTS = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

const appointmentController = {
  // Lấy các khung giờ trống của chuyên gia trong 1 ngày
  getExpertAvailability: async (req, res) => {
    try {
      const { expertId } = req.params;
      const { date } = req.query; // YYYY-MM-DD

      if (!date) return res.status(400).json({ message: "Vui lòng cung cấp ngày." });

      const bookedAppointments = await Appointment.find({
        expert: expertId,
        date: date,
        status: { $ne: 'cancelled' }
      }).select('slot');

      const bookedSlots = bookedAppointments.map(app => app.slot);
      const availableSlots = DEFAULT_SLOTS.filter(slot => !bookedSlots.includes(slot));

      res.json({
        date,
        expertId,
        availableSlots
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy lịch trình chuyên gia.", error: error.message });
    }
  },

  // Tạo lịch hẹn mới
  create: async (req, res) => {
    try {
      const { expertId, date, slot, notes, deviceType, guestInfo } = req.body;
      const userId = req.user ? req.user._id : null;

      // Kiểm tra xem slot đã bị đặt chưa (double check)
      const existing = await Appointment.findOne({
        expert: expertId,
        date,
        slot,
        status: { $ne: 'cancelled' }
      });

      if (existing) {
        return res.status(400).json({ message: "Khung giờ này vừa mới được đặt. Vui lòng chọn khung giờ khác." });
      }

      const appointment = new Appointment({
        user: userId,
        guestInfo,
        expert: expertId,
        date,
        slot,
        notes,
        deviceType,
        status: 'pending'
      });

      await appointment.save();

      res.status(201).json({
        success: true,
        message: "Đặt lịch thành công!",
        data: appointment
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi đặt lịch.", error: error.message });
    }
  },

  // Expert/Admin: Lấy toàn bộ lịch hẹn của một chuyên gia
  getExpertAppointments: async (req, res) => {
    try {
      const { expertId } = req.params;
      const appointments = await Appointment.find({ expert: expertId })
        .populate('user', 'name phone email')
        .sort({ date: 1, slot: 1 });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy lịch trình của chuyên gia." });
    }
  },

  // Lấy lịch hẹn của tôi
  getMyAppointments: async (req, res) => {
    try {
      const userId = req.user._id;
      const appointments = await Appointment.find({ user: userId })
        .populate('expert', 'name role avatar')
        .sort({ date: 1, slot: 1 });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy lịch hẹn của bạn." });
    }
  }
};

module.exports = appointmentController;
