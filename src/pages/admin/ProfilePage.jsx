import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Eye, Save, Shield, Info, History } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import userApi from '../../api/userApi';

const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center">
    <div className="p-2 bg-slate-200 rounded-lg mr-4">{icon}</div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value || 'N/A'}</p>
    </div>
  </div>
);

const AdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await userApi.getProfile();
        // userController trả về { success: true, data: user }
        // axiosClient trả về phần data của response, nên ta có:
        // response = { success: true, data: user }
        setProfile(response.data);
        
      } catch (error) {
        console.error("Failed to fetch profile", error);
        // Có thể thêm xử lý hiển thị lỗi cho người dùng ở đây
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Đang tải thông tin hồ sơ...</div>;
  }

  if (!profile) {
    return <div>Không thể tải được thông tin hồ sơ. Vui lòng thử lại.</div>;
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
            <form className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500">Họ và tên</label>
                    <input type="text" defaultValue={profile.name} className="w-full mt-1 p-2 border border-slate-200 rounded-lg"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500">Số điện thoại</label>
                    <input type="text" defaultValue={profile.phone || 'Chưa cập nhật'} className="w-full mt-1 p-2 border border-slate-200 rounded-lg"/>
                </div>
                <div className="pt-2">
                    <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-brand-700">
                        <Save size={14}/> Lưu thay đổi
                    </button>
                </div>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2"><Lock size={16}/> Bảo mật</h3>
            <form className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500">Mật khẩu hiện tại</label>
                    <input type="password" placeholder="••••••••" className="w-full mt-1 p-2 border border-slate-200 rounded-lg"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500">Mật khẩu mới</label>
                    <input type="password" placeholder="Ít nhất 6 ký tự" className="w-full mt-1 p-2 border border-slate-200 rounded-lg"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500">Xác nhận mật khẩu mới</label>
                    <input type="password" placeholder="Nhập lại mật khẩu mới" className="w-full mt-1 p-2 border border-slate-200 rounded-lg"/>
                </div>
                <div className="pt-2">
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-slate-900">
                        <Shield size={14}/> Đổi mật khẩu
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
