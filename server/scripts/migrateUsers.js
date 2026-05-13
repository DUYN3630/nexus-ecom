const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, './.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DEFAULT_PASSWORD = 'Asky2605.';

async function migrateUsers() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in server/.env file.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Starting user migration...');
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found to migrate.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    let updatedCount = 0;
    for (const user of users) {
      // We can simply update all users. 
      // If the password is the same, the hash will be different due to salt,
      // but it ensures all old, unhashed passwords are fixed.
      user.password = hashedPassword;
      await user.save(); // Using .save() to ensure 'pre' hooks are triggered
      updatedCount++;
      console.log(`Updated password for user: ${user.email}`);
    }

    console.log('-------------------------------------------');
    console.log(`Migration complete. ${updatedCount} user(s) updated.`);
    console.log(`All updated users can now log in with the password: ${DEFAULT_PASSWORD}`);
    console.log('-------------------------------------------');

  } catch (error) {
    console.error('Error during user migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

migrateUsers();
