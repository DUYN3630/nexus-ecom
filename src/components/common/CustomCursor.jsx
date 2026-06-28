import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Hide standard cursor on desktop
    document.body.classList.add('has-custom-cursor');

    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    // Set initial positions
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    // Optimized mouse follower using quickTo
    const xToDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const yToDot = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });

    const xToRing = gsap.quickTo(ring, 'x', { duration: 0.25, ease: 'power3.out' });
    const yToRing = gsap.quickTo(ring, 'y', { duration: 0.25, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      xToDot(e.clientX);
      yToDot(e.clientY);
      xToRing(e.clientX);
      yToRing(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Hover effect on links and interactive elements
    const handleMouseOver = (e) => {
      const target = e.target;
      const isHoverable = 
        target.tagName === 'A' || 
        target.closest('a') ||
        target.tagName === 'BUTTON' || 
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.closest('.ch-hoverable') ||
        target.closest('input[type="submit"]');

      if (isHoverable) {
        gsap.to(ring, {
          width: 56,
          height: 56,
          backgroundColor: 'rgba(15, 23, 42, 0.1)',
          borderColor: 'transparent',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, {
          scale: 1.5,
          backgroundColor: '#4F46E5',
          duration: 0.3,
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      const isHoverable = 
        target.tagName === 'A' || 
        target.closest('a') ||
        target.tagName === 'BUTTON' || 
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.closest('.ch-hoverable') ||
        target.closest('input[type="submit"]');

      if (isHoverable) {
        gsap.to(ring, {
          width: 32,
          height: 32,
          backgroundColor: 'transparent',
          borderColor: '#0F172A',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, {
          scale: 1,
          backgroundColor: '#0F172A',
          duration: 0.3,
        });
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="ch-cursor" />
      <div ref={ringRef} className="ch-cursor-ring" />
    </>
  );
};

export default CustomCursor;
