const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const MONGODB_URI = "mongodb+srv://myuser:Be7Ej9e6Hn2slVXd@cluster0.fjof68c.mongodb.net/nexus_db?retryWrites=true&w=majority";

const debugUser = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Đã kết nối DB để kiểm tra");

        const email = "duyn09321@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ Không tìm thấy user nào có email: ${email}`);
        } else {
            console.log(`\n--- THÔNG TIN USER: ${user.name} ---`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password trong DB (Hash): ${user.password}`);

            // 1. Kiểm tra xem có phải Hash hợp lệ không
            const isHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
            console.log(`\nKiểm tra định dạng Hash: ${isHash ? "✅ Hợp lệ (Bắt đầu bằng $2b$)" : "❌ KHÔNG PHẢI HASH (Có thể là plain text)"}`);

            // 2. Thử so sánh với các mật khẩu phổ biến
            const testPasss = ['123456', '12345678', 'password', 'admin123', 'Admin@123'];
            console.log("\n--- THỬ MỞ KHÓA (Test Match) ---");
            
            for (const pass of testPasss) {
                const match = await bcrypt.compare(pass, user.password);
                console.log(`Thử pass "${pass}": ${match ? "✅ KHỚP! (Đây là mật khẩu đúng)" : "❌ Không khớp"}`);
            }
        }

    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\nĐã ngắt kết nối.");
    }
};

debugUser();