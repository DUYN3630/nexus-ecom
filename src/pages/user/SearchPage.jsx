import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ArrowRight, Filter, X } from 'lucide-react';
import productApi from '../../api/productApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCard from '../../components/common/ProductCard';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productApi.getAll({ search: searchTerm, limit: 50 });
        setProducts(response.data || []);
      } catch (err) {
        console.error("Search Error:", err);
        setError("Không thể tải kết quả tìm kiếm.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Search Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 text-slate-400 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Kết quả tìm kiếm cho</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              "{searchTerm}"
            </h1>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Tìm thấy {products.length} sản phẩm
            </p>
          </div>
        </div>

        {/* Results Area */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-500 font-bold uppercase tracking-widest text-xs">{error}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">Không tìm thấy sản phẩm nào</h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-8">Hãy thử tìm kiếm với từ khóa khác</p>
            <button 
              onClick={() => navigate('/store')}
              className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-600 transition-all shadow-xl"
            >
              Quay lại cửa hàng
            </button>
          </div>
        )}

        {/* Suggestions if no results */}
        {products.length === 0 && !loading && (
          <div className="mt-20">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 border-b border-slate-100 pb-4">Gợi ý dành cho bạn</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['iPhone 15', 'MacBook M3', 'Apple Watch', 'iPad Pro'].map((keyword) => (
                <button 
                  key={keyword}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(keyword)}`)}
                  className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-black transition-all text-left group"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tìm kiếm</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black uppercase italic tracking-tight">{keyword}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;