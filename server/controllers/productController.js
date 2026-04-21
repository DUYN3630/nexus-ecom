const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Fetch all products (with filtering, searching, and sorting)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, sort, status, storage, ram, page, limit } = req.query;
        
        let query = {};
        
        // --- XỬ LÝ TRẠNG THÁI (STATUS) ---
        // Nếu status là 'all' -> không thêm điều kiện lọc status (lấy hết)
        // Nếu có status cụ thể -> lọc theo status đó
        // Nếu không truyền status -> mặc định lấy 'active' (cho trang user)
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = 'active';
        }

        // Filter by Multiple Categories
        if (category) {
            const categories = category.split(',');
            const categoryDocs = await Category.find({ 
                $or: [
                    { slug: { $in: categories } },
                    { _id: { $in: categories.filter(id => mongoose.Types.ObjectId.isValid(id)) } }
                ]
            });
            query.category = { $in: categoryDocs.map(c => c._id) };
        }

        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Dynamic Specs Filtering (e.g., Storage, RAM)
        if (storage) {
            query['specifications.Storage'] = { $regex: storage, $options: 'i' };
        }
        if (ram) {
            query['specifications.RAM'] = { $regex: ram, $options: 'i' };
        }

        // Price Range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortQuery = { createdAt: -1 };
        if (sort === 'price_asc') sortQuery = { price: 1 };
        if (sort === 'price_desc') sortQuery = { price: -1 };
        if (sort === 'oldest') sortQuery = { createdAt: 1 };

        // --- PAGINATION ---
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category', 'name slug')
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(query)
        ]);

        res.status(200).json({
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        // req.body contains the text fields
        // req.files contains the uploaded image files (thanks to multer)
        let { name, sku, category, price, discountPrice, stock, description, specifications, status, isFeatured } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Bạn phải tải lên ít nhất một hình ảnh.' });
        }
        
        // --- SANITIZE DATA ---
        if (stock === 'null' || stock === '' || stock === undefined) stock = 0;
        else stock = Number(stock);

        if (price === 'null' || price === '' || price === undefined) price = 0;
        else price = Number(price);

        if (discountPrice === 'null' || discountPrice === '' || discountPrice === undefined) discountPrice = 0;
        else discountPrice = Number(discountPrice);

        // Sanitize category input
        if (category === 'null' || category === '') {
            category = null;
        }

        // Map uploaded files to their web-accessible paths
        const images = req.files.map(file => {
            // We'll store the path relative to the server's public folder
            return `/${file.path.replace(/\\/g, '/').split('public/')[1]}`;
        });

        const createdProduct = await new Product({
            name,
            sku,
            category,
            price,
            discountPrice,
            stock,
            description,
            images,
            specifications: typeof specifications === 'string' ? JSON.parse(specifications || '{}') : specifications,
            status,
            isFeatured: isFeatured === 'true' || isFeatured === true,
        }).save();

        res.status(201).json(createdProduct);

    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { id: productId } = req.params;
        let { name, sku, category, price, discountPrice, stock, description, specifications, status, isFeatured } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật.' });
        }

        // --- SANITIZE DATA (Chuyển đổi kiểu dữ liệu) ---
        // FormData gửi mọi thứ là string, cần convert lại Number
        if (stock === 'null' || stock === '' || stock === undefined) stock = 0;
        else stock = Number(stock);

        if (price === 'null' || price === '' || price === undefined) price = 0;
        else price = Number(price);

        if (discountPrice === 'null' || discountPrice === '' || discountPrice === undefined) discountPrice = 0;
        else discountPrice = Number(discountPrice);

        // Sanitize Category
        if (category === 'null' || category === '') category = null;

        // Xử lý hình ảnh: kết hợp ảnh cũ và ảnh mới
        let existingImages = req.body.images || [];
        if (!Array.isArray(existingImages)) {
            existingImages = [existingImages];
        }

        // Ánh xạ các file ảnh mới tải lên thành đường dẫn URL
        const newImagePaths = (req.files || []).map(file => {
            return `/${file.path.replace(/\\/g, '/').split('public/')[1]}`;
        });

        const allImages = [...existingImages, ...newImagePaths];

        // Cập nhật các trường của sản phẩm
        product.name = name;
        product.sku = sku;
        product.category = category;
        product.price = price;
        product.discountPrice = discountPrice;
        product.stock = stock;
        product.description = description;
        try {
            product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications || {};
        } catch (e) {
            product.specifications = {};
        }
        product.status = status;
        product.isFeatured = isFeatured === 'true' || isFeatured === true; // Handle boolean from string
        product.images = allImages;

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
    }
};


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa.' });
        }

        res.status(200).json({ message: 'Đã xóa sản phẩm thành công.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let product;

        // Check if the parameter is a valid MongoDB ObjectId
        const isObjectId = slug.match(/^[0-9a-fA-F]{24}$/);

        if (isObjectId) {
            product = await Product.findById(slug).populate('category', 'name slug');
        } else {
            product = await Product.findOne({ slug }).populate('category', 'name slug');
        }

        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const TrackingEvent = require('../models/TrackingEvent');
const { generateText } = require('../utils/gemini');

// @desc    Get featured products (Personalized with AI Explanations)
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
    const { sessionId } = req.query;
    const userId = req.user?._id;
    const targetProductCount = 4; // Lower count for AI processing
    
    try {
        let personalizedProducts = new Map();
        let userBehaviorSummary = "người dùng mới";
        let userTopCategory = "sản phẩm công nghệ";

        const userIdentifier = userId 
            ? { userId: userId } 
            : (sessionId ? { sessionId: sessionId } : null);

        // --- Step 1: Gather Products & User Insights ---
        if (userIdentifier) {
            const recentSearches = await TrackingEvent.find({ ...userIdentifier, eventType: 'search_keyword' }).sort({ createdAt: -1 }).limit(5);
            const viewedEvents = await TrackingEvent.aggregate([
                { $match: { ...userIdentifier, eventType: { $in: ['view_product', 'category_view'] }, createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) } } },
                { $group: { _id: "$payload.category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 3 }
            ]);

            if (recentSearches.length > 0) {
                userBehaviorSummary = `gần đây đã tìm kiếm '${recentSearches[0].payload.keyword}'`;
                const searchRegex = new RegExp(recentSearches.map(e => e.payload.keyword).join('|'), 'i');
                const searchBasedProducts = await Product.find({ name: searchRegex, status: 'active' }).limit(targetProductCount).populate('category', 'name slug');
                searchBasedProducts.forEach(p => personalizedProducts.set(p._id.toString(), p));
            }

            if (viewedEvents.length > 0) {
                const topCatName = viewedEvents[0]._id;
                const categoryDoc = await Category.findOne({ name: topCatName }).select('_id name');
                if (categoryDoc) {
                    userTopCategory = categoryDoc.name;
                    userBehaviorSummary += ` và quan tâm đến danh mục ${userTopCategory}`;
                    const categoryBasedProducts = await Product.find({ category: categoryDoc._id, status: 'active' }).limit(targetProductCount).populate('category', 'name slug');
                    categoryBasedProducts.forEach(p => personalizedProducts.set(p._id.toString(), p));
                }
            }
        }

        if (personalizedProducts.size < targetProductCount) {
            const globalFeatured = await Product.find({ isFeatured: true, status: 'active' }).sort({ featuredOrder: 1, createdAt: -1 }).limit(targetProductCount).populate('category', 'name slug');
            globalFeatured.forEach(p => {
                if (personalizedProducts.size < targetProductCount) personalizedProducts.set(p._id.toString(), p);
            });
        }
        
        let finalProducts = Array.from(personalizedProducts.values()).slice(0, targetProductCount);

        // --- FINAL FALLBACK: If still no products, get the most recent ones ---
        if (finalProducts.length === 0) {
            const recentProducts = await Product.find({ status: 'active' }).sort({ createdAt: -1 }).limit(targetProductCount).populate('category', 'name slug');
            finalProducts = recentProducts;
        }

        // --- Step 2: Call AI to Generate Explanations (Now in a fail-safe block) ---
            /*
            // AI feature disabled due to persistent model compatibility errors.
            try {
                if (finalProducts.length > 0) {
                    const productListForAI = JSON.stringify(finalProducts.map(p => ({ id: p._id, name: p.name, category: p.category?.name, description: p.description, keyBenefit: p.keyBenefit })));
                    
                    const prompt = `
                        You are an AI assistant for an e-commerce website.
                        Context:
                        User profile summary:
                        - Interested in: ${userTopCategory}
                        - Behavior: ${userBehaviorSummary}
                        Featured products:
                        ${productListForAI}
                        Task:
                        As a friendly shopping assistant, write short, engaging explanations (1 sentence each) explaining why each product is a great fit for this specific user.
                        Rules:
                        - Output must be in Vietnamese.
                        - Sound natural, friendly, and helpful. Like a real, expert shopping assistant.
                        - Directly connect a product feature to the user's known interests (e.g., "Because you like [category], you might enjoy this product's [feature]").
                        - Do not mention user data, tracking, or "behavior". Instead of "Because you viewed X", say "Since you're interested in X...".
                        - No technical jargon. Keep it simple and focus on benefits.
                        - Be creative and avoid repetitive phrasing.
                        Output format:
                        A clean JSON array string, with no extra text or markdown:
                        [
                          {
                            "productId": "...",
                            "explanation": "..."
                          }
                        ]
                    `;
                    
                    const aiResponseString = await generateText(prompt);
                    if (aiResponseString) {
                        const cleanedString = aiResponseString.replace(/```json/g, '').replace(/```/g, '').trim();
                        const aiExplanations = JSON.parse(cleanedString);
                        
                        const explanationsMap = new Map(aiExplanations.map(item => [item.productId, item.explanation]));

                        finalProducts = finalProducts.map(p => {
                            const explanation = explanationsMap.get(p._id.toString());
                            if (explanation) {
                                const modifiableProduct = p.toObject();
                                modifiableProduct.featuredReason = explanation;
                                return modifiableProduct;
                            }
                            return p;
                        });
                    }
                }
            } catch (aiError) {
                console.error("AI explanation generation failed. Returning products without AI reasons.", aiError);
                // Fail silently - The original finalProducts array will be used.
            }
            */

        res.status(200).json(finalProducts);

    } catch (error) {
        console.error("Error fetching personalized featured products:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
    try {
        const currentProduct = await Product.findById(req.params.id);
        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find products in the same category, excluding the current one
        // Limit to 4 for UI display
        const related = await Product.find({
            category: currentProduct.category,
            _id: { $ne: currentProduct._id }
        })
        .limit(4)
        .populate('category', 'name');

        res.json(related);
    } catch (error) {
        console.error("Error fetching related products:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductBySlug,
    getFeaturedProducts,
    getRelatedProducts
};