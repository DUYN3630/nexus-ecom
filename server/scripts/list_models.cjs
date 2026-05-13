const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const result = await genAI.listModels();
    console.log("--- AVAILABLE MODELS ---");
    result.models.forEach(model => {
      console.log(`${model.name} (supports: ${model.supportedGenerationMethods})`);
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
