const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Setting = require('./models/Setting');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const settings = await Setting.find({ key: /ai_/ });
    console.log('\n--- AI Settings in DB ---');
    settings.forEach(s => {
        console.log(`${s.key}: "${s.value}"`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkSettings();
