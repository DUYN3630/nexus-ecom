import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tv, Speaker, Play, 
  ArrowRight, Sparkles, Zap, 
  Music, Gamepad2, Home,
  Volume2
} from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductGridSection from '../../components/common/ProductGridSection';

const TVEntertainmentListingPage = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();

  const tvProducts = products ? products.filter(p => 
    p.category?.slug === 'tv' || 
    p.category?.slug === 'tv-ent' ||
    ['tv', 'homepod', 'apple tv'].some(kw => p.name.toLowerCase().includes(kw))
  ) : [];

  if (isLoading) return <LoadingSpinner spinnerColor="border-t-slate-900" />;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-50 font-sans overflow-x-hidden pt-24">
      
      {/* SECTION 1: MODERN HOME HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-[#F5F5F7] overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img
             src="/products/4k-hdr.jpg"
             className="w-full h-full object-cover opacity-80"
             alt="Modern Living Room"
           />           <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-10 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-6 space-y-10 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                 <Sparkles size={14} /> Kỷ nguyên Smart Home
              </div>
              
              <h1 className="text-7xl md:text-8xl font-[1000] tracking-tighter leading-[0.9] text-slate-900 italic uppercase">
                NGHỆ THUẬT<br/><span className="text-slate-400">GIẢI TRÍ.</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium italic">
                Biến phòng khách thành rạp phim chuyên nghiệp với sự kết hợp của hình ảnh 4K HDR và âm thanh không gian sống động.
              </p>

              <div className="flex items-center gap-8 pt-6">
                 <button onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                    Khám phá thiết bị
                 </button>
              </div>
           </div>
        </div>

        <div className="absolute bottom-10 right-10 z-10 flex flex-col items-end text-right space-y-2 border-r-2 border-slate-900 pr-6">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Apple TV 4K</p>
           <p className="text-sm font-bold text-slate-900 italic">Chuẩn mực điện ảnh 2026</p>
        </div>
      </section>

      {/* SECTION 2: TECHNICAL EXCELLENCE */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10 text-left">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-12">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Zap size={32} />
                 </div>
                 <h2 className="text-7xl font-[1000] tracking-tighter italic leading-[0.9]">4K HDR.<br/>Dolby Atmos.</h2>
                 <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
                    Hình ảnh sắc nét đến từng chi tiết với chuẩn 4K HDR10+ và Dolby Vision. Âm thanh vòm không gian cho cảm giác đắm chìm tuyệt đối.
                 </p>
              </div>
              <img src="/products/tv-4k-hdr.jpg" className="w-full rounded-[3.5rem] shadow-2xl transition-all duration-1000" alt="Sound Tech" />
           </div>
        </div>
      </section>

      {/* SECTION 3: HOMEPOD SYMPHONY */}
      <section className="py-40 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-20 items-center text-left">
           <div className="lg:col-span-5 space-y-12">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                 <Volume2 size={40} />
              </div>
              <h3 className="text-6xl font-black tracking-tighter italic leading-tight uppercase">HomePod.<br/><span className="text-blue-400">Âm thanh 360°.</span></h3>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">Đỉnh cao âm thanh. Tự động phân tích không gian để mang lại âm trầm sâu lắng và âm cao trong trẻo tuyệt đối.</p>
           </div>
           <div className="lg:col-span-7">
              <img src="/products/homepod.jpg" className="relative z-10 w-full rounded-[4rem] shadow-2xl" alt="HomePod" />
           </div>        </div>
      </section>

      {/* SECTION 4: ENTERTAINMENT SERVICES */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10 text-center space-y-24">
           <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-7xl font-[1000] tracking-tighter italic uppercase">Tất cả trong một.</h2>
              <p className="text-xl text-slate-500 font-medium">Từ phim bom tấn trên Apple TV+ đến hàng nghìn trò chơi trên Arcade và âm nhạc đỉnh cao trên Apple Music.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              {[
                { title: 'Apple TV+', icon: Tv, color: 'text-red-500', desc: 'Chương trình gốc đoạt giải thưởng.' },
                { title: 'Apple Music', icon: Music, color: 'text-pink-500', desc: 'Hơn 100 triệu bài hát Spatial Audio.' },
                { title: 'Apple Arcade', icon: Gamepad2, color: 'text-orange-500', desc: 'Chơi game đỉnh cao không quảng cáo.' }
              ].map((item, i) => (
                <div key={i} className="group p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-700">
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-10 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <item.icon size={32} strokeWidth={1.5} />
                   </div>
                   <h4 className="text-2xl font-black mb-4 uppercase">{item.title}</h4>
                   <p className="text-slate-500 font-medium mb-10 italic">{item.desc}</p>
                   <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                      Trải nghiệm ngay <ArrowRight size={16} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 5: SMART HUB */}
      <section className="py-40 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-left">
           <div className="relative order-2 lg:order-1">
              <img src="/products/trungtamnhathongminh.jpg" className="w-full rounded-[3.5rem] shadow-2xl" alt="Smart Home" />
           </div>
           <div className="space-y-12 order-1 lg:order-2">
              <div className="w-20 h-20 bg-white text-emerald-600 rounded-3xl flex items-center justify-center shadow-sm border border-slate-100">
                 <Home size={40} />
              </div>
              <h3 className="text-6xl font-black tracking-tighter italic leading-tight">Trung tâm nhà<br/>thông minh.</h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed italic">Điều khiển đèn, camera và thiết bị tương thích Matter ngay từ màn hình TV hoặc qua Siri.</p>
           </div>
        </div>
      </section>

      {/* SECTION 6: PRODUCTS — SHARED COMPONENT */}
      <ProductGridSection
        products={tvProducts}
        label="The Lineup"
        title="Bộ sưu tập giải trí."
        accentColor="blue"
        buttonText="Xem toàn bộ"
        buttonLink="/store"
        sectionBg="bg-white"
        cardProps={{ 
          defaultBenefit: 'Đỉnh cao công nghệ giải trí tại gia.',
          aspectRatio: 'aspect-video',
          imageBg: 'bg-black'
        }}
      />

      {/* SECTION 7: CONCLUSION */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-10 text-center relative z-10 space-y-16">
          <h2 className="text-7xl md:text-8xl font-[1000] tracking-tighter italic leading-none uppercase">Nâng tầm<br/>không gian sống.</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <button className="px-16 py-7 bg-white text-black rounded-full text-[11px] font-black uppercase hover:bg-blue-50 transition-all shadow-2xl">
              Tư vấn giải pháp gia đình
            </button>
            <button onClick={() => navigate('/support')} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-b border-white/10 pb-2">
              Chính sách lắp đặt tận nơi
            </button>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-white text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1.5em] italic">NEXUS • TV & ENTERTAINMENT • 2026</p>
      </footer>
    </div>
  );
};

export default TVEntertainmentListingPage;