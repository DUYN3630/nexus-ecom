import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Edit3, X, History, MoreHorizontal, 
  Trash2, RefreshCw, Calendar, CheckCircle, 
  AlertCircle, Lock, CreditCard, ShoppingBag, 
  Clock, Save, ChevronRight, ChevronLeft, UserPlus, ShieldCheck,
  Filter, Calendar as CalendarIcon, ArrowRight, Minus, Package, Info
} from 'lucide-react';
import FilterableHeader from '../../components/admin/ui/FilterableHeader';
import orderApi from '../../api/orderApi';
import productApi from '../../api/productApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

// --- HELPERS ---
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export const OrderPage = () => {
  const user = useSelector(selectCurrentUser);
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); 

  const [filters, setFilters] = useState({ 
    tab: 'active', // 'active' or 'trashed'
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
    customer: {
        name: '',
        email: '',
        phone: '',
        address: ''
    },
    items: [],
    totalAmount: 0,
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
      const data = response.data || []; // data ở đây là mảng trả về từ success:true, data:[]
      const mappedData = (data || []).map(o => ({
        ...o,
        customerName: o.customer?.name || 'Khách ẩn danh',
        itemsCount: o.items?.length || 0,
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
      // Lọc theo Tab (Active hoặc Trash)
      const isActuallyDeleted = o.isDeleted === true;
      if (filters.tab === 'trashed') { 
        if (!isActuallyDeleted) return false; 
      } else {
        if (isActuallyDeleted) return false;
      }
      
      // Lọc theo Status
      if (filters.deliveryStatus !== 'all' && o.deliveryStatus !== filters.deliveryStatus) return false;
      const paymentStatus = o.isPaid ? 'Paid' : 'Pending';
      if (filters.paymentStatus !== 'all' && paymentStatus !== filters.paymentStatus) return false;

      // Lọc theo Ngày (StartDate - EndDate)
      if (filters.startDate) {
          const orderDate = new Date(o.createdAt);
          const start = new Date(filters.startDate);
          start.setHours(0,0,0,0);
          if (orderDate < start) return false;
      }
      if (filters.endDate) {
          const orderDate = new Date(o.createdAt);
          const end = new Date(filters.endDate);
          end.setHours(23,59,59,999);
          if (orderDate > end) return false;
      }

      // Tìm kiếm
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          o._id.toLowerCase().includes(searchLower) ||
          (o.orderNumber && o.orderNumber.toLowerCase().includes(searchLower)) ||
          (o.customer?.name && o.customer.name.toLowerCase().includes(searchLower)) ||
          (o.customer?.email && o.customer.email.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
    setDisplayOrders(result);
    setCurrentPage(1);
  }, [orders, filters]);

  const handleUpdateOrder = async () => {
    try {
      const response = await orderApi.updateOrder(editingOrder._id, editingOrder);
      if (response.success) {
        const updatedData = response.data;
        setOrders(prev => prev.map(o => o._id === updatedData._id ? { 
            ...o, 
            ...updatedData, 
            customerName: updatedData.customer?.name || o.customerName 
        } : o));
        setEditModalOpen(false);
        showToast("Cập nhật đơn hàng thành công!", "success");
      }
    } catch (err) {
        showToast(err.response?.data?.message || "Cập nhật thất bại!", "error");
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.customer.name || newOrder.items.length === 0) {
        showToast("Vui lòng điền đủ thông tin và chọn sản phẩm!", "error");
        return;
    }
    try {
        const response = await orderApi.createOrder(newOrder);
        if (response.success) {
            await fetchOrders();
            setIsCreateModalOpen(false);
            setNewOrder({
                customer: { name: '', email: '', phone: '', address: '' },
                items: [],
                totalAmount: 0,
                paymentMethod: 'Visa',
                deliveryStatus: 'New'
            });
            showToast("Đã khởi tạo đơn hàng mới!", "success");
        }
    } catch (err) {
        showToast(err.response?.data?.message || "Khởi tạo thất bại!", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn đưa đơn hàng này vào thùng rác?")) {
      try {
        const response = await orderApi.softDeleteOrder(id);
        if (response.success) {
            setOrders(prev => prev.map(o => o._id === id ? { ...o, isDeleted: true } : o));
            showToast("Đã đưa vào thùng rác!", "success");
        }
      } catch (err) {
        showToast("Xóa thất bại!", "error");
      }
    }
  };

  const handleRestore = async (id) => {
      try {
          const response = await orderApi.restoreOrder(id);
          if (response.success) {
              setOrders(prev => prev.map(o => o._id === id ? { ...o, isDeleted: false } : o));
              showToast("Đã khôi phục đơn hàng!", "success");
          }
      } catch (err) {
          showToast("Khôi phục thất bại!", "error");
      }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = displayOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(displayOrders.length / ordersPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Canceled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'PendingApproval': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-left">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase tracking-tighter">
            Quản lý Đơn hàng
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <button 
                onClick={() => setFilter('tab', 'active')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filters.tab === 'active' ? 'bg-brand-50 text-brand-600 border-brand-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
            >
                <History size={12}/> Giao dịch hiện hành
            </button>
            <button 
                onClick={() => setFilter('tab', 'trashed')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filters.tab === 'trashed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
            >
                <Trash2 size={12}/> Thùng rác ({orders.filter(o => o.isDeleted).length})
            </button>
          </div>
        </div>

        <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-200 transition-all active:scale-95"
        >
          <Plus size={18} /> Tạo đơn mới
        </button>
      </div>

      {/* FILTERS & DATE RANGE */}
      <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm mb-8 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm theo mã đơn, khách hàng..." 
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-600 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-tight outline-none transition-all shadow-inner"
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                />
            </div>
            
            {/* Date Filter */}
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-transparent focus-within:border-brand-100 focus-within:bg-white transition-all">
                <div className="flex items-center gap-3 pl-3 text-slate-400">
                    <CalendarIcon size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Thời gian:</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <input 
                        type="date" 
                        className="bg-transparent border-none p-2 text-[10px] font-black uppercase outline-none focus:text-brand-600 transition-colors cursor-pointer"
                        value={filters.startDate}
                        onChange={(e) => setFilter('startDate', e.target.value)}
                    />
                    <ArrowRight size={14} className="text-slate-300" />
                    <input 
                        type="date" 
                        className="bg-transparent border-none p-2 text-[10px] font-black uppercase outline-none focus:text-brand-600 transition-colors cursor-pointer"
                        value={filters.endDate}
                        onChange={(e) => setFilter('endDate', e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => { setFilter('startDate', ''); setFilter('endDate', ''); }}
                    className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                    title="Xóa lọc ngày"
                >
                    <RefreshCw size={14} />
                </button>
            </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-50 pt-6">
            <div className="flex flex-wrap gap-2">
                {['all', 'New', 'Processing', 'Shipped', 'Delivered', 'Canceled', 'PendingApproval'].map((status) => (
                    <button 
                        key={status}
                        onClick={() => setFilter('deliveryStatus', status)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                            filters.deliveryStatus === status
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                        }`}
                    >
                        {status === 'all' ? 'Tất cả trạng thái' : status}
                    </button>
                ))}
            </div>
            <button onClick={fetchOrders} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-white border-2 border-transparent hover:border-slate-200 transition-all shadow-sm"><RefreshCw size={18} /></button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border-2 border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng / Khách hàng</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thời gian</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Giao nhận</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thanh toán</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng giá trị</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[120px]">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {currentOrders.length > 0 ? currentOrders.map((order) => (
                <tr key={order._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center text-brand-600 shadow-sm group-hover:scale-110 transition-transform">
                        <ShoppingBag size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-xs truncate max-w-[200px] uppercase tracking-tight">#{order.orderNumber || order._id.slice(-8)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{order.customerName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                      <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-800 tabular-nums">{formatDate(order.createdAt)}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{formatTime(order.createdAt)}</span>
                      </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border-2 uppercase tracking-widest ${getStatusColor(order.deliveryStatus)}`}>
                      {order.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {order.isPaid ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase border border-emerald-100">
                            <CheckCircle size={10} /> Đã trả
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase border border-rose-100">
                            <Clock size={10} /> Chờ thu
                        </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 text-sm tracking-widest tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {filters.tab === 'trashed' ? (
                            <button 
                                onClick={() => handleRestore(order._id)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border-2 border-transparent"
                                title="Khôi phục đơn hàng"
                            >
                                <RefreshCw size={18} />
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => { setEditingOrder(order); setEditModalOpen(true); }}
                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border-2 border-transparent hover:border-brand-100"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(order._id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-2 border-transparent hover:border-rose-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center space-y-3 opacity-20">
                            <AlertCircle size={48} />
                            <p className="text-[11px] font-black uppercase tracking-widest">Không có dữ liệu đơn hàng phù hợp</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-8 py-6 bg-slate-50/50 border-t-2 border-slate-100 flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                Trang {currentPage} / {totalPages || 1}
            </p>
            <div className="flex gap-2">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2.5 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                >
                    <ChevronLeft size={16} />
                </button>
                <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2.5 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="fixed bottom-8 right-8 z-[2000] space-y-3">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-4 rounded-2xl shadow-2xl border-2 animate-in slide-in-from-right duration-300 flex items-center gap-3 ${
            t.type === 'success' ? 'bg-emerald-900 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            {t.type === 'success' ? <CheckCircle size={18}/> : <Info size={18}/>}
            <span className="text-[10px] font-black uppercase tracking-widest">{t.msg}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <OrderCreateModal
            onClose={() => setIsCreateModalOpen(false)}
            newOrder={newOrder}
            setNewOrder={setNewOrder}
            onCreate={handleCreateOrder}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && editingOrder && (
          <OrderEditModal
            onClose={() => setEditModalOpen(false)}
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
            onUpdate={handleUpdateOrder}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENTS: MODALS ---
const OrderCreateModal = ({ onClose, newOrder, setNewOrder, onCreate }) => {
  const [searchProduct, setSearchProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchProducts = async (q) => {
    if (!q) return;
    setLoadingProducts(true);
    try {
        const res = await productApi.getAll({ search: q, limit: 5 });
        setProducts(res.data || []);
    } catch (err) {
        console.error(err);
    } finally {
        setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if (searchProduct) fetchProducts(searchProduct);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchProduct]);

  const addItem = (product) => {
    const existing = newOrder.items.find(item => item.productId === product._id);
    let newItems;
    if (existing) {
        newItems = newOrder.items.map(item => 
            item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
    } else {
        newItems = [...newOrder.items, {
            productId: product._id,
            name: product.name,
            quantity: 1,
            price: product.discountPrice || product.price,
            image: product.mainImage || (product.images && product.images[0])
        }];
    }
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setNewOrder({ ...newOrder, items: newItems, totalAmount: total });
    setSearchProduct('');
    setProducts([]);
  };

  const removeItem = (productId) => {
    const newItems = newOrder.items.filter(item => item.productId !== productId);
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setNewOrder({ ...newOrder, items: newItems, totalAmount: total });
  };

  const updateQuantity = (productId, delta) => {
    const newItems = newOrder.items.map(item => {
        if (item.productId === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
    });
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setNewOrder({ ...newOrder, items: newItems, totalAmount: total });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end text-left">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      ></motion.div>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative h-full w-full sm:w-[700px] bg-white shadow-2xl flex flex-col z-[10000]"
      >
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Phát hành Đơn hàng</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><Clock size={12}/> Vận hành hệ thống Nexus</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
        </div>

        <div className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-slate-100 shadow-inner space-y-4">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><UserPlus size={16}/></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Thông tin đối tác</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Tên khách hàng *</label>
                  <input type="text" placeholder="Họ và tên..." className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-brand-500 transition-all outline-none" value={newOrder.customer.name} onChange={e => setNewOrder({...newOrder, customer: {...newOrder.customer, name: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Số điện thoại</label>
                  <input type="text" placeholder="0xxx..." className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-brand-500 transition-all outline-none" value={newOrder.customer.phone} onChange={e => setNewOrder({...newOrder, customer: {...newOrder.customer, phone: e.target.value}})} />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Email liên hệ</label>
                  <input type="email" placeholder="example@nexus.com" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-brand-500 transition-all outline-none" value={newOrder.customer.email} onChange={e => setNewOrder({...newOrder, customer: {...newOrder.customer, email: e.target.value}})} />
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shadow-sm border border-slate-100"><Package size={16}/></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Sản phẩm lựa chọn</span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Tìm sản phẩm thêm vào đơn..." 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-brand-600 focus:bg-white transition-all"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                />
                
                <AnimatePresence>
                  {products.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden"
                    >
                        {products.map(p => (
                            <button 
                                key={p._id}
                                onClick={() => addItem(p)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b last:border-none"
                            >
                                <img src={p.mainImage} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                <div className="text-left flex-1">
                                    <div className="text-xs font-black uppercase tracking-tight">{p.name}</div>
                                    <div className="text-[10px] font-bold text-brand-600 mt-0.5">{formatCurrency(p.discountPrice || p.price)}</div>
                                </div>
                                <Plus size={16} className="text-slate-400" />
                            </button>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {newOrder.items.length > 0 ? newOrder.items.map(item => (
                    <div key={item.productId} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl group">
                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-black uppercase tracking-tight truncate">{item.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{formatCurrency(item.price)}</div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                            <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-brand-600 transition-all"><Minus size={14}/></button>
                            <span className="text-xs font-black tabular-nums min-w-[20px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-brand-600 transition-all"><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </div>
                )) : (
                    <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-[32px] opacity-40">
                        <ShoppingBag className="mx-auto mb-3 text-slate-300" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Chưa có sản phẩm nào được chọn</p>
                    </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Hình thức thanh toán</label>
                    <select className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer" value={newOrder.paymentMethod} onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value})}>
                        <option value="Visa">Visa / Mastercard</option>
                        <option value="Bank Transfer">Chuyển khoản</option>
                        <option value="COD">Tiền mặt (COD)</option>
                        <option value="MoMo">Ví MoMo</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Trạng thái vận hành</label>
                    <select className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer" value={newOrder.deliveryStatus} onChange={e => setNewOrder({...newOrder, deliveryStatus: e.target.value})}>
                        <option value="New">🟢 Mới (Chờ xác nhận)</option>
                        <option value="Processing">🟡 Đang xử lý</option>
                        <option value="Shipped">🔵 Đang giao hàng</option>
                    </select>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 z-20">
            <div className="flex items-center justify-between mb-6 px-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Giá trị đơn hàng</span>
                <span className="text-2xl font-black text-slate-900 tracking-widest">{formatCurrency(newOrder.totalAmount)}</span>
            </div>
          <div className="w-full flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                Hủy yêu cầu
            </button>
            <button onClick={onCreate} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                Phê duyệt khởi tạo <ShieldCheck size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const OrderEditModal = ({ onClose, editingOrder, setEditingOrder, onUpdate }) => {
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end text-left">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      ></motion.div>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[10000]"
      >
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Cập nhật đơn hàng</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Mã định danh: {editingOrder.orderNumber || editingOrder._id?.slice(-8)}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
        </div>

        <div className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
          <div className="space-y-8">
            {/* Customer Brief */}
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm">
                    <UserPlus size={20} />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-black uppercase tracking-tight text-slate-900">{editingOrder.customer?.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">{editingOrder.customer?.phone || 'Chưa có SĐT'}</div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${editingOrder.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {editingOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chi tiết kiện hàng ({editingOrder.items?.length})</div>
                <div className="space-y-3">
                    {editingOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl">
                            <img src={item.image} className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100" />
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-tight truncate">{item.name}</div>
                                <div className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">SL: {item.quantity} x {formatCurrency(item.price)}</div>
                            </div>
                            <div className="text-xs font-black text-slate-900 tracking-tight">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái giao hàng</label>
                    <select 
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase outline-none focus:border-brand-500 transition-all cursor-pointer"
                        value={editingOrder.deliveryStatus} 
                        onChange={e => setEditingOrder({...editingOrder, deliveryStatus: e.target.value})}
                    >
                        <option value="New">🟢 Đơn hàng mới</option>
                        <option value="Processing">🟡 Đang xử lý</option>
                        <option value="Shipped">🔵 Đang giao hàng</option>
                        <option value="Delivered">🟣 Đã hoàn tất</option>
                        <option value="Canceled">🔴 Đã hủy đơn</option>
                        <option value="PendingApproval">🟠 Chờ phê duyệt giá</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quyết toán</label>
                    <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                        <input 
                            type="checkbox" 
                            id="isPaidCheck"
                            className="w-5 h-5 rounded-lg border-2 border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            checked={editingOrder.isPaid} 
                            onChange={e => setEditingOrder({...editingOrder, isPaid: e.target.checked})}
                        />
                        <label htmlFor="isPaidCheck" className="text-xs font-black uppercase text-slate-600 cursor-pointer">Xác nhận thanh toán</label>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-white rounded-[40px] shadow-sm relative overflow-hidden group border-2 border-slate-100">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <CreditCard size={100} className="text-slate-900" />
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Điều chỉnh tổng tiền (Nếu cần)</label>
                <div className="relative flex items-center">
                    <input 
                        type="number" 
                        className="bg-transparent border-none p-0 text-3xl font-black text-brand-600 outline-none w-full tabular-nums tracking-widest"
                        value={editingOrder.totalAmount} 
                        onChange={e => setEditingOrder({...editingOrder, totalAmount: Number(e.target.value)})}
                    />
                    <span className="text-slate-300 font-black text-xl ml-2">đ</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-rose-500 text-[9px] font-black uppercase tracking-widest">
                    <AlertCircle size={10} /> Sửa giá sẽ chuyển trạng thái sang "Chờ phê duyệt"
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 z-20">
          <div className="w-full flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Hủy bỏ</button>
            <button onClick={onUpdate} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={18} /> Lưu thay đổi
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

