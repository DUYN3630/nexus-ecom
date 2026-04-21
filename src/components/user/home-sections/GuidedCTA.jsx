import React from 'react';
import { MessageSquare, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuidedCTA = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Card 1: Consulting */}
          <Link to="/support" className="group relative bg-[#FBFBFB] p-16 rounded-[4rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-700 cursor-pointer block">
            <div className="relative z-10 space-y-10 h-full flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border border-slate-50">
                  <MessageSquare size={32} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-tight">
                    Tìm kiếm <br/> trợ giúp chuyên gia?
                  </h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xs">
                    Đội ngũ tư vấn viên am hiểu sản phẩm luôn sẵn sàng giúp bạn chọn ra thiết bị Apple hoàn hảo nhất.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 border-b-2 border-indigo-600/20 pb-1 w-fit group-hover:border-indigo-600 transition-all">
                Bắt đầu trò chuyện <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/50 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </Link>

          {/* Card 2: Comparison */}
          <div className="group relative bg-slate-900 p-16 rounded-[4rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-700 cursor-pointer">
            <div className="relative z-10 space-y-10 h-full flex flex-col justify-between text-white">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-white border border-white/10 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <Layers size={32} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-tight">
                    So sánh <br/> các dòng thiết bị
                  </h3>
                  <p className="text-sm font-medium text-white/60 leading-relaxed max-w-xs">
                    Từ iPhone, iPad đến MacBook. Xem sự khác biệt về cấu hình và tính năng để quyết định dễ dàng hơn.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-white border-b-2 border-white/20 pb-1 w-fit group-hover:border-white transition-all">
                So sánh ngay <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            {/* Background Decor */}
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]"></div>
            <Sparkles size={120} className="absolute bottom-[-20px] right-[-20px] text-white/5 rotate-12" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default GuidedCTA;