import { Search, Bell, Menu, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminHeader = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu /></button>
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-500" />
          <input type="text" className="w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-slate-50 text-sm focus:bg-white outline-none focus:ring-1 focus:ring-brand-500" placeholder="Tìm kiếm..." />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Nút Xem cửa hàng mới */}
        <Link 
          to="/" 
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all border border-transparent hover:border-brand-100"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Xem cửa hàng</span>
        </Link>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hệ thống ổn định</span>
        </div>
      </div>
    </header>
  );
};