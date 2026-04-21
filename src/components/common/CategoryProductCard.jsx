import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Info, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { getProductImageUrl, IMAGE_ERROR_PLACEHOLDER } from '../../utils/getProductImageUrl';
import Tooltip from './Tooltip';

// Bảng màu accent cho từng category
const ACCENT_COLORS = {
  indigo: {
    hoverShadow: 'hover:shadow-indigo-100',
    hoverBorder: 'hover:border-indigo-200',
    hoverText: 'group-hover:text-indigo-600',
    buttonHover: 'group-hover:bg-indigo-600',
    badgeBg: 'bg-black',
  },
  blue: {
    hoverShadow: 'hover:shadow-blue-100',
    hoverBorder: 'hover:border-blue-200',
    hoverText: 'group-hover:text-blue-600',
    buttonHover: 'group-hover:bg-blue-600',
    badgeBg: 'bg-blue-500',
  },
  pink: {
    hoverShadow: 'hover:shadow-pink-100/30',
    hoverBorder: 'hover:border-pink-200/60',
    hoverText: 'group-hover:text-pink-600',
    buttonHover: 'group-hover:bg-pink-600',
    badgeBg: 'bg-pink-500',
  },
  orange: {
    hoverShadow: 'hover:shadow-orange-100',
    hoverBorder: 'hover:border-orange-200',
    hoverText: 'group-hover:text-orange-600',
    buttonHover: 'group-hover:bg-orange-600',
    badgeBg: 'bg-orange-500',
  },
};

/**
 * Product card tái sử dụng cho các listing pages.
 * 
 * @param {Object} product - Product data
 * @param {string} accentColor - 'indigo' | 'blue' | 'pink' | 'orange' (default: 'indigo')
 * @param {string} aspectRatio - CSS aspect ratio class: 'aspect-square' | 'aspect-[4/3]' | 'aspect-video' (default: 'aspect-square')  
 * @param {string} imageBg - Background class cho image container (default: 'bg-[#F5F5F7]')
 * @param {string} defaultBenefit - Fallback text khi product.keyBenefit không có
 * @param {boolean} showBadge - Hiển thị badge "Mới" (default: true)
 * @param {boolean} showTooltip - Hiển thị tooltip featuredReason (default: false)
 * @param {boolean} showAddToCart - Hiển thị nút add to cart (default: true)
 * @param {string} cardPadding - Padding class (default: 'p-8')
 * @param {string} cardRadius - Border radius class (default: 'rounded-[2.5rem]')
 * @param {string} titleSize - Font size class cho title (default: 'text-2xl')
 * @param {boolean} titleItalic - Title italic (default: true)
 */
const CategoryProductCard = ({ 
  product, 
  accentColor = 'indigo',
  aspectRatio = 'aspect-square',
  imageBg = 'bg-[#F5F5F7]',
  defaultBenefit = 'Đẳng cấp công nghệ trong tầm tay bạn.',
  showBadge = true,
  showTooltip = false,
  showAddToCart = true,
  cardPadding = 'p-8',
  cardRadius = 'rounded-[2.5rem]',
  titleSize = 'text-2xl',
  titleItalic = true,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const colors = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;
  const imageUrl = getProductImageUrl(product);
  const isLiked = isInWishlist(product._id);

  const handlePurchase = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`Đã thêm ${product.name} vào giỏ hàng`, 'success');
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.slug}`)}
      className={`group flex cursor-pointer flex-col ${cardRadius} border border-slate-200/60 bg-white ${cardPadding} text-left shadow-sm transition-all duration-500 hover:shadow-2xl ${colors.hoverShadow} ${colors.hoverBorder}`}
    >
      <div className={`relative mb-8 block ${aspectRatio} w-full overflow-hidden rounded-2xl ${imageBg}`}>
        
        {/* Heart Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLiked ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-black/10 backdrop-blur-md text-white hover:bg-black/30 shadow-sm hover:text-red-400'}`}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
        </button>

        <img 
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = IMAGE_ERROR_PLACEHOLDER; }}
        />
        {showBadge && (
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 ${colors.badgeBg} text-white text-[9px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}>
              Mới
            </span>
          </div>
        )}
        {showTooltip && product.featuredReason && (
          <div className="absolute top-4 right-4 z-10">
            <Tooltip text={product.featuredReason}>
              <div className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 backdrop-blur-md shadow-sm text-${accentColor}-500`}>
                <Info size={18} />
              </div>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2">
        <h3 className={`mb-2 ${titleSize} font-[1000] tracking-tighter text-slate-900 ${colors.hoverText} transition-colors ${titleItalic ? 'italic' : ''}`}>
          {product.name}
        </h3>
        <p className="mb-6 text-sm text-slate-400 font-medium line-clamp-2 italic leading-relaxed">
          {product.keyBenefit || defaultBenefit}
        </p>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Giá sở hữu từ</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900">
              {product.price?.toLocaleString('vi-VN')}₫
            </span>
          </div>
          {showAddToCart ? (
            <button 
              onClick={handlePurchase}
              className={`w-14 h-14 rounded-[1.2rem] bg-slate-900 text-white flex items-center justify-center ${colors.buttonHover} transition-all shadow-lg active:scale-90`}
            >
              <ShoppingBag size={24} />
            </button>
          ) : (
            <button 
              onClick={handlePurchase}
              className={`w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center ${colors.buttonHover} transition-all shadow-lg active:scale-90`}
            >
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProductCard;
