const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestInfo: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" }
  },
  deviceType: { type: String, required: true },
  description: { type: String, required: true },
  urgency: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', default: null },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Repairing', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  estimatedCost: { type: Number, default: 0 },
  expertResponse: { type: String, default: "" },
  repairNotes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
