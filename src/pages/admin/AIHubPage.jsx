import React, { useState, useEffect } from 'react';
import { 
  Settings, MessageSquare, Activity, Save, RotateCcw,
  Sparkles, Bot, BrainCircuit, ShieldAlert, Ticket, Users, 
  TrendingUp, ThumbsUp, AlertCircle, CheckCircle2, Search,
  ArrowRight, UserCheck, Clock, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import aiSettingApi from '../../api/aiSettingApi';
import { AIChatBox } from '../../components/admin/AIChatBox';
import { useToast } from '../../contexts/ToastContext';

const AIHubPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('intelligence');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // States cho cấu hình
  const [settings, setSettings] = useState({
    ai_system_instruction: '',
    ai_model_name: 'gemini-flash-latest',
    ai_temperature: 0.7,
    ai_max_tokens: 1000
  });

  // States cho phân tích vận hành
  const [analytics, setAnalytics] = useState(null);
  const [experts, setExperts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedExpertForAssign, setSelectedExpertForAssign] = useState('');

  const [selectedExpert, setSelectedExpert] = useState(null);

  useEffect(() => {
    if (activeTab === 'config') fetchSettings();
    if (activeTab === 'intelligence') fetchAnalytics();
    if (activeTab === 'experts') fetchExperts();
    if (activeTab === 'monitoring') {
      fetchTickets();
      const interval = setInterval(fetchTickets, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const [lastTicketCount, setLastTicketCount] = useState(0);
  useEffect(() => {
    if (tickets.length > lastTicketCount && lastTicketCount !== 0) {
      addToast('Có hội thoại mới từ khách hàng!', 'info');
    }
    setLastTicketCount(tickets.length);
  }, [tickets]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await aiSettingApi.getSettings();
      if (data) setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      addToast('Không thể tải cấu hình AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await aiSettingApi.getAnalytics();
      setAnalytics(data || null);
    } catch (error) {
      addToast('Lỗi khi phân tích yêu cầu khách hàng', 'error');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const data = await aiSettingApi.getExpertPerformance();
      setExperts(Array.isArray(data) ? data : []);
    } catch (error) {
      addToast('Lỗi khi tải dữ liệu chuyên gia', 'error');
      setExperts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await aiSettingApi.getSupportTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      addToast('Lỗi khi tải danh sách hội thoại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await aiSettingApi.updateSettings(settings);
      addToast('Đã lưu cấu hình AI thành công!', 'success');
    } catch (error) {
      addToast('Lỗi khi lưu cấu hình', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToRepair = async (ticketId) => {
    if (!selectedExpertForAssign) {
      addToast('Vui lòng chọn chuyên gia tiếp nhận!', 'warning');
      return;
    }
    try {
      const response = await aiSettingApi.convertToRepair(ticketId, selectedExpertForAssign);
      if (response?.success) {
        addToast(response.message, 'success');
        fetchTickets();
        setSelectedExpertForAssign('');
      }
    } catch (error) {
      addToast('Lỗi khi chuyển đổi đơn hàng', 'error');
    }
  };

  const tabs = [
    { id: 'intelligence', label: 'Phân tích Yêu cầu', icon: Ticket },
    { id: 'monitoring', label: 'Giám sát Hội thoại', icon: MessageSquare },
    { id: 'experts', label: 'Giám sát Chuyên gia', icon: Users },
    { id: 'config', label: 'Cấu hình Hệ thống', icon: Settings },
    { id: 'playground', label: 'Thử nghiệm Chat', icon: Bot },
  ];

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
  AI Hub Dashboard
</h1>
          <p className="text-sm text-slate-500 font-medium">
            Hệ thống phân tích và quản trị AI hỗ trợ khách hàng thông minh
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => activeTab === 'config' ? fetchSettings() : (activeTab === 'monitoring' ? fetchTickets() : fetchAnalytics())}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Làm mới
          </button>
          {activeTab === 'config' && (
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex-1 md:flex-none px-6 py-2.5 bg-brand-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
            >
              <Save size={14} />
              Lưu cấu hình
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl mb-8 w-fit border border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'monitoring' && (
          <motion.div 
            key="monitoring"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]"
          >
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 group">
                 <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={14} />
                    <input type="text" placeholder="Tìm bằng Phone, Intent..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-inner" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {tickets.length > 0 ? tickets.map((ticket) => (
                  <div 
                    key={ticket._id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/50 ${selectedTicket?._id === ticket._id ? 'bg-brand-50/50 border-r-4 border-r-brand-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                        ticket.intent === 'repair_request' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        ticket.intent === 'warranty_check' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {ticket.intent || 'Consulting'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400">{new Date(ticket.updatedAt).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">
                      {ticket.user?.name || ticket.guestInfo?.name || 'Khách vãng lai'}
                    </h4>
                    {ticket.phoneNumber && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-600 tracking-tight">{ticket.phoneNumber}</span>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-medium italic">&quot;{ticket.subject}&quot;</p>
                  </div>
                )) : (
                  <div className="p-12 text-center text-slate-300">
                    <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Không có hội thoại</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              {selectedTicket ? (
                <>
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <Bot size={22} />
                       </div>
                       <div>
                          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-800">Dòng thời gian hội thoại</h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedTicket._id.substring(selectedTicket._id.length - 12)}</p>
                       </div>
                    </div>
                    <div className="flex gap-3 items-center">
                       <select 
                          value={selectedExpertForAssign}
                          onChange={(e) => setSelectedExpertForAssign(e.target.value)}
                          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-tight outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-sm"
                       >
                          <option value="">-- Chỉ định Chuyên gia --</option>
                          {experts.map(exp => (
                             <option key={exp._id} value={exp._id}>{exp.name}</option>
                          ))}
                       </select>
                       <button 
                          onClick={() => handleConvertToRepair(selectedTicket._id)}
                          className={`px-5 py-2.5 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 ${
                            selectedTicket.status === 'resolved' ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                          }`}
                          disabled={selectedTicket.status === 'resolved'}
                       >
                          <ArrowRight size={14} /> 
                          {selectedTicket.status === 'converted' ? 'Xử lý thêm (Sửa chữa)' : 'Tạo Đơn sửa chữa'}
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/20">
                    {selectedTicket.chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-slate-900 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                        }`}>
                          <p className="font-medium">{msg.content}</p>
                          <div className={`mt-2 text-[9px] font-bold uppercase tracking-tight opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.role === 'user' ? 'Khách hàng' : 'Nexus AI'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex gap-3">
                       <input type="text" placeholder="Gửi phản hồi trực tiếp để can thiệp..." className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all shadow-inner" />
                       <button className="p-4 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95">
                        <ArrowRight size={20} />
                       </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <MessageSquare size={40} strokeWidth={1} className="opacity-20" />
                   </div>
                   <p className="text-[11px] font-bold uppercase tracking-widest">Chọn một hội thoại để giám sát trực tiếp</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'intelligence' && (
          <motion.div 
            key="intelligence"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Tổng số Yêu cầu', value: analytics?.stats?.total || 0, icon: Ticket, color: 'blue' },
                { label: 'Đang xử lý', value: analytics?.stats?.active || 0, icon: AlertCircle, color: 'amber' },
                { label: 'Đã giải quyết', value: analytics?.stats?.resolved || 0, icon: CheckCircle2, color: 'emerald' },
                { label: 'Tỷ lệ hoàn thành', value: `${analytics?.stats?.resolutionRate || 0}%`, icon: TrendingUp, color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100`}>
                    <stat.icon className={`text-slate-600`} size={22} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[32px] p-10 border-2 border-slate-100 relative overflow-hidden shadow-xl">
                  <div className="relative z-10 text-left">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="px-4 py-1.5 bg-brand-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl text-white shadow-lg shadow-brand-200">AI Intelligence</div>
                      <h2 className="text-2xl font-bold uppercase tracking-tighter text-slate-900">Xu hướng & Insight</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vấn đề phổ biến tiêu biểu:</p>
                        <ul className="space-y-4">
                          {analytics?.aiAnalysis?.topIssues?.map((issue, idx) => (
                            <li key={idx} className="flex items-center gap-5 bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 hover:border-brand-200 transition-all group">
                              <span className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-200 group-hover:border-brand-600 group-hover:text-brand-600 rounded-xl text-xs font-bold transition-colors">{idx+1}</span>
                              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-10 text-right">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Chỉ số hài lòng hệ thống (CSAT)</p>
                          <div className="flex items-end justify-end gap-3">
                            <span className="text-7xl font-bold text-brand-600 leading-none tracking-tighter">{analytics?.aiAnalysis?.satisfactionScore || 0}</span>
                            <span className="text-2xl font-bold text-slate-300 mb-2">/10</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full mt-8 overflow-hidden shadow-inner border border-slate-200">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(analytics?.aiAnalysis?.satisfactionScore || 0) * 10}%` }}
                              className="h-full bg-brand-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                            />
                          </div>
                        </div>
                        <div className="bg-brand-50 p-6 rounded-2xl border-2 border-brand-100 text-left relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                             <Sparkles size={60} className="text-brand-600" />
                          </div>
                          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Sparkles size={16} /> Chiến lược đề xuất vận hành:
                          </p>
                          <p className="text-[13px] italic text-brand-800 font-bold leading-relaxed">&quot;{analytics?.aiAnalysis?.advice}&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">Yêu cầu hỗ trợ gần đây</h3>
                    <button className="text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:underline">Toàn bộ hồ sơ</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Mã số / Thiết bị</th>
                          <th className="px-6 py-4">Nội dung tóm tắt</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4 text-right">Tác vụ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {analytics?.recentTickets?.map((ticket) => (
                          <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{ticket.deviceType}</p>
                              <p className="text-[10px] text-slate-400 font-bold">#{ticket.ticketNumber}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-slate-500 font-medium line-clamp-1 italic max-w-xs">&quot;{ticket.description}&quot;</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                ticket.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => setActiveTab('experts')} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                                <ArrowRight size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" />
                    Hạ tầng Hệ thống
                  </h3>
                  <div className="space-y-4">
                    {[
                        { label: 'Bộ não Gemini', status: 'Online', color: 'emerald' },
                        { label: 'Vector Database', status: 'Healthy', color: 'emerald' },
                        { label: 'Queue Engine', status: 'High Load', color: 'amber' }
                    ].map((sys, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-500">{sys.label}</span>
                            <span className={`text-[10px] font-bold text-${sys.color}-600 uppercase tracking-widest`}>{sys.status}</span>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 shadow-sm shadow-brand-100/50">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                        <ThumbsUp size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-brand-900 uppercase tracking-tight">Tối ưu CSAT</h4>
                   </div>
                   <p className="text-xs text-brand-700 leading-relaxed font-bold italic">
                      &quot;Dữ liệu mới nhất cho thấy khách hàng đánh giá cao tốc độ phản hồi của AI. Hãy duy trì độ trễ dưới 2.5s để bảo vệ điểm CSAT.&quot;
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'experts' && (
          <motion.div 
            key="experts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {experts?.map((expert) => (
              <div key={expert._id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all group flex flex-col">
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-inner group-hover:scale-105 transition-transform flex items-center justify-center">
                      {expert.avatar ? (
                        <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold uppercase tracking-tighter">
                          {expert.name?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 border-4 border-white rounded-full shadow-sm ${expert.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 uppercase tracking-tight truncate">{expert.name}</h3>
                      <span className="px-1.5 py-0.5 bg-brand-50 text-brand-600 text-[8px] font-bold rounded-md border border-brand-100 uppercase tracking-tighter">Expert</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{expert.role || 'Apple Certified Specialist'}</p>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-1.5">{expert.specialty?.join(' • ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đang xử lý</p>
                      <h4 className="text-xl font-bold text-slate-800 tabular-nums">{expert.stats?.assigned || 0}</h4>
                   </div>
                   <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 shadow-inner text-center">
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Đã hoàn tất</p>
                      <h4 className="text-xl font-bold text-brand-600 tabular-nums">{expert.stats?.resolved || 0}</h4>
                   </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Hiệu suất vận hành</span>
                    <span className="text-slate-900">{expert.stats?.efficiency || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${expert.stats?.efficiency || 0}%` }}
                      className="h-full bg-slate-900 rounded-full shadow-[0_0_8px_rgba(15,23,42,0.4)]"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedExpert(expert)}
                  className="w-full mt-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <UserCheck size={16} /> Hồ sơ chi tiết
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Sparkles size={16} className="text-brand-600" />
                      Hệ tư tưởng AI (System Instruction)
                    </label>
                    <textarea 
                      name="ai_system_instruction"
                      value={settings.ai_system_instruction}
                      onChange={(e) => setSettings({...settings, ai_system_instruction: e.target.value})}
                      rows={14}
                      className="w-full p-6 border border-slate-200 rounded-2xl focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-mono text-sm leading-relaxed bg-slate-50 shadow-inner resize-none"
                      placeholder="Nhập logic điều khiển bộ não AI..."
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner">
                    <h3 className="text-xs font-bold text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-widest">
                      <BrainCircuit size={18} className="text-brand-600" /> Tham số Kỹ thuật
                    </h3>
                    
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine Model</label>
                        <select 
                          value={settings.ai_model_name}
                          onChange={(e) => setSettings({...settings, ai_model_name: e.target.value})}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-tight focus:ring-1 focus:ring-brand-500 outline-none transition-all cursor-pointer"
                        >
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash (Turbo)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro (Ultra)</option>
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Latest)</option>
                          <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ linh hoạt (Temp: {settings.ai_temperature})</label>
                        </div>
                        <input 
                          type="range" min="0" max="2" step="0.1"
                          value={settings.ai_temperature}
                          onChange={(e) => setSettings({...settings, ai_temperature: parseFloat(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới hạn hồi đáp (Tokens)</label>
                        <input 
                          type="number"
                          value={settings.ai_max_tokens}
                          onChange={(e) => setSettings({...settings, ai_max_tokens: parseInt(e.target.value)})}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <ShieldAlert size={14} /> Chú ý vận hành
                    </p>
                    <p className="text-[11px] text-rose-700 leading-relaxed font-bold italic">
                      Việc thay đổi cấu hình sẽ tác động trực tiếp đến logic phản hồi của AI. Hãy kiểm tra kỹ Playground sau khi lưu.
                    </p>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'playground' && (
          <motion.div key="playground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[750px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
             <AIChatBox currentSettings={settings} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expert Details Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto no-scrollbar">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExpert(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden z-10"
            >
              <div className="p-8 md:p-12">
                {/* Close button */}
                <button 
                  onClick={() => setSelectedExpert(null)}
                  className="absolute top-8 right-8 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
                >
                  <RotateCcw size={20} className="rotate-45" />
                </button>

                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-12">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden ring-8 ring-slate-50 shadow-xl flex-shrink-0">
                    {selectedExpert.avatar ? (
                      <img src={selectedExpert.avatar} alt={selectedExpert.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold uppercase tracking-tighter">
                        {selectedExpert.name?.charAt(0) || 'E'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">{selectedExpert.name}</h2>
                      <div className={`w-3 h-3 rounded-full ${selectedExpert.isOnline ? 'bg-emerald-500' : 'bg-slate-300'} shadow-sm shadow-emerald-200`}></div>
                      <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">Expert Account</span>
                    </div>
                    <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.2em]">{selectedExpert.role && selectedExpert.role !== 'Admin' ? selectedExpert.role : 'Senior Technician Specialist'}</p>
                    <div className="flex items-center gap-6 mt-6">
                      <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
                        <ThumbsUp size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-700">{selectedExpert.rating || 4.9}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                        <Clock size={14} className="text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">{selectedExpert.experience || '3 năm kinh nghiệm'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={14} /> Hiệu suất vận hành
                      </h4>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner relative overflow-hidden">
                        <div className="flex items-end gap-3 mb-4">
                          <span className="text-4xl font-bold text-slate-900 tabular-nums">{selectedExpert.stats?.efficiency || 0}</span>
                          <span className="text-lg font-bold text-slate-400 mb-1">%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedExpert.stats?.efficiency || 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-slate-900 rounded-full"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-4 italic uppercase">Tối ưu hơn 15% so với trung bình hệ thống</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Thống kê xử lý
                      </h4>
                      <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100 shadow-inner">
                        <div className="flex justify-between items-center">
                          <div>
                             <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Tổng đơn hoàn tất</p>
                             <h4 className="text-3xl font-bold text-brand-600 tabular-nums">{selectedExpert.stats?.resolved || 0}</h4>
                          </div>
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
                            <TrendingUp size={24} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BrainCircuit size={14} /> Chuyên môn nghiệp vụ
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedExpert.specialty || ['iPhone', 'MacBook', 'iPad', 'Watch']).map((spec, i) => (
                          <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CreditCard size={14} /> Công cụ & Thiết bị
                      </h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                        Được cấp quyền truy cập hệ thống Nexus Core và bộ công cụ sửa chữa Apple Certified.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200">
                        Phân công nhiệm vụ mới
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default AIHubPage;
