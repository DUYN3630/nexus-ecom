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

// Middleware kiểm tra quyền Admin
const admin = (req, res, next) => {
  const role = (req.user?.role || '').trim().toLowerCase();
  
  if (role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Chỉ dành cho Quản trị viên.',
      debug_current_role: req.user?.role 
    });
  }
};

// Middleware kiểm tra quyền Admin hoặc Expert
const adminOrExpert = (req, res, next) => {
  const role = (req.user?.role || '').trim().toLowerCase();
  
  if (role === 'admin' || role === 'expert') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Chỉ dành cho Quản trị viên hoặc Chuyên gia.',
      debug_current_role: req.user?.role 
    });
  }
};

module.exports = { protect, admin, adminOrExpert };
