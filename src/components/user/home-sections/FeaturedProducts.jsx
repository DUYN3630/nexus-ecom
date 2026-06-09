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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCartAction({ product, quantity: 1 }));
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col rounded-[32px] border border-slate-200/60 bg-white p-7 text-left shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-slate-300/60"
    >
      <div className="relative mb-5 block aspect-square w-full overflow-hidden rounded-2xl bg-slate-50">
        <img
          src={getProductImageUrl(product.images?.[0] || product.mainImage)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = IMAGE_ERROR_PLACEHOLDER; }}
        />
        
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-10">
            <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              -{discountPct}%
            </span>
          </div>
        )}

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition-all hover:scale-110 hover:bg-slate-700"
          >
            <ShoppingBag size={18} strokeWidth={2} />
          </button>
          {product.featuredReason && (
            <Tooltip text={product.featuredReason}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white backdrop-blur-md border border-slate-200 text-slate-700 shadow-xl transition-all hover:scale-110 hover:border-slate-900">
                    <Info size={18} strokeWidth={2} />
                </div>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-4 text-lg font-black leading-tight text-slate-800 line-clamp-2 uppercase tracking-tight h-12">
          {product.name}
        </h3>

        <div className="mt-auto space-y-4">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Giá bán chính thức</span>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="text-sm text-slate-400 line-through mt-1.5 opacity-70">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-black text-slate-900 leading-none">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 group-hover:shadow-xl group-hover:shadow-slate-900/10">
            Chi tiết sản phẩm
          </div>
        </div>
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
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="mb-16">
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
