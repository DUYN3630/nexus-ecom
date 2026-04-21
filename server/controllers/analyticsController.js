const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const TrackingEvent = require('../models/TrackingEvent');

exports.getOverviewStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Mặc định là 30 ngày qua nếu không có date range
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const query = {
            createdAt: { $gte: start, $lte: end }
        };

        // 1. Thống kê đơn hàng và doanh thu
        const orderStats = await Order.aggregate([
            { $match: { ...query, deliveryStatus: { $ne: 'Canceled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    paidOrders: { $sum: { $cond: ['$isPaid', 1, 0] } }
                }
            }
        ]);

        const stats = orderStats[0] || { totalRevenue: 0, totalOrders: 0, paidOrders: 0 };

        // 2. Thống kê người dùng mới
        const newUsers = await User.countDocuments({
            createdAt: { $gte: start, $lte: end },
            role: 'Customer'
        });

        // 3. Tính tỷ lệ chuyển đổi (Conversion Rate)
        // Dựa trên số session duy nhất hoặc lượt xem sản phẩm
        const totalViews = await TrackingEvent.countDocuments({
            createdAt: { $gte: start, $lte: end },
            eventType: 'view_product'
        });

        const conversionRate = totalViews > 0 ? (stats.totalOrders / totalViews) * 100 : 0;

        // 4. Lấy dữ liệu biểu đồ (Sales Trend)
        const salesTrend = await Order.aggregate([
            { $match: { ...query, deliveryStatus: { $ne: 'Canceled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 5. Top sản phẩm bán chạy (theo số lượng)
        const topSellingProducts = await Order.aggregate([
            { $match: { ...query, deliveryStatus: { $ne: 'Canceled' } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // 6. Doanh thu theo danh mục
        // Lưu ý: Vì Order.items chỉ lưu productId, ta cần $lookup sang bảng Product và Category
        const categoryRevenue = await Order.aggregate([
            { $match: { ...query, deliveryStatus: { $ne: 'Canceled' } } },
            { $unwind: "$items" },
            {
                $addFields: {
                    productIdObj: { $toObjectId: "$items.productId" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productIdObj",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productInfo.category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $group: {
                    _id: "$categoryInfo.name",
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // 7. Sản phẩm được xem nhiều nhất (Hành vi)
        const mostViewedProducts = await TrackingEvent.aggregate([
            { $match: { ...query, eventType: 'view_product' } },
            {
                $group: {
                    _id: "$payload.productId",
                    name: { $first: "$payload.productName" },
                    views: { $sum: 1 }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 5 }
        ]);

        // 8. Top từ khóa tìm kiếm
        const topKeywords = await TrackingEvent.aggregate([
            { $match: { ...query, eventType: 'search_keyword' } },
            {
                $group: {
                    _id: "$payload.keyword",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: stats.totalRevenue,
                totalOrders: stats.totalOrders,
                newUsers,
                conversionRate: conversionRate.toFixed(2),
                aov: stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0,
                salesTrend,
                topSellingProducts,
                categoryRevenue,
                mostViewedProducts,
                topKeywords
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
