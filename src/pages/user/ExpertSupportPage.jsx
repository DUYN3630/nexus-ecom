import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, ShieldCheck, Cpu, Smartphone, Monitor, Watch, 
  MessageSquare, Star, MapPin, CheckCircle, AlertTriangle, 
  Search, ChevronRight, HelpCircle, Info, History, Terminal,
  User, Loader2, StarHalf, Camera, X, AlertCircle, DollarSign
} from 'lucide-react';
import expertApi from '../../api/expertApi';
import geminiApi from '../../api/geminiApi';
import supportApi from '../../api/supportApi';
import ticketApi from '../../api/ticketApi';
import appointmentApi from '../../api/appointmentApi';
import { useToast } from '../../contexts/ToastContext';

const ExpertSupportPage = () => {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  
  // Tracking & Ticket state
  const [repairData, setRepairData] = useState(null);
  const [trackingPhone, setTrackingPhone] = useState('');
  const [hasCreatedTicket, setHasCreatedTicket] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'warranty' | 'repair' | 'appointment' | null
  const [serialNumber, setSerialNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmittingRepair, setIsSubmittingRepair] = useState(false);
  
  // Appointment state
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  // Form sửa chữa
  const [repairForm, setRepairForm] = useState({
    deviceType: 'iPhone',
    urgency: 'Normal',
    description: '',
    selectedExpertId: null
  });

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Hệ thống đã sẵn sàng. Vui lòng mô tả tình trạng thiết bị của bạn để bắt đầu chẩn đoán kỹ thuật.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sessionId, setSessionId] = useState(localStorage.getItem('nexus_chat_session') || `sess_${Math.random().toString(36).substr(2, 9)}`);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  // Lưu sessionId
  useEffect(() => {
    localStorage.setItem('nexus_chat_session', sessionId);
  }, [sessionId]);

  // Khôi phục hội thoại cũ khi load trang
  useEffect(() => {
    const restoreHistory = async () => {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      try {
        const res = await ticketApi.getHistory({ 
          userId: user?._id || user?.id, 
          sessionId: sessionId 
        });
        
        if (res.success && res.data) {
          if (res.data.phoneNumber) {
             setTrackingPhone(res.data.phoneNumber);
             localStorage.setItem('nexus_support_phone', res.data.phoneNumber);
          }
          
          if (res.data.chatHistory && res.data.chatHistory.length > 0) {
            const formattedHistory = res.data.chatHistory.map(m => ({
              role: m.role,
              content: m.content,
              image: m.image
            }));
            setChatMessages(formattedHistory);
          }
        }
      } catch (error) {
        console.error("Restore History Error:", error);
      }
    };
    restoreHistory();
  }, [sessionId]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const data = await expertApi.getAll();
        setExperts(data);
        setFilteredExperts(data);
      } catch (error) {
        addToast('Lỗi truy xuất danh mục chuyên gia', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperts();
  }, []);

  // Real-time Tracking
  useEffect(() => {
    let interval;
    const cleanPhone = trackingPhone?.trim();
    
    if (cleanPhone && cleanPhone.length >= 10) {
      const fetchStatus = async () => {
        try {
          console.log('Attempting to track phone:', cleanPhone);
          const response = await supportApi.getRepairByPhone(cleanPhone);
          // supportApi uses axiosClient which returns data directly due to interceptors
          // but sometimes we might get the full response depending on how it's handled
          const data = response?.data !== undefined ? response.data : response;
          console.log('Tracking response:', data);
          setRepairData(data);
        } catch (error) {
          console.error("Tracking Error Detail:", {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
          });
        }
      };
      
      fetchStatus();
      interval = setInterval(fetchStatus, 30000); // Poll every 30s
    } else {
      setRepairData(null);
    }
    return () => clearInterval(interval);
  }, [trackingPhone]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredExperts(experts);
    } else {
      setFilteredExperts(experts.filter(exp => 
        exp.specialty.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()))
      ));
    }
  }, [selectedCategory, experts]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    if (activeModal === 'appointment' && repairForm.selectedExpertId) {
      const fetchSlots = async () => {
        try {
          const res = await appointmentApi.getExpertAvailability(repairForm.selectedExpertId, appointmentDate);
          setAvailableSlots(res.data.availableSlots || []);
        } catch (error) {
          console.error("Fetch slots error:", error);
          setAvailableSlots([]);
        }
      };
      fetchSlots();
    }
  }, [appointmentDate, repairForm.selectedExpertId, activeModal]);

  const handleAppointmentSubmit = async (slot) => {
    setIsBooking(true);
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      const payload = {
        expertId: repairForm.selectedExpertId,
        date: appointmentDate,
        slot,
        deviceType: repairForm.deviceType,
        notes: repairForm.description,
        guestInfo: !user ? { name: 'Khách vãng lai', phone: trackingPhone || '0000000000' } : undefined
      };

      await appointmentApi.create(payload);
      addToast('Đặt lịch hẹn thành công!', 'success');
      setActiveModal(null);
    } catch (error) {
      console.error("Booking error:", error);
      addToast(error.response?.data?.message || 'Không thể đặt lịch lúc này', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const handleWarrantyCheck = async (e) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;
    
    setIsChecking(true);
    try {
      const response = await supportApi.checkWarranty(serialNumber);
      const date = new Date(response.expiryDate).toLocaleDateString('vi-VN');
      const statusText = response.status === 'active' ? 'vẫn còn bảo hành' : 'đã hết hạn bảo hành';
      
      addToast(`Thiết bị ${response.deviceName} ${statusText} đến ngày ${date}`, 'success');
      setActiveModal(null);
      setSerialNumber('');
    } catch (error) {
      addToast(error.response?.data?.message || 'Không tìm thấy số Serial này', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRepairSubmit = async () => {
    if (!repairForm.description.trim()) {
      addToast('Vui lòng mô tả lỗi thiết bị', 'warning');
      return;
    }

    setIsSubmittingRepair(true);
    try {
      // Lấy thông tin user từ localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      const payload = {
        ...repairForm,
        userId: user?._id || user?.id, // Đảm bảo lấy đúng trường ID
        guestInfo: !user ? { name: 'Khách vãng lai', phone: '0000000000' } : undefined
      };

      console.log("--- [DEBUG] Sending Repair Payload ---", payload);

      await supportApi.submitRepair(payload);
      addToast('Yêu cầu sửa chữa đã được gửi lên hệ thống!', 'success');
      setActiveModal(null);
      setRepairForm({ deviceType: 'iPhone', urgency: 'Normal', description: '', selectedExpertId: null });
    } catch (error) {
      console.error("Submit Repair Error:", error);
      addToast('Không thể gửi yêu cầu lúc này', 'error');
    } finally {
      setIsSubmittingRepair(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Vui lòng chọn file hình ảnh', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleSendMessage = async () => {
    if ((!userInput.trim() && !selectedImage) || isAiTyping) return;
    const userMessage = userInput.trim();
    triggerAutoSend(userMessage, selectedImage);
    setUserInput('');
    setSelectedImage(null);
  };

  const triggerAutoSend = async (message, image = null) => {
    if (isAiTyping) return;

    // Detect Phone Number (10 digits)
    const phoneMatch = message.match(/\b\d{10}\b/);
    if (phoneMatch && !hasCreatedTicket && !isCreatingTicket) {
      const detectedPhone = phoneMatch[0];
      setTrackingPhone(detectedPhone);
      localStorage.setItem('nexus_support_phone', detectedPhone);
      
      // Auto Ticket Creation
      setIsCreatingTicket(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        await ticketApi.create({
          phoneNumber: detectedPhone,
          deviceType: repairForm.deviceType,
          subject: `Hỗ trợ kỹ thuật - ${detectedPhone}`,
          chatHistory: chatMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user?._id || user?.id,
          priority: 'medium'
        });
        setHasCreatedTicket(true);
        addToast('Hệ thống đã tự động tạo phiếu hỗ trợ cho bạn', 'success');
      } catch (err) {
        console.error("Auto Ticket Error:", err);
      } finally {
        setIsCreatingTicket(false);
      }
    }

    const newMessageObj = { role: 'user', content: message };
    if (image) {
      newMessageObj.image = image; // For UI display
    }
    const newMessages = [...chatMessages, newMessageObj];
    setChatMessages(newMessages);
    setIsAiTyping(true);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id;

    try {
      const response = await geminiApi.chatWithAi(message || "Vui lòng phân tích hình ảnh này và đưa ra chẩn đoán lỗi, kèm theo báo giá sửa chữa nếu có.", {
        customInstruction: 'NEXUS_EXPERT_SUPPORT_INSTRUCTION',
        userId: userId,
        sessionId: sessionId,
        image: image
      });
      setChatMessages([...newMessages, { role: 'ai', content: response.text || response.data?.text || "Đã nhận được phản hồi" }]);
    } catch (error) {
      addToast('Mất kết nối với AI Support', 'error');
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleQuickScript = (label) => {
    const scriptMap = {
      'Kiểm tra Pin': 'Tôi muốn kiểm tra tình trạng Pin và hiệu năng nguồn của thiết bị.',
      'Sửa lỗi Màn hình': 'Màn hình của tôi gặp vấn đề về hiển thị, vui lòng hướng dẫn chẩn đoán.',
      'Cập nhật Phần mềm': 'Tôi gặp lỗi khi cập nhật phiên bản iOS/macOS mới.',
      'Khôi phục Dữ liệu': 'Tôi cần hỗ trợ về việc sao lưu và khôi phục dữ liệu bị mất.'
    };
    if (scriptMap[label]) {
      triggerAutoSend(scriptMap[label]);
    }
  };

  const RepairTrackingWidget = () => {
    if (trackingPhone && !repairData && !isAiTyping) {
       return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700 text-xs font-bold">
             <AlertTriangle size={16} />
             Hệ thống không tìm thấy đơn hàng nào khớp với SĐT: {trackingPhone}. Vui lòng kiểm tra lại.
          </motion.div>
       );
    }

    if (!repairData) return null;

    const steps = [
      { key: 'Confirmed', label: 'Xác nhận' },
      { key: 'Repairing', label: 'Sửa chữa' },
      { key: 'Testing', label: 'Kiểm tra' },
      { key: 'Done', label: 'Hoàn tất' },
      { key: 'Returned', label: 'Trả máy' }
    ];

    const getStatusIndex = (status) => {
      return steps.findIndex(s => s.key === status);
    };
    
    const getStatusText = (status) => {
      const map = {
        'Pending': 'Đang chờ tiếp nhận...',
        'Confirmed': 'Đã xác nhận - Đang chờ xử lý',
        'Repairing': 'Đang trong quá trình sửa chữa',
        'Testing': 'Đang kiểm tra chất lượng cuối cùng',
        'Done': 'Sửa chữa hoàn tất - Chờ bàn giao',
        'Returned': 'Đã bàn giao cho khách hàng',
        'AwaitingApproval': 'Chờ khách duyệt báo giá'
      };
      return map[status] || status;
    };

    const handleApproveRepair = async () => {
      // ... (rest of methods)
    };

    const handlePayment = async () => {
      // ... (rest of methods)
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={120} className="text-slate-900" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Live Repair Tracking</span>
              </div>
              <h4 className="text-slate-900 text-xl font-black uppercase tracking-tight">{repairData.ticketNumber}</h4>
              <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-wider">{getStatusText(repairData.status)}</p>
            </div>

            <div className="flex-1 max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, idx) => {
                  const currentIdx = getStatusIndex(repairData.status);
                  const isCompleted = currentIdx >= idx;
                  const isCurrent = repairData.status === step.key;
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-3 relative flex-1">
                      {idx < steps.length - 1 && (
                        <div className={`absolute top-2.5 left-1/2 w-full h-[2px] z-0 ${
                          currentIdx > idx ? 'bg-emerald-500' : 'bg-slate-200'
                        }`} />
                      )}
                      
                      <div className={`w-5 h-5 rounded-full z-10 flex items-center justify-center transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-200'
                      }`}>
                        {isCompleted && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className={`text-[7px] font-black uppercase tracking-tighter text-center w-full px-1 ${
                        isCurrent ? 'text-slate-900' : 'text-slate-400'
                      }`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons for Customer */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
             {repairData.status === 'AwaitingApproval' && (
               <button 
                 onClick={handleApproveRepair}
                 className="px-6 py-3 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/10"
               >
                 <CheckCircle size={14} /> Xác nhận báo giá & Sửa ngay
               </button>
             )}
             {repairData.status === 'Done' && (
               <button 
                 onClick={handlePayment}
                 className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
               >
                 <DollarSign size={14} /> Thanh toán chi phí sửa chữa
               </button>
             )}
             <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Tổng chi phí dự kiến</span>
                <span className="text-sm font-black text-brand-600">{(repairData.estimatedCost || 0).toLocaleString()}đ</span>
             </div>
          </div>

          {/* Progress Images */}
          {repairData.progressImages && repairData.progressImages.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                 <Terminal size={12} /> Nhật ký hình ảnh từ Chuyên gia
               </p>
               <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {repairData.progressImages.map((img, idx) => (
                    <div key={idx} className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 group relative">
                       <img src={img.url} alt="Progress" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <p className="text-[8px] text-white font-bold truncate">{img.caption}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {repairData.expertResponse && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Lời nhắn từ Chuyên gia</p>
               <p className="text-slate-700 text-xs font-medium italic leading-relaxed">&quot;{repairData.expertResponse}&quot;</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-24 pb-0 px-0 font-sans text-slate-900 overflow-hidden flex flex-col relative">
      
      {/* Header Bar */}
      <div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md z-30">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="cursor-pointer" onClick={() => setSelectedCategory('All')}>
              <h1 className="text-xl font-black uppercase tracking-tighter">Support <span className="text-slate-400">Genius</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Active</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="hidden md:flex gap-8">
              {['iPhone', 'Mac', 'iPad', 'Watch'].map(item => (
                <button 
                  key={item} 
                  onClick={() => setSelectedCategory(item)}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${
                    selectedCategory === item ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {item}
                  {selectedCategory === item && (
                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setActiveModal('warranty')}
                className="px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
             >
                Tra cứu bảo hành
             </button>
             <button 
                onClick={() => setActiveModal('repair')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
             >
                Gửi yêu cầu sửa chữa
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-[1440px] mx-auto w-full h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Column: Diagnostics Terminal */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
                <Terminal size={18} className="text-slate-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Diagnostic Flow v4.2</span>
             </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
            <RepairTrackingWidget />
            <AnimatePresence>
              {chatMessages.map((msg, idx) => {
                const isExpert = msg.content.startsWith('[Expert');
                const isAI = msg.role === 'ai' && !isExpert;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`group flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 border-slate-800 text-white' 
                          : isExpert 
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {msg.role === 'user' ? <User size={18} /> : isExpert ? <ShieldCheck size={18} /> : <Cpu size={18} />}
                      </div>
                      <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                         {msg.image && (
                           <div className="mb-2">
                             <img src={msg.image} alt="User Upload" className="max-w-xs rounded-xl border border-slate-200" />
                           </div>
                         )}
                         <div className={`p-5 rounded-xl text-sm leading-relaxed font-medium shadow-sm border ${
                            msg.role === 'user' 
                              ? 'bg-slate-900 text-white border-slate-800' 
                              : isExpert
                                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-100'
                                : 'bg-[#F8F9FA] text-slate-700 border-slate-100'
                          }`}>
                            {msg.content}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {isAiTyping && (
              <div className="flex justify-start items-center gap-3 text-slate-400">
                <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center animate-pulse">
                  <Cpu size={18} />
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-8 bg-white border-t border-slate-200">
            {selectedImage && (
              <div className="mb-4 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border border-slate-200" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="max-w-3xl mx-auto flex items-end gap-4 relative">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-all"
              >
                <Camera size={20} />
              </button>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:bg-white transition-all overflow-hidden p-2">
                <textarea 
                  rows="1"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Nhập triệu chứng hoặc tải ảnh lỗi thiết bị..."
                  className="w-full bg-transparent border-none outline-none text-sm font-bold p-3 resize-none"
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={isAiTyping || (!userInput.trim() && !selectedImage)}
                className="p-4 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Expert Intelligence */}
        <div className="w-full md:w-[450px] bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col p-8 space-y-8 text-left">
          {/* Tracking Search Area */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Theo dõi đơn hàng</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">Nhập số điện thoại để xem tiến độ sửa chữa thời gian thực</p>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="09xx..." 
                    value={trackingPhone}
                    onChange={(e) => setTrackingPhone(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none focus:border-slate-900 transition-all"
                  />
                  <button 
                    onClick={() => addToast('Đang đồng bộ dữ liệu...', 'info')}
                    className="p-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-all"
                  >
                    <Search size={16} />
                  </button>
               </div>
               {repairData && (
                 <div className="pt-2 flex items-center gap-2 text-emerald-600">
                    <CheckCircle size={12} />
                    <span className="text-[9px] font-black uppercase">Đang kết nối: {repairData.ticketNumber}</span>
                 </div>
               )}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Kịch bản nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
               {['Kiểm tra Pin', 'Sửa lỗi Màn hình', 'Cập nhật Phần mềm', 'Khôi phục Dữ liệu'].map((label, i) => (
                 <button 
                    key={i} 
                    onClick={() => handleQuickScript(label)}
                    className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-900 transition-all group"
                 >
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{label}</span>
                 </button>
               ))}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Chuyên gia đang trực</h3>
            <div className="space-y-4">
              {filteredExperts.map((expert) => (
                <div key={expert._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-900 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all flex items-center justify-center">
                      {expert.avatar ? (
                        <img src={expert.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-black uppercase">
                          {expert.name?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black uppercase tracking-tight">{expert.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{expert.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setRepairForm({...repairForm, selectedExpertId: expert._id});
                      setActiveModal('appointment');
                    }}
                    className="mt-4 w-full py-2 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Đặt lịch hẹn
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-lg rounded-xl shadow-2xl relative z-10 overflow-hidden border border-slate-200">
              {activeModal === 'warranty' && (
                <div className="p-10 space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-center">Tra cứu bảo hành</h3>
                  <form onSubmit={handleWarrantyCheck} className="space-y-4">
                    <input autoFocus type="text" placeholder="SERIAL NUMBER / IMEI" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value.toUpperCase())} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-900 font-mono text-sm tracking-widest" />
                    <button disabled={isChecking} className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3">
                      {isChecking ? <History className="animate-spin" size={16} /> : 'Kiểm tra hệ thống'}
                    </button>
                  </form>
                </div>
              )}

              {activeModal === 'appointment' && (
                <div className="p-10 space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-center">Đặt lịch chuyên gia</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <select value={repairForm.deviceType} onChange={(e) => setRepairForm({...repairForm, deviceType: e.target.value})} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase outline-none">
                        <option>iPhone</option><option>MacBook</option><option>iPad</option><option>Watch</option>
                      </select>
                      <input 
                        type="date" 
                        value={appointmentDate} 
                        onChange={(e) => setAppointmentDate(e.target.value)} 
                        min={new Date().toISOString().split('T')[0]}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase outline-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Khung giờ trống</label>
                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {availableSlots.map(slot => (
                            <button 
                              key={slot} 
                              onClick={() => handleAppointmentSubmit(slot)}
                              disabled={isBooking}
                              className="py-2 px-3 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Không có khung giờ trống trong ngày này.</p>
                      )}
                    </div>

                    <textarea placeholder="Ghi chú thêm..." value={repairForm.description} onChange={(e) => setRepairForm({...repairForm, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none h-24 text-sm font-medium" />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 0px; }
      `}} />
    </div>
  );
};

export default ExpertSupportPage;
