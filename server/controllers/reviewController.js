const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

const reviewController = {
  // GET /api/reviews/product/:productId (Public)
  getProductReviews: async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 5 } = req.query;

      const reviews = await Review.find({ 
          product: productId, 
          status: 'published', 
          isSpam: false 
        })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments({ 
        product: productId, 
        status: 'published', 
        isSpam: false 
      });

      res.json({
        reviews,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /api/reviews/check-permission/:productId (Private)
  checkReviewPermission: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      // 1. Find a delivered order by this user containing this product
      // We search by customer email or ID depending on how Auth is set up. 
      // Based on Order model, let's search by customer.email (since user is logged in)
      const order = await Order.findOne({
        'customer.email': req.user.email,
        'items.productId': productId,
        deliveryStatus: 'Delivered'
      }).sort({ createdAt: -1 });

      if (!order) {
        return res.json({ 
          canReview: false, 
          message: 'Bạn cần mua sản phẩm này và nhận hàng thành công mới có thể đánh giá.' 
        });
      }

      // 2. Check if already reviewed for THIS specific order
      const existingReview = await Review.findOne({
        user: userId,
        product: productId,
        order: order._id
      });

      if (existingReview) {
        return res.json({ 
          canReview: false, 
          message: 'Bạn đã đánh giá sản phẩm này cho đơn hàng hiện tại.' 
        });
      }

      res.json({ 
        canReview: true, 
        orderId: order._id,
        orderNumber: order.orderNumber 
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // POST /api/reviews/product/:productId (Private)
  createReview: async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, content, orderId, images } = req.body;
      const userId = req.user._id;

      // Double check permission on server side
      const order = await Order.findOne({
        _id: orderId,
        'customer.email': req.user.email,
        'items.productId': productId,
        deliveryStatus: 'Delivered'
      });

      if (!order) {
        return res.status(403).json({ message: 'Không tìm thấy đơn hàng hợp lệ để đánh giá.' });
      }

      // Check duplicate
      const duplicate = await Review.findOne({ user: userId, product: productId, order: orderId });
      if (duplicate) {
        return res.status(400).json({ message: 'Bạn đã gửi đánh giá cho đơn hàng này rồi.' });
      }

      const newReview = new Review({
        product: productId,
        user: userId,
        order: orderId,
        rating,
        content,
        images: images || [],
        status: 'published', // Auto publish for now, or set to 'pending' if moderation needed
        isVerifiedPurchase: true
      });

      await newReview.save();

      // Update Product Rating & Review Count
      const stats = await Review.aggregate([
        { $match: { product: newReview.product, status: 'published' } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
          rating: Number(stats[0].avgRating.toFixed(1)),
          reviewCount: stats[0].count
        });
      }

      res.status(201).json(newReview);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // GET /api/reviews/public (For Homepage)
  getPublicReviews: async (req, res) => {
    try {
      const reviews = await Review.find({ status: 'published', isSpam: false })
        .populate('user', 'name avatar')
        .populate('product', 'name')
        .sort({ rating: -1, createdAt: -1 })
        .limit(4);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /api/reviews
  getAllReviews: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        rating, 
        search, 
        sort = 'newest' 
      } = req.query;

      const query = {};

      // Filter by Status
      if (status && status !== 'all') {
        query.status = status;
      }

      // Filter by Rating
      if (rating) {
        query.rating = Number(rating);
      }

      // Search (Content or Product Name)
      if (search) {
        // Note: For product name search to work efficiently, we might need aggregation 
        // or ensure productSnapshot is populated. Here we search content primarily.
        query.content = { $regex: search, $options: 'i' };
      }

      // Sort
      const sortOptions = {};
      if (sort === 'newest') sortOptions.createdAt = -1;
      else if (sort === 'oldest') sortOptions.createdAt = 1;
      else if (sort === 'highest') sortOptions.rating = -1;
      else if (sort === 'lowest') sortOptions.rating = 1;

      const reviews = await Review.find(query)
        .populate('user', 'name email avatar')
        .populate('product', 'name image')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments(query);

      // KPI Stats Calculation (Aggregated from ALL reviews, not just filtered)
      const stats = await Review.aggregate([
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            pendingCount: { 
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
            },
            spamCount: { 
              $sum: { $cond: [{ $eq: ['$isSpam', true] }, 1, 0] } 
            }
          }
        }
      ]);

      res.json({
        reviews,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        stats: stats[0] || { totalReviews: 0, avgRating: 0, pendingCount: 0, spamCount: 0 }
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // POST /api/reviews/:id/reply
  replyReview: async (req, res) => {
    try {
      const { text } = req.body;
      const review = await Review.findById(req.params.id);

      if (!review) return res.status(404).json({ message: 'Review not found' });

      review.reply = {
        text,
        repliedBy: req.user._id, // From auth middleware
        repliedAt: new Date()
      };
      
      // Auto publish if replied? Optional logic.
      // review.status = 'published';

      await review.save();
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // PATCH /api/reviews/:id/status
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body; // 'published', 'hidden', 'pending'
      const review = await Review.findByIdAndUpdate(
        req.params.id, 
        { status }, 
        { new: true }
      );
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // PATCH /api/reviews/:id/spam
  toggleSpam: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: 'Review not found' });

      review.isSpam = !review.isSpam;
      // If marked as spam, auto hide
      if (review.isSpam) review.status = 'hidden';
      
      await review.save();
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // DELETE /api/reviews/:id
  deleteReview: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: 'Review not found' });

      // Business Rule: Cannot delete published review unless suspended/hidden
      if (review.status === 'published' && !review.isSpam) {
        return res.status(400).json({ message: 'Cannot delete a published review. Hide it first.' });
      }

      await Review.deleteOne({ _id: req.params.id });
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = reviewController;
