const mongoose = require('mongoose');

const marketingSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['hero', 'promo', 'popup'], // hero = slider chính, promo = banner nhỏ
    required: true 
  },

  // Media (Ảnh/Video)
  media: {
    kind: { 
      type: String, 
      enum: ['image', 'video'], 
      required: true,
      default: 'image'
    },
    url: { type: String, required: true }, // URL CDN hoặc local
    altText: { type: String }, // Cho SEO
    mobileUrl: { type: String } // Ảnh riêng cho mobile (nếu có)
  },

  // Nội dung hiển thị thêm
  content: {
    title: { type: String },
    subtitle: { type: String },
    ctaText: { type: String } // Nút bấm (VD: Mua ngay)
  },

  // Điều hướng thông minh (Smart Link)
  linkType: {
    type: String,
    enum: ['product', 'category', 'external', 'none'],
    default: 'none'
  },
  linkTarget: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    url: { type: String } // Link ngoài
  },

  // Vị trí hiển thị
  position: { 
    type: String, 
    enum: ['home-top', 'home-mid', 'sidebar', 'popup'], 
    required: true 
  },

  // Quy tắc hiển thị
  priority: { type: Number, default: 0 }, // Số càng lớn càng ưu tiên hiển thị trước
  displayRules: {
    devices: { 
        type: [String], 
        enum: ['desktop', 'mobile'], 
        default: ['desktop', 'mobile'] 
    }
  },

  // Lịch chạy
  schedule: {
    startAt: { type: Date, default: Date.now },
    endAt: { type: Date }
  },

  status: { 
    type: String, 
    enum: ['active', 'inactive', 'scheduled', 'expired'], 
    default: 'active' 
  },

  // Thống kê hiệu quả
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }

}, { 
  timestamps: true 
});

// Index tối ưu truy vấn
marketingSchema.index({ position: 1, status: 1, priority: -1 });
marketingSchema.index({ 'schedule.startAt': 1, 'schedule.endAt': 1 });

module.exports = mongoose.model('Marketing', marketingSchema);
