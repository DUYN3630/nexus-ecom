const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixImagePaths = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products. Checking image paths...`);

    let updatedCount = 0;

    for (const product of products) {
        let changed = false;
        
        // Fix images array
        if (product.images && product.images.length > 0) {
            product.images = product.images.map(img => {
                if (typeof img === 'string' && (img.startsWith('images-') || img.startsWith('newImages-') || img.startsWith('banner-'))) {
                    changed = true;
                    return `/uploads/${img}`;
                }
                return img;
            });
        }

        // Fix mainImage
        if (product.mainImage && (product.mainImage.startsWith('images-') || product.mainImage.startsWith('newImages-') || product.mainImage.startsWith('banner-'))) {
            product.mainImage = `/uploads/${product.mainImage}`;
            changed = true;
        }

        if (changed) {
            await product.save();
            updatedCount++;
            console.log(`- Updated paths for: ${product.name}`);
        }
    }

    console.log(`🎉 Finished! Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixImagePaths();
