const Marketing = require('../models/Marketing');

const marketingController = {
  // --- ADMIN APIs ---

  // GET /api/marketing/stats
  getDashboardStats: async (req, res) => {
    try {
      const totalBanners = await Marketing.countDocuments();
      const activeBanners = await Marketing.countDocuments({ status: 'active' });
      const scheduledBanners = await Marketing.countDocuments({ status: 'scheduled' });
      const inactiveBanners = await Marketing.countDocuments({ status: 'inactive' });

      // Tính tổng click/impression
      const stats = await Marketing.aggregate([
        { $group: { _id: null, totalClicks: { $sum: '$analytics.clicks' }, totalImpressions: { $sum: '$analytics.impressions' } } }
      ]);

      const totalClicks = stats[0]?.totalClicks || 0;
      const totalImpressions = stats[0]?.totalImpressions || 0;
      const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          displayingBanners: activeBanners,
          scheduledBanners: scheduledBanners,
          expiredBanners: inactiveBanners,
          total: totalBanners,
          avgCtr: avgCtr,
          totalClicks,
          totalImpressions
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/marketing/banners (Admin List)
  getBanners: async (req, res) => {
    try {
      const { search, type, position, page = 1, limit = 10 } = req.query;
      const query = {};

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      if (type && type !== 'all') {
        query.type = type;
      }
      if (position && position !== 'all') {
        query.position = position;
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [banners, total] = await Promise.all([
        Marketing.find(query)
          .sort({ priority: -1, createdAt: -1 })
          .populate('linkTarget.productId', 'name slug')
          .populate('linkTarget.categoryId', 'name slug')
          .skip(skip)
          .limit(limitNum),
        Marketing.countDocuments(query)
      ]);
        
      res.json({ 
        success: true, 
        data: banners,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/marketing/banners
  addBanner: async (req, res) => {
    try {
      // 1. Handle Media
      let mediaData = {};
      if (req.body.media) {
         try {
             mediaData = typeof req.body.media === 'string' ? JSON.parse(req.body.media) : req.body.media;
         } catch (e) {
            // Ignore parsing error if media is not a valid JSON string
         }
      }
      
      if (req.file) {
        mediaData.url = `/uploads/${req.file.filename}`;
        mediaData.kind = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      }

      // 2. Parse JSON fields safely
      const safeParse = (val) => {
          if (!val) return undefined;
          if (typeof val === 'object') return val;
          try { return JSON.parse(val); } catch (e) { return undefined; }
      };

      const content = safeParse(req.body.content);
      const linkTarget = safeParse(req.body.linkTarget);
      const schedule = safeParse(req.body.schedule);

      // 3. Construct Payload
      const payload = {
          name: req.body.name,
          type: req.body.type,
          position: req.body.position,
          status: req.body.status,
          priority: req.body.priority,
          media: mediaData,
          content: content,
          linkType: req.body.linkType,
          schedule: schedule
      };

      if (linkTarget) {
          payload.linkTarget = {
              url: linkTarget.url || '',
              productId: (linkTarget.productId && linkTarget.productId !== '') ? linkTarget.productId : null,
              categoryId: (linkTarget.categoryId && linkTarget.categoryId !== '') ? linkTarget.categoryId : null
          };
      }

      const newBanner = new Marketing(payload);
      await newBanner.save();
      res.status(201).json({ success: true, data: newBanner });
    } catch (error) {
      console.error("Add Banner Error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // PUT /api/marketing/banners/:id
  updateBanner: async (req, res) => {
    try {
      const { id } = req.params;
      
      // 1. Handle Media
      let mediaData = {};
      if (req.body.media) {
         try {
             mediaData = typeof req.body.media === 'string' ? JSON.parse(req.body.media) : req.body.media;
         } catch (e) {
            // Ignore parsing error if media is not a valid JSON string
         }
      }
      
      if (req.file) {
        mediaData.url = `/uploads/${req.file.filename}`;
        mediaData.kind = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      } else if (req.body.existingMediaUrl && (!mediaData.url || mediaData.url === '')) {
        // Fallback to existing URL if new one not provided
        mediaData.url = req.body.existingMediaUrl;
        if (!mediaData.kind) mediaData.kind = 'image'; // Default
      }
      
      // 2. Parse JSON fields safely
      const safeParse = (val) => {
          if (!val) return undefined;
          if (typeof val === 'object') return val;
          try { return JSON.parse(val); } catch (e) { return undefined; }
      };

      const content = safeParse(req.body.content);
      const linkTarget = safeParse(req.body.linkTarget);
      const schedule = safeParse(req.body.schedule);

      // 3. Construct Update Payload
      const updatePayload = {
          name: req.body.name,
          type: req.body.type,
          position: req.body.position,
          status: req.body.status,
          priority: req.body.priority,
          media: mediaData,
          linkType: req.body.linkType
      };

      if (content) updatePayload.content = content;
      if (schedule) updatePayload.schedule = schedule;

      if (linkTarget) {
          updatePayload.linkTarget = {
              url: linkTarget.url || '',
              productId: (linkTarget.productId && linkTarget.productId !== '') ? linkTarget.productId : null,
              categoryId: (linkTarget.categoryId && linkTarget.categoryId !== '') ? linkTarget.categoryId : null
          };
      }

      const updatedBanner = await Marketing.findByIdAndUpdate(
        id, 
        updatePayload, 
        { new: true, runValidators: true }
      );
      
      if (!updatedBanner) return res.status(404).json({ success: false, message: "Banner not found" });
      res.json({ success: true, data: updatedBanner });
    } catch (error) {
      console.error("Update Banner Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // DELETE /api/marketing/banners
  deleteBanners: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) return res.status(400).json({ success: false, message: "IDs array required" });
      
      await Marketing.deleteMany({ _id: { $in: ids } });
      res.json({ success: true, message: "Banners deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/marketing/banners/bulk-status
  updateBannersStatus: async (req, res) => {
    try {
      const { ids, status } = req.body;
      if (!ids || !Array.isArray(ids)) return res.status(400).json({ success: false, message: "IDs array required" });
      if (!status) return res.status(400).json({ success: false, message: "Status is required" });

      await Marketing.updateMany({ _id: { $in: ids } }, { $set: { status } });
      res.json({ success: true, message: "Banners status updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- PUBLIC / USER APIs ---

  // GET /api/marketing/public?position=home-top
  getPublicBanners: async (req, res) => {
    try {
        const { position } = req.query;
        const now = new Date();

        const query = {
            status: 'active',
            'schedule.startAt': { $lte: now }, // Đã bắt đầu
            $or: [
                { 'schedule.endAt': { $exists: false } }, // Không có ngày kết thúc
                { 'schedule.endAt': { $gte: now } },      // Hoặc chưa kết thúc
                { 'schedule.endAt': null }
            ]
        };

        if (position) {
            query.position = position;
        }

        const banners = await Marketing.find(query)
            .sort({ priority: -1, 'schedule.startAt': -1 }) // Ưu tiên priority cao, mới nhất
            .populate('linkTarget.productId', 'slug')
            .populate('linkTarget.categoryId', 'slug');

        // Ghi nhận Impression (Async - không await để response nhanh)
        // Lưu ý: Traffic cao thì nên dùng Redis hoặc Queue thay vì update trực tiếp DB
        if (banners.length > 0) {
            const ids = banners.map(b => b._id);
            Marketing.updateMany({ _id: { $in: ids } }, { $inc: { 'analytics.impressions': 1 } }).exec();
        }

        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  },

  // POST /api/marketing/track/:id/click
  trackClick: async (req, res) => {
      try {
          await Marketing.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.clicks': 1 } });
          res.status(200).json({ success: true });
      } catch (error) {
          res.status(500).json({ success: false });
      }
  }
};

module.exports = marketingController;
