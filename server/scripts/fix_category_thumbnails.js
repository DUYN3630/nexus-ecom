const mongoose = require('mongoose');
const Category = require('../models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixCategoryThumbnails = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const updates = [
      { slug: 'mac', thumbnail: '/products/macbookprom4.jpg', productThumbnail: '/products/macbookprom4.jpg' },
      { slug: 'ipad', thumbnail: '/products/ipadpro.jpg', productThumbnail: '/products/ipadpro.jpg' },
      { slug: 'iphone', thumbnail: '/products/iphone-16-pro-max_1.webp', productThumbnail: '/products/iphone-16-pro-max_1.webp' },
      { slug: 'watch', thumbnail: '/products/watchpro.jpg', productThumbnail: '/products/watchpro.jpg' },
      { slug: 'tv-giai-tri', thumbnail: '/products/tvapple.jpg', productThumbnail: '/products/tvapple.jpg' },
      { slug: 'phu-kien', thumbnail: '/products/MagSafe.jpg', productThumbnail: '/products/MagSafe.jpg' }
    ];

    for (const item of updates) {
      const result = await Category.findOneAndUpdate(
        { slug: item.slug },
        { 
          thumbnail: item.thumbnail,
          productThumbnail: item.productThumbnail,
          showInExplore: true,
          status: 'active'
        },
        { new: true }
      );
      if (result) {
        console.log(`✅ Updated thumbnail for ${item.slug}`);
      } else {
        console.log(`⚠️ Category not found: ${item.slug}`);
      }
    }

    console.log('🎉 Category thumbnails fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixCategoryThumbnails();
