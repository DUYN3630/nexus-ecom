const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testRest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];
    const versions = ['v1', 'v1beta'];

    for (const model of models) {
        for (const version of versions) {
            console.log(`--- Testing ${model} on ${version} ---`);
            try {
                const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: "Hi" }] }]
                });
                console.log(`✅ Success! Response: ${response.data.candidates[0].content.parts[0].text}`);
                return; // Stop if we find a working one
            } catch (error) {
                console.log(`❌ Failed: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
            }
        }
    }
}

testRest();
