import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pencil, Palette, Monitor, Play, 
  Sparkles, Zap, ArrowRight, Cpu
} from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductGridSection from '../../components/common/ProductGridSection';

const IPAD_MODES = [
  { id: 'draw', title: 'Studio Hội họa', icon: Palette, desc: 'Với Apple Pencil Pro, iPad trở thành bảng vẽ chuyên nghiệp với phản hồi rung và cảm ứng xoay.' },
  { id: 'work', title: 'Máy tính Cá nhân', icon: Monitor, desc: 'Gắn Magic Keyboard mới với dãy phím chức năng và trackpad haptic rộng lớn.' },
  { id: 'play', title: 'Rạp phim Di động', icon: Play, desc: 'Hệ thống âm thanh 4 loa và màn hình Tandem OLED cho trải nghiệm điện ảnh mọi nơi.' }
];

const IPadListingPage = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();

  const ipadProducts = products ? products.filter(p => p.category?.slug === 'ipad' || p.name.toLowerCase().includes('ipad')) : [];

  if (isLoading) return <LoadingSpinner spinnerColor="border-t-slate-900" />;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-pink-100 font-sans overflow-x-hidden">
      
      {/* SECTION 1: STUDIO WHITE HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden pt-32 pb-20 px-6">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#f8fafc_0%,_#ffffff_70%)]"></div>
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
           <div className="mb-12 inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-slate-100 bg-slate-50/50 text-slate-400">
              <Sparkles size={14} className="text-pink-500" /> 
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">The New iPad Pro</span>
           </div>
           <div className="text-center space-y-4 mb-20">
              <h1 className="text-7xl md:text-[9rem] font-light tracking-tight leading-none text-slate-900">
                Tuyệt tác <span className="font-serif italic font-medium text-pink-500">mỏng nhẹ.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-tight text-center">Sức mạnh không tưởng từ Chip M4.</p>
           </div>
           <div className="relative w-full max-w-6xl group">
              <div className="absolute -inset-10 bg-slate-100/50 blur-[100px] rounded-full opacity-50 transition-opacity"></div>
              <img src="/products/iPad-Pro-M2-cover.jpg" alt="iPad Pro" className="relative z-10 w-full rounded-[2rem] md:rounded-[3rem] shadow-[0_100px_150px_-40px_rgba(0,0,0,0.12)] border-[6px] border-white" />
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 hidden lg:flex flex-col items-start space-y-4 p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xl z-20">
                 <div className="w-10 h-px bg-pink-500"></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Độ mỏng kỷ lục</p>
                 <p className="text-4xl font-light text-slate-900 italic">5.1<span className="text-sm font-bold ml-1">mm</span></p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 2: CHIP M4 */}
      <section className="py-60 bg-slate-950 text-white relative overflow-hidden text-left">
        <div className="max-w-7xl mx-auto px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
           <div className="space-y-12">
              <Cpu size={48} className="text-pink-500" />
              <h2 className="text-7xl font-black tracking-tighter italic leading-tight">Chip M4.<br/><span className="text-pink-500">Sức mạnh AI.</span></h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">Tiến trình 3nm thế hệ thứ hai mang lại hiệu năng Render 3D nhanh hơn gấp 4 lần.</p>
           </div>
           <img src="/products/chipm4ipad.jpg" className="relative z-10 w-full rounded-[3rem] border border-white/10 shadow-2xl" alt="M4 Core" />
        </div>
      </section>

      {/* SECTION 3: MODULAR TRANSFORMATION */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10">
           <h2 className="text-6xl font-black italic tracking-tighter text-center mb-32">Biến hình không giới hạn.</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              {IPAD_MODES.map((mode) => (
                <div key={mode.id} className="group p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-pink-100/30 transition-all duration-700">
                   <div className="w-20 h-20 rounded-[2rem] bg-white shadow-sm flex items-center justify-center mb-10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all"><mode.icon size={36} /></div>
                   <h4 className="text-2xl font-black mb-4">{mode.title}</h4>
                   <p className="text-slate-500 font-medium leading-relaxed mb-10">{mode.desc}</p>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-pink-600 transition-colors">Khám phá ngay <ArrowRight size={18} /></div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 4: DISPLAY */}
      <section className="py-60 bg-white overflow-hidden px-10">
        <div className="max-w-[1400px] mx-auto relative aspect-[21/9] rounded-[4rem] overflow-hidden group shadow-2xl">
           <img src="/products/manhinholedipad.jpg" className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" alt="Display" />
           <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
           <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24 space-y-8 text-white text-left">
              <Zap size={24} className="text-pink-400" />
              <h3 className="text-5xl md:text-7xl font-[1000] tracking-tighter italic leading-[0.9]">Màn hình<br/>Tandem OLED.</h3>
              <p className="max-w-md text-white/60 font-medium italic">Độ sáng cực đại 1600 nits đỉnh cao.</p>
           </div>
        </div>
      </section>

      {/* SECTION 5: PRODUCT MATRIX — SHARED COMPONENT */}
      <ProductGridSection
        products={ipadProducts}
        label="Lineup 2026"
        title="Tìm iPad của bạn."
        accentColor="pink"
        buttonText="Xem toàn bộ"
        buttonLink="/store"
        cardProps={{ defaultBenefit: 'Gói trọn sức mạnh, mở rộng sáng tạo.' }}
      />

      {/* SECTION 6: CALL TO ACTION */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-10 text-center relative z-10 space-y-16">
          <h2 className="text-7xl md:text-8xl font-[1000] tracking-tighter italic leading-none uppercase">Sáng tạo không<br/>điểm dừng.</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <button className="px-16 py-7 bg-white text-black rounded-full text-[11px] font-black uppercase hover:bg-pink-50 transition-all shadow-2xl"><Pencil size={20} className="text-pink-600" /> Tư vấn sản phẩm</button>
            <button onClick={() => navigate('/support')} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-b border-white/10 pb-2">Liên hệ chuyên gia</button>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-white text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1.5em] italic">NEXUS • CREATIVE IPAD PRO • 2026</p>
      </footer>
    </div>
  );
};

export default IPadListingPage;