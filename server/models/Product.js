const mongoose = require('mongoose');
const crypto = require('crypto');

// Helper function to generate a URL-friendly slug from a string
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true }, // Mã sản phẩm
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  description: String,
  images: [String], // Mảng chứa link ảnh
  specifications: { type: Map, of: String }, // Thông số kỹ thuật (Ram, CPU...)
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  keyBenefit: { type: String }, // Lợi ích chính (1 dòng)
  featuredReason: { type: String }, // Lý do được làm nổi bật
  featuredOrder: { type: Number, default: 0 }, // Thứ tự hiển thị trong section Featured
  
  // Rating & Reviews Summary (Task 8)
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Middleware to generate a unique slug before validating a new product
ProductSchema.pre('validate', async function () {
  // Only generate a slug for new products
  if (!this.isNew) {
    return;
  }

  let baseSlug = slugify(this.name);
  let finalSlug = baseSlug;

  // Check if the slug already exists and append a random suffix if it does
  while (await this.constructor.findOne({ slug: finalSlug })) {
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    finalSlug = `${baseSlug}-${randomSuffix}`;
  }

  this.slug = finalSlug;
});


module.exports = mongoose.model('Product', ProductSchema);