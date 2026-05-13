import React, { useState, useEffect } from 'react';
import { 
  Ticket, Search, Filter, MessageSquare, User, Clock, 
  CheckCircle2, AlertCircle, Trash2, MoreVertical,
  ChevronRight, Brain, UserCheck, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ticketApi from '../../api/ticketApi';
import { useToast } from '../../contexts/ToastContext';

const SupportTicketPage = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketApi.getAll({ status: filterStatus });
      // Xử lý linh hoạt cho cả trường hợp API trả về mảng trực tiếp hoặc object { data: ... }
      const ticketData = Array.isArray(response) ? response : (response.data || []);
      setTickets(ticketData);
    } catch (error) {
      addToast('Không thể tải danh sách yêu cầu hỗ trợ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await ticketApi.update(id, { status: newStatus });
      addToast('Cập nhật trạng thái thành công', 'success');
      fetchTickets();
      if (selectedTicket?._id === id) setSelectedTicket(null);
    } catch (error) {
      addToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) return;
    try {
      await ticketApi.delete(id);
      addToast('Đã xóa yêu cầu thành công', 'success');
      fetchTickets();
    } catch (error) {
      addToast('Lỗi khi xóa yêu cầu', 'error');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'diagnosing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'in-progress': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'diagnosing': return 'AI Đang chẩn đoán';
      case 'pending': return 'Đang chờ xử lý';
      case 'in-progress': return 'Đang xử lý';
      case 'resolved': return 'Đã hoàn thành';
      default: return status;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Yêu cầu hỗ trợ</h1>
          <p className="text-sm text-slate-500 font-medium">Theo dõi và xử lý các Ticket hỗ trợ kỹ thuật từ khách hàng</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-sm cursor-pointer"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="diagnosing">AI Đang chẩn đoán</option>
            <option value="pending">Đang chờ xử lý</option>
            <option value="in-progress">Đang trong tiến trình</option>
            <option value="resolved">Đã hoàn tất</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket List */}
        <div className={`${selectedTicket ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-4`}>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-2xl border border-slate-100"></div>)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-2xl border border-dashed border-slate-200">
              <Ticket size={48} className="mx-auto text-slate-200 mb-4 opacity-50" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không tìm thấy yêu cầu hỗ trợ nào</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedTicket ? 'lg:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {tickets.map((ticket) => (
                <div 
                  key={ticket._id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer group shadow-sm ${
                    selectedTicket?._id === ticket._id ? 'border-brand-500 ring-4 ring-brand-50' : 'border-transparent hover:border-slate-200'
                  } border border-slate-100`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:scale-110 transition-transform">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{ticket.user?.name || 'Ẩn danh'}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <Clock size={12} />
                          {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border whitespace-nowrap ${getStatusStyle(ticket.status)}`}>
                      {getStatusLabel(ticket.status).replace('Đang ', '')}
                    </span>
                  </div>
                  
                  <p className="text-xs font-black text-slate-700 line-clamp-2 mb-4 h-8 uppercase tracking-tight leading-relaxed">
                    {ticket.subject}
                  </p>
                  
                  {ticket.aiSummary && (
                    <div className="flex items-start gap-2 bg-brand-50/50 p-3 rounded-xl border border-brand-100">
                      <Brain size={14} className="text-brand-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-brand-700 italic font-medium leading-relaxed line-clamp-2">AI Summary: {ticket.aiSummary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail (Slide-over effect but inline) */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-200px)] sticky top-6"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Hồ sơ Ticket</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Mã: {selectedTicket._id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 no-scrollbar">
                {selectedTicket.chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${chat.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-transparent ${
                        chat.role === 'user' ? 'bg-slate-900 text-white' : 'bg-brand-100 text-brand-600 border-brand-200'
                      }`}>
                        {chat.role === 'user' ? <User size={14} /> : <Brain size={14} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                        chat.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}>
                        {chat.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Thay đổi Trạng thái</label>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'in-progress', 'resolved'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleUpdateStatus(selectedTicket._id, s)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                          selectedTicket.status === s ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {getStatusLabel(s).replace('Đang ', '').replace('AI ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-end gap-3">
                   <button 
                    onClick={() => handleDelete(selectedTicket._id)}
                    className="p-3.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm active:scale-95"
                   >
                    <Trash2 size={20} />
                   </button>
                   <button className="flex-1 py-3.5 bg-brand-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-200 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <UserCheck size={16} /> Chỉ định Chuyên gia
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupportTicketPage;
