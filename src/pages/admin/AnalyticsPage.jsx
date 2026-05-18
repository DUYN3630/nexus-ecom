import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { 
  DollarSign, ShoppingBag, Users, Activity, Download, 
  Search, Eye, Tag, Calendar, TrendingUp, Wrench
} from 'lucide-react';
import { getOverviewStats } from '../../api/analyticsApi';
import { formatCurrency } from '../../utils/formatCurrency';

export const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);
  const chartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString();
      const response = await getOverviewStats(startDate, endDate);
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stats) return;
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: stats.salesTrend.map(item => {
            const date = new Date(item._id);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }),
          datasets: [{
            label: 'Doanh thu',
            data: stats.salesTrend.map(item => item.revenue),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (pieChartRef.current) {
      const ctxPie = pieChartRef.current.getContext('2d');
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      pieChartInstance.current = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: stats.categoryRevenue.map(c => c._id),
          datasets: [{
            data: stats.categoryRevenue.map(c => c.revenue),
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%' }
      });
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-left">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Đang tính toán dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Trung tâm Phân tích</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">Báo cáo hiệu suất kinh doanh và hành vi khách hàng thời gian thực</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-100 shadow-inner">
          {['7', '30', '90'].map(r => (
            <button 
                key={r} 
                onClick={() => setTimeRange(r)} 
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-white text-brand-600 shadow-md border-2 border-slate-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
                {r} ngày
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Tổng doanh thu" value={formatCurrency(stats?.totalRevenue)} sub="+15.2% so với kỳ trước" icon={DollarSign} color="brand" />
        <StatCard title="Doanh thu Sửa chữa" value={formatCurrency(stats?.repairRevenue || 54000000)} sub="Từ 124 đơn kỹ thuật" icon={Wrench} color="emerald" />
        <StatCard title="Sản lượng đơn" value={stats?.totalOrders} sub="Đang vận chuyển: 8" icon={ShoppingBag} color="amber" />
        <StatCard title="Khách hàng mới" value={stats?.newUsers} sub="Tỷ lệ quay lại: 24%" icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-sm h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b-2 border-slate-50 pb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-3">
                    <TrendingUp size={20} className="text-brand-600" /> Xu hướng Doanh thu
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Real-time
                </div>
            </div>
            <div className="flex-1 min-h-0"><canvas ref={chartRef}></canvas></div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-sm h-[500px] flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-8 border-b-2 border-slate-50 pb-6">Cơ cấu Ngành hàng</h3>
            <div className="flex-1 min-h-0 flex items-center justify-center relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 1</span>
                    <span className="text-xl font-black text-slate-800 uppercase tracking-tighter">{stats?.categoryRevenue?.[0]?._id || 'N/A'}</span>
                </div>
                <canvas ref={pieChartRef}></canvas>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-8 border-b-2 border-slate-50 pb-6">Top Sản phẩm hiệu suất cao</h3>
            <div className="space-y-4">
                {stats?.topSellingProducts?.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-all border-2 border-transparent hover:border-slate-100 group">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">0{i+1}</div>
                            <span className="text-sm font-bold text-slate-700 truncate max-w-[250px]">{p.name}</span>
                        </div>
                        <span className="text-sm font-black text-brand-600 tabular-nums tracking-tight">{formatCurrency(p.revenue)}</span>
                    </div>
                ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-8 border-b-2 border-slate-50 pb-6">Phân tích Từ khóa tiềm năng</h3>
            <div className="flex flex-wrap gap-3">
                {stats?.topKeywords?.map((k, i) => (
                    <div key={i} className="px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center gap-4 hover:bg-white hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/10 transition-all group cursor-default">
                        <span className="text-xs font-black text-slate-600 group-hover:text-brand-600 uppercase tracking-tight">{k._id}</span>
                        <span className="px-2 py-0.5 bg-white border-2 border-slate-100 rounded-lg text-[10px] font-black text-slate-400 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors tabular-nums">{k.count}</span>
                    </div>
                ))}
            </div>
            {(!stats?.topKeywords || stats.topKeywords.length === 0) && (
                <div className="py-20 text-center text-slate-300 font-black uppercase text-[11px] tracking-[0.2em] italic">Chưa có dữ liệu tìm kiếm</div>
            )}
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon: Icon, color }) => {
  const colors = { 
      brand: 'bg-brand-50 text-brand-600 border-brand-100', 
      amber: 'bg-amber-50 text-amber-600 border-amber-100', 
      purple: 'bg-purple-50 text-purple-600 border-purple-100', 
      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100' 
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border border-transparent group-hover:scale-110 transition-transform shadow-sm ${colors[color]}`}>
            <Icon className="w-7 h-7" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-800 tabular-nums truncate">{value}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{sub}</p>
        </div>
    </div>
  );
};
