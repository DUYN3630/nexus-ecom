import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ChevronDown, Home, LogOut, ShieldCheck, MapPin, Newspaper, Phone, Sparkles
} from 'lucide-react';
import { NAV_CATEGORIES } from '../../constants/userContent';
import { AuthContext } from '../../contexts/AuthContext';

const MobileMenu = ({ isOpen, onClose }) => {
  const [expandedCat, setExpandedCat] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const handleLinkClick = (path) => {
    navigate(path);
    onClose();
  };

  const handleCategoryClick = (catId) => {
    const paths = {
      'iphone': '/iphone',
      'mac': '/mac',
      'ipad': '/ipad',
      'watch': '/watch',
      'tv-ent': '/tv',
      'acc': '/accessories',
      'store': '/store'
    };
    navigate(paths[catId] || '/store');
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  // Hàm bổ trợ để lấy tên "Thế giới..." đồng nhất
  const getUnifiedName = (cat) => {
    const map = {
      'iphone': 'Thế giới iPhone',
      'mac': 'Thế giới Mac',
      'ipad': 'Thế giới iPad',
      'watch': 'Thế giới Watch',
      'tv-ent': 'Thế giới Giải trí',
      'acc': 'Thế giới Phụ kiện'
    };
    return map[cat.id] || `Khám phá ${cat.name}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[120] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* TOP: GREETING BANNER */}
        <div className="bg-slate-950 text-white p-6 pt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors z-20">
            <X size={24} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300 border border-white/5">
                Nexus Store Discovery
              </div>
            </div>
            
            <h2 className="text-xl font-black uppercase tracking-tight leading-tight">
              Chào {isAuthenticated ? (user?.name?.split(' ')[0] || 'Duy') : 'Bạn'},<br/>
              <span className="text-white/40">hôm nay bạn muốn tìm gì?</span>
            </h2>

            {!isAuthenticated && (
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => handleLinkClick('/login')}
                  className="flex-1 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-white/5"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => handleLinkClick('/register')}
                  className="flex-1 py-3 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 backdrop-blur-sm"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: NAVIGATION HUB */}
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Danh mục sản phẩm</p>
               <Sparkles size={12} className="text-indigo-400" />
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => handleLinkClick('/')}
                className="w-full flex items-center gap-4 py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-slate-800 hover:bg-slate-50 transition-all"
              >
                <Home size={18} className="text-slate-400" /> Trang chủ
              </button>

              {NAV_CATEGORIES.map(cat => (
                <div key={cat.id} className="space-y-1">
                  <button 
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${expandedCat === cat.id ? 'bg-slate-50 text-black shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                       <cat.icon size={18} strokeWidth={1.5} className={expandedCat === cat.id ? 'text-black' : 'text-slate-400'} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${expandedCat === cat.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${expandedCat === cat.id ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className="pl-11 pr-4 py-2 space-y-2 border-l-2 border-slate-50 ml-6">
                      
                      {/* MỤC MỚI: Tên đồng nhất nằm bên trong dropdown */}
                      {['iphone', 'mac', 'ipad', 'watch', 'tv-ent', 'acc'].includes(cat.id) && (
                        <button 
                          onClick={() => handleCategoryClick(cat.id)}
                          className="w-full text-left py-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700 transition-colors border-b border-slate-50 mb-1"
                        >
                          {getUnifiedName(cat)}
                        </button>
                      )}

                      {cat.children.map(sub => (
                        <button 
                          key={sub.id} 
                          onClick={() => handleCategoryClick(cat.id)}
                          className="w-full text-left py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 border-b border-slate-50 pb-2">Dịch vụ & Tiện ích</p>
            <div className="grid grid-cols-1 gap-2">
               <button onClick={() => handleLinkClick('/about')} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all group text-left">
                  <ShieldCheck size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Về TechStore</span>
               </button>
               <button onClick={() => handleLinkClick('/store')} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all group text-left">
                  <MapPin size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Hệ thống cửa hàng</span>
               </button>
               <button onClick={() => handleLinkClick('/iphone')} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all group text-left">
                  <Newspaper size={18} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sản phẩm mới nhất</span>
               </button>
               <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-lg"><Phone size={14} /></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hotline hỗ trợ</p>
                      <p className="text-[11px] font-black text-black">1900.6789</p>
                    </div>
                  </div>
                  <a href="tel:19006789" className="w-full py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md shadow-indigo-100 flex items-center justify-center">
                    Gọi ngay
                  </a>
               </div>
            </div>
          </div>
        </div>

        {/* BOTTOM Action Area */}
        {isAuthenticated && (
          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <button 
               onClick={handleLogout}
               className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 transition-all"
             >
               <LogOut size={16} strokeWidth={2.5} /> Đăng xuất tài khoản
             </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileMenu;
