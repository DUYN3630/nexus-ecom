import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ArrowRight, Sparkles, Zap, 
  Headphones, Shield, Search
} from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductGridSection from '../../components/common/ProductGridSection';

const AccessoriesListingPage = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();

  const accProducts = products ? products.filter(p => 
    p.category?.slug === 'acc' || 
    p.category?.slug === 'accessories' ||
    ['airpods', 'case', 'magsafe', 'airtag', 'power', 'cable', 'pencil', 'keyboard', 'mouse'].some(kw => p.name.toLowerCase().includes(kw))
  ) : [];

  if (isLoading) return <LoadingSpinner spinnerColor="border-t-indigo-600" />;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-100 font-sans overflow-x-hidden pt-24">
      
      {/* SECTION 1: LIFESTYLE HERO */}
      <section className="relative min-h-[85vh] flex items-center bg-[#FAF9F6] overflow-hidden px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10 text-left relative z-10 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                 <Sparkles size={14} className="text-amber-500" /> Essential Complements
              </div>
              
              <h1 className="text-7xl md:text-8xl font-[1000] tracking-tighter leading-[0.9] text-slate-900 italic uppercase">
                HOÀN THIỆN<br/><span className="text-slate-300">PHONG CÁCH.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium italic">
                Định hình cá tính và nâng tầm trải nghiệm công nghệ của bạn bằng những món phụ kiện được chế tác tinh xảo.
              </p>

              <div className="flex gap-6 pt-4">
                 <button onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                    Khám phá ngay
                 </button>
              </div>
           </div>

           <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="absolute inset-0 bg-amber-200/10 blur-[120px] rounded-full"></div>
              <img 
                src="/products/haonthienphongcach.jpg" 
                className="relative z-10 w-full max-lg:max-w-md rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-transform duration-1000 group-hover:scale-105" 
                alt="Accessories Hero" 
              />
           </div>
        </div>
      </section>

      {/* SECTION 2: AUDIO WORLD */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center text-left">
              <div className="lg:col-span-7">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-50 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <img src="/products/amthanhbaoquanhban.jpg" className="relative z-10 w-full rounded-[4rem] shadow-2xl" alt="AirPods Max" />
                 </div>
              </div>
              <div className="lg:col-span-5 space-y-12">
                 <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Headphones size={32} />
                 </div>
                 <h2 className="text-6xl font-black tracking-tighter italic leading-tight">Âm thanh.<br/>Bao quanh bạn.</h2>
                 <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
                    Trải nghiệm AirPods với âm thanh Spatial Audio. Khử tiếng ồn thông minh cho bạn chìm đắm trong thế giới riêng.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 3: PROTECTION & MATERIAL */}
      <section className="py-40 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-left">
           <div className="space-y-12">
              <div className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                 <Shield size={32} />
              </div>
              <h3 className="text-6xl font-black tracking-tighter italic leading-tight">Bảo vệ.<br/>Với chất liệu cao cấp.</h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Từ vải FineWoven mềm mại đến Silicone bền bỉ. Mỗi chiếc ốp lưng đều trải qua hàng nghìn giờ thử nghiệm để bảo vệ iPhone của bạn khỏi trầy xước và va đập.
              </p>
              <div className="flex gap-4">
                 {['Da thuộc', 'FineWoven', 'Silicone', 'Nhựa trong'].map((m, i) => (
                   <span key={i} className="px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">{m}</span>
                 ))}
              </div>
           </div>
           <div className="relative">
              <img src="/products/Bảovệvoichatlieucaocap.jpg" className="w-full rounded-[3.5rem] shadow-2xl transition-all duration-1000 hover:rotate-2" alt="Case Protection" />
           </div>
        </div>
      </section>

      {/* SECTION 4: MAGSAFE MAGIC */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-12 gap-20 items-center text-left">
           <div className="lg:col-span-7">
              <img src="/products/MagSafe.jpg" className="w-full rounded-[4rem] shadow-2xl" alt="MagSafe Ecosystem" />
           </div>
           <div className="lg:col-span-5 space-y-12">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <Zap size={32} />
              </div>
              <h3 className="text-6xl font-black tracking-tighter italic leading-tight">MagSafe.<br/>Hít. Sạc. Xong.</h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
                Hệ thống nam châm căn chỉnh hoàn hảo, giúp sạc không dây nhanh hơn và kết nối các phụ kiện như ví da, sạc dự phòng một cách chắc chắn.
              </p>
           </div>
        </div>
      </section>

      {/* SECTION 5: AIRTAG - FIND EVERYTHING */}
      <section className="py-40 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#ffffff_1px,_transparent_1px)] bg-[length:40px_40px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-left">
           <div className="space-y-12">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl">
                 <Search size={40} />
              </div>
              <h3 className="text-6xl font-black tracking-tighter italic leading-tight">AirTag.<br/>Tìm là thấy.</h3>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">
                Gắn AirTag vào chìa khóa hoặc ba lô. Nếu thất lạc, bạn có thể tìm thấy chúng dễ dàng thông qua ứng dụng Tìm (Find My) với độ chính xác đến từng centimet.
              </p>
           </div>
           <img src="/products/leca.jpg" className="w-full rounded-[3rem] shadow-2xl" alt="AirTag" />
        </div>
      </section>

      {/* SECTION 6: PRODUCT MATRIX — SHARED COMPONENT */}
      <ProductGridSection
        products={accProducts}
        label="Accessory Lineup"
        title="Chọn phụ kiện cho bạn."
        accentColor="indigo"
        buttonText="Xem toàn bộ sản phẩm"
        buttonLink="/store"
        sectionBg="bg-white"
        columns={4}
        maxItems={8}
        cardProps={{ 
          defaultBenefit: 'Phụ kiện chính hãng được Apple thiết kế.',
          cardPadding: 'p-6',
          cardRadius: 'rounded-[2rem]',
          titleSize: 'text-lg'
        }}
      />

      {/* SECTION 7: CONCLUSION */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-10 text-center relative z-10 space-y-16">
          <div className="space-y-6">
            <h2 className="text-7xl md:text-8xl font-[1000] tracking-tighter italic leading-none">Chất riêng<br/>của bạn.</h2>
            <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.6em]">Trợ lý AI luôn sẵn sàng hỗ trợ 24/7</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 pt-10">
            <button className="px-16 py-7 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-indigo-50 transition-all flex items-center gap-4 shadow-2xl">
              <ShoppingBag size={20} className="text-indigo-600" /> Tư vấn phối đồ
            </button>
            <button onClick={() => navigate('/support')} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-b border-white/10 pb-2">
              Chính sách bảo hành phụ kiện
            </button>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-white text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1.5em] italic">NEXUS • ACCESSORIES • 2026</p>
      </footer>
    </div>
  );
};

export default AccessoriesListingPage;