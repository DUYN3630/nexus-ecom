const momoService = require('../services/momoService');
const Order = require('../models/Order');
const RepairRequest = require('../models/RepairRequest');

const invoiceController = require('./invoiceController');

// 1. Hàm tạo giao dịch MoMo
exports.createMomoPayment = async (req, res) => {
  try {
    const { orderId, type } = req.body; // type: 'order' or 'repair'
    if (!orderId) return res.status(400).json({ message: 'Thiếu orderId' });

    let orderInfo = '';
    let amount = 0;
    let targetId = '';

    if (type === 'repair') {
      const repair = await RepairRequest.findById(orderId);
      if (!repair) return res.status(404).json({ message: 'Đơn sửa chữa không tồn tại' });
      if (repair.paymentStatus === 'Paid') return res.status(400).json({ message: 'Đơn sửa chữa đã thanh toán' });
      
      orderInfo = `Thanh toán sửa chữa ${repair.ticketNumber} - Nexus Store`;
      amount = repair.estimatedCost || 0;
      targetId = repair._id.toString();

      await RepairRequest.findByIdAndUpdate(orderId, { paymentStatus: 'Pending' });
    } else {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      if (order.paymentStatus === 'Paid') return res.status(400).json({ message: 'Đơn hàng đã thanh toán' });
      
      orderInfo = `Thanh toán đơn hàng ${order.orderNumber} - Nexus Store`;
      amount = order.totalAmount;
      targetId = order._id.toString();

      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Pending' });
    }
    
    // Gọi service để tạo link thanh toán
    const result = await momoService.createPayment(targetId, amount, orderInfo);
    
    // Cập nhật requestId
    if (type === 'repair') {
      await RepairRequest.findByIdAndUpdate(orderId, { momoRequestId: result.requestId });
    } else {
      await Order.findByIdAndUpdate(orderId, { momoRequestId: result.requestId, momoOrderId: result.momoOrderId });
    }

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

    // Check if it's a repair or order
    const isRepair = await RepairRequest.exists({ _id: orderId });

    if (resultCode === 0) {
      if (isRepair) {
        await RepairRequest.findByIdAndUpdate(orderId, { 
          paymentStatus: 'Paid',
          isPaid: true
        });
        try {
          const invoice = await invoiceController.generateFromRepair(orderId);
          const notificationService = require('../services/notificationService');
          
          const repair = await RepairRequest.findById(orderId).populate('user');
          const userEmail = repair.user?.email || repair.guestInfo?.email;
          if (userEmail) {
            await notificationService.notifyInvoiceCreated(userEmail, invoice);
          }
        } catch (invErr) {
          console.error("Failed to generate repair invoice:", invErr);
        }
      } else {
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
      }
      console.log(`✅ Giao dịch ${orderId} đã thanh toán thành công qua MoMo!`);
    } else {
      if (isRepair) {
        await RepairRequest.findByIdAndUpdate(orderId, { paymentStatus: 'Failed' });
      } else {
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
      }
      console.log(`❌ Giao dịch ${orderId} thanh toán thất bại (Code: ${resultCode})`);
    }

    res.status(204).send();
  } catch (error) {
    console.error('[PaymentController] IPN Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

// 3. Hàm kiểm tra trạng thái thanh toán (Dành cho Frontend polling)
exports.checkPaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    let doc = await Order.findById(orderId).select('paymentStatus isPaid');
    if (!doc) {
      doc = await RepairRequest.findById(orderId).select('paymentStatus isPaid');
    }
    if (!doc) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
