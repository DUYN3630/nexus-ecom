const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  role: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ExpertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: { type: String, unique: true },
  name: String,
  role: { type: String, default: 'Apple Certified Technician' },
  status: { type: String, default: 'active' }
});
const Expert = mongoose.models.Expert || mongoose.model('Expert', ExpertSchema);

const sync = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- [SYNC] Creating missing Expert profiles ---');
    
    const expertUsers = await User.find({ role: 'Expert' });
    console.log(`Found ${expertUsers.length} Expert users.`);

    for (const user of expertUsers) {
      const existingProfile = await Expert.findOne({ user: user._id });
      if (!existingProfile) {
        console.log(`Creating profile for: ${user.name}`);
        const employeeId = `NX-${Math.floor(1000 + Math.random() * 9000)}`;
        await Expert.create({
          user: user._id,
          employeeId,
          name: user.name,
          role: 'Apple Certified Technician',
          status: 'active'
        });
      } else {
        console.log(`Profile already exists for: ${user.name}`);
      }
    }

    console.log('✅ Sync completed.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
sync();
