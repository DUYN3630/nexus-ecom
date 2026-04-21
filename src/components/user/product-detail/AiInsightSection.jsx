import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { runChat } from '../../../api/geminiApi';

const AiInsightSection = ({ productName, productPrice, productDescription }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [insight, setInsight] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!productName || !productDescription) return;
      
      try {
        setLoading(true);
        const prompt = `Phân tích sản phẩm "${productName}" với mô tả "${productDescription}". Hãy đưa ra 2 điểm nổi bật nhất (insight) của sản phẩm này dưới dạng danh sách ngắn gọn (tối đa 15 từ mỗi điểm). Chỉ trả về văn bản, mỗi điểm một dòng, không đánh số.`;
        
        const response = await runChat(prompt);
        if (response) {
          const lines = response.split('\n').filter(line => line.trim().length > 0).slice(0, 2);
          setInsight(lines);
        } else {
          setInsight([
            "Hiệu năng mạnh mẽ vượt trội trong phân khúc.",
            "Thiết kế tinh tế và trải nghiệm người dùng tối ưu."
          ]);
        }
      } catch (error) {
        console.error("AI Insight Error:", error);
        setInsight([
          "Trải nghiệm công nghệ đỉnh cao cùng thiết kế hiện đại.",
          "Tối ưu hóa năng suất và giải trí không giới hạn."
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [productName, productDescription]);

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(productPrice);

  return (
    <section 
      ref={sectionRef}
      id="ai-insight" 
      className="py-20 md:py-40 bg-[#F9F9FB] px-6 overflow-hidden"
    >
      <div className="max-w-[1000px] mx-auto">
        <div className={`bg-white p-8 md:p-24 rounded-[3rem] md:rounded-[4rem] shadow-sm relative overflow-hidden group border border-black/[0.02] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full group-hover:bg-purple-400/20 transition-all duration-[2000ms]"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start text-left">
            <div className="md:col-span-7 space-y-8 md:space-y-10">
              <h3 className="text-3xl md:text-4xl font-[1000] tracking-tighter uppercase italic leading-none">
                {productName}
              </h3>
              
              <div className="p-6 md:p-8 bg-[#FBFBFE] rounded-3xl border border-black/[0.02] space-y-6">
                <div className="flex items-center gap-3 text-blue-600">
                  <Sparkles size={20} className={loading ? "animate-pulse" : ""} />
                  <span className="text-xs font-black uppercase tracking-widest">AI's Insight</span>
                </div>
                
                {loading ? (
                  <div className="flex items-center gap-3 text-[#6E6E73] text-sm animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                    Đang phân tích dữ liệu...
                  </div>
                ) : (
                  <ul className="space-y-4 text-sm font-medium text-[#6E6E73] list-none">
                    {insight.map((point, index) => (
                      <li 
                        key={index} 
                        className={`flex gap-4 items-start transition-all duration-700 delay-[${index * 200}ms] ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                      >
                        <Check size={16} className="text-black shrink-0 mt-1" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="md:col-span-5 pt-0 md:pt-10">
              <p className="text-xs font-bold text-[#86868B] uppercase tracking-widest">Starting From</p>
              <p className="text-4xl md:text-6xl font-[1000] tracking-tighter">
                {typeof productPrice === 'number' ? formattedPrice : 'Liên hệ'}
              </p>
              <button className="mt-8 md:mt-12 w-full py-5 md:py-6 bg-black text-white rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all active:scale-95">
                Chọn bản sắc của bạn
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiInsightSection;
