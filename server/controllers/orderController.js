const Order = require('../models/Order');
const Review = require('../models/Review');

// @desc    Lấy danh sách sản phẩm đã mua để đánh giá
// @route   GET /api/orders/purchased-products
// @access  Private
const getPurchasedProducts = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const userId = req.user._id;

        // 1. Tìm tất cả đơn hàng đã giao của user này (theo userId, email hoặc auditLogs)
        const orders = await Order.find({
            $or: [
                { userId: userId },
                { 'customer.email': { $regex: new RegExp(`^${userEmail}$`, 'i') } },
                { auditLogs: { $elemMatch: { user: userId.toString() } } }
            ],
            deliveryStatus: 'Delivered',
            isDeleted: false
        }).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.json([]);
        }

        // 2. Thu thập tất cả sản phẩm từ các đơn hàng này
        let purchasedItems = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                purchasedItems.push({
                    productId: item.productId,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    purchaseDate: order.createdAt
                });
            });
        });

        // 3. Kiểm tra trạng thái đánh giá cho từng item
        const results = await Promise.all(purchasedItems.map(async (item) => {
            const existingReview = await Review.findOne({
                user: userId,
                product: item.productId,
                order: item.orderId
            });

            return {
                ...item,
                isReviewed: !!existingReview,
                reviewId: existingReview ? existingReview._id : null,
                rating: existingReview ? existingReview.rating : 0
            };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// @route   GET /api/orders
// @access  Private
const getAllOrders = async (req, res) => {
    try {
        const { page, limit, status, search } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        
        // Phân quyền: Nếu không phải Admin, chỉ thấy đơn của mình
        if (req.user.role?.toLowerCase() !== 'admin') {
            query.$or = [
                { userId: req.user._id },
                { 'customer.email': { $regex: new RegExp(`^${req.user.email}$`, 'i') } },
                { auditLogs: { $elemMatch: { user: req.user._id.toString() } } }
            ];
        }

        if (status) query.deliveryStatus = status;
        if (search) {
            query.$or = [
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } },
                { orderNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const [orders, total] = await Promise.all([
            Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Order.countDocuments(query)
        ]);

        res.json({
            data: orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        // Tạo orderNumber tự động nếu không có
        const orderNumber = req.body.orderNumber || `NX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        // Xác định paymentStatus dựa vào phương thức thanh toán
        const paymentMethod = req.body.paymentMethod || 'COD';
        const paymentStatus = paymentMethod === 'MOMO' ? 'Unpaid' : 'Unpaid';

        const newOrder = new Order({
            ...req.body,
            orderNumber,
            userId: req.user?._id, // Gắn ID user vào đơn hàng
            customer: {
                ...req.body.customer,
                email: req.user?.email || req.body.customer?.email // Ưu tiên email của user đã đăng nhập
            },
            paymentStatus,
            isDeleted: false,
            deliveryStatus: 'New', 
            createdAt: new Date(),
            auditLogs: [{
                action: 'Khởi tạo',
                detail: `Đơn hàng được tạo bởi ${req.user?.name || 'khách hàng'}`,
                user: req.user?.id || 'user',
                time: new Date()
            }]
        });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) { 
        res.status(400).json({ message: "Lỗi tạo đơn: " + err.message }); 
    }
};


// @desc    Cập nhật đơn hàng
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
    try {
        const originalOrder = await Order.findById(req.params.id);
        if (!originalOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const updateData = req.body;

        // Tự động chuyển về PendingApproval nếu sửa giá tiền
        if (updateData.totalAmount && Number(updateData.totalAmount) !== originalOrder.totalAmount) {
            updateData.deliveryStatus = 'PendingApproval';
        }

        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedOrder);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// @desc    Xóa mềm (chuyển vào thùng rác)
// @route   PATCH /api/orders/:id/soft-delete
// @access  Private
const softDeleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { isDeleted: true, soft_deleted_at: new Date() }, 
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        res.json({ message: "Đã chuyển vào thùng rác thành công", order });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

// @desc    Khôi phục đơn hàng từ thùng rác
// @route   PATCH /api/orders/:id/restore
// @access  Private
const restoreOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { isDeleted: false, soft_deleted_at: null }, // Xóa soft_deleted_at khi khôi phục
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        res.json({ message: "Đã khôi phục đơn hàng thành công", order });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};


module.exports = {
    getAllOrders,
    createOrder,
    updateOrder,
    softDeleteOrder,
    restoreOrder,
    getPurchasedProducts,
};
