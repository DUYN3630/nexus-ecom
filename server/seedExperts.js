require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Expert = require('./models/Expert');

const seedExperts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding experts...");

    await Expert.deleteMany({}); // Xóa cũ

    const experts = [
      {
        name: "Lê Minh Triết",
        role: "Senior iOS & Hardware Specialist",
        specialty: ["iPhone", "iPad", "Apple Watch"],
        rating: 4.9,
        reviewsCount: 128,
        experience: "7 years",
        location: "TP. Hồ Chí Minh",
        isOnline: true,
        bio: "Chuyên gia chẩn đoán các lỗi phần cứng phức tạp trên dòng iPhone mới nhất."
      },
      {
        name: "Nguyễn Thu Hà",
        role: "Mac OS & Software Engineer",
        specialty: ["MacBook", "iMac", "Software", "iCloud"],
        rating: 5.0,
        reviewsCount: 215,
        experience: "5 years",
        location: "Hà Nội",
        isOnline: true,
        bio: "Xử lý triệt để các vấn đề về hệ điều hành, bảo mật và đồng bộ dữ liệu."
      },
      {
        name: "Trần Hoàng Nam",
        role: "Apple Systems Architect",
        specialty: ["Mac Pro", "Enterprise", "Networking"],
        rating: 4.8,
        reviewsCount: 89,
        experience: "10 years",
        location: "Đà Nẵng",
        isOnline: false,
        bio: "Chuyên gia tư vấn giải pháp hệ thống cho doanh nghiệp sử dụng hệ sinh thái Apple."
      }
    ];

    await Expert.insertMany(experts);
    console.log("✅ Seeded 3 experts successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedExperts();
