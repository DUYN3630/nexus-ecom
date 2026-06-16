import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ArrowLeftRight, Box, Percent, LayoutGrid, Sparkles, CreditCard, HelpCircle
} from 'lucide-react';

const QUICK_NAV_CONFIG = [
  { id: 'buy', label: 'Mua sắm', sub: 'Sản phẩm mới nhất', icon: 'ShoppingBag', route: '/products', color: 'text-blue-500' },
  { id: 'compare', label: 'So sánh', sub: 'Tìm máy phù hợp', icon: 'ArrowLeftRight', route: '/products', color: 'text-indigo-500' },
  { id: 'acc', label: 'Phụ kiện', sub: 'Ốp, sạc, AirTag', icon: 'Box', route: '/products', color: 'text-purple-500' },
  { id: 'promo', label: 'Ưu đãi', sub: 'Tiết kiệm tới 20%', icon: 'Percent', route: '/products', color: 'text-rose-500' },
  { id: 'tradein', label: 'Thu cũ', sub: 'Lên đời tiết kiệm', icon: 'Sparkles', route: '/products', color: 'text-emerald-500' },
  { id: 'payment', label: 'Trả góp', sub: 'Lãi suất 0%', icon: 'CreditCard', route: '/products', color: 'text-amber-500' },
];

const IconRenderer = ({ iconName, size = 28, className }) => {
  const icons = { 
    ShoppingBag, ArrowLeftRight, Box, Percent, LayoutGrid, Sparkles, CreditCard, HelpCircle
  };
  const IconComponent = icons[iconName] || LayoutGrid;
  return <IconComponent size={size} strokeWidth={1.5} className={className} />;
};

const QuickNav = () => {
  const navigate = useNavigate();

  return (
    <section className="py-6 md:py-10 bg-white border-b border-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-y-6">
          {QUICK_NAV_CONFIG.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(item.route)} 
              className="group cursor-pointer flex flex-col items-center text-center gap-3 flex-1 min-w-[100px] transition-all duration-300"
            >
              <div className="relative w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] group-hover:-translate-y-1.5 group-active:scale-90 overflow-hidden">
                {/* Decorative background circle on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <IconRenderer iconName={item.icon} size={24} className={`relative z-10 text-slate-400 group-hover:${item.color} transition-colors duration-300`} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 group-hover:text-black transition-colors">
                  {item.label}
                </h4>
                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickNav;

