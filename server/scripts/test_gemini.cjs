const path = require('path');
const dotenv = require('dotenv');

// Nạp file .env từ thư mục hiện tại (server)
dotenv.config({ path: path.join(__dirname, '.env') });

const { generateText } = require('./utils/gemini.js');

async function test() {
    try {
        console.log("--- Bắt đầu kiểm tra API Gemini ---");
        // Kiểm tra xem GEMINI_API_KEY có tồn tại trong process.env không
        if (!process.env.GEMINI_API_KEY) {
            console.error("Lỗi: GEMINI_API_KEY không có trong môi trường!");
            console.log("Dường như .env chưa được nạp hoặc không có key.");
            return;
        }
        
        console.log("Tìm thấy API Key, đang gửi yêu cầu thử...");
        const response = await generateText("Xin chào, bạn có khỏe không?");
        console.log("Kết quả phản hồi:", response);
        console.log("--- API hoạt động bình thường! ---");
    } catch (error) {
        console.error("--- Lỗi khi gọi API Gemini ---");
        console.error(error.message);
    }
}

test();
