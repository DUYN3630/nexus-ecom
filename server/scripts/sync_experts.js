const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Expert = require('../models/Expert');

async function syncExperts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const staffUsers = await User.find({ role: { $in: ['Admin', 'Staff', 'admin', 'staff'] } });
        console.log(`Found ${staffUsers.length} staff users.`);

        for (let i = 0; i < staffUsers.length; i++) {
            const user = staffUsers[i];
            
            // Kiểm tra xem đã có Expert profile chưa
            const existingExpert = await Expert.findOne({ user: user._id });
            if (existingExpert) {
                console.log(`Expert profile already exists for ${user.email}`);
                continue;
            }

            // Tạo Expert profile mới
            const newExpert = new Expert({
                user: user._id,
                employeeId: `NX-00${i + 1}`,
                name: user.name || "Chuyên gia Nexus",
                role: 'Kỹ thuật viên Apple Certified',
                specialty: ['iPhone', 'MacBook', 'iPad'],
                experience: '5 năm kinh nghiệm',
                isOnline: true,
                status: 'active',
                bio: 'Chuyên gia hỗ trợ kỹ thuật tận tâm tại Nexus Store.'
            });

            await newExpert.save();
            console.log(`✅ Created Expert profile for: ${user.email}`);
        }

        console.log("🎉 Sync completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Sync failed:", error);
        process.exit(1);
    }
}

syncExperts();
