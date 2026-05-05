require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Expert = require('./models/Expert');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const experts = await Expert.find();
    console.log('--- [DEBUG] Experts in DB ---');
    console.log(JSON.stringify(experts, null, 2));
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
check();