const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Part = require('../models/Part');

const partsData = [
  // SCREENS
  {
    name: "Màn hình iPhone 15 Pro Max (Zin)",
    sku: "SCR-I15PM-ZIN",
    category: "Screen",
    stock: 15,
    price: 8500000,
    compatibleDevices: ["iPhone 15 Pro Max"],
    description: "Màn hình OLED chính hãng bóc máy, chất lượng hiển thị hoàn hảo."
  },
  {
    name: "Màn hình iPhone 14 Pro (Linh kiện)",
    sku: "SCR-I14P-LK",
    category: "Screen",
    stock: 20,
    price: 4500000,
    compatibleDevices: ["iPhone 14 Pro"],
    description: "Màn hình linh kiện loại 1, màu sắc 9/10 so với zin."
  },
  {
    name: "Màn hình iPhone 13 (Zin)",
    sku: "SCR-I13-ZIN",
    category: "Screen",
    stock: 25,
    price: 3800000,
    compatibleDevices: ["iPhone 13"],
    description: "Màn hình zin New chính hãng."
  },

  // BATTERIES
  {
    name: "Pin iPhone 15 Pro Max (Dung lượng chuẩn)",
    sku: "BAT-I15PM-STD",
    category: "Battery",
    stock: 50,
    price: 1800000,
    compatibleDevices: ["iPhone 15 Pro Max"],
    description: "Pin chuẩn Apple, hỗ trợ hiển thị % pin và bảo trì."
  },
  {
    name: "Pin iPhone 13 Pro (Pisen)",
    sku: "BAT-I13P-PISEN",
    category: "Battery",
    stock: 40,
    price: 950000,
    compatibleDevices: ["iPhone 13 Pro"],
    description: "Pin thương hiệu Pisen chất lượng cao, bảo hành 12 tháng."
  },
  {
    name: "Pin iPhone 11 (Dung lượng cao)",
    sku: "BAT-I11-MAX",
    category: "Battery",
    stock: 100,
    price: 750000,
    compatibleDevices: ["iPhone 11"],
    description: "Pin dung lượng cao hơn 20% so với pin zin."
  },

  // CAMERAS
  {
    name: "Cụm Camera sau iPhone 14 Pro Max",
    sku: "CAM-I14PM-BACK",
    category: "Camera",
    stock: 10,
    price: 3200000,
    compatibleDevices: ["iPhone 14 Pro Max"],
    description: "Cụm 3 camera sau zin bóc máy."
  },
  {
    name: "Camera trước iPhone 12 (FaceID)",
    sku: "CAM-I12-FRONT",
    category: "Camera",
    stock: 15,
    price: 1200000,
    compatibleDevices: ["iPhone 12", "iPhone 12 Pro"],
    description: "Cụm camera trước kèm cảm biến FaceID."
  },

  // SPEAKERS
  {
    name: "Loa trong iPhone 13 Series",
    sku: "SPK-I13-INTERNAL",
    category: "Speaker",
    stock: 30,
    price: 450000,
    compatibleDevices: ["iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max"],
    description: "Loa thoại zin."
  },

  // HOUSING
  {
    name: "Vỏ iPhone 15 Pro Max (Titan Tự Nhiên)",
    sku: "HOU-I15PM-NAT",
    category: "Housing",
    stock: 8,
    price: 2500000,
    compatibleDevices: ["iPhone 15 Pro Max"],
    description: "Bộ vỏ khung sườn Titan tự nhiên zin bóc máy."
  }
];

async function seedParts() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding parts...');

    // Clear existing parts
    await Part.deleteMany({});
    console.log('🗑️  Cleared existing parts inventory.');

    // Insert new data
    await Part.insertMany(partsData);
    console.log(`🚀 Successfully seeded ${partsData.length} parts into inventory!`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed.');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedParts();
