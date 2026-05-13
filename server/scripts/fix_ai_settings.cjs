require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Setting = require('./models/Setting');

const fixSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const updateResults = await Setting.findOneAndUpdate(
            { key: 'ai_model_name' },
            { value: 'gemini-flash-latest' },
            { upsert: true, new: true }
        );
        console.log("Updated ai_model_name to gemini-flash-latest:", updateResults.value);

        // Ensure system instruction is also clean if it exists
        const systemInst = await Setting.findOne({ key: 'ai_system_instruction' });
        if (systemInst && systemInst.value.includes('Google')) {
            console.log("Cleaning system instruction...");
            systemInst.value = "Bạn là trợ lý ảo của Nexus Store. Hãy hỗ trợ khách hàng nhiệt tình.";
            await systemInst.save();
        }

        console.log("DB Settings Fixed!");
        process.exit(0);
    } catch (error) {
        console.error("Fix failed:", error);
        process.exit(1);
    }
};

fixSettings();