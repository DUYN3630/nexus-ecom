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
  chatWithAi: async (prompt, systemInstruction = null, options = {}) => {
    try {
      const response = await axiosClient.post('/ai/chat', { 
        prompt, 
        systemInstruction,
        ...options 
      });
      return response; 
    } catch (error) {
      console.error("Gemini Advanced Error:", error);
      throw error;
    }
  }
};

export default geminiApi;
