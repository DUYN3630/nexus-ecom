import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Search, Filter, MoreHorizontal,
  User, Smartphone, Shield, X, MessageSquare, Send,
  Briefcase, Activity, CheckCircle2
} from 'lucide-react';
import supportApi from '../../api/supportApi';
import aiSettingApi from '../../api/aiSettingApi';
import { useToast } from '../../contexts/ToastContext';

const ExpertDashboard = () => {
  const [experts, setExperts] = useState([]);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [expertResponse, setExpertResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const { addToast } = useToast();

  // 1. Tải danh sách chuyên gia để simulate login
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const data = await aiSettingApi.getExpertPerformance();
        setExperts(data || []);
        if (data && data.length > 0) {
          setSelectedExpertId(data[0]._id); // Mặc định chọn người đầu tiên
        }
      } catch (error) {
        addToast('Lỗi tải danh sách chuyên gia', 'error');
      }
    };
    fetchExperts();
  }, []);

  // 2. Tải danh sách công việc của chuyên gia được chọn
  useEffect(() => {
    if (selectedExpertId) {
      fetchMyRepairs();
    }
  }, [selectedExpertId]);

  const fetchMyRepairs = async () => {
    setIsLoading(true);
    try {
      const data = await supportApi.getExpertRepairs(selectedExpertId);
      setRepairs(data || []);
    } catch (error) {
      addToast('Không thể tải công việc', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateModal = (repair) => {
    setSelectedRepair(repair);
    setExpertResponse(repair.expertResponse || '');
    setNewStatus(repair.status);
  };

  const handleUpdate = async () => {
    try {
      await supportApi.updateRepairStatus(selectedRepair._id, {
        status: newStatus,
        expertResponse: expertResponse 
      });
      addToast('Đã cập nhật tiến độ công việc!', 'success');
      setSelectedRepair(null);
      fetchMyRepairs();
    } catch (error) {
      addToast('Cập nhật thất bại', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
      'Confirmed': 'bg-blue-50 text-blue-600 border-blue-100',
      'Repairing': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Cancelled': 'bg-slate-50 text-slate-400 border-slate-100'
    };
    return `px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles['Pending']}`;
  };

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Bàn làm việc Chuyên gia
          </h1>
          <p className="text-sm text-slate-500 font-medium">Giao diện điều phối và xử lý kỹ thuật dành riêng cho Kỹ thuật viên</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:ring-1 focus-within:ring-brand-500 group">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-r border-slate-100 pr-3 mr-1">Simulator</span>
          <select 
            value={selectedExpertId}
            onChange={(e) => setSelectedExpertId(e.target.value)}
            className="bg-transparent border-none text-xs font-black uppercase tracking-tight outline-none cursor-pointer text-slate-700"
          >
             {experts.map(exp => (
               <option key={exp._id} value={exp._id}>{exp.name} ({exp.role})</option>
             ))}
          </select>
          <User size={16} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         {[
           { label: 'Yêu cầu chờ xử lý', value: repairs.filter(r => r.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
           { label: 'Đang trong tiến độ', value: repairs.filter(r => r.status === 'Repairing').length, color: 'text-brand-600', bg: 'bg-brand-50', icon: Activity },
           { label: 'Yêu cầu hoàn tất', value: repairs.filter(r => r.status === 'Completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h4 className={`text-2xl font-black ${stat.color} tabular-nums`}>{stat.value}</h4>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-transparent group-hover:scale-110 transition-transform ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
           </div>
         ))}
      </div>

      {/* Work List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <Briefcase size={18} className="text-brand-600" /> Danh sách công việc được giao
           </h3>
           <button 
                onClick={fetchMyRepairs} 
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 hover:border-brand-100 transition-all shadow-sm active:scale-95"
            >
                <RotateCcw size={18} />
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Mã đơn / Thiết bị</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tình trạng lỗi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                 <tr><td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                 </td></tr>
              ) : repairs.length === 0 ? (
                 <tr><td colSpan="5" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20 text-slate-300">
                       <Briefcase size={48} strokeWidth={1} />
                       <p className="text-[11px] font-black uppercase tracking-widest">Hiện tại bạn chưa có công việc nào</p>
                    </div>
                 </td></tr>
              ) : (
                repairs.map((repair) => (
                  <tr key={repair._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <p className="text-[10px] font-bold text-brand-600 font-mono mb-1">#{repair.ticketNumber}</p>
                       <p className="text-sm font-black uppercase tracking-tight text-slate-800">{repair.deviceType}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{repair.user?.name || repair.guestInfo?.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold font-mono">{repair.user?.phone || repair.guestInfo?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs text-slate-500 font-medium italic line-clamp-1 max-w-[200px]">&quot;{repair.description}&quot;</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={getStatusBadge(repair.status)}>{repair.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => openUpdateModal(repair)}
                         className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                       >
                         Cập nhật
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal (Reuse logic from RepairManagement) */}
      <AnimatePresence>
        {selectedRepair && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRepair(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-slate-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-lg"><Wrench size={16} /></div>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">Báo cáo tiến độ {selectedRepair.ticketNumber}</h3>
                 </div>
                 <button onClick={() => setSelectedRepair(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái công việc</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['Confirmed', 'Repairing', 'Completed'].map(status => (
                         <button 
                            key={status} 
                            onClick={() => setNewStatus(status)}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newStatus === status ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                         >
                           {status}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <MessageSquare size={14} /> Ghi chú kỹ thuật / Phản hồi
                    </label>
                    <textarea 
                      placeholder="Mô tả công việc đã làm hoặc báo giá cho khách..."
                      value={expertResponse}
                      onChange={(e) => setExpertResponse(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white h-32 text-sm font-medium transition-all"
                    />
                 </div>

                 <button 
                    onClick={handleUpdate}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                 >
                    <Send size={18} /> Lưu & Báo cáo kết quả
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />
    </div>
  );
};

export default ExpertDashboard;