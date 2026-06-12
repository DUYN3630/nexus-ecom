import { useEffect, useRef, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Bell, PlayCircle, MousePointer2, Lock, Search, 
  List, LayoutGrid, RotateCcw, Activity, TrendingUp, AlertCircle
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import marketingApi from '../../api/marketingApi';
import QuickEditDrawer from './MarketingPageComponents/QuickEditDrawer';
import BannerList from './MarketingPageComponents/BannerList';
import BannerGrid from './MarketingPageComponents/BannerGrid';

const MarketingPage = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { addToast } = useToast();
  const { showConfirmDialog } = useConfirmDialog();

  const [dashboardStats, setDashboardStats] = useState({ displayingBanners: 0, avgCtr: 0, expiredBanners: 0 });
  const [banners, setBanners] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [drawerMode, setDrawerMode] = useState('edit');

  const [view, setView] = useState('list');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // position
    status: 'all',
  });

  const [heroLayout, setHeroLayout] = useState(localStorage.getItem('nexus_hero_layout') || 'static');
  
  const toggleHeroLayout = () => {
    const newLayout = heroLayout === 'slider' ? 'static' : 'slider';
    setHeroLayout(newLayout);
    localStorage.setItem('nexus_hero_layout', newLayout);
    addToast(`Đã chuyển trang chủ sang giao diện Hero ${newLayout === 'slider' ? 'Slider (Động)' : 'Tĩnh (Refined)'}`, 'success');
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await marketingApi.getDashboardStats();
      if (response && response.success) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error("Failed to load marketing stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchBanners = useCallback(async (currentFilters) => {
    setLoadingBanners(true);
    try {
      const response = await marketingApi.getBanners({
        search: currentFilters.search,
        position: currentFilters.type,
        status: currentFilters.status,
      });
      if (response && response.success) {
        setBanners(response.data);
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
      addToast('Lỗi kết nối khi tải danh sách banner.', 'error');
    } finally {
      setLoadingBanners(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const handler = setTimeout(() => { fetchBanners(filters); }, 300);
    return () => clearTimeout(handler);
  }, [filters, fetchBanners]);
  
  useEffect(() => {
    if (chartRef.current && banners.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      const labels = banners.slice(0, 7).map(b => (b.name || 'Banner').substring(0, 10) + '...');
      const data = banners.slice(0, 7).map(b => b.stats?.ctr || 0);

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Tỷ lệ Click (CTR %)',
            data,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#4f46e5',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { display: false }, ticks: { font: { weight: 'bold' } } },
            x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
          }
        }
      });
    }
  }, [banners]);

  const handleOpenDrawer = (banner = null) => {
    setDrawerMode(banner ? 'edit' : 'create');
    setCurrentBanner(banner);
    setIsDrawerOpen(true);
  };
  
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentBanner(null);
  };

  const handleSaveBanner = async (formData, mode) => {
    const isCreate = mode === 'create';
    const apiCall = isCreate ? marketingApi.addBanner : marketingApi.updateBanner;
    const action = isCreate ? 'tạo' : 'cập nhật';

    addToast(`Đang ${action} banner...`, 'info');

    const response = await apiCall(formData);
    if (response.success) {
      addToast(`Banner đã được ${action} thành công!`, 'success');
      fetchBanners(filters);
      fetchStats(); 
    } else {
      addToast(`${action.charAt(0).toUpperCase() + action.slice(1)} banner thất bại.`, 'error');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (await showConfirmDialog({ title: 'Xác nhận Xóa', message: 'Bạn có chắc muốn xóa banner này vĩnh viễn?', type: 'error' })) {
      const response = await marketingApi.deleteBanners([bannerId]);
      addToast(response.success ? 'Banner đã được xóa.' : 'Xóa banner thất bại.', response.success ? 'success' : 'error');
      if (response.success) {
        fetchBanners(filters);
        fetchStats();
      }
    }
  };

  const handleFilterChange = (type) => setFilters(prev => ({ ...prev, type, status: 'all' }));
  const handleStatusChange = (status) => setFilters(prev => ({ ...prev, status }));
  const handleSearchChange = (e) => setFilters(prev => ({ ...prev, search: e.target.value }));

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Quản lý Marketing
          </h1>
          <p className="text-sm text-slate-500 font-medium">Hệ thống quản lý tài sản hình ảnh và chiến dịch quảng cáo chuẩn SEO</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
             <button 
                onClick={toggleHeroLayout}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${heroLayout === 'static' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
             >
                Hero Tĩnh
             </button>
             <button 
                onClick={toggleHeroLayout}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${heroLayout === 'slider' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
             >
                Hero Slider
             </button>
          </div>
          <button 
            onClick={() => handleOpenDrawer(null)} 
            className="flex-1 md:flex-none px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} /> Tạo Banner mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-4">
          {loadingStats ? ([...Array(3)].map((_, i) => <div key={i} className="w-full h-24 bg-white animate-pulse rounded-2xl border border-slate-100"></div>)) : (
            <>
              <div onClick={() => handleStatusChange('active')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Đang hiển thị</p>
                    <h4 className="text-2xl font-black text-emerald-600 tabular-nums">{dashboardStats.displayingBanners}</h4>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><PlayCircle size={22} /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">CTR Trung bình</p>
                    <h4 className="text-2xl font-black text-amber-600 tabular-nums">{dashboardStats.avgCtr}%</h4>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"><MousePointer2 size={22} /></div>
              </div>

              <div onClick={() => handleStatusChange('expired')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Banner hết hạn</p>
                    <h4 className="text-2xl font-black text-rose-600 tabular-nums">{dashboardStats.expiredBanners}</h4>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Lock size={22} /></div>
              </div>
            </>
          )}
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand-600" /> Biểu đồ Hiệu suất (CTR)
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <Activity size={12} className="text-emerald-500" /> Thời gian thực
                </div>
            </div>
            <div className="flex-1 min-h-[200px]">
                <canvas id="ctrChart" ref={chartRef}></canvas>
            </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Tìm tên chiến dịch..." 
              value={filters.search} 
              onChange={handleSearchChange} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-inner" 
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch md:self-auto">
            <button onClick={() => setView('list')} className={`flex-1 md:flex-none p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={20} className="mx-auto" /></button>
            <button onClick={() => setView('grid')} className={`flex-1 md:flex-none p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} className="mx-auto" /></button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'home-top', 'home-mid', 'popup'].map(type => (
              <button key={type} onClick={() => handleFilterChange(type)} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap transition-all ${filters.type === type && filters.status === 'all' ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>{type === 'all' ? 'Tất cả vị trí' : type.replace('-', ' ')}</button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: 'Hoạt động', value: 'active', color: 'bg-emerald-500' },
              { label: 'Hết hạn', value: 'expired', color: 'bg-rose-500' }
            ].map(status => (
              <button key={status.value} onClick={() => handleStatusChange(status.value)} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${filters.status === status.value ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                {filters.status === status.value && <span className={`w-1.5 h-1.5 rounded-full ${status.color} animate-pulse`}></span>}
                {status.label}
              </button>
            ))}
            <button 
                onClick={() => setFilters({ search: '', type: 'all', status: 'all' })}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
            >
                <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="fade-in">
          {loadingBanners ? ( <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="w-full h-20 bg-white animate-pulse rounded-2xl border border-slate-100"></div>)}</div> )
            : banners.length === 0 ? ( <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200"><p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không tìm thấy dữ liệu banner</p></div> )
            : view === 'list' ? ( <BannerList banners={banners} onEdit={handleOpenDrawer} onDelete={handleDeleteBanner} /> )
            : ( <BannerGrid banners={banners} onEdit={handleOpenDrawer} /> )
          }
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <QuickEditDrawer 
            banner={currentBanner} 
            mode={drawerMode} 
            isOpen={isDrawerOpen} 
            onClose={handleCloseDrawer} 
            onSave={handleSaveBanner} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketingPage;
