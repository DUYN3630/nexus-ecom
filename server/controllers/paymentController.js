const momoService = require('../services/momoService');
const Order = require('../models/Order');

// 1. Hàm tạo giao dịch MoMo
exports.createMomoPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Thiếu orderId' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    if (order.paymentStatus === 'Paid') return res.status(400).json({ message: 'Đơn hàng đã thanh toán' });

    const orderInfo = `Thanh toán đơn hàng ${order.orderNumber} - Nexus Store`;
    
    // Gọi service để tạo link thanh toán (Sử dụng totalAmount từ Order model)
    const result = await momoService.createPayment(order._id.toString(), order.totalAmount, orderInfo);
    
    // Lưu các thông tin cần thiết vào Order để đối soát
    await Order.findByIdAndUpdate(orderId, {
      momoRequestId: result.requestId,
      momoOrderId: result.momoOrderId,
      paymentStatus: 'Pending'
    });

    // Trả link payUrl về cho ReactJS để chuyển hướng người dùng
    res.json({ payUrl: result.payUrl });
  } catch (error) {
    console.error('[PaymentController] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 2. Hàm nhận phản hồi từ MoMo (IPN Webhook)
exports.handleMomoIPN = async (req, res) => {
  try {
    const isValid = momoService.verifyIPN(req.body);
    if (!isValid) return res.status(400).send('Signature Invalid');

    const { resultCode, extraData, transId, orderId: momoOrderId } = req.body;
    
    // Giải mã extraData để lấy orderId gốc trong database
    const { orderId } = JSON.parse(Buffer.from(extraData, 'base64').toString());

    if (resultCode === 0) {
      // Thanh toán thành công -> Cập nhật DB
      await Order.findByIdAndUpdate(orderId, { 
          paymentStatus: 'Paid',
          isPaid: true,
          paymentMethod: 'MoMo',
          momoTransId: String(transId),
          paidAt: new Date(),
          deliveryStatus: 'Processing',
          $push: {
            auditLogs: {
              action: 'Thanh toán MoMo',
              detail: `Giao dịch thành công. Mã GD MoMo: ${transId}`,
              user: 'system'
            }
          }
      });
      console.log(`✅ Đơn hàng ${orderId} đã thanh toán thành công qua MoMo!`);
    } else {
      // Thanh toán thất bại hoặc người dùng hủy
      await Order.findByIdAndUpdate(orderId, { 
          paymentStatus: 'Failed',
          $push: {
            auditLogs: {
              action: 'Thanh toán MoMo thất bại',
              detail: `Mã lỗi MoMo: ${resultCode}. OrderID: ${momoOrderId}`,
              user: 'system'
            }
          }
      });
      console.log(`❌ Đơn hàng ${orderId} thanh toán thất bại (Code: ${resultCode})`);
    }

    // MoMo yêu cầu phản hồi 204 No Content (hoặc 200 ok) để biết Server đã nhận tin
    res.status(204).send();
  } catch (error) {
    console.error('[PaymentController] IPN Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

// 3. Hàm kiểm tra trạng thái thanh toán (Dành cho Frontend polling)
exports.checkPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('paymentStatus isPaid');
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
