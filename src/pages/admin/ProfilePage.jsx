import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Eye, Save, Shield, Info, History, EyeOff } from 'lucide-react';
import userApi from '../../api/userApi';
import authApi from '../../api/authApi';
import { useToast } from '../../contexts/ToastContext';

const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center">
    <div className="p-2 bg-slate-200 rounded-lg mr-4">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

const AdminProfilePage = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile update state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await userApi.getProfile();
      setProfile(response.data);
      setName(response.data.name || '');
      setPhone(response.data.phone || '');
    } catch (error) {
      console.error("Failed to fetch profile", error);
      addToast("Không thể tải thông tin hồ sơ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await userApi.updateProfile({ name, phone });
      addToast("Cập nhật thông tin thành công", "success");
      fetchProfile();
    } catch (error) {
      addToast(error.response?.data?.message || "Cập nhật thất bại", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast("Mật khẩu mới phải từ 6 ký tự", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      addToast("Đổi mật khẩu thành công", "success");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      addToast(error.response?.data?.message || "Đổi mật khẩu thất bại", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-500 font-medium tracking-widest uppercase text-xs">Đang tải hồ sơ...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
        Không thể tải được thông tin hồ sơ. Vui lòng tải lại trang.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-200">
                {profile.name.charAt(0)}
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                <p className="text-sm text-slate-500 font-medium">{profile.email}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2"><User size={16} /> Thông tin cá nhân</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Họ và tên</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-medium"
                      required
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Chưa cập nhật"
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-medium"
                    />
                </div>
                <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
                    >
                        {isUpdatingProfile ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : <Save size={14}/>}
                        Lưu thay đổi
                    </button>
                </div>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2"><Lock size={16}/> Bảo mật</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="••••••••" 
                        required
                        className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mật khẩu mới</label>
                      <div className="relative">
                        <input 
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          placeholder="Ít nhất 6 ký tự" 
                          required
                          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-medium"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <input 
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          placeholder="Nhập lại mật khẩu mới" 
                          required
                          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-medium"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                      </div>
                  </div>
                </div>
                <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                    >
                        {isChangingPassword ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : <Shield size={14}/>}
                        Đổi mật khẩu
                    </button>
                </div>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><Info size={16}/> Thông tin hệ thống</h3>
                <div className="space-y-3">
                    <StatCard icon={<Shield size={16} className="text-slate-500"/>} label="Vai trò" value={profile.role} />
                    <StatCard icon={<Eye size={16} className="text-slate-500"/>} label="Trạng thái" value={profile.status} />
                    <StatCard icon={<Mail size={16} className="text-slate-500"/>} label="Ngày tạo" value={new Date(profile.createdAt).toLocaleDateString('vi-VN')} />
                    <StatCard icon={<History size={16} className="text-slate-500"/>} label="Đăng nhập cuối" value={new Date(profile.lastLoginAt).toLocaleString('vi-VN')} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
