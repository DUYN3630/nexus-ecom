import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, ShieldCheck, AlertCircle, Cpu, Camera, 
  Battery, Smartphone, Zap, ArrowRight, ShoppingBag, Heart, Check
} from 'lucide-react';
import ImageGallery from '../../../components/user/product-detail/ImageGallery';
import ProductInfo from '../../../components/user/product-detail/ProductInfo';
import AiInsightSection from '../../../components/user/product-detail/AiInsightSection';
import ReviewSection from '../../../components/user/product-detail/ReviewSection';
import useRecentlyViewed from '../../../hooks/useRecentlyViewed';
import useProductDetail from '../../../hooks/useProductDetail';
import trackingApi from '../../../api/trackingApi';
import usePageTiming from '../../../hooks/usePageTiming';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useCart } from '../../../contexts/CartContext';
import { useToast } from '../../../contexts/ToastContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import '../../../styles/ProductDetailEditorial.css';

const RelatedProductsSection = lazy(() => import('../../../components/user/product-detail/RelatedProductsSection'));

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // Sử dụng slug thay vì id
  const [selection, setSelection] = useState({ color: null, storage: null });
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const { product, isLoading, error } = useProductDetail(slug);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (product) {
      trackingApi.trackEvent('view_product', {
        productId: product._id,
        productName: product.name,
        category: product.category?.name,
      });
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return product.price || 0;
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    setIsAdding(true);

    // Track the 'add_to_cart' event
    trackingApi.trackEvent('add_to_cart', {
      productId: product._id,
      productName: product.name,
      quantity: quantity,
      price: currentPrice,
      selectedOptions: selection,
    });
    
    // Call Context Action
    addToCart(product, quantity, selection);
    
    addToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
    
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, selection);
    navigate('/checkout');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-px bg-stone-200 animate-pulse w-24"></div></div>;

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <AlertCircle size={40} strokeWidth={1} className="text-stone-300" />
      <h2 className="text-4xl font-serif italic">Not Found.</h2>
      <button onClick={() => navigate('/store')} className="text-[10px] uppercase tracking-widest font-bold border-b border-stone-900 pb-1">Trở lại bộ sưu tập</button>
    </div>
  );

  const API_URL = 'http://127.0.0.1:5000';
  const productImages = (product.images && product.images.length > 0)
    ? product.images.map(img => img.startsWith('http') ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`)
    : ['https://placehold.co/600x600?text=No+Image'];

  return (
    <div className="bg-[#F7F7F7] min-h-screen text-stone-900 selection:bg-stone-900 selection:text-white overflow-x-hidden">
      
      {/* HEADER SECTION (EDITORIAL) */}
      <section className="pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
        <nav className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-12">
          <button onClick={() => navigate('/')}>Trang chủ</button>
          <div className="w-1 h-1 rounded-full bg-stone-300" />
          <span>{product.category?.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-end">
          <div className="lg:col-span-8 space-y-8">
            <h1 className="text-6xl md:text-9xl font-serif italic editorial-title tracking-tighter">
              {product.name.split(' ').slice(0, -2).join(' ')} <br />
              <span className="not-italic text-stone-400">{product.name.split(' ').slice(-2).join(' ')}</span>
            </h1>
          </div>
          <div className="lg:col-span-4 pb-4">
            <p className="text-stone-400 text-lg font-light leading-relaxed max-w-sm">
              {product.description?.slice(0, 150)}...
            </p>
          </div>
        </div>
      </section>

      {/* MAIN GALLERY & INFO */}
      <section className="px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
        <div className="lg:col-span-7">
          <div className="sticky top-32">
            <ImageGallery images={productImages} />
          </div>
        </div>
        <div className="lg:col-span-5 space-y-20">
          <div className="pt-12">
            <ProductInfo 
              product={{
                ...product,
                originalPrice: product.originalPrice || (product.price * 1.1),
                rating: product.rating || 5.0,
                reviewCount: product.reviewCount || 0,
                specs: [],
                badge: product.stock > 0 ? 'Sẵn hàng' : 'Số lượng có hạn',
                options: product.options || []
              }}
              currentPrice={currentPrice}
              selection={selection}
              setSelection={setSelection}
              quantity={quantity}
              setQuantity={setQuantity}
              isAdding={isAdding}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
            />
          </div>

          <div className="blueprint-grid border border-stone-200 rounded-[40px] p-12 space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[8px] font-mono text-stone-300 uppercase rotate-90 origin-top-right">Ref: NX-2024-IP</div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-400">Thông số kỹ thuật</h4>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <Cpu size={24} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-widest">Chip A18 Pro</p>
                <p className="text-[10px] text-stone-500 leading-relaxed uppercase">6 nhân CPU | 6 nhân GPU | 16 nhân Neural Engine</p>
              </div>
              <div className="space-y-4">
                <Camera size={24} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-widest">Hệ thống Camera Pro</p>
                <p className="text-[10px] text-stone-500 leading-relaxed uppercase">48MP Main | 5x Telephoto | Ultra Wide</p>
              </div>
              <div className="space-y-4">
                <Battery size={24} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-widest">Thời lượng Pin</p>
                <p className="text-[10px] text-stone-500 leading-relaxed uppercase">Lên đến 29 giờ xem video liên tục</p>
              </div>
              <div className="space-y-4">
                <Smartphone size={24} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-widest">Màn hình Pro</p>
                <p className="text-[10px] text-stone-500 leading-relaxed uppercase">Super Retina XDR | Công nghệ ProMotion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE MATERIAL STORY */}
      <section className="py-48 mt-48 bg-stone-900 text-white overflow-hidden relative">
        <div 
          className="absolute inset-0 opacity-30 grayscale contrast-125"
          style={{ 
            backgroundImage: `url(${productImages[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${(scrollY - 2000) * 0.1}px)`
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-12">
          <span className="text-xs tracking-[0.5em] uppercase text-stone-500 font-bold">Chế tác cao cấp</span>
          <h2 className="text-5xl md:text-8xl font-serif italic leading-none">Titanium <br /> Đẳng cấp mới.</h2>
          <p className="text-stone-400 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Mạnh mẽ hơn, nhẹ hơn và cực kỳ bền bỉ. Nexus nâng tầm tiêu chuẩn chế tác với lớp hoàn thiện Titanium cấp độ 5.
          </p>
          <div className="pt-12">
            <div className="w-px h-24 bg-gradient-to-b from-stone-50 to-transparent mx-auto" />
          </div>
        </div>
      </section>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <AiInsightSection 
          productName={product.name} 
          productPrice={product.price}
          productDescription={product.description}
        />

        {/* REVIEW SECTION */}
        <ReviewSection productId={product._id} />

        <Suspense fallback={<div className="h-96 flex items-center justify-center text-[10px] uppercase tracking-widest text-stone-400">Đang tải bộ sưu tập liên quan...</div>}>
          <RelatedProductsSection currentProductId={product._id} />
        </Suspense>
      </div>

      {/* FLOATING ACTION BAR */}
      <div className="fixed bottom-8 left-0 right-0 z-[100] px-6 animate-float-up">
        <div className="max-w-3xl mx-auto bg-stone-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-2xl">
          <div className="px-6 hidden md:block border-r border-white/10 mr-6">
            <p className="text-[8px] uppercase tracking-[0.3em] text-stone-500 font-black mb-1">Sản phẩm</p>
            <p className="text-xs font-bold text-white truncate max-w-[150px]">{product.name}</p>
          </div>
          <div className="flex-1">
            <p className="text-[8px] uppercase tracking-[0.3em] text-stone-500 font-black mb-1">Giá trị đầu tư</p>
            <p className="text-xl font-serif italic text-white">{formatCurrency(currentPrice)}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => toggleWishlist(product)}
              className={`p-4 transition-colors hidden md:block ${isLiked ? 'text-rose-500' : 'text-white hover:text-rose-400'}`}
            >
              <Heart size={20} strokeWidth={1.5} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="bg-white text-stone-900 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center gap-3"
            >
              {isAdding ? <><Check size={16} /> Đã thêm</> : <><ShoppingBag size={16} /> Thêm vào túi</>}
            </button>
          </div>
        </div>
      </div>

      <div className="h-48" />
    </div>
  );
};

export default ProductDetailPage;
