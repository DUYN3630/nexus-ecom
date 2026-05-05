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

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, page]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
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
  };

  const fetchUserLogs = async (userId) => {
    try {
        const response = await axiosClient.get(`/users/${userId}/activity`);
        if (response.success) setUserLogs(response.data);
    } catch (error) {
        console.error("Error fetching logs:", error);
    }
  };

  const handleCreateUser = async (e) => {
    if (e) e.preventDefault();
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

  const handleRoleToggle = async (id, currentRole) => {
    if (id === currentUser?._id) return addToast("Bạn không thể tự thay đổi vai trò của chính mình!", "warning");
    
    const roles = ['Customer', 'Expert', 'Admin'];
    const currentIndex = roles.indexOf(currentRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];

    if (!await showConfirmDialog({ 
        title: 'Xác nhận Đổi Vai trò', 
        message: `Bạn có chắc chắn muốn thay đổi quyền hạn từ [${currentRole}] sang [${nextRole}]?`, 
        type: 'warning' 
    })) return;
    
    try {
      const response = await axiosClient.patch(`/users/${id}`, { role: nextRole });
      if (response.success) {
          fetchUsers();
          addToast(`Đã cập nhật vai trò sang ${nextRole}`, 'success');
          if (selectedUser) setSelectedUser({...selectedUser, role: nextRole});
      }
    } catch (error) {
      addToast("Lỗi khi cập nhật vai trò", "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser?._id) return addToast("Bạn không thể tự xóa chính mình!", "warning");
    if (await showConfirmDialog({ title: 'Xác nhận Xóa', message: 'Bạn có chắc chắn muốn xóa tài khoản này vĩnh viễn?', type: 'error' })) {
      try {
        const response = await axiosClient.delete(`/users/${id}`);
        if (response.success) {
            fetchUsers();
            addToast('Đã xóa người dùng', 'success');
        }
      } catch (error) {
        addToast("Lỗi khi xóa người dùng", "error");
      }
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
        return addToast("Mật khẩu phải ít nhất 6 ký tự", "warning");
    }
    try {
        const response = await axiosClient.post(`/users/${selectedUser._id}/reset-password`, { newPassword });
        if (response.success) {
            addToast("Đã đặt lại mật khẩu thành công!", "success");
            setIsResetModalOpen(false);
            setNewPassword('');
        }
    } catch (error) {
        addToast("Lỗi khi reset mật khẩu", "error");
    }
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ten,Email,Vai tro,Trang thai,Ngay tao\n";
    users.forEach(u => {
        csvContent += `${u.name},${u.email},${u.role},${u.status},${u.createdAt}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(users.map(u => u._id));
    else setSelectedIds([]);
  };

  const handleBulkAction = async (action) => {
    const idsToProcess = selectedIds.filter(id => id !== currentUser?._id);
    if (idsToProcess.length === 0) return addToast("Không có người dùng hợp lệ để thực hiện.", "warning");
    if (!await showConfirmDialog({ title: 'Xác nhận Thao tác', message: `Thực hiện hành động này trên ${idsToProcess.length} người dùng?`, type: action === 'delete' ? 'error' : 'warning' })) return;
    
    try {
        await Promise.all(idsToProcess.map(id => {
            if (action === 'delete') return axiosClient.delete(`/users/${id}`);
            if (action === 'suspend') return axiosClient.patch(`/users/${id}`, { status: 'suspended' });
            if (action === 'activate') return axiosClient.patch(`/users/${id}`, { status: 'active' });
        }));
        setSelectedIds([]);
        fetchUsers();
        addToast(`Thao tác thành công trên ${idsToProcess.length} tài khoản`, 'success');
    } catch (error) {
        addToast("Có lỗi xảy ra", "error");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-left bg-[#f8fafc]">
      <div className="p-4 lg:p-8 overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-left">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ Tài khoản ({pagination.total})</h1>
            <p className="text-sm text-slate-500 mt-1">Cấu hình định danh và phân quyền vận hành hệ thống Nexus.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCreateModalOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
              <Plus size={16} /> Tạo tài khoản mới
            </button>
            <button onClick={exportToCSV} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95">
              <Download size={16} /> Xuất CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          
          {/* FILTER BAR - MIRROR ORDER PAGE */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex gap-8 overflow-x-auto">
              {['all', 'admin', 'expert', 'customer'].map(tab => (
                <button key={tab} onClick={() => setRoleFilter(tab === 'all' ? '' : tab)} className={`pb-2 text-xs font-bold transition-all relative whitespace-nowrap uppercase tracking-widest ${ (roleFilter.toLowerCase() === tab || (tab === 'all' && !roleFilter)) ? 'text-slate-900 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'all' ? 'Tất cả' : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
               {selectedIds.length > 0 && <button onClick={() => handleBulkAction('delete')} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-100 border border-red-100 flex items-center gap-2 transition-all"><Trash2 size={14}/> Xóa ({selectedIds.length})</button>}
               <div className="relative min-w-[300px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm theo tên hoặc email định danh..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 bg-white shadow-inner font-bold uppercase tracking-tight" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>

          {/* TABLE - MIRROR ORDER PAGE STYLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100 tracking-widest font-black">
                <tr>
                  <th className="px-6 py-5 w-10 text-center"><input type="checkbox" className="rounded" onChange={toggleSelectAll} checked={selectedIds.length === users.length && users.length > 0} /></th>
                  <th className="px-6 py-5">Định danh</th>
                  <th className="px-6 py-5">Quyền hạn</th>
                  <th className="px-6 py-5">Trạng thái</th>
                  <th className="px-6 py-5">Đăng nhập cuối</th>
                  <th className="px-6 py-5">Địa chỉ IP</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan="7" className="px-6 py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Đang đồng bộ dữ liệu Atlas...</td></tr> : users.length === 0 ? <tr><td colSpan="7" className="px-6 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Không có dữ liệu phù hợp</td></tr> : users.map(u => (
                  <tr key={u._id} className={`hover:bg-slate-50/80 transition-all ${selectedIds.includes(u._id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded border-slate-300" checked={selectedIds.includes(u._id)} onChange={() => toggleSelect(u._id)} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm ${u.role === 'Admin' ? 'bg-indigo-600' : u.role === 'Expert' ? 'bg-emerald-600' : 'bg-slate-700'}`}>{u.name.charAt(0)}</div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs uppercase tracking-tight">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.role === 'Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : u.role === 'Expert' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${u.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        {u.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold text-[11px]">{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Chưa có'}</td>
                    <td className="px-6 py-4 text-slate-400 font-black text-[10px] tracking-widest">{u.lastLoginIp || '---'}</td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => { setSelectedUser(u); setIsDetailModalOpen(true); fetchUserLogs(u._id); }} className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-lg hover:bg-slate-100">
                          <MoreHorizontal size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION - MIRROR ORDER PAGE */}
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-left">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Hiển thị {users.length} định danh • Trang {page} / {pagination.pages || 1}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-all disabled:opacity-30 shadow-sm"><ChevronLeft size={16}/></button>
              <button onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))} disabled={page === pagination.pages || pagination.pages === 0} className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-all disabled:opacity-30 shadow-sm"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: TRÌNH TẠO TÀI KHOẢN MỚI (MIRROR ORDER PAGE 100%) --- */}
      <AnimatePresence>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[1001]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Khởi tạo hồ sơ định danh</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><UserPlus size={12}/> Quy trình cấp quyền bảo mật Nexus</p></div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 p-8 space-y-10 overflow-y-auto text-left custom-scrollbar">
              <div className="space-y-6">
                
                {/* Section: Basic Identity */}
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Mã định danh Nexus</label><input type="text" value="Cấp tự động sau khi phê duyệt" readOnly className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 outline-none italic shadow-inner" /></div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Họ tên nhân sự</label><input type="text" placeholder="Nhập tên đầy đủ..." className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 transition-all shadow-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Địa chỉ Email định danh</label><input type="email" placeholder="name@nexus.com" className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 transition-all shadow-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Cấp độ quyền hạn</label><select className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-blue-600" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}><option value="Customer">Khách hàng (Customer)</option><option value="Expert">Chuyên gia (Expert)</option><option value="Admin">Quản trị (Admin)</option></select></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Mật khẩu khởi tạo</label><input type="password" placeholder="Tối thiểu 6 ký tự" className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
                </div>

                {/* Section: Expert Profile (Conditional) */}
                {newUser.role === 'Expert' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Lĩnh vực chuyên môn</label><input type="text" placeholder="Ví dụ: iOS Specialist..." className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm" value={newUser.specialty} onChange={e => setNewUser({...newUser, specialty: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Kinh nghiệm</label><input type="text" placeholder="Ví dụ: 5 năm..." className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm" value={newUser.experience} onChange={e => setNewUser({...newUser, experience: e.target.value})} /></div>
                       <div className="space-y-2"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Khu vực</label><select className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-blue-600" value={newUser.location} onChange={e => setNewUser({...newUser, location: e.target.value})}><option value="Hà Nội">Hà Nội</option><option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option><option value="Đà Nẵng">Đà Nẵng</option></select></div>
                    </div>
                  </motion.div>
                )}

                {/* Info Box */}
                <div className="space-y-3 p-8 bg-blue-600 rounded-[32px] shadow-xl shadow-blue-200">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 opacity-80"><Shield size={14}/> Quy tắc bảo mật Nexus</label>
                  <p className="text-white text-xs font-medium leading-relaxed italic opacity-90">
                    &quot;Việc khởi tạo tài khoản Admin/Expert yêu cầu phê duyệt đa tầng. Định danh này sẽ được ghi nhận vào Audit Log hệ thống ngay sau khi xác nhận.&quot;
                  </p>
                </div>
              </div>
            </div>
            {/* FOOTER BUTTONS */}
            <div className="p-6 border-t bg-white flex gap-4 sticky bottom-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-sm">
                Hủy yêu cầu
              </button>
              <button onClick={handleCreateUser} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Save size={18} /> Phê duyệt khởi tạo
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* --- MODAL 2: CHI TIẾT & CẬP NHẬT (SLIDE OVER) --- */}
      <AnimatePresence>
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[1001]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="text-left"><h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Hồ sơ định danh chi tiết</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><Lock size={12}/> Vận hành & Bảo mật định danh Nexus</p></div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 p-8 space-y-10 overflow-y-auto text-left custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Email định danh</label><input type="text" value={selectedUser.email} readOnly className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-500 outline-none shadow-inner" /></div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <History size={12}/> Trạng thái vận hành
                  </label>
                  <div className={`w-full px-4 py-3.5 border-2 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${selectedUser.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${selectedUser.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    {selectedUser.status === 'active' ? 'Đang hoạt động' : 'Đang vô hiệu'}
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Shield size={14} className="text-blue-600"/> Cấp độ quyền hạn</label>
                <div className="w-full px-6 py-5 bg-white border-2 border-slate-200 rounded-2xl text-xl font-black text-blue-700 shadow-sm uppercase tracking-tighter">
                  {selectedUser.role}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-2"><History size={20} className="text-blue-600"/> Audit Logs (Hoạt động)</h3>
                <div className="space-y-10 relative ml-4">
                  {userLogs.length > 0 ? userLogs.map((log, i) => (
                    <div key={i} className="relative pl-10 before:content-[''] before:absolute before:left-[-1px] before:top-2 before:bottom-[-40px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                      <div className="absolute left-[-7px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-4 border-blue-600 z-10"></div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-black text-blue-600 text-[10px] uppercase tracking-wider">{log.eventType.replace('_', ' ')}</span>
                          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10}/> {formatDate(log.createdAt)} {formatTime(log.createdAt)}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold">Truy cập từ IP: {log.ipAddress || '---'}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-slate-400 text-[10px] font-black uppercase italic tracking-widest">Không có dữ liệu nhật ký</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/80 backdrop-blur-xl sticky bottom-0 flex gap-4 z-10 shadow-2xl">
              {selectedUser._id !== currentUser?._id && (
                <>
                  <button onClick={() => setIsResetModalOpen(true)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    Reset Pass
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedUser._id, selectedUser.status === 'active' ? 'suspended' : 'active')}
                    className={`flex-[2] py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${selectedUser.status === 'active' ? 'bg-red-600 shadow-red-200 hover:bg-red-700' : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'}`}
                  >
                    <ShieldAlert size={18} /> {selectedUser.status === 'active' ? 'Vô hiệu hóa định danh' : 'Kích hoạt định danh'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Reset Pass Modal - Simple center modal */}
      <AnimatePresence>
      {isResetModalOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-10 text-left">
                <h3 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tighter">Cấp lại mật khẩu</h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-8 leading-relaxed">Mật khẩu mới cho <span className="text-blue-600">{selectedUser?.name}</span>.</p>
                <input type="password" placeholder="Tối thiểu 6 ký tự..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all mb-8 shadow-inner" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus />
                <div className="flex gap-4">
                    <button onClick={() => setIsResetModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Hủy</button>
                    <button onClick={handleResetPassword} className="flex-1 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30">Xác nhận</button>
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

const MiniStatCard = ({ title, value, color }) => {
  const bgMap = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group text-left">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">{title}</p>
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${bgMap[color]}`}><Users className="w-6 h-6" /></div>
      </div>
    </div>
  );
};

export default AccountManagementPage;
