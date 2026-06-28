import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart as addToCartAction } from '../../../store/slices/cartSlice';
import productApi from '../../../api/productApi';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getProductImageUrl, IMAGE_ERROR_PLACEHOLDER } from '../../../utils/getProductImageUrl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const getScarcityBadge = () => {
    if (product.stock <= 5 && product.stock > 0) return { label: 'Sắp hết hàng', color: 'bg-orange-500' };
    if (product.isBestSeller || Math.random() > 0.8) return { label: 'Bán chạy', color: 'bg-cara-accent-alt' };
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
      className="cara-product-card group relative flex flex-col rounded-[32px] overflow-hidden bg-white border border-slate-100 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] cursor-pointer h-[450px]"
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
                <span className="text-[10px] font-bold text-cara-accent-alt uppercase tracking-[0.2em]">Sản phẩm tinh chọn</span>
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
                    className="flex-1 py-4 bg-cara-accent text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-cara-accent-alt transition-all active:scale-95 shadow-xl shadow-slate-900/10"
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
          <span className="text-[11px] font-bold text-cara-accent-alt italic">{formatCurrency(hasDiscount ? product.discountPrice : product.price)}</span>
      </div>
    </div>
  );
};

export const CaraFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  const scrollTrack = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector('.cara-product-card')?.clientWidth || 300;
    const offset = direction === 'left' ? -cardWidth - 24 : cardWidth + 24;
    track.scrollBy({ left: offset, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productApi.getFeatured();
        if (Array.isArray(response)) {
          setProducts(response.slice(0, 8)); // Limit to max 8 items
        } else if (response && response.success) {
          setProducts((response.data || []).slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0) return;

    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('.cara-product-card');

    const scrollAnim = gsap.fromTo(cards,
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
        }
      }
    );

    return () => {
      scrollAnim.kill();
      if (scrollAnim.scrollTrigger) scrollAnim.scrollTrigger.kill();
    };
  }, [loading, products]);

  if (loading) {
    return (
      <section className="py-24 bg-cara-accent/5 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
          <div className="h-10 w-64 bg-black/5 animate-pulse rounded-lg mb-12" />
          <div className="flex gap-6 overflow-hidden py-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[450px] animate-pulse rounded-[32px] bg-white border border-slate-100/60 w-[80vw] sm:w-[45vw] lg:w-[calc((100%-72px)/4)] flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-cara-accent/5 overflow-hidden relative select-none"
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-cara-accent font-bold mb-3">THIẾT BỊ KHUYÊN DÙNG</div>
            <h2 className="text-4xl md:text-5xl font-bold text-cara-ink tracking-tight uppercase">
              Sản phẩm nổi bật
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => scrollTrack('left')}
              className="w-12 h-12 rounded-full border border-slate-200/60 flex items-center justify-center bg-white text-cara-ink hover:bg-cara-ink hover:text-white transition-all duration-300 shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => scrollTrack('right')}
              className="w-12 h-12 rounded-full border border-slate-200/60 flex items-center justify-center bg-white text-cara-ink hover:bg-cara-ink hover:text-white transition-all duration-300 shadow-sm"
            >
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/store')}
              className="group flex items-center gap-3 font-semibold uppercase tracking-wider text-xs text-cara-ink transition-all duration-300 pl-4"
            >
              <span className="relative">
                Xem tất cả
                <span className="absolute bottom-[-4px] left-0 w-0 h-[1.5px] bg-cara-accent transition-all duration-300 group-hover:w-full" />
              </span>
              <div className="w-8 h-8 rounded-full bg-cara-ink text-white flex items-center justify-center group-hover:bg-cara-accent-alt transition-colors duration-300">
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Horizontal Slider Layout */}
        <div className="relative">
          <div 
            ref={trackRef}
            className="flex gap-6 overflow-x-auto scroll-snap-x scrollbar-hide py-6 -mx-8 px-8"
            style={{ 
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {products.map((product) => (
              <div key={product._id || product.id} className="scroll-snap-align-start flex-shrink-0 w-[80vw] sm:w-[45vw] lg:w-[calc((100%-72px)/4)]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaraFeaturedProducts;
