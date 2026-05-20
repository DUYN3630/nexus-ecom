const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const RepairRequest = require('../models/RepairRequest');

const invoiceController = {
  // Tạo hóa đơn từ Đơn hàng
  generateFromOrder: async (orderId) => {
    try {
      const order = await Order.findById(orderId).populate('user');
      if (!order) throw new Error('Order not found');

      const invoiceNumber = `INV-ORD-${Date.now()}`;
      
      const items = order.items.map(item => ({
        description: item.name,
        quantity: item.quantity,
        price: item.price,
        amount: item.price * item.quantity
      }));

      const newInvoice = new Invoice({
        invoiceNumber,
        relatedType: 'Order',
        relatedId: order._id,
        customer: {
          name: order.shippingAddress.fullName || order.user.name,
          email: order.user.email,
          phone: order.shippingAddress.phone || order.user.phone,
          address: `${order.shippingAddress.address}, ${order.shippingAddress.city}`
        },
        items,
        subTotal: order.totalAmount, // Giả định đã tính toán
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod
      });

      return await newInvoice.save();
    } catch (error) {
      console.error('generateFromOrder Error:', error.message);
      throw error;
    }
  },

  // Tạo hóa đơn từ Yêu cầu sửa chữa
  generateFromRepair: async (repairId) => {
    try {
      const repair = await RepairRequest.findById(repairId).populate('user').populate('usedParts.part');
      if (!repair) throw new Error('Repair Request not found');

      const invoiceNumber = `INV-REP-${Date.now()}`;
      
      // Sử dụng serviceFee làm giá gốc của dịch vụ, không dùng estimatedCost vì 
      // estimatedCost thường đã bao gồm cả linh kiện ở frontend
      const items = [{
        description: `Dịch vụ sửa chữa: ${repair.deviceType} - ${repair.description}`,
        quantity: 1,
        price: repair.serviceFee || 0,
        amount: repair.serviceFee || 0
      }];

      if (repair.usedParts && repair.usedParts.length > 0) {
        repair.usedParts.forEach(up => {
          const partPrice = up.part?.price || 0;
          items.push({
            description: `Linh kiện: ${up.part?.name || 'Không xác định'}`,
            quantity: up.quantity,
            price: partPrice,
            amount: partPrice * up.quantity
          });
        });
      }

      const totalAmount = items.reduce((acc, curr) => acc + curr.amount, 0);

      const newInvoice = new Invoice({
        invoiceNumber,
        relatedType: 'Repair',
        relatedId: repair._id,
        customer: {
          name: repair.user ? repair.user.name : (repair.guestInfo?.name || "Khách hàng"),
          email: repair.user ? repair.user.email : (repair.guestInfo?.email || ""),
          phone: repair.user ? repair.user.phone : (repair.guestInfo?.phone || ""),
          address: "Tại cửa hàng"
        },
        items,
        subTotal: totalAmount,
        totalAmount: totalAmount,
        paymentMethod: repair.paymentMethod || 'Tại cửa hàng'
      });

      return await newInvoice.save();
    } catch (error) {
      console.error('generateFromRepair Error:', error.message);
      throw error;
    }
  },

  // Lấy chi tiết hóa đơn
  getInvoice: async (req, res) => {
    try {
      const { invoiceNumber } = req.params;
      const invoice = await Invoice.findOne({ invoiceNumber });
      if (!invoice) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = invoiceController;
