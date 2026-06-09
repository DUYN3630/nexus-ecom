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

// --- Sub-component: Product Card (Consistent with StorePage) ---
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
      className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200/60 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300/60"
    >
      <div className="relative mb-6 block aspect-square w-full overflow-hidden rounded-xl">
        <img
          src={getProductImageUrl(product.images?.[0] || product.mainImage)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = IMAGE_ERROR_PLACEHOLDER; }}
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
              -{discountPct}%
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            title="Thêm vào giỏ"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition-all hover:scale-110 hover:bg-slate-700"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
          </button>
          {product.featuredReason && (
            <Tooltip text={product.featuredReason}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 shadow-md transition-all hover:scale-110 hover:border-slate-900">
                    <Info size={14} strokeWidth={1.5} />
                </div>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-3 text-xl font-bold leading-tight text-slate-800 line-clamp-2 uppercase tracking-tight">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Giá bán</span>
            {hasDiscount ? (
              <div>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(product.discountPrice)}
                </span>
                <br />
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <div className="flex-shrink-0 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all group-hover:bg-brand-600 group-hover:-translate-y-1">
            Chi tiết
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
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="mb-12">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none mb-3">
            Sản phẩm nổi bật
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Khám phá những thiết bị Apple được yêu thích nhất với công nghệ tiên phong.
          </p>
        </div>

        {/* Giảm số cột từ 5 xuống 4 để Card to hơn */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
