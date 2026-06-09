const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { generateText } = require('./utils/gemini');
const Setting = require('./models/Setting');
const SupportTicket = require('./models/SupportTicket');
const repairController = require('./controllers/repairController');
const { NEXUS_SYSTEM_INSTRUCTION, NEXUS_EXPERT_SUPPORT_INSTRUCTION } = require('./config/aiPrompt');

// Cấu hình môi trường
dotenv.config({ path: path.join(__dirname, '.env') });

// Kiểm tra biến môi trường quan trọng
if (!process.env.JWT_SECRET) {
    console.error('❌ CẢNH BÁO: JWT_SECRET chưa được cấu hình trong môi trường!');
}

const sanitize = require('mongo-sanitize');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST"]
    }
});

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log(`⚡ [SOCKET] User connected: ${socket.id}`);
    
    // Gửi lời chào để test kết nối
    socket.emit('welcome', { message: 'Kết nối Socket thành công!' });

    socket.on('join_admin_room', () => {
        socket.join('admin_room');
        console.log(`🛡️ [SOCKET] User ${socket.id} joined Admin Room`);
        socket.emit('joined_confirmation', { room: 'admin_room' });
    });

    socket.on('test_notification', (data) => {
        console.log(`🧪 [SOCKET] Test notification requested by ${socket.id}`);
        // Phát ngược lại cho chính mình (hoặc cả phòng admin) để test
        io.to('admin_room').emit('new_order', {
            orderId: 'TEST-123',
            orderNumber: 'NX-TEST-DEBUG',
            customerName: 'Người dùng thử nghiệm',
            totalAmount: 999999,
            time: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log(`👋 [SOCKET] User disconnected: ${socket.id}`);
    });
});

// Make io accessible in routes
app.set('io', io);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SECURITY: SANITIZE INPUTS ---
app.use((req, res, next) => {
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);
    next();
});

// --- SECURITY HEADERS (Fix COOP popup issues) ---
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    next();
});

// --- MASTER REQUEST LOGGER ---
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`>>> [SERVER LOG] ${req.method} ${req.url}`);
    }
    next();
});

// Kết nối Database
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ Kết nối MongoDB Atlas thành công'))
      .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));
}

// --- CẤU HÌNH STATIC FILES (PHỤC VỤ HÌNH ẢNH) ---
const fs = require('fs');
console.log('--- [DEBUG] Static Directories ---');
const uploadsPath = path.resolve(__dirname, 'public/uploads');
const publicPath = path.resolve(__dirname, 'public');

// Linh hoạt giữa Docker (./public/products) và Local (../public/products)
let productsPath = path.resolve(__dirname, 'public/products');
if (!fs.existsSync(productsPath)) {
    productsPath = path.resolve(__dirname, '../public/products');
}

console.log(`[DEBUG] Uploads Path: ${uploadsPath}`);
console.log(`[DEBUG] Public Path: ${publicPath}`);
console.log(`[DEBUG] Products Path: ${productsPath}`);

app.use((req, res, next) => {
    if (req.url.startsWith('/uploads') || req.url.startsWith('/public') || req.url.startsWith('/products')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
});

app.use('/uploads', express.static(uploadsPath));
app.use('/public', express.static(publicPath));
app.use('/products', express.static(productsPath));

// --- DEBUG: Log 404s for images ---
app.use(['/uploads', '/products', '/public'], (req, res, next) => {
    console.log(`[DEBUG] 404 Not Found: ${req.method} ${req.originalUrl}`);
    console.log(`[DEBUG] Attempted to find in: ${uploadsPath}`);
    next();
});

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
const appointmentRoutes = require('./routes/appointmentRoutes');
const partRoutes = require('./routes/partRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');

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
app.use('/api/appointments', appointmentRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/logistics', logisticsRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('🚀 Nexus E-commerce Backend is Live and Running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Đã xảy ra lỗi nội bộ hệ thống!" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = { app, server };
