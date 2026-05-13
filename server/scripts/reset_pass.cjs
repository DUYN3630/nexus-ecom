const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const MONGODB_URI = "mongodb+srv://myuser:Be7Ej9e6Hn2slVXd@cluster0.fjof68c.mongodb.net/nexus_db?retryWrites=true&w=majority";

const resetPassword = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Đã kết nối DB.");

        const email = "duyn09321@gmail.com";
        const newPasswordRaw = "123456";

        // Tự hash thủ công để chắc chắn 100% đúng
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPasswordRaw, salt);

        const result = await User.updateOne(
            { email: email }, 
            { $set: { password: hashedPassword } } // Cập nhật trực tiếp hash mới
        );

        if (result.matchedCount > 0) {
            console.log(`✅ Đã đổi mật khẩu thành công cho ${email}`);
            console.log(`🔑 Mật khẩu mới là: ${newPasswordRaw}`);
        } else {
            console.log("❌ Không tìm thấy user để update.");
        }

    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        await mongoose.disconnect();
    }
};

resetPassword();
