import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  Users, Search, Filter, Shield, ShieldAlert, 
  Lock, Unlock, Trash2, Mail, Calendar, MapPin, 
  ChevronLeft, ChevronRight, MoreVertical, X,
  Key, ShoppingBag, MessageSquare, ExternalLink, CheckCircle, Info,
  Download, Activity, History, AlertCircle
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
        limit: 5
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
    if (!await showConfirmDialog({ title: 'Xác nhận Đổi Vai trò', message: 'Bạn có chắc chắn muốn thay đổi quyền hạn của tài khoản này?', type: 'warning' })) return;
    
    const newRole = (currentRole === 'Admin' || currentRole === 'admin') ? 'Customer' : 'Admin';
    try {
      const response = await axiosClient.patch(`/users/${id}`, { role: newRole });
      if (response.success) {
          fetchUsers();
          addToast('Đã cập nhật vai trò', 'success');
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

  // Bulk Action Helpers
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map(u => u._id));
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
    <div className="fade-in space-y-6 pb-12 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-brand">Quản lý Tài khoản</h1>
          <p className="text-sm text-slate-500">Kiểm soát và phân quyền người dùng hệ thống</p>
        </div>
        <button onClick={exportToCSV} className="bg-white border text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"><Download className="w-4 h-4" /> Xuất danh sách</button>
      </div>

      {/* User Stats Mini Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard title="Tổng người dùng" value={stats?.totalUsers || 0} color="blue" />
        <MiniStatCard title="Đang hoạt động" value={stats?.activeUsers || 0} color="emerald" />
        <MiniStatCard title="Đã khóa" value={stats?.suspendedUsers || 0} color="rose" />
        <MiniStatCard title="Người dùng mới hôm nay" value={stats?.newToday || 0} color="purple" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 ring-brand-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <select 
                className="bg-slate-50 border-none rounded-xl text-xs px-4 py-2.5 outline-none cursor-pointer font-bold text-slate-700"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
            >
                <option value="">Tất cả vai trò</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
            </select>
            <select 
                className="bg-slate-50 border-none rounded-xl text-xs px-4 py-2.5 outline-none cursor-pointer font-bold text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="suspended">Đã khóa</option>
            </select>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 z-50 animate-bounce-in">
            <span className="text-sm font-bold border-r border-slate-700 pr-6">Đã chọn {selectedIds.length} người dùng</span>
            <div className="flex gap-3">
                <button onClick={() => handleBulkAction('activate')} className="flex items-center gap-2 text-xs font-bold hover:text-emerald-400 transition-colors"><Unlock className="w-4 h-4" /> Mở khóa</button>
                <button onClick={() => handleBulkAction('suspend')} className="flex items-center gap-2 text-xs font-bold hover:text-amber-400 transition-colors"><Lock className="w-4 h-4" /> Khóa</button>
                <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-2 text-xs font-bold hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /> Xóa</button>
            </div>
            <button onClick={() => setSelectedIds([])} className="ml-2 p-1 hover:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                    <input 
                        type="checkbox" 
                        checked={selectedIds.length === users.length && users.length > 0} 
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin chính</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quyền hạn</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-slate-400 font-medium italic">Không tìm thấy dữ liệu</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className={`group hover:bg-slate-50/50 transition-colors ${selectedIds.includes(user._id) ? 'bg-brand-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                        type="checkbox" 
                        checked={selectedIds.includes(user._id)} 
                        onChange={() => toggleSelect(user._id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-brand-700 font-black text-lg shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div className="cursor-pointer group" onClick={() => { setSelectedUser(user); setIsDetailModalOpen(true); fetchUserLogs(user._id); }}>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors flex items-center gap-1">{user.name} {user._id === currentUser?._id && <span className="text-[10px] px-1 bg-slate-100 text-slate-400 rounded">Bạn</span>}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                      (user.role === 'Admin' || user.role === 'admin') ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-xs font-bold ${
                      user.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                      {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500 font-medium">
                        <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Mới'}</p>
                        <p className="flex items-center gap-1.5 mt-1 opacity-60"><MapPin className="w-3.5 h-3.5" /> {user.lastLoginIp || '---'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedUser(user); setIsDetailModalOpen(true); fetchUserLogs(user._id); }} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all" title="Chi tiết"><Info className="w-4 h-4" /></button>
                        {user._id !== currentUser?._id && (
                            <>
                                <button onClick={() => handleStatusUpdate(user._id, user.status === 'active' ? 'suspended' : 'active')} className={`p-2 rounded-xl transition-all ${user.status === 'active' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-rose-600 bg-rose-50'}`}>{user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
                                <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- PAGINATION NAVIGATION --- */}
          {pagination.pages > 1 && (
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Trang {pagination.page} / {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className={`p-2 rounded-xl border transition-all ${page === 1 ? 'text-slate-200 border-slate-50 cursor-not-allowed' : 'text-slate-500 border-slate-200 hover:bg-white hover:text-indigo-600 shadow-sm'}`}
                >
                  <ChevronLeft size={18} />
                </button>

                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${
                      page === i + 1 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'text-slate-400 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={page === pagination.pages}
                  className={`p-2 rounded-xl border transition-all ${page === pagination.pages ? 'text-slate-200 border-slate-50 cursor-not-allowed' : 'text-slate-500 border-slate-200 hover:bg-white hover:text-indigo-600 shadow-sm'}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
          </div>        
        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">Trang {page} / {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in flex flex-col md:flex-row max-h-[90vh]">
                {/* Left Side: Info */}
                <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col">
                    <div className="p-8 bg-brand-600 text-white flex flex-col items-center">
                        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-black mb-4 shadow-xl">{selectedUser.name.charAt(0)}</div>
                        <h2 className="text-xl font-black">{selectedUser.name}</h2>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mt-1">{selectedUser.role}</p>
                    </div>
                    <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                        <DetailItem icon={Mail} label="Email" value={selectedUser.email} />
                        <DetailItem icon={Calendar} label="Ngày tham gia" value={formatDate(selectedUser.createdAt)} />
                        <DetailItem icon={MapPin} label="IP đăng nhập cuối" value={selectedUser.lastLoginIp || '---'} />
                        <DetailItem icon={AlertCircle} label="Trạng thái" value={selectedUser.status === 'active' ? 'Hoạt động' : 'Đã khóa'} isBadge />
                    </div>
                </div>

                {/* Right Side: Activity Logs */}
                <div className="w-full md:w-2/3 flex flex-col bg-white">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><History className="w-4 h-4 text-brand-600" /> Nhật ký hoạt động</h3>
                        <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                        {userLogs.length === 0 ? (
                            <div className="text-center py-20">
                                <Activity className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                                <p className="text-xs text-slate-400 italic">Chưa có nhật ký hoạt động nào</p>
                            </div>
                        ) : (
                            userLogs.map((log, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand-600"><Activity className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{log.eventType.replace('_', ' ')}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(log.createdAt)} - {formatTime(log.createdAt)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
                        {selectedUser._id !== currentUser?._id && (
                            <>
                                <button onClick={() => setIsResetModalOpen(true)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-100 flex items-center justify-center gap-2 transition-all"><Key className="w-4 h-4" /> Reset Pass</button>
                                <button onClick={() => handleRoleToggle(selectedUser._id, selectedUser.role)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-100 flex items-center justify-center gap-2 transition-all"><Shield className="w-4 h-4" /> Đổi vai trò</button>
                                <button onClick={() => handleStatusUpdate(selectedUser._id, selectedUser.status === 'active' ? 'suspended' : 'active')} className={`flex-1 px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-white transition-all shadow-lg ${selectedUser.status === 'active' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}>
                                    {selectedUser.status === 'active' ? 'Khóa TK' : 'Mở khóa'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-zoom-in">
                <h3 className="text-xl font-black text-slate-800 mb-2">Đặt lại mật khẩu</h3>
                <p className="text-sm text-slate-500 mb-6">Mật khẩu mới sẽ có hiệu lực ngay lập tức cho <span className="text-brand-600 font-bold">{selectedUser.name}</span>.</p>
                <input 
                    type="password" 
                    placeholder="Mật khẩu mới (ít nhất 6 ký tự)..." 
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500/20 mb-6"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-3">
                    <button onClick={() => setIsResetModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">Hủy</button>
                    <button onClick={handleResetPassword} className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30">Cập nhật</button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value, isBadge }) => (
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl text-slate-400 flex items-center justify-center shadow-sm"><Icon className="w-5 h-5" /></div>
        <div className="min-w-0">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
            {isBadge ? (
                <span className={`text-[10px] font-black uppercase ${value.includes('Hoạt động') ? 'text-emerald-600' : 'text-rose-600'}`}>{value}</span>
            ) : (
                <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
            )}
        </div>
    </div>
);

const MiniStatCard = ({ title, value, color }) => {
  const bgMap = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">{title}</p>
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${bgMap[color]}`}><Users className="w-6 h-6" /></div>
      </div>
    </div>
  );
};

export default AccountManagementPage;
