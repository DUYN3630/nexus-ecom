import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRedux from 'react-redux';
import { 
  Wrench, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Search, Filter, MoreHorizontal,
  User, Smartphone, Shield, X, MessageSquare, Send,
  Briefcase, Activity, CheckCircle2, RotateCcw,
  History, Inbox, Zap, DollarSign, Notebook,
  MessageCircle, Sparkles, Camera, Image as ImageIcon,
  Trash2, Loader2, Calendar, Plus, Truck
} from 'lucide-react';
import { selectCurrentUser } from '../../store/slices/authSlice';
import supportApi from '../../api/supportApi';
import partApi from '../../api/partApi';
import aiSettingApi from '../../api/aiSettingApi';
import { useToast } from '../../contexts/ToastContext';
import axiosClient from '../../api/axiosClient';

// --- UTILS ---
const formatDateTime = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ExpertDashboard = () => {
  const [experts, setExperts] = useState([]);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'active', 'history', 'schedule'
  
  // Inventory state
  const [inventory, setInventory] = useState([]);

  const { addToast } = useToast();
  const currentUser = ReactRedux.useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await partApi.getAll();
      setInventory(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

  useEffect(() => {
    const fetchExpertInfo = async () => {
      if (!isAdmin && currentUser) {
        try {
          const response = await aiSettingApi.getExpertPerformance();
          const userId = currentUser._id || currentUser.id;
          
          const myProfile = response.find(exp => {
            const expUserId = exp.user?._id || exp.user;
            return expUserId === userId;
          });

          if (myProfile) {
            setSelectedExpertId(myProfile._id);
          } else {
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
  };

  const handleUpdateSuccess = () => {
    setSelectedRepair(null);
    fetchMyRepairs();
    fetchInventory(); // Thêm dòng này để cập nhật lại kho ngay lập tức
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
      'Confirmed': 'bg-blue-50 text-blue-700 border-blue-100',
      'Repairing': 'bg-indigo-50 text-indigo-700 border-indigo-100',
      'Testing': 'bg-purple-50 text-purple-700 border-purple-100',
      'Done': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Returned': 'bg-slate-50 text-slate-700 border-slate-100',
      'AwaitingApproval': 'bg-rose-50 text-rose-700 border-rose-100',
    };
    const labels = {
      'Pending': 'Chờ tiếp nhận',
      'Confirmed': 'Đã xác nhận',
      'Repairing': 'Đang sửa chữa',
      'Testing': 'Đang kiểm tra',
      'Done': 'Hoàn thành',
      'Returned': 'Đã trả máy',
      'AwaitingApproval': 'Chờ khách duyệt'
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${styles[status] || 'bg-slate-50'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredRepairs = repairs.filter(repair => {
    if (activeTab === 'new') return repair.status === 'Pending';
    if (activeTab === 'active') return ['Confirmed', 'Repairing', 'Testing', 'AwaitingApproval'].includes(repair.status);
    if (activeTab === 'history') return ['Done', 'Returned'].includes(repair.status);
    return true;
  });

  const tabs = [
    { id: 'new', label: 'Hàng chờ mới', icon: Inbox, count: repairs.filter(r => r.status === 'Pending').length },
    { id: 'active', label: 'Tiến độ thực tế', icon: Zap, count: repairs.filter(r => ['Confirmed', 'Repairing', 'Testing', 'AwaitingApproval'].includes(r.status)).length },
    { id: 'schedule', label: 'Lịch trình', icon: Calendar, count: appointments.length },
    { id: 'history', label: 'Lịch sử', icon: History, count: repairs.filter(r => ['Done', 'Returned'].includes(r.status)).length },
  ];

  return (
    <div className="animate-in fade-in duration-500 text-left pb-24 bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hệ thống Kỹ thuật Real-time</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Expert <span className="text-brand-600">Workspace</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">Trung tâm điều phối và xử lý kỹ thuật nâng cao</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {isAdmin ? 'SIMULATOR LOGIN' : 'ĐANG ĐĂNG NHẬP'}
                </span>
                {isAdmin ? (
                  <select 
                    value={selectedExpertId}
                    onChange={(e) => setSelectedExpertId(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-bold outline-none cursor-pointer text-slate-900"
                  >
                    {experts.map(exp => (
                        <option key={exp._id} value={exp._id} className="text-slate-900">{exp.name} - {exp.role}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[11px] font-bold text-slate-900 py-0.5">
                    {currentUser?.name || 'Chuyên gia'}
                  </span>
                )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <User size={16} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-8 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg transition-all ${
                        activeTab === tab.id 
                        ? 'bg-brand-600 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <tab.icon size={16} />
                    <span className="text-[11px] font-bold">{tab.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                        {tab.count}
                    </span>
                </button>
            ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          {activeTab === 'schedule' ? (
             <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Lịch trình chuyên gia</h3>
                </div>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {[...appointments.map(a => ({ ...a, type: 'appointment', time: a.slot, date: a.date })),
                     ...repairs.filter(r => r.endTime).map(r => ({ ...r, type: 'repair', time: new Date(r.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), date: r.endTime }))]
                     .sort((a, b) => new Date(a.date) - new Date(b.date))
                     .map((item, idx) => (
                      <div key={idx} className="relative pl-10 group">
                         <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110 ${item.type === 'appointment' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                               <div className="text-center min-w-[60px]">
                                  <p className="text-[10px] font-bold uppercase text-slate-400">{new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                                  <p className="text-base font-bold text-slate-900 leading-none">{item.time}</p>
                               </div>
                               <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                               <div>
                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${item.type === 'appointment' ? 'text-blue-600' : 'text-indigo-600'}`}>
                                     {item.type === 'appointment' ? 'Lịch hẹn trực tiếp' : 'Dự kiến hoàn thành'}
                                  </p>
                                  <h4 className="text-sm font-bold text-slate-800">
                                     {item.deviceType} · {item.notes || item.description?.substring(0, 50) || 'Không có mô tả'}
                                  </h4>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <button 
                                 onClick={() => item.type === 'repair' ? openUpdateModal(item) : addToast('Chức năng đang phát triển', 'info')}
                                 className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                               >
                                 <ChevronRight size={14} />
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-8 py-4">Đơn sửa chữa</th>
                  <th className="px-8 py-4">Khách hàng</th>
                  <th className="px-8 py-4">Thời gian nhận</th>
                  <th className="px-8 py-4 text-center">Trạng thái</th>
                  <th className="px-8 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                   <tr><td colSpan="5" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang đồng bộ...</p>
                      </div>
                   </td></tr>
                ) : filteredRepairs.length === 0 ? (
                   <tr><td colSpan="5" className="py-32 text-center text-slate-300 uppercase text-[10px] font-bold tracking-widest">Không tìm thấy yêu cầu</td></tr>
                ) : (
                  filteredRepairs.map((repair) => (
                    <tr key={repair._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-brand-600 font-mono">#{repair.ticketNumber}</span>
                            <span className="text-sm font-bold text-slate-800">{repair.deviceType}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-xs font-bold text-slate-700">{repair.user?.name || repair.guestInfo?.name}</p>
                         <p className="text-[10px] text-slate-400 font-mono">{repair.user?.phone || repair.guestInfo?.phone}</p>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={12} className="text-brand-500" />
                            <span className="text-[11px] font-medium font-mono">
                               {formatDateTime(repair.receptionTime || repair.createdAt)}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                         {getStatusBadge(repair.status)}
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button 
                           onClick={() => openUpdateModal(repair)}
                           className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-all shadow-sm"
                         >
                           Xử lý <ChevronRight size={12} />
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

      <AnimatePresence>
        {selectedRepair && (
          <RepairUpdateDrawer 
            repair={selectedRepair} 
            inventory={inventory}
            onClose={() => setSelectedRepair(null)}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const RepairUpdateDrawer = ({ repair, inventory, onClose, onSuccess }) => {
  const { addToast } = useToast();
  
  const [expertResponse, setExpertResponse] = useState(repair.expertResponse || '');
  const [repairNotes, setRepairNotes] = useState(repair.repairNotes || '');
  const [customerPhone, setCustomerPhone] = useState(repair.user?.phone || repair.guestInfo?.phone || '');
  const [newStatus, setNewStatus] = useState(repair.status);
  const [serviceFee, setServiceFee] = useState(repair.serviceFee || 0);
  const [endTime, setEndTime] = useState(repair.endTime ? new Date(repair.endTime).toISOString().slice(0, 16) : '');
  const [progressImages, setProgressImages] = useState(repair.progressImages || []);
  const [isUploading, setIsUploading] = useState(false);
  
  // Khởi tạo linh kiện: Cố gắng lấy data từ populate trước, sau đó mới tìm trong inventory
  const [selectedParts, setSelectedParts] = useState(() => {
    if (!repair.usedParts || !Array.isArray(repair.usedParts)) return [];
    return repair.usedParts.map(up => {
      const partId = up.part?._id || up.part;
      // Ưu tiên lấy giá và tên từ object đã được populate
      const name = up.part?.name || 'Linh kiện';
      const price = up.part?.price || 0;
      
      return {
        part: partId,
        quantity: up.quantity || 1,
        price: price,
        name: name
      };
    });
  });

  // Hydration Effect: Nếu inventory load chậm, cập nhật lại tên/giá cho các linh kiện chỉ có ID
  useEffect(() => {
    if (inventory && inventory.length > 0) {
      setSelectedParts(prev => prev.map(item => {
        if (item.name === 'Linh kiện' || item.price === 0) {
          const partInfo = inventory.find(p => p._id === item.part);
          if (partInfo) {
            return {
              ...item,
              name: partInfo.name,
              price: partInfo.price
            };
          }
        }
        return item;
      }));
    }
  }, [inventory]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Gọi API upload thông qua axiosClient
        const response = await axiosClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.success) {
          setProgressImages(prev => [...prev, {
            url: response.data.url,
            caption: '',
            timestamp: new Date()
          }]);
        }
      }
      addToast('Tải ảnh lên thành công', 'success');
    } catch (error) {
      console.error("Upload error:", error);
      addToast('Lỗi khi tải ảnh lên', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const removeImage = (index) => {
    setProgressImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageCaption = (index, caption) => {
    setProgressImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img));
  };
  
  // Logic tính tổng: Đảm bảo ép kiểu số chính xác
  const partsTotal = selectedParts.reduce((acc, curr) => {
    return acc + (Number(curr.price || 0) * Number(curr.quantity || 1));
  }, 0);
  
  const totalCost = partsTotal + Number(serviceFee || 0);

  const handleUpdate = async () => {
    try {
      const formattedParts = selectedParts.map(sp => ({
        part: sp.part,
        quantity: Number(sp.quantity)
      }));

      let finalStatus = newStatus;
      // Nếu có linh kiện hoặc phí dịch vụ mà trạng thái vẫn là Đang chờ, tự động chuyển sang Chờ duyệt
      if ((formattedParts.length > 0 || Number(serviceFee) > 0) && (newStatus === 'Pending' || newStatus === 'Confirmed')) {
        finalStatus = 'AwaitingApproval';
      }

      const payload = {
        status: finalStatus,
        expertResponse,
        repairNotes,
        customerPhone,
        serviceFee: Number(serviceFee),
        estimatedCost: totalCost, // Tổng cộng cuối cùng
        usedParts: formattedParts,
        progressImages, // Gửi kèm ảnh tiến độ
        endTime: endTime ? new Date(endTime) : undefined
      };

      await supportApi.updateRepairStatus(repair._id, payload);
      addToast('Cập nhật thành công!', 'success');
      onSuccess();
    } catch (error) {
      console.error("Update Error Detail:", error.response?.data || error.message);
      addToast('Cập nhật thất bại. Vui lòng thử lại.', 'error');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end text-left">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 30, stiffness: 300 }} 
        className="relative h-full w-full sm:w-[480px] bg-white shadow-2xl flex flex-col z-[10000]"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center border border-slate-100">
                    <Wrench size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">Xử lý kỹ thuật</h2>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">#{repair.ticketNumber}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                <X size={20} />
             </button>
        </div>
        
        <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar">
             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Khách hàng</label>
                        <p className="text-sm font-bold text-slate-800">{repair.user?.name || repair.guestInfo?.name || 'Nexus Guest'}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Số điện thoại</label>
                        <input 
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="bg-transparent text-sm font-bold text-brand-600 outline-none text-right w-32"
                        />
                    </div>
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cập nhật trạng thái</label>
                <div className="grid grid-cols-3 gap-2">
                   {[
                     { key: 'Pending', label: 'Tiếp nhận' },
                     { key: 'Confirmed', label: 'Xác nhận' },
                     { key: 'Repairing', label: 'Sửa chữa' },
                     { key: 'Testing', label: 'Kiểm tra' },
                     { key: 'AwaitingApproval', label: 'Chờ duyệt' },
                     { key: 'Done', label: 'Hoàn tất' }
                   ].map(s => (
                     <button 
                        key={s.key} 
                        onClick={() => setNewStatus(s.key)}
                        className={`py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all ${newStatus === s.key ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                     >
                       {s.label}
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Linh kiện thay thế</h4>
                <div className="flex gap-2">
                    <select id="partSelect" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] outline-none focus:border-brand-500 transition-colors">
                        <option value="">-- Chọn linh kiện --</option>
                        {inventory.map(part => (
                            <option key={part._id} value={part._id}>{part.name} - {part.price.toLocaleString()}đ</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => {
                            const select = document.getElementById('partSelect');
                            const partId = select.value;
                            if (!partId) return;
                            const part = inventory.find(p => p._id === partId);
                            if (!part) return;
                            const existing = selectedParts.find(p => p.part === partId);
                            if (existing) {
                                setSelectedParts(selectedParts.map(p => p.part === partId ? { ...p, quantity: p.quantity + 1 } : p));
                            } else {
                                setSelectedParts([...selectedParts, { part: partId, quantity: 1, name: part.name, price: part.price }]);
                            }
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {selectedParts.map((sp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="text-[11px] font-bold text-slate-800">{sp.name}</p>
                            <p className="text-[9px] font-medium text-slate-400">{sp.quantity} × {sp.price?.toLocaleString()}đ</p>
                        </div>
                        <button onClick={() => setSelectedParts(selectedParts.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phí dịch vụ</label>
                    <div className="relative">
                        <input 
                            type="number"
                            value={serviceFee}
                            onChange={(e) => setServiceFee(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-brand-500 transition-colors pr-10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">đ</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng chi phí</label>
                    <div className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl text-sm font-black text-brand-700 flex items-center gap-1">
                        {totalCost.toLocaleString()}
                        <span className="text-[10px] font-bold">đ</span>
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hạn hoàn thành dự kiến</label>
                <input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-brand-500 transition-colors"
                />
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hình ảnh tiến độ & Bằng chứng</label>
                    <label className="cursor-pointer group">
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <div className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 transition-colors">
                            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">Thêm ảnh</span>
                        </div>
                    </label>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    {progressImages.map((img, idx) => (
                        <div key={idx} className="relative group bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            <img 
                                src={img.url} 
                                alt={`Progress ${idx}`} 
                                className="w-full h-32 object-cover"
                            />
                            <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                            <div className="p-2">
                                <input 
                                    type="text"
                                    placeholder="Ghi chú ảnh (vd: Trước khi gỡ màn...)"
                                    value={img.caption}
                                    onChange={(e) => updateImageCaption(idx, e.target.value)}
                                    className="w-full bg-transparent text-[10px] outline-none border-b border-transparent focus:border-brand-500"
                                />
                            </div>
                        </div>
                    ))}
                    {progressImages.length === 0 && (
                        <div className="col-span-2 py-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300">
                            <ImageIcon size={24} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Chưa có hình ảnh tiến độ</span>
                        </div>
                    )}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ghi chú kỹ thuật (Nội bộ)</label>
                <textarea 
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Ghi chú chi tiết tình trạng lỗi và cách xử lý..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24 text-xs focus:border-brand-500 transition-colors"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phản hồi khách hàng</label>
                <textarea 
                  value={expertResponse}
                  onChange={(e) => setExpertResponse(e.target.value)}
                  placeholder="Nội dung sẽ hiển thị cho khách hàng xem..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24 text-xs focus:border-brand-500 transition-colors"
                />
             </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[11px] uppercase hover:bg-slate-50 transition-colors">Hủy</button>
          <button onClick={handleUpdate} className="flex-[2] py-3 bg-brand-600 text-white rounded-xl font-bold text-[11px] uppercase shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all">Cập nhật tiến độ</button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ExpertDashboard;
