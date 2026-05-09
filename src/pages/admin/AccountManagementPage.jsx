import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../api/axiosClient';
import { 
  Users, Search, Filter, Shield, ShieldAlert, 
  Lock, Unlock, Trash2, Mail, Calendar, MapPin, 
  ChevronLeft, ChevronRight, MoreVertical, MoreHorizontal, X,
  Key, ShoppingBag, MessageSquare, ExternalLink, CheckCircle, Info,
  Download, Activity, History, AlertCircle, Plus, UserPlus,
  AtSign, Phone, Fingerprint, Briefcase, Award, Globe, 
  ChevronDown, Save, UserCheck, Clock, CreditCard
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateHelper';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export const AccountManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const { showConfirmDialog } = useConfirmDialog();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create User State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Customer',
    status: 'active',
    specialty: '',
    experience: '',
    location: 'Hà Nội'
  });
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { 
        search: searchTerm, 
        role: roleFilter, 
        status: statusFilter,
        page,
        limit: 10
      };
      const response = await axiosClient.get('/users', { params });
      if (response.success) {
        setUsers(response.data);
        setStats(response.stats);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUserLogs = async (userId) => {
    try {
        const response = await axiosClient.get(`/users/${userId}/activity`);
        if (response.success) setUserLogs(response.data);
    } catch (error) {
        console.error("Error fetching logs:", error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
        addToast("Vui lòng điền đủ thông tin bắt buộc", "error");
        return;
    }
    try {
        const response = await axiosClient.post('/users', newUser);
        if (response.success) {
            addToast("Hồ sơ định danh đã được tạo thành công", "success");
            setIsCreateModalOpen(false);
            setNewUser({ 
              name: '', email: '', phone: '', password: '', 
              role: 'Customer', status: 'active',
              specialty: '', experience: '', location: 'Hà Nội'
            });
            fetchUsers();
        }
    } catch (error) {
        addToast(error.response?.data?.message || "Lỗi khi tạo tài khoản", "error");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (id === currentUser?._id) return addToast("Bạn không thể tự khóa chính mình!", "warning");
    try {
      const response = await axiosClient.patch(`/users/${id}`, { status: newStatus });
      if (response.success) {
          fetchUsers();
          addToast(newStatus === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', 'success');
      }
    } catch (error) {
      addToast("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
        addToast("Mật khẩu phải từ 6 ký tự", "warning");
        return;
    }
    try {
        const response = await axiosClient.patch(`/users/${selectedUser._id}/reset-password`, { newPassword });
        if (response.success) {
            addToast("Đã cấp lại mật khẩu thành công", "success");
            setIsResetModalOpen(false);
            setNewPassword('');
        }
    } catch (error) {
        addToast("Lỗi khi reset mật khẩu", "error");
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(users.map(u => u._id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete') {
        if (!await showConfirmDialog({ 
            title: 'Xóa hàng loạt', 
            message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} tài khoản đã chọn?`,
            type: 'error'
        })) return;

        try {
            await Promise.all(selectedIds.map(id => axiosClient.delete(`/users/${id}`)));
            addToast(`Đã xóa ${selectedIds.length} tài khoản`, "success");
            setSelectedIds([]);
            fetchUsers();
        } catch (error) {
            addToast("Có lỗi xảy ra", "error");
        }
    }
  };

  const exportToCSV = () => {
    const headers = ["Name,Email,Role,Status,LastLogin\n"];
    const rows = users.map(u => `${u.name},${u.email},${u.role},${u.status},${u.lastLoginAt || 'N/A'}\n`);
    const blob = new Blob([headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-users-${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Tài khoản</h1>
          <p className="text-sm text-slate-500 font-medium">
            Phân quyền và bảo mật định danh nhân sự Nexus. Tổng số: <span className="text-brand-600 font-bold">{pagination.total}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex-1 md:flex-none px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} /> Tạo tài khoản
          </button>
          <button 
            onClick={exportToCSV} 
            className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Download size={18} /> Xuất CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-8">
        
        {/* FILTER BAR */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {['all', 'admin', 'expert', 'customer'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setRoleFilter(tab === 'all' ? '' : tab)} 
                className={`pb-2 text-xs font-bold transition-all relative whitespace-nowrap uppercase tracking-widest ${ 
                    (roleFilter.toLowerCase() === tab || (tab === 'all' && !roleFilter)) 
                    ? 'text-brand-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'all' ? 'Tất cả' : tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             {selectedIds.length > 0 && (
               <button 
                 onClick={() => handleBulkAction('delete')} 
                 className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[11px] font-bold hover:bg-rose-100 border border-rose-100 flex items-center gap-2 transition-all"
                >
                  <Trash2 size={14}/> Xóa ({selectedIds.length})
                </button>
              )}
             <div className="relative flex-1 min-w-[300px] group">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên hoặc email định danh..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-inner" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                  <input type="checkbox" className="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500" onChange={toggleSelectAll} checked={selectedIds.length === users.length && users.length > 0} />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Định danh nhân sự</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Đăng nhập cuối</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Địa chỉ IP</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                  <tr>
                      <td colSpan="7" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                              <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                          </div>
                      </td>
                  </tr>
              ) : users.length === 0 ? (
                  <tr>
                      <td colSpan="7" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                          Không tìm thấy tài khoản nào phù hợp.
                      </td>
                  </tr>
              ) : users.map(u => (
                <tr key={u._id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.includes(u._id) ? 'bg-brand-50/30' : ''}`}>
                  <td className="px-6 py-4 text-center">
                      <input type="checkbox" className="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500" checked={selectedIds.includes(u._id)} onChange={() => toggleSelect(u._id)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-sm ${u.role === 'Admin' ? 'bg-brand-600' : u.role === 'Expert' ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                          {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate max-w-[150px] uppercase tracking-tight">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        u.role === 'Admin' ? 'bg-brand-50 text-brand-600 border-brand-100' : 
                        u.role === 'Expert' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center justify-center gap-2 font-black text-[10px] uppercase ${u.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-bold text-[11px]">
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : <span className="text-slate-300 italic">N/A</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-black text-[10px] tracking-widest">{u.lastLoginIp || '---'}</td>
                  <td className="px-6 py-4 text-right">
                     <button 
                          onClick={() => { setSelectedUser(u); setIsDetailModalOpen(true); fetchUserLogs(u._id); }} 
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all rounded-xl border border-transparent hover:border-brand-100"
                      >
                        <MoreHorizontal size={20} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-left">
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
            Trang {page} / {pagination.pages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
              disabled={page === 1} 
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronLeft size={18}/>
            </button>
            
            <div className="flex gap-1">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i+1}
                  onClick={() => setPage(i+1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    page === i+1 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {i+1}
                </button>
              )).slice(Math.max(0, page - 3), Math.min(pagination.pages, page + 2))}
            </div>

            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))} 
              disabled={page === pagination.pages || pagination.pages === 0} 
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: TRÌNH TẠO TÀI KHOẢN MỚI --- */}
      <AnimatePresence>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[500px] bg-white shadow-2xl flex flex-col z-[1001]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Khởi tạo Hồ sơ</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><UserPlus size={14}/> Quy trình cấp quyền Nexus</p></div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 p-8 space-y-10 overflow-y-auto text-left no-scrollbar">
              <div className="space-y-6">
                
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock size={12}/> Mã định danh</label><div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-400 italic shadow-inner">Cấp tự động sau khi phê duyệt</div></div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Họ tên nhân sự *</label><input type="text" placeholder="Nhập tên đầy đủ..." className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Email định danh *</label><input type="email" placeholder="name@nexus.com" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Cấp độ quyền hạn</label><select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 shadow-sm cursor-pointer" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}><option value="Customer">Khách hàng</option><option value="Expert">Chuyên gia</option><option value="Admin">Quản trị viên</option></select></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Mật khẩu *</label><input type="password" placeholder="Tối thiểu 6 ký tự" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 shadow-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
                </div>

                {newUser.role === 'Expert' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Chuyên môn</label><input type="text" placeholder="VD: iOS Specialist..." className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 shadow-sm" value={newUser.specialty} onChange={e => setNewUser({...newUser, specialty: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Kinh nghiệm</label><input type="text" placeholder="VD: 5 năm..." className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 shadow-sm" value={newUser.experience} onChange={e => setNewUser({...newUser, experience: e.target.value})} /></div>
                       <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Khu vực</label><select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 shadow-sm" value={newUser.location} onChange={e => setNewUser({...newUser, location: e.target.value})}><option value="Hà Nội">Hà Nội</option><option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option><option value="Đà Nẵng">Đà Nẵng</option></select></div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3 p-6 bg-brand-600 rounded-2xl shadow-xl shadow-brand-200">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2"><Shield size={14}/> Quy tắc bảo mật</label>
                  <p className="text-white text-xs font-medium leading-relaxed italic">
                    &quot;Tài khoản quản trị/chuyên gia sẽ được ghi nhận vào hệ thống Audit Log ngay sau khi khởi tạo thành công.&quot;
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-4">
              <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
                Hủy bỏ
              </button>
              <button onClick={handleCreateUser} className="flex-[2] py-3.5 bg-brand-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                Xác nhận tạo
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* --- MODAL 2: CHI TIẾT & CẬP NHẬT --- */}
      <AnimatePresence>
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[550px] bg-white shadow-2xl flex flex-col z-[1001]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Chi tiết Tài khoản</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><Lock size={14}/> Vận hành & Bảo mật định danh</p></div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X size={24} /></button>
            </div>
            
            <div className="flex-1 p-8 space-y-10 overflow-y-auto text-left no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock size={12}/> Email định danh</label><div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-500 shadow-inner">{selectedUser.email}</div></div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <History size={12}/> Trạng thái
                  </label>
                  <div className={`w-full px-4 py-3 border-2 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 ${selectedUser.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${selectedUser.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    {selectedUser.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1"><Shield size={16} className="text-brand-600"/> Cấp độ quyền hạn hiện tại</label>
                <div className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-xl font-black text-brand-600 shadow-sm uppercase tracking-tighter">
                  {selectedUser.role}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2"><History size={20} className="text-brand-600"/> Lịch sử Hoạt động</h3>
                <div className="space-y-8 relative ml-3">
                  {userLogs.length > 0 ? userLogs.map((log, i) => (
                    <div key={i} className="relative pl-8 before:content-[''] before:absolute before:left-[-1px] before:top-2 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                      <div className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-brand-600 z-10"></div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-brand-600 text-[10px] uppercase tracking-wider">{log.eventType.replace('_', ' ')}</span>
                          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10}/> {formatDate(log.createdAt)} {formatTime(log.createdAt)}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold">Địa chỉ IP: <span className="text-slate-700">{log.ipAddress || '---'}</span></p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400 text-[10px] font-bold uppercase italic tracking-widest">Chưa có nhật ký hoạt động</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-4">
              {selectedUser._id !== currentUser?._id && (
                <>
                  <button onClick={() => setIsResetModalOpen(true)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    Reset Pass
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedUser._id, selectedUser.status === 'active' ? 'suspended' : 'active')}
                    className={`flex-[2] py-4 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${selectedUser.status === 'active' ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700' : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'}`}
                  >
                    <ShieldAlert size={18} /> {selectedUser.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Reset Pass Modal */}
      <AnimatePresence>
      {isResetModalOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-10 text-left border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Cấp lại mật khẩu</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-8 leading-relaxed">Người dùng: <span className="text-brand-600 underline">{selectedUser?.name}</span></p>
                <input type="password" placeholder="Nhập mật khẩu mới..." className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all mb-8 shadow-inner" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus />
                <div className="flex gap-4">
                    <button onClick={() => setIsResetModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95">Hủy</button>
                    <button onClick={handleResetPassword} className="flex-1 py-4 bg-brand-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-95">Xác nhận</button>
                </div>
            </motion.div>
          </div>
      )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default AccountManagementPage;
