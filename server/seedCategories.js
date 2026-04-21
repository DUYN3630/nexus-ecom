require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Category = require('./models/Category.js');

// Dữ liệu danh mục gốc để thêm vào database
const categoriesToSeed = [
  {
    name: "iPhone",
    slug: "iphone",
    parentId: null,
    level: 0,
    status: "active",
    order: 1,
    description: "Các dòng điện thoại iPhone chính hãng từ Apple.",
    seo: { metaTitle: "iPhone Chính Hãng", metaDescription: "Mua các dòng iPhone mới nhất với giá tốt nhất." }
  },
  {
    name: "Mac",
    slug: "mac",
    parentId: null,
    level: 0,
    status: "active",
    order: 2,
    description: "Máy tính Mac mạnh mẽ cho công việc và sáng tạo.",
    seo: { metaTitle: "MacBook & iMac", metaDescription: "Khám phá thế giới máy tính Mac." }
  },
  {
    name: "iPad",
    slug: "ipad",
    parentId: null,
    level: 0,
    status: "active",
    order: 3,
    description: "iPad cho học tập, làm việc và giải trí.",
    seo: { metaTitle: "iPad Chính Hãng", metaDescription: "iPad Pro, Air, Mini cho mọi nhu cầu." }
  },
  {
    name: "Watch",
    slug: "watch",
    parentId: null,
    level: 0,
    status: "active",
    order: 4,
    description: "Đồng hồ thông minh Apple Watch.",
    seo: { metaTitle: "Apple Watch", metaDescription: "Theo dõi sức khỏe và kết nối mọi lúc mọi nơi." }
  },
  {
    name: "TV & Giải trí",
    slug: "tv-giai-tri",
    parentId: null,
    level: 0,
    status: "active",
    order: 5,
    description: "Thiết bị giải trí tại gia từ Apple.",
    seo: { metaTitle: "Apple TV & Home", metaDescription: "Nâng tầm không gian giải trí của bạn." }
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien",
    parentId: null,
    level: 0,
    status: "active",
    order: 6,
    description: "Phụ kiện chính hãng cho các sản phẩm Apple.",
    seo: { metaTitle: "Phụ Kiện Apple", metaDescription: "Sạc, cáp, ốp lưng và nhiều hơn thế nữa." }
  }
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Biến môi trường MONGODB_URI chưa được thiết lập.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối đến MongoDB để seeding...");

    // Xóa dữ liệu cũ
    await Category.deleteMany({});
    console.log("🔥 Đã xóa các danh mục cũ.");

    // Thêm dữ liệu mới
    await Category.insertMany(categoriesToSeed);
    console.log("🌱 Đã thêm thành công dữ liệu danh mục mới.");

  } catch (error) {
    console.error("❌ Lỗi khi thực hiện seeding:", error.message);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔚 Đã đóng kết nối database.");
  }
};

// Chạy hàm seed
seedDatabase();