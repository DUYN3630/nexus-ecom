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
  serialNumber: { type: String }, // Serial Number of the device
  description: { type: String, required: true },
  urgency: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', default: null },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'AwaitingApproval', 'Approved', 'Repairing', 'Testing', 'Done', 'Returned'],
    default: 'Pending'
  },
  serviceFee: { type: Number, default: 0 },
  estimatedCost: { type: Number, default: 0 },
  expertResponse: { type: String, default: "" },
  repairNotes: { type: String, default: "" },
  usedParts: [{
    part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, default: 1 }
  }],
  progressImages: [{    url: { type: String },
    caption: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  startTime: { type: Date }, // Thời gian bắt đầu thực tế
  endTime: { type: Date },    // Thời gian hoàn thành dự kiến/thực tế
  receptionTime: { type: Date, default: Date.now }, // Thời gian tiếp nhận đơn
  
  // Payment fields
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  isPaid: { type: Boolean, default: false },
  momoRequestId: { type: String },
  momoOrderId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
