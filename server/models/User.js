const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Sub-schema cho log hoạt động (giữ nguyên vì hữu ích)
// const activityLogSchema = new mongoose.Schema({
//   action: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
//   ipAddress: { type: String },
//   details: { type: String }
// }, { _id: false });

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Vui lòng nhập tên'], 
    trim: true 
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true, // Cho phép null nhưng vẫn đảm bảo duy nhất nếu có giá trị
    index: true, 
    trim: true, 
    lowercase: true 
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true
  },
  password: { 
    type: String, 
    required: function() {
      // Mật khẩu chỉ bắt buộc nếu không dùng Google Login hoặc Phone Login (tùy chọn)
      return !this.googleId && !this.phone; 
    }
  },
  
  avatar: { type: String, default: null },
  googleId: { type: String, index: true, default: null },
  
  // --- THAY ĐỔI QUAN TRỌNG: Gỡ bỏ Enum cứng ---
  // Lý do: Để tránh lỗi crash khi dữ liệu cũ không khớp (ví dụ 'admin' vs 'Admin').
  // Chúng ta sẽ chuẩn hóa Role tại tầng Controller.
  role: { 
    type: String, 
    default: 'Customer',
    trim: true
  },
  
  status: { 
    type: String, 
    default: 'active', // Đơn giản hóa flow, mặc định active để user vào được ngay
    enum: ['active', 'inactive', 'suspended', 'pending']
  },

  // Reset Password
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },

  // Audit fields
  lastLoginAt: { type: Date },
  lastLoginIp: { type: String },
  
  // Soft Delete
  deletedAt: { type: Date, default: null }

}, { 
  timestamps: true // Tự động tạo createdAt, updatedAt
});

// --- MIDDLEWARE ---

// Hash password trước khi save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  // Với async/await trong Mongoose middleware mới, ta không cần gọi next()
  // Chỉ cần throw error nếu có lỗi, hoặc để code chạy hết là thành công.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);