import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { 
  DollarSign, ShoppingBag, Users, Activity, Download, 
  Search, Eye, Tag, Calendar
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

  if (loading) return <div className="p-8 text-center">Đang tải phân tích...</div>;

  return (
    <div className="fade-in space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Trung tâm Phân tích</h1>
        <div className="flex gap-2 bg-white p-1 rounded-xl border">
          {['7', '30', '90'].map(r => (
            <button key={r} onClick={() => setTimeRange(r)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${timeRange === r ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{r} ngày</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Doanh thu" value={formatCurrency(stats?.totalRevenue)} icon={DollarSign} color="brand" />
        <StatCard title="Đơn hàng" value={stats?.totalOrders} icon={ShoppingBag} color="amber" />
        <StatCard title="Khách mới" value={stats?.newUsers} icon={Users} color="purple" />
        <StatCard title="Chuyển đổi" value={`${stats?.conversionRate}%`} icon={Activity} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border h-96">
            <h3 className="font-bold mb-4">Biểu đồ Doanh thu</h3>
            <div className="h-72"><canvas ref={chartRef}></canvas></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border h-96">
            <h3 className="font-bold mb-4">Theo Danh mục</h3>
            <div className="h-72"><canvas ref={pieChartRef}></canvas></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold mb-4">Top Sản phẩm bán chạy</h3>
            <div className="space-y-3">
                {stats?.topSellingProducts?.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-sm font-bold text-brand-600">{formatCurrency(p.revenue)}</span>
                    </div>
                ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold mb-4">Từ khóa tìm kiếm</h3>
            <div className="flex flex-wrap gap-2">
                {stats?.topKeywords?.map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{k._id} ({k.count})</span>
                ))}
            </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = { brand: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600', cyan: 'bg-cyan-50 text-cyan-600' };
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex justify-between items-start">
        <div><p className="text-xs text-slate-500 font-bold uppercase mb-1">{title}</p><h3 className="text-xl font-black">{value}</h3></div>
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      </div>
    </div>
  );
};
