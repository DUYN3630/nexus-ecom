const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { generateText } = require('./utils/gemini');
const Setting = require('./models/Setting');
const SupportTicket = require('./models/SupportTicket');
const { NEXUS_SYSTEM_INSTRUCTION, NEXUS_EXPERT_SUPPORT_INSTRUCTION } = require('./config/aiPrompt');

// Cấu hình môi trường
dotenv.config({ path: path.join(__dirname, '.env') });

// Kiểm tra biến môi trường quan trọng
if (!process.env.JWT_SECRET) {
    console.error('❌ CẢNH BÁO: JWT_SECRET chưa được cấu hình trong môi trường!');
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Kết nối MongoDB Atlas thành công'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// --- CẤU HÌNH STATIC FILES (PHỤC VỤ HÌNH ẢNH) ---
app.use((req, res, next) => {
    if (req.url.startsWith('/uploads') || req.url.startsWith('/public') || req.url.startsWith('/products')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/products', express.static(path.join(__dirname, '../public/products')));

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const expertRoutes = require('./routes/expertRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const aiSettingRoutes = require('./routes/aiSettingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const supportRoutes = require('./routes/supportRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/tickets', ticketRoutes);

app.use('/api/support', supportRoutes);
app.use('/api/ai-settings', aiSettingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/ai', chatRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('🚀 Nexus E-commerce Backend is Live and Running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Đã xảy ra lỗi nội bộ hệ thống!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
