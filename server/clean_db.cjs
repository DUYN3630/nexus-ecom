const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const Category = require('./models/Category');
const Marketing = require('./models/Marketing');

const cleanDatabase = async () => {
  try {
    console.log("🚀 Đang kết nối tới MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Kết nối thành công!");

    // 1. Dọn dẹp Products
    const products = await Product.find({});
    for (let p of products) {
      if (p.images) {
        p.images = p.images.map(img => typeof img === 'string' ? img.replace(/http:\/\/(127\.0\.0\.1|localhost):5000/g, '') : img);
        await p.save();
      }
    }
    // 2. Dọn dẹp Categories
    const categories = await Category.find({});
    for (let c of categories) {
      if (c.thumbnail && typeof c.thumbnail === 'string') {
        c.thumbnail = c.thumbnail.replace(/http:\/\/(127\.0\.0\.1|localhost):5000/g, '');
        await c.save();
      }
    }
    // 3. Dọn dẹp Marketing
    const banners = await Marketing.find({});
    for (let b of banners) {
      if (b.media?.url && typeof b.media.url === 'string') {
        b.media.url = b.media.url.replace(/http:\/\/(127\.0\.0\.1|localhost):5000/g, '');
        await b.save();
      }
    }

    console.log("✨ HOÀN THÀNH: DATABASE ĐÃ SẠCH LOCALHOST!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
};
cleanDatabase();
