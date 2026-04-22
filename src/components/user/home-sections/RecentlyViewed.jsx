import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, X, History } from 'lucide-react';
import useRecentlyViewed from '../../../hooks/useRecentlyViewed';
import getProductImageUrl from '../../../utils/getProductImageUrl';

const RecentlyViewed = () => {
  const { recentProducts } = useRecentlyViewed();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !recentProducts || recentProducts.length < 3) return null;

  return (
    <section className="py-24 bg-[#FBFBFB] border-t border-slate-100/60">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        
        {/* Header Compact */}
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                   <History size={18} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Tiếp tục khám phá</h3>
            </div>
            <button 
                onClick={() => setIsVisible(false)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-all"
            >
                <X size={14} /> Ẩn mục này
            </button>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recentProducts.slice(0, 5).map((p) => (
            <div 
              key={p._id} 
              onClick={() => navigate(`/product/${p.slug}`)}
              className="group cursor-pointer bg-white rounded-xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/20 transition-all duration-500"
            >
              <div className="aspect-square w-full bg-[#FBFBFB] rounded-2xl overflow-hidden mb-4 p-4">
                <img
                  src={getProductImageUrl(p)}
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                />
              </div>              
              <div className="px-1 space-y-1">
                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                    {p.name}
                 </h4>
                 <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    {typeof p.price === 'number' ? p.price.toLocaleString('vi-VN') + '₫' : p.price}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;