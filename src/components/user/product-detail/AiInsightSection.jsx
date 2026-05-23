import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Loader2, Cpu, Zap, Shield, Zap as ZapIcon } from 'lucide-react';
import { runChat } from '../../../api/geminiApi';
import { formatCurrency } from '../../../utils/formatCurrency';

const AiInsightSection = ({ productName, productPrice, productDescription, productImage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [insightData, setInsightData] = useState({ headline: '', points: [] });
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [isVisible]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!productName || !productDescription) return;
      
      try {
        setLoading(true);
        const prompt = `Bạn là một chuyên gia marketing của Apple. Hãy phân tích sản phẩm "${productName}" với mô tả "${productDescription}". 
        Hãy tạo ra 1 tiêu đề ngắn gọn cực kỳ ấn tượng (tối đa 5 từ) và 3 điểm nổi bật thực sự thu hút khách hàng (mỗi điểm tối đa 12 từ).
        Định dạng trả về duy nhất là JSON: {"headline": "...", "points": ["...", "...", "..."]}`;
        
        const response = await runChat(prompt);
        if (response) {
          // Trích xuất JSON từ phản hồi (đôi khi AI bao bọc trong ```json)
          const jsonMatch = response.match(/\{.*\}/s);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            setInsightData(data);
          }
        }
      } catch (error) {
        console.error("AI Insight Error:", error);
        setInsightData({
          headline: "Đỉnh cao công nghệ.",
          points: [
            "Trải nghiệm sức mạnh vượt trội từ thế hệ chip mới nhất.",
            "Thiết kế tinh xảo đến từng đường nét hoàn mỹ.",
            "Tối ưu hóa hoàn hảo cho mọi nhu cầu chuyên nghiệp."
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [productName, productDescription]);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-32"
    >
      {/* Background with Parallax */}
      <div 
        className="absolute inset-0 bg-stone-900"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(28, 28, 30, 0.4), rgba(28, 28, 30, 0.95)), url(${productImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${(scrollY - (sectionRef.current?.offsetTop || 0)) * 0.1}px) scale(1.1)`
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          {/* Left: Headline & Description */}
          <div className="lg:col-span-7 space-y-12">
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
               <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                  <Sparkles size={12} className="text-blue-400" /> Nexus Dynamic Insight
               </span>
               
               {loading ? (
                 <div className="space-y-6">
                    <div className="h-20 w-3/4 bg-white/5 rounded-2xl animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse" />
                 </div>
               ) : (
                 <>
                   <h2 className="text-6xl md:text-8xl font-serif italic text-white leading-none tracking-tighter">
                     {insightData.headline.split(' ').slice(0, -1).join(' ')} <br />
                     <span className="text-blue-400">{insightData.headline.split(' ').slice(-1)}</span>
                   </h2>
                   <p className="mt-8 text-xl text-stone-400 font-light max-w-xl leading-relaxed italic">
                     "{productDescription?.slice(0, 120)}..."
                   </p>
                 </>
               )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/10 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="space-y-2">
                   <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                      <Cpu size={20} />
                   </div>
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Hiệu năng</h4>
                   <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tight">Vượt xa giới hạn</p>
                </div>
                <div className="space-y-2">
                   <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                      <ZapIcon size={20} />
                   </div>
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Tốc độ</h4>
                   <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tight">Phản hồi tức thì</p>
                </div>
                <div className="space-y-2">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                      <Shield size={20} />
                   </div>
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Bền bỉ</h4>
                   <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tight">Tiêu chuẩn quân đội</p>
                </div>
            </div>
          </div>

          {/* Right: AI Insights List */}
          <div className="lg:col-span-5">
             <div className={`bg-white/5 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[48px] space-y-10 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="space-y-2 text-center md:text-left">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Trí tuệ nhân tạo</p>
                   <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Tại sao nên chọn?</h3>
                </div>

                <div className="space-y-6">
                   {loading ? (
                     [1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)
                   ) : (
                     insightData.points.map((point, i) => (
                       <div key={i} className="flex gap-5 items-start group">
                          <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                             <Check size={14} />
                          </div>
                          <p className="text-sm md:text-base text-stone-300 font-medium leading-relaxed">
                             {point}
                          </p>
                       </div>
                     ))
                   )}
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div>
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Giá khởi điểm</p>
                      <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(productPrice)}</p>
                   </div>
                   <button className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all shadow-2xl active:scale-95">
                      Mua ngay
                   </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AiInsightSection;
