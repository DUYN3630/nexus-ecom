import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Activity, ShieldCheck, Wrench, Calendar, 
  User, CheckCircle2, AlertCircle, Smartphone, 
  Cpu, Package, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import supportApi from '../../api/supportApi';

const MedicalRecordPage = () => {
  const { serialNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await supportApi.getMedicalRecord(serialNumber);
        setData(res.data);
      } catch (err) {
        setError("Không tìm thấy thông tin bệnh án thiết bị.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serialNumber]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang truy xuất hồ sơ hệ thống...</p>
       </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
       <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
             <AlertCircle size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Hồ sơ không tồn tại</h2>
            <p className="text-slate-500 font-medium mt-2">{error || "Vui lòng kiểm tra lại số Serial Number."}</p>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Profile */}
      <div className="bg-slate-900 text-white pt-24 pb-32 px-6">
         <div className="max-w-4xl mx-auto">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="px-3 py-1 bg-brand-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Official Record</div>
                     <div className="px-3 py-1 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                        <ShieldCheck size={10} /> Verified by Nexus
                     </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">Bệnh án <br/> thiết bị</h1>
                  <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Serial: {data.serialNumber}</p>
               </div>
               
               {data.warranty ? (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl md:w-72">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trạng thái bảo hành</p>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold">Thời hạn còn lại</span>
                        <span className="text-xs font-black text-emerald-400">
                           {new Date(data.warranty.expiryDate) > new Date() ? 'Còn bảo hành' : 'Hết hạn'}
                        </span>
                     </div>
                     <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-3/4"></div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl md:w-72">
                     <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Thiết bị xách tay</p>
                     <p className="text-xs font-bold text-white mt-1">Chưa kích hoạt bảo hành chính hãng tại hệ thống.</p>
                  </div>
               )}
            </motion.div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-16 px-6 space-y-8">
         {/* System Summary */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: 'Tổng số lần sửa', value: data.repairs.length, icon: Wrench, color: 'blue' },
               { label: 'Linh kiện đã thay', value: data.repairs.reduce((acc, curr) => acc + (curr.usedParts?.length || 0), 0), icon: Package, color: 'emerald' },
               { label: 'Độ tin cậy máy', value: 'High', icon: Activity, color: 'brand' }
            ].map((stat, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
               >
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                     <stat.icon size={22} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                     <h4 className="text-xl font-black text-slate-900">{stat.value}</h4>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Timeline */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Lịch sử can thiệp kỹ thuật</h3>
            </div>

            <div className="space-y-4">
               {data.repairs.length > 0 ? data.repairs.map((repair, idx) => (
                  <motion.div 
                     key={repair._id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  >
                     <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Wrench size={120} />
                     </div>

                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                        <div className="space-y-4 flex-1">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                 <Calendar size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-slate-900">{new Date(repair.updatedAt).toLocaleDateString('vi-VN')}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ngày thực hiện</p>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-tight">
                                 {repair.deviceType} · Sửa chữa {repair.description}
                              </h4>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{repair.repairNotes || repair.expertResponse}"</p>
                              </div>
                           </div>

                           {repair.progressImages?.length > 0 && (
                              <div className="space-y-3">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hình ảnh tư liệu sửa chữa</p>
                                 <div className="flex flex-wrap gap-3">
                                    {repair.progressImages.map((img, i) => (
                                       <div key={i} className="group relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                          <img src={img.url} alt={img.caption} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                          {img.caption && (
                                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                                <p className="text-[8px] text-white font-bold text-center leading-tight">{img.caption}</p>
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {repair.usedParts?.length > 0 && (
                              <div className="space-y-2">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Linh kiện đã thay thế</p>
                                 <div className="flex flex-wrap gap-2">
                                    {repair.usedParts.map((item, i) => (
                                       <div key={i} className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center gap-2">
                                          <Cpu size={12} />
                                          <span className="text-[10px] font-black uppercase tracking-tight">{item.part?.name} (x{item.quantity})</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="md:w-64 space-y-6">
                           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Chuyên gia thực hiện</p>
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
                                    {repair.expert?.avatar && <img src={repair.expert.avatar} className="w-full h-full object-cover" />}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900 uppercase">{repair.expert?.name || 'Kỹ thuật viên Nexus'}</p>
                                    <p className="text-[9px] font-bold text-brand-600 uppercase tracking-tight">{repair.expert?.role || 'Genius Level 5'}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100">
                              <CheckCircle2 size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Đã xác thực hệ thống</span>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )) : (
                  <div className="bg-white py-20 rounded-[2.5rem] border border-dashed border-slate-200 text-center space-y-4">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Clock size={24} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Chưa có lịch sử sửa chữa</h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">Thiết bị này chưa từng thực hiện sửa chữa tại hệ thống chúng tôi.</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default MedicalRecordPage;