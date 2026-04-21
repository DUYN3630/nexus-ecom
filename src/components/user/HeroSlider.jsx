import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useBanner from '../../hooks/useBanner'; 
import { HERO_SLIDES } from '../../constants/userContent';

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  
  const { banners: apiBanners, loading, handleBannerClick } = useBanner('home-top');

  const banners = (apiBanners && apiBanners.length > 0) 
    ? apiBanners 
    : HERO_SLIDES.map(slide => ({
        _id: `fallback-${slide.id}`,
        name: slide.headline,
        media: { url: slide.imageUrl, kind: 'image' },
        content: {
            title: slide.headline,
            subtitle: slide.subtitle,
            ctaText: slide.buttonText
        },
        linkType: 'external',
        linkTarget: { url: '/products' }
    }));

  const next = () => {
    if (banners && banners.length > 1) {
      setCurrent((prev) => (prev + 1) % banners.length);
    }
  };
  const prev = () => {
    if (banners && banners.length > 1) {
      setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    }
  };

  useEffect(() => {
    if (!isPaused && banners && banners.length > 1) {
      timerRef.current = setInterval(next, 4000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, banners]);

  if (loading && (!apiBanners || apiBanners.length === 0)) {
      return (
          <section className="relative w-full h-[85vh] min-h-[700px] overflow-hidden bg-[#FBFBFB]">
            <div className="max-w-[1440px] mx-auto px-6 md:px-20 h-full flex items-center">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-10">
                        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                        <div className="space-y-4">
                            <div className="h-16 bg-slate-200 rounded w-full animate-pulse"></div>
                            <div className="h-16 bg-slate-200 rounded w-4/5 animate-pulse"></div>
                        </div>
                        <div className="h-20 bg-slate-100 rounded-2xl w-48 animate-pulse"></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-[500px] h-[500px] bg-slate-100 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
          </section>
      );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <section 
      className="relative w-full h-[85vh] min-h-[700px] overflow-hidden bg-[#FBFBFB] group/slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Decor Elements - Subtle Motion */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-indigo-50/40 rounded-full blur-[120px] transition-transform duration-[10000ms] ease-linear group-hover/slider:scale-110"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-blue-50/40 rounded-full blur-[100px] transition-transform duration-[10000ms] ease-linear group-hover/slider:scale-110 group-hover/slider:-translate-x-10"></div>
      </div>

      <div className="relative w-full h-full">
        {banners.map((slide, idx) => (
          <div 
            key={slide._id}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
              idx === current 
                ? 'opacity-100 z-10' 
                : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="max-w-[1440px] mx-auto px-6 md:px-20 h-full flex items-center">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                
                {/* Content Side: Layered Staggered Animation */}
                <div className="space-y-8 relative z-20">
                  <div className={`transition-all duration-1000 delay-[300ms] ease-out ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <p className="inline-block text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
                      {slide.content?.supertitle || 'Thế hệ mới / 2024'}
                    </p>
                  </div>
                  
                  <h1 className={`text-6xl md:text-8xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] whitespace-pre-line italic transition-all duration-1000 delay-[450ms] ease-out ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    {slide.content?.title || slide.name}
                  </h1>
                  
                  <p className={`text-sm md:text-base font-medium text-slate-500 max-w-md leading-relaxed transition-all duration-1000 delay-[600ms] ease-out ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    {slide.content?.subtitle}
                  </p>
                  
                  <div className={`pt-4 transition-all duration-1000 delay-[750ms] ease-out ${idx === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <button
                      onClick={() => String(slide._id).startsWith('fallback') ? (window.location.href = '/iphone') : handleBannerClick(slide)}
                      className="group relative bg-slate-900 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] overflow-hidden transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-95"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {slide.content?.ctaText || 'Khám phá ngay'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </button>
                  </div>
                </div>
                
                {/* Image Side: Parallax and Zoom Animation */}
                <div 
                  onClick={() => String(slide._id).startsWith('fallback') ? (window.location.href = '/iphone') : handleBannerClick(slide)}
                  className={`relative flex justify-center items-center cursor-pointer transition-all duration-[1500ms] delay-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    idx === current ? 'translate-x-0 scale-100 opacity-100 rotate-0' : 'translate-x-20 scale-90 opacity-0 -rotate-3'
                  }`}
                >
                   {/* Background Visual Rings - Fixed position but with its own transition */}
                   <div className="absolute w-[110%] h-[110%] border border-slate-100 rounded-full transition-transform duration-[3000ms] ease-out group-hover/slider:scale-105"></div>
                   <div className="absolute w-[85%] h-[85%] border border-slate-50 rounded-full transition-transform duration-[3000ms] ease-out group-hover/slider:scale-95"></div>
                   
                   {slide.media?.url && (
                    <img 
                      src={slide.media.url.startsWith('http') ? slide.media.url : `http://127.0.0.1:5000${slide.media.url}`}
                      className="relative w-full h-auto max-w-[550px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-[2000ms] ease-out" 
                      alt={slide.media?.altText || slide.name}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
            <div className="absolute left-10 bottom-10 flex gap-4 z-20 opacity-0 group-hover/slider:opacity-100 transition-all duration-500 translate-y-2 group-hover/slider:translate-y-0">
                <button onClick={prev} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white hover:border-white transition-all shadow-sm backdrop-blur-sm group/btn">
                    <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button onClick={next} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white hover:border-white transition-all shadow-sm backdrop-blur-sm group/btn">
                    <ChevronRight size={20} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
            
            <div className="absolute bottom-10 right-10 flex flex-col gap-3 z-20 opacity-0 group-hover/slider:opacity-100 transition-all duration-500 translate-x-2 group-hover/slider:translate-x-0">
                {banners.map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => setCurrent(i)}
                    className="group relative h-10 w-1 flex items-center"
                >
                    <div className={`h-full w-full rounded-full transition-all duration-500 ${i === current ? 'bg-indigo-600 h-8' : 'bg-slate-200 h-4 group-hover:bg-slate-300'}`}></div>
                </button>
                ))}
            </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;