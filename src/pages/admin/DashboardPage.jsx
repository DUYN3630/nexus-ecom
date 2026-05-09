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
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chào mừng trở lại, Admin</h1>
        <p className="text-sm text-slate-500 font-medium">Đây là tóm tắt tình hình vận hành hệ thống Nexus hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Doanh thu" value={formatCurrency(stats?.totalRevenue)} sub="+8% so với hôm qua" icon={ShoppingBag} color="brand" />
        <SummaryCard title="Đơn hàng" value={stats?.totalOrders} sub="Đang chờ xử lý: 12" icon={Box} color="amber" />
        <SummaryCard title="Khách hàng" value={stats?.newUsers} sub="Đang trực tuyến: 45" icon={Users} color="purple" />
        <SummaryCard title="Đánh giá" value="4.8/5" sub="Phản hồi tích cực: 92%" icon={Star} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Sản phẩm bán chạy</h3>
            <Link to="/admin/analytics" className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                Phân tích sâu <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.topSellingProducts?.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">{i+1}</div>
                    <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{p.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900 tabular-nums">{p.totalSold} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">đã bán</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 border-b border-slate-50 pb-4">Lối tắt tác vụ</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction title="Quản lý Kho" link="/admin/products" desc="Cập nhật tồn kho & giá" />
            <QuickAction title="Xử lý Đơn" link="/admin/orders" desc="Phê duyệt hóa đơn mới" />
            <QuickAction title="Chiến dịch" link="/admin/marketing" desc="Tạo Banner & SEO" />
            <QuickAction title="Dịch vụ" link="/admin/repairs" desc="Tiếp nhận bảo trì" />
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

const QuickAction = ({ title, link, desc }) => (
    <Link to={link} className="p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-50 transition-all group">
        <h4 className="text-sm font-black text-slate-800 group-hover:text-brand-600 uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{desc}</p>
    </Link>
);
