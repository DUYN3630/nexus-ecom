import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Briefcase, DollarSign, TrendingUp, 
  Star, CheckCircle, Clock, Smartphone,
  BarChart2, PieChart as PieChartIcon, ArrowUpRight, 
  ArrowDownRight, MoreHorizontal, User, Shield, Box, ArrowRight, X, Mail, Award, Calendar
} from 'lucide-react';
import aiSettingApi from '../../api/aiSettingApi';
import supportApi from '../../api/supportApi';
import { getRepairAnalytics } from '../../api/analyticsApi';

const ExpertPerformancePage = () => {
  const [experts, setExperts] = useState([]);
  const [repairTrend, setRepairTrend] = useState([]);
  const [topParts, setTopParts] = useState([]);
  const [revenueDistribution, setRevenueDistribution] = useState({ service: 0, parts: 0 });
  const [opStats, setOpStats] = useState({ avgTime: 0, totalParts: 0, qualityRate: 100 });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedRepairs: 0,
    avgRating: 0,
    activeExperts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // States for Detail Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpertData, setSelectedExpertData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetail = async (id) => {
    console.log("aiSettingApi object:", aiSettingApi);
    setIsDetailLoading(true);
    setIsModalOpen(true);
    setDetailError(null);
    setSelectedExpertData(null);
    try {
      const response = await aiSettingApi.getExpertDetail(id);
      setSelectedExpertData(response);
    } catch (error) {
      console.error("Error fetching expert details:", error);
      setDetailError("Không thể tải thông tin chuyên gia. Vui lòng thử lại sau.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expertData, repairData] = await Promise.all([
        aiSettingApi.getExpertPerformance(),
        getRepairAnalytics()
      ]);

      setExperts(expertData || []);
      if (repairData.success) {
          setRepairTrend(repairData.data.revenueTrend || []);
          setTopParts(repairData.data.topParts || []);
          setRevenueDistribution(repairData.data.revenueDistribution || { service: 0, parts: 0 });
          setOpStats(repairData.data.operationalStats || { avgTime: 0, totalParts: 0, qualityRate: 100 });
      }

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

  const maxTrendValue = Math.max(...repairTrend.map(t => t.amount), 1);

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
        {/* Repair Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px] flex flex-col">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-600" /> Doanh thu Sửa chữa & Linh kiện
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase">
                 <span>30 ngày qua</span>
              </div>
           </div>
           <div className="flex-1 flex items-end gap-2.5 px-1 min-h-0">
              {repairTrend.length > 0 ? repairTrend.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                   <div 
                      className="w-full bg-brand-600/10 rounded-t-md relative group-hover:bg-brand-600/20 transition-colors" 
                      style={{ height: `${(val.amount / maxTrendValue) * 100}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-semibold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                         {val.amount.toLocaleString('vi-VN')} ₫
                      </div>
                   </div>
                   <span className="text-[8px] font-semibold text-slate-400 truncate max-w-[40px]">{val.date.slice(-5)}</span>
                </div>
              )) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-20 space-y-2">
                    <TrendingUp size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Chưa có dữ liệu doanh thu</p>
                </div>
              )}
           </div>
        </div>

        {/* Top Replacement Parts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                 <Smartphone size={16} className="text-brand-600" /> Linh kiện Doanh thu cao
              </h3>
              <ArrowUpRight size={16} className="text-slate-400" />
           </div>
           
           <div className="space-y-4">
              {topParts.length > 0 ? topParts.map((part, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm">
                         <Box size={16} className="text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                         <p className="text-xs font-semibold text-slate-800 truncate">{part.name}</p>
                         <p className="text-[10px] font-medium text-slate-400">{part.sold} linh kiện đã thay</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-brand-600">{part.revenue.toLocaleString('vi-VN')} ₫</p>
                      <p className={`text-[10px] font-semibold text-emerald-500`}>Tăng trưởng tốt</p>
                   </div>
                </div>
              )) : (
                <div className="py-10 text-center opacity-20">
                    <Box size={40} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Chưa có dữ liệu linh kiện</p>
                </div>
              )}
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
               {(() => {
                 const total = revenueDistribution.service + revenueDistribution.parts || 1;
                 const servicePercent = Math.round((revenueDistribution.service / total) * 100);
                 const partsPercent = Math.round((revenueDistribution.parts / total) * 100);
                 
                 return [
                   { label: 'Công Sửa chữa', percent: servicePercent, color: 'bg-brand-600', revenue: revenueDistribution.service.toLocaleString('vi-VN') + ' ₫' },
                   { label: 'Linh kiện thay thế', percent: partsPercent, color: 'bg-emerald-500', revenue: revenueDistribution.parts.toLocaleString('vi-VN') + ' ₫' },
                   { label: 'Dịch vụ khác', percent: 0, color: 'bg-indigo-500', revenue: '0 ₫' },
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
                 ));
               })()}
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
                             <button 
                                onClick={() => handleViewDetail(exp._id)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900"
                             >
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
               <p className="text-xs text-slate-400 leading-relaxed">Thời gian hoàn thành: <span className="text-white font-semibold">{opStats.avgTime || 0} phút/đơn</span></p>
               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: opStats.avgTime > 0 ? '85%' : '0%' }}></div>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                     <TrendingUp size={18} />
                  </div>
                  <h4 className="text-base font-bold tracking-tight">Chất lượng Sửa chữa</h4>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">Tỷ lệ thành công: <span className="text-white font-semibold">{opStats.qualityRate}%</span></p>
               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${opStats.qualityRate}%` }}></div>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                     <Smartphone size={18} />
                  </div>
                  <h4 className="text-base font-bold tracking-tight">Linh kiện thay thế</h4>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">Đã thay thế: <span className="text-white font-semibold">{opStats.totalParts.toLocaleString('vi-VN')} linh kiện</span></p>
               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: opStats.totalParts > 0 ? '78%' : '0%' }}></div>
               </div>
            </div>
         </div>
      </div>

      {/* Expert Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                    {selectedExpertData?.expert?.name?.[0] || 'E'}
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">Expert Profile Details</h2>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chi tiết hiệu suất và lịch sử kỹ thuật</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isDetailLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                   <div className="w-10 h-10 border-4 border-brand-600/20 border-t-brand-600 rounded-full animate-spin"></div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu chuyên gia...</p>
                </div>
              ) : detailError ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                   <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                      <X size={32} />
                   </div>
                   <p className="text-sm font-bold text-slate-600">{detailError}</p>
                   <button 
                      onClick={() => handleViewDetail(selectedExpertData?.expert?._id)}
                      className="text-xs font-bold text-brand-600 uppercase border-b-2 border-brand-600 pb-0.5"
                   >
                      Thử lại
                   </button>
                </div>
              ) : selectedExpertData ? (
                <div className="space-y-10">
                   {/* Personal Info & Key Stats */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-1 space-y-6">
                         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin cơ bản</h4>
                            <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                  <User size={16} className="text-slate-400" />
                                  <span className="text-sm font-bold text-slate-700">{selectedExpertData.expert.name}</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <Mail size={16} className="text-slate-400" />
                                  <span className="text-sm font-medium text-slate-500">{selectedExpertData.expert.email}</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <Award size={16} className="text-slate-400" />
                                  <span className="text-sm font-medium text-slate-500">{selectedExpertData.expert.role || 'Apple Technician'}</span>
                               </div>
                               <div className="pt-4 border-t border-slate-200">
                                  <div className="flex flex-wrap gap-2">
                                     {selectedExpertData.expert.specialty?.map((s, i) => (
                                       <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                                          {s}
                                       </span>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="md:col-span-2 space-y-6">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Biểu đồ Doanh thu (6 tháng gần nhất)</h4>
                         <div className="bg-slate-50 h-48 rounded-3xl border border-slate-100 flex items-end justify-between p-6 gap-3">
                            {selectedExpertData.stats.monthlyStats.length > 0 ? (
                              selectedExpertData.stats.monthlyStats.map((m, i) => {
                                const maxRevenue = Math.max(...selectedExpertData.stats.monthlyStats.map(s => s.revenue), 1);
                                return (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                     <div 
                                        className="w-full bg-brand-600/20 rounded-t-xl hover:bg-brand-600/40 transition-all cursor-pointer"
                                        style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                                     >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                           {m.revenue.toLocaleString('vi-VN')} ₫
                                        </div>
                                     </div>
                                     <span className="text-[9px] font-bold text-slate-400 uppercase">{m._id.slice(5)}</span>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20">
                                 <BarChart2 size={32} />
                              </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Recent Activity Table */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lịch sử sửa chữa gần nhất</h4>
                         <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">Last 10 Tickets</span>
                      </div>
                      <div className="border border-slate-100 rounded-2xl overflow-hidden">
                         <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                               <tr>
                                  <th className="px-6 py-3">Mã đơn</th>
                                  <th className="px-6 py-3">Thiết bị</th>
                                  <th className="px-6 py-3">Khách hàng</th>
                                  <th className="px-6 py-3">Ngày</th>
                                  <th className="px-6 py-3 text-right">Trạng thái</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {selectedExpertData.stats.recentRepairs.map((repair, i) => (
                                 <tr key={i} className="text-xs">
                                    <td className="px-6 py-4 font-bold text-slate-900">#{repair.ticketNumber.slice(-8)}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-600">{repair.deviceType}</td>
                                    <td className="px-6 py-4 font-medium text-slate-500">{repair.user?.name || repair.guestInfo?.name || 'Guest'}</td>
                                    <td className="px-6 py-4 font-medium text-slate-400">{new Date(repair.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-right">
                                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                                          repair.status === 'Done' ? 'bg-emerald-50 text-emerald-600' :
                                          repair.status === 'Repairing' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                                       }`}>
                                          {repair.status}
                                       </span>
                                    </td>
                                 </tr>
                               ))}
                               {selectedExpertData.stats.recentRepairs.length === 0 && (
                                 <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chưa có lịch sử sửa chữa</td>
                                 </tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
               <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
               >
                  Close Detail
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExpertPerformancePage;
