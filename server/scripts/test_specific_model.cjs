const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSingleModel(modelName) {
    console.log(`--- Testing Model: ${modelName} ---`);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Ready'");
        const response = await result.response;
        console.log(`✅ Success: ${response.text()}`);
    } catch (err) {
        console.error(`❌ Failed [${modelName}]: ${err.message}`);
    }
}

async function run() {
    await testSingleModel("gemini-2.0-flash");
    await testSingleModel("gemini-2.0-flash-exp");
    await testSingleModel("gemini-1.5-flash");
    await testSingleModel("gemini-flash-latest");
}

run();
