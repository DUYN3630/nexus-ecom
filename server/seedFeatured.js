const mongoose = require('mongoose');
const Product = require('./models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedFeatured = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Reset all featured first (optional, to clean up)
    // await Product.updateMany({}, { isFeatured: false });

    // 2. Find 4 active products to feature
    const products = await Product.find({ status: 'active' }).limit(4);

    if (products.length === 0) {
        console.log('⚠️ Không tìm thấy sản phẩm nào để set nổi bật!');
        process.exit();
    }

    // 3. Update them
    for (const p of products) {
        p.isFeatured = true;
        // Set random order
        p.featuredOrder = Math.floor(Math.random() * 10);
        await p.save();
        console.log(`🌟 Featured: ${p.name}`);
    }

    console.log('🎉 Xong! Đã có dữ liệu sản phẩm nổi bật thật.');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedFeatured();
