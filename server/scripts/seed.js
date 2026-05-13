// server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Marketing = require('./models/Marketing');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Marketing.deleteMany({});

        // 1. Seed Danh mục
        const cat = await Category.create({ name: 'Điện thoại', slug: 'dien-thoai', level: 0 });

        // 2. Seed Sản phẩm
        await Product.create({
            name: 'iPhone 15 Pro',
            slug: 'iphone-15-pro',
            sku: 'IP15P-001',
            category: cat._id,
            price: 25000000,
            stock: 50
        });

        // 3. Seed Banner (Marketing)
        await Marketing.create({
            name: 'Khuyến mãi mùa đông',
            type: 'hero',
            media: {
                kind: 'image',
                url: '/uploads/images-1767422128912-50486164.jpg',
                altText: 'Khuyến mãi mùa đông'
            },
            position: 'home-top',
            content: {
                title: 'Khuyến mãi mùa đông',
                subtitle: 'Giảm giá cực sốc',
                ctaText: 'Mua ngay'
            },
            status: 'active'
        });

        console.log("✅ Seed dữ liệu thành công!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();