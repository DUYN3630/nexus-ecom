import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu } from 'lucide-react';

const PageHeader = ({ scrollY }) => {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${scrollY > 50 ? 'bg-white/70 backdrop-blur-2xl py-3 border-b border-[#D2D2D7]/30 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1100px] mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">iPhone</span>
        </div>
        <div className="hidden md:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-[#1D1D1F]">
          <Link to="/iphone" className="hover:opacity-50 transition-opacity">Sản phẩm</Link>
          <Link to="/compare" className="hover:opacity-50 transition-opacity">So sánh</Link>
          <Link to="/accessories" className="hover:opacity-50 transition-opacity">Phụ kiện</Link>
        </div>
        <div className="flex items-center gap-6">
          <ShoppingBag size={18} strokeWidth={2.5} className="cursor-pointer hover:opacity-50 transition-opacity" />
          <Menu size={20} className="md:hidden cursor-pointer" />
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
