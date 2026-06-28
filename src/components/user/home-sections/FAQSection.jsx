import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, HelpCircle, ShieldCheck, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  {
    id: 1,
    question: "Sản phẩm có chính hãng không?",
    answer: "Tất cả sản phẩm tại Nexus Store đều là hàng chính hãng Apple Việt Nam (Mã VN/A), mới 100%, nguyên seal và đầy đủ hóa đơn VAT. Chúng tôi cam kết đền bù 200% nếu phát hiện hàng giả."
  },
  {
    id: 2,
    question: "Chế độ bảo hành như thế nào?",
    answer: "Sản phẩm được bảo hành tiêu chuẩn 12 tháng tại các trung tâm bảo hành ủy quyền của Apple (AASP) trên toàn quốc. Nexus còn tặng thêm gói bảo hành vàng 6 tháng cho mọi lỗi phần cứng."
  },
  {
    id: 3,
    question: "Chính sách đổi trả trong bao lâu?",
    answer: "Lỗi là đổi! Chúng tôi cam kết 1 đổi 1 trong vòng 30 ngày đầu nếu phát hiện lỗi từ nhà sản xuất. Thủ tục đơn giản, xử lý ngay trong ngày tại hệ thống cửa hàng."
  },
  {
    id: 4,
    question: "Hỗ trợ trả góp 0% lãi suất không?",
    answer: "Có! Chúng tôi hỗ trợ trả góp 0% qua thẻ tín dụng của hơn 25 ngân hàng hoặc qua các công ty tài chính uy tín như Home Credit, FE Credit với thủ tục xét duyệt chỉ 15 phút."
  }
];

const FAQSection = () => {
  const [openId, setOpenId] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Force ScrollTrigger to refresh after a brief delay for dynamic content height stability
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    const anim = gsap.fromTo(
      container.querySelectorAll('.animate-on-scroll'),
      { y: 40, opacity: 0, filter: 'blur(4px)' },
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
    <section ref={containerRef} className="py-32 bg-transparent">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        
        {/* Header section */}
        <div className="text-center mb-20 space-y-4 animate-on-scroll">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">Hỗ trợ khách hàng</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">
            Giải đáp <br/> thắc mắc
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div 
              key={faq.id} 
              className={`animate-on-scroll group border-b border-slate-100/80 transition-all duration-500 ${
                openId === faq.id ? 'pb-8' : 'pb-4'
              }`}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between py-4 text-left focus:outline-none group"
              >
                <span className={`text-base font-black tracking-tight transition-colors duration-300 ${
                  openId === faq.id ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-500'
                }`}>
                  {faq.question}
                </span>
                <div className={`transition-all duration-500 ${
                  openId === faq.id ? 'rotate-180 text-indigo-600' : 'text-slate-300'
                }`}>
                  <ChevronDown size={20} strokeWidth={2.5} />
                </div>
              </button>
              
              <div 
                className={`grid transition-all duration-500 ease-in-out ${
                  openId === faq.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pt-2 text-[14px] leading-relaxed text-slate-500 font-medium max-w-2xl">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;