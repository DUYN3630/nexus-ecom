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
    <section className="py-12 bg-transparent">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        
        {/* Header Compact */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <History size={16} className="text-slate-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Xem gần đây</h3>
            </div>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {recentProducts.slice(0, 8).map((p) => (
            <div 
              key={p._id} 
              onClick={() => navigate(`/product/${p.slug}`)}
              className="group cursor-pointer bg-white rounded-xl p-2 border border-slate-100 hover:border-indigo-100 transition-all duration-300"
            >
              <div className="aspect-square w-full bg-[#FBFBFB] rounded-lg overflow-hidden mb-2">
                <img
                  src={getProductImageUrl(p)}
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              </div>              
              <h4 className="text-[9px] font-bold text-slate-900 uppercase tracking-tight truncate">
                {p.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;