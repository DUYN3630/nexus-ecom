const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        // The new frontend handles filtering and hierarchy, so we send the raw flat list.
        const categories = await Category.find({});
        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get explore categories
// @route   GET /api/categories/explore
// @access  Public
exports.getExploreCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            status: 'active',
            showInExplore: true,
            deletedAt: null
        }).sort({ order: 1 }).lean(); // Use lean() for performance and easier manipulation

        // For each category, if it doesn't have a thumbnail, try to find the first product's image
        const enrichedCategories = await Promise.all(categories.map(async (cat) => {
            if (!cat.thumbnail || cat.thumbnail.includes('placeholder') || cat.thumbnail.includes('unsplash')) {
                const firstProduct = await Product.findOne({ category: cat._id, status: 'active' }).select('images');
                if (firstProduct && firstProduct.images && firstProduct.images.length > 0) {
                    return { ...cat, productThumbnail: firstProduct.images[0] };
                }
            }
            return cat;
        }));

        res.status(200).json({
            success: true,
            data: enrichedCategories,
        });
    } catch (error) {
        console.error("Error fetching explore categories:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(400).json({ success: false, message: 'Tạo danh mục thất bại', error: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(400).json({ success: false, message: 'Cập nhật danh mục thất bại', error: error.message });
    }
};

// @desc    Delete a category (Secure Delete)
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findById(id);
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }

        // 1. Kiểm tra danh mục con (Dependency: Children)
        const childCount = await Category.countDocuments({ parentId: id, deletedAt: null });
        if (childCount > 0) {
            return res.status(400).json({ 
                success: false, 
                code: 'HAS_CHILDREN',
                message: `Không thể xóa: Danh mục này đang chứa ${childCount} danh mục con. Vui lòng xóa hoặc di chuyển chúng trước.` 
            });
        }

        // 2. Kiểm tra sản phẩm (Dependency: Products)
        const productCount = await Product.countDocuments({ category: id });
        if (productCount > 0) {
            return res.status(400).json({ 
                success: false, 
                code: 'HAS_PRODUCTS',
                message: `Không thể xóa: Đang có ${productCount} sản phẩm thuộc danh mục này. Hãy cân nhắc "Ẩn" danh mục thay vì xóa.` 
            });
        }

        // 3. Kiểm tra hiển thị trang chủ (Safety: Frontend)
        if (category.showInExplore) {
            return res.status(400).json({ 
                success: false, 
                code: 'IS_EXPLORE',
                message: 'Không thể xóa: Danh mục đang hiển thị ở mục "Khám phá" ngoài trang chủ. Hãy tắt hiển thị trước khi xóa.' 
            });
        }

        // Nếu AN TOÀN -> Xóa cứng (Hard Delete) để sạch dữ liệu
        await Category.findByIdAndDelete(id);
        
        res.status(200).json({ success: true, message: 'Đã xóa vĩnh viễn danh mục (Safe Delete).' });

    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa danh mục', error: error.message });
    }
};