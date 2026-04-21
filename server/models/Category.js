const mongoose = require("mongoose");

const SeoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parentId: { // Reverted back to parentId to match user's DB
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    order: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    description: { // Reverted back to description
      type: String,
      default: "",
    },
    showInExplore: {
      type: Boolean,
      default: false,
    },
    seo: SeoSchema,
    productCount: {
        type: Number,
        default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to bridge the gap between backend's `deletedAt` and frontend's `isDeleted`
CategorySchema.virtual('isDeleted').get(function() {
  return this.deletedAt !== null;
});


/* Index for performance */
CategorySchema.index({ parentId: 1, order: 1 }); // Reverted back to parentId
CategorySchema.index({ slug: 1 });
CategorySchema.index({ status: 1 });

module.exports = mongoose.model("Category", CategorySchema);
