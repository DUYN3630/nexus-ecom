const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  role: String,
  email: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const checkAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await User.find({ role: { $regex: /admin/i } });
    console.log(`Found ${admins.length} admins.`);
    admins.forEach(a => console.log(`- ${a.email} (${a.role})`));
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
checkAdmins();
