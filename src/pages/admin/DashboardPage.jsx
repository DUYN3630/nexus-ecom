import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Users, Star, Box, ArrowRight, TrendingUp, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { getOverviewStats } from '../../api/analyticsApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const response = await getOverviewStats();
        if (response.success) setStats(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuickStats();
  }, []);

  // Biểu đồ doanh thu
  useEffect(() => {
    if (stats?.revenueByDay && chartRef.current) {
        if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        
        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: stats.revenueByDay.map(d => d.date),
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: stats.revenueByDay.map(d => d.amount),
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { display: false },
                    x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
                }
            }
        });
    }
  }, [stats]);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: "Quản trị viên" };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-left">Khởi tạo hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Bảng điều khiển Nexus</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1 italic">Chào mừng trở lại, {user.name} | Phiên làm việc: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống Trực tuyến</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard title="Doanh thu" value={formatCurrency(stats?.totalRevenue || 0)} sub="+12% so với tháng trước" icon={ShoppingBag} color="brand" />
        <SummaryCard title="Đơn hàng" value={stats?.totalOrders || 0} sub={`${stats?.pendingOrders || 0} đơn chờ xử lý`} icon={Box} color="amber" />
        <SummaryCard title="Khách hàng" value={stats?.newUsers || 0} sub="+5 tài khoản mới" icon={Users} color="purple" />
        <SummaryCard title="Tỷ lệ Review" value="4.9/5" sub="Dựa trên 128 đánh giá" icon={Star} color="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Doanh thu Card */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border-4 border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
                        <TrendingUp size={16} className="text-brand-600" /> Tăng trưởng doanh thu
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">7 ngày gần nhất</p>
                </div>
                <select className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest p-2 rounded-xl outline-none">
                    <option>Theo Tuần</option>
                    <option>Theo Tháng</option>
                </select>
            </div>
            <div className="flex-1 min-h-[300px]">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>

        {/* Inventory & Actions */}
        <div className="space-y-8">
            {/* Low Stock Alert */}
            <div className="bg-rose-50 p-8 rounded-[40px] border-4 border-rose-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 mb-6 flex items-center gap-2">
                    <AlertTriangle size={16} /> Cảnh báo tồn kho
                </h3>
                <div className="space-y-3">
                    {stats?.lowStockProducts?.length > 0 ? stats.lowStockProducts.slice(0, 3).map((p, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-rose-100 shadow-sm">
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black text-slate-800 truncate uppercase">{p.name}</p>
                                <p className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Còn lại: {p.stock}</p>
                            </div>
                            <Link to="/admin/products" className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-rose-600">
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    )) : (
                        <p className="text-[10px] text-rose-400 font-bold uppercase text-center py-4">Hàng hóa đang ổn định</p>
                    )}
                </div>
                <Link to="/admin/products" className="w-full mt-6 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-all">
                    Nhập hàng ngay
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 p-8 rounded-[40px] border-4 border-slate-800 shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 mb-8 flex items-center gap-2">
                    <Clock size={16} /> Lối tắt tác vụ
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <DashboardAction title="Duyệt đơn hàng" link="/admin/orders" icon={ChevronRight} />
                    <DashboardAction title="Cấu hình AI Hub" link="/admin/ai-hub" icon={ChevronRight} />
                    <DashboardAction title="Thêm Sản phẩm" link="/admin/products" icon={Plus} />
                </div>
            </div>
        </div>

        {/* Best Sellers */}
        <div className="xl:col-span-3 bg-white p-8 rounded-[40px] border-4 border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b-2 border-slate-50 pb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-800">Hiệu suất Sản phẩm (Bán chạy)</h3>
                <Link to="/admin/analytics" className="text-[11px] font-black text-brand-600 uppercase tracking-widest hover:bg-brand-50 px-4 py-2 rounded-xl transition-all">
                    Xem báo cáo đầy đủ
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats?.topSellingProducts?.slice(0, 4).map((p, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 group hover:border-brand-300 hover:bg-white transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-sm font-black text-brand-600">{i+1}</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase line-clamp-1 mb-1">{p.name}</h4>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Doanh số</span>
                            <span className="text-sm font-black text-slate-900">{p.totalSold} <span className="text-[10px] text-slate-400 ml-0.5 font-bold">đv</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, sub, icon: Icon, color }) => {
    const colors = { 
        brand: 'bg-brand-50 text-brand-600 border-brand-100', 
        amber: 'bg-amber-50 text-amber-600 border-amber-100', 
        purple: 'bg-purple-50 text-purple-600 border-purple-100', 
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100' 
    };
    return (
        <div className="bg-white p-8 rounded-[32px] border-4 border-slate-100 shadow-sm flex items-center gap-6 group hover:border-brand-500 transition-all">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-transparent group-hover:rotate-12 transition-all shadow-sm ${colors[color]}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 tabular-nums tracking-tighter">{value}</h3>
                <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-tight">{sub}</p>
            </div>
        </div>
    );
};

const DashboardAction = ({ title, link, icon: Icon }) => (
    <Link to={link} className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between group">
        <span className="text-[11px] font-black text-white uppercase tracking-widest">{title}</span>
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-brand-600 transition-colors">
            <Icon size={14} />
        </div>
    </Link>
);

const Plus = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

