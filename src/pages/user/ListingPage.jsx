import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, History, Lock, Camera, Sparkles, Smartphone
} from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductGridSection from '../../components/common/ProductGridSection';

/**
 * RESTORED EDITORIAL IPHONE PAGE
 */

const LIFESTYLES = [
  { id: 'visionary', title: 'Tiên Phong', tagline: 'Dành cho những người dẫn đầu xu hướng.', image: '/products/Tienphong.webp', color: 'bg-purple-50/30' },
  { id: 'performer', title: 'Hiệu Suất', tagline: 'Sức mạnh không giới hạn cho mọi tác vụ.', image: '/products/Hieusuat.jpg', color: 'bg-blue-50/30' },
  { id: 'all-rounder', title: 'Cân Bằng', tagline: 'Sự cân bằng hoàn hảo trong lòng bàn tay.', image: '/products/CANBANG.jpg', color: 'bg-emerald-50/30' },
  { id: 'professional', title: 'Chuyên Gia', tagline: 'Công cụ tối thượng cho công việc sáng tạo.', image: '/products/CHUYENGIA.jpg', color: 'bg-slate-100/50' }
];

const PRODUCT_ANGLES = [
  { id: 'front', label: 'Chính diện', image: '/products/product-archive-1.jpg', desc: 'Màn hình LTPO OLED 2500 nits.' },
  { id: 'back', label: 'Mặt lưng', image: '/products/product-archive-2.jpg', desc: 'Kính nhám cường lực phối Titanium Grade 5.' },
  { id: 'side', label: 'Cạnh bên', image: '/products/product-archive-3.jpg', desc: 'Độ mỏng tinh tế gia công CNC.' },
];

const ListingPage = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  
  const [scrollY, setScrollY] = useState(0);
  const [activeLifestyle, setActiveLifestyle] = useState(null);
  const [activeAngle, setActiveAngle] = useState(PRODUCT_ANGLES[0]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const iphoneProducts = products ? products.filter(p => p.category?.slug === 'iphone' || p.name.toLowerCase().includes('iphone')) : [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] selection:bg-indigo-100 overflow-x-hidden font-sans pt-24">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .letter-spacing-huge { letter-spacing: -0.05em; }
      `}</style>

      {/* SECTION 1: HERO */}
      <section className="relative h-[110vh] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 blur-sm" style={{ transform: `scale(${1 + scrollY * 0.0002}) translateY(${scrollY * 0.2}px)` }}>
          <img src="/products/product-archive-4.jpg" className="w-full h-full object-cover" alt="iPhone Hook" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-[10vw] font-black text-white leading-none italic uppercase letter-spacing-huge mix-blend-difference">
            BẠN LÀ<br/>IPHONE NÀO?
          </h1>
          <div className="mt-12 flex flex-col items-center gap-4">
            <span className="w-px h-20 bg-gradient-to-b from-white/0 to-white/40"></span>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Khám phá bản sắc của bạn</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: PERSONALIZATION */}
      <section id="lifestyle" className={`py-40 transition-all duration-1000 ${activeLifestyle ? activeLifestyle.color : 'bg-white'}`}>
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex flex-col items-center text-center mb-24 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Chọn phong cách của bạn</p>
            <h2 className="text-6xl font-serif italic tracking-tight text-center">Lựa chọn theo lối sống</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {LIFESTYLES.map((style) => (
              <div 
                key={style.id}
                onMouseEnter={() => setActiveLifestyle(style)}
                onMouseLeave={() => setActiveLifestyle(null)}
                className="group relative h-[550px] rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-4"
              >
                <img src={style.image} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt={style.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-12 left-10 right-10 text-white space-y-3 text-left">
                  <h3 className="text-4xl font-black uppercase italic leading-none">{style.title}</h3>
                  <p className="text-[11px] font-medium text-white/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">{style.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: THE STAGE */}
      <section className="py-40 bg-white border-y border-slate-50">
        <div className="max-w-[1300px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Trải nghiệm tương tác</p>
              <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Sân khấu.</h2>
            </div>
            <div className="flex flex-col gap-3">
              {PRODUCT_ANGLES.map(angle => (
                <button key={angle.id} onClick={() => setActiveAngle(angle)} className={`flex items-center justify-between p-7 rounded-[2rem] border-2 transition-all ${activeAngle.id === angle.id ? 'border-black bg-black text-white shadow-xl' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}>
                  <span className="text-[11px] font-black uppercase tracking-widest">{angle.label}</span>
                  <div className={`w-2 h-2 rounded-full ${activeAngle.id === angle.id ? 'bg-white animate-pulse' : 'bg-slate-200'}`}></div>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8 relative aspect-square flex items-center justify-center">
             <div className="w-full h-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl transition-all duration-700" key={activeAngle.id}>
                <img src={activeAngle.image} className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" alt="Hardware Stage" />
             </div>
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-6 py-3 rounded-full border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{activeAngle.desc}</p>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PERFORMANCE */}
      <section className="py-60 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="relative">
            <h2 className="text-[18vw] font-serif italic text-slate-50 leading-none absolute -top-32 -left-10 select-none font-black">Hiệu Năng</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
              <img src="/products/Linhhonlatocdo.jpg" className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl" alt="Performance" />
              <div className="space-y-10 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Kỹ thuật Tiên tiến</p>
                <h3 className="text-8xl font-serif italic leading-[0.9] tracking-tighter">Linh hồn của<br/>Tốc độ.</h3>
                <p className="text-xl text-slate-500 leading-loose font-medium italic">Sức mạnh của tiến trình chip 3nm thế hệ mới, biến những tác vụ phức tạp nhất trở nên mượt mà.</p>
                <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] group">
                  Khám phá Chipset <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"><ArrowRight size={16} /></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 4.5: CAMERA SYSTEM — HORIZONTAL BANNER */}
      <section className="py-20 bg-white overflow-hidden px-6 md:px-10">
        <div className="max-w-[1440px] mx-auto relative h-[600px] md:h-[800px] rounded-[4rem] overflow-hidden group shadow-2xl">
           <img 
              src="/products/sankhau.jpg" 
              className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-110" 
              alt="Camera System" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           <div className="absolute inset-0 flex flex-col justify-end p-12 md:p-24 space-y-6 text-white text-left">
              <div className="flex items-center gap-3 text-indigo-400">
                <Camera size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Pro Camera System</span>
              </div>
              <h3 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] uppercase">
                Ánh sáng <br/> trong tầm kiểm soát.
              </h3>
              <p className="max-w-xl text-white/60 font-medium italic text-lg leading-relaxed">
                Cảm biến 48MP lớn hơn bao giờ hết, kết hợp với Photonic Engine mang lại độ chi tiết kinh ngạc ngay cả trong điều kiện thiếu sáng.
              </p>
           </div>
        </div>
      </section>

      {/* SECTION 5: PRODUCT MATRIX — SHARED COMPONENT */}
      <ProductGridSection
        products={iphoneProducts}
        label="The iPhone Lineup"
        title="Tìm iPhone của bạn."
        accentColor="indigo"
        buttonText="Xem toàn bộ sản phẩm"
        buttonLink="/store"
        cardProps={{ defaultBenefit: 'Đẳng cấp công nghệ trong tầm tay bạn.' }}
      />

      {/* SECTION 6: BUILT TO LAST */}
      <section className="py-60 bg-white">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 text-center">
            {[
              { label: 'Titanium', val: 'Cấp độ 5', desc: 'Vật liệu vĩnh cửu bền bỉ nhất từng có.', icon: ShieldCheck },
              { label: 'Hỗ trợ', val: '7 Năm', desc: 'Cập nhật phần mềm tối ưu dài hạn.', icon: History },
              { label: 'Bảo mật', val: 'Trên thiết bị', desc: 'Tuyệt đối dữ liệu sinh trắc học.', icon: Lock }
            ].map((item, i) => (
              <div key={i} className="space-y-8 group">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 group-hover:bg-black group-hover:text-white group-hover:rotate-[10deg]"><item.icon size={32} strokeWidth={1.5} /></div>
                <div className="space-y-3"><h5 className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">{item.label}</h5><h6 className="text-4xl font-black uppercase tracking-tighter italic">{item.val}</h6><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose max-w-[200px] mx-auto text-center">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION 7: FINAL CTA */}
      <section className="py-60 bg-slate-950 text-white relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-10 text-center relative z-10 space-y-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Trải nghiệm đẳng cấp</span>
            </div>
            <h2 className="text-7xl md:text-[9rem] font-black tracking-tighter italic leading-none uppercase text-center">
              KHÔNG CHỈ LÀ <br/> MỘT THIẾT BỊ.
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <button 
              onClick={() => navigate('/store')}
              className="px-16 py-8 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl flex items-center gap-3 active:scale-95"
            >
              <Smartphone size={18} /> Mua ngay bây giờ
            </button>
            <button className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors border-b-2 border-white/5 pb-2 hover:border-white transition-all">
              Liên hệ chuyên gia
            </button>
          </div>
        </div>

        {/* Floating text background */}
        <div className="absolute bottom-10 left-0 right-0 overflow-hidden whitespace-nowrap opacity-[0.03] select-none pointer-events-none">
          <p className="text-[15vw] font-black uppercase tracking-tighter italic leading-none">
            IPHONE 15 PRO • TITANIUM • A17 PRO • 48MP CAMERA
          </p>
        </div>
      </section>

      <footer className="py-20 bg-white text-center border-t border-slate-50">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1.5em] italic text-center w-full">NEXUS • ESSENTIALS • 2026</p>
      </footer>
    </div>
  );
};

export default ListingPage;