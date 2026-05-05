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
    <div className="p-8 bg-[#f8f9fa] min-h-screen space-y-8">
      {/* Simulation Header */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
               <Briefcase size={32} className="text-brand-400" />
            </div>
            <div>
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Bàn làm việc Chuyên gia</h2>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Giao diện dành riêng cho Kỹ thuật viên Nexus</p>
            </div>
         </div>
         
         <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang xem với tư cách:</span>
            <select 
              value={selectedExpertId}
              onChange={(e) => setSelectedExpertId(e.target.value)}
              className="bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-brand-500"
            >
               {experts.map(exp => (
                 <option key={exp._id} value={exp._id}>{exp.name} ({exp.role})</option>
               ))}
            </select>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
               <Clock size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang chờ xử lý</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{repairs.filter(r => r.status === 'Pending').length}</h4>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
               <Activity size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang thực hiện</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{repairs.filter(r => r.status === 'Repairing').length}</h4>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
               <CheckCircle2 size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã hoàn thành</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{repairs.filter(r => r.status === 'Completed').length}</h4>
         </div>
      </div>

      {/* Work List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <h3 className="font-black uppercase italic tracking-tight">Danh sách yêu cầu phụ trách</h3>
           <button onClick={fetchMyRepairs} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><Activity size={18} className="text-slate-400" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Mã đơn / Thiết bị</th>
                <th className="px-8 py-6">Khách hàng</th>
                <th className="px-8 py-6">Tình trạng lỗi</th>
                <th className="px-8 py-6">Trạng thái</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                 <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Đang tải danh sách công việc...</td></tr>
              ) : repairs.length === 0 ? (
                 <tr><td colSpan="5" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                       <Briefcase size={64} strokeWidth={1} />
                       <p className="text-xs font-black uppercase tracking-widest">Hiện tại bạn chưa có công việc nào được giao</p>
                    </div>
                 </td></tr>
              ) : (
                repairs.map((repair) => (
                  <tr key={repair._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                       <p className="text-[10px] font-bold text-brand-600 font-mono mb-1">{repair.ticketNumber}</p>
                       <p className="text-sm font-black uppercase tracking-tight text-slate-800">{repair.deviceType}</p>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs font-bold text-slate-700">{repair.user?.name || repair.guestInfo?.name}</p>
                       <p className="text-[10px] text-slate-400">{repair.user?.phone || repair.guestInfo?.phone}</p>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                       <p className="text-xs text-slate-600 font-medium italic line-clamp-2">"{repair.description}"</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className={getStatusBadge(repair.status)}>{repair.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => openUpdateModal(repair)}
                         className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-slate-200"
                       >
                         Cập nhật tiến độ
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