import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Briefcase, DollarSign, TrendingUp, 
  Star, CheckCircle, Clock, Smartphone,
  BarChart2, PieChart as PieChartIcon, ArrowUpRight, 
  ArrowDownRight, MoreHorizontal, User, Shield, Box, ArrowRight
} from 'lucide-react';
import aiSettingApi from '../../api/aiSettingApi';
import supportApi from '../../api/supportApi';

const ExpertPerformancePage = () => {
  const [experts, setExperts] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedRepairs: 0,
    avgRating: 0,
    activeExperts: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const expertData = await aiSettingApi.getExpertPerformance();
      setExperts(expertData || []);

      // Calculate aggregate stats
      let totalRevenue = 0;
      let totalCompleted = 0;
      let totalRating = 0;
      let ratedExperts = 0;

      expertData.forEach(exp => {
        totalRevenue += exp.totalRevenue || 0;
        totalCompleted += exp.completedRepairs || 0;
        if (exp.avgRating > 0) {
          totalRating += exp.avgRating;
          ratedExperts++;
        }
      });

      setStats({
        totalRevenue,
        completedRepairs: totalCompleted,
        avgRating: ratedExperts > 0 ? (totalRating / ratedExperts).toFixed(1) : 0,
        activeExperts: expertData.length
      });
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: 'Doanh thu Sửa chữa', value: stats.totalRevenue.toLocaleString('vi-VN') + ' ₫', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
    { label: 'Công việc Hoàn tất', value: stats.completedRepairs, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8.2%' },
    { label: 'Đánh giá Trung bình', value: stats.avgRating + '/5', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+0.3' },
    { label: 'Chuyên gia Hoạt động', value: stats.activeExperts, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Ổn định' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1 uppercase">
          Expert <span className="text-brand-600">Performance</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium">Báo cáo hiệu suất kỹ thuật và doanh thu sửa chữa hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <card.icon size={20} />
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${card.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Revenue Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Repair Revenue Trend (Mock) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px] flex flex-col">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-600" /> Doanh thu Sửa chữa & Linh kiện
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase">
                 <span>30 ngày qua</span>
              </div>
           </div>
           <div className="flex-1 flex items-end gap-2.5 px-1">
              {[45, 62, 58, 75, 90, 82, 95, 110, 88, 120, 105, 135].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                   <div className="w-full bg-brand-600/10 rounded-t-md relative group-hover:bg-brand-600/20 transition-colors" style={{ height: `${val}%` }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-semibold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {val}tr
                      </div>
                   </div>
                   <span className="text-[9px] font-semibold text-slate-400">T{i+1}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Top Replacement Parts (Revenue focus) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                 <Smartphone size={16} className="text-brand-600" /> Linh kiện Doanh thu cao
              </h3>
              <ArrowUpRight size={16} className="text-slate-400" />
           </div>
           
           <div className="space-y-4">
              {[
                { name: 'Màn hình iPhone 15 Pro Max', revenue: 155000000, sold: 12, growth: '+15%' },
                { name: 'Pin dung lượng cao (All models)', revenue: 85000000, sold: 45, growth: '+22%' },
                { name: 'Cụm Camera iPhone 14 Series', revenue: 62000000, sold: 8, growth: '-5%' },
                { name: 'Vỏ sườn Titan chính hãng', revenue: 48000000, sold: 5, growth: '+10%' }
              ].map((part, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm">
                         <Box size={16} className="text-slate-400" />
                      </div>
                      <div>
                         <p className="text-xs font-semibold text-slate-800">{part.name}</p>
                         <p className="text-[10px] font-medium text-slate-400">{part.sold} linh kiện đã thay</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-brand-600">{part.revenue.toLocaleString('vi-VN')} ₫</p>
                      <p className={`text-[10px] font-semibold ${part.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{part.growth}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Distribution Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Nguồn thu Kỹ thuật</h3>
            <PieChartIcon size={16} className="text-slate-400" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-5">
            <div className="space-y-4">
               {[
                 { label: 'Công Sửa chữa', percent: 45, color: 'bg-brand-600', revenue: '45.000.000 ₫' },
                 { label: 'Linh kiện thay thế', percent: 35, color: 'bg-emerald-500', revenue: '35.000.000 ₫' },
                 { label: 'Dịch vụ Bảo trì', percent: 15, color: 'bg-indigo-500', revenue: '15.000.000 ₫' },
                 { label: 'Phụ kiện đi kèm', percent: 5, color: 'bg-slate-300', revenue: '5.000.000 ₫' }
               ].map((item, i) => (
                 <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-semibold uppercase">
                       <span className="text-slate-500">{item.label}</span>
                       <span className="text-slate-900">{item.revenue}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Expert Ranking Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Top Chuyên gia Kỹ thuật</h3>
              <div className="flex gap-1.5">
                 <button className="px-3.5 py-1.5 bg-brand-600 text-white text-[10px] font-semibold uppercase rounded-lg shadow-md">Revenue</button>
                 <button className="px-3.5 py-1.5 hover:bg-slate-50 text-[10px] font-semibold uppercase rounded-lg transition-all text-slate-500">Quality</button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                       <th className="px-8 py-4">Chuyên gia</th>
                       <th className="px-8 py-4">Đơn HT</th>
                       <th className="px-8 py-4">Rating</th>
                       <th className="px-8 py-4">Doanh thu</th>
                       <th className="px-8 py-4 text-right">Chi tiết</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {experts.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)).map((exp, idx) => (
                       <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                   {exp.name?.[0]}
                                </div>
                                <div>
                                   <p className="text-xs font-semibold text-slate-800">{exp.name}</p>
                                   <p className="text-[10px] font-medium text-slate-400">{exp.role || 'Kỹ thuật viên'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-4">
                             <span className="text-xs font-medium text-slate-600">{exp.completedRepairs || 0} tasks</span>
                          </td>
                          <td className="px-8 py-4">
                             <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                   {[1, 2, 3, 4, 5].map(s => (
                                     <Star key={s} size={10} className={`${s <= (exp.avgRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                   ))}
                                </div>
                                <span className="text-xs font-bold text-slate-700">{exp.avgRating?.toFixed(1) || '0.0'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-4">
                             <span className="text-xs font-bold text-brand-600">{(exp.totalRevenue || 0).toLocaleString('vi-VN')} ₫</span>
                          </td>
                          <td className="px-8 py-4 text-right">
                             <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900">
                                <ArrowRight size={14} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Bottom Summary (Tech Operations) */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield size={120} />
         </div>
         
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                     <Clock size={18} />
                  </div>
                  <h4 className="text-base font-bold tracking-tight">Hiệu suất Xử lý</h4>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">Thời gian hoàn thành: <span className="text-white font-semibold">120 phút/đơn</span></p>
               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: '85%' }}></div>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                     <TrendingUp size={18} />
                  </div>
                  <h4 className="text-base font-bold tracking-tight">Chất lượng Sửa chữa</h4>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">Tỷ lệ bảo hành sau sửa: <span className="text-white font-semibold">1.2%</span></p>
               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                     <Smartphone size={18} />
                  </div>
                  <h4 className="text-base font-bold tracking-tight">Linh kiện thay thế</h4>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">Đã thay thế: <span className="text-white font-semibold">1,240 linh kiện</span></p>
               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: '78%' }}></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ExpertPerformancePage;
