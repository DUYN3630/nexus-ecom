import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full md:h-[650px]">
          
          {/* Main Large Block (Left) */}
          <div 
            onClick={() => navigate('/products')}
            className="md:col-span-8 relative rounded-3xl bg-slate-900 overflow-hidden group cursor-pointer shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1517336712468-da1133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2000ms]" 
              alt="MacBook Pro" 
            />
            <div className="absolute inset-0 p-12 flex flex-col justify-end">
               <div className="max-w-md space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 w-fit">
                    MacBook Pro M3
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">
                    Sức mạnh <br/>thay đổi cuộc chơi
                  </h2>
                  <p className="text-sm font-medium text-white/70 leading-relaxed">
                    Xử lý mọi tác vụ đồ họa nặng nề nhất với chip M3 Pro mới nhất.
                  </p>
                  <div className="pt-4 flex items-center gap-4">
                    <button className="px-8 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                      Mua ngay
                    </button>
                    <span className="text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:underline underline-offset-4">
                      Tìm hiểu thêm <ArrowUpRight size={16} />
                    </span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column (2 Smaller Blocks) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Top Right Block */}
            <div 
              onClick={() => navigate('/products')}
              className="flex-1 relative rounded-3xl bg-indigo-50 overflow-hidden group cursor-pointer border border-indigo-100"
            >
              <img 
                src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]" 
                alt="iPad Air" 
              />
              <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black/20 to-transparent">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic drop-shadow-md">iPad Air</h3>
                  <p className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Sáng tạo không giới hạn</p>
                </div>
              </div>
            </div>

            {/* Bottom Right Block */}
            <div 
              onClick={() => navigate('/products')}
              className="flex-1 relative rounded-3xl bg-slate-100 overflow-hidden group cursor-pointer border border-slate-200"
            >
              <img 
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]" 
                alt="Apple Watch" 
              />
              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                <div className="flex justify-end">
                   <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 border border-white">
                      <ArrowUpRight size={20} />
                   </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Watch S9</h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Thông minh hơn, sáng hơn</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;

