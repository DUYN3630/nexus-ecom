import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Code, Palette, GraduationCap, 
  ArrowRight, Sparkles, Monitor, Laptop, 
  Smartphone, Thermometer
} from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductGridSection from '../../components/common/ProductGridSection';

const MAC_WORKFLOWS = [
  { id: 'dev', title: 'Lập trình viên', desc: 'Biên dịch mã nguồn siêu tốc và chạy ảo hóa mượt mà.', icon: Code, color: 'text-blue-500', bg: 'bg-blue-50/50' },
  { id: 'creative', title: 'Nhà sáng tạo', desc: 'Xử lý video 8K và thiết kế đồ họa 3D phức tạp.', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-50/50' },
  { id: 'edu', title: 'Sinh viên', desc: 'Mỏng nhẹ, pin bền bỉ cho cả ngày học tập.', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50/50' }
];

const MacListingPage = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const macProducts = products ? products.filter(p => p.category?.slug === 'mac' || p.name.toLowerCase().includes('mac')) : [];

  if (isLoading) return <LoadingSpinner spinnerColor="border-t-slate-800" />;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-200 font-sans overflow-x-hidden pt-24">
      
      {/* SECTION 1: HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles size={14} /> M3 Series Silicon
            </div>
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight leading-[0.9] text-slate-900 uppercase italic">
              Nơi ý tưởng<br/><span className="text-slate-400">thành hình.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">Sức mạnh tối thượng ẩn mình trong thiết kế tối giản. Mac không chỉ là một chiếc máy tính, đó là một công cụ để thay đổi thế giới.</p>
            <button onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Khám phá dòng Mac</button>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-400/10 blur-[120px] rounded-full"></div>
            <img src="/products/macbanner.jpg" alt="MacBook Pro" className="relative z-10 w-full rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-105" />
          </div>
        </div>
      </section>

      {/* SECTION 2: WORKFLOWS */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 leading-none">Customized for you</h2>
            <h3 className="text-6xl font-bold tracking-tight italic">Chọn cấu hình theo mục đích.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {MAC_WORKFLOWS.map((flow) => (
              <div key={flow.id} className="group p-12 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className={`w-16 h-16 ${flow.bg} ${flow.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}><flow.icon size={32} /></div>
                <h4 className="text-2xl font-bold mb-4">{flow.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">{flow.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all">Xem chi tiết <ArrowRight size={16} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SILICON ENGINE */}
      <section className="py-40 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-20 items-center text-left">
          <div className="lg:col-span-5 space-y-10">
            <Cpu size={64} className="text-blue-400" />
            <h3 className="text-6xl font-bold tracking-tight">Chip M3.<br/><span className="text-blue-400">Tốc độ ánh sáng.</span></h3>
            <p className="text-slate-400 text-lg leading-loose">Hiệu năng vượt trội nhưng vẫn duy trì thời lượng pin lên đến 22 giờ. Mọi giới hạn cũ đều bị xóa bỏ.</p>
            <div className="grid grid-cols-2 gap-8 pt-6">
               <div><p className="text-4xl font-bold">80%</p><p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Nhanh hơn M1 Max</p></div>
               <div><p className="text-4xl font-bold">2.5x</p><p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Tốc độ Render 3D</p></div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <img src="/products/chipm3.jpg" className="w-full rounded-[3rem] shadow-2xl opacity-60 group-hover:opacity-100 transition-opacity" alt="Engine" />
          </div>
        </div>
      </section>

      {/* SECTION 4: DISPLAY */}
      <section className="py-60 bg-white">
        <div className="max-w-[1400px] mx-auto px-10 text-center space-y-24">
           <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 leading-none">Pro Display</p>
              <h3 className="text-7xl font-bold tracking-tight italic">Đắm chìm trong hàng tỷ màu sắc.</h3>
           </div>
           <div className="relative aspect-[21/9] rounded-[4rem] overflow-hidden shadow-2xl group">
              <img src="/products/colormac.jpg" className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" alt="Retina Display" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12 grid grid-cols-3 gap-10 text-white text-left">
                 <div><p className="text-4xl font-bold">1600 nits</p><p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Độ sáng đỉnh</p></div>
                 <div className="border-x border-white/10 px-10"><p className="text-4xl font-bold">1 tỷ</p><p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Màu sắc P3</p></div>
                 <div className="pl-10"><p className="text-4xl font-bold">120Hz</p><p className="text-[10px] font-bold uppercase tracking-widest opacity-60">ProMotion</p></div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 5: THERMAL & SILENCE */}
      <section className="py-40 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-10 text-center space-y-12">
           <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Thermometer size={40} />
           </div>
           <h3 className="text-5xl font-bold tracking-tight italic">Mát mẻ và tĩnh lặng.</h3>
           <p className="text-xl text-slate-500 leading-relaxed font-medium">Nhờ hiệu suất vượt trội của Apple Silicon, Mac luôn hoạt động mát mẻ và yên tĩnh tuyệt đối ngay cả với những tác vụ nặng nề nhất.</p>
        </div>
      </section>

      {/* SECTION 6: ECOSYSTEM */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-left">
          <div className="space-y-12">
            <h3 className="text-6xl font-bold tracking-tight italic leading-tight">Làm việc không<br/>biên giới.</h3>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">Sao chép trên iPhone và dán trên Mac. Mở rộng không gian làm việc với iPad. Mọi thứ đồng bộ hoàn hảo.</p>
          </div>
          <div className="aspect-square bg-slate-50 rounded-[3rem] shadow-xl overflow-hidden relative border border-slate-100 group">
             <img src="/products/Làm việc không giới hạng.jpg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Ecosystem" />
          </div>
        </div>
      </section>

      {/* SECTION 7: PRODUCTS — SHARED COMPONENT */}
      <ProductGridSection
        products={macProducts}
        label="The Mac Lineup"
        title="Tìm chiếc Mac của bạn."
        accentColor="blue"
        buttonText="Xem tất cả"
        buttonLink="/store"
        cardProps={{ 
          defaultBenefit: 'Sức mạnh chuyên nghiệp cho mọi tác vụ sáng tạo.',
          aspectRatio: 'aspect-[4/3]'
        }}
      />

      {/* SECTION 8: CONCLUSION */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-10 text-center relative z-10 space-y-16">
          <div className="space-y-6">
            <h2 className="text-7xl md:text-8xl font-bold tracking-tighter italic leading-none">Nâng tầm<br/>sự nghiệp.</h2>
            <p className="text-blue-500 text-[11px] font-black uppercase tracking-[0.6em]">Trợ lý chuyên gia luôn sẵn sàng hỗ trợ bạn</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 pt-10">
            <button className="px-16 py-7 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-50 transition-all flex items-center gap-4 shadow-2xl">
              <Monitor size={20} className="text-blue-600" /> Tư vấn cấu hình
            </button>
            <button onClick={() => navigate('/support')} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-b border-white/10 pb-2">
              Liên hệ bộ phận doanh nghiệp
            </button>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-white text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1.5em] italic">NEXUS • PROFESSIONAL MAC • 2026</p>
      </footer>
    </div>
  );
};

export default MacListingPage;