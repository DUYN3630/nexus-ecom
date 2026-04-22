import { useState, useRef, useEffect } from 'react';
import geminiApi from '../../api/geminiApi';
import { Send, Bot, User, Loader2, Eraser, Sparkles } from 'lucide-react';

export const AIChatBox = ({ currentSettings }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { text: "Chào Admin! Tôi đã sẵn sàng thử nghiệm với cấu hình bạn thiết lập. Hãy thử nhắn tin cho tôi nhé!", isUser: false, timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = { text: prompt, isUser: true, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setPrompt('');

    try {
      // Gọi API với TOÀN BỘ cấu hình hiện tại từ trang AI Hub
      const response = await geminiApi.chatWithAi(
        prompt, 
        currentSettings?.ai_system_instruction,
        {
          modelName: currentSettings?.ai_model_name,
          temperature: currentSettings?.ai_temperature,
          maxOutputTokens: currentSettings?.ai_max_tokens
        }
      );
      
      setMessages((prev) => [...prev, { text: response.text, isUser: false, timestamp: new Date() }]);
    } catch (error) {
      console.error('Playground Chat Error:', error);
      setMessages((prev) => [...prev, { text: 'Dạ, hiện tại em đang gặp chút trục trặc về cấu hình. Bạn hãy kiểm tra lại API Key hoặc Model Name nhé!', isUser: false, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ text: "Đã xóa lịch sử thử nghiệm. Tôi sẵn sàng cho cấu hình mới!", isUser: false, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-slate-900 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tighter italic">AI Playground</h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Live Testing</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"><Eraser size={18} /></button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.isUser ? 'bg-slate-900' : 'bg-white border border-slate-200'
              }`}>
                {msg.isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-brand-600" />}
              </div>
              <div className={`space-y-1 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${
                  msg.isUser 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><Loader2 size={16} className="text-brand-600 animate-spin" /></div>
            <div className="flex gap-1">
               <div className="w-1 h-1 bg-brand-400 rounded-full animate-bounce"></div>
               <div className="w-1 h-1 bg-brand-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-1 h-1 bg-brand-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-6 border-t bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Nhập câu hỏi để thử cấu hình vừa sửa..."
            className="w-full pl-4 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
              prompt.trim() && !isLoading ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-slate-200 text-slate-400'
            }`}
            disabled={!prompt.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
