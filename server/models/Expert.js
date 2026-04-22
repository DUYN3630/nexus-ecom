const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Một user chỉ có một hồ sơ chuyên gia
  },
  employeeId: { type: String, unique: true, required: true }, // Mã nhân viên (ví dụ: NX-001)
  name: { type: String, required: true },
  role: { type: String, default: 'Apple Certified Technician' },
  avatar: { type: String },
  specialty: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  experience: { type: String },
  location: { type: String },
  isOnline: { type: Boolean, default: true },
  bio: { type: String },
  status: { type: String, enum: ['active', 'on_leave', 'retired'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Expert', expertSchema);
