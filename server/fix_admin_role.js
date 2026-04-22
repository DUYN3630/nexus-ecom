require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const fixAdminRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    const email = 'admin123@gmail.com';
    const result = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log(`✅ SUCCESS: User ${email} is now an ADMIN.`);
      console.log("Current data:", result);
    } else {
      console.log(`❌ ERROR: User with email ${email} not found.`);
    }

    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixAdminRole();
