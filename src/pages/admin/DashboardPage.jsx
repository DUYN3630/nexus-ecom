import { useEffect, useState } from 'react';
import { ShoppingBag, Users, Star, Box, ArrowRight } from 'lucide-react';
import { getOverviewStats } from '../../api/analyticsApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-center">Đang tải tổng quan...</div>;

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chào mừng trở lại, Admin</h1>
        <p className="text-sm text-slate-500">Đây là tóm tắt tình hình cửa hàng của bạn hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Doanh thu" value={formatCurrency(stats?.totalRevenue)} icon={ShoppingBag} color="blue" />
        <SummaryCard title="Đơn hàng" value={stats?.totalOrders} icon={Box} color="orange" />
        <SummaryCard title="Khách hàng" value={stats?.newUsers} icon={Users} color="purple" />
        <SummaryCard title="Đánh giá" value="4.8" icon={Star} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Preview */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Sản phẩm bán chạy nhất</h3>
            <Link to="/admin/analytics" className="text-xs font-bold text-brand-600 flex items-center gap-1">Xem chi tiết <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-4">
            {stats?.topSellingProducts?.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                <span className="text-sm font-bold text-slate-900">{p.totalSold} lượt bán</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Lối tắt quản lý</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction title="Quản lý Sản phẩm" link="/admin/products" desc="Cập nhật kho và giá" />
            <QuickAction title="Xử lý Đơn hàng" link="/admin/orders" desc="Kiểm tra đơn hàng mới" />
            <QuickAction title="Marketing" link="/admin/marketing" desc="Tạo banner & khuyến mãi" />
            <QuickAction title="Phân tích sâu" link="/admin/analytics" desc="Xem biểu đồ chi tiết" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, color }) => {
    const bgColors = { blue: 'bg-blue-500', orange: 'bg-orange-500', purple: 'bg-purple-500', yellow: 'bg-yellow-500' };
    return (
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl text-white ${bgColors[color]}`}><Icon className="w-6 h-6" /></div>
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
                <h3 className="text-xl font-black text-slate-900">{value}</h3>
            </div>
        </div>
    );
};

const QuickAction = ({ title, link, desc }) => (
    <Link to={link} className="p-4 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 transition-all group">
        <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-700">{title}</h4>
        <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
    </Link>
);
