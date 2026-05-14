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
    enum: ['Pending', 'Confirmed', 'Repairing', 'Testing', 'Done', 'Returned'], 
    default: 'Pending' 
  },
  estimatedCost: { type: Number, default: 0 },
  expertResponse: { type: String, default: "" },
  repairNotes: { type: String, default: "" },
  progressImages: [{
    url: { type: String },
    caption: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  startTime: { type: Date }, // Thời gian bắt đầu thực tế
  endTime: { type: Date }    // Thời gian hoàn thành dự kiến/thực tế
}, { timestamps: true });

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
