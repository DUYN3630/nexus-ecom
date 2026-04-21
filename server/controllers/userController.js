const User = require('../models/User');

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

        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();
        res.status(200).json({ success: true, data: user });
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
