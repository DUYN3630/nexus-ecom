import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const EliteLifestyle = () => {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center overflow-hidden bg-black group">
      {/* Background Image - Lifestyle/Magazine style */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/products/macbanner.jpg" 
          alt="Nexus Elite Lifestyle" 
          className="w-full h-full object-cover opacity-70 grayscale-[0.2] transition-transform duration-[5000ms] group-hover:scale-105"
        />
        {/* Overlays for magazine feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 border-[40px] border-black/10 pointer-events-none"></div>
      </div>

      <div className="relative z-10 container mx-auto px-12 md:px-24">
        <div className="max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">The Elite Experience</span>
          </div>

          <h2 className="text-6xl md:text-[5.5rem] font-black text-white leading-[0.9] tracking-tighter uppercase italic">
            HỆ SINH THÁI <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/30">
                KHÔNG GIỚI HẠN
            </span>
          </h2>

          <p className="text-xl text-white/60 font-medium max-w-lg leading-relaxed animate-fade-in-up delay-300">
            Nexus Ecom không chỉ bán thiết bị, chúng tôi cung cấp giải pháp sống và làm việc tối thượng. 
            Nơi công nghệ hòa quyện cùng phong cách cá nhân.
          </p>

          <div className="flex items-center gap-8 pt-6 animate-fade-in-up delay-500">
            <Link 
                to="/mac"
                className="px-10 py-5 bg-white text-black font-bold rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
                Xem bộ sưu tập <ArrowRight size={20} />
            </Link>
            <Link 
                to="/about"
                className="flex items-center gap-4 text-white font-bold text-sm hover:text-blue-400 transition-colors group/play"
            >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover/play:bg-blue-600 group-hover/play:border-blue-600 transition-all">
                    <Play size={16} fill="currentColor" />
                </div>
                Khám phá phong cách
            </Link>
          </div>
        </div>
      </div>

      {/* Magazine Detail Info */}
      <div className="absolute bottom-12 right-12 text-right text-white/20 hidden lg:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Issue No. 01 / 2026</p>
        <p className="text-[10px] font-medium italic">Redefining the digital workspace with Nexus Elite Series.</p>
      </div>
    </section>
  );
};

export default EliteLifestyle;
