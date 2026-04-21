import { useState, useRef, useEffect } from 'react';
import { runChat } from '../../api/geminiApi';
import { Send, Bot, User, Loader2, Eraser } from 'lucide-react';

export const AIChatBox = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { text: "Chào Admin! Tôi là Nexus AI. Bạn muốn thử nghiệm cấu hình mới như thế nào?", isUser: false, timestamp: new Date() }
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
      const response = await runChat(prompt);
      setMessages((prev) => [...prev, { text: response, isUser: false, timestamp: new Date() }]);
    } catch (error) {
      console.error('Error with Gemini API:', error);
      setMessages((prev) => [...prev, { text: 'Rất tiếc, đã có lỗi xảy ra khi kết nối với AI.', isUser: false, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ text: "Đã xóa lịch sử thử nghiệm. Tôi sẵn sàng cho câu hỏi mới!", isUser: false, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Nexus AI Engine</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Trực tuyến</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
          title="Xóa cuộc trò chuyện"
        >
          <Eraser size={18} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#f8f9fa]">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.isUser ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {msg.isUser ? <User size={16} className="text-blue-600" /> : <Bot size={16} className="text-purple-600" />}
              </div>
              <div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.isUser 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] mt-1 text-gray-400 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <Loader2 size={16} className="text-purple-600 animate-spin" />
              <span className="text-xs text-gray-500 font-medium">AI đang suy nghĩ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Nhập câu hỏi để thử nghiệm AI..."
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              prompt.trim() && !isLoading 
                ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!prompt.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Nhấn Enter để gửi. AI sẽ trả lời dựa trên cấu hình bạn vừa thiết lập.
        </p>
      </div>
    </div>
  );
};
