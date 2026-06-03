const mongoose = require('mongoose');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Product = require('../models/Product');

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

        if (status && status !== 'all') query.deliveryStatus = status;
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
            success: true,
            data: orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
    }
};

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    const isTest = process.env.NODE_ENV === 'test';
    const session = isTest ? null : await mongoose.startSession();
    if (session) session.startTransaction();

    try {
        const { items } = req.body;

        // 1. Kiểm tra và cập nhật tồn kho (Sử dụng Atomic Update với điều kiện)
        for (const item of items) {
            const updatedProduct = await Product.findOneAndUpdate(
                { 
                    _id: item.productId, 
                    stock: { $gte: item.quantity } // CHỈ TRỪ NẾU: Tồn kho >= Số lượng mua
                },
                { $inc: { stock: -item.quantity } }, // Giảm tồn kho nguyên tử
                { session, new: true }
            );

            if (!updatedProduct) {
                // Nếu không tìm thấy hoặc tồn kho không đủ (điều kiện $gte không thỏa mãn)
                throw new Error(`Sản phẩm ${item.name} không đủ hàng hoặc không tồn tại.`);
            }
        }

        // 2. Tạo đơn hàng
        const orderNumber = req.body.orderNumber || `NX-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        const newOrder = new Order({
            ...req.body,
            orderNumber,
            userId: req.user?._id,
            customer: {
                ...req.body.customer,
                email: req.user?.email || req.body.customer?.email
            },
            paymentStatus: 'Unpaid',
            isDeleted: false,
            deliveryStatus: req.body.deliveryStatus || 'New', 
            createdAt: new Date(),
            auditLogs: [{
                action: 'Khởi tạo',
                detail: `Đơn hàng được tạo bởi ${req.user?.name || 'admin'}`,
                user: req.user?._id || 'admin',
                time: new Date()
            }]
        });

        const savedOrder = await newOrder.save({ session });
        
        // --- REAL-TIME: Emit new order event to Admin ---
        const io = req.app.get('io');
        if (io) {
            io.to('admin_room').emit('new_order', {
                orderId: savedOrder._id,
                orderNumber: savedOrder.orderNumber,
                customerName: savedOrder.customer?.name || "Khách hàng",
                totalAmount: savedOrder.totalAmount,
                time: savedOrder.createdAt
            });
        }
        
        if (session) {
            await session.commitTransaction();
            session.endSession();
        }

        res.status(201).json({ success: true, data: savedOrder });
    } catch (err) { 
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        res.status(400).json({ success: false, message: err.message }); 
    }
};


// @desc    Cập nhật đơn hàng
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
    let session = null;
    try {
        // Chỉ bắt đầu session nếu đang ở môi trường Production hoặc có Replica Set
        if (process.env.NODE_ENV !== 'test') {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (sessionErr) {
                // Standalone MongoDB không hỗ trợ session
                session = null;
            }
        }

        const originalOrder = await Order.findById(req.params.id).session(session);
        if (!originalOrder) {
            throw new Error("Không tìm thấy đơn hàng");
        }

        // --- BẢO VỆ: Loại bỏ các trường bất biến hoặc đã tính toán ---
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.orderNumber; 
        delete updateData.auditLogs;
        delete updateData.customerName;
        delete updateData.itemsCount;

        const previousStatus = originalOrder.deliveryStatus;
        let newStatus = updateData.deliveryStatus || previousStatus;

        // Chuẩn hóa trạng thái (Tránh lỗi Canceled vs Cancelled)
        if (newStatus === 'Cancelled') newStatus = 'Canceled';

        // 1. XỬ LÝ KHO HÀNG KHI HỦY ĐƠN
        if (newStatus === 'Canceled' && previousStatus !== 'Canceled') {
            for (const item of originalOrder.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }
        } 
        // 2. XỬ LÝ KHO HÀNG KHI KHÔI PHỤC ĐƠN TỪ HỦY
        else if (previousStatus === 'Canceled' && newStatus !== 'Canceled') {
            for (const item of originalOrder.items) {
                const updatedProduct = await Product.findOneAndUpdate(
                    { 
                        _id: item.productId, 
                        stock: { $gte: item.quantity } 
                    },
                    { $inc: { stock: -item.quantity } },
                    { session, new: true }
                );

                if (!updatedProduct) {
                    throw new Error(`Sản phẩm ${item.name} không đủ tồn kho để khôi phục.`);
                }
            }
        }

        // Tự động chuyển về PendingApproval nếu sửa giá tiền
        if (updateData.totalAmount !== undefined && Number(updateData.totalAmount) !== originalOrder.totalAmount) {
            updateData.deliveryStatus = 'PendingApproval';
        }

        const auditLog = {
            action: 'Cập nhật',
            detail: `Trạng thái: ${previousStatus} -> ${newStatus}. ${updateData.isPaid !== originalOrder.isPaid ? '(Thanh toán thay đổi)' : ''}`,
            user: req.user?.name || req.user?._id || 'admin',
            time: new Date()
        };

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { 
                ...updateData,
                $push: { auditLogs: auditLog }
            }, 
            { new: true, session }
        );

        if (session) {
            await session.commitTransaction();
            session.endSession();
        }

        res.json({ success: true, data: updatedOrder });
    } catch (err) { 
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error("Update Order Error:", err);
        res.status(400).json({ success: false, message: err.message }); 
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
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        res.json({ success: true, message: "Đã chuyển vào thùng rác thành công", data: order });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
    }
};

// @desc    Khôi phục đơn hàng từ thùng rác
// @route   PATCH /api/orders/:id/restore
// @access  Private
const restoreOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { isDeleted: false, soft_deleted_at: null },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        res.json({ success: true, message: "Đã khôi phục đơn hàng thành công", data: order });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
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
