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

    // Chuẩn hóa modelName để hỗ trợ các phiên bản mới (2.0, 2.5, ...)
    let rawModelName = (optionsModelName || "gemini-flash-latest").toString().toLowerCase().trim();
    let finalModelName = rawModelName;
    
    // Logic chuẩn hóa thông minh: Nếu thiếu dấu gạch ngang giữa các phần thì tự động thêm
    // Ví dụ: gemini2.0flash -> gemini-2.0-flash
    if (!finalModelName.includes('-')) {
        if (finalModelName.startsWith('gemini')) {
            const versionMatch = finalModelName.match(/gemini(\d+\.?\d*)(flash|pro)/);
            if (versionMatch) {
                finalModelName = `gemini-${versionMatch[1]}-${versionMatch[2]}`;
            }
        }
    }
    
    // Nếu vẫn là các bản cũ 1.5 mà hệ thống không hỗ trợ nữa, tự động nâng cấp lên 2.0
    if (finalModelName.includes('1.5')) {
        console.log(`[INFO] Upgrading deprecated model ${finalModelName} to gemini-2.0-flash`);
        finalModelName = finalModelName.replace('1.5', '2.0');
    }
    
    console.log(`--- [DEBUG] Final Model Name Sent to Google: "${finalModelName}" (Original: "${rawModelName}") ---`);

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
        console.error("--- [ERROR] Gemini API Utility:", error.message);
        
        // Trả về thông báo lỗi thân thiện thay vì ném lỗi để tránh 500 error
        if (error.message.includes("429") || error.message.includes("quota")) {
            const waitTimeMatch = error.message.match(/retry in ([\d.]+)s/);
            const waitTime = waitTimeMatch ? Math.ceil(parseFloat(waitTimeMatch[1])) : 60;
            return `Dạ, hiện tại em đã hết lượt hỗ trợ miễn phí trong phút này. Anh/Chị vui lòng đợi khoảng ${waitTime} giây nữa rồi nhắn lại cho em nhé!`;
        }

        // Lỗi 404 thường do finalModelName không đúng
        if (error.message.includes("404") || error.message.includes("not found")) {
            console.warn(`[WARN] Model "${finalModelName}" not found. Attempting fallback to gemini-flash-latest...`);
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                
                const result = await fallbackModel.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                
                const response = await result.response;
                return response.text();
            } catch (fallbackError) {
                console.error("--- [ERROR] Fallback Failed ---");
                return `Dạ, hệ thống AI đang gặp sự cố cấu hình (Lỗi: ${fallbackError.message}). Anh/Chị vui lòng kiểm tra lại GEMINI_API_KEY hoặc thử lại sau nhé!`;
            }
        }

        if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("Service Unavailable")) {
            return "Dạ, hiện tại hệ thống đang hơi quá tải. Anh/Chị vui lòng thử lại sau vài giây nhé!";
        }
        
        console.error("--- [ERROR] Final Catch-all Gemini Error ---");
        console.error(error);
        return `Dạ, em gặp lỗi: ${error.message}. Anh/Chị hãy thử hỏi lại nhé!`;
    }
};

module.exports = { generateText };
