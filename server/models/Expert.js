const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Apple Certified Technician' },
  avatar: { type: String },
  specialty: [{ type: String }], // ['iPhone', 'MacBook', 'Software', 'iCloud']
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  experience: { type: String }, // '5 years'
  location: { type: String }, // 'Hà Nội', 'TP.HCM'
  isOnline: { type: Boolean, default: true },
  bio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expert', expertSchema);
