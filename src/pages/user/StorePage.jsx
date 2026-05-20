import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, Scale, ArrowRight, ChevronRight, Plus, Cpu, MessageSquare, Layers, Zap } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { Link, useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { useDispatch } from 'react-redux';
import { addToCart as addToCartAction } from '../../store/slices/cartSlice';
import '../../styles/StoreGallery.css';

const BASE_URL = 'http://127.0.0.1:5000';

const ProductCard = ({ product, getImageUrl, onAddToCart, onCompare, isComparing }) => {
  const navigate = useNavigate();

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200/60 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300/60"
    >
      <div className="relative mb-6 block aspect-square w-full overflow-hidden rounded-xl">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
              -{discountPct}%
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            title="Thêm vào giỏ"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition-all hover:scale-110 hover:bg-slate-700"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCompare(); }}
            title="So sánh"
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all hover:scale-110 border ${
              isComparing
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 hover:border-slate-900'
            }`}
          >
            <Scale size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-2 text-lg font-bold leading-tight text-slate-800 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-400">Giá bán</span>
            {hasDiscount ? (
              <div>
                <span className="text-xl font-black text-slate-900">
                  {formatCurrency(product.discountPrice)}
                </span>
                <br />
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <div className="flex-shrink-0 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-slate-900">
            Chi tiết
          </div>
        </div>

      </div>
    </div>
  );
};

const StorePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPersona, setSelectedPersona] = useState('All');
  const [compareList, setCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    fetchProducts(search, selectedCategory, selectedPersona);
  }, []);

  useEffect(() => {
    debouncedFetch(search, selectedCategory, selectedPersona);
  }, [search, selectedCategory, selectedPersona]);

  const fetchProducts = async (s, cat, persona) => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/products', { params: { search: s } });
      let data = Array.isArray(response) ? response : (response?.data || []);

      if (cat !== 'All') {
        data = data.filter((p) =>
          p.name?.toLowerCase().includes(cat.toLowerCase()) ||
          p.category?.name?.toLowerCase().includes(cat.toLowerCase())
        );
      }
      if (persona === 'Visionary') data = data.filter((p) => p.name?.includes('Max'));
      if (persona === 'Performer') data = data.filter((p) => p.name?.includes('Pro') && !p.name?.includes('Max'));
      if (persona === 'Compact') data = data.filter((p) => p.name?.includes('mini') || p.name?.includes('SE'));

      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const debouncedFetch = useCallback(
    debounce((s, cat, persona) => fetchProducts(s, cat, persona), 300),
    []
  );

  const toggleCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) return prev.filter((p) => p._id !== product._id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
    setIsCompareOpen(true);
  };
  
  const handleAddToCart = (product) => {
    dispatch(addToCartAction({ product, quantity: 1 }));
    // Consider adding a toast message for user feedback
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* SEARCH OVERLAY */}
      <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 pointer-events-none invisible'}`}>
        <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl" onClick={() => setIsSearchOpen(false)} />
        <div className="relative w-full max-w-3xl px-8">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            autoFocus={isSearchOpen}
            className="w-full bg-transparent border-b-2 border-slate-200 py-5 text-4xl font-bold outline-none placeholder:text-slate-200 focus:border-slate-900 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
          />
          <button onClick={() => setIsSearchOpen(false)} className="mt-8 text-xs uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900 transition-colors">
            ← Đóng
          </button>
        </div>
      </div>

      {/* HEADER */}
      <header className="pt-32 pb-10 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs tracking-[0.4em] text-slate-400 uppercase font-bold block mb-3">
              The Collection · {products.length} sản phẩm
            </span>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">
              Cửa hàng
            </h1>
            <p className="mt-2 max-w-lg text-sm text-slate-500">
              Khám phá toàn bộ bộ sưu tập sản phẩm công nghệ chính hãng.
            </p>
          </div>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="group flex flex-shrink-0 items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            <Search size={16} />
            Tìm kiếm
          </button>
        </div>
      </header>

      {/* STICKY FILTERS */}
      <nav className="sticky top-0 z-[100] bg-slate-50/95 backdrop-blur-md border-y border-slate-200 py-3.5 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'iPhone', 'Mac', 'iPad', 'Watch', 'Accessories'].map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedCategory(opt)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200 ${
                  selectedCategory === opt
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['Visionary', 'Performer', 'Compact'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPersona((prev) => (prev === p ? 'All' : p))}
                className={`px-4 py-2 rounded-full border text-xs uppercase tracking-widest font-bold transition-all duration-200 ${
                  selectedPersona === p
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-400 hover:border-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* PRODUCT GRID */}
      <main className="py-16 px-6 md:px-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[380px] rounded-2xl bg-white p-6 border border-slate-200/60">
                <div className="aspect-square w-full rounded-xl bg-slate-200 animate-pulse mb-6" />
                <div className="h-6 w-3/4 rounded-md bg-slate-200 animate-pulse mb-3" />
                <div className="h-4 w-1/2 rounded-md bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
            <p className="text-3xl font-black text-slate-300">Không tìm thấy sản phẩm.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedPersona('All'); }}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Xoá bộ lọc →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                getImageUrl={getImageUrl}
                onAddToCart={() => handleAddToCart(product)}
                onCompare={() => toggleCompare(product)}
                isComparing={compareList.some((p) => p._id === product._id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ELITE SERVICES SECTION */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-slate-900 transition-all duration-500">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <MessageSquare size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors">Trợ giúp chuyên gia</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed group-hover:text-slate-400 transition-colors">Đội ngũ kỹ thuật viên am hiểu sản phẩm luôn sẵn sàng tư vấn trực tiếp 24/7.</p>
              <Link to="/support" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 group-hover:text-white">
                Bắt đầu trò chuyện <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-10 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-slate-900 transition-all duration-500">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Layers size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors">So sánh thiết bị</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed group-hover:text-slate-400 transition-colors">Xem sự khác biệt về cấu hình và tính năng để đưa ra quyết định chính xác nhất.</p>
              <Link to="/compare" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 group-hover:text-white">
                So sánh ngay <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-10 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-slate-900 transition-all duration-500">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Zap size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors">Trade-in lên đời</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed group-hover:text-slate-400 transition-colors">Thu cũ đổi mới với mức giá hỗ trợ tốt nhất thị trường, thủ tục trong 15 phút.</p>
              <Link to="/store" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 group-hover:text-white">
                Định giá máy cũ <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEXUS ELITE NEWSLETTER */}
      <section className="pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="relative bg-slate-50 border border-slate-100 rounded-[48px] p-12 md:p-24 overflow-hidden text-center shadow-sm">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-600">Nexus Community</span>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter leading-tight">Gia nhập cộng đồng <br/> Nexus Elite.</h2>
                <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
                  Nhận đặc quyền sớm nhất về các dòng sản phẩm Apple mới và các ưu đãi kỹ thuật giới hạn hàng tháng.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
                <input
                  type="email"
                  placeholder="Địa chỉ Email của bạn"
                  className="w-full h-14 px-8 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all shadow-sm"
                />
                <button className="w-full sm:w-auto h-14 px-10 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON DRAWER */}
      <div className={`fixed bottom-0 left-0 right-0 z-[150] transition-all duration-700 ${compareList.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className={`max-w-5xl mx-auto bg-white border border-slate-200 rounded-t-2xl shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ${isCompareOpen ? 'h-[520px]' : 'h-[72px]'}`}>
          <div
            className="h-[72px] px-8 flex items-center justify-between cursor-pointer border-b border-slate-100"
            onClick={() => setIsCompareOpen(!isCompareOpen)}
          >
            <div className="flex -space-x-2">
              {compareList.map((p) => (
                <div key={p._id} className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 overflow-hidden p-0.5">
                  <img src={getImageUrl(p.images[0])} className="w-full h-full object-contain" alt="" />
                </div>
              ))}
              {compareList.length < 3 && (
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                  <Plus size={13} />
                </div>
              )}
            </div>
            <div className="flex-1 px-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                So sánh nhanh ({compareList.length}/3)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); setCompareList([]); }}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                Xóa hết
              </button>
              <ChevronRight size={15} className={`-rotate-90 transition-transform duration-500 ${isCompareOpen ? 'rotate-90' : ''}`} />
            </div>
          </div>

          <div className="px-8 py-5 grid grid-cols-3 gap-6">
            {compareList.map((p) => (
              <div key={p._id} className="space-y-3">
                <div className="aspect-square bg-slate-50 rounded-xl p-4 flex items-center justify-center">
                  <img src={getImageUrl(p.images[0])} className="max-h-full object-contain" alt="" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-2 text-slate-800">{p.name}</h4>
                  <div className="space-y-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex justify-between border-b pb-1.5">
                      <span>Giá</span>
                      <span className="text-slate-900">{formatCurrency(p.discountPrice || p.price)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span>Chip</span><span className="text-slate-900">A18 Pro</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5">
                      <span>Camera</span><span className="text-slate-900">48MP</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="w-full mt-3 py-2.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default StorePage;
