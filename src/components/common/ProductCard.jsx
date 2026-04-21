import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { getProductImageUrl } from '../../utils/getProductImageUrl';

/**
 * ProductCard Component
 * 
 * Maps directly to Backend Product Schema.
 * Requires strict data validation before rendering.
 * 
 * @param {Object} product - Product data object
 */
const ProductCard = ({ product, className = '', style = {} }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // 1. Data Validation (Strict Mode)
  // Nếu thiếu các trường cốt lõi, không render card để tránh lỗi UI/Logic
  if (
    !product ||
    !product._id ||
    !product.name ||
    typeof product.price !== 'number'
  ) {
    console.warn('ProductCard: Missing required fields for product', product);
    return null;
  }

  // 2. Data Normalization
  // Xử lý các trường có thể null/undefined từ backend để UI không gãy
  const {
    _id,
    name,
    slug, // Fallback if slug missing (though it shouldn't be)
    price,
    salePrice, // Optional
    images = [],
    isFeatured,
    tag // Optional UI tag
  } = product;

  // FIX: Sử dụng hàm utility chung để xử lý ảnh
  const displayImage = getProductImageUrl(product);
  const displaySlug = slug || _id; // Fallback slug
  
  const hasDiscount = salePrice && salePrice < price;
  const finalPrice = hasDiscount ? salePrice : price;
  const isLiked = isInWishlist(_id);

  const handleCardClick = () => {
    navigate(`/product/${displaySlug}`);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`Đã thêm ${product.name} vào giỏ`, 'success');
  };

  return (
    <div 
      className={`group cursor-pointer flex flex-col h-full ${className}`}
      style={style}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="aspect-[4/5] bg-slate-50 rounded-[2rem] p-8 relative overflow-hidden transition-all duration-500 group-hover:shadow-xl group-hover:shadow-slate-100 flex-shrink-0">
        
        {/* Heart Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLiked ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-white/80 backdrop-blur-sm text-slate-300 hover:text-red-500 shadow-sm'}`}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
        </button>

        {/* Tags / Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {isFeatured && (
            <span className="px-3 py-1 bg-black text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
              Featured
            </span>
          )}
          {hasDiscount && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
              -{Math.round(((price - salePrice) / price) * 100)}%
            </span>
          )}
          {tag && (
             <span className="px-3 py-1 bg-white text-slate-800 border border-slate-100 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
               {tag}
             </span>
          )}
        </div>

        {/* Product Image */}
        <img 
          src={displayImage} 
          alt={name} 
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
          loading="lazy" 
        />

        {/* Quick Action Overlay (Desktop) */}
        <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hidden md:block">
          <button 
            onClick={handleQuickAdd}
            className="w-full py-3 bg-white text-black border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag size={12} /> Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 space-y-1 flex-1 flex flex-col">
        <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through font-medium">
                {price.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className={`text-[11px] font-black uppercase tracking-widest ${hasDiscount ? 'text-red-500' : 'text-slate-600'}`}>
              {finalPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Mobile Arrow Icon */}
          <div className="md:hidden w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
             <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
