const { validationResult } = require('express-validator');

/**
 * Middleware xử lý validation errors từ express-validator.
 * Đặt sau các validation rules trong route chain.
 * 
 * Ví dụ:
 *   router.post('/login', [
 *     body('email').isEmail(),
 *     body('password').notEmpty(),
 *   ], validate, loginController);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = validate;
