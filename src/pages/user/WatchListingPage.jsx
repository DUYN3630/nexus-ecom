import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Watch, Heart, Activity, Zap, 
  ArrowRight, Sparkles, 
  ShoppingBag, Waves,
  Smartphone, MousePointer2, Palette,
  ShieldAlert, PhoneCall
} from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductGridSection from '../../components/common/ProductGridSection';

const WatchListingPage = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const watchProducts = products ? products.filter(p => p.category?.slug === 'watch' || p.name.toLowerCase().includes('watch')) : [];

  if (isLoading) return <LoadingSpinner bgColor="bg-black" trackColor="border-orange-200" spinnerColor="border-t-orange-500" />;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-100 font-sans overflow-x-hidden">
      
      {/* SECTION 1: THE PULSE OF LIFE (Hero) */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white pt-32 pb-20 overflow-hidden text-center">
        {/* Animated Activity Rings in Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
           <div className="w-[600px] h-[600px] border-[40px] border-orange-500 rounded-full animate-[spin_15s_linear_infinite]"></div>
           <div className="absolute w-[480px] h-[480px] border-[40px] border-emerald-500 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
           <div className="absolute w-[360px] h-[360px] border-[40px] border-blue-500 rounded-full animate-[spin_10s_linear_infinite]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 w-full flex flex-col items-center">
           <div className="mb-10 inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-orange-500">
              <Watch size={18} className="animate-pulse" /> 
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em]">Apple Watch Ultra 2. Chinh phục giới hạn.</span>
           </div>
           
           <h1 className="text-[9vw] md:text-[7.5vw] font-[1000] tracking-tighter leading-[0.85] italic uppercase mb-16">
             THÔNG MINH HƠN.<br/>
             <span className="text-orange-500">QUYỀN NĂNG HƠN.</span>
           </h1>

           <div className="relative w-full max-w-4xl group mx-auto">
              <div className="absolute -inset-10 bg-orange-500/20 blur-[120px] rounded-full opacity-50"></div>
              <img 
                src="/products/Hinhdautienuutienchotrangwatch.webp" 
                alt="Apple Watch Hero" 
                className="relative z-10 w-full rounded-[4rem] transition-all duration-[2000ms] group-hover:scale-105"
              />
           </div>
        </div>
      </section>

      {/* SECTION 2: THE TRINITY OF HEALTH */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-10">
           <div className="flex flex-col items-center text-center mb-32 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Wellness & Health</p>
              <h2 className="text-6xl font-black italic tracking-tighter">Lắng nghe cơ thể bạn.</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              {[
                { title: 'Nhịp tim', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', desc: 'Thông báo nhịp tim cao, thấp hoặc không đều ngay lập tức.' },
                { title: 'Oxy trong máu', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Đo nồng độ Oxy trong máu để hiểu rõ tình trạng thể chất.' },
                { title: 'Giấc ngủ', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Theo dõi các giai đoạn ngủ và thiết lập mục tiêu nghỉ ngơi.' }
              ].map((item, i) => (
                <div key={i} className="group p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-700">
                   <div className={`w-20 h-20 rounded-[2rem] ${item.bg} ${item.color} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                      <item.icon size={36} strokeWidth={1.5} />
                   </div>
                   <h4 className="text-2xl font-black mb-4">{item.title}</h4>
                   <p className="text-slate-500 font-medium leading-relaxed mb-10">{item.desc}</p>
                   <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                      Chi tiết cảm biến <ArrowRight size={18} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 3: ACTIVITY RINGS - MOTIVATION */}
      <section className="py-40 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
           <div className="relative order-2 lg:order-1">
              <div className="relative w-full aspect-square flex items-center justify-center">
                 <div className="w-full h-full border-[60px] border-orange-500/10 rounded-full flex items-center justify-center">
                    <div className="w-[80%] h-[80%] border-[60px] border-emerald-500/10 rounded-full flex items-center justify-center">
                       <div className="w-[60%] h-[60%] border-[60px] border-blue-500/10 rounded-full"></div>
                    </div>
                 </div>
                 {/* Floating Data Cards */}
                 <div className="absolute top-0 right-0 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-bounce">
                    <p className="text-[10px] font-black uppercase text-orange-500">Đốt cháy</p>
                    <p className="text-2xl font-black">600 CAL</p>
                 </div>
                 <div className="absolute bottom-10 left-0 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-pulse delay-700">
                    <p className="text-[10px] font-black uppercase text-emerald-500">Luyện tập</p>
                    <p className="text-2xl font-black">45 MIN</p>
                 </div>
              </div>
           </div>
           <div className="space-y-12 order-1 lg:order-2 text-left">
              <h3 className="text-6xl font-black tracking-tighter italic leading-tight">Hoàn thành<br/>vòng hoạt động.</h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Ba vòng Di chuyển, Luyện tập và Đứng sẽ cho bạn cái nhìn toàn diện về hoạt động trong ngày. Cạnh tranh với bạn bè, chinh phục các danh hiệu và giữ cho cơ thể luôn năng động.
              </p>
              <div className="flex gap-6">
                 <button className="px-10 py-5 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all">
                    Xem ứng dụng Fitness
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 4: DOUBLE TAP INTERACTION */}
      <section className="py-60 bg-white">
        <div className="max-w-5xl mx-auto px-10 text-center space-y-12">
           <div className="inline-flex items-center gap-2 text-orange-500 mb-4">
              <MousePointer2 size={24} /> <span className="text-[10px] font-black uppercase tracking-[0.4em]">Magic Interaction</span>
           </div>
           <h2 className="text-7xl font-[1000] tracking-tighter italic leading-none">Chạm hai lần.<br/><span className="text-slate-300">Phép thuật thật sự.</span></h2>
           <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-3xl mx-auto">
             Khi tay bạn đang bận, chỉ cần chạm ngón trỏ và ngón cái vào nhau hai lần để trả lời cuộc gọi, mở thông báo, phát nhạc và nhiều hơn thế nữa. Một cách tương tác hoàn toàn mới.
           </p>
           <div className="pt-10 flex justify-center">
              <img src="/products/hinhchosectioncham2lantrangwatch.jpg" className="w-full max-w-2xl rounded-[3rem] shadow-2xl" alt="Double Tap gesture" />
           </div>
        </div>
      </section>

      {/* SECTION 5: SAFETY FEATURES */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#f97316_1px,_transparent_1px)] bg-[length:40px_40px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-left">
           <div className="space-y-12">
              <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
                 <ShieldAlert size={40} />
              </div>
              <h3 className="text-6xl font-black tracking-tighter italic leading-tight">An tâm trên<br/>mọi hành trình.</h3>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">
                Apple Watch có thể phát hiện nếu bạn gặp tai nạn ô tô nghiêm trọng hoặc bị ngã nặng. Hệ thống sẽ tự động kết nối với các dịch vụ khẩn cấp và gửi thông báo cho người thân của bạn.
              </p>
              <div className="flex items-center gap-8">
                 <div className="flex flex-col gap-2">
                    <p className="text-3xl font-black">SOS</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cuộc gọi khẩn cấp</p>
                 </div>
                 <div className="w-px h-12 bg-white/10"></div>
                 <div className="flex flex-col gap-2">
                    <PhoneCall size={24} className="text-orange-500" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Phát hiện va chạm</p>
                 </div>
              </div>
           </div>
           <div className="relative group">
              <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/20 transition-all"></div>
              <img src="/products/hinhantamtrenmoihanhtrinh.jpg" className="relative z-10 w-full rounded-[3rem] border border-white/5 shadow-2xl" alt="Safety Features" />
           </div>
        </div>
      </section>

      {/* SECTION 6: PRODUCT MATRIX — SHARED COMPONENT */}
      <ProductGridSection
        products={watchProducts}
        label="Dòng sản phẩm 2026"
        title="Chọn chiếc Watch của bạn."
        accentColor="orange"
        buttonText="Xem toàn bộ sản phẩm"
        buttonLink="/store"
        sectionBg="bg-white"
        cardProps={{ 
          defaultBenefit: 'Đồng hành cùng sức khỏe và sự bền bỉ của bạn.',
          showTooltip: true,
          imageBg: 'bg-[#111111]'
        }}
      />

      {/* SECTION 7: STYLE - THE BAND STUDIO */}
      <section className="py-40 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-10 text-center space-y-16">
           <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic">Apple Watch Studio</p>
              <h3 className="text-6xl font-black italic tracking-tighter">Phối đồ theo chất riêng.</h3>
              <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto">Hàng trăm mẫu dây đeo từ Solo Loop đến Link Bracelet. Bất kỳ vỏ máy nào. Bất kỳ dây đeo nào. Tạo nên phong cách của bạn.</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                '/products/stylewatch.jpg',
                '/products/stylewatch2.jpg',
                '/products/stylewatch3.jpg',
                '/products/stylewatch4.jpg'
              ].map((img, i) => (
                <div key={i} className="aspect-square rounded-[2rem] overflow-hidden shadow-lg group">
                   <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Watch Style" />
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 8: CONCLUSION */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-10 text-center relative z-10 space-y-16">
          <div className="space-y-6">
            <h2 className="text-7xl md:text-8xl font-[1000] tracking-tighter italic leading-none">Chạm tới<br/>tương lai.</h2>
            <p className="text-orange-500 text-[11px] font-black uppercase tracking-[0.6em]">Trợ lý AI sẵn sàng hỗ trợ bạn 24/7</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 pt-10">
            <button className="px-16 py-7 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-orange-50 transition-all flex items-center gap-4 shadow-2xl">
              <Watch size={20} className="text-orange-600" /> Tư vấn cấu hình
            </button>
            <button onClick={() => navigate('/support')} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-b border-white/10 pb-2">
              Liên hệ chuyên gia y tế
            </button>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-white text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1.5em] italic">NEXUS • WATCH COLLECTION • 2026</p>
      </footer>
    </div>
  );
};

export default WatchListingPage;