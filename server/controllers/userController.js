const User = require('../models/User');

const Expert = require('../models/Expert');

/**
 * @desc    Lấy danh sách người dùng với Tìm kiếm & Lọc
 */
exports.getUsers = async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 10 } = req.query;
        let query = { deletedAt: null };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Lấy danh sách kèm phân trang
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password');

        const total = await User.countDocuments(query);

        // Thống kê nhanh (KPIs)
        const stats = {
            totalUsers: await User.countDocuments({ deletedAt: null }),
            activeUsers: await User.countDocuments({ status: 'active', deletedAt: null }),
            suspendedUsers: await User.countDocuments({ status: 'suspended', deletedAt: null }),
            newToday: await User.countDocuments({ 
                createdAt: { $gte: new Date().setHours(0,0,0,0) },
                deletedAt: null 
            })
        };
        
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Cập nhật Trạng thái & Vai trò người dùng
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { role, status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        const oldRole = user.role;
        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();

        // Nếu nâng cấp lên Expert và chưa có hồ sơ
        if (role === 'Expert' && oldRole !== 'Expert') {
            const expertExists = await Expert.findOne({ user: user._id });
            if (!expertExists) {
                const employeeId = `NX-${Math.floor(1000 + Math.random() * 9000)}`;
                await Expert.create({
                    user: user._id,
                    employeeId,
                    name: user.name,
                    role: 'Apple Certified Technician',
                    status: 'active'
                });
            }
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Tạo người dùng mới (Dành cho Admin)
 */
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        // Kiểm tra email trùng
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Customer',
            status: status || 'active'
        });

        // Nếu là Expert, tự động tạo hồ sơ Expert
        if (user.role === 'Expert') {
            const employeeId = `NX-${Math.floor(1000 + Math.random() * 9000)}`;
            await Expert.create({
                user: user._id,
                employeeId,
                name: user.name,
                role: 'Apple Certified Technician',
                status: 'active'
            });
        }

        res.status(201).json({
            success: true,
            message: "Đã tạo tài khoản thành công",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const TrackingEvent = require('../models/TrackingEvent');

/**
 * @desc    Lấy nhật ký hoạt động của một người dùng
 */
exports.getUserActivityLogs = async (req, res) => {
    try {
        const logs = await TrackingEvent.find({ userId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Admin reset mật khẩu cho người dùng
 */
exports.adminResetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        user.password = newPassword; // Middleware pre-save sẽ tự động hash
        await user.save();

        res.status(200).json({ success: true, message: "Đã đặt lại mật khẩu thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Xóa mềm người dùng
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy" });

        user.deletedAt = new Date();
        await user.save();
        res.status(200).json({ success: true, message: "Đã xóa người dùng" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
