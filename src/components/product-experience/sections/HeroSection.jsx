import React from 'react';
import { ChevronDown } from 'lucide-react';

const HeroSection = ({ config, scrollY }) => {
  if (!config) return null;

  const { title, subtitle, cta, visual, animation } = config;

  // Animation values
  const parallaxIntensity = animation?.intensity || 0.15;
  const opacity = 1 - scrollY / 700;
  const titleTransform = `translateY(${scrollY * parallaxIntensity}px)`;
  const visualTransform = `translateY(${scrollY * 0.05}px) scale(${1 + scrollY * 0.0001})`;
  const [gradientFrom, gradientTo] = visual.gradient || ['#E3E3E5', '#C7C7C9'];

  return (
    <section id="hero" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        className="relative z-10 space-y-4 transition-all duration-1000"
        style={{ transform: titleTransform, opacity: opacity }}
      >
        <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none">{title}</h1>
        <p className="text-xl md:text-2xl font-medium text-[#6E6E73] tracking-tight">{subtitle}</p>
        <div className="pt-10 flex gap-6 justify-center">
          <a href={cta.link} className="px-10 py-4 bg-[#1D1D1F] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95">
            {cta.text}
          </a>
        </div>
      </div>

      {visual.type === 'device_mockup' && (
        <div
          className="absolute inset-0 flex items-center justify-center z-0 pt-40"
          style={{ transform: visualTransform }}
        >
          <div 
            className="relative w-[34rem] h-[64rem] rounded-[5rem] shadow-[0_120px_250px_-60px_rgba(0,0,0,0.18)] border border-white/40 rotate-[-3deg] translate-y-20 overflow-hidden"
            style={{ background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` }}
          >
            {visual.style === 'subtle_shine' && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-shine-slow pointer-events-none"></div>
            )}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
          </div>
        </div>
      )}

      <div className="absolute bottom-10 animate-bounce opacity-20">
        <ChevronDown size={24} strokeWidth={1} />
      </div>
    </section>
  );
};

export default HeroSection;
