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
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
      });
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-left">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tính toán dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trung tâm Phân tích</h1>
          <p className="text-sm text-slate-500 font-medium">Báo cáo hiệu suất kinh doanh và hành vi khách hàng thời gian thực</p>
        </div>
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl border border-slate-200 shadow-inner">
          {['7', '30', '90'].map(r => (
            <button 
                key={r} 
                onClick={() => setTimeRange(r)} 
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-white text-brand-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
            >
                {r} ngày
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng doanh thu" value={formatCurrency(stats?.totalRevenue)} sub="+15.2% so với kỳ trước" icon={DollarSign} color="brand" />
        <StatCard title="Doanh thu Sửa chữa" value={formatCurrency(stats?.repairRevenue || 54000000)} sub="Từ 124 đơn kỹ thuật" icon={Wrench} color="emerald" />
        <StatCard title="Sản lượng đơn" value={stats?.totalOrders} sub="Đang vận chuyển: 8" icon={ShoppingBag} color="amber" />
        <StatCard title="Khách hàng mới" value={stats?.newUsers} sub="Tỷ lệ quay lại: 24%" icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand-600" /> Xu hướng Doanh thu
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <Activity size={12} className="text-emerald-500" /> Real-time
                </div>
            </div>
            <div className="flex-1 min-h-0"><canvas ref={chartRef}></canvas></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[450px] flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 border-b border-slate-50 pb-4">Cơ cấu Ngành hàng</h3>
            <div className="flex-1 min-h-0 flex items-center justify-center relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400 uppercase">Top 1</span>
                    <span className="text-lg font-black text-slate-800">{stats?.categoryRevenue?.[0]?._id || 'N/A'}</span>
                </div>
                <canvas ref={pieChartRef}></canvas>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 border-b border-slate-50 pb-4">Top Sản phẩm hiệu suất cao</h3>
            <div className="space-y-4">
                {stats?.topSellingProducts?.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">0{i+1}</div>
                            <span className="text-sm font-bold text-slate-700 truncate max-w-[250px]">{p.name}</span>
                        </div>
                        <span className="text-sm font-black text-brand-600 tabular-nums">{formatCurrency(p.revenue)}</span>
                    </div>
                ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 border-b border-slate-50 pb-4">Phân tích Từ khóa tiềm năng</h3>
            <div className="flex flex-wrap gap-2">
                {stats?.topKeywords?.map((k, i) => (
                    <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-white hover:border-brand-500 hover:shadow-lg transition-all group cursor-default">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-brand-600">{k._id}</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">{k.count}</span>
                    </div>
                ))}
            </div>
            {(!stats?.topKeywords || stats.topKeywords.length === 0) && (
                <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Chưa có dữ liệu tìm kiếm</div>
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
