import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CaraStats = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const counters = container.querySelectorAll('.stat-count');
    const scrollAnims = [];

    counters.forEach((counter) => {
      const targetVal = parseInt(counter.getAttribute('data-target'), 10);
      const isPercentage = counter.getAttribute('data-percent') === 'true';
      const isPlus = counter.getAttribute('data-plus') === 'true';

      const obj = { val: 0 };
      const anim = gsap.to(obj, {
        val: targetVal,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: counter,
          start: 'top 85%',
        },
        onUpdate: () => {
          let suffix = '';
          if (isPercentage) suffix = '%';
          if (isPlus) suffix = '+';
          counter.textContent = Math.floor(obj.val).toLocaleString('vi-VN') + suffix;
        },
      });

      scrollAnims.push(anim);
    });

    // Staggered slide up of block entries
    const items = container.querySelectorAll('.stat-item');
    const entryAnim = gsap.fromTo(items,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
        }
      }
    );

    return () => {
      scrollAnims.forEach(anim => {
        anim.kill();
        if (anim.scrollTrigger) anim.scrollTrigger.kill();
      });
      entryAnim.kill();
      if (entryAnim.scrollTrigger) entryAnim.scrollTrigger.kill();
    };
  }, []);

  const stats = [
    {
      label: 'Khách hàng tin chọn',
      target: 2500,
      plus: true,
      desc: 'Người dùng công nghệ sở hữu thiết bị cao cấp từ hệ thống.',
    },
    {
      label: 'Hỗ trợ kỹ thuật AI',
      target: 99,
      percent: true,
      desc: 'Tỷ lệ phản hồi chính xác của AI chat và chuyên gia.',
    },
    {
      label: 'Sản phẩm tinh tuyển',
      target: 400,
      plus: true,
      desc: 'Thiết bị & phụ kiện chính hãng Apple bảo hành toàn diện.',
    },
    {
      label: 'Đơn hàng hỏa tốc',
      target: 120,
      plus: true,
      desc: 'Số lượng đơn hàng giao nhanh nội thành mỗi ngày.',
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-20 bg-cara-ink text-white overflow-hidden relative select-none"
    >
      {/* Decorative dark grid background */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-item flex flex-col justify-start items-start">
              <span className="text-xs uppercase tracking-widest text-cara-accent-alt font-bold mb-3">
                {stat.label}
              </span>
              <div 
                className="stat-count text-[2.75rem] sm:text-[3.5rem] md:text-[4.5rem] font-bold text-cara-surface tracking-tight mb-2"
                data-target={stat.target}
                data-percent={stat.percent}
                data-plus={stat.plus}
              >
                0
              </div>
              <p className="text-xs sm:text-sm text-cara-cream/50 leading-relaxed max-w-[220px]">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaraStats;
