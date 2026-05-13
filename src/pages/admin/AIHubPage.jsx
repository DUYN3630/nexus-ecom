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
    ai_model_name: 'gemini-2.0-flash',
    ai_temperature: 0.7,
    ai_max_tokens: 1000
  });

  // States cho phân tích vận hành
  const [analytics, setAnalytics] = useState(null);
  const [experts, setExperts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedExpertForAssign, setSelectedExpertForAssign] = useState('');

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
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
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        ticket.intent === 'repair_request' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        ticket.intent === 'warranty_check' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {ticket.intent || 'Consulting'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400">{new Date(ticket.updatedAt).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">
                      {ticket.user?.name || ticket.guestInfo?.name || 'Khách vãng lai'}
                    </h4>
                    {ticket.phoneNumber && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-600 tracking-tight">{ticket.phoneNumber}</span>
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
                       <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <Bot size={22} />
                       </div>
                       <div>
                          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Dòng thời gian hội thoại</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {selectedTicket._id.substring(selectedTicket._id.length - 12)}</p>
                       </div>
                    </div>
                    <div className="flex gap-3 items-center">
                       <select 
                          value={selectedExpertForAssign}
                          onChange={(e) => setSelectedExpertForAssign(e.target.value)}
                          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-sm"
                       >
                          <option value="">-- Chỉ định Chuyên gia --</option>
                          {experts.map(exp => (
                             <option key={exp._id} value={exp._id}>{exp.name}</option>
                          ))}
                       </select>
                       <button 
                          onClick={() => handleConvertToRepair(selectedTicket._id)}
                          className={`px-5 py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 ${
                            selectedTicket.status === 'converted' ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                          }`}
                          disabled={selectedTicket.status === 'converted'}
                       >
                          <ArrowRight size={14} /> 
                          {selectedTicket.status === 'converted' ? 'Đã xử lý' : 'Tạo Đơn sửa chữa'}
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
                   <p className="text-[11px] font-black uppercase tracking-widest">Chọn một hội thoại để giám sát trực tiếp</p>
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
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="px-3 py-1 bg-brand-500 text-[10px] font-black uppercase tracking-widest rounded-lg">AI Analysis</div>
                      <h2 className="text-xl font-bold uppercase tracking-tight">Xu hướng & Insight</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">3 Vấn đề phổ biến nhất:</p>
                        <ul className="space-y-3">
                          {analytics?.aiAnalysis?.topIssues?.map((issue, idx) => (
                            <li key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                              <span className="w-6 h-6 flex items-center justify-center bg-brand-600 rounded-lg text-xs font-black">{idx+1}</span>
                              <span className="text-sm font-bold text-slate-200">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-8 text-right">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Chỉ số hài lòng (CSAT)</p>
                          <div className="flex items-end justify-end gap-2">
                            <span className="text-6xl font-black text-brand-400 leading-none">{analytics?.aiAnalysis?.satisfactionScore || 0}</span>
                            <span className="text-lg font-bold text-slate-500 mb-1">/10</span>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full mt-6 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(analytics?.aiAnalysis?.satisfactionScore || 0) * 10}%` }}
                              className="h-full bg-brand-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                            />
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Sparkles size={14} /> Chiến lược đề xuất:
                          </p>
                          <p className="text-xs italic text-slate-300 leading-relaxed">&quot;{analytics?.aiAnalysis?.advice}&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-brand-600/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Yêu cầu hỗ trợ gần đây</h3>
                    <button className="text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:underline">Toàn bộ hồ sơ</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
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
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
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
                            <span className={`text-[10px] font-black text-${sys.color}-600 uppercase tracking-widest`}>{sys.status}</span>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 shadow-sm shadow-brand-100/50">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                        <ThumbsUp size={20} />
                      </div>
                      <h4 className="text-sm font-black text-brand-900 uppercase tracking-tight">Tối ưu CSAT</h4>
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
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-inner group-hover:scale-105 transition-transform">
                      <img src={expert.avatar || 'https://via.placeholder.com/150'} alt={expert.name} className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 border-4 border-white rounded-full shadow-sm ${expert.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight truncate">{expert.name}</h3>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-1">{expert.specialty?.join(' • ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đang xử lý</p>
                      <h4 className="text-xl font-black text-slate-800 tabular-nums">{expert.stats?.assigned || 0}</h4>
                   </div>
                   <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 shadow-inner text-center">
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Đã hoàn tất</p>
                      <h4 className="text-xl font-black text-brand-600 tabular-nums">{expert.stats?.resolved || 0}</h4>
                   </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
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

                <button className="w-full mt-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
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
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
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
                    <h3 className="text-xs font-black text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-widest">
                      <BrainCircuit size={18} className="text-brand-600" /> Tham số Kỹ thuật
                    </h3>
                    
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Engine Model</label>
                        <select 
                          value={settings.ai_model_name}
                          onChange={(e) => setSettings({...settings, ai_model_name: e.target.value})}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-tight focus:ring-1 focus:ring-brand-500 outline-none transition-all cursor-pointer"
                        >
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash (Turbo)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro (Ultra)</option>
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Latest)</option>
                          <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ linh hoạt (Temp: {settings.ai_temperature})</label>
                        </div>
                        <input 
                          type="range" min="0" max="2" step="0.1"
                          value={settings.ai_temperature}
                          onChange={(e) => setSettings({...settings, ai_temperature: parseFloat(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Giới hạn hồi đáp (Tokens)</label>
                        <input 
                          type="number"
                          value={settings.ai_max_tokens}
                          onChange={(e) => setSettings({...settings, ai_max_tokens: parseInt(e.target.value)})}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-black focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-2">
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

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default AIHubPage;
