import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import productApi from '../../../api/productApi';
import trackingApi from '../../../api/trackingApi';
import getProductImageUrl from '../../../utils/getProductImageUrl';

// --- Sub-component: Tooltip ---
const Tooltip = ({ text, children }) => {
  return (
    <div className="group relative flex justify-center">
      {children}
      <span className="absolute bottom-full mb-2 w-max max-w-xs scale-0 transform rounded-lg bg-gray-800 p-2 text-center text-xs text-white transition-all group-hover:scale-100 origin-bottom">
        {text}
      </span>
    </div>
  );
};

// --- Sub-component: Product Card ---
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
  
    const imageUrl = getProductImageUrl(product);

    const handleCardClick = () => {
        navigate(`/product/${product.slug}`);
    };

    return (
        <div 
            onClick={handleCardClick}
            className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200/60 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300/60"
        >
            {/* --- HEADER: IMAGE & TOOLTIP --- */}
            <div className="relative mb-6 block aspect-square w-full overflow-hidden rounded-xl">
                 <img 
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Error'; }}
                />
                {product.featuredReason && (
                    <div className="absolute top-3 right-3 z-10">
                        <Tooltip text={product.featuredReason}>
                            <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/70 backdrop-blur-sm transition-colors hover:bg-white">
                                <Info size={16} className="text-slate-600" />
                            </div>
                        </Tooltip>
                    </div>
                )}
            </div>

            {/* --- BODY: INFO --- */}
            <div className="flex flex-1 flex-col">
                <h3 className="mb-2 text-lg font-bold leading-tight text-slate-800">
                    {product.name}
                </h3>

                {product.keyBenefit && (
                    <p className="mb-4 text-sm text-slate-500 line-clamp-1">
                        {product.keyBenefit}
                    </p>
                )}
                
                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Giá bán</span>
                        <span className="text-xl font-black text-slate-900">
                            {product.price?.toLocaleString('vi-VN')}₫
                        </span>
                    </div>
                    {/* The main div's onClick handles navigation now */}
                    <div
                        className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-slate-900"
                    >
                        Chi tiết
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Component: FeaturedProducts ---
const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const sessionId = trackingApi.getSessionId();
        const featuredProducts = await productApi.getFeatured(sessionId); 
        setProducts(Array.isArray(featuredProducts) ? featuredProducts : []);
      } catch (error) {
        console.error("Featured API fetch failed:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (isLoading) {
    // --- SKELETON LOADER ---
    return (
        <section className="py-20 bg-slate-50">
            <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
                 <div className="mb-12 h-10 w-1/3 rounded-lg bg-slate-200 animate-pulse"></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-[420px] rounded-2xl bg-white p-6">
                            <div className="aspect-square w-full rounded-xl bg-slate-200 animate-pulse mb-6"></div>
                            <div className="h-6 w-3/4 rounded-md bg-slate-200 animate-pulse mb-3"></div>
                            <div className="h-4 w-1/2 rounded-md bg-slate-200 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
  }

  // --- NEW: EMPTY STATE FOR NEW USERS ---
  if (products.length === 0) {
    return null; // As requested, do not show the empty state welcome message.
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        
        {/* --- HEADER (Updated Microcopy) --- */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-900">
                    Gợi ý dành cho bạn
                </h2>
                <p className="mt-2 max-w-lg text-sm text-slate-500">
                    Được lựa chọn dựa trên sở thích và hành vi của bạn để mang lại trải nghiệm tốt nhất.
                </p>
            </div>
            <button 
                onClick={() => navigate('/iphone')}
                className="group flex flex-shrink-0 items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
                Xem tất cả sản phẩm <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;