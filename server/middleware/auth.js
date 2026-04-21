const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực Token (Protect)
const protect = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    const token = header?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy mã xác thực.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Xác thực thất bại.' });
  }
};

// Middleware kiểm tra quyền Admin (Chấp nhận cả admin và Admin)
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'Admin')) {
    next();
  } else {
    console.log("Quyền bị từ chối cho role:", req.user?.role); // DEBUG giúp bạn
    res.status(403).json({ message: 'Chỉ dành cho Quản trị viên.' });
  }
};

module.exports = { protect, admin };
