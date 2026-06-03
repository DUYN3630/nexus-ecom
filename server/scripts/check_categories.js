const mongoose = require('mongoose');
const Category = require('../models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const categories = await Category.find({ slug: { $in: ['mac', 'ipad', 'watch'] } });
    
    console.log('--- Category Data ---');
    categories.forEach(cat => {
      console.log(`Slug: ${cat.slug}`);
      console.log(`Name: ${cat.name}`);
      console.log(`Description: "${cat.description}"`);
      console.log(`ShowInExplore: ${cat.showInExplore}`);
      console.log(`Status: ${cat.status}`);
      console.log('--------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkCategories();
