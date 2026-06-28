import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const QualitySection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Refresh ScrollTrigger to calculate proper element offsets once products/reviews are loaded
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    const anim = gsap.fromTo(
      container.querySelectorAll('.animate-on-scroll'),
      { y: 50, opacity: 0, filter: 'blur(6px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 92%',
        }
      }
    );

    return () => {
      clearTimeout(timer);
      anim.kill();
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="py-32 bg-cara-surface border-t border-black/5 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Content Side */}
          <div className="space-y-12 order-2 lg:order-1">
            <div className="space-y-6 animate-on-scroll">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-cara-accent/5 rounded-full text-cara-accent-alt">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tiêu chuẩn Nexus Gold</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic leading-[0.9] uppercase">
                Chất lượng <br/> là danh dự
              </h2>
              <p className="text-base text-slate-500 leading-relaxed max-w-xl">
                Tại Nexus Store, chúng tôi không chỉ bán thiết bị. Chúng tôi mang đến sự an tâm tuyệt đối với quy trình kiểm định 24 bước độc quyền, đảm bảo mỗi sản phẩm đến tay bạn đều hoàn hảo như mới.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-on-scroll">
               <div className="space-y-3">
                  <div className="w-10 h-10 bg-cara-accent/5 rounded-xl flex items-center justify-center text-slate-900 border border-black/5">
                    <Award size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Kiểm định chuyên sâu</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Đội ngũ kỹ thuật viên tay nghề cao trực tiếp kiểm tra từng linh kiện nhỏ nhất.</p>
               </div>
               <div className="space-y-3">
                  <div className="w-10 h-10 bg-cara-accent/5 rounded-xl flex items-center justify-center text-slate-900 border border-black/5">
                    <Zap size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Hiệu năng tối ưu</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Cam kết dung lượng pin trên 90% và hiệu năng chip xử lý đạt chuẩn Apple.</p>
               </div>
            </div>

            <div className="pt-4 animate-on-scroll">
              <button
                onClick={() => navigate('/about')}
                className="px-12 py-5 bg-cara-accent text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cara-accent-alt transition-all shadow-xl active:scale-95"
              >
                Về chúng tôi
              </button>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative order-1 lg:order-2 group animate-on-scroll">
             <div className="absolute inset-0 bg-cara-accent/10 rounded-3xl translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700"></div>
             <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-8 border-white shadow-2xl">
                <img 
                  src="/products/leca.jpg" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
                  alt="Quality check" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                   <p className="text-white text-xs font-medium italic leading-relaxed">
                     "Mỗi thiết bị Nexus là một lời hứa về sự bền bỉ và đẳng cấp."
                   </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default QualitySection;
