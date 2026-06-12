import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Scale, ArrowRight, Info } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart as addToCartAction } from '../../../store/slices/cartSlice';
import productApi from '../../../api/productApi';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getProductImageUrl, IMAGE_ERROR_PLACEHOLDER } from '../../../utils/getProductImageUrl';

// --- Sub-component: Tooltip ---
const Tooltip = ({ text, children }) => {
  return (
    <div className="group relative flex justify-center">
      {children}
      <span className="absolute bottom-full mb-2 w-max max-w-xs scale-0 transform rounded-lg bg-gray-800 p-2 text-center text-xs text-white transition-all group-hover:scale-100 origin-bottom z-50">
        {text}
      </span>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const getScarcityBadge = () => {
    if (product.stock <= 5 && product.stock > 0) return { label: 'Sắp hết hàng', color: 'bg-orange-500' };
    if (product.isBestSeller || Math.random() > 0.8) return { label: 'Bán chạy', color: 'bg-indigo-600' };
    return null;
  };

  const badge = getScarcityBadge();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCartAction({ product, quantity: 1 }));
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group relative flex flex-col rounded-[32px] overflow-hidden bg-white border border-slate-100 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] cursor-pointer h-[500px]"
    >
      {/* Background/Image Layer */}
      <div className="absolute inset-0 z-0 bg-[#FBFBFB] flex items-center justify-center p-12 transition-transform duration-[1000ms] group-hover:scale-105 group-hover:blur-[2px] group-hover:opacity-40">
        <img
          src={getProductImageUrl(product.images?.[0] || product.mainImage)}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply"
          onError={(e) => { e.target.src = IMAGE_ERROR_PLACEHOLDER; }}
        />
      </div>

      {/* Persistent Badge (Top Left) */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        {hasDiscount && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                -{discountPct}%
            </span>
        )}
        {badge && (
            <span className={`rounded-full ${badge.color} px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow-lg`}>
                {badge.label}
            </span>
        )}
      </div>

      {/* The Reveal Layout (Bottom-up) */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
        
        {/* Info Area */}
        <div className="space-y-6">
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Sản phẩm tinh chọn</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                    {product.name}
                </h3>
            </div>

            <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Giá sở hữu</span>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        {formatCurrency(hasDiscount ? product.discountPrice : product.price)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-slate-400 line-through font-medium italic">
                            {formatCurrency(product.price)}
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
                <button 
                    onClick={handleAddToCart}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                >
                    <ShoppingBag size={16} /> Giỏ hàng
                </button>
                <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm">
                    <ArrowRight size={20} />
                </div>
            </div>
        </div>
      </div>

      {/* Subtle Bottom Bar (Visible by default to hint at product name) */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex items-center justify-between z-10 transition-opacity duration-300 group-hover:opacity-0">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[70%]">{product.name}</h4>
          <span className="text-[11px] font-bold text-indigo-600 italic">{formatCurrency(hasDiscount ? product.discountPrice : product.price)}</span>
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productApi.getFeatured();
        if (Array.isArray(response)) {
          setProducts(response);
        } else if (response && response.success) {
          setProducts(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-slate-50/50">
        <div className="container mx-auto px-6 md:px-10">
          <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-lg mb-12"></div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-[400px] animate-pulse rounded-2xl bg-white border border-slate-200/60 p-6" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="pt-10 pb-24 bg-slate-50/50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none mb-4">
            Sản phẩm nổi bật
          </h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Khám phá những thiết bị Apple được yêu thích nhất với công nghệ tiên phong và hiệu năng vượt trội.
          </p>
        </div>

        {/* Chuẩn 4 cột (vừa đủ 4 card) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
