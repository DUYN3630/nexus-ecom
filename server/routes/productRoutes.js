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
  // Name (String)
  body('name').trim().notEmpty().withMessage('Tên sản phẩm không được để trống'),
  // SKU (String, optional)
  body('sku').optional({ checkFalsy: true }).trim(),
  // Price (Number, required)
  body('price').notEmpty().withMessage('Giá không được để trống').toFloat(),
  // Discount Price (Number, optional)
  body('discountPrice').optional({ checkFalsy: true }).toFloat(),
  // Stock (Integer, optional)
  body('stock').optional({ checkFalsy: true }).toInt(),
  // Category (ObjectID, required)
  body('category').notEmpty().withMessage('Danh mục không được để trống'),
  // Description (String, optional)
  body('description').optional({ checkFalsy: true }).trim(),
  // Status (Enum, optional, default: 'draft')
  body('status').optional().isIn(['active', 'archived', 'draft']).withMessage('Trạng thái không hợp lệ'),
  // isFeatured (Boolean, optional)
  body('isFeatured').optional().toBoolean()
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
