const mongoose = require('mongoose');
const Category = require('./models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedExplore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy 6 danh mục đang active để update
    const categories = await Category.find({ status: 'active', deletedAt: null }).limit(6);

    if (categories.length === 0) {
      console.log('⚠️ Không tìm thấy danh mục active nào.');
      return;
    }

    console.log(`Found ${categories.length} categories. Updating...`);

    for (const cat of categories) {
        cat.showInExplore = true;
        // Nếu chưa có ảnh thumbnail, gán ảnh placeholder đẹp để test
        if (!cat.thumbnail) {
            cat.thumbnail = "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600";
        }
        await cat.save();
        console.log(`- Updated: ${cat.name}`);
    }

    console.log('🎉 Xong! Section Khám phá đã có dữ liệu.');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedExplore();
