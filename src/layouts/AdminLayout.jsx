import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { BulkActionProvider } from '../contexts/BulkActionContext';
import BulkActionBar from '../components/common/BulkActionBar';
import socket from '../utils/socket';
import toast from 'react-hot-toast';

export const AdminLayout = () => {
  useEffect(() => {
    // Kết nối socket
    socket.connect();

    // Tham gia phòng Admin để nhận thông báo
    socket.emit('join_admin_room');

    socket.on('welcome', (data) => {
      console.log("👋 [SOCKET] Welcome:", data.message);
    });

    socket.on('joined_confirmation', (data) => {
      console.log("🛡️ [SOCKET] Room Joined:", data.room);
      toast.success("Đã kết nối kênh thông báo Real-time", { id: 'socket-conn' });
    });

    // Lắng nghe sự kiện đơn hàng mới
    socket.on('new_order', (data) => {
      console.log("📢 [SOCKET] New Order Received:", data);
      
      // Hiển thị thông báo Toast
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-brand-600`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-black text-xs">
                  NEW
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Đơn hàng mới!
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {data.customerName} vừa đặt đơn {data.orderNumber}
                </p>
                <p className="mt-1 text-[10px] font-black text-brand-600">
                  Tổng tiền: {data.totalAmount.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-black text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              Đóng
            </button>
          </div>
        </div>
      ), { duration: 8000 });

      // Có thể phát âm thanh thông báo ở đây nếu muốn
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.play().catch(e => console.log("Audio play failed:", e));
    });

    return () => {
      socket.off('new_order');
      socket.disconnect();
    };
  }, []);

  return (
    <BulkActionProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader /> 
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet /> 
            </div>
          </main>
        </div>
        <BulkActionBar />
      </div>
    </BulkActionProvider>
  );
};