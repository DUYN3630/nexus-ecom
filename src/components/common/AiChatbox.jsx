import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { runChat } from '../../api/geminiApi';

const AiChatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Xin chào! Tôi là trợ lý AI của Nexus. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await runChat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Xin lỗi, tôi gặp chút trục trặc. Bạn có thể thử lại sau không?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Nút bong bóng chat */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${isOpen ? 'bg-white text-black rotate-90' : 'bg-black text-white'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
        )}
      </button>

      {/* Cửa sổ chat */}
      <div className={`absolute bottom-20 right-0 w-[380px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-black/[0.05] overflow-hidden flex flex-col transition-all duration-500 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
        
        {/* Header theo style của bạn */}
        <div className="p-8 bg-black text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/20 blur-[60px] rounded-full"></div>
          <div className="relative z-10 flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Sparkles size={20} className="text-blue-400" />
             </div>
             <div>
                <h4 className="text-sm font-black uppercase tracking-widest italic">Nexus AI</h4>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Trực tuyến</span>
                </div>
             </div>
          </div>
        </div>

        {/* Danh sách tin nhắn */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9F9FB]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-black/[0.03] rounded-tl-none'}`}>
                {msg.role === 'assistant' && <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
                  <Bot size={12} /> AI Insight
                </div>}
                {msg.role === 'user' && <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <User size={12} /> Bạn
                </div>}
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-black/[0.03] rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-blue-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ô nhập liệu */}
        <form onSubmit={handleSend} className="p-6 bg-white border-t border-black/[0.03]">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi bất cứ điều gì..."
              className="w-full pl-6 pr-14 py-4 bg-[#F5F5F7] rounded-full text-xs font-bold outline-none border border-transparent focus:border-black/5 transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="absolute right-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="mt-4 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Powered by Nexus Intelligence</p>
        </form>
      </div>
    </div>
  );
};

export default AiChatbox;
