const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  role: String,
  email: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ExpertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
});
const Expert = mongoose.models.Expert || mongoose.model('Expert', ExpertSchema);

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('--- [STEP 1] All Users with role "Expert" ---');
    const expertUsers = await User.find({ role: 'Expert' });
    console.log(`Found ${expertUsers.length} users.`);
    expertUsers.forEach(u => console.log(`- ${u.name} (${u.email})`));

    console.log('\n--- [STEP 2] All Expert Profiles (Expert Model) ---');
    const expertProfiles = await Expert.find().populate('user');
    console.log(`Found ${expertProfiles.length} profiles.`);
    expertProfiles.forEach(p => {
      console.log(`- Profile Name: ${p.name}`);
      console.log(`  Linked User: ${p.user ? `${p.user.name} (${p.user.role})` : 'NULL'}`);
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
debug();
