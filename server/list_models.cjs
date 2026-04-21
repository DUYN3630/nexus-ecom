const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("--- Đang liệt kê các model khả dụng cho API Key của bạn ---");
        // Lưu ý: ListModels đôi khi yêu cầu quyền đặc biệt hoặc version API khác
        // Nhưng chúng ta thử dùng fetch trực tiếp để liệt kê
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("Danh sách model:");
            data.models.forEach(m => console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log("Không tìm thấy danh sách model hoặc có lỗi:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Lỗi khi liệt kê model:", error.message);
    }
}

listModels();
