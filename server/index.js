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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/tickets', ticketRoutes);

// ĐĂNG KÝ ROUTE SUPPORT TRỰC TIẾP ĐỂ TRÁNH LỖI 404
app.use('/api/support', (req, res, next) => {
    console.log(`--- [DEBUG] Support API Hit: ${req.method} ${req.url} ---`);
    next();
}, supportRoutes);

app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/ai-settings', (req, res, next) => {
    console.log(`--- [DEBUG] AI Settings API Hit: ${req.method} ${req.url} ---`);
    next();
}, aiSettingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('🚀 Nexus E-commerce Backend is Live and Running!');
});

// Endpoint Chat chính thức
app.post('/api/ai/chat', async (req, res) => {
    console.log("--- [DEBUG] AI Chat Request Received ---");
    const { prompt, userId, sessionId, customInstruction, systemInstruction, modelName, temperature, maxOutputTokens } = req.body;

    try {
        if (!prompt) return res.status(400).json({ message: "Prompt is required" });

        // Lấy config từ DB
        const settings = await Setting.find({ key: { $in: ['ai_system_instruction', 'ai_model_name', 'ai_temperature', 'ai_max_tokens'] } });
        const configMap = settings.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});

        // Quyết định System Instruction
        let finalSystemInstruction = systemInstruction;
        if (customInstruction === 'NEXUS_EXPERT_SUPPORT_INSTRUCTION') {
            finalSystemInstruction = NEXUS_EXPERT_SUPPORT_INSTRUCTION;
        } else if (!finalSystemInstruction) {
            finalSystemInstruction = configMap.ai_system_instruction || NEXUS_SYSTEM_INSTRUCTION;
        }

        // Ép AI không nhắc đến Google
        let finalPrompt = prompt;
        if (customInstruction === 'NEXUS_EXPERT_SUPPORT_INSTRUCTION') {
            finalPrompt = `BẠN LÀ NHÂN VIÊN NEXUS STORE. TUYỆT ĐỐI KHÔNG NÓI BẠN LÀ AI CỦA GOOGLE. \nCâu hỏi khách: ${prompt}`;
        }

        const options = {
            systemInstruction: finalSystemInstruction,
            modelName: modelName || configMap.ai_model_name || "gemini-flash-latest",
            temperature: 0.3,
            maxOutputTokens: 500
        };

        let text = await generateText(finalPrompt, options);
        console.log("--- [DEBUG] Gemini Response Received ---");

        if (text) {
            text = text.replace(/Tôi là một trí tuệ nhân tạo được huấn luyện bởi Google/g, 'Em là chuyên gia kỹ thuật của Nexus Store')
                       .replace(/trí tuệ nhân tạo được huấn luyện bởi Google/g, 'nhân viên Nexus Store')
                       .replace(/[*#\-_>[\]{}~|+=\\^`()]/g, '')
                       .replace(/\s+/g, ' ').trim();
        } else {
            console.warn("--- [WARN] Gemini returned empty text ---");
            text = "Dạ, em chưa tìm được câu trả lời phù hợp. Anh/Chị thử hỏi cách khác nhé.";
        }

        // --- XỬ LÝ LƯU TICKET (QUAN TRỌNG) ---
        const cleanUserId = (userId && userId !== 'null' && userId !== 'undefined' && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;
        const cleanSessionId = (sessionId && sessionId !== 'null' && sessionId !== 'undefined') ? sessionId : null;
        const userIdentifier = cleanUserId ? { user: cleanUserId } : (cleanSessionId ? { sessionId: cleanSessionId } : null);

        console.log("--- [DEBUG] User Identifier for Ticket:", userIdentifier);

        if (userIdentifier) {
            try {
                let ticket = await SupportTicket.findOne({ ...userIdentifier, status: { $ne: 'resolved' } });
                if (!ticket) {
                    console.log("--- [DEBUG] Creating New Support Ticket ---");
                    ticket = new SupportTicket({ 
                        ...userIdentifier, 
                        subject: prompt.substring(0, 50), 
                        status: 'diagnosing' 
                    });
                } else {
                    console.log("--- [DEBUG] Updating Existing Ticket:", ticket._id);
                }
                
                ticket.chatHistory.push({ role: 'user', content: prompt });
                ticket.chatHistory.push({ role: 'ai', content: text });

                // Extraction thô (Số điện thoại)
                const phoneMatch = prompt.match(/(0[3|5|7|8|9][0-9]{8})\b/);
                if (phoneMatch) {
                    ticket.phoneNumber = phoneMatch[0];
                    console.log("--- [DEBUG] Regex Found Phone:", phoneMatch[0]);
                }

                await ticket.save();
                console.log("--- [DEBUG] Ticket Saved Successfully ---");
            } catch (err) {
                console.error("--- [ERROR] Save Ticket Failed:", err.message);
                // Không return lỗi 500 ở đây để khách vẫn nhận được câu trả lời từ AI
            }
        }

        return res.json({ text });
    } catch (error) {
        console.error("--- [ERROR] AI Chat Endpoint:", error);
        res.status(500).json({ message: "Lỗi AI hệ thống", error: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Đã xảy ra lỗi nội bộ hệ thống!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
