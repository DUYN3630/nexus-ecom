const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  guestInfo: {
    name: { type: String },
    phone: { type: String }
  },
  expert: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Expert', 
    required: true 
  },
  date: { 
    type: String, // YYYY-MM-DD format for easier querying
    required: true 
  },
  slot: { 
    type: String, // e.g., "09:00", "10:00"
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  notes: { type: String },
  deviceType: { type: String },
  repairRequest: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RepairRequest' 
  }
}, { timestamps: true });

// Ensure unique slot per expert per date
appointmentSchema.index({ expert: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
