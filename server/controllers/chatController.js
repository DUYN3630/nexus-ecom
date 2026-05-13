const mongoose = require('mongoose');
const { generateText } = require('../utils/gemini');
const Setting = require('../models/Setting');
const SupportTicket = require('../models/SupportTicket');
const { NEXUS_SYSTEM_INSTRUCTION, NEXUS_EXPERT_SUPPORT_INSTRUCTION } = require('../config/aiPrompt');

const handleChat = async (req, res) => {
    console.log("--- [DEBUG] AI Chat Request Received ---");
    const { prompt, userId, sessionId, customInstruction, systemInstruction, modelName, temperature, maxOutputTokens } = req.body;

    try {
        if (!prompt) return res.status(400).json({ message: "Prompt is required" });

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
            maxOutputTokens: maxOutputTokens || parseInt(configMap.ai_max_tokens) || 1000
        };

        let text = await generateText(prompt, options);
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
            let ticket = await SupportTicket.findOne({ ...userIdentifier, status: { $nin: ['resolved', 'converted'] } });
            
            if (!ticket) {
                ticket = new SupportTicket({ 
                    ...userIdentifier, 
                    subject: prompt.substring(0, 50), 
                    status: 'diagnosing' 
                });
            }
            
            ticket.chatHistory.push({ role: 'user', content: prompt });
            ticket.chatHistory.push({ role: 'ai', content: text });

            const phoneMatch = prompt.match(/(0[3|5|7|8|9][0-9]{8})\b/);
            if (phoneMatch) {
                ticket.phoneNumber = phoneMatch[0];
            }

            if (prompt.toLowerCase().includes('sửa') || prompt.toLowerCase().includes('hỏng') || prompt.toLowerCase().includes('lỗi')) {
                ticket.intent = 'repair_request';
            } else if (prompt.toLowerCase().includes('bảo hành')) {
                ticket.intent = 'warranty_check';
            }

            await ticket.save();
        } catch (err) {
            console.error("--- [ERROR] Save Ticket Failed:", err.message);
        }

        return res.json({ text, sessionId: cleanSessionId });
    } catch (error) {
        console.error("--- [ERROR] AI Chat Endpoint:", error);
        res.status(500).json({ message: "Lỗi AI hệ thống", error: error.message });
    }
};

module.exports = { handleChat };
