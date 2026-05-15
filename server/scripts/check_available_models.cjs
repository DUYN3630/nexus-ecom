const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Lỗi: GEMINI_API_KEY chưa được thiết lập trong .env");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // SDK không có hàm trực tiếp để list models một cách đơn giản qua genAI object 
        // mà thường dùng qua client của Google AI.
        // Tuy nhiên ta có thể thử gọi một model phổ biến để test.
        
        console.log("--- Đang kiểm tra API Key và các model phổ biến ---");
        const modelsToTest = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // Thử generate một đoạn text cực ngắn để xem model có tồn tại/quyền truy cập không
                const result = await model.generateContent("Hi");
                const response = await result.response;
                if (response.text()) {
                    console.log(`✅ Model [${modelName}]: KHẢ DỤNG`);
                }
            } catch (err) {
                console.log(`❌ Model [${modelName}]: KHÔNG KHẢ DỤNG (${err.message})`);
            }
        }

    } catch (error) {
        console.error("❌ Lỗi hệ thống:", error.message);
    }
}

listModels();
