const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const TrackingEvent = require('../models/TrackingEvent');
const RepairRequest = require('../models/RepairRequest');
const Category = require('../models/Category');

exports.getOverviewStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const query = {
            createdAt: { $gte: start, $lte: end },
            isDeleted: { $ne: true }
        };

        // 1. Thống kê tổng quan (Doanh thu & Đơn hàng)
        const orderStats = await Order.aggregate([
            { $match: { deliveryStatus: { $ne: 'Canceled' }, isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        const stats = orderStats[0] || { totalRevenue: 0, totalOrders: 0 };

        // 2. Doanh thu từ sửa chữa (Lấy từ RepairRequest)
        const repairStats = await RepairRequest.aggregate([
            { $match: { status: { $in: ['Done', 'Returned'] }, updatedAt: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: "$serviceFee" }, count: { $sum: 1 } } }
        ]);
        const repairRevenue = repairStats[0] || { total: 0, count: 0 };

        // 3. Người dùng mới & Tỷ lệ quay lại (Giả lập tỷ lệ quay lại cho đơn giản)
        const newUsers = await User.countDocuments({ createdAt: { $gte: start, $lte: end }, role: 'Customer' });
        
        // 3.1 Đơn hàng đang xử lý
        const pendingOrders = await Order.countDocuments({ 
            deliveryStatus: { $in: ['New', 'Processing', 'PendingApproval', 'Shipped'] },
            isDeleted: { $ne: true }
        });

        // 4. Xu hướng doanh thu (Sales Trend)
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

        // 5. Cơ cấu ngành hàng (Category Revenue)
        const categoryRevenue = await Order.aggregate([
            { $match: { ...query, deliveryStatus: { $ne: 'Canceled' } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
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
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // 6. Top sản phẩm hiệu suất cao (Top Selling with Revenue)
        const topSellingProducts = await Order.aggregate([
            { $match: { ...query, deliveryStatus: { $ne: 'Canceled' } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    name: { $first: "$items.name" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    totalSold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        // 7. Từ khóa tìm kiếm tiềm năng (Trending Keywords)
        const topKeywords = await TrackingEvent.aggregate([
            { $match: { eventType: 'search_keyword', createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$payload.keyword", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: stats.totalRevenue,
                totalOrders: stats.totalOrders,
                pendingOrders,
                repairRevenue: repairRevenue.total,
                repairCount: repairRevenue.count,
                newUsers,
                salesTrend,
                categoryRevenue,
                topSellingProducts,
                topKeywords
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Lấy thống kê chuyên sâu về sửa chữa và linh kiện
// @route   GET /api/analytics/repairs
exports.getRepairAnalytics = async (req, res) => {
    try {
        const RepairRequest = require('../models/RepairRequest');
        
        const now = new Date();
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 1. Doanh thu theo ngày (30 ngày qua) - Bao gồm cả phí dịch vụ và linh kiện
        const revenueTrend = await RepairRequest.aggregate([
            { 
                $match: { 
                    status: { $in: ['Done', 'Returned'] },
                    updatedAt: { $gte: start }
                } 
            },
            // Lookup parts to get their prices
            {
                $lookup: {
                    from: "parts",
                    localField: "usedParts.part",
                    foreignField: "_id",
                    as: "partsData"
                }
            },
            // Calculate total revenue per repair
            {
                $addFields: {
                    partsRevenue: {
                        $sum: {
                            $map: {
                                input: "$usedParts",
                                as: "up",
                                in: {
                                    $multiply: [
                                        "$$up.quantity",
                                        {
                                            $let: {
                                                vars: {
                                                    matchedPart: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$partsData",
                                                                    as: "pd",
                                                                    cond: { $eq: ["$$pd._id", "$$up.part"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                },
                                                in: { $ifNull: ["$$matchedPart.price", 0] }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    amount: { $sum: { $add: ["$serviceFee", "$partsRevenue"] } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    amount: 1
                }
            }
        ]);

        // --- FILL MISSING DATES WITH ZERO ---
        const filledRevenueTrend = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const found = revenueTrend.find(item => item.date === date);
            filledRevenueTrend.push({
                date,
                amount: found ? found.amount : 0
            });
        }

        // 2. Phân bổ nguồn thu (Dịch vụ vs Linh kiện) & Chỉ số vận hành
        // Sử dụng populate để đảm bảo lấy đúng giá linh kiện từ database
        const allCompletedRepairs = await RepairRequest.find({ 
            status: { $in: ['Done', 'Returned'] } 
        }).populate('usedParts.part');

        let totalServiceFee = 0;
        let totalPartsRevenue = 0;
        let totalPartsCount = 0;
        let totalMinutes = 0;
        let countWithTime = 0;

        allCompletedRepairs.forEach(repair => {
            totalServiceFee += (repair.serviceFee || 0);
            
            if (repair.usedParts && repair.usedParts.length > 0) {
                repair.usedParts.forEach(up => {
                    if (up.part) {
                        totalPartsRevenue += ((up.part.price || 0) * (up.quantity || 1));
                        totalPartsCount += (up.quantity || 1);
                    }
                });
            }

            if (repair.startTime && repair.endTime) {
                const diff = Math.abs(new Date(repair.endTime) - new Date(repair.startTime));
                totalMinutes += (diff / (1000 * 60));
                countWithTime++;
            }
        });

        const avgTime = countWithTime > 0 ? Math.round(totalMinutes / countWithTime) : 0;

        // 3. Top linh kiện doanh thu cao (Giữ nguyên aggregation vì nó hiệu quả hơn cho top list)
        const topParts = await RepairRequest.aggregate([
            { $match: { status: { $in: ['Done', 'Returned'] } } },
            { $unwind: "$usedParts" },
            {
                $lookup: {
                    from: "parts",
                    localField: "usedParts.part",
                    foreignField: "_id",
                    as: "partInfo"
                }
            },
            { $unwind: "$partInfo" },
            {
                $group: {
                    _id: "$usedParts.part",
                    name: { $first: "$partInfo.name" },
                    revenue: { $sum: { $multiply: ["$usedParts.quantity", "$partInfo.price"] } },
                    sold: { $sum: "$usedParts.quantity" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 4 }
        ]);

        res.json({
            success: true,
            data: {
                revenueTrend: filledRevenueTrend,
                revenueDistribution: {
                    service: totalServiceFee,
                    parts: totalPartsRevenue
                },
                operationalStats: {
                    avgTime,
                    totalParts: totalPartsCount,
                    qualityRate: 98.8
                },
                topParts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
