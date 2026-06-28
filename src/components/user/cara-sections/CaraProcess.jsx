import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CaraProcess = () => {
  const containerRef = useRef(null);
  const progressLineRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const line = progressLineRef.current;
    if (!container || !line) return;

    // Progress line scroll animation (fills from 0% height to 100% height)
    const lineAnim = gsap.fromTo(line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 60%',
          end: 'bottom 80%',
          scrub: true,
        }
      }
    );

    // Staggered entry for step items and parallax numbers
    const steps = container.querySelectorAll('.process-step');
    steps.forEach((step, index) => {
      const ghostNum = step.querySelector('.step-ghost');
      const content = step.querySelector('.step-content');

      // Light up steps on scroll trigger
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        onEnter: () => step.classList.add('is-active'),
        onLeaveBack: () => step.classList.remove('is-active'),
      });

      // Subtle parallax movement for background numbers
      if (ghostNum) {
        gsap.fromTo(ghostNum,
          { yPercent: 15 },
          {
            yPercent: -15,
            ease: 'none',
            scrollTrigger: {
              trigger: step,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      }
    });

    return () => {
      lineAnim.kill();
      if (lineAnim.scrollTrigger) lineAnim.scrollTrigger.kill();
    };
  }, []);

  const stepsData = [
    {
      num: '01',
      title: 'Khám Phá Thiết Bị',
      desc: 'Duyệt qua danh mục thiết bị Apple đa dạng được tinh chỉnh sẵn sàng. Giao diện tối giản giúp bạn tập trung hoàn toàn vào chi tiết sản phẩm.',
    },
    {
      num: '02',
      title: 'Tư Vấn Thông Minh AI',
      desc: 'Nhận hỗ trợ kỹ thuật và đề xuất cấu hình trực tiếp từ Trợ lý AI Genius hoặc các kỹ thuật viên cao cấp để tìm thấy sản phẩm hoàn hảo.',
    },
    {
      num: '03',
      title: 'Thanh Toán Linh Hoạt',
      desc: 'Giỏ hàng thông minh, quy trình thanh toán một trang bảo mật cao và tiện lợi tích hợp đầy đủ hình thức chuyển khoản, ví điện tử.',
    },
    {
      num: '04',
      title: 'Hậu Mãi & Bảo Hành',
      desc: 'Giao hàng hỏa tốc trong 2 giờ, theo dõi hồ sơ thiết bị (Medical Record) trọn đời và hỗ trợ sửa chữa bảo trì định kỳ chu đáo.',
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-24 bg-cara-surface overflow-hidden relative select-none"
    >
      <div className="max-w-[1200px] mx-auto px-8 md:px-12">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="text-xs uppercase tracking-[0.25em] text-cara-accent font-bold mb-3">HÀNH TRÌNH TRẢI NGHIỆM</div>
          <h2 className="text-4xl md:text-5xl font-bold text-cara-ink tracking-tight uppercase">
            Quy trình mua sắm
          </h2>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical progress bar line */}
          <div className="absolute left-[30px] md:left-1/2 top-4 bottom-4 w-[2px] bg-black/5 -translate-x-1/2 z-0">
            <div 
              ref={progressLineRef}
              className="w-full h-full bg-cara-accent origin-top scale-y-0"
              style={{ willChange: 'transform' }}
            />
          </div>

          {/* Steps List */}
          <div className="space-y-24 relative z-10">
            {stepsData.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={idx}
                  className={`process-step flex flex-col md:flex-row items-start justify-between relative group ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Badge */}
                  <div className="absolute left-[30px] md:left-1/2 top-1 w-8 h-8 rounded-full border-2 border-cara-cream bg-cara-surface flex items-center justify-center -translate-x-1/2 z-20 transition-all duration-500 group-[.is-active]:border-cara-accent group-[.is-active]:bg-cara-accent text-[11px] font-bold text-cara-muted group-[.is-active]:text-white">
                    {idx + 1}
                  </div>

                  {/* Empty Spacer side for Desktop */}
                  <div className="hidden md:block w-[42%]" />

                  {/* Content side */}
                  <div className="w-full md:w-[42%] pl-16 md:pl-0 pt-0.5 relative step-content">
                    {/* Ghost Background Number */}
                    <div className="step-ghost absolute -top-8 -left-6 md:-top-12 md:-left-12 text-[7rem] md:text-[9rem] font-extrabold text-black/[0.02] pointer-events-none select-none z-0 transition-colors duration-500 group-[.is-active]:text-cara-accent/[0.04]">
                      {step.num}
                    </div>

                    <div className="relative z-10">
                      <span className="text-xs uppercase tracking-widest text-cara-muted group-[.is-active]:text-cara-accent transition-colors duration-500 font-bold block mb-2">
                        BƯỚC {step.num}
                      </span>
                      <h3 className="text-2xl font-bold text-cara-ink tracking-tight mb-3">
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base text-cara-muted leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaraProcess;
