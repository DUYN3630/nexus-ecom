require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Expert = require('../models/Expert');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const seedExperts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding experts...");

    await Expert.deleteMany({}); // Xóa hồ sơ chuyên gia cũ
    // Lưu ý: Không xóa User để tránh mất dữ liệu khách hàng nếu có, 
    // nhưng ta sẽ tìm hoặc tạo mới user cho chuyên gia.

    const expertData = [
      {
        name: "Lê Minh Triết",
        email: "triet.le@nexusecom.vn",
        employeeId: "NX-EXP-001",
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
        email: "ha.nguyen@nexusecom.vn",
        employeeId: "NX-EXP-002",
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
        email: "nam.tran@nexusecom.vn",
        employeeId: "NX-EXP-003",
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

    for (const data of expertData) {
      // 1. Tìm hoặc tạo User cho Expert
      let user = await User.findOne({ email: data.email });
      
      if (!user) {
        user = new User({
          name: data.name,
          email: data.email,
          password: "Expert@123", // Mật khẩu mặc định
          role: "Expert",
          status: "active"
        });
        await user.save();
        console.log(`Created new User account for: ${data.name}`);
      }

      // 2. Tạo hồ sơ Expert gắn với User
      const newExpert = new Expert({
        user: user._id,
        employeeId: data.employeeId,
        name: data.name,
        role: data.role,
        specialty: data.specialty,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        experience: data.experience,
        location: data.location,
        isOnline: data.isOnline,
        bio: data.bio
      });

      await newExpert.save();
      console.log(`✅ Seeded Expert profile for: ${data.name}`);
    }

    console.log("-----------------------------------------");
    console.log("SUCCESS: All experts seeded successfully!");
    console.log("-----------------------------------------");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedExperts();
