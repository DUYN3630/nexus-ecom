import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Edit3, X, History, MoreHorizontal, 
  Trash2, RefreshCw, Calendar, CheckCircle, 
  AlertCircle, Lock, CreditCard,  
  Clock, Save, ChevronRight, ChevronLeft, UserPlus
} from 'lucide-react';
import FilterableHeader from '../../components/admin/ui/FilterableHeader';
import orderApi from '../../api/orderApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

// --- HELPERS ---
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const OrderPage = () => {
  const user = useSelector(selectCurrentUser);
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); 

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [toasts, setToasts] = useState([]);

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

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderApi.getOrders();
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
      showToast("Không thể lấy dữ liệu đơn hàng!", "error");
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

  useEffect(() => {
    let result = orders.filter(o => {
      const isActuallyDeleted = o.isDeleted === true;
      if (filters.tab === 'trashed') { 
        if (!isActuallyDeleted) return false; 
      } else {
        if (isActuallyDeleted) return false;
      }
      
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

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = displayOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(displayOrders.length / ordersPerPage);

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
      showToast(`Đã chuyển ${selectedIds.length} đơn vào thùng rác`, "success");
      fetchOrders();
    } catch (err) { showToast("Lỗi xử lý hàng loạt", "error"); }
  };

  const handleSoftDelete = async (mongoId, orderId) => {
    try {
      await orderApi.softDeleteOrder(mongoId);
      showToast(`Đơn ${orderId} đã chuyển vào thùng rác`); 
      fetchOrders();
    } catch (err) { console.error(err); showToast("Lỗi khi xóa", "error"); }
  };

  const handleRestore = async (mongoId, orderId) => {
    try {
      await orderApi.restoreOrder(mongoId);
      showToast(`Đã khôi phục đơn ${orderId}`, "success"); 
      fetchOrders();
    } catch (err) { console.error(err); showToast("Lỗi khi khôi phục", "error"); }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.customerName || !newOrder.totalAmount) {
      showToast("Vui lòng điền đủ thông tin", "error");
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
      showToast("Đã tạo hồ sơ đơn hàng mới", "success");
      setNewOrder({ customerName: '', customerEmail: '', totalAmount: '', paymentMethod: 'Visa', deliveryStatus: 'New' });
    } catch (err) { showToast("Lỗi tạo đơn hàng", "error"); }
  };

  const handleUpdateOrder = async () => {
    try {
      const original = orders.find(o => o._id === editingOrder._id);
      let payload = { ...editingOrder };
      if (Number(payload.totalAmount) !== original.totalAmount) {
        payload.deliveryStatus = 'PendingApproval';
        payload.auditLogs = [...(payload.auditLogs || []), { action: 'Cập nhật giá', detail: `Thay đổi: ${original.totalAmount}đ -> ${payload.totalAmount}đ. Chuyển về Chờ duyệt.`, user: user?.name || 'Admin', time: new Date() }];
      }
      await orderApi.updateOrder(editingOrder._id, payload);
      setEditModalOpen(false); 
      fetchOrders(); 
      showToast("Đã cập nhật đơn hàng thành công", "success");
    } catch (err) { showToast("Lỗi cập nhật", "error"); }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      {/* Toast */}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
            {t.type === 'error' ? <AlertCircle size={18} className="text-rose-400"/> : <CheckCircle size={18} className="text-emerald-400"/>}
            <span className="text-xs font-bold uppercase tracking-wide">{t.msg}</span>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-sm text-slate-500 font-medium">
            Theo dõi và vận hành luồng đơn hàng chuyên nghiệp. Tổng số: <span className="text-brand-600 font-bold">{displayOrders.length}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm px-3 py-2 gap-2 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
            <input type="date" className="text-[11px] font-bold outline-none bg-transparent text-slate-600" onChange={e => setFilters({...filters, startDate: e.target.value})} />
            <span className="text-slate-300">-</span>
            <input type="date" className="text-[11px] font-bold outline-none bg-transparent text-slate-600" onChange={e => setFilters({...filters, endDate: e.target.value})} />
            <Calendar size={14} className="text-slate-400" />
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} /> Tạo đơn mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-8">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {['all', 'trashed'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setFilter('tab', tab)} 
                className={`pb-2 text-xs font-bold transition-all relative whitespace-nowrap uppercase tracking-widest ${
                  filters.tab === tab 
                  ? 'text-brand-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand-600' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'all' ? 'Tất cả đơn' : 'Thùng rác'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             {selectedIds.length > 0 && (
               <button 
                 onClick={handleBulkSoftDelete} 
                 className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[11px] font-bold hover:bg-rose-100 border border-rose-100 flex items-center gap-2 transition-all"
                >
                  <Trash2 size={14}/> Xóa {selectedIds.length} đơn
                </button>
              )}
             <div className="relative flex-1 min-w-[300px] group">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm bằng mã đơn hoặc tên khách..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-inner" 
                onChange={(e) => setFilters({...filters, search: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                  <input type="checkbox" className="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500" onChange={handleSelectAll} checked={selectedIds.length === currentOrders.length && currentOrders.length > 0} />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Đơn hàng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Sản phẩm</th>
                <FilterableHeader title="Trạng thái" icon={History} options={filterOptions.deliveryStatus} activeFilter={filters.deliveryStatus} setFilter={setFilter} filterKey="deliveryStatus" />
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Khách hàng</th>
                <FilterableHeader title="Thanh toán" icon={CreditCard} options={filterOptions.paymentStatus} activeFilter={filters.paymentStatus} setFilter={setFilter} filterKey="paymentStatus" />
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng tiền</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center">
                     <div className="flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang đồng bộ dữ liệu...</p>
                     </div>
                  </td>
                </tr>
              ) : currentOrders.length > 0 ? currentOrders.map(o => (
                <tr key={o._id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.includes(o._id) ? 'bg-brand-50/30' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500" checked={selectedIds.includes(o._id)} onChange={() => handleSelectOne(o._id)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-brand-600 text-sm tracking-tight">#{o.orderNumber}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Mã OMS</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800 font-bold text-sm truncate max-w-[150px]">{o.items?.[0]?.name || 'Hàng hóa'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{o.items?.length || 0} sản phẩm</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      o.deliveryStatus === 'Delivered' ? 'bg-slate-50 text-slate-600 border-slate-100' : 
                      o.deliveryStatus === 'Shipping' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      o.deliveryStatus === 'PendingApproval' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {o.deliveryStatus === 'Delivered' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                      {o.deliveryStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 font-bold text-[12px]">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center font-black text-brand-600 text-xs border border-brand-100 shadow-sm">
                        {o.customerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate max-w-[120px]">{o.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Khách hàng</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider ${o.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {o.isPaid ? <CheckCircle size={13}/> : <AlertCircle size={13}/>}
                      {o.isPaid ? 'Đã thanh toán' : 'Chờ xử lý'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900 text-sm">{o.totalAmount?.toLocaleString()}₫</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{o.paymentMethod || 'Banking'}</div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={(e) => toggleMenu(e, `row-${o._id}`)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all rounded-xl border border-transparent hover:border-brand-100">
                      <MoreHorizontal size={20} />
                    </button>
                    {activeMenu === `row-${o._id}` && (
                      <div className="absolute bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 right-6 mt-1 z-50 min-w-[200px] animate-in fade-in zoom-in-95 duration-200 text-left">
                        {!o.isDeleted ? (
                          <>
                            <button onClick={() => {setEditingOrder(o); setEditModalOpen(true)}} className="w-full text-left px-3 py-2.5 text-[11px] font-bold hover:bg-slate-50 rounded-xl flex items-center gap-3 text-slate-700 transition-colors">
                              <Edit3 size={14} className="text-brand-500"/> Chi tiết đơn hàng
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button onClick={() => handleSoftDelete(o._id, o.orderNumber)} className="w-full text-left px-3 py-2.5 text-[11px] font-bold hover:bg-rose-50 rounded-xl flex items-center gap-3 text-rose-500 transition-colors">
                              <Trash2 size={14}/> Chuyển vào thùng rác
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleRestore(o._id, o.orderNumber)} className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-3 transition-colors">
                            <RefreshCw size={14}/> Khôi phục hồ sơ
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center text-slate-400 font-medium">
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination UI */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
              Trang {currentPage} / {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i+1}
                    onClick={() => setCurrentPage(i+1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      currentPage === i+1 
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {i+1}
                  </button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              </div>

              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <OrderCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        newOrder={newOrder} 
        setNewOrder={setNewOrder} 
        onCreate={handleCreateOrder} 
      />
      <OrderEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        editingOrder={editingOrder} 
        setEditingOrder={setEditingOrder} 
        onUpdate={handleUpdateOrder} 
      />
    </div>
  );
};

// --- SUB-COMPONENTS: MODALS ---
const OrderCreateModal = ({ isOpen, onClose, newOrder, setNewOrder, onCreate }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative h-full w-full sm:w-[500px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Khởi tạo Đơn hàng</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
              <UserPlus size={14}/> Quy trình khởi tạo thủ công
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X size={20} /></button>
        </div>
        
        <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Thông tin khách hàng</label>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Họ tên khách hàng..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm" 
                  value={newOrder.customerName} 
                  onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} 
                />
                <input 
                  type="email" 
                  placeholder="Địa chỉ Email..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm" 
                  value={newOrder.customerEmail} 
                  onChange={e => setNewOrder({...newOrder, customerEmail: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Thanh toán & Trạng thái</label>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer" 
                  value={newOrder.paymentMethod} 
                  onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value})}
                >
                  <option value="Visa">Visa Card</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="COD">Tiền mặt (COD)</option>
                </select>
                <div className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-black text-emerald-600 flex items-center justify-center gap-2 uppercase">
                  <CheckCircle size={14}/> Sẵn sàng (New)
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6 bg-brand-600 rounded-2xl shadow-xl shadow-brand-200">
              <label className="text-[11px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14}/> Tổng tiền quyết toán
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="0" 
                  className="w-full pl-0 pr-12 py-2 bg-transparent border-b-2 border-white/20 text-3xl font-black text-white placeholder:text-white/30 focus:border-white outline-none transition-all" 
                  value={newOrder.totalAmount} 
                  onChange={e => setNewOrder({...newOrder, totalAmount: e.target.value})} 
                />
                <span className="absolute right-0 bottom-2 font-black text-white/50 text-xl uppercase tracking-tighter">₫</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
            Hủy bỏ
          </button>
          <button onClick={onCreate} className="flex-[2] py-3 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 active:scale-95">
            Xác nhận tạo đơn
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderEditModal = ({ isOpen, onClose, editingOrder, setEditingOrder, onUpdate }) => {
  if (!isOpen || !editingOrder) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Chi tiết & Phê duyệt</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
              <Lock size={14}/> Vận hành & Bảo mật tài chính
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X size={20} /></button>
        </div>
        
        <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar text-left">
          {(editingOrder.deliveryStatus === 'Shipping' || editingOrder.deliveryStatus === 'Delivered') && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-[11px] font-bold flex items-start gap-3 shadow-sm animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-amber-500" />
              <span>Hồ sơ đã ở trạng thái {editingOrder.deliveryStatus}. Các thay đổi tài chính quan trọng sẽ bị hạn chế.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã định danh</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-500 shadow-inner">
                #{editingOrder.orderNumber}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái vận hành</label>
              <select 
                value={editingOrder.deliveryStatus} 
                onChange={e => setEditingOrder({...editingOrder, deliveryStatus: e.target.value})} 
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-brand-500 outline-none shadow-sm cursor-pointer transition-all"
              >
                {['New', 'PendingApproval', 'Processing', 'Shipping', 'Delivered', 'Canceled'].map(s => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={16} className="text-brand-600"/> Tổng tiền quyết toán
            </label>
            <div className="relative group">
              <input 
                type="number" 
                value={editingOrder.totalAmount} 
                onChange={e => setEditingOrder({...editingOrder, totalAmount: e.target.value})} 
                className="w-full pl-4 pr-16 py-4 border-2 border-slate-200 rounded-2xl text-2xl font-black text-brand-600 focus:border-brand-600 focus:ring-4 focus:ring-brand-50 outline-none transition-all shadow-sm" 
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400 group-focus-within:text-brand-600 text-xl">₫</span>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={18} className="text-brand-600"/> Lịch sử thay đổi (Audit Logs)
            </h3>
            <div className="space-y-6 relative ml-3">
              {editingOrder.auditLogs?.slice().reverse().map((log, i) => (
                <div key={i} className="relative pl-8 before:content-[''] before:absolute before:left-[-1px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                  <div className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-brand-600 z-10"></div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-brand-600 text-[10px] uppercase tracking-wider">{log.action}</span>
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10}/> {new Date(log.time).toLocaleString('vi-VN')}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed font-bold italic">&quot;{log.detail}&quot;</p>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-brand-50 flex items-center justify-center text-[9px] font-black text-brand-600 border border-brand-100 shadow-sm">
                        {log.user?.charAt(0) || 'A'}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Thực hiện: {log.user}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!editingOrder.auditLogs || editingOrder.auditLogs.length === 0) && (
                <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase italic">Chưa có lịch sử thay đổi</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            Đóng
          </button>
          <button 
            onClick={onUpdate}
            className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Save size={18} /> Lưu & Phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
};
