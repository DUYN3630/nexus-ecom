const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { login, register, googleLogin, forgotPassword, resetPassword, phoneAuth } = require('../controllers/authController');

// --- Validation Rules ---
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống'),
];

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2 đến 50 ký tự'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải tối thiểu 6 ký tự'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Xác nhận mật khẩu không khớp');
      }
      return true;
    }),
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ'),
];

const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải tối thiểu 6 ký tự'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Xác nhận mật khẩu không khớp');
      }
      return true;
    }),
];

// --- Routes ---
router.post('/login', loginValidation, validate, login);
router.post('/google', googleLogin);
router.post('/phone-auth', phoneAuth);
router.post('/register', registerValidation, validate, register);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, resetPassword);

module.exports = router;
