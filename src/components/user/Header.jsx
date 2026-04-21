import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, User, Menu, Cpu, LogOut, ChevronDown, Package, Settings, Star, ChevronRight, Heart
} from 'lucide-react';
import { NAV_CATEGORIES } from '../../constants/userContent';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import trackingApi from '../../api/trackingApi'; // Import tracking API

const Header = ({ cartCount, onOpenMobileMenu, topOffset = 0 }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { wishlist } = useWishlist();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/'); 
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (path, catId = null) => {
    if (catId === 'store') {
      navigate('/store');
    } else if (catId === 'iphone') {
      navigate('/iphone');
    } else if (catId === 'mac') {
      navigate('/mac');
    } else if (catId === 'ipad') {
      navigate('/ipad');
    } else if (catId === 'watch') {
      navigate('/watch');
    } else if (catId === 'tv-ent') {
      navigate('/tv');
    } else if (catId === 'acc') {
      navigate('/accessories');
    } else if (catId === 'about') {
      navigate('/about');
    } else {
      navigate(path);
    }
    setActiveMenu(null);
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      trackingApi.trackEvent('search_keyword', { keyword: searchQuery.trim() });
      navigate(`/iphone?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      e.target.blur();
    }
  };

  return (
    <header 
      style={{ top: topOffset }}
      className={`fixed left-0 right-0 z-[100] transition-all duration-300 ease-in-out ${
        isScrolled 
        ? 'bg-white/90 backdrop-blur-md h-auto border-b border-slate-100 shadow-sm' 
        : 'bg-white'
      }`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-10 flex items-center justify-between gap-6 md:gap-20">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0" onClick={() => handleNavClick('/')}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-110">
            <Cpu size={16} strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-black tracking-[0.2em] uppercase text-black hidden sm:block">Tech<span className="text-slate-400">Store</span></span>
        </div>

        {/* Ô Tìm kiếm */}
        <div className="flex-1 max-w-xl relative group">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearchFocused ? 'text-black' : 'text-slate-300'}`}>
            <Search size={16} strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full bg-slate-50 border border-transparent rounded-full py-2 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest text-black placeholder:text-slate-300 focus:bg-white focus:border-slate-200 transition-all outline-none"
          />
        </div>

        {/* Tiện ích người dùng */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-full transition-all border border-slate-100"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white overflow-hidden shadow-sm">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-black text-[10px]">{user?.name?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                    <span className="text-[11px] font-black text-black hidden md:block max-w-[80px] truncate uppercase tracking-tighter">
                        {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* --- A. DROPDOWN TÀI KHOẢN (MINI PROFILE CARD) --- */}
                {showUserDropdown && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-[110]">
                        
                        {/* 1. Header: Avatar & Thông tin */}
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg ring-2 ring-white relative">
                                {user?.name?.charAt(0) || 'U'}
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[14px] font-black text-black truncate leading-tight">{user?.name}</h4>
                                <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{user?.email}</p>
                                <div className="mt-1.5">
                                  <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                                    {user?.role?.toUpperCase() === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                                  </span>
                                </div>
                              </div>
                            </div>
                        </div>
                        
                        {/* 2. Body: Các chức năng chính */}
                        <div className="p-2">
                          <div className="space-y-0.5">
                            {/* My Profile */}
                            <button 
                                onClick={() => { setShowUserDropdown(false); navigate('/user/account'); }}
                                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 hover:bg-slate-50 hover:text-black flex items-center gap-3 transition-all rounded-lg group"
                            >
                                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-black group-hover:shadow-sm transition-all">
                                  <User size={14} strokeWidth={2.5} /> 
                                </div>
                                Hồ sơ của tôi
                            </button>

                            {/* My Orders */}
                            <button 
                                onClick={() => { setShowUserDropdown(false); navigate('/user/account/orders'); }}
                                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 hover:bg-slate-50 hover:text-black flex items-center justify-between transition-all rounded-lg group"
                            >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-black group-hover:shadow-sm transition-all">
                                    <Package size={14} strokeWidth={2.5} /> 
                                  </div>
                                  Đơn hàng của tôi
                                </div>
                            </button>

                            {/* Purchased Products (Experience Center) */}
                            <button 
                                onClick={() => { setShowUserDropdown(false); navigate('/purchased-products'); }}
                                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 hover:bg-slate-50 hover:text-black flex items-center justify-between transition-all rounded-lg group"
                            >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                                    <ShoppingBag size={14} strokeWidth={2.5} /> 
                                  </div>
                                  Sản phẩm đã mua
                                </div>
                            </button>

                            {/* Wishlist */}
                            <button 
                                onClick={() => { setShowUserDropdown(false); navigate('/wishlist'); }}
                                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 hover:bg-slate-50 hover:text-black flex items-center gap-3 transition-all rounded-lg group"
                            >
                                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-amber-500 group-hover:shadow-sm transition-all">
                                  <Heart size={14} strokeWidth={2.5} /> 
                                </div>
                                Danh sách yêu thích
                            </button>
                          </div>

                          {/* 3. Phần đặc biệt (ADMIN) */}
                          {user?.role?.toLowerCase() === 'admin' && (
                            <div className="mt-2 pt-2 border-t border-slate-50 px-1">
                               <button 
                                  onClick={() => { 
                                    setShowUserDropdown(false); 
                                    window.open('/admin', '_blank');
                                  }}
                                  className="w-full text-left px-3 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-orange-600 bg-orange-50 border border-orange-100 flex items-center justify-between transition-all rounded-lg shadow-sm shadow-orange-100 group hover:bg-orange-100/50"
                              >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center text-white shadow-md shadow-orange-200 group-hover:rotate-6 transition-transform">
                                      <Settings size={14} strokeWidth={3} /> 
                                    </div>
                                    Bảng quản trị
                                  </div>
                                  <ChevronRight size={12} className="text-orange-300 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* 4. Footer: Nút Sign Out tách biệt */}
                        <div className="p-2 bg-slate-50/50 border-t border-slate-100">
                          <button 
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center gap-2.5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-red-500 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all rounded-lg border border-transparent hover:border-red-100"
                          >
                              <LogOut size={14} strokeWidth={2.5} /> 
                              Đăng xuất
                          </button>
                        </div>
                    </div>
                )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
                <button className="hidden md:block px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-colors" onClick={() => handleNavClick('/login')}>Đăng nhập</button>
                <button className="hidden md:block px-5 py-2 text-[11px] font-black uppercase tracking-widest bg-black text-white rounded-full hover:bg-slate-800 transition-all" onClick={() => handleNavClick('/register')}>Đăng ký</button>
            </div>
          )}

          <button className="p-1.5 text-slate-400 hover:text-black transition-all hover:scale-110 relative" onClick={() => handleNavClick('/wishlist')}>
            <Heart size={18} strokeWidth={1.5} />
            {wishlist?.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {wishlist.length}
              </span>
            )}
          </button>

          <button className="p-1.5 text-slate-400 hover:text-black transition-all hover:scale-110 relative" onClick={() => handleNavClick('/cart')}>
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
          
          <button className="p-2 -mr-2 text-black hover:bg-slate-100 rounded-full transition-all" onClick={onOpenMobileMenu}>
            <Menu size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Menu Điều hướng Chính (Desktop) */}
      <nav className="hidden lg:block border-t border-slate-50 relative">
        <div className="max-w-7xl mx-auto px-10 h-10 flex items-center justify-center gap-12">
          {NAV_CATEGORIES.map((cat) => (
            <div key={cat.id} className="h-full flex items-center" onMouseEnter={() => setActiveMenu(cat.id)}>
              <button onClick={() => handleNavClick(null, cat.id)} className={`text-[9.5px] font-black uppercase tracking-[0.25em] transition-all hover:text-black relative ${activeMenu === cat.id ? 'text-black' : 'text-slate-400'}`}>
                {cat.name}
                <span className={`absolute -bottom-[13px] left-0 right-0 h-0.5 bg-black transition-all duration-300 ${activeMenu === cat.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}></span>
              </button>
            </div>
          ))}
        </div>

        {/* Mega Menu */}
        <div className={`absolute top-full left-0 right-0 bg-white border-t border-slate-50 shadow-2xl transition-all duration-500 overflow-hidden ${activeMenu ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="max-w-7xl mx-auto px-12 py-10">
            <div className="grid grid-cols-6 gap-12">
              <div className="col-span-1 border-r border-slate-50 pr-8 flex flex-col gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  {activeMenu && React.createElement(NAV_CATEGORIES.find(c => c.id === activeMenu).icon, { size: 20, strokeWidth: 1.5 })}
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">{activeMenu && NAV_CATEGORIES.find(c => c.id === activeMenu).name}</h4>
                  <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">Khám phá bộ sưu tập</p>
                </div>
              </div>
              <div className="col-span-5 grid grid-cols-4 gap-y-6 gap-x-8">
                {activeMenu && NAV_CATEGORIES.find(c => c.id === activeMenu).children.map((sub) => (
                  <div key={sub.id} className="flex flex-col gap-1 cursor-pointer group/item" onClick={() => handleNavClick(null, activeMenu)}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover/item:text-black transition-colors">{sub.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;