const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Setting = require('./models/Setting');

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const settings = await Setting.find({ key: 'ai_model_name' });
        console.log("--- CURRENT DB SETTINGS ---");
        console.log(JSON.stringify(settings, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error("DB Error:", error);
    }
}

checkSettings();
