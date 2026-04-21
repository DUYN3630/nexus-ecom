const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { getProducts, createProduct, updateProduct, deleteProduct, getProductBySlug, getRelatedProducts, getFeaturedProducts } = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }
});

const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
  body('price').notEmpty().withMessage('Giá không được để trống').isFloat({ min: 0 }),
  body('category').notEmpty().withMessage('Danh mục không được để trống'),
];

// --- Product Routes ---

// PUBLIC
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug); 
router.get('/:id/related', getRelatedProducts);

// ADMIN ONLY
router.post('/', protect, admin, upload.array('images', 10), createProductValidation, validate, createProduct);
router.put('/:id', protect, admin, upload.array('newImages', 10), validate, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
