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
    <section id="hero" className="relative h-screen w-full flex flex-col items-start justify-center overflow-hidden px-6 md:px-24 text-left">
      <div
        className="relative z-10 space-y-4 transition-all duration-1000 max-w-4xl"
        style={{ transform: titleTransform, opacity: opacity }}
      >
        <h1 className="text-[clamp(3.5rem,8vw,7rem)] font-bold tracking-tight leading-[1.05]">{title}</h1>
        <p className="text-[clamp(1.125rem,1.8vw,1.25rem)] font-normal text-[#6E6E73] tracking-tight max-w-2xl line-clamp-3">{subtitle}</p>
        <div className="pt-8 flex gap-6 justify-start">
          <a href={cta.link} className="px-10 py-4 bg-[#1D1D1F] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
            {cta.text}
          </a>
        </div>
      </div>

      {visual.type === 'device_mockup' && (
        <div
          className="absolute inset-0 flex items-center justify-end z-0 pr-10 md:pr-40"
          style={{ transform: visualTransform }}
        >
          <div 
            className="relative w-[34rem] h-[64rem] rounded-[5rem] shadow-[0_120px_250px_-60px_rgba(0,0,0,0.18)] border border-white/40 rotate-[-3deg] translate-y-20 overflow-hidden hidden md:block"
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
