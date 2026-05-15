const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  relatedType: { type: String, enum: ['Order', 'Repair'], required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    amount: Number
  }],
  subTotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: String,
  status: { type: String, enum: ['Issued', 'Cancelled'], default: 'Issued' },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
