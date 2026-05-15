import axiosClient from './axiosClient';

// 1. Named export cho các Component cũ (như AiChatbox.jsx ở trang chủ)
export const runChat = async (prompt) => {
  try {
    const response = await axiosClient.post('/ai/chat', { prompt });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

// 2. Default export với đầy đủ tính năng cho AI Hub/Expert Page
const geminiApi = {
  runChat,
  /**
   * @param {string} prompt - Tin nhắn của user
   * @param {Object} options - Các tùy chọn
   * @param {string} [options.image] - Chuỗi base64 của ảnh
   * @param {string} [options.customInstruction] - Tên instruction đặc biệt (VD: 'NEXUS_EXPERT_SUPPORT_INSTRUCTION')
   * @param {string} [options.systemInstruction] - System instruction tùy chỉnh
   * @param {string} [options.userId] - ID user đã đăng nhập
   * @param {string} [options.sessionId] - Session ID cho khách vãng lai
   * @param {string} [options.modelName] - Tên model Gemini
   * @param {number} [options.temperature] - Nhiệt độ (0-2)
   * @param {number} [options.maxOutputTokens] - Giới hạn tokens
   */
  chatWithAi: async (prompt, options = {}) => {
    try {
      const response = await axiosClient.post('/ai/chat', { 
        prompt,
        image: options.image || null,
        customInstruction: options.customInstruction || null,
        systemInstruction: options.systemInstruction || null,
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        modelName: options.modelName || null,
        temperature: options.temperature || null,
        maxOutputTokens: options.maxOutputTokens || null,
      });
      return response; 
    } catch (error) {
      console.error("Gemini Advanced Error:", error);
      throw error;
    }
  }
};

export default geminiApi;

