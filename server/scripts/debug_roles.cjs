const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Define models manually to avoid path issues
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

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- [DEBUG] Checking Expert and User roles ---');
    
    const experts = await Expert.find().populate('user');
    console.log(`Found ${experts.length} experts in total.`);
    
    experts.forEach(e => {
      console.log(`Expert: ${e.name}`);
      console.log(`- Linked User ID: ${e.user?._id}`);
      console.log(`- User Name: ${e.user?.name}`);
      console.log(`- User Role: ${e.user?.role}`);
      console.log('-------------------');
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
debug();
