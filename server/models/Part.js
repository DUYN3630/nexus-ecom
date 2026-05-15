const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['Screen', 'Battery', 'Speaker', 'Motherboard', 'Camera', 'Housing', 'Other'], 
    default: 'Other' 
  },
  stock: { type: Number, default: 0 },
  price: { type: Number, required: true },
  compatibleDevices: [{ type: String }],
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Part', partSchema);
