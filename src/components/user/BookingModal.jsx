import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import expertApi from '../../api/expertApi';
import { useToast } from '../../contexts/ToastContext';

const BookingModal = ({ expert, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const { addToast } = useToast();

  // Simple Calendar Logic
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!expert?._id || !selectedDate) return;
      setIsLoading(true);
      try {
        const res = await expertApi.getAvailability(expert._id, selectedDate);
        setAvailableSlots(res.availableSlots);
        setSelectedSlot(null);
      } catch (error) {
        addToast('Không thể lấy lịch trình của chuyên gia', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDate, expert?._id]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await expertApi.bookAppointment({
        expertId: expert._id,
        date: selectedDate,
        slot: selectedSlot,
        notes,
        deviceType: 'Device', // Can be refined
        guestInfo: !user ? { name: 'Guest', phone: '0000000000' } : undefined
      });
      addToast('Đặt lịch hẹn thành công!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      addToast(error.response?.data?.message || 'Lỗi khi đặt lịch', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Padding for first day
    for (let i = 0; i < firstDay; i++) days.push(null);
    
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(d);
    }
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date && date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!date) return false;
    const dStr = date.toISOString().split('T')[0];
    return dStr === selectedDate;
  };

  const isPast = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[800px]"
      >
        {/* Left Side: Info */}
        <div className="w-full md:w-80 bg-slate-900 p-8 text-white flex flex-col">
           <div className="flex justify-between items-center mb-10 md:hidden">
              <h2 className="text-lg font-black uppercase tracking-tighter">Đặt lịch hẹn</h2>
              <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
           </div>

           <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-white/10 overflow-hidden mb-4 border border-white/10">
                 {expert.avatar ? (
                    <img src={expert.avatar} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black">{expert.name.charAt(0)}</div>
                 )}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">{expert.name}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{expert.role}</p>
           </div>

           <div className="flex-1 space-y-6">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Địa điểm</p>
                 <p className="text-sm font-bold">{expert.location || 'Nexus Store - Flagship'}</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thời gian dự kiến</p>
                 <p className="text-sm font-bold">30 - 60 Phút / Lượt</p>
              </div>
           </div>

           <div className="hidden md:block pt-8 border-t border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Vui lòng đến đúng giờ đã hẹn. Nếu trễ quá 15 phút, lịch hẹn có thể bị hủy tự động.
           </div>
        </div>

        {/* Right Side: Selection */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tighter hidden md:block">Chọn thời gian phù hợp</h2>
              <div className="flex items-center gap-4">
                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-slate-50 rounded-lg transition-all"><ChevronLeft size={20} /></button>
                 <span className="text-sm font-black uppercase tracking-widest min-w-[120px] text-center">
                    {currentMonth.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                 </span>
                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight size={20} /></button>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-all hidden md:block"><X size={20} /></button>
           </div>

           <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                 {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="h-10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">{d}</div>
                 ))}
                 {generateDays().map((day, i) => {
                    const disabled = !day || isPast(day);
                    const selected = isSelected(day);
                    return (
                       <div key={i} className="aspect-square flex items-center justify-center p-1">
                          {day ? (
                             <button 
                                onClick={() => !disabled && setSelectedDate(day.toISOString().split('T')[0])}
                                disabled={disabled}
                                className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                   selected ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' : 
                                   disabled ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'
                                } ${isToday(day) && !selected ? 'border border-slate-200 text-slate-900' : ''}`}
                             >
                                {day.getDate()}
                             </button>
                          ) : <div />}
                       </div>
                    );
                 })}
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Clock size={14} /> Khung giờ trống
                 </h4>
                 {isLoading ? (
                    <div className="flex gap-3 animate-pulse">
                       {[1,2,3,4].map(i => <div key={i} className="h-10 w-24 bg-slate-100 rounded-lg" />)}
                    </div>
                 ) : availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                       {availableSlots.map(slot => (
                          <button 
                             key={slot}
                             onClick={() => setSelectedSlot(slot)}
                             className={`px-6 py-3 rounded-xl text-xs font-black transition-all border ${
                                selectedSlot === slot 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                             }`}
                          >
                             {slot}
                          </button>
                       ))}
                    </div>
                 ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-400 italic text-sm">
                       <AlertCircle size={18} /> Rất tiếc, chuyên gia đã hết lịch trong ngày này.
                    </div>
                 )}
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ghi chú thêm</h4>
                 <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mô tả qua vấn đề của bạn hoặc yêu cầu đặc biệt..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-900 transition-all text-sm font-medium min-h-[100px]"
                 />
              </div>
           </div>

           <div className="p-8 border-t border-slate-100 bg-slate-50/50">
              <button 
                 disabled={!selectedSlot || isSubmitting}
                 onClick={handleBook}
                 className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                 {isSubmitting ? 'Đang xử lý...' : (
                    <>
                       <CheckCircle size={18} /> Xác nhận đặt lịch
                    </>
                 )}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
