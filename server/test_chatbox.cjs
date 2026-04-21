const path = require('path');
const dotenv = require('dotenv');

// Nạp file .env từ thư mục hiện tại (server)
dotenv.config({ path: path.join(__dirname, '.env') });

const { generateText } = require('./utils/gemini.js');
const { NEXUS_SYSTEM_INSTRUCTION } = require('./config/aiPrompt.js');

async function testIntegrated() {
    try {
        console.log("--- Bắt đầu kiểm tra TÍCH HỢP CHATBOX ---");
        
        const testPrompts = [
            "Chào bạn, bạn là ai?",
            "Tôi muốn mua iPhone 16 Pro Max",
            "Bạn nghĩ sao về tình hình chính trị thế giới?"
        ];

        for (const prompt of testPrompts) {
            console.log(`\nNgười dùng: ${prompt}`);
            const response = await generateText(prompt, { systemInstruction: NEXUS_SYSTEM_INSTRUCTION });
            console.log(`Nexus AI: ${response}`);
        }

        console.log("\n--- Kiểm tra hoàn tất! ---");
    } catch (error) {
        console.error("--- Lỗi kiểm tra ---");
        console.error(error.message);
    }
}

testIntegrated();
