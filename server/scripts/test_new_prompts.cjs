const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { generateText } = require('./utils/gemini');
const { NEXUS_SYSTEM_INSTRUCTION, NEXUS_EXPERT_SUPPORT_INSTRUCTION } = require('./config/aiPrompt');

async function test() {
    try {
        console.log("--- TESTING CHATBOX (SALES) ---");
        const salesPrompt = "Chào em, bên mình có iPhone 17 Pro Max chưa? Giá bao nhiêu?";
        const salesResponse = await generateText(salesPrompt, { 
            systemInstruction: NEXUS_SYSTEM_INSTRUCTION,
            temperature: 0.3 
        });
        console.log("User:", salesPrompt);
        console.log("AI:", salesResponse);

        console.log("\n--- TESTING AI GENIUS (TECH) ---");
        const techPrompt = "Máy anh bị vỡ màn hình iPhone 16, sửa hết bao nhiêu tiền và bao lâu xong?";
        const techResponse = await generateText(techPrompt, { 
            systemInstruction: NEXUS_EXPERT_SUPPORT_INSTRUCTION,
            temperature: 0.3
        });
        console.log("User:", techPrompt);
        console.log("AI:", techResponse);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
