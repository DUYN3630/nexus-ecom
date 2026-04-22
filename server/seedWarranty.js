require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Warranty = require('./models/Warranty');

const seedWarranty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding warranty data...");

    await Warranty.deleteMany({});

    const warranties = [
      {
        serialNumber: "NEXUS12345",
        deviceName: "iPhone 15 Pro Max - Titan Tự Nhiên",
        modelCode: "A3106",
        purchaseDate: new Date('2023-12-01'),
        expiryDate: new Date('2024-12-01'),
        status: "active",
        customerName: "Nguyễn Văn A"
      },
      {
        serialNumber: "APPLE99999",
        deviceName: "MacBook Pro 14 M3 Max",
        modelCode: "A2992",
        purchaseDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'), // Bảo hành 2 năm
        status: "active",
        customerName: "Trần Thị B"
      },
      {
        serialNumber: "IPAD88888",
        deviceName: "iPad Pro 11-inch (M2)",
        modelCode: "A2435",
        purchaseDate: new Date('2022-05-10'),
        expiryDate: new Date('2023-05-10'),
        status: "expired",
        customerName: "Lê Văn C"
      }
    ];

    await Warranty.insertMany(warranties);
    console.log("✅ Seeded 3 warranty records successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedWarranty();
