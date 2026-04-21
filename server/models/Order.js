const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
    avatar: { type: String, default: "" }
  },
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
      image: String
    }
  ],
  totalAmount: Number,
  deliveryStatus: { 
    type: String, 
    enum: ['New', 'Processing', 'Shipping', 'Delivered', 'PendingApproval', 'Canceled'],
    default: 'New' 
  },
  paymentMethod: String,
  isPaid: { type: Boolean, default: false },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Pending', 'Paid', 'Failed'],
    default: 'Unpaid'
  },
  momoRequestId: { type: String, default: '' },
  momoOrderId:   { type: String, default: '' },
  momoTransId:   { type: String, default: '' },
  paidAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  auditLogs: [
    {
      action: String,
      detail: String,
      user: String,
      time: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);