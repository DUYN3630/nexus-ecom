const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
  subject: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['diagnosing', 'pending', 'in-progress', 'resolved'], 
    default: 'diagnosing' 
  },
  aiSummary: { type: String }, // Tóm tắt lỗi từ AI Gemini
  chatHistory: [{
    role: { type: String, enum: ['user', 'ai'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
