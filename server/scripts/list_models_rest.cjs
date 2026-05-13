const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function listModelsRest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await axios.get(url);
        console.log("--- AVAILABLE MODELS ---");
        response.data.models.forEach(model => {
            console.log(`${model.name} (${model.displayName})`);
        });
    } catch (error) {
        console.error("Error listing models:", error.response?.data || error.message);
    }
}

listModelsRest();
