const mongoose = require('mongoose');
const { generateText } = require('../utils/gemini');
const Setting = require('../models/Setting');
const SupportTicket = require('../models/SupportTicket');
const { NEXUS_SYSTEM_INSTRUCTION, NEXUS_EXPERT_SUPPORT_INSTRUCTION } = require('../config/aiPrompt');

const handleChat = async (req, res) => {
    console.log("--- [DEBUG] AI Chat Request Received ---");
    const { prompt, image, userId, sessionId, customInstruction, systemInstruction, modelName, temperature, maxOutputTokens } = req.body;

    try {
        if (!prompt && !image) return res.status(400).json({ message: "Prompt or image is required" });

        // Ưu tiên lấy User ID từ Token (req.user) nếu có, nếu không mới lấy từ body
        const effectiveUserId = req.user?._id || userId;

        // Get config from DB
        const settings = await Setting.find({ key: { $in: ['ai_system_instruction', 'ai_model_name', 'ai_temperature', 'ai_max_tokens'] } });
        const configMap = settings.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});

        // ... (phần xác định finalSystemInstruction và options giữ nguyên)

        const finalSystemInstruction = customInstruction === 'NEXUS_EXPERT_SUPPORT_INSTRUCTION'
            ? NEXUS_EXPERT_SUPPORT_INSTRUCTION
            : systemInstruction || configMap.ai_system_instruction || NEXUS_SYSTEM_INSTRUCTION;

        const options = {
            systemInstruction: finalSystemInstruction,
            modelName: modelName || configMap.ai_model_name || "gemini-flash-latest",
            temperature: temperature || parseFloat(configMap.ai_temperature) || 0.4,
            maxOutputTokens: maxOutputTokens || parseInt(configMap.ai_max_tokens) || 1000,
            image: image || null
        };

        let text = await generateText(prompt || "Please analyze this image.", options);
        console.log("--- [DEBUG] Gemini Response Received ---");

        if (text) {
            text = text.replace(/[*#\-_>`]/g, '').replace(/\s+/g, ' ').trim();
        } else {
            text = "Dạ, em chưa tìm được câu trả lời phù hợp. Anh/Chị thử hỏi cách khác nhé.";
        }

        // --- Save Ticket Logic (Improved Identification) ---
        const cleanUserId = (effectiveUserId && effectiveUserId !== 'null' && effectiveUserId !== 'undefined' && mongoose.Types.ObjectId.isValid(effectiveUserId)) ? effectiveUserId : null;
        let cleanSessionId = (sessionId && sessionId !== 'null' && sessionId !== 'undefined') ? sessionId : null;
        
        if (!cleanUserId && !cleanSessionId) {
            cleanSessionId = `guest_${Math.random().toString(36).substring(2, 11)}`;
        }

        const userIdentifier = cleanUserId ? { user: cleanUserId } : { sessionId: cleanSessionId };

        try {
            // Tìm ticket đang hoạt động (chưa resolved) của user/session
            let ticket = await SupportTicket.findOne({ 
                ...userIdentifier, 
                status: { $ne: 'resolved' } 
            }).sort({ updatedAt: -1 });
            
            if (!ticket) {
                ticket = new SupportTicket({ 
                    ...userIdentifier, 
                    subject: prompt ? prompt.substring(0, 50) : "Chẩn đoán hình ảnh", 
                    status: 'diagnosing' 
                });
            } else if (ticket.status === 'converted') {
                // Nếu khách quay lại chat, đánh dấu là diagnosing để admin/expert thấy tin nhắn mới
                ticket.status = 'diagnosing';
            }
            
            // Lưu tin nhắn vào lịch sử (có ảnh nếu có)
            ticket.chatHistory.push({ 
                role: 'user', 
                content: prompt || "Đã gửi một hình ảnh", 
                image: image || null 
            });
            ticket.chatHistory.push({ 
                role: 'ai', 
                content: text 
            });

            // Cập nhật SĐT nếu phát hiện trong tin nhắn
            const phoneMatch = prompt?.match(/(0[3|5|7|8|9][0-9]{8})\b/);
            if (phoneMatch) {
                ticket.phoneNumber = phoneMatch[0];
            }

            await ticket.save();
        } catch (err) {
            console.error("--- [ERROR] Persistence Logic Failed:", err.message);
        }

        return res.json({ text, sessionId: cleanSessionId });
    } catch (error) {
        console.error("--- [ERROR] AI Chat Endpoint:", error);
        res.status(500).json({ message: "Lỗi AI hệ thống", error: error.message });
    }
};

module.exports = { handleChat };
