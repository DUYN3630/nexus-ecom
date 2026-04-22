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
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-[1000] tracking-tighter uppercase italic">Quản lý sửa chữa</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Giao diện phản hồi khách hàng và điều phối kỹ thuật.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm mã ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Tổng yêu cầu', value: repairs.length, color: 'text-slate-900', icon: Wrench },
           { label: 'Đang chờ', value: repairs.filter(r => r.status === 'Pending').length, color: 'text-amber-500', icon: Clock },
           { label: 'Đang sửa', value: repairs.filter(r => r.status === 'Repairing').length, color: 'text-indigo-600', icon: AlertCircle },
           { label: 'Hoàn thành', value: repairs.filter(r => r.status === 'Completed').length, color: 'text-emerald-500', icon: CheckCircle },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
           </div>
         ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Thiết bị</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Mô tả lỗi</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
              <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
               <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</td></tr>
            ) : repairs.length === 0 ? (
               <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Không có yêu cầu nào</td></tr>
            ) : (
              repairs.filter(r => r.ticketNumber.includes(searchTerm)).map((repair) => (
                <tr key={repair._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                          <Smartphone size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight text-slate-800">{repair.deviceType}</p>
                          <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">{repair.ticketNumber}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-xs font-bold text-slate-700">{repair.user?.name || repair.guestInfo?.name}</p>
                     <p className="text-[10px] text-slate-400">{repair.user?.phone || repair.guestInfo?.phone}</p>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-xs text-slate-600 font-medium italic line-clamp-2 max-w-[250px]">
                        "{repair.description}"
                     </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={getStatusBadge(repair.status)}>
                      {repair.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => openUpdateModal(repair)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                    >
                      Xử lý / Rep
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Trang {pagination.page} / {pagination.totalPages || 1} • Tổng {pagination.total || 0} yêu cầu
         </p>
         {pagination.totalPages > 1 && (
           <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pagination.page === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
              >
                 Trước
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${pagination.page === i + 1 ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                   {i + 1}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pagination.page === pagination.totalPages ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
              >
                 Sau
              </button>
           </div>
         )}
         {pagination.totalPages <= 1 && (
           <span className="text-[10px] font-bold text-slate-300 uppercase italic">Dữ liệu nằm gọn trong 1 trang</span>
         )}
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRepair(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-slate-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-lg"><Wrench size={16} /></div>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">Xử lý yêu cầu {selectedRepair.ticketNumber}</h3>
                 </div>
                 <button onClick={() => setSelectedRepair(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái sửa chữa</label>
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
                       <MessageSquare size={14} /> Phản hồi khách hàng
                    </label>
                    <textarea 
                      placeholder="Gõ tin nhắn phản hồi cho khách..."
                      value={expertResponse}
                      onChange={(e) => setExpertResponse(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white h-32 text-sm font-medium transition-all"
                    />
                 </div>

                 <button 
                    onClick={handleUpdate}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                 >
                    <Send size={18} /> Gửi phản hồi & Cập nhật
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
