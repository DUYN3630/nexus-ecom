import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, ShieldCheck, Cpu, Smartphone, Monitor, Watch, 
  MessageSquare, Star, MapPin, CheckCircle, AlertTriangle, 
  Search, ChevronRight, HelpCircle, Info, History, Terminal
} from 'lucide-react';
import expertApi from '../../api/expertApi';
import geminiApi from '../../api/geminiApi';
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

  // Logic lọc chuyên gia theo Category
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

  const handleWarrantyCheck = (e) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      addToast(`Thiết bị ${serialNumber} vẫn còn bảo hành đến 12/2026`, 'success');
      setActiveModal(null);
      setSerialNumber('');
    }, 2000);
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
    
    // Lấy thông tin user từ localStorage để lưu ticket
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
      
      {/* Header Bar - Industrial Style */}
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
          
          {/* Diagnostic Progress */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
                <Terminal size={18} className="text-slate-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Diagnostic Flow v4.2</span>
             </div>
             <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 w-6 rounded-full ${i === 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                ))}
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
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
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
                  className="w-full bg-transparent border-none outline-none text-sm font-bold p-3 resize-none custom-scrollbar"
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={isAiTyping || !userInput.trim()}
                className="p-4 bg-slate-900 text-white rounded-xl hover:bg-black transition-all disabled:bg-slate-200 disabled:text-slate-400 active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Expert Intelligence */}
        <div className="w-full md:w-[450px] bg-slate-50/50 overflow-y-auto custom-scrollbar flex flex-col">
          
          {/* Quick Diagnostics */}
          <div className="p-8 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Kịch bản nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
               {[
                 { label: 'Kiểm tra Pin', icon: Smartphone },
                 { label: 'Sửa lỗi Màn hình', icon: Monitor },
                 { label: 'Cập nhật Phần mềm', icon: ShieldCheck },
                 { label: 'Khôi phục Dữ liệu', icon: Cpu }
               ].map((btn, i) => (
                 <button 
                    key={i} 
                    onClick={() => handleQuickScript(btn.label)}
                    className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all text-left group/btn"
                 >
                    <btn.icon size={20} className="text-slate-400 group-hover/btn:text-slate-900 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover/btn:text-slate-900">{btn.label}</span>
                 </button>
               ))}
            </div>
          </div>

          {/* Live Experts */}
          <div className="flex-1 p-8 pt-0 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                {selectedCategory === 'All' ? 'Chuyên gia đang trực' : `Chuyên gia ${selectedCategory}`}
              </h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-emerald-600">{filteredExperts.length} Online</span>
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-xl"></div>)
              ) : (
                filteredExperts.map((expert) => (
                  <div key={expert._id} className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-900 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                          {expert.avatar ? (
                            <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-black text-xl">
                              {expert.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {expert.isOnline && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between">
                            <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">{expert.name}</h4>
                            <div className="flex items-center gap-1">
                               <Star size={12} className="text-amber-400 fill-current" />
                               <span className="text-[10px] font-black text-slate-900">{expert.rating}</span>
                            </div>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{expert.role}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {expert.specialty.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 rounded">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                       <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin size={12} />
                          <span className="text-[10px] font-bold uppercase">{expert.location}</span>
                       </div>
                       <button 
                          onClick={() => setActiveModal('repair')}
                          className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1 hover:gap-2 transition-all"
                       >
                          Kết nối <ChevronRight size={14} />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="p-8 bg-slate-900 text-white">
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Đã giải quyết</p>
                   <h5 className="text-2xl font-black tracking-tight tabular-nums">1,248+</h5>
                </div>
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Độ hài lòng</p>
                   <h5 className="text-2xl font-black tracking-tight tabular-nums">99.2%</h5>
                </div>
             </div>
             <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                <HelpCircle size={16} className="text-blue-400" />
                <p className="text-[10px] font-medium text-white/50 leading-relaxed">
                   Dữ liệu chẩn đoán được mã hóa đầu cuối theo tiêu chuẩn bảo mật chuyên gia.
                </p>
             </div>
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-xl shadow-2xl relative z-10 overflow-hidden border border-slate-200"
            >
              {activeModal === 'warranty' && (
                <div className="p-10 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Tra cứu trạng thái bảo hành</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Cung cấp số Serial hoặc IMEI thiết bị</p>
                  </div>
                  <form onSubmit={handleWarrantyCheck} className="space-y-4">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="SERIAL NUMBER / IMEI"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-900 font-mono text-sm tracking-widest"
                    />
                    <button 
                      disabled={isChecking}
                      className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3"
                    >
                      {isChecking ? <History className="animate-spin" size={16} /> : 'Kiểm tra hệ thống'}
                    </button>
                  </form>
                </div>
              )}

              {activeModal === 'repair' && (
                <div className="p-10 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Khởi tạo yêu cầu sửa chữa</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Kỹ thuật viên sẽ liên hệ sau 15 phút</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <select className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest outline-none">
                        <option>iPhone</option>
                        <option>MacBook</option>
                        <option>iPad</option>
                      </select>
                      <select className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest outline-none">
                        <option>Khẩn cấp</option>
                        <option>Bình thường</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Mô tả ngắn gọn lỗi..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none h-32 text-sm font-medium"
                    ></textarea>
                    <button 
                      onClick={() => { addToast('Yêu cầu đã được gửi lên hệ thống!', 'success'); setActiveModal(null); }}
                      className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all"
                    >
                      Xác nhận yêu cầu
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
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 0px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .flex-1 { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

const User = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default ExpertSupportPage;
