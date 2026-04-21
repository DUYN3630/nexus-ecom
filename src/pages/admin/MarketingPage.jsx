import { useEffect, useRef, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import { PlusCircle, Bell, PlayCircle, CursorClick, Lock, MagnifyingGlass, ListDashes, GridFour } from '@phosphor-icons/react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import marketingApi from '../../api/marketingApi';
import QuickEditDrawer from './MarketingPageComponents/QuickEditDrawer';
import BannerList from './MarketingPageComponents/BannerList';
import BannerGrid from './MarketingPageComponents/BannerGrid';
import StatCard from './MarketingPageComponents/StatCard';

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
    type: 'all',
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await marketingApi.getDashboardStats();
      if (response && response.success) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error("Failed to load marketing stats:", err);
      // Optional: Don't toast for stats failure to avoid noise
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchBanners = useCallback(async (currentFilters) => {
    setLoadingBanners(true);
    try {
      const response = await marketingApi.getBanners(currentFilters);
      if (response && response.success) {
        setBanners(response.data);
      } else {
        // If API returns success: false but handled gracefully
        console.warn("API returned unsuccessful response:", response);
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
    const onRefresh = () => fetchBanners(filters);
    window.addEventListener('refreshBanners', onRefresh);
    return () => window.removeEventListener('refreshBanners', onRefresh);
  }, [filters, fetchBanners]);
  
  useEffect(() => {
    if (chartRef.current && dashboardStats.avgCtr !== 0) {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
          datasets: [{
            label: 'CTR',
            data: [
                dashboardStats.avgCtr * 0.6,
                dashboardStats.avgCtr * 0.8,
                dashboardStats.avgCtr,
                dashboardStats.avgCtr * 0.9,
                dashboardStats.avgCtr * 1.2,
                dashboardStats.avgCtr * 1.1,
            ],
            borderColor: '#6366f1', borderWidth: 3, tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.05)'
          }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } }, 
            scales: { 
                x: { grid: { display: false } },
                y: { 
                    beginAtZero: true,
                    max: Math.ceil(dashboardStats.avgCtr * 1.5),
                    ticks: {
                        callback: (value) => value.toFixed(1) + '%',
                    }
                } 
            } 
        }
      });
    }
    return () => { if (chartInstanceRef.current) { chartInstanceRef.current.destroy(); chartInstanceRef.current = null; } };
  }, [dashboardStats.avgCtr]);

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
    } else {
      addToast(`${action.charAt(0).toUpperCase() + action.slice(1)} banner thất bại.`, 'error');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (await showConfirmDialog({ title: 'Xác nhận Xóa', message: 'Bạn có chắc muốn xóa banner này vĩnh viễn?', type: 'error' })) {
      const response = await marketingApi.deleteBanners([bannerId]);
      addToast(response.success ? 'Banner đã được xóa.' : 'Xóa banner thất bại.', response.success ? 'success' : 'error');
      if (response.success) fetchBanners(filters);
    }
  };

  const handleFilterChange = (type) => setFilters(prev => ({ ...prev, type }));
  const handleSearchChange = (e) => setFilters(prev => ({ ...prev, search: e.target.value }));

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-20">
        <h2 className="text-lg font-bold text-slate-800">Quản lý Banner quảng cáo</h2>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600"><Bell size={24} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
          <button onClick={() => handleOpenDrawer(null)} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all flex items-center gap-2"><PlusCircle size={20} /> Tạo mới</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth" id="scrollContainer">
        <section className="fade-in"><p className="text-slate-500 text-sm max-w-2xl leading-relaxed">Module quản lý tài sản hình ảnh chuẩn SEO. Phiên bản 2.0: Quản lý hàng loạt, khóa banner hết hạn.</p></section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in" style={{ animationDelay: '100ms' }}>
          <div className="lg:col-span-1 space-y-4">
            {loadingStats ? ([...Array(3)].map((_, i) => <div key={i} className="w-full h-[104px] skeleton rounded-3xl"></div>)) : (
              <>
                <StatCard title="Đang hiển thị" value={dashboardStats.displayingBanners} icon={PlayCircle} bgColor="bg-emerald-50" textColor="text-emerald-600" />
                <StatCard title="CTR Trung bình" value={`${dashboardStats.avgCtr}%`} icon={CursorClick} bgColor="bg-amber-50" textColor="text-amber-600" />
                <StatCard title="Banner hết hạn" value={dashboardStats.expiredBanners} icon={Lock} bgColor="bg-slate-100" textColor="text-slate-500" />
              </>
            )}
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><div className="chart-container"><canvas id="ctrChart" ref={chartRef}></canvas></div></div>
        </section>

        <section className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <MagnifyingGlass className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Tìm tên chiến dịch..." value={filters.search} onChange={handleSearchChange} className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium" />
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <button onClick={() => setView('list')} className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><ListDashes size={20} /></button>
              <button onClick={() => setView('grid')} className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><GridFour size={20} /></button>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'home-top', 'home-mid', 'popup'].map(type => (
              <button key={type} onClick={() => handleFilterChange(type)} className={`filter-tab px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${filters.type === type ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 text-slate-500'}`}>{type === 'all' ? 'Tất cả' : type.replace('-', ' ')}</button>
            ))}
          </div>
        </section>

        <section id="bannerWorkspace" className="fade-in" style={{ animationDelay: '300ms' }}>
            {loadingBanners ? ( <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="w-full h-16 skeleton rounded-2xl"></div>)}</div> )
             : banners.length === 0 ? ( <p className="text-slate-500 text-center py-10">Không có banner nào được tìm thấy.</p> )
             : view === 'list' ? ( <BannerList banners={banners} onEdit={handleOpenDrawer} onDelete={handleDeleteBanner} /> )
             : ( <BannerGrid banners={banners} onEdit={handleOpenDrawer} /> )
            }
        </section>
      </div>

      <QuickEditDrawer banner={currentBanner} mode={drawerMode} isOpen={isDrawerOpen} onClose={handleCloseDrawer} onSave={handleSaveBanner} />
    </div>
  );
};

export default MarketingPage;
