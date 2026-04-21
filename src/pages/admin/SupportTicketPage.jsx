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
      setTickets(response.data);
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
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <Ticket className="text-brand-600 w-8 h-8" />
            Quản lý <span className="text-slate-400">Yêu cầu hỗ trợ</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Quản lý và theo dõi các Ticket hỗ trợ kỹ thuật từ khách hàng</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="diagnosing">AI Đang chẩn đoán</option>
            <option value="pending">Đang chờ</option>
            <option value="in-progress">Đang xử lý</option>
            <option value="resolved">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách Ticket */}
        <div className={`lg:col-span-${selectedTicket ? '1' : '3'} space-y-4`}>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-200"></div>)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
              <Ticket size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Không tìm thấy yêu cầu hỗ trợ nào.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
                  selectedTicket?._id === ticket._id ? 'border-brand-500 shadow-brand-50' : 'border-transparent'
                } border border-slate-200`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{ticket.user?.name || 'Ẩn danh'}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <Clock size={12} />
                        {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
                
                <p className="text-sm font-bold text-slate-700 line-clamp-1 mb-2">{ticket.subject}</p>
                
                {ticket.aiSummary && (
                  <div className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                    <Brain size={14} className="text-indigo-500 shrink-0" />
                    <p className="text-[11px] text-indigo-700 italic line-clamp-1">AI: {ticket.aiSummary}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chi tiết Ticket */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] sticky top-6"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter">Chi tiết Hội thoại</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {selectedTicket._id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-all"
                >
                  <Filter className="rotate-45" size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {selectedTicket.chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${chat.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        chat.role === 'user' ? 'bg-slate-900 text-white' : 'bg-brand-100 text-brand-600'
                      }`}>
                        {chat.role === 'user' ? <User size={14} /> : <Brain size={14} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        chat.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none shadow-lg shadow-slate-200' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                      }`}>
                        {chat.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thay đổi trạng thái</label>
                  <div className="flex gap-2">
                    {['pending', 'in-progress', 'resolved'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleUpdateStatus(selectedTicket._id, s)}
                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          selectedTicket.status === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {getStatusLabel(s).replace('AI ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-end gap-3">
                   <button 
                    onClick={() => handleDelete(selectedTicket._id)}
                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                   >
                    <Trash2 size={20} />
                   </button>
                   <button className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-200 hover:bg-brand-700">
                    Giao cho Chuyên gia
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
