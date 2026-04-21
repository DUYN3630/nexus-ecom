import React, { useState, useEffect } from 'react';
import { 
  Settings, Database, MessageSquare, Activity, Save, RotateCcw,
  Sparkles, Bot, BrainCircuit, ShieldAlert, Ticket, Users, 
  TrendingUp, ThumbsUp, AlertCircle, CheckCircle2, Search,
  Filter, ArrowRight, UserCheck
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
    ai_model_name: 'gemini-1.5-flash',
    ai_temperature: 0.7,
    ai_max_tokens: 1000
  });

  // States cho phân tích vận hành
  const [analytics, setAnalytics] = useState(null);
  const [experts, setExperts] = useState([]);

  useEffect(() => {
    if (activeTab === 'config') fetchSettings();
    if (activeTab === 'intelligence') fetchAnalytics();
    if (activeTab === 'experts') fetchExperts();
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await aiSettingApi.getSettings();
      if (response.data) setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      addToast('Không thể tải cấu hình AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await aiSettingApi.getAnalytics();
      setAnalytics(response.data || null);
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
      const response = await aiSettingApi.getExpertPerformance();
      setExperts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      addToast('Lỗi khi tải dữ liệu chuyên gia', 'error');
      setExperts([]);
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

  const tabs = [
    { id: 'intelligence', label: 'Phân tích Yêu cầu', icon: Ticket },
    { id: 'experts', label: 'Giám sát Chuyên gia', icon: Users },
    { id: 'config', label: 'Cấu hình Hệ thống', icon: Settings },
    { id: 'playground', label: 'Thử nghiệm Chat', icon: MessageSquare },
  ];

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <Sparkles className="text-brand-600 w-8 h-8" />
            AI Hub <span className="text-slate-400">Trung tâm Điều khiển</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Hệ thống phân tích và quản trị AI hỗ trợ khách hàng thông minh</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => activeTab === 'config' ? fetchSettings() : fetchAnalytics()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <RotateCcw size={14} />
            Làm mới dữ liệu
          </button>
          {activeTab === 'config' && (
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
            >
              <Save size={14} />
              Lưu cấu hình
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl mb-8 w-fit border border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {/* --- TAB 1: PHÂN TÍCH YÊU CẦU --- */}
        {activeTab === 'intelligence' && (
          <motion.div 
            key="intelligence"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Tổng số Yêu cầu', value: analytics?.stats?.total || 0, icon: Ticket, color: 'blue' },
                { label: 'Đang xử lý', value: analytics?.stats?.active || 0, icon: AlertCircle, color: 'amber' },
                { label: 'Đã giải quyết', value: analytics?.stats?.resolved || 0, icon: CheckCircle2, color: 'emerald' },
                { label: 'Tỷ lệ hoàn thành', value: `${analytics?.stats?.resolutionRate || 0}%`, icon: TrendingUp, color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
                    <stat.icon className={`text-${stat.color}-600`} size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* AI Analysis Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="px-3 py-1 bg-brand-500 text-[10px] font-black uppercase tracking-widest rounded-full">Phân tích từ AI</div>
                      <h2 className="text-xl font-bold uppercase tracking-tighter">Xu hướng và Insight khách hàng</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Vấn đề phổ biến nhất:</p>
                        <ul className="space-y-3">
                          {analytics?.aiAnalysis?.topIssues?.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                              <span className="w-5 h-5 flex items-center justify-center bg-brand-600 rounded-full text-[10px] font-bold">{idx+1}</span>
                              <span className="text-sm font-medium text-slate-200">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Điểm hài lòng trung bình:</p>
                          <div className="flex items-end gap-3">
                            <span className="text-5xl font-black text-brand-400 leading-none">{analytics?.aiAnalysis?.satisfactionScore || 0}</span>
                            <span className="text-sm font-bold text-slate-500 mb-1">/ 10</span>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full mt-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(analytics?.aiAnalysis?.satisfactionScore || 0) * 10}%` }}
                              className="h-full bg-brand-500 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Bot size={14} /> Đề xuất từ AI:
                          </p>
                          <p className="text-xs italic text-slate-300 leading-relaxed">"{analytics?.aiAnalysis?.advice}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-brand-600/10 rounded-full blur-3xl"></div>
                </div>

                {/* Recent Tickets List */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-tight text-slate-800">Yêu cầu hỗ trợ gần đây</h3>
                    <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Xem tất cả</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Khách hàng / Chủ đề</th>
                          <th className="px-6 py-4">Tóm tắt từ AI</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {analytics?.recentTickets?.map((ticket) => (
                          <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-800">{ticket.subject}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Mã số: {ticket._id.substring(0,8)}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-slate-600 line-clamp-2 max-w-xs">{ticket.aiSummary || 'Đang phân tích...'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {ticket.status === 'resolved' ? 'Đã xong' : 'Đang xử lý'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                <ArrowRight size={16} className="text-slate-400 hover:text-slate-900" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Sidebar: Real-time Monitor */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" />
                    Trạng thái Hệ thống
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-bold text-slate-500">Bộ não Gemini</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Hoạt động</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-bold text-slate-500">Cơ sở dữ liệu</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ổn định</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-bold text-slate-500">Tiến trình AI</span>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Tải cao</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <ThumbsUp size={20} />
                      </div>
                      <h4 className="font-bold text-indigo-900 uppercase tracking-tight">Tối ưu CSAT</h4>
                   </div>
                   <p className="text-xs text-indigo-700 leading-relaxed font-medium italic">
                      "Dựa trên dữ liệu, hãy tập trung cải thiện thời gian phản hồi cho các yêu cầu về bảo trì phần cứng để giữ chân khách hàng trung thành."
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: GIÁM SÁT CHUYÊN GIA --- */}
        {activeTab === 'experts' && (
          <motion.div 
            key="experts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {experts?.map((expert) => (
              <div key={expert._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-brand-500 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-slate-50">
                      <img src={expert.avatar || 'https://via.placeholder.com/150'} alt={expert.name} className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${expert.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight">{expert.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{expert.specialty?.join(', ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Đang xử lý</p>
                      <h4 className="text-lg font-black text-slate-800">{expert.stats?.assigned || 0} Yêu cầu</h4>
                   </div>
                   <div className="p-3 bg-brand-50 rounded-xl">
                      <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Đã xong</p>
                      <h4 className="text-lg font-black text-brand-600">{expert.stats?.resolved || 0} Yêu cầu</h4>
                   </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Hiệu suất làm việc</span>
                    <span className="text-slate-900">{expert.stats?.efficiency || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${expert.stats?.efficiency || 0}%` }}
                      className="h-full bg-slate-900"
                    />
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                  <UserCheck size={14} /> Xem hồ sơ chi tiết
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* --- TAB 3: CẤU HÌNH HỆ THỐNG --- */}
        {activeTab === 'config' && (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Bot size={16} className="text-brand-600" />
                      Hướng dẫn Hệ thống (Instruction)
                    </label>
                    <textarea 
                      name="ai_system_instruction"
                      value={settings.ai_system_instruction}
                      onChange={(e) => setSettings({...settings, ai_system_instruction: e.target.value})}
                      rows={14}
                      className="w-full p-5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono text-sm leading-relaxed bg-slate-50"
                      placeholder="Nhập hướng dẫn cho AI..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
                      <BrainCircuit size={18} /> Thông số Kỹ thuật
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Phiên bản Model</label>
                        <select 
                          value={settings.ai_model_name}
                          onChange={(e) => setSettings({...settings, ai_model_name: e.target.value})}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase"
                        >
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash (Nhanh)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro (Thông minh)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Độ sáng tạo ({settings.ai_temperature})</label>
                        </div>
                        <input 
                          type="range" min="0" max="2" step="0.1"
                          value={settings.ai_temperature}
                          onChange={(e) => setSettings({...settings, ai_temperature: parseFloat(e.target.value)})}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Giới hạn từ (Tokens)</label>
                        <input 
                          type="number"
                          value={settings.ai_max_tokens}
                          onChange={(e) => setSettings({...settings, ai_max_tokens: parseInt(e.target.value)})}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <ShieldAlert size={14} /> Lưu ý
                    </p>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium italic">
                      Thay đổi cấu hình sẽ ảnh hưởng ngay lập tức đến bộ não của trợ lý ảo trên toàn hệ thống.
                    </p>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* --- TAB 4: THỬ NGHIỆM --- */}
        {activeTab === 'playground' && (
          <motion.div key="playground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[700px] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
             <AIChatBox />
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />
    </div>
  );
};

export default AIHubPage;
