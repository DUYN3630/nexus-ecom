import axiosClient from './axiosClient';

// Named export for compatibility with AiChatbox.jsx
export const runChat = async (prompt) => {
  try {
    const response = await axiosClient.post('/ai/chat', { prompt });
    return response.text; // Return directly the text string
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

const geminiApi = {
  runChat,
  // New method with system instruction support
  chatWithAi: async (prompt, systemInstruction = null) => {
    try {
      const response = await axiosClient.post('/ai/chat', { 
        prompt, 
        systemInstruction 
      });
      return response; // Returns the whole data { text: '...' }
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
};

export default geminiApi;
