import React, { useState, useEffect } from 'react';
import { Package, User, LogOut, ChevronRight, Clock, ShoppingBag, Wrench, ShieldCheck, MessageSquare } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import supportApi from '../../api/supportApi';
import { formatCurrency } from '../../utils/formatCurrency';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || 'orders');
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cập nhật tab khi URL thay đổi
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'support') {
      fetchRepairs();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await supportApi.getMyRepairs();
      // Linh hoạt: Nếu là mảng thì dùng luôn, nếu là object { data: [...] } thì lấy .data
      const repairList = Array.isArray(response) ? response : (response.data || []);
      setRepairs(repairList);
      console.log("Repairs loaded:", repairList.length);
    } catch (error) {
      console.error('Failed to fetch repairs:', error);
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    navigate(`/user/account/${newTab}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': 
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Shipping': 
      case 'Repairing': return 'bg-blue-100 text-blue-700';
      case 'Processing': 
      case 'Confirmed': return 'bg-amber-100 text-amber-700';
      case 'Canceled': 
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'Delivered': 'Hoàn thành',
      'Shipping': 'Đang giao',
      'Processing': 'Đang xử lý',
      'Canceled': 'Đã hủy',
      'New': 'Mới',
      'PendingApproval': 'Chờ duyệt',
      // Repair labels
      'Pending': 'Chờ tiếp nhận',
      'Confirmed': 'Đã xác nhận',
      'Repairing': 'Đang sửa chữa',
      'Completed': 'Sửa xong',
      'Cancelled': 'Đã hủy'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 md:pt-36 md:pb-20">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Tài khoản của tôi</h1>
          <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 flex items-center gap-2 transition-colors">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            <button 
              onClick={() => handleTabChange('orders')}
              className={`w-full text-left px-6 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group ${activeTab === 'orders' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 hover:text-black border border-slate-100 hover:border-slate-200 shadow-sm'}`}
            >
              <span className="flex items-center gap-3 font-black"><Package size={16} /> Đơn hàng</span>
              {activeTab === 'orders' && <ChevronRight size={14} />}
            </button>
            <button 
              onClick={() => handleTabChange('support')}
              className={`w-full text-left px-6 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group ${activeTab === 'support' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 hover:text-black border border-slate-100 hover:border-slate-200 shadow-sm'}`}
            >
              <span className="flex items-center gap-3 font-black"><Wrench size={16} /> Hỗ trợ kỹ thuật</span>
              {activeTab === 'support' && <ChevronRight size={14} />}
            </button>
            <button 
              onClick={() => handleTabChange('profile')}
              className={`w-full text-left px-6 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group ${activeTab === 'profile' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 hover:text-black border border-slate-100 hover:border-slate-200 shadow-sm'}`}
            >
              <span className="flex items-center gap-3 font-black"><User size={16} /> Thông tin</span>
              {activeTab === 'profile' && <ChevronRight size={14} />}
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-6 flex items-center justify-between">
                   <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                     Đơn hàng của bạn ({orders.length})
                   </p>
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => navigate('/purchased-products')}>
                      Đánh giá sản phẩm
                   </span>
                </div>

                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 animate-pulse h-24" />
                  ))
                ) : orders.length > 0 ? (
                  orders.map(order => (
                    <div key={order._id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">#{order.orderNumber}</span>
                           <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(order.deliveryStatus)}`}>
                             {getStatusLabel(order.deliveryStatus)}
                           </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                          Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')} • {order.items?.length || 0} sản phẩm
                        </p>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                        <span className="text-sm font-black text-slate-900">{formatCurrency(order.totalAmount)}</span>
                        <button className="px-5 py-2.5 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-black hover:text-white rounded-lg transition-all">Chi tiết</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white py-20 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <ShoppingBag size={24} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Bạn chưa có đơn hàng nào</p>
                    <button onClick={() => navigate('/store')} className="px-6 py-2.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">Mua sắm ngay</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-6 flex items-center justify-between">
                   <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                     Lịch sử bảo trì & Sửa chữa ({repairs.length})
                   </p>
                </div>

                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 animate-pulse h-32" />)
                ) : repairs.length > 0 ? (
                  repairs.map(repair => (
                    <div key={repair._id} className="bg-white p-8 rounded-3xl border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                               <Wrench size={20} />
                            </div>
                            <div>
                               <div className="flex items-center gap-3">
                                  <span className="text-sm font-black uppercase tracking-tight">{repair.deviceType}</span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getStatusColor(repair.status)}`}>
                                    {getStatusLabel(repair.status)}
                                  </span>
                               </div>
                               <p className="text-[10px] font-mono text-slate-400 mt-0.5">Ticket: {repair.ticketNumber}</p>
                            </div>
                         </div>
                         <div className="text-left md:text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Ngày gửi</p>
                            <p className="text-xs font-bold text-slate-900">{new Date(repair.createdAt).toLocaleDateString('vi-VN')}</p>
                         </div>
                      </div>

                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                           <MessageSquare size={12} /> Mô tả lỗi của bạn
                         </p>
                         <p className="text-sm font-medium text-slate-600 italic">"{repair.description}"</p>
                      </div>

                      {repair.expertResponse ? (
                        <div className="p-6 bg-indigo-600 text-white rounded-2xl relative overflow-hidden shadow-xl shadow-indigo-200 animate-in slide-in-from-top-2 duration-500">
                           <div className="absolute top-0 right-0 p-4 opacity-20">
                              <ShieldCheck size={60} />
                           </div>
                           <div className="flex items-center gap-3 mb-4 relative z-10">
                              <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase shadow-lg">
                                 {repair.expert?.name?.charAt(0) || 'G'}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Lời nhắn từ Nexus Genius</p>
                                 <p className="text-[9px] font-bold text-white/70 uppercase">{repair.expert?.name || 'Kỹ thuật viên'}</p>
                              </div>
                           </div>
                           <p className="text-sm font-bold leading-relaxed pl-0 md:pl-11 relative z-10">
                              {repair.expertResponse}
                           </p>
                           <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-200">Phản hồi chính thức từ hệ thống</span>
                              <div className="flex items-center gap-1 text-[9px] font-bold">
                                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> Verified
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center gap-4">
                           <Clock size={16} className="text-slate-300" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Hệ thống đang điều phối kỹ thuật viên xử lý yêu cầu của bạn...</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white py-20 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Wrench size={24} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Chưa có yêu cầu hỗ trợ nào</p>
                    <button onClick={() => navigate('/support')} className="px-6 py-2.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">Gửi yêu cầu ngay</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl ring-8 ring-slate-50">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic leading-tight">{user?.name || 'Khách hàng'}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{user?.role || 'Verified Member'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Họ tên đầy đủ</label>
                     <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 shadow-inner">{user?.name || 'Khách hàng'}</div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Địa chỉ Email</label>
                     <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 shadow-inner">{user?.email || 'email@example.com'}</div>
                   </div>
                </div>

                <div className="pt-8">
                  <button className="px-8 py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 active:scale-95">
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
