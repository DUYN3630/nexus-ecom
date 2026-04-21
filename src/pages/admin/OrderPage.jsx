import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Edit3, X, History, MoreHorizontal, 
  Trash2, RefreshCw, Calendar, CheckCircle, 
  AlertCircle, Lock, CreditCard,  
  Clock, Save, ChevronRight, ChevronLeft, UserPlus
} from 'lucide-react';
import FilterableHeader from '../../components/admin/ui/FilterableHeader';
import orderApi from '../../api/orderApi'; // Đã di chuyển lên đầu

import { useAuth } from '../../hooks/useAuth';

export const OrderPage = () => {
  const { user } = useAuth();
  // --- 1. STATE DỮ LIỆU ---
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // --- 2. STATE PHÂN TRANG (PAGINATION) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); 

  // --- 3. STATE BỘ LỌC NÂNG CAO ---
  const [filters, setFilters] = useState({ 
    tab: 'all', 
    search: '', 
    startDate: '', 
    endDate: '',
    deliveryStatus: 'all', 
    paymentStatus: 'all'
  });
  
  const [activeMenu, setActiveMenu] = useState(null); 
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Cố định state mở modal tạo
  const [editingOrder, setEditingOrder] = useState(null);
  const [toasts, setToasts] = useState([]);

  // State dành cho trình tạo đơn mới (Nghiệp vụ 5)
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    totalAmount: '',
    paymentMethod: 'Visa',
    deliveryStatus: 'New'
  });

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // --- 6. CÁC HÀM XỬ LÝ NGHIỆP VỤ ---
  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

// ... (existing code)

  // --- 4. FETCH DỮ LIỆU TỪ MONGODB (ĐÃ REFACTOR) ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderApi.getOrders();
      // FIX: API trả về { data: orders, pagination: ... }
      const data = response.data || [];
      const mappedData = (data || []).map(o => ({
        ...o,
        customerName: o.customer?.name || 'Khách ẩn danh',
        itemsCount: o.items?.length || 0,
        paymentDetails: o.paymentDetails || { provider: 'Mastercard', last4: '1898' }
      }));
      setOrders(mappedData);
      setSelectedIds([]);
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
      showToast("Không thể lấy dữ liệu đơn hàng! Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders(); 
    const handleCloseMenus = () => setActiveMenu(null);
    window.addEventListener('click', handleCloseMenus);
    return () => window.removeEventListener('click', handleCloseMenus);
  }, [fetchOrders]);

  // --- 5. LOGIC LỌC TỔNG HỢP ---
  useEffect(() => {
    let result = orders.filter(o => {
      const isActuallyDeleted = o.isDeleted === true;
      if (filters.tab === 'trashed') { 
        if (!isActuallyDeleted) return false; 
      } else {
        if (isActuallyDeleted) return false;
      }
      
      // FilterableHeader logic
      if (filters.deliveryStatus !== 'all' && o.deliveryStatus !== filters.deliveryStatus) return false;
      
      const paymentStatus = o.isPaid ? 'Paid' : 'Pending';
      if (filters.paymentStatus !== 'all' && paymentStatus !== filters.paymentStatus) return false;

      const query = filters.search.toLowerCase();
      if (query && !o.orderNumber.toLowerCase().includes(query) && !o.customerName.toLowerCase().includes(query)) return false;
      
      const orderTime = new Date(o.createdAt).getTime();
      if (filters.startDate && orderTime < new Date(filters.startDate).getTime()) return false;
      if (filters.endDate) {
        const end = new Date(filters.endDate); end.setHours(23, 59, 59);
        if (orderTime > end.getTime()) return false;
      }
      return true;
    });
    setDisplayOrders(result);
    setCurrentPage(1); 
  }, [orders, filters]);

  // Logic phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = displayOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(displayOrders.length / ordersPerPage);

  // Filter options
  const filterOptions = {
    deliveryStatus: [
        { value: 'all', label: 'Tất cả'},
        { value: 'New', label: 'Mới'},
        { value: 'Processing', label: 'Đang xử lý'},
        { value: 'Shipping', label: 'Đang giao'},
        { value: 'Delivered', label: 'Hoàn tất'},
        { value: 'Canceled', label: 'Đã hủy'},
        { value: 'PendingApproval', label: 'Chờ duyệt'},
    ],
    paymentStatus: [
        { value: 'all', label: 'Tất cả'},
        { value: 'Paid', label: 'Đã thanh toán'},
        { value: 'Pending', label: 'Chưa thanh toán'},
    ]
  };

  const toggleMenu = (e, menuId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleSelectAll = (e) => setSelectedIds(e.target.checked ? currentOrders.map(o => o._id) : []);
  const handleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleBulkSoftDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Chuyển ${selectedIds.length} đơn vào thùng rác?`)) return;
    try {
      await Promise.all(selectedIds.map(id => orderApi.softDeleteOrder(id)));
      showToast(`Đã dọn dẹp ${selectedIds.length} hồ sơ`, "success");
      fetchOrders();
    } catch (err) { showToast("Lỗi xử lý hàng loạt", "error"); }
  };

  const handleSoftDelete = async (mongoId, orderId) => {
    try {
      await orderApi.softDeleteOrder(mongoId);
      showToast(`Đơn ${orderId} đã vào thùng rác`); 
      fetchOrders();
    } catch (err) { console.error(err); showToast("Lỗi khi xóa", "error"); }
  };

  const handleRestore = async (mongoId, orderId) => {
    try {
      await orderApi.restoreOrder(mongoId);
      showToast(`Đã khôi phục đơn ${orderId}`); 
      fetchOrders();
    } catch (err) { console.error(err); showToast("Lỗi khi khôi phục", "error"); }
  };

  // QUY TẮC 5: TẠO ĐƠN HÀNG MỚI (Manual Creation)
  const handleCreateOrder = async () => {
    if (!newOrder.customerName || !newOrder.totalAmount) {
      showToast("Vui lòng điền đủ thông tin bắt buộc", "error");
      return;
    }
    const todayStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${todayStr}-${randomSuffix}`;

    const payload = {
      orderNumber,
      customer: { name: newOrder.customerName, email: newOrder.customerEmail, avatar: "https://i.pravatar.cc/150" },
      totalAmount: Number(newOrder.totalAmount),
      deliveryStatus: 'New',
      isPaid: false,
      paymentMethod: newOrder.paymentMethod,
      paymentDetails: { provider: newOrder.paymentMethod, last4: "0000" },
      items: [{ name: "Khởi tạo thủ công", quantity: 1, price: Number(newOrder.totalAmount) }],
    };

    try {
      await orderApi.createOrder(payload);
      setIsCreateModalOpen(false);
      fetchOrders();
      showToast("Hồ sơ đơn hàng đã được tạo", "success");
      setNewOrder({ customerName: '', customerEmail: '', totalAmount: '', paymentMethod: 'Visa', deliveryStatus: 'New' });
    } catch (err) { showToast("Lỗi kết nối máy chủ", "error"); }
  };

  const handleUpdateOrder = async () => {
    try {
      const original = orders.find(o => o._id === editingOrder._id);
      let payload = { ...editingOrder };
      if (Number(payload.totalAmount) !== original.totalAmount) {
        payload.deliveryStatus = 'PendingApproval';
        payload.auditLogs = [...(payload.auditLogs || []), { action: 'Cập nhật giá', detail: `Thay đổi: ${original.totalAmount}đ -> ${payload.totalAmount}đ. Chuyển về Chờ duyệt.`, user: 'Hệ thống', time: new Date() }];
      }
      await orderApi.updateOrder(editingOrder._id, payload);
      setEditModalOpen(false); 
      fetchOrders(); 
      showToast("Đã duyệt hồ sơ đơn hàng");
    } catch (err) { showToast("Lỗi cập nhật", "error"); }
  };

  // --- 7. RENDER GIAO DIỆN ---
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-left bg-[#f8fafc]">
      {/* Toast */}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
            {t.type === 'error' ? <AlertCircle size={18} className="text-red-400"/> : <CheckCircle size={18} className="text-emerald-400"/>}
            <span className="text-xs font-bold">{t.msg}</span>
          </div>
        ))}
      </div>

      <div className="p-4 lg:p-8 overflow-y-auto">
        {/* HEADER & DATE RANGE PICKER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ Đơn hàng ({displayOrders.length})</h1>
            <p className="text-sm text-slate-500 mt-1">Vận hành luồng trạng thái và quản lý tài chính chuẩn OMS.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm px-3 py-2 gap-2">
              <input type="date" className="text-[11px] font-bold outline-none bg-transparent" onChange={e => setFilters({...filters, startDate: e.target.value})} />
              <span className="text-slate-300">-</span>
              <input type="date" className="text-[11px] font-bold outline-none bg-transparent" onChange={e => setFilters({...filters, endDate: e.target.value})} />
              <Calendar size={14} className="text-slate-400" />
            </div>

            {/* NÚT TẠO ĐƠN MỚI ĐÃ KÍCH HOẠT */}
            <button onClick={() => setIsCreateModalOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
              <Plus size={16} /> Tạo đơn mới
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex gap-8 overflow-x-auto">
              {['all', 'trashed'].map(tab => (
                <button key={tab} onClick={() => setFilter('tab', tab)} className={`pb-2 text-xs font-bold transition-all relative whitespace-nowrap ${filters.tab === tab ? 'text-slate-900 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'all' ? 'Tất cả đơn' : 'Thùng rác'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
               {selectedIds.length > 0 && <button onClick={handleBulkSoftDelete} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-100 border border-red-100 flex items-center gap-2 transition-all"><Trash2 size={14}/> Thùng rác ({selectedIds.length} đơn)</button>}
               <div className="relative min-w-[300px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm hồ sơ bằng mã hoặc tên khách..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 bg-white shadow-inner" onChange={(e) => setFilters({...filters, search: e.target.value})} />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100 tracking-widest font-black">
                <tr>
                  <th className="px-6 py-5 w-10 text-center"><input type="checkbox" className="rounded" onChange={handleSelectAll} checked={selectedIds.length === currentOrders.length && currentOrders.length > 0} /></th>
                  <th className="px-6 py-5">Đơn hàng</th>
                  <th className="px-6 py-5">Vật phẩm</th>
                  <FilterableHeader title="Trạng thái" icon={History} options={filterOptions.deliveryStatus} activeFilter={filters.deliveryStatus} setFilter={setFilter} filterKey="deliveryStatus" />
                  <th className="px-6 py-5">Thời gian tạo</th>
                  <th className="px-6 py-5">Chủ đơn</th>
                  <FilterableHeader title="Thanh toán" icon={CreditCard} options={filterOptions.paymentStatus} activeFilter={filters.paymentStatus} setFilter={setFilter} filterKey="paymentStatus" />
                  <th className="px-6 py-5">Tổng tiền</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan="9" className="px-6 py-20 text-center text-slate-400 font-bold animate-pulse">Đang đồng bộ dữ liệu Atlas...</td></tr> : currentOrders.map(o => (
                  <tr key={o._id} className={`hover:bg-slate-50/80 transition-all ${selectedIds.includes(o._id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-slate-300" checked={selectedIds.includes(o._id)} onChange={() => handleSelectOne(o._id)} /></td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-xs">#{o.orderNumber}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs truncate max-w-[120px]">{o.items?.[0]?.name || 'Hàng hóa'}</td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${o.deliveryStatus === 'Delivered' ? 'bg-slate-100 text-slate-700' : o.deliveryStatus === 'Shipping' ? 'bg-blue-100 text-blue-700' : o.deliveryStatus === 'PendingApproval' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{o.deliveryStatus === 'Delivered' ? <CheckCircle size={12}/> : <Clock size={12}/>}{o.deliveryStatus}</span></td>
                    <td className="px-6 py-4 text-slate-500 font-bold text-[11px]">{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px] border border-slate-200">{o.customerName.charAt(0)}</div><span className="font-bold text-slate-700 text-xs">{o.customerName}</span></div></td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 font-bold text-[11px] uppercase ${o.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {o.isPaid ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                        {o.isPaid ? 'Đã trả' : 'Chưa trả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 text-xs">{o.totalAmount?.toLocaleString()}đ</td>
                    <td className="px-6 py-4 text-right relative">
                      <button onClick={(e) => toggleMenu(e, `row-${o._id}`)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-all rounded-lg hover:bg-slate-100"><MoreHorizontal size={18} /></button>
                      {activeMenu === `row-${o._id}` && (
                        <div className="absolute bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 right-6 mt-1 z-50 min-w-[220px] animate-in fade-in zoom-in-95 text-left">
                          {!o.isDeleted ? (<><button onClick={() => {setEditingOrder(o); setEditModalOpen(true)}} className="w-full text-left px-3 py-2.5 text-[11px] font-bold hover:bg-slate-50 rounded-xl flex items-center gap-3 text-slate-700 transition-colors"><Edit3 size={14} className="text-blue-500"/> Phê duyệt đơn</button><button onClick={() => handleSoftDelete(o._id, o.orderNumber)} className="w-full text-left px-3 py-2.5 text-[11px] font-bold hover:bg-red-50 rounded-xl flex items-center gap-3 text-red-500 transition-colors"><Trash2 size={14}/> Thùng rác</button></>) : (<button onClick={() => handleRestore(o._id, o.orderNumber)} className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-3 transition-colors"><RefreshCw size={14}/> Khôi phục</button>)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-left">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Hiển thị {currentOrders.length} hồ sơ • Trang {currentPage} / {totalPages || 1}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-all disabled:opacity-30 shadow-sm"><ChevronLeft size={16}/></button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white border border-transparent hover:border-slate-200 text-slate-500'}`}>{i + 1}</button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              </div>

              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-all disabled:opacity-30 shadow-sm"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: TRÌNH TẠO ĐƠN MỚI (SLIDE OVER - QUY TẮC 5) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Khởi tạo hồ sơ đơn mới</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><UserPlus size={12}/> Quy trình OMS Manual Order</p></div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 p-8 space-y-10 overflow-y-auto text-left">
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Mã định danh OMS</label><input type="text" value="Cấp tự động sau khi xác nhận" readOnly className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 outline-none italic shadow-inner" /></div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Họ tên khách hàng</label><input type="text" placeholder="Nhập tên khách..." className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm" value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Địa chỉ Email</label><input type="email" placeholder="customer@email.com" className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm" value={newOrder.customerEmail} onChange={e => setNewOrder({...newOrder, customerEmail: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Phương thức thanh toán</label><select className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-blue-500" value={newOrder.paymentMethod} onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value})}><option value="Visa">Visa Card</option><option value="Mastercard">Mastercard</option><option value="COD">Tiền mặt (COD)</option></select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Trạng thái ban đầu</label><div className="w-full px-4 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-black text-emerald-600 flex items-center gap-2"><CheckCircle size={14}/> Sẵn sàng nhận (New)</div></div>
                </div>
                <div className="space-y-3 p-8 bg-blue-600 rounded-[32px] shadow-xl shadow-blue-200">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 opacity-80"><CreditCard size={14}/> Tổng tiền quyết toán</label>
                  <div className="relative"><input type="number" placeholder="0" className="w-full pl-6 pr-16 py-5 bg-white/10 border-2 border-white/20 rounded-2xl text-2xl font-black text-white placeholder:text-white/30 focus:bg-white focus:text-blue-600 outline-none transition-all" value={newOrder.totalAmount} onChange={e => setNewOrder({...newOrder, totalAmount: e.target.value})} /><span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-white/50 uppercase">VNĐ</span></div>
                </div>
              </div>
            </div>
            {/* NÚT BẤM CÂN ĐỐI ( py-4 giúp nút to rõ hơn) */}
            <div className="p-6 border-t bg-white flex gap-4 sticky bottom-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-sm">
                Hủy bỏ
              </button>
              <button onClick={handleCreateOrder} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                Xác nhận khởi tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHI TIẾT & PHÊ DUYỆT ( Slide Over ) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setEditModalOpen(false)}></div>
          <div className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Bảng phê duyệt hồ sơ đơn</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><Lock size={12}/> Vận hành & Bảo mật tài chính OMS</p></div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 p-8 space-y-10 overflow-y-auto text-left">
              {(editingOrder.deliveryStatus === 'Shipping' || editingOrder.deliveryStatus === 'Delivered') && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-[11px] font-bold flex items-start gap-4 shadow-sm animate-pulse text-left"><AlertCircle size={20} className="shrink-0 text-amber-500" /><span>QUY TẮC: Hồ sơ đơn ở trạng thái {editingOrder.deliveryStatus} đã khóa chỉnh sửa các trường tài chính.</span></div>
              )}
              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Mã định danh OMS</label><input type="text" value={editingOrder.orderNumber} readOnly className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-500 outline-none shadow-inner" /></div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <History size={12}/> Luồng trạng thái
                  </label>
                  <select 
                    value={editingOrder.deliveryStatus} 
                    onChange={e => setEditingOrder({...editingOrder, deliveryStatus: e.target.value})} 
                    className="w-full px-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black focus:border-blue-500 outline-none shadow-sm cursor-pointer"
                  >
                    {['New', 'PendingApproval', 'Processing', 'Shipping', 'Delivered', 'Canceled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} className="text-blue-600"/> Tổng tiền quyết toán ( Sensitive )</label>
                <div className="relative group"><input type="number" value={editingOrder.totalAmount} onChange={e => setEditingOrder({...editingOrder, totalAmount: e.target.value})} className="w-full pl-6 pr-16 py-5 border-2 border-slate-200 rounded-2xl text-2xl font-black text-blue-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" /><span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400 group-focus-within:text-blue-600">VNĐ</span></div>
              </div>
              <div className="pt-10 border-t border-slate-100 text-left">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-2"><History size={20} className="text-blue-600"/> Audit Logs</h3>
                <div className="space-y-10 relative ml-4">
                  {editingOrder.auditLogs?.slice().reverse().map((log, i) => (
                    <div key={i} className="relative pl-10 before:content-[''] before:absolute before:left-[-1px] before:top-2 before:bottom-[-40px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                      <div className="absolute left-[-7px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-4 border-blue-600 z-10 shadow-[0_0_0_6px_rgba(37,99,235,0.05)]"></div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-black text-blue-600 text-[10px] uppercase tracking-wider">{log.action}</span>
                          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10}/> {new Date(log.time).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed font-semibold italic">&quot;{log.detail}&quot;</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 border border-blue-200">A</div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Vận hành bởi: {log.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NÚT BẤM CÂN ĐỐI ( py-4 giúp nút to rõ dễ thao tác ) */}
            <div className="p-6 border-t bg-slate-50/80 backdrop-blur-xl sticky bottom-0 flex gap-4 z-10 shadow-2xl">
              <button onClick={() => setEditModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                Hủy bỏ
              </button>
              <button 
                onClick={handleUpdateOrder}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Save size={18} /> Lưu hồ sơ & Phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};