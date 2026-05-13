const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * generateText - Gọi API Gemini dùng SDK chính thức của Google
 * @param {string} prompt 
 * @param {Object} options - Các tùy chọn cấu hình
 */
const generateText = async (prompt, options = {}) => {
    // Lấy modelName từ options hoặc mặc định
    const { 
        systemInstruction = null, 
        temperature = 0.7, 
        maxOutputTokens = 1000,
        modelName: optionsModelName 
    } = options;

    // Chuẩn hóa modelName
    let finalModelName = (optionsModelName || "gemini-flash-latest").toString().toLowerCase().trim();
    
    console.log(`--- [DEBUG] Final Model Name Sent to Google: "${finalModelName}" ---`);

    try {
        if (!prompt) {
            throw new Error("Prompt is required for Gemini API call.");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set on the server.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        const model = genAI.getGenerativeModel({
            model: finalModelName,
            systemInstruction: systemInstruction,
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: maxOutputTokens,
                temperature: temperature,
            }
        });

        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("--- [ERROR] Gemini API Utility Detail ---");
        console.error("Model:", finalModelName);
        console.error("Error Message:", error.message);
        if (error.stack) console.error("Stack:", error.stack);
        
        // Trả về thông báo lỗi thân thiện
        if (error.message.includes("429") || error.message.includes("quota")) {
            return `Dạ, hiện tại em đã hết lượt hỗ trợ miễn phí. Anh/Chị vui lòng đợi một chút rồi nhắn lại nhé!`;
        }

        if (error.message.includes("404") || error.message.includes("not found")) {
            return `Dạ, model "${finalModelName}" không tìm thấy hoặc chưa được hỗ trợ trên tài khoản này.`;
        }

        return `Dạ, em gặp lỗi hệ thống: ${error.message}. Anh/Chị thử lại sau nhé!`;
    }
};

module.exports = { generateText };
