import { Search, Bell, Menu, Eye, ExternalLink, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';

export const AdminHeader = () => {
  const testSocket = () => {
    if (socket.connected) {
      socket.emit('join_admin_room'); // Đảm bảo đã vào room
      // Gửi sự kiện giả lập đến server để server phát lại cho admin
      toast.loading("Đang gửi test signal...", { id: 'test-s', duration: 1000 });
      // Tôi sẽ thêm một route test ở backend hoặc dùng chính socket để test
      socket.emit('test_notification', { message: 'Đây là thông báo thử nghiệm!' });
    } else {
      toast.error("Socket chưa kết nối!");
      socket.connect();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu /></button>
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-500" />
          <input type="text" className="w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-slate-50 text-sm focus:bg-white outline-none focus:ring-1 focus:ring-brand-500" placeholder="Tìm kiếm..." />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Nút Test Socket */}
        <button 
          onClick={testSocket}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-amber-100"
          title="Test Real-time Notification"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-500" />
          <span className="hidden xl:inline">Test Socket</span>
        </button>

        {/* Nút Xem cửa hàng mới */}
        <Link 
          to="/" 
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all border border-transparent hover:border-brand-100"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Xem cửa hàng</span>
        </Link>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hệ thống ổn định</span>
        </div>
      </div>
    </header>
  );
};