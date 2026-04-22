import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Smartphone, LayoutDashboard, ShoppingCart, PieChart,
  Package, Layers, Users, Megaphone, LogOut, Sparkles, Star, Shield, ChevronDown, 
  UserCog, History, ShieldCheck, Home, Moon, Sun, Settings, User, Ticket, Wrench
} from 'lucide-react';

const SidebarMenuGroup = ({ group }) => {
  const [isOpen, setIsOpen] = useState(group.isOpen || false);
  const location = useLocation();

  const isParentActive = (item) => {
    return item.children && item.children.some(child => location.pathname + location.search === child.path);
  };
  
  const handleToggle = (item) => {
    if (item.children) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{group.title}</p>
      {group.items.map((item) => (
        <div key={item.name}>
          <NavLink
            to={item.path || '#'}
            end={!item.children}
            onClick={(e) => {
              if (item.children) {
                e.preventDefault();
                handleToggle(item);
              }
            }}
            className={({ isActive }) => {
              const active = item.children ? isParentActive(item) || isActive : isActive;
              return `flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${
                active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'
              }`;
            }}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.name}
            </div>
            {item.badge && <span className="ml-auto bg-brand-100 text-brand-600 py-0.5 px-2 rounded-full text-xs font-bold">{item.badge}</span>}
            {item.children && <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
          </NavLink>

          {item.children && isOpen && (
            <div className="pl-6 mt-1 space-y-1">
              {item.children.map(child => (
                <NavLink
                  key={child.name}
                  to={child.path}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive ? 'text-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <child.icon className="w-4 h-4" />
                  {child.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


export const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: "Guest", role: "Quản trị viên" };
  const displayRole = user.role === 'Unknown' || !user.role ? "Quản trị viên cao cấp" : user.role;

  const handleLogout = () => {
    if (window.confirm("Bạn có muốn đăng xuất không?")) {
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuGroups = [
    {
      title: "Tổng quan",
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Đơn hàng', icon: ShoppingCart, path: '/admin/orders' },
        { name: 'Quản lý sửa chữa', icon: Wrench, path: '/admin/repairs' },
        { name: 'Phân tích', icon: PieChart, path: '/admin/analytics' },
        { name: 'AI Hub', icon: Sparkles, path: '/admin/ai-hub' },
      ]
    },
    {
      title: "Quản lý",
      items: [
        { name: 'Sản phẩm', icon: Package, path: '/admin/products' },
        { name: 'Danh mục', icon: Layers, path: '/admin/categories' },
        { name: 'Đánh giá', icon: Star, path: '/admin/reviews' },
        { name: 'Marketing', icon: Megaphone, path: '/admin/marketing' },
      ]
    },
    {
      title: "Tài khoản & Phân quyền",
      isOpen: false,
      items: [
        { 
          name: 'Quản lý Tài khoản', 
          icon: Shield, 
          path: '/admin/accounts'
        },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full hidden lg:flex relative">
      <NavLink to="/admin" className="flex items-center h-16 px-6 border-b border-gray-100 mb-2">
        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-brand-500/30 ring-4 ring-brand-50">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Tech<span className="text-brand-600">Admin</span></span>
      </NavLink>

      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <SidebarMenuGroup key={idx} group={group} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 bg-white relative" ref={dropdownRef}>
        {isProfileOpen && (
          <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 mb-2 animate-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden text-left">
            <div className="p-2">
              <p className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cá nhân</p>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-left">
                <User className="w-4 h-4 text-slate-400" />
                Hồ sơ cá nhân
              </button>
            </div>
            <div className="h-px bg-slate-100 my-1 mx-2"></div>
            <div className="p-2">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-left">
                <LogOut className="w-4 h-4" />
                Đăng xuất hệ thống
              </button>
            </div>
          </div>
        )}

        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 border-2 ${isProfileOpen ? 'bg-slate-50 border-brand-100' : 'bg-white border-transparent hover:bg-slate-50'}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold shadow-md shadow-brand-200 ring-2 ring-white">
              {user.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user.name}</p>
            <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{displayRole}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-brand-500' : ''}`} />
        </button>
      </div>
    </aside>
  );
};
