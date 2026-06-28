import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Magnetic } from '../../common/Magnetic';

gsap.registerPlugin(ScrollTrigger);

export const CaraCTA = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Staggered entry from bottom
    const cards = container.querySelectorAll('.cta-card');
    const scrollAnim = gsap.fromTo(cards,
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
        }
      }
    );

    return () => {
      scrollAnim.kill();
      if (scrollAnim.scrollTrigger) scrollAnim.scrollTrigger.kill();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="py-24 bg-cara-surface overflow-hidden relative select-none"
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Card 1: AI Consultant */}
          <Link 
            to="/support" 
            className="cta-card group relative bg-cara-accent/5 p-12 md:p-16 rounded-[28px] border border-black/5 overflow-hidden flex flex-col justify-between h-[420px] transition-all duration-500 hover:shadow-2xl hover:border-cara-accent/20 cursor-pointer block"
          >
            {/* Background glowing circle */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cara-accent/5 rounded-full blur-[80px] transition-opacity duration-500 opacity-80 group-hover:opacity-100" />
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="w-14 h-14 bg-white rounded-[18px] flex items-center justify-center text-cara-accent border border-black/5 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              
              <div>
                <span className="text-[10px] font-bold text-cara-accent uppercase tracking-widest block mb-2">TƯ VẤN THÔNG MINH</span>
                <h3 className="text-3xl md:text-4xl font-bold text-cara-ink tracking-tight uppercase leading-tight">
                  Trợ Lý AI<br />Chuyên Nghiệp
                </h3>
                <p className="text-sm text-cara-muted leading-relaxed max-w-sm mt-4">
                  Bạn băn khoăn lựa chọn cấu hình phù hợp? Trợ lý AI Genius được tối ưu hóa dữ liệu kỹ thuật sẽ giải đáp và tìm sản phẩm ưng ý nhất trong 30 giây.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <Magnetic strength={0.2}>
                <div className="inline-flex items-center gap-3 bg-cara-ink text-white group-hover:bg-cara-accent font-semibold text-xs px-6 py-3.5 rounded-full uppercase tracking-wider transition-colors duration-300">
                  <span>Trò chuyện ngay</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Magnetic>
            </div>
          </Link>

          {/* Card 2: Compare Devices */}
          <Link 
            to="/compare" 
            className="cta-card group relative bg-cara-ink p-12 md:p-16 rounded-[28px] overflow-hidden flex flex-col justify-between h-[420px] transition-all duration-500 hover:shadow-2xl cursor-pointer block text-white"
          >
            {/* Background glowing circle */}
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-[18px] flex items-center justify-center text-white border border-white/5 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                <Layers size={24} />
              </div>

              <div>
                <span className="text-[10px] font-bold text-cara-accent-alt uppercase tracking-widest block mb-2">SO SÁNH THÔNG SỐ</span>
                <h3 className="text-3xl md:text-4xl font-bold text-cara-surface tracking-tight uppercase leading-tight">
                  So Sánh<br />Dòng Thiết Bị
                </h3>
                <p className="text-sm text-cara-cream/60 leading-relaxed max-w-sm mt-4">
                  Đối chiếu cấu hình, hiệu năng, dung lượng pin và kích thước giữa các dòng iPhone, iPad và MacBook để đưa ra lựa chọn đầu tư công nghệ chuẩn xác.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <Magnetic strength={0.2}>
                <div className="inline-flex items-center gap-3 bg-white text-cara-ink group-hover:bg-cara-accent-alt group-hover:text-white font-semibold text-xs px-6 py-3.5 rounded-full uppercase tracking-wider transition-colors duration-300">
                  <span>So sánh thiết bị</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Magnetic>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default CaraCTA;
