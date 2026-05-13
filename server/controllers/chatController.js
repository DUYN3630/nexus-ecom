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

        // Get config from DB
        const settings = await Setting.find({ key: { $in: ['ai_system_instruction', 'ai_model_name', 'ai_temperature', 'ai_max_tokens'] } });
        const configMap = settings.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});

        // Determine System Instruction (Simplified)
        const finalSystemInstruction = customInstruction === 'NEXUS_EXPERT_SUPPORT_INSTRUCTION'
            ? NEXUS_EXPERT_SUPPORT_INSTRUCTION
            : systemInstruction || configMap.ai_system_instruction || NEXUS_SYSTEM_INSTRUCTION;

        const options = {
            systemInstruction: finalSystemInstruction,
            modelName: modelName || configMap.ai_model_name || "gemini-2.0-flash",
            temperature: temperature || parseFloat(configMap.ai_temperature) || 0.4,
            maxOutputTokens: maxOutputTokens || parseInt(configMap.ai_max_tokens) || 800
        };

        let text = await generateText(prompt, options); // Use the original prompt
        console.log("--- [DEBUG] Gemini Response Received ---");

        if (text) {
            // Remove markdown characters but keep the core message.
            text = text.replace(/[*#\-_>`]/g, '').replace(/\s+/g, ' ').trim();
        } else {
            console.warn("--- [WARN] Gemini returned empty text ---");
            text = "Dạ, em chưa tìm được câu trả lời phù hợp. Anh/Chị thử hỏi cách khác nhé.";
        }

        // --- Save Ticket Logic (unchanged) ---
        const cleanUserId = (userId && userId !== 'null' && userId !== 'undefined' && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;
        const cleanSessionId = (sessionId && sessionId !== 'null' && sessionId !== 'undefined') ? sessionId : null;
        const userIdentifier = cleanUserId ? { user: cleanUserId } : (cleanSessionId ? { sessionId: cleanSessionId } : null);

        if (userIdentifier) {
            try {
                let ticket = await SupportTicket.findOne({ ...userIdentifier, status: { $ne: 'resolved' } });
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

                await ticket.save();
            } catch (err) {
                console.error("--- [ERROR] Save Ticket Failed:", err.message);
            }
        }

        return res.json({ text });
    } catch (error) {
        console.error("--- [ERROR] AI Chat Endpoint:", error);
        res.status(500).json({ message: "Lỗi AI hệ thống", error: error.message });
    }
};

module.exports = { handleChat };
