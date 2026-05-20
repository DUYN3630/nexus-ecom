import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User, Smartphone, Info, X
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import supportApi from '../../api/supportApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import aiSettingApi from '../../api/aiSettingApi';

const ExpertCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [experts, setExperts] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  // Working hours range from 07:00 to 22:00 (10 PM)
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hours = i + 7;
    return `${String(hours).padStart(2, '0')}:00`;
  });

  // Lấy danh sách Expert
  useEffect(() => {
    const initExpert = async () => {
      try {
        const response = await aiSettingApi.getExpertPerformance();
        setExperts(response);
        
        if (!isAdmin) {
          const userId = currentUser?._id || currentUser?.id;
          const myProfile = response.find(exp => (exp.user?._id || exp.user) === userId);
          setSelectedExpertId(myProfile?._id || userId);
        } else if (response.length > 0) {
          setSelectedExpertId(response[0]._id);
        }
      } catch (error) {
        console.error("Init Expert Error:", error);
      }
    };
    initExpert();
  }, [isAdmin, currentUser]);

  // Lấy dữ liệu lịch trình
  useEffect(() => {
    if (selectedExpertId) {
      fetchSchedule();
    }
  }, [selectedExpertId, currentDate]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const appData = await axiosClient.get(`/appointments/expert/${selectedExpertId}`);
      const repData = await supportApi.getExpertRepairs(selectedExpertId);

      const allEvents = [
        ...(Array.isArray(appData) ? appData : []).map(app => ({
          id: app._id,
          title: `Lịch hẹn: ${app.deviceType}`,
          customer: app.user?.name || app.guestInfo?.name,
          phone: app.user?.phone || app.guestInfo?.phone,
          time: app.slot,
          date: new Date(app.date),
          type: 'appointment',
          status: app.status,
          notes: app.notes
        })),
        ...(Array.isArray(repData) ? repData : []).filter(r => r.endTime).map(rep => {
          const end = new Date(rep.endTime);
          return {
            id: rep._id,
            title: `Hoàn thành: ${rep.deviceType}`,
            customer: rep.user?.name || rep.guestInfo?.name,
            phone: rep.user?.phone || rep.guestInfo?.phone,
            time: `${end.getHours().toString().padStart(2, '0')}:00`,
            date: end,
            type: 'repair',
            status: rep.status,
            notes: rep.description
          };
        })
      ];
      setEvents(allEvents);
    } catch (error) {
      console.error("Fetch Schedule Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekStart = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  };

  const currentWeekStart = getWeekStart(currentDate);

  const getWeekDays = (startDate) => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentWeekStart);
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getIndicatorPosition = () => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Offset by 7 hours since grid starts at 07:00
    return ((hours - 7) * 100) + (minutes / 60 * 100);
  };

  const isCurrentWeek = weekDays.some(day => isToday(day));

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden font-sans shadow-sm mb-12">
      {/* Calendar Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Lịch trình</span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Weekly Schedule</h2>
          </div>

          <div className="h-8 w-px bg-slate-100 hidden md:block"></div>

          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
            <button onClick={prevWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500">
              <ChevronLeft size={14} />
            </button>
            <span className="px-4 text-xs font-semibold text-slate-700 min-w-[150px] text-center">
              {weekDays[0].getDate()} - {weekDays[6].getDate()} Tháng {weekDays[6].getMonth() + 1}, {weekDays[6].getFullYear()}
            </span>
            <button onClick={nextWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <select 
                value={selectedExpertId}
                onChange={(e) => setSelectedExpertId(e.target.value)}
                className="bg-slate-50 text-slate-700 border border-slate-100 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/10 transition-all hover:bg-white hover:border-slate-200 cursor-pointer"
              >
                {experts.map(exp => (
                  <option key={exp._id} value={exp._id}>{exp.name}</option>
                ))}
              </select>
            </div>
          )}
          <button onClick={resetToToday} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg transition-all">Hôm nay</button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="timeline-grid sticky top-0 bg-white/95 backdrop-blur-sm z-40 border-b border-slate-100">
          <div className="h-16 flex items-center justify-center border-r border-slate-100">
            <Clock size={14} className="text-slate-300" />
          </div>
          
          {weekDays.map((day, i) => (
            <div key={i} className={`h-16 flex flex-col items-center justify-center border-r border-slate-100 ${isToday(day) ? 'bg-brand-50/30' : ''}`}>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isToday(day) ? 'text-brand-600' : 'text-slate-400'}`}>
                {dayNames[i]}
              </span>
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg mt-0.5 font-bold text-base ${isToday(day) ? 'bg-brand-600 text-white shadow-md shadow-brand-100' : 'text-slate-900'}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-grid relative max-h-[600px] overflow-y-auto custom-scrollbar">
          {timeSlots.map((slot, h) => (
            <React.Fragment key={slot}>
              {/* Time Label (Left Column) */}
              <div className="h-[80px] flex items-start justify-center border-r border-slate-100 pr-2 pt-2">
                <span className="text-[10px] font-semibold text-slate-400">{slot}</span>
              </div>

              {/* Day Cells (Columns 2-8) */}
              {weekDays.map((day, d) => {
                const dayEvents = events.filter(e => {
                  const eventHour = parseInt(e.time.split(':')[0]);
                  return e.date.toDateString() === day.toDateString() && eventHour === (h + 7);
                });

                return (
                  <div key={`${h}-${d}`} className="h-[80px] border-b border-r border-slate-100 relative group transition-colors hover:bg-slate-50/50">
                    {dayEvents.map(event => {
                      const [evH, evM] = event.time.split(':').map(Number);
                      const topOffset = (evM / 60) * 100;
                      const theme = event.type === 'appointment' 
                        ? { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', stripe: 'bg-blue-500' }
                        : { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', stripe: 'bg-indigo-500' };
                      
                      return (
                        <motion.div
                          key={event.id}
                          layoutId={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`absolute left-1 right-1 rounded-xl p-3 text-[11px] border-l-4 ${theme.bg} ${theme.text} ${theme.border} ${event.type === 'appointment' ? 'border-l-blue-500' : 'border-l-indigo-500'} shadow-sm cursor-pointer z-10 transition-all hover:shadow-md hover:z-20`}
                          style={{ top: `${topOffset + 4}px`, height: '70px' }}
                        >
                          <div className="font-bold truncate text-slate-900 mb-0.5">{event.title.split(': ')[1] || event.title}</div>
                          <div className="flex items-center gap-1 opacity-70 font-semibold text-[9px] uppercase tracking-wider mb-1.5">
                            <Clock size={10} /> {event.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                             <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center border border-slate-100 text-[10px] font-bold">
                                {event.customer?.[0]}
                             </div>
                             <span className="font-medium opacity-80 truncate">{event.customer}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          {isCurrentWeek && (
            <div 
              className="absolute left-0 right-0 h-0.5 bg-rose-500 z-30 pointer-events-none"
              style={{ top: `${getIndicatorPosition() * 0.8}px` }}
            >
              <div className="absolute -left-1 -top-1 w-2 h-2 bg-rose-500 rounded-full" />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-start overflow-hidden">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedEvent(null)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="bg-white w-full max-w-xl h-full relative z-10 border-r border-slate-200 p-8 flex flex-col shadow-2xl"
             >
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedEvent.type === 'appointment' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}></div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {selectedEvent.type === 'appointment' ? 'Appointment Detail' : 'Repair Status'}
                      </span>
                   </div>
                   <button 
                      onClick={() => setSelectedEvent(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition-all"
                   >
                      <X size={18} />
                   </button>
                </div>

                <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                   <div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{selectedEvent.title}</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-lg text-brand-600 font-bold text-xs border border-brand-100 uppercase">
                         {selectedEvent.status}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock size={12} /> Thời gian</p>
                         <p className="text-lg font-bold text-slate-900">{selectedEvent.time}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><User size={12} /> Khách hàng</p>
                         <p className="text-lg font-bold text-slate-900 truncate">{selectedEvent.customer}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Smartphone size={14} /> Thông tin liên hệ</p>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                         <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xs">{selectedEvent.customer?.[0]}</div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">{selectedEvent.customer}</p>
                            <p className="text-xs font-mono text-slate-500">{selectedEvent.phone}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Info size={14} /> Ghi chú kỹ thuật</p>
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                         <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {selectedEvent.notes || 'Không có ghi chú bổ sung.'}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="pt-8 flex items-center gap-3 border-t border-slate-100 mt-auto">
                   <button className="flex-1 h-12 bg-brand-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95">
                      Cập nhật tiến độ
                   </button>
                   <button 
                     onClick={() => setSelectedEvent(null)}
                     className="px-6 h-12 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200"
                   >
                     Đóng
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .timeline-grid {
            display: grid;
            grid-template-columns: 70px repeat(7, 1fr);
            min-width: 900px;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default ExpertCalendarPage;
