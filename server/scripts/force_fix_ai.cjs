const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Setting = require('./models/Setting');

async function forceFix() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI ? "URI found" : "URI NOT FOUND");
        await mongoose.connect(process.env.MONGODB_URI);
        
        const result = await Setting.findOneAndUpdate(
            { key: 'ai_model_name' },
            { value: 'gemini-2.0-flash' },
            { upsert: true, new: true }
        );
        
        console.log("✅ Successfully updated ai_model_name to:", result.value);
        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Force fix failed:", error);
    }
}

forceFix();
