const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Define models manually
const UserSchema = new mongoose.Schema({
  name: String,
  role: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ExpertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  role: String,
});
const Expert = mongoose.models.Expert || mongoose.model('Expert', ExpertSchema);

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- [FIX] Updating User roles to Expert for all Expert profiles ---');
    
    const experts = await Expert.find().populate('user');
    
    for (const expert of experts) {
      if (expert.user) {
        const user = await User.findById(expert.user._id);
        if (user && user.role !== 'Expert') {
          console.log(`Updating user ${user.name} role from ${user.role} to Expert...`);
          user.role = 'Expert';
          await user.save();
        }
      }
    }

    console.log('✅ Done fixing roles.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
fix();
