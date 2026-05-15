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
      
      const items = [{
        description: `Dịch vụ sửa chữa: ${repair.deviceType} - ${repair.description}`,
        quantity: 1,
        price: repair.estimatedCost,
        amount: repair.estimatedCost
      }];

      if (repair.usedParts && repair.usedParts.length > 0) {
        repair.usedParts.forEach(up => {
          items.push({
            description: `Linh kiện: ${up.part?.name || 'Không xác định'}`,
            quantity: up.quantity,
            price: up.part?.price || 0,
            amount: (up.part?.price || 0) * up.quantity
          });
        });
      }

      const totalAmount = items.reduce((acc, curr) => acc + curr.amount, 0);

      const newInvoice = new Invoice({
        invoiceNumber,
        relatedType: 'Repair',
        relatedId: repair._id,
        customer: {
          name: repair.user ? repair.user.name : repair.guestInfo.name,
          email: repair.user ? repair.user.email : repair.guestInfo.email,
          phone: repair.user ? repair.user.phone : repair.guestInfo.phone,
          address: "Tại cửa hàng"
        },
        items,
        subTotal: totalAmount,
        totalAmount: totalAmount,
        paymentMethod: repair.paymentMethod || 'MoMo'
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
