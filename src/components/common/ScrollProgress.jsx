import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ScrollProgress = () => {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Reset initial scaling
    gsap.set(bar, { scaleX: 0 });

    const scrollAnim = gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1, // very quick scrub response
      },
    });

    return () => {
      if (scrollAnim.scrollTrigger) {
        scrollAnim.scrollTrigger.kill();
      }
      scrollAnim.kill();
    };
  }, []);

  return <div ref={barRef} id="ch-progress" />;
};

export default ScrollProgress;
