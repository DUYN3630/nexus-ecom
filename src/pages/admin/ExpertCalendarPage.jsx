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
    <div className="flex flex-col bg-white rounded-[2rem] border border-slate-200 overflow-hidden font-sans shadow-sm mb-12">
      {/* Calendar Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lịch trình</span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Weekly Schedule</h2>
          </div>

          <div className="h-10 w-px bg-slate-100 hidden md:block"></div>

          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
            <button onClick={prevWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
              <ChevronLeft size={16} />
            </button>
            <span className="px-6 text-xs font-bold text-slate-700 min-w-[180px] text-center">
              {weekDays[0].getDate()} - {weekDays[6].getDate()} Tháng {weekDays[6].getMonth() + 1}, {weekDays[6].getFullYear()}
            </span>
            <button onClick={nextWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <select 
                value={selectedExpertId}
                onChange={(e) => setSelectedExpertId(e.target.value)}
                className="bg-slate-50 text-slate-700 border border-slate-100 text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all hover:bg-white hover:border-slate-200 cursor-pointer"
              >
                {experts.map(exp => (
                  <option key={exp._id} value={exp._id}>{exp.name}</option>
                ))}
              </select>
            </div>
          )}
          <button onClick={resetToToday} className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all">Hôm nay</button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="timeline-grid sticky top-0 bg-white/95 backdrop-blur-sm z-40 border-b border-slate-100">
          <div className="h-20 flex items-center justify-center border-r border-slate-100">
            <Clock size={16} className="text-slate-300" />
          </div>
          
          {weekDays.map((day, i) => (
            <div key={i} className={`h-20 flex flex-col items-center justify-center border-r border-slate-100 ${isToday(day) ? 'bg-indigo-50/30' : ''}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isToday(day) ? 'text-indigo-600' : 'text-slate-400'}`}>
                {dayNames[i]}
              </span>
              <div className={`w-9 h-9 flex items-center justify-center rounded-full mt-1 font-bold text-lg ${isToday(day) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-900'}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-grid relative max-h-[700px] overflow-y-auto custom-scrollbar">
          {timeSlots.map((slot, h) => (
            <React.Fragment key={slot}>
              {/* Time Label (Left Column) */}
              <div className="h-[100px] flex items-start justify-center border-r border-slate-100 pr-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400">{slot}</span>
              </div>

              {/* Day Cells (Columns 2-8) */}
              {weekDays.map((day, d) => {
                const dayEvents = events.filter(e => {
                  const eventHour = parseInt(e.time.split(':')[0]);
                  return e.date.toDateString() === day.toDateString() && eventHour === (h + 7);
                });

                return (
                  <div key={`${h}-${d}`} className="h-[100px] border-b border-r border-slate-100 relative group transition-colors hover:bg-slate-50/50">
                    {dayEvents.map(event => {
                      const [evH, evM] = event.time.split(':').map(Number);
                      const topOffset = (evM / 60) * 100;
                      const theme = event.type === 'appointment' 
                        ? { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', stripe: 'bg-emerald-500' }
                        : { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', stripe: 'bg-indigo-500' };
                      
                      return (
                        <motion.div
                          key={event.id}
                          layoutId={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`absolute left-2 right-2 rounded-2xl p-4 text-[11px] border-l-4 ${theme.bg} ${theme.text} ${theme.border} ${event.type === 'appointment' ? 'border-l-emerald-500' : 'border-l-indigo-500'} shadow-sm cursor-pointer z-10 transition-all hover:shadow-md hover:scale-[1.01] hover:z-20`}
                          style={{ top: `${topOffset + 6}px`, height: '88px' }}
                        >
                          <div className="font-bold truncate text-slate-900 mb-1">{event.title.split(': ')[1] || event.title}</div>
                          <div className="flex items-center gap-1.5 opacity-70 font-bold text-[9px] uppercase tracking-wider mb-2">
                            <Clock size={10} /> {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-slate-100 text-[10px] font-bold">
                                {event.customer?.[0]}
                             </div>
                             <span className="font-semibold opacity-80 truncate">{event.customer}</span>
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
              style={{ top: `${getIndicatorPosition()}px` }}
            >
              <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-rose-100" />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-0">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedEvent(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 30, stiffness: 200 }}
               className="bg-white w-full max-w-xl h-full relative z-10 border-l border-slate-100 p-12 flex flex-col shadow-2xl"
             >
                <button 
                   onClick={() => setSelectedEvent(null)}
                   className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                >
                   <X size={24} />
                </button>

                <div className="mb-12">
                   <div className="flex items-center gap-3 mb-6">
                      <div className={`w-3 h-3 rounded-full ${selectedEvent.type === 'appointment' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {selectedEvent.type === 'appointment' ? 'Sync Appointment' : 'Repair Protocol'}
                      </span>
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">{selectedEvent.title}</h3>
                </div>

                <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
                   <div className="grid grid-cols-2 gap-8 pb-10 border-b border-slate-100">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={12} /> execution_time</p>
                         <p className="text-2xl font-black text-slate-900 font-mono">{selectedEvent.time}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={12} /> status_report</p>
                         <p className="text-2xl font-black text-indigo-600 uppercase italic tracking-tighter">{selectedEvent.status}</p>
                      </div>
                   </div>

                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={12} /> subject_profile</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{selectedEvent.customer}</p>
                      <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl text-slate-700 font-mono text-sm font-bold border border-slate-100">
                         <Smartphone size={16} className="text-brand-500" /> {selectedEvent.phone}
                      </div>
                   </div>

                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={12} /> technical_briefing</p>
                      <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
                         <p className="text-base text-slate-600 leading-relaxed italic font-medium">
                            "{selectedEvent.notes || 'No critical technical briefings logged for this session.'}"
                         </p>
                      </div>
                   </div>
                </div>

                <div className="pt-10 flex items-center gap-4 border-t border-slate-100 mt-auto">
                   <button className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95">
                      Process_Update
                   </button>
                   <button 
                     onClick={() => setSelectedEvent(null)}
                     className="px-10 h-16 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-slate-100"
                   >
                     Exit
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .timeline-grid {
            display: grid;
            grid-template-columns: 80px repeat(7, 1fr);
            min-width: 1000px;
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
