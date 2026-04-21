const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * An optional authentication middleware.
 * If a valid JWT is provided, it attaches the user object to the request (req.user).
 * If no token is provided or the token is invalid, it simply calls next() without
 * attaching a user, allowing the request to proceed for anonymous users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');

    if (header) {
      const token = header.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });
        
        if (user) {
          // Attach user to the request if found
          req.user = user;
        }
      }
    }
  } catch (error) {
    // If any error occurs (e.g., invalid token), we just ignore it
    // and proceed without an authenticated user.
    // console.log('Optional auth warning:', error.message);
  }
  
  // Always proceed to the next middleware
  next();
};

module.exports = optionalAuth;
