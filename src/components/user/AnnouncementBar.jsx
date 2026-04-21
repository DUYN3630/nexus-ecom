import React, { useState, useEffect } from 'react';
import { X, Truck, CreditCard, Gift, Sparkles } from 'lucide-react';

/**
 * AnnouncementBar: Thanh thông báo siêu nhỏ trên cùng của website.
 * Mục tiêu: Thúc đẩy chuyển đổi bằng các thông tin giá trị (Freeship, Trả góp...).
 */
const MESSAGES = [
  { icon: Truck, text: "Free ship đơn hàng từ 2.000.000đ", color: "text-blue-400" },
  { icon: CreditCard, text: "Trả góp 0% lãi suất – Duyệt trong 5 phút", color: "text-emerald-400" },
  { icon: Sparkles, text: "Ưu đãi cuối tuần – Giảm thêm 500k cho iPhone", color: "text-amber-400" },
];

const AnnouncementBar = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tự động xoay vòng thông báo sau mỗi 4 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = MESSAGES[currentIndex];

  return (
    <div className="bg-slate-900 text-white h-9 fixed top-0 left-0 right-0 z-[102] flex items-center justify-center overflow-hidden transition-all duration-300">
      {/* Texture nền tinh tế - Sử dụng SVG data URI để tránh lỗi 403 từ server ngoài */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-10 w-full flex justify-center relative z-10">
        <div 
          key={currentIndex} 
          className="flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-700 ease-out"
        >
          <currentMessage.icon size={13} className={currentMessage.color} />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-100">
            {currentMessage.text}
          </span>
        </div>
      </div>

      {/* Nút đóng thu nhỏ, không gây cản trở trải nghiệm */}
      <button 
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-all duration-300 active:scale-90"
        aria-label="Close announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AnnouncementBar;