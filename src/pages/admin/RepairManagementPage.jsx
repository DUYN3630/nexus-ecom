import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Search, Filter, MoreHorizontal,
  User, Smartphone, Shield, X, MessageSquare, Send
} from 'lucide-react';
import supportApi from '../../api/supportApi';
import { useToast } from '../../contexts/ToastContext';

const RepairManagementPage = () => {
  const [repairs, setRepairs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [expertResponse, setExpertResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchRepairs(pagination.page);
  }, [pagination.page]);

  const fetchRepairs = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await supportApi.getAllRepairs({ page, limit: 5 });
      setRepairs(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      addToast('Không thể lấy danh sách yêu cầu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
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
        status: newStatus, // Gửi trạng thái mới chọn
        expertResponse: expertResponse 
      });
      addToast('Đã cập nhật trạng thái và gửi phản hồi', 'success');
      setSelectedRepair(null);
      fetchRepairs();
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Quản lý Sửa chữa
          </h1>
          <p className="text-sm text-slate-500 font-medium">Giao diện phản hồi khách hàng và điều phối kỹ thuật hệ thống.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Tìm mã ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {[
           { label: 'Tổng yêu cầu', value: repairs.length, color: 'text-slate-900', bg: 'bg-slate-50', icon: Wrench },
           { label: 'Đang chờ', value: repairs.filter(r => r.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
           { label: 'Đang sửa', value: repairs.filter(r => r.status === 'Repairing').length, color: 'text-brand-600', bg: 'bg-brand-50', icon: AlertCircle },
           { label: 'Hoàn thành', value: repairs.filter(r => r.status === 'Completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-transparent group-hover:scale-110 transition-transform ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
           </div>
         ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Thiết bị / Ticket</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung yêu cầu</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                 <tr><td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang đồng bộ Atlas...</p>
                    </div>
                 </td></tr>
              ) : repairs.length === 0 ? (
                 <tr><td colSpan="5" className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Không tìm thấy yêu cầu</td></tr>
              ) : (
                repairs.filter(r => r.ticketNumber.includes(searchTerm)).map((repair) => (
                  <tr key={repair._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <Smartphone size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-black uppercase tracking-tight text-slate-800 truncate max-w-[120px]">{repair.deviceType}</p>
                            <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5 tracking-tighter">#{repair.ticketNumber}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate max-w-[150px]">{repair.user?.name || repair.guestInfo?.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold font-mono">{repair.user?.phone || repair.guestInfo?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs text-slate-500 font-medium italic line-clamp-1 max-w-[200px]">
                          &quot;{repair.description}&quot;
                       </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(repair.status)}>
                        {repair.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openUpdateModal(repair)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                      >
                        Phản hồi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
         <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Trang {pagination.page} / {pagination.totalPages || 1}
         </p>
         <div className="flex items-center gap-2">
            <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
                <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <div className="flex gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => (
                <button 
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${pagination.page === i + 1 ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}
                >
                    {i + 1}
                </button>
                ))}
            </div>
            <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRepair(null)} className="absolute inset-0" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-slate-100 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <Wrench size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Cập nhật tiến độ</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mã: #{selectedRepair.ticketNumber}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedRepair(null)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-800 shadow-sm border border-transparent hover:border-slate-100">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Giai đoạn vận hành</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['Confirmed', 'Repairing', 'Completed'].map(status => (
                         <button 
                            key={status} 
                            onClick={() => setNewStatus(status)}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${newStatus === status ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600'}`}
                         >
                           {status === 'Confirmed' ? 'Xác nhận' : status === 'Repairing' ? 'Đang sửa' : 'Hoàn tất'}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                       <MessageSquare size={14} className="text-brand-600" /> Nội dung phản hồi khách hàng
                    </label>
                    <textarea 
                      placeholder="Gõ nội dung tư vấn hoặc thông báo tiến độ..."
                      value={expertResponse}
                      onChange={(e) => setExpertResponse(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 h-36 text-sm font-medium transition-all shadow-inner resize-none"
                    />
                 </div>

                 <button 
                    onClick={handleUpdate}
                    className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-200 active:scale-[0.98]"
                 >
                    <Send size={18} /> Lưu & Gửi thông báo
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepairManagementPage;
