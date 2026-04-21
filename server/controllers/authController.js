const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const User = require('../models/User');

const normalizeRole = (role) => {
    if (!role) return 'Customer';
    const cleanRole = String(role).toLowerCase().trim();
    if (cleanRole === 'admin') return 'Admin';
    if (cleanRole === 'staff' || cleanRole === 'editor') return 'Staff';
    return 'Customer';
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: normalizeRole(user.role) },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    );
};

// --- Cấu hình Email Transporter ---
const createTransporter = () => {
    // Nếu có SMTP config trong .env → dùng
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    
    // Fallback: log ra console (cho development)
    return null;
};

// --- ĐĂNG KÝ ---
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ message: "Email đã tồn tại." });

        const newUser = new User({
            name,
            email,
            password,
            role: 'Customer',
            status: 'active'
        });

        await newUser.save();

        const token = generateToken(newUser);

        res.status(201).json({
            message: "Đăng ký thành công",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: normalizeRole(newUser.role)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- ĐĂNG NHẬP ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: "Email không tồn tại." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Mật khẩu sai." });

        await User.findByIdAndUpdate(user._id, {
            $set: { lastLoginAt: new Date(), lastLoginIp: req.ip }
        });

        const finalRole = normalizeRole(user.role);
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: finalRole
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- ĐĂNG NHẬP GOOGLE ---
exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body; // Đây là access_token từ frontend
        
        // Lấy thông tin user từ Google bằng access_token
        const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`);
        const { email, name, picture, sub: googleId } = googleRes.data;

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Nếu chưa có user -> Tạo mới
            // Mật khẩu ngẫu nhiên vì login bằng google không cần pass
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = new User({
                name,
                email: email.toLowerCase(),
                password: randomPassword,
                avatar: picture,
                googleId,
                role: 'Customer',
                status: 'active'
            });
            await user.save();
        } else {
            // Nếu đã có user -> Cập nhật thông tin nếu cần
            await User.findByIdAndUpdate(user._id, {
                $set: { 
                    lastLoginAt: new Date(), 
                    lastLoginIp: req.ip,
                    googleId: googleId // Liên kết googleId nếu trước đó chưa có
                }
            });
        }

        const finalRole = normalizeRole(user.role);
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: finalRole,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error('Google Login Error:', err.response?.data || err.message);
        res.status(500).json({ message: "Đăng nhập bằng Google thất bại." });
    }
};

// --- QUÊN MẬT KHẨU ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Không tiết lộ email có tồn tại hay không (bảo mật)
            return res.json({ 
                message: "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu." 
            });
        }

        // Tạo token ngẫu nhiên
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash token trước khi lưu vào DB (bảo mật)
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 phút
        await user.save({ validateBeforeSave: false });

        // Tạo reset URL (dùng raw token, không phải hashed)
        const frontendURL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
        const resetURL = `${frontendURL}/reset-password/${resetToken}`;

        // Gửi email
        const transporter = createTransporter();
        
        if (transporter) {
            const mailOptions = {
                from: process.env.SMTP_FROM || '"Nexus Store" <no-reply@nexus.com>',
                to: user.email,
                subject: 'Đặt lại mật khẩu - Nexus Store',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1a1a1a;">Đặt lại mật khẩu</h2>
                        <p>Xin chào <strong>${user.name}</strong>,</p>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tiếp tục:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetURL}" 
                               style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Đặt lại mật khẩu
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Link sẽ hết hạn sau <strong>30 phút</strong>.</p>
                        <p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="color: #999; font-size: 12px;">© 2026 Nexus Store. All rights reserved.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } else {
            // Development mode: log reset URL ra console
            console.log('\n========================================');
            console.log('📧 RESET PASSWORD (Dev Mode)');
            console.log('📧 Email:', user.email);
            console.log('📧 Reset URL:', resetURL);
            console.log('========================================\n');
        }

        res.json({ 
            message: "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu." 
        });
    } catch (err) {
        // Nếu có lỗi, xóa token đã lưu
        console.error('Forgot password error:', err);
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau." });
    }
};

const admin = require('firebase-admin');

// Khởi tạo Firebase Admin (Nếu bạn đã có file serviceAccountKey.json)
// Nếu chưa có file này, nó sẽ log lỗi nhưng vẫn chạy logic cơ bản
if (!admin.apps.length) {
    try {
        const serviceAccount = require("../config/firebaseServiceAccount.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin initialized");
    } catch (err) {
        console.warn("⚠️ Firebase Admin chưa được cấu hình. Chạy ở chế độ không xác thực token.");
    }
}

// ... (other functions)

// --- ĐĂNG NHẬP/ĐĂNG KÝ BẰNG SỐ ĐIỆN THOẠI ---
exports.phoneAuth = async (req, res) => {
    try {
        const { phone, name, idToken } = req.body;
        let verifiedPhone = phone;

        // Nếu có idToken và Firebase Admin đã được setup -> Xác thực token
        if (idToken && admin.apps.length) {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            verifiedPhone = decodedToken.phone_number;
        }

        if (!verifiedPhone) {
            return res.status(400).json({ message: "Xác thực số điện thoại thất bại." });
        }

        let user = await User.findOne({ phone: verifiedPhone });

        if (!user) {
            user = new User({
                name: name || `User ${verifiedPhone.slice(-4)}`,
                phone: verifiedPhone,
                role: 'Customer',
                status: 'active'
            });
            await user.save();
        } else if (name) {
            // Cập nhật tên nếu có truyền lên (cho user mới)
            user.name = name;
            await user.save();
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: normalizeRole(user.role)
            }
        });
    } catch (err) {
        console.error('Phone Auth Error:', err);
        res.status(500).json({ message: "Lỗi hệ thống khi xác thực SĐT." });
    }
};

// --- ĐẶT LẠI MẬT KHẨU ---
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash token từ URL để so sánh với DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() } // Chưa hết hạn
        });

        if (!user) {
            return res.status(400).json({ 
                message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." 
            });
        }

        // Cập nhật mật khẩu (pre-save middleware sẽ tự hash)
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau." });
    }
};
