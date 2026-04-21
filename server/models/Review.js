const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [{ type: String }], // Review images
  
  // Status & Flags
  isVerifiedPurchase: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['pending', 'published', 'hidden'], 
    default: 'pending' 
  },
  isSpam: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  // Admin Reply
  reply: {
    text: { type: String },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repliedAt: { type: Date }
  },

  // Snapshot (Optional: store product name/image at time of review)
  productSnapshot: {
    name: String,
    image: String
  }
}, { 
  timestamps: true 
});

// Indexes for faster filtering
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
