const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true, uppercase: true },
  deviceName: { type: String, required: true },
  modelCode: { type: String }, // ví dụ: A2141
  purchaseDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'voided'], default: 'active' },
  customerName: { type: String },
  customerPhone: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Warranty', warrantySchema);
