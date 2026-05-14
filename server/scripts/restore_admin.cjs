const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const restore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'admin123@gmail.com' });
    if (user) {
      console.log(`Restoring ${user.email} to Admin role...`);
      user.role = 'Admin';
      await user.save();
      console.log('✅ Restored.');
    } else {
      console.log('User not found.');
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
restore();
