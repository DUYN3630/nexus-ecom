import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, ShieldCheck, Cpu, Smartphone, Monitor, Watch, 
  MessageSquare, Star, MapPin, CheckCircle, AlertTriangle, 
  Search, ChevronRight, HelpCircle, Info, History, Terminal,
  User
} from 'lucide-react';
import expertApi from '../../api/expertApi';
import geminiApi from '../../api/geminiApi';
import supportApi from '../../api/supportApi';
import { useToast } from '../../contexts/ToastContext';

const ExpertSupportPage = () => {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'warranty' | 'repair' | null
  const [serialNumber, setSerialNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmittingRepair, setIsSubmittingRepair] = useState(false);

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
  const chatEndRef = useRef(null);
  const { addToast } = useToast();

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

  const handleSendMessage = async () => {
    if (!userInput.trim() || isAiTyping) return;
    const userMessage = userInput.trim();
    triggerAutoSend(userMessage);
    setUserInput('');
  };

  const triggerAutoSend = async (message) => {
    if (isAiTyping) return;
    const newMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newMessages);
    setIsAiTyping(true);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id;

    try {
      const response = await geminiApi.chatWithAi(message, 'NEXUS_EXPERT_SUPPORT_INSTRUCTION', userId);
      setChatMessages([...newMessages, { role: 'ai', content: response.text }]);
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
            <AnimatePresence>
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`group flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border ${
                      msg.role === 'user' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {msg.role === 'user' ? <User size={18} /> : <Cpu size={18} />}
                    </div>
                    <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                       <div className={`p-5 rounded-xl text-sm leading-relaxed font-medium shadow-sm border ${
                          msg.role === 'user' 
                            ? 'bg-slate-900 text-white border-slate-800' 
                            : 'bg-[#F8F9FA] text-slate-700 border-slate-100'
                        }`}>
                          {msg.content}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
            <div className="max-w-3xl mx-auto flex items-end gap-4 relative">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:bg-white transition-all overflow-hidden p-2">
                <textarea 
                  rows="1"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Nhập triệu chứng hoặc mã lỗi thiết bị..."
                  className="w-full bg-transparent border-none outline-none text-sm font-bold p-3 resize-none"
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={isAiTyping || !userInput.trim()}
                className="p-4 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Expert Intelligence */}
        <div className="w-full md:w-[450px] bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col p-8 space-y-8">
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
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      {expert.avatar ? <img src={expert.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-black">{expert.name.charAt(0)}</div>}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black uppercase tracking-tight">{expert.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{expert.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setRepairForm({...repairForm, selectedExpertId: expert._id});
                      setActiveModal('repair');
                    }}
                    className="mt-4 w-full py-2 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Kết nối ngay
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

              {activeModal === 'repair' && (
                <div className="p-10 space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-center">Yêu cầu sửa chữa</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <select value={repairForm.deviceType} onChange={(e) => setRepairForm({...repairForm, deviceType: e.target.value})} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase outline-none">
                        <option>iPhone</option><option>MacBook</option><option>iPad</option><option>Watch</option>
                      </select>
                      <select value={repairForm.urgency} onChange={(e) => setRepairForm({...repairForm, urgency: e.target.value})} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase outline-none">
                        <option>Normal</option><option>Urgent</option>
                      </select>
                    </div>
                    <textarea placeholder="Mô tả ngắn gọn lỗi..." value={repairForm.description} onChange={(e) => setRepairForm({...repairForm, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none h-32 text-sm font-medium" />
                    <button onClick={handleRepairSubmit} disabled={isSubmittingRepair} className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all">
                      {isSubmittingRepair ? 'Đang gửi...' : 'Xác nhận yêu cầu'}
                    </button>
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
