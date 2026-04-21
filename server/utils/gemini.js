const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * generateText - Gọi API Gemini dùng SDK chính thức của Google
 * @param {string} prompt 
 * @param {Object} options - Các tùy chọn cấu hình
 */
const generateText = async (prompt, options = {}) => {
    const { 
        systemInstruction = null, 
        modelName = "gemini-flash-latest", 
        temperature = 0.7, 
        maxOutputTokens = 1000 
    } = options;

    try {
        if (!prompt) {
            throw new Error("Prompt is required for Gemini API call.");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set on the server.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Sử dụng modelName từ config, ưu tiên gemini-flash-latest nếu không có config
        const model = genAI.getGenerativeModel({
            model: modelName || "gemini-flash-latest",
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
        console.error("Internal error in generateText utility:", error.message);
        
        // Trả về thông báo lỗi thân thiện thay vì ném lỗi để tránh 500 error
        if (error.message.includes("429") || error.message.includes("quota")) {
            // Thử trích xuất thời gian chờ từ lỗi nếu có
            const waitTimeMatch = error.message.match(/retry in ([\d.]+)s/);
            const waitTime = waitTimeMatch ? Math.ceil(parseFloat(waitTimeMatch[1])) : 60;
            
            return `Dạ, hiện tại em đã hết lượt hỗ trợ miễn phí trong phút này. Anh/Chị vui lòng đợi khoảng ${waitTime} giây nữa rồi nhắn lại cho em nhé!`;
        }

        if (error.message.includes("404") || error.message.includes("not found")) {
            console.warn(`Model ${modelName} not found, attempting fallback to gemini-flash-latest`);
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const result = await fallbackModel.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (fallbackError) {
                return "Dạ, em đang gặp chút trục trặc về cấu hình AI. Anh/Chị thử lại sau nhé!";
            }
        }

        if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("Service Unavailable")) {
            return "Dạ, hiện tại hệ thống đang hơi quá tải. Anh/Chị vui lòng thử lại sau vài giây nhé!";
        }
        
        return "Dạ, em gặp lỗi nhỏ khi xử lý tin nhắn. Anh/Chị hãy thử hỏi lại câu khác nhé!";
    }
};

module.exports = { generateText };
