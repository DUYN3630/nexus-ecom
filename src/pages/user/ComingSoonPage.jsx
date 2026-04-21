import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft } from 'lucide-react';

const ComingSoonPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 text-brand-600">
        <Wrench size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Tính năng sắp ra mắt</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Trang nội dung này đang được Nexus Store phát triển và hoàn thiện. Cùng chờ đón những bản cập nhật tiếp theo nhé!
      </p>
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-slate-200"
      >
        <ArrowLeft size={18} /> Quay lại Trang Chủ
      </button>
    </div>
  );
};

export default ComingSoonPage;
