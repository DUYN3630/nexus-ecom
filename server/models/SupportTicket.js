const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  sessionId: { type: String }, // Cho khách vãng lai
  phoneNumber: { type: String }, // Số điện thoại khách để lại
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
  subject: { type: String, required: true },
  deviceType: { type: String, default: 'iPhone' }, // Loại thiết bị khách đang hỏi
  intent: { type: String }, // Ý định của khách (repair, buy, warranty...)
  status: { 
    type: String, 
    enum: ['diagnosing', 'pending', 'in-progress', 'resolved', 'converted'], 
    default: 'diagnosing' 
  },
  aiSummary: { type: String }, // Tóm tắt lỗi từ AI Gemini
  chatHistory: [{
    role: { type: String, enum: ['user', 'ai'] },
    content: { type: String },
    image: { type: String }, // Base64 or URL
    timestamp: { type: Date, default: Date.now }
  }],
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
