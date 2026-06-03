const mongoose = require('mongoose');
const Category = require('../models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixMacDescription = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Category.findOneAndUpdate(
      { slug: 'mac' },
      { description: 'Máy tính mạnh mẽ cho công việc và sáng tạo.' },
      { new: true }
    );

    if (result) {
      console.log('✅ Successfully updated Mac category description:', result.description);
    } else {
      console.log('⚠️ Could not find category with slug "mac"');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating Mac category:', error);
    process.exit(1);
  }
};

fixMacDescription();
