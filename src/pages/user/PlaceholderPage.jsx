import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.pathname.replace('/', '').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 text-center animate-in slide-in-from-bottom-6 duration-700">
      <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-4">{title}</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tính năng đang được phát triển...</p>
      <button onClick={() => navigate('/')} className="mt-8 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Quay lại trang chủ</button>
    </div>
  );
};

export default PlaceholderPage;
