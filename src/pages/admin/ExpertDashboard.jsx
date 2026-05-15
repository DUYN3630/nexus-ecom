import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRedux from 'react-redux';
import { 
  Wrench, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Search, Filter, MoreHorizontal,
  User, Smartphone, Shield, X, MessageSquare, Send,
  Briefcase, Activity, CheckCircle2, RotateCcw,
  History, Inbox, Zap, DollarSign, Notebook,
  MessageCircle, Sparkles, Camera, Image as ImageIcon,
  Trash2, Loader2, Calendar
} from 'lucide-react';
import { selectCurrentUser } from '../../store/slices/authSlice';
import supportApi from '../../api/supportApi';
import aiSettingApi from '../../api/aiSettingApi';
import { useToast } from '../../contexts/ToastContext';
import axiosClient from '../../api/axiosClient';

const ExpertDashboard = () => {
  const [experts, setExperts] = useState([]);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'active', 'history', 'schedule'
  
  // Form states for modal
  const [expertResponse, setExpertResponse] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [newStatus, setNewStatus] = useState('');
  const [progressImages, setProgressImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { addToast } = useToast();

  const currentUser = ReactRedux.useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  // 1. Tải danh sách chuyên gia (Chỉ dành cho Admin)
  useEffect(() => {
    const fetchExpertInfo = async () => {
      if (!isAdmin && currentUser) {
        try {
          const response = await aiSettingApi.getExpertPerformance();
          const userId = currentUser._id || currentUser.id;
          
          console.log("[DEBUG] Current User ID:", userId);
          
          const myProfile = response.find(exp => {
            const expUserId = exp.user?._id || exp.user;
            return expUserId === userId;
          });

          if (myProfile) {
            console.log("[DEBUG] Successfully mapped to Expert Profile:", myProfile._id);
            setSelectedExpertId(myProfile._id);
          } else {
            console.warn("[WARN] Could not find Expert Profile mapping for User ID:", userId);
            // Vẫn gán User ID để backend tự tìm profile tương ứng
            setSelectedExpertId(userId);
          }
        } catch (error) {
          console.error("Error fetching expert profile:", error);
          setSelectedExpertId(currentUser._id || currentUser.id);
        }
        return;
      }

      try {
        const data = await aiSettingApi.getExpertPerformance();
        setExperts(data || []);
        if (data && data.length > 0) {
          setSelectedExpertId(data[0]._id);
        }
      } catch (error) {
        addToast('Lỗi tải danh sách chuyên gia', 'error');
      }
    };
    
    fetchExpertInfo();
  }, [isAdmin, currentUser]);

  // 2. Tải danh sách công việc & lịch hẹn
  useEffect(() => {
    if (selectedExpertId) {
      fetchMyRepairs();
      fetchMyAppointments();
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

  const fetchMyAppointments = async () => {
    try {
      const data = await axiosClient.get(`/appointments/expert/${selectedExpertId}`);
      setAppointments(data || []);
    } catch (error) {
      console.error("Fetch appointments error:", error);
    }
  };

  const openUpdateModal = (repair) => {
    setSelectedRepair(repair);
    setExpertResponse(repair.expertResponse || '');
    setRepairNotes(repair.repairNotes || '');
    setEstimatedCost(repair.estimatedCost || 0);
    setNewStatus(repair.status);
    setProgressImages(repair.progressImages || []);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newImage = {
        url: response.data.url,
        caption: `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN')}`,
        timestamp: new Date()
      };
      
      setProgressImages(prev => [...prev, newImage]);
      addToast('Đã tải ảnh lên thành công', 'success');
    } catch (error) {
      addToast('Lỗi khi tải ảnh lên', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setProgressImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    try {
      await supportApi.updateRepairStatus(selectedRepair._id, {
        status: newStatus,
        expertResponse,
        repairNotes,
        estimatedCost: Number(estimatedCost),
        progressImages,
        endTime: selectedRepair.endTime
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
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
      'Repairing': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Testing': 'bg-purple-100 text-purple-700 border-purple-200',
      'Done': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Returned': 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return `px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-100'}`;
  };

  const filteredRepairs = repairs.filter(repair => {
    if (activeTab === 'new') return repair.status === 'Pending';
    if (activeTab === 'active') return ['Confirmed', 'Repairing', 'Testing'].includes(repair.status);
    if (activeTab === 'history') return ['Done', 'Returned'].includes(repair.status);
    return true;
  });

  const tabs = [
    { id: 'new', label: 'Hàng chờ mới', icon: Inbox, count: repairs.filter(r => r.status === 'Pending').length },
    { id: 'active', label: 'Tiến độ thực tế', icon: Zap, count: repairs.filter(r => ['Confirmed', 'Repairing', 'Testing'].includes(r.status)).length },
    { id: 'schedule', label: 'Lịch trình', icon: Calendar, count: appointments.length },
    { id: 'history', label: 'Lịch sử', icon: History, count: repairs.filter(r => ['Done', 'Returned'].includes(r.status)).length },
  ];

  const workflowSteps = [
    { status: 'Confirmed', label: 'Xác nhận' },
    { status: 'Repairing', label: 'Đang sửa' },
    { status: 'Testing', label: 'Đang Test' },
    { status: 'Done', label: 'Xong' },
    { status: 'Returned', label: 'Đã trả máy' },
  ];

  return (
    <div className="animate-in fade-in duration-500 text-left pb-24 bg-slate-50/50 min-h-screen">
      {/* Simulation Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hệ thống Kỹ thuật Real-time</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Expert <span className="text-brand-600">Workspace</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">Trung tâm điều phối và xử lý kỹ thuật nâng cao</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900 p-2 px-4 rounded-2xl shadow-xl shadow-slate-200 transition-all group border border-slate-800">
            <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {isAdmin ? 'SIMULATOR LOGIN' : 'ĐANG ĐĂNG NHẬP'}
                </span>
                {isAdmin ? (
                  <select 
                    value={selectedExpertId}
                    onChange={(e) => setSelectedExpertId(e.target.value)}
                    className="bg-transparent border-none text-xs font-black uppercase tracking-tight outline-none cursor-pointer text-white"
                  >
                    {experts.map(exp => (
                        <option key={exp._id} value={exp._id} className="text-slate-900">{exp.name} - {exp.role}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs font-black uppercase tracking-tight text-white py-1">
                    {currentUser?.name || 'Chuyên gia'}
                  </span>
                )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white border border-slate-700">
                <User size={18} />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
                        activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <tab.icon size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                        {tab.count}
                    </span>
                </button>
            ))}
        </div>

        {/* Work List & Schedule */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          {activeTab === 'schedule' ? (
             <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Lịch trình chuyên gia (Lịch hẹn & Công việc)</h3>
                   <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Lịch hẹn khách
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold uppercase">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Công việc sửa chữa
                      </div>
                   </div>
                </div>

                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {[...appointments.map(a => ({ ...a, type: 'appointment', time: a.slot, date: a.date })),
                     ...repairs.filter(r => r.endTime).map(r => ({ ...r, type: 'repair', time: new Date(r.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), date: r.endTime }))]
                     .sort((a, b) => new Date(a.date) - new Date(b.date))
                     .map((item, idx) => (
                      <div key={idx} className="relative pl-10 group">
                         <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-125 ${item.type === 'appointment' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                         <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                               <div className="text-center min-w-[60px]">
                                  <p className="text-[10px] font-black uppercase text-slate-400">{new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                                  <p className="text-lg font-black text-slate-900 leading-none">{item.time}</p>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date(item.date).toLocaleDateString('vi-VN')}</p>
                               </div>
                               <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                               <div>
                                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${item.type === 'appointment' ? 'text-blue-600' : 'text-indigo-600'}`}>
                                     {item.type === 'appointment' ? 'Lịch hẹn trực tiếp' : 'Dự kiến hoàn thành sửa'}
                                  </p>
                                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                     {item.deviceType} · {item.notes || item.description?.substring(0, 50) || 'Không có mô tả'}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                                     Khách hàng: {item.user?.name || item.guestInfo?.name || 'Nexus Client'}
                                  </p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'completed' || item.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                  {item.status}
                               </span>
                               <button 
                                 onClick={() => item.type === 'repair' ? openUpdateModal(item) : addToast('Chức năng đang phát triển', 'info')}
                                 className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                               >
                                 <ChevronRight size={16} />
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                   {appointments.length === 0 && repairs.filter(r => r.endTime).length === 0 && (
                      <div className="py-20 text-center text-slate-400">
                         <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="text-xs font-black uppercase tracking-widest">Chưa có lịch trình cụ thể nào</p>
                      </div>
                   )}
                </div>
             </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5">Đơn sửa chữa</th>
                  <th className="px-8 py-5">Khách hàng</th>
                  <th className="px-8 py-5">Nội dung kỹ thuật</th>
                  <th className="px-8 py-5">Trạng thái</th>
                  <th className="px-8 py-5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                   <tr><td colSpan="5" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Đang đồng bộ dữ liệu...</p>
                      </div>
                   </td></tr>
                ) : filteredRepairs.length === 0 ? (
                   <tr><td colSpan="5" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                         <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <Briefcase size={32} />
                         </div>
                         <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Không tìm thấy yêu cầu nào trong mục này</p>
                      </div>
                   </td></tr>
                ) : (
                  filteredRepairs.map((repair) => (
                    <tr key={repair._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-brand-600 font-mono">#{repair.ticketNumber}</span>
                            <span className="text-sm font-black uppercase tracking-tight text-slate-800">{repair.deviceType}</span>
                            {repair.urgency === 'Urgent' && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase">
                                    <AlertCircle size={10} /> Hỏa tốc
                                </span>
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                                {(repair.user?.name || repair.guestInfo?.name || 'G')[0]}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-700 uppercase">{repair.user?.name || repair.guestInfo?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold font-mono">{repair.user?.phone || repair.guestInfo?.phone}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-xs text-slate-500 font-medium line-clamp-2 max-w-[250px] leading-relaxed italic">
                            &quot;{repair.description}&quot;
                         </p>
                      </td>
                      <td className="px-8 py-6">
                         <span className={getStatusBadge(repair.status)}>{repair.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button 
                           onClick={() => openUpdateModal(repair)}
                           className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                         >
                           Xử lý <ChevronRight size={14} />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Processing Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setSelectedRepair(null)} 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                        <Wrench size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-0.5">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900">
                                Ticket #{selectedRepair.ticketNumber}
                            </h3>
                            <span className={getStatusBadge(selectedRepair.status)}>{selectedRepair.status}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {selectedRepair.deviceType} • {selectedRepair.user?.name || selectedRepair.guestInfo?.name}
                        </p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setSelectedRepair(null)} 
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                >
                    <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                 {/* AI Chat Context Section */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Sparkles size={14} className="text-brand-500" /> Bối cảnh hội thoại AI
                        </label>
                        <span className="text-[9px] font-bold text-slate-300 uppercase">Dữ liệu từ Gemini AI Support</span>
                    </div>
                    
                    <div className="bg-slate-900 rounded-3xl p-6 text-slate-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageCircle size={120} />
                        </div>
                        
                        {/* Mock or actual Chat History */}
                        <div className="relative z-10 space-y-4 max-h-48 overflow-y-auto custom-scrollbar pr-4 text-xs font-medium leading-relaxed">
                            {selectedRepair.description.includes('[TỪ AI CHAT]') ? (
                                <div className="space-y-3">
                                    <p className="text-brand-400 font-bold uppercase tracking-widest text-[10px] mb-2">Trích xuất từ Chatbot:</p>
                                    <div className="whitespace-pre-wrap opacity-90 italic">
                                        {selectedRepair.description.replace('[TỪ AI CHAT]:', '').trim()}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
                                    <MessageSquare size={24} strokeWidth={1} />
                                    <p className="italic">Không tìm thấy lịch sử hội thoại AI cho đơn này.</p>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>

                 {/* Workflow Progress */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Activity size={14} /> Quy trình xử lý (Workflow)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                       {workflowSteps.map(step => (
                         <button 
                            key={step.status} 
                            onClick={() => setNewStatus(step.status)}
                            className={`px-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-2 ${
                                newStatus === step.status 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-105 z-10' 
                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300 hover:bg-white'
                            }`}
                         >
                           {newStatus === step.status && <CheckCircle size={14} className="text-emerald-400" />}
                           {step.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Input Fields Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Internal Notes */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Notebook size={14} /> Nhật ký Kỹ thuật (Nội bộ)
                        </label>
                        <textarea 
                            placeholder="Ghi lại tình trạng máy, các linh kiện đã thay, lỗi phát sinh..."
                            value={repairNotes}
                            onChange={(e) => setRepairNotes(e.target.value)}
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-brand-500/30 focus:bg-white h-40 text-sm font-medium transition-all"
                        />
                    </div>

                    {/* Customer Response */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <MessageCircle size={14} /> Phản hồi Khách hàng (Hiển thị)
                        </label>
                        <textarea 
                            placeholder="Thông báo tình trạng cho khách, giải thích lỗi..."
                            value={expertResponse}
                            onChange={(e) => setExpertResponse(e.target.value)}
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-emerald-500/30 focus:bg-white h-40 text-sm font-medium transition-all"
                        />
                    </div>
                 </div>

                 {/* Progress Images Section */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Camera size={14} /> Hình ảnh Tiến độ sửa chữa
                        </label>
                        <label className="cursor-pointer group flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl border border-brand-100 hover:bg-brand-600 hover:text-white transition-all">
                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">Tải ảnh lên</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {progressImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100">
                                <img src={img.url} alt={`Progress ${idx}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => removeImage(idx)}
                                        className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-[8px] text-white font-medium truncate">{img.caption}</p>
                                </div>
                            </div>
                        ))}
                        {progressImages.length === 0 && !isUploading && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                                <ImageIcon size={32} strokeWidth={1} />
                                <p className="text-[10px] font-bold uppercase mt-2">Chưa có hình ảnh tiến độ</p>
                            </div>
                        )}
                        {isUploading && (
                            <div className="aspect-square rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 flex flex-col items-center justify-center text-brand-500 animate-pulse">
                                <Loader2 size={24} className="animate-spin mb-2" />
                                <span className="text-[8px] font-black uppercase">Đang tải...</span>
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Estimated Cost & Time */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <DollarSign size={14} /> Báo giá thực tế (VNĐ)
                        </label>
                        <div className="relative">
                            <input 
                                type="number"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white font-black text-slate-800"
                            />
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Calendar size={14} /> Thời gian hoàn thành dự kiến
                        </label>
                        <div className="relative">
                            <input 
                                type="datetime-local"
                                value={selectedRepair?.endTime ? new Date(selectedRepair.endTime).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setSelectedRepair(prev => ({ ...prev, endTime: date }));
                                }}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white font-black text-slate-800 text-xs"
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 sticky bottom-0 z-20">
                <button 
                    onClick={handleUpdate}
                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 group active:scale-95"
                >
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    Cập nhật tiến độ & Gửi thông báo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default ExpertDashboard;
