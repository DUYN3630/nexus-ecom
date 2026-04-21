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
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Kết nối MongoDB Atlas thành công'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// --- CẤU HÌNH STATIC FILES (PHỤC VỤ HÌNH ẢNH) ---
// Phục vụ ảnh từ server/public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Phục vụ ảnh từ server/public
app.use('/public', express.static(path.join(__dirname, 'public')));
// Phục vụ ảnh từ root public (nếu frontend gọi trực tiếp)
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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/ai-settings', aiSettingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);

// Test Route cho Render Health Check
app.get('/', (req, res) => {
    res.send('🚀 Nexus E-commerce Backend is Live and Running!');
});

// Endpoint Chat chính thức
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { prompt, userId, customInstruction } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        // Lấy tất cả các cài đặt liên quan đến AI từ collection Setting
        const keys = ['ai_system_instruction', 'ai_model_name', 'ai_temperature', 'ai_max_tokens'];
        const settings = await Setting.find({ key: { $in: keys } });
        
        // Chuyển mảng settings thành một object configMap
        const configMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        const config = {
            ai_system_instruction: configMap.ai_system_instruction || NEXUS_SYSTEM_INSTRUCTION,
            ai_model_name: configMap.ai_model_name || "gemini-flash-latest", // Alias cho 1.5 flash ổn định
            ai_temperature: parseFloat(configMap.ai_temperature) || 0.7,
            ai_max_tokens: parseInt(configMap.ai_max_tokens) || 1000
        };

        let finalInstruction = config.ai_system_instruction;
        if (customInstruction === 'NEXUS_EXPERT_SUPPORT_INSTRUCTION') {
            finalInstruction = NEXUS_EXPERT_SUPPORT_INSTRUCTION;
        }

        const options = {
            systemInstruction: finalInstruction,
            modelName: config.ai_model_name,
            temperature: config.ai_temperature,
            maxOutputTokens: config.ai_max_tokens
        };

        let text = await generateText(prompt, options);

        // HẬU XỬ LÝ: Xóa bỏ tất cả ký tự đặc biệt
        if (text) {
            // Loại bỏ hoàn toàn các ký tự Markdown và ký tự đặc biệt
            // Regex này sẽ xóa: * # - _ [ ] ( ) > + = / \ | ~ `
            text = text.replace(/[*#\-_>[\]{}~|+=\\^`()]/g, ''); 
            
            // Xóa các dấu chấm câu lặp lại quá nhiều hoặc khoảng trắng thừa
            text = text.replace(/\s+/g, ' ').trim();
            
            console.log("--- AI RESPONSE CLEANED ---");
            console.log(text);
            console.log("---------------------------");
        }

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            try {
                let ticket = await SupportTicket.findOne({ user: userId, status: { $ne: 'resolved' } });
                if (!ticket) {
                    ticket = new SupportTicket({
                        user: userId,
                        subject: prompt.substring(0, 50),
                        status: 'diagnosing',
                        chatHistory: []
                    });
                }
                ticket.chatHistory.push({ role: 'user', content: prompt });
                ticket.chatHistory.push({ role: 'ai', content: text });
                await ticket.save();
            } catch (err) {
                console.error("Ticket error:", err.message);
            }
        }

        res.json({ text });

    } catch (error) {
        console.error("AI Endpoint Error:", error);
        res.status(500).json({ message: "Lỗi AI. Vui lòng thử lại sau." });
    }
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Đã xảy ra lỗi nội bộ hệ thống!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại cổng: ${PORT}`);
});
