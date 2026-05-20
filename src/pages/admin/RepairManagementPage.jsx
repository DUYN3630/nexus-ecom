import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Search, Filter, MoreHorizontal,
  User, Smartphone, Shield, X, MessageSquare, Send, Plus, Trash2, Truck,
  Save, History, Smartphone as DeviceIcon, UserCheck, DollarSign
} from 'lucide-react';
import supportApi from '../../api/supportApi';
import partApi from '../../api/partApi';
import logisticsApi from '../../api/logisticsApi';
import { useToast } from '../../contexts/ToastContext';

const RepairManagementPage = () => {
  const [repairs, setRepairs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [expertResponse, setExpertResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  
  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [partCost, setPartCost] = useState(0);

  // Shipper State
  const [shipperInfo, setShipperInfo] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchRepairs(pagination.page);
    fetchInventory();
  }, [pagination.page]);

  const fetchInventory = async () => {
    try {
      const res = await partApi.getAll();
      setInventory(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

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
    setSerialNumber(repair.serialNumber || '');
    setSelectedParts(repair.usedParts ? repair.usedParts.map(up => ({
      part: up.part?._id || up.part,
      quantity: up.quantity,
      price: up.part?.price || 0,
      name: up.part?.name || 'Linh kiện hệ thống'
    })) : []);
    setPartCost(repair.estimatedCost || 0);
  };

  const handleUpdate = async () => {
    try {
      const formattedParts = selectedParts.map(sp => ({
        part: sp.part,
        quantity: sp.quantity
      }));
      const totalCost = selectedParts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

      // Nếu đang báo giá và thêm linh kiện, tự động đổi status thành AwaitingApproval nếu chưa được khách duyệt
      let finalStatus = newStatus;
      if (formattedParts.length > 0 && newStatus === 'Pending') {
        finalStatus = 'AwaitingApproval';
      }

      await supportApi.updateRepairStatus(selectedRepair._id, {
        status: finalStatus,
        expertResponse: expertResponse,
        serialNumber: serialNumber.toUpperCase(),
        usedParts: formattedParts,
        estimatedCost: totalCost
      });
      addToast('Đã cập nhật trạng thái và gửi báo giá', 'success');
      setSelectedRepair(null);
      fetchRepairs(pagination.page);
    } catch (error) {
      addToast('Cập nhật thất bại', 'error');
    }
  };

  const handleCallShipper = async () => {
    if (!selectedRepair) return;
    try {
      const response = await logisticsApi.createShippingOrder({
        type: 'repair',
        id: selectedRepair._id,
        serviceType: 'BIKE'
      });
      if (response.success) {
        addToast(response.message, 'success');
        setShipperInfo(response.data);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Lỗi gọi Shipper', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
      'Confirmed': 'bg-blue-50 text-blue-600 border-blue-100',
      'Repairing': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'Testing': 'bg-purple-50 text-purple-600 border-purple-100',
      'Done': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Returned': 'bg-slate-50 text-slate-400 border-slate-100',
      'AwaitingApproval': 'bg-rose-50 text-rose-600 border-rose-100'
    };
    const labels = {
      'Pending': 'Chờ tiếp nhận',
      'Confirmed': 'Đã xác nhận',
      'Repairing': 'Đang sửa chữa',
      'Testing': 'Đang kiểm tra',
      'Done': 'Đã hoàn thành',
      'Returned': 'Đã trả máy',
      'AwaitingApproval': 'Chờ khách duyệt'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles['Pending']}`}>
        {labels[status] || status}
      </span>
    );
  };

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

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase tracking-tighter">
            Quản lý Sửa chữa
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                <Wrench size={12}/> {repairs.length} Lượt tiếp nhận
            </span>
          </div>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Tìm theo mã ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase focus:border-brand-600 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {[
           { label: 'Tổng yêu cầu', value: repairs.length, color: 'text-slate-900', bg: 'bg-slate-50', icon: History },
           { label: 'Đang chờ', value: repairs.filter(r => r.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
           { label: 'Đang sửa', value: repairs.filter(r => r.status === 'Repairing').length, color: 'text-brand-600', bg: 'bg-brand-50', icon: AlertCircle },
           { label: 'Hoàn thành', value: repairs.filter(r => r.status === 'Completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-brand-500 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h4 className={`text-xl font-black tabular-nums ${stat.color}`}>{stat.value}</h4>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-transparent group-hover:scale-110 transition-transform ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
           </div>
         ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Thiết bị / Ticket</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung yêu cầu</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian nhận</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 w-[120px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {isLoading ? (
                 <tr><td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang đồng bộ Atlas...</p>
                    </div>
                 </td></tr>
              ) : repairs.length === 0 ? (
                 <tr><td colSpan="6" className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Không tìm thấy yêu cầu</td></tr>
              ) : (
                repairs.filter(r => r.ticketNumber.includes(searchTerm)).map((repair) => (
                  <tr key={repair._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-slate-50 text-slate-400 flex items-center justify-center shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all group-hover:scale-110">
                            <Smartphone size={20} />
                         </div>
                         <div>
                            <p className="text-xs font-black uppercase tracking-tight text-slate-900 truncate max-w-[120px]">{repair.deviceType}</p>
                            <p className="text-[10px] font-black text-slate-400 font-mono mt-0.5 tracking-tighter">#{repair.ticketNumber}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px]">{repair.user?.name || repair.guestInfo?.name}</p>
                       <p className="text-[10px] text-slate-400 font-black font-mono">{repair.user?.phone || repair.guestInfo?.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs text-slate-500 font-medium italic line-clamp-1 max-w-[200px]">
                          &quot;{repair.description}&quot;
                       </p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-slate-600">
                          <Clock size={12} className="text-brand-500" />
                          <span className="text-[10px] font-black font-mono">
                             {formatDateTime(repair.receptionTime || repair.createdAt)}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {getStatusBadge(repair.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => openUpdateModal(repair)}
                        className="px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-200"
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
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm mb-8">
         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Trang {pagination.page} / {pagination.totalPages || 1}
         </p>
         <div className="flex items-center gap-2">
            <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2.5 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
                <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2.5 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Update Drawer - Sử dụng Portal */}
      <AnimatePresence>
        {selectedRepair && (
          <RepairUpdateDrawer 
            selectedRepair={selectedRepair}
            onClose={() => setSelectedRepair(null)}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            serialNumber={serialNumber}
            setSerialNumber={setSerialNumber}
            expertResponse={expertResponse}
            setExpertResponse={setExpertResponse}
            inventory={inventory}
            selectedParts={selectedParts}
            setSelectedParts={setSelectedParts}
            onUpdate={handleUpdate}
            shipperInfo={shipperInfo}
            handleCallShipper={handleCallShipper}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: PORTAL DRAWER ---
const RepairUpdateDrawer = ({ 
    selectedRepair, onClose, newStatus, setNewStatus, 
    serialNumber, setSerialNumber, expertResponse, setExpertResponse,
    inventory, selectedParts, setSelectedParts, onUpdate,
    shipperInfo, handleCallShipper
}) => {
    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex justify-end text-left">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[10000]">
            <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                 <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <Wrench size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Cập nhật tiến độ</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={12}/> Ticket: #{selectedRepair.ticketNumber}</p>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-800 active:scale-90">
                    <X size={24} />
                 </button>
            </div>
            
            <div className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Giai đoạn vận hành</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[
                         { value: 'Pending', label: 'Tiếp nhận' },
                         { value: 'Confirmed', label: 'Xác nhận' },
                         { value: 'Repairing', label: 'Đang sửa' },
                         { value: 'Testing', label: 'Kiểm tra' },
                         { value: 'Done', label: 'Hoàn thành' },
                         { value: 'Returned', label: 'Đã trả máy' }
                       ].map(step => (
                         <button 
                            key={step.value} 
                            onClick={() => setNewStatus(step.value)}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${newStatus === step.value ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                         >
                           {step.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Serial Number / IMEI</label>
                    <input 
                      type="text" 
                      value={serialNumber} 
                      onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                      placeholder="Nhập mã thiết bị..."
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-600 font-mono text-sm tracking-widest font-black uppercase"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between border-l-4 border-brand-600 pl-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Linh kiện thay thế</h4>
                        <div className="flex gap-2">
                            <select id="partSelect" className="px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-600 transition-all cursor-pointer">
                                <option value="">-- Chọn linh kiện --</option>
                                {inventory.map(part => (
                                    <option key={part._id} value={part._id} disabled={part.stock <= 0}>{part.name} - {part.price.toLocaleString()}đ</option>
                                ))}
                            </select>
                            <button 
                                onClick={() => {
                                    const select = document.getElementById('partSelect');
                                    const partId = select.value;
                                    if (!partId) return;
                                    const part = inventory.find(p => p._id === partId);
                                    const existing = selectedParts.find(p => p.part === partId);
                                    if (existing) {
                                        setSelectedParts(selectedParts.map(p => p.part === partId ? { ...p, quantity: p.quantity + 1 } : p));
                                    } else {
                                        setSelectedParts([...selectedParts, { part: partId, quantity: 1, name: part.name, price: part.price }]);
                                    }
                                }}
                                className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {selectedParts.map((sp, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-100 rounded-[24px] animate-in slide-in-from-left-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-brand-600 shadow-sm"><DeviceIcon size={14}/></div>
                                <div>
                                    <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight">{sp.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">SL: {sp.quantity} × {sp.price?.toLocaleString()}đ</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedParts(selectedParts.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 p-6 bg-slate-900 rounded-[32px] border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-white"><Shield size={80}/></div>
                    <div className="relative">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Chi phí dự kiến</p>
                        <p className="text-xl font-black text-brand-400 tabular-nums">
                           {selectedParts.reduce((a,c) => a + c.price * c.quantity, 0).toLocaleString()} <span className="text-[10px] ml-1">đ</span>
                        </p>
                    </div>
                    <div className="relative text-right">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Kỹ thuật viên</p>
                        <p className="text-xs font-black text-white uppercase tracking-tight">{selectedRepair.expert?.name || 'Chưa gán'}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                       <MessageSquare size={14} className="text-brand-600" /> Nội dung phản hồi khách hàng
                    </label>
                    <textarea 
                      placeholder="Gõ nội dung tư vấn..."
                      value={expertResponse}
                      onChange={(e) => setExpertResponse(e.target.value)}
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[32px] outline-none focus:border-brand-600 h-40 text-sm font-medium transition-all shadow-inner resize-none"
                    />
                 </div>

                 {newStatus === 'Done' && (
                   <div className="p-6 bg-blue-50 border-4 border-blue-100 rounded-[32px] space-y-5 animate-in zoom-in-95">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2"><Truck size={16} /> Điều phối vận chuyển</h4>
                         {shipperInfo ? (
                           <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-lg border border-blue-200">Đã điều phối</span>
                         ) : (
                           <button 
                             onClick={handleCallShipper}
                             className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                           >
                             Gọi Shipper ngay
                           </button>
                         )}
                      </div>
                      {shipperInfo && (
                        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-blue-100">
                           <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã vận đơn</p>
                             <p className="text-[11px] font-black text-blue-900">{shipperInfo.tracking_number}</p>
                           </div>
                           <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tài xế</p>
                             <p className="text-[11px] font-black text-blue-900">{shipperInfo.shipper_name}</p>
                           </div>
                        </div>
                      )}
                   </div>
                 )}
            </div>

            <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 z-20 flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm">Hủy bỏ</button>
              <button onClick={onUpdate} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Send size={18} /> Lưu & Gửi thông báo
              </button>
            </div>
          </motion.div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

export default RepairManagementPage;
