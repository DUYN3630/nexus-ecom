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
        modelName: optionsModelName,
        image = null // base64 string
    } = options;

    // Chuẩn hóa modelName
    let finalModelName = (optionsModelName || "gemini-flash-latest").toString().toLowerCase().trim();
    
    // Nếu có ảnh, bắt buộc dùng model có khả năng vision (như gemini-1.5-flash hoặc gemini-1.5-pro)
    // Để an toàn, có thể dùng gemini-1.5-flash
    if (image && finalModelName === "gemini-pro") {
        finalModelName = "gemini-1.5-flash";
    }

    console.log(`--- [DEBUG] Final Model Name Sent to Google: "${finalModelName}" ---`);

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
            // Giả định image là chuỗi base64 đã bỏ phần header 'data:image/...;base64,'
            // Nếu frontend gửi kèm header thì cần tách ra.
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
