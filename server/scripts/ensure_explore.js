const mongoose = require('mongoose');
const Category = require('../models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ensureExplore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const slugs = ['mac', 'ipad', 'watch'];
    const result = await Category.updateMany(
      { slug: { $in: slugs } },
      { $set: { showInExplore: true, status: 'active' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} categories for explore.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

ensureExplore();
