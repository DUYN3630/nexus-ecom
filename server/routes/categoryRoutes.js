const express = require('express');
const router = express.Router();
const {
    getCategories,
    getExploreCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

// --- PUBLIC ROUTES ---
router.get('/explore', getExploreCategories);
router.get('/', getCategories);

// --- ADMIN ROUTES ---
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
