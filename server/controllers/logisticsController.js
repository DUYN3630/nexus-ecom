const RepairRequest = require('../models/RepairRequest');
const Order = require('../models/Order');

const logisticsController = {
  // @desc    Mô phỏng gọi API Ahamove để tạo đơn vận chuyển
  // @route   POST /api/logistics/create-order
  // @access  Private/Admin
  createShippingOrder: async (req, res) => {
    try {
      const { type, id, serviceType } = req.body; // type: 'repair' or 'sales'

      let sourceOrder;
      if (type === 'repair') {
        sourceOrder = await RepairRequest.findById(id).populate('user');
      } else {
        sourceOrder = await Order.findById(id).populate('userId');
      }

      if (!sourceOrder) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng/yêu cầu." });
      }

      // Mô phỏng dữ liệu gửi sang Ahamove
      const ahamovePayload = {
        orderId: sourceOrder.orderNumber || sourceOrder.ticketNumber,
        customer_name: sourceOrder.user?.name || sourceOrder.guestInfo?.name || sourceOrder.customer?.name,
        customer_phone: sourceOrder.user?.phone || sourceOrder.guestInfo?.phone || sourceOrder.customer?.phone,
        address: sourceOrder.customer?.address || "Hẹn tại nhà khách",
        service: serviceType || "BIKE",
        status: "REQUESTING"
      };

      console.log("--- [DEBUG] Calling Ahamove API with payload: ---", ahamovePayload);

      // Mô phỏng phản hồi từ Ahamove
      const mockAhamoveResponse = {
        success: true,
        tracking_number: `AHA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        shipper_name: "Nguyễn Văn Shipper",
        shipper_phone: "0901234567",
        estimated_pickup_time: new Date(Date.now() + 30 * 60 * 1000) // 30 mins later
      };

      // Cập nhật trạng thái trong DB (giả định có field tracking hoặc note)
      if (type === 'repair') {
        sourceOrder.repairNotes += `\n[Logistics] Đã gọi shipper Ahamove (${mockAhamoveResponse.tracking_number}).`;
        await sourceOrder.save();
      }

      res.json({
        success: true,
        message: "Đã điều phối shipper thành công!",
        data: mockAhamoveResponse
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi kết nối đơn vị vận chuyển", error: error.message });
    }
  }
};

module.exports = logisticsController;
