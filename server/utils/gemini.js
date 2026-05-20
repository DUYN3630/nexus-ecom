const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * generateText - Gọi API Gemini dùng SDK chính thức của Google với cơ chế Retry
 * @param {string} prompt 
 * @param {Object} options - Các tùy chọn cấu hình
 */
const generateText = async (prompt, options = {}, retryCount = 0) => {
    const MAX_RETRIES = 2; // Số lần thử lại tối đa
    
    // Lấy modelName từ options hoặc mặc định
    const { 
        systemInstruction = null, 
        temperature = 0.7, 
        maxOutputTokens = 1000,
        modelName: optionsModelName,
        image = null // base64 string
    } = options;

    // Chuẩn hóa modelName
    let finalModelName = (optionsModelName || "gemini-1.5-flash").toString().toLowerCase().trim();
    
    // Nếu có ảnh, bắt buộc dùng model có khả năng vision
    if (image && (finalModelName === "gemini-pro" || finalModelName === "gemini-flash-latest")) {
        finalModelName = "gemini-1.5-flash";
    }

    try {
        if (!prompt && !image) {
            throw new Error("Prompt or image is required for Gemini API call.");
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

        const parts = [];
        if (prompt) {
            parts.push({ text: prompt });
        }
        if (image) {
            let base64Data = image;
            let mimeType = "image/jpeg";
            if (image.includes("base64,")) {
                const partsArr = image.split("base64,");
                mimeType = partsArr[0].split(":")[1].split(";")[0];
                base64Data = partsArr[1];
            }
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: parts }],
            generationConfig: {
                maxOutputTokens: maxOutputTokens,
                temperature: temperature,
            }
        });

        const response = await result.response;
        return response.text();

    } catch (error) {
        // CƠ CHẾ RETRY CHO LỖI 503 (Service Unavailable)
        if (error.message.includes("503") && retryCount < MAX_RETRIES) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s...
            console.log(`--- [RETRY] Gemini API 503. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES}) ---`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateText(prompt, options, retryCount + 1);
        }

        console.error("--- [ERROR] Gemini API Utility Detail ---");
        console.error("Model:", finalModelName);
        console.error("Error Message:", error.message);
        
        // Trả về thông báo lỗi thân thiện cho người dùng
        if (error.message.includes("429") || error.message.includes("quota")) {
            return `Dạ, hiện tại AI đang bận vì quá tải lượt yêu cầu miễn phí. Anh/Chị vui lòng đợi khoảng 1 phút rồi thử lại nhé!`;
        }

        if (error.message.includes("503")) {
            return `Dạ, máy chủ AI của Google đang quá tải (High Demand). Em đã thử kết nối lại nhưng không được, Anh/Chị vui lòng nhắn lại sau giây lát nhé!`;
        }

        if (error.message.includes("404") || error.message.includes("not found")) {
            return `Dạ, hệ thống đang bảo trì mô hình trí tuệ nhân tạo này.`;
        }

        return `Dạ, AI của em đang gặp chút trục trặc: ${error.message}. Anh/Chị thử lại sau nhé!`;
    }
};

module.exports = { generateText };
