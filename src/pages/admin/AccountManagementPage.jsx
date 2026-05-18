import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

const AccountManagementPage = () => {
  const currentUser = useSelector(selectCurrentUser);
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
            addToast("Đã tạo tài khoản nhân sự mới!", "success");
            setIsCreateModalOpen(false);
            setNewUser({ name: '', email: '', phone: '', password: '', role: 'Customer', status: 'active', specialty: '', experience: '', location: 'Hà Nội' });
            fetchUsers();
        }
    } catch (error) {
        addToast(error.response?.data?.message || "Lỗi khởi tạo hồ sơ", "error");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await axiosClient.patch(`/users/${userId}/status`, { status: newStatus });
      if (response.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
        addToast(`Đã ${newStatus === 'active' ? 'mở khóa' : 'vô hiệu hóa'} tài khoản`, "info");
      }
    } catch (error) {
      addToast("Không thể cập nhật trạng thái", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    try {
      const response = await axiosClient.post(`/users/${selectedUser._id}/reset-password`, { password: newPassword });
      if (response.success) {
        addToast("Đã cấp mật khẩu mới thành công", "success");
        setIsResetModalOpen(false);
        setNewPassword('');
      }
    } catch (error) {
      addToast("Lỗi khi reset mật khẩu", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    showConfirmDialog({
      title: "Xác nhận xóa tài khoản",
      message: "Hành động này sẽ xóa vĩnh viễn hồ sơ và dữ liệu liên quan. Bạn chắc chắn chứ?",
      onConfirm: async () => {
        try {
          const response = await axiosClient.delete(`/users/${userId}`);
          if (response.success) {
            setUsers(prev => prev.filter(u => u._id !== userId));
            addToast("Đã xóa tài khoản khỏi hệ thống", "success");
          }
        } catch (error) {
          addToast("Không thể xóa tài khoản này", "error");
        }
      }
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (loading && page === 1 && !users.length) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu nhân sự...</p>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase tracking-tighter">
            Quản trị Tài khoản
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                <Users size={12}/> {pagination.total} Người dùng
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-200 transition-all active:scale-95"
            >
                <UserPlus size={18} /> Cấp tài khoản mới
            </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Quản trị viên" value={stats?.admins || 0} icon={Shield} color="brand" />
        <StatCard label="Chuyên gia" value={stats?.experts || 0} icon={Award} color="purple" />
        <StatCard label="Khách hàng" value={stats?.customers || 0} icon={Users} color="emerald" />
        <StatCard label="Bị khóa" value={stats?.inactive || 0} icon={ShieldAlert} color="rose" />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, số điện thoại..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-600 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-tight outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-brand-600 transition-all cursor-pointer"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="Admin">Admin</option>
            <option value="Expert">Expert</option>
            <option value="Customer">Customer</option>
          </select>
          <select 
            className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-brand-600 transition-all cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">🟢 Đang hoạt động</option>
            <option value="inactive">🔴 Đã khóa</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border-2 border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                <th className="px-8 py-6 w-[50px]">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 text-brand-600 focus:ring-brand-500"
                        onChange={e => setSelectedIds(e.target.checked ? users.map(u => u._id) : [])}
                        checked={selectedIds.length === users.length && users.length > 0}
                    />
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Định danh / Email</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vai trò</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {users.map((user) => (
                <tr key={user._id} className={`group hover:bg-slate-50/50 transition-all ${selectedIds.includes(user._id) ? 'bg-brand-50/30' : ''}`}>
                  <td className="px-8 py-6">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={selectedIds.includes(user._id)}
                        onChange={() => toggleSelect(user._id)}
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm group-hover:scale-110">
                        {user.role === 'Admin' ? <Shield size={20}/> : user.role === 'Expert' ? <Award size={20}/> : <Users size={20}/>}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-xs truncate max-w-[200px] uppercase tracking-tight">{user.name}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1 lowercase">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border-2 uppercase tracking-widest ${
                        user.role === 'Admin' ? 'bg-brand-50 text-brand-600 border-brand-100' :
                        user.role === 'Expert' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                        onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'inactive' : 'active')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase border-2 transition-all active:scale-90 ${
                            user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                        }`}
                    >
                        {user.status === 'active' ? <Unlock size={10}/> : <Lock size={10}/>}
                        {user.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => { setSelectedUser(user); setIsDetailModalOpen(true); fetchUserLogs(user._id); }}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border-2 border-transparent hover:border-brand-100"
                        title="Chi tiết hồ sơ"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedUser(user); setIsResetModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border-2 border-transparent hover:border-amber-100"
                        title="Cấp lại mật khẩu"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-2 border-transparent hover:border-rose-100"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-8 py-6 bg-slate-50/50 border-t-2 border-slate-100 flex justify-between items-center">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Trang {page} / {pagination.pages || 1}</p>
           <div className="flex gap-2">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2.5 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronLeft size={16}/>
            </button>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={page === pagination.pages || pagination.pages === 0}
              className="p-2.5 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronRight size={16}/>
            </button>
           </div>
        </div>
      </div>

      {/* --- MODAL 1: TRÌNH TẠO TÀI KHOẢN MỚI --- */}
      <AnimatePresence>
      {isCreateModalOpen && (
        <AccountCreateModal 
            onClose={() => setIsCreateModalOpen(false)}
            newUser={newUser}
            setNewUser={setNewUser}
            onCreate={handleCreateUser}
        />
      )}
      </AnimatePresence>

      {/* --- MODAL 2: CHI TIẾT & HOẠT ĐỘNG --- */}
      <AnimatePresence>
      {isDetailModalOpen && selectedUser && (
        <AccountDetailModal 
            onClose={() => setIsDetailModalOpen(false)}
            selectedUser={selectedUser}
            userLogs={userLogs}
        />
      )}
      </AnimatePresence>

      {/* --- MODAL 3: RESET PASSWORD --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsResetModalOpen(false)}></div>
            <div className="bg-white rounded-[40px] p-10 w-full max-w-md relative z-10 shadow-2xl border-4 border-slate-100 text-left">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2 italic">Cấp lại mật khẩu</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Cho tài khoản: {selectedUser.email}</p>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-600 transition-all font-bold" placeholder="••••••••" />
                    </div>
                    <button onClick={handleResetPassword} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-brand-600 transition-all active:scale-95">Xác nhận thay đổi</button>
                    <button onClick={() => setIsResetModalOpen(false)} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Hủy bỏ</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ label, value, icon: Icon, color }) => {
    const colors = {
        brand: 'bg-brand-50 text-brand-600 border-brand-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm flex items-center gap-5 group hover:border-brand-500 transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-transparent shadow-sm ${colors[color]} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">{value}</h3>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS (PORTALS) ---

const AccountCreateModal = ({ onClose, newUser, setNewUser, onCreate }) => {
    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex justify-end text-left">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[500px] bg-white shadow-2xl flex flex-col z-[10000]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Khởi tạo Hồ sơ</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><UserPlus size={14}/> Quy trình cấp quyền Nexus</p></div>
              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
            </div>
            <div className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock size={12}/> Mã định danh</label><div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-400 italic shadow-inner">Cấp tự động sau khi phê duyệt</div></div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Họ tên nhân sự *</label><input type="text" placeholder="Nhập tên đầy đủ..." className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Email định danh *</label><input type="email" placeholder="name@nexus.com" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Mật khẩu truy cập *</label><input type="password" placeholder="••••••••" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Vai trò hệ thống</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                            <option>Customer</option>
                            <option>Expert</option>
                            <option>Admin</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Vùng làm việc</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" value={newUser.location} onChange={e => setNewUser({...newUser, location: e.target.value})}>
                            <option>Hà Nội</option>
                            <option>TP. Hồ Chí Minh</option>
                            <option>Đà Nẵng</option>
                        </select>
                    </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 z-20 flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm">Hủy bỏ</button>
              <button onClick={onCreate} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 active:scale-95">Xác nhận tạo</button>
            </div>
          </motion.div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

const AccountDetailModal = ({ onClose, selectedUser, userLogs }) => {
    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex justify-end text-left">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[550px] bg-white shadow-2xl flex flex-col z-[10000]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Chi tiết Tài khoản</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><Lock size={14}/> Vận hành & Bảo mật định danh</p></div>
              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
            </div>
            <div className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock size={12}/> Email định danh</label><div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-500 shadow-inner">{selectedUser.email}</div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><History size={12}/> Trạng thái</label><div className={`w-full px-4 py-3 border-2 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 ${selectedUser.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>{selectedUser.status}</div></div>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase text-brand-600 tracking-widest border-b border-slate-50 pb-3 flex items-center gap-2"><Activity size={14}/> Nhật ký hoạt động gần đây</h4>
                <div className="space-y-3">
                  {userLogs.length > 0 ? userLogs.map((log, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-brand-200 transition-all">
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.action}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{formatDate(log.createdAt)} • {formatTime(log.createdAt)}</p>
                        </div>
                        <div className="text-[9px] font-black text-brand-400 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">{log.ip}</div>
                    </div>
                  )) : (
                    <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Không có dữ liệu nhật ký</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 z-20">
              <button onClick={onClose} className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all shadow-sm">Đóng cửa sổ</button>
            </div>
          </motion.div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

export default AccountManagementPage;
