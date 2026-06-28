import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white border-t border-black/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full md:h-[650px]">
          
          {/* Main Large Block (Left) - MacBook Pro */}
          <div 
            onClick={() => navigate('/products')}
            className="md:col-span-8 relative rounded-3xl bg-black overflow-hidden group cursor-pointer shadow-2xl min-h-[400px]"
          >
            <img
              src="/products/macbookprom4.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2000ms]"
              alt="MacBook Pro"
            />
            {/* Overlay - Forced visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
            
            {/* Content - Forced on top */}
            <div className="relative h-full p-8 md:p-16 flex flex-col justify-end z-20">
               <div className="max-w-xl space-y-6">
                  <div>
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-white bg-blue-600 px-4 py-2 rounded-full">
                      MacBook Pro M4 Pro
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase italic">
                    Sức mạnh <br/>thay đổi cuộc chơi
                  </h2>
                  
                  {/* Mô tả: Bỏ line-clamp, bỏ max-width quá nhỏ, ép text-white */}
                  <p className="text-base md:text-xl font-medium text-white block visible opacity-100 leading-relaxed">
                    Trải nghiệm hiệu năng không giới hạn với chip M4 Pro thế hệ mới. 
                    Mọi tác vụ đồ họa và lập trình phức tạp nhất đều được xử lý mượt mà.
                  </p>
                  
                  <div className="pt-4 flex flex-wrap items-center gap-6">
                    <button className="px-10 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                      Mua ngay
                    </button>
                    <span className="text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 underline underline-offset-8">
                      Tìm hiểu thêm <ArrowUpRight size={18} />
                    </span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column (2 Smaller Blocks) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Top Right Block - iPad Air */}
            <div
              onClick={() => navigate('/products')}
              className="flex-1 relative rounded-3xl bg-slate-900 overflow-hidden group cursor-pointer border border-white/10 min-h-[250px]"
            >
              <img
                src="/products/iPad-Pro-M2-cover.jpg"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] opacity-70"
                alt="iPad Air"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
              <div className="relative h-full p-8 flex flex-col justify-end z-20">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase italic">iPad Air</h3>
                  <p className="text-[11px] font-bold text-white uppercase tracking-widest opacity-90">Sáng tạo không giới hạn với chip M2.</p>
                </div>
              </div>
            </div>

            {/* Bottom Right Block - Watch S9 */}
            <div
              onClick={() => navigate('/products')}
              className="flex-1 relative rounded-3xl bg-slate-900 overflow-hidden group cursor-pointer border border-white/10 min-h-[250px]"
            >
              <img
                src="/products/stylewatch.jpg"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] opacity-70"
                alt="Apple Watch"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
              <div className="relative h-full p-8 flex flex-col justify-between z-20">
                <div className="flex justify-end">
                   <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                      <ArrowUpRight size={20} />
                   </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase italic">Watch S9</h3>
                  <p className="text-[11px] font-bold text-white uppercase tracking-widest opacity-90">Thông minh hơn, sáng hơn, bền bỉ hơn.</p>
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
