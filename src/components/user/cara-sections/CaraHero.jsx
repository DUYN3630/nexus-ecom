import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Magnetic } from '../../common/Magnetic';

gsap.registerPlugin(ScrollTrigger);

export const CaraHero = () => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const bg = bgRef.current;
    if (!container || !bg) return;

    // Word reveal entrance animation
    const words = container.querySelectorAll('.hero-title .word');
    const subtitle = container.querySelector('.hero-subtitle');
    const cta = container.querySelector('.hero-cta');

    const tl = gsap.timeline();

    tl.to(words, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.06,
      ease: 'power4.out',
    })
    .to(subtitle, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.8')
    .to(cta, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.5)',
    }, '-=0.6');

    // Parallax background on scroll
    const bgAnim = gsap.to(bg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      tl.kill();
      bgAnim.kill();
      if (bgAnim.scrollTrigger) bgAnim.scrollTrigger.kill();
    };
  }, []);

  const splitWords = (text) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className="word-wrap mr-[0.25em] inline-block">
        <span className="word inline-block translate-y-[110%] opacity-0">{word}</span>
      </span>
    ));
  };

  return (
    <section 
      ref={containerRef} 
      className="hero-container relative h-[95vh] min-h-[600px] flex items-center justify-start overflow-hidden bg-cara-ink text-white"
    >
      {/* Parallax Background Image */}
      <div className="absolute inset-0 z-0 scale-110">
        <img 
          ref={bgRef}
          src="/products/2.png" 
          alt="Apple Premium Ecosystem" 
          className="hero-bg w-full h-full object-cover object-center opacity-40 brightness-75 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cara-ink via-cara-ink/60 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cara-ink to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="max-w-[1400px] mx-auto w-full px-8 md:px-12 lg:px-24 z-10 select-none">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6 opacity-80">
            <span className="h-[2px] w-8 bg-cara-accent"></span>
            <span className="text-xs uppercase tracking-[0.25em] text-cara-accent-alt font-bold">NEXUS PREMIUM ECOSYSTEM</span>
          </div>

          {/* Heading with word splits */}
          <h1 className="hero-title text-[3.25rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] font-bold leading-[0.95] tracking-tight uppercase select-none mb-8 text-cara-surface">
            {splitWords("NEW TECH")}
            <br />
            {splitWords("NEW STYLE")}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle translate-y-8 opacity-0 text-lg sm:text-xl md:text-2xl text-cara-cream/80 font-normal leading-relaxed max-w-xl mb-12">
            Đột phá phong cách trải nghiệm thiết bị công nghệ đỉnh cao. Trải nghiệm mua sắm kỹ thuật số cá nhân hóa tích hợp trí tuệ nhân tạo.
          </p>

          {/* CTA with Magnetic */}
          <div className="hero-cta translate-y-8 opacity-0">
            <Magnetic strength={0.25}>
              <a 
                href="/store"
                className="ch-hoverable inline-flex items-center justify-center gap-4 bg-cara-accent hover:bg-cara-accent-alt text-white font-semibold text-base px-10 py-5 rounded-full uppercase tracking-wider transition-colors duration-300"
              >
                <span>Khám phá Store</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-8 right-12 z-10 flex flex-col items-center gap-4">
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-40 [writing-mode:vertical-lr]">Scroll to discover</span>
        <div className="w-[1.5px] h-12 bg-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-cara-accent-alt animate-scroll-indicator"></div>
        </div>
      </div>
    </section>
  );
};

export default CaraHero;
