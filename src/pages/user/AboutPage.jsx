import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, ClockCounterClockwise, Package, Truck, Warehouse, MagnifyingGlass } from '@phosphor-icons/react';

const AboutPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-stone-950 text-stone-100 selection:bg-stone-100 selection:text-stone-950 overflow-x-hidden font-sans">
      {/* Film Grain Overlay - Removed due to 403 error */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-stone-500/10" />

      {/* SECTION 1: THE MANIFESTO */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background Visual */}
        <div 
          className="absolute inset-0 z-0 opacity-40 grayscale transition-transform duration-700 ease-out scale-110"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1695663135590-4e8c179836e5?auto=format&fit=crop&q=80&w=2000')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.15}px) scale(1.1)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-transparent to-stone-950 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-8xl font-serif tracking-tight leading-tight italic">
            Curated for the few, <br /> 
            <span className="not-italic text-stone-300">defined by excellence.</span>
          </h1>
          <p className="text-stone-400 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed tracking-wide">
            Tại Nexus, chúng tôi không chỉ bán thiết bị công nghệ. Chúng tôi tuyển chọn những "tác phẩm kỹ nghệ" tốt nhất, 
            nơi mỗi bảng mạch và khung Titanium đều kể một câu chuyện về sự hoàn mỹ.
          </p>
          <div className="pt-12">
            <div className="w-px h-24 bg-gradient-to-b from-stone-100 to-transparent mx-auto opacity-40" />
          </div>
        </div>
      </section>

      {/* SECTION 2: THE THREE PILLARS */}
      <section className="relative min-h-screen py-32 px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 h-full items-stretch">
          
          {/* Pillar 1: Authenticity */}
          <div className="group flex flex-col space-y-8 border-t border-stone-800 pt-8 hover:border-stone-100 transition-colors duration-700">
            <span className="text-xs tracking-[0.3em] text-stone-500 uppercase font-medium">01 — Core Value</span>
            <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
              <img 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000" 
                alt="Macro chip" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <h2 className="text-4xl font-serif italic">Authenticity</h2>
            <p className="text-stone-400 font-light leading-relaxed">
              Cam kết 100% chính hãng. Sự minh bạch bắt đầu từ con chip xử lý nhỏ nhất đến lớp hoàn thiện bên ngoài. 
              Mỗi thiết bị là một bản tuyên ngôn về nguồn gốc thuần khiết.
            </p>
          </div>

          {/* Pillar 2: Curation */}
          <div className="group flex flex-col space-y-8 border-t border-stone-800 pt-8 md:mt-24 hover:border-stone-100 transition-colors duration-700">
            <span className="text-xs tracking-[0.3em] text-stone-500 uppercase font-medium">02 — The Process</span>
            <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" 
                alt="Studio" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <h2 className="text-4xl font-serif italic">Curation</h2>
            <p className="text-stone-400 font-light leading-relaxed">
              Chúng tôi không chạy theo số lượng. Từng mẫu máy tại Nexus phải vượt qua những tiêu chuẩn khắt khe nhất 
              về cả thẩm mỹ lẫn hiệu năng kỹ thuật, đảm bảo sự tinh tuyển tuyệt đối.
            </p>
          </div>

          {/* Pillar 3: Legacy */}
          <div className="group flex flex-col space-y-8 border-t border-stone-800 pt-8 hover:border-stone-100 transition-colors duration-700">
            <span className="text-xs tracking-[0.3em] text-stone-500 uppercase font-medium">03 — Commitment</span>
            <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
              <img 
                src="/products/leca.jpg" 
                alt="Old iPhone" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <h2 className="text-4xl font-serif italic">Legacy</h2>
            <p className="text-stone-400 font-light leading-relaxed">
              Vẻ đẹp bền vững theo thời gian. Với chính sách hỗ trợ dài hạn lên đến 7 năm, Nexus đồng hành cùng bạn 
              để duy trì giá trị và sức sống của thiết bị qua nhiều thế hệ.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 3: THE JOURNEY OF A DEVICE */}
      <section className="relative py-32 bg-stone-100 text-stone-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl font-serif italic">The Journey of a Device</h2>
            <p className="text-stone-500 tracking-[0.2em] uppercase text-xs">Từ ý tưởng đến tay bạn</p>
          </div>

          <div className="relative">
            {/* Central Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-300 transform -translate-x-1/2 hidden md:block" />

            {/* Step 1 */}
            <div className="relative mb-32 flex flex-col md:flex-row items-center justify-between group">
              <div className="md:w-[45%] text-center md:text-right mb-8 md:mb-0">
                <h3 className="text-2xl font-serif mb-4 italic">Kiểm định đầu vào</h3>
                <p className="text-stone-600 font-light">
                  Mỗi thiết bị được soi dưới kính hiển vi và chạy hơn 50 bài kiểm tra hiệu năng 
                  để đảm bảo không một lỗi nhỏ nào được bỏ qua.
                </p>
              </div>
              <div className="z-10 bg-stone-100 p-2 border border-stone-300 rounded-full mb-8 md:mb-0">
                <div className="bg-stone-900 text-stone-100 p-3 rounded-full">
                  <MagnifyingGlass size={20} />
                </div>
              </div>
              <div className="md:w-[45%] hidden md:block">
                <div className="h-px w-full bg-stone-200" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative mb-32 flex flex-col md:flex-row-reverse items-center justify-between group">
              <div className="md:w-[45%] text-center md:text-left mb-8 md:mb-0">
                <h3 className="text-2xl font-serif mb-4 italic">Lưu kho tiêu chuẩn</h3>
                <p className="text-stone-600 font-light">
                  Môi trường lưu kho được kiểm soát nhiệt độ và độ ẩm nghiêm ngặt, 
                  bảo vệ tối đa các linh kiện nhạy cảm và độ bền của pin.
                </p>
              </div>
              <div className="z-10 bg-stone-100 p-2 border border-stone-300 rounded-full mb-8 md:mb-0">
                <div className="bg-stone-900 text-stone-100 p-3 rounded-full">
                  <Warehouse size={20} />
                </div>
              </div>
              <div className="md:w-[45%] hidden md:block">
                <div className="h-px w-full bg-stone-200" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative mb-32 flex flex-col md:flex-row items-center justify-between group">
              <div className="md:w-[45%] text-center md:text-right mb-8 md:mb-0">
                <h3 className="text-2xl font-serif mb-4 italic">Đóng gói thủ công</h3>
                <p className="text-stone-600 font-light">
                  Chúng tôi tin vào sự chạm chạm tinh tế. Mỗi hộp máy được đóng gói thủ công 
                  với vật liệu thân thiện môi trường, như một món quà dành cho sự thông thái.
                </p>
              </div>
              <div className="z-10 bg-stone-100 p-2 border border-stone-300 rounded-full mb-8 md:mb-0">
                <div className="bg-stone-900 text-stone-100 p-3 rounded-full">
                  <Package size={20} />
                </div>
              </div>
              <div className="md:w-[45%] hidden md:block">
                <div className="h-px w-full bg-stone-200" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col md:flex-row-reverse items-center justify-between group">
              <div className="md:w-[45%] text-center md:text-left mb-8 md:mb-0">
                <h3 className="text-2xl font-serif mb-4 italic">Trao tận tay</h3>
                <p className="text-stone-600 font-light">
                  Quy trình giao hàng bảo mật cao cấp, đảm bảo hành trình cuối cùng của thiết bị 
                  đến với bạn là một trải nghiệm trọn vẹn và tĩnh lặng.
                </p>
              </div>
              <div className="z-10 bg-stone-100 p-2 border border-stone-300 rounded-full">
                <div className="bg-stone-900 text-stone-100 p-3 rounded-full">
                  <Truck size={20} />
                </div>
              </div>
              <div className="md:w-[45%] hidden md:block">
                <div className="h-px w-full bg-stone-200" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: THE EXPERIENCE STUDIO */}
      <section className="relative h-[80vh] overflow-hidden group">
        <div 
          className="absolute inset-0 z-0 grayscale contrast-125 transition-transform duration-1000 ease-out"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=2000')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${(scrollY - 2000) * 0.1}px) scale(1.1)`
          }}
        />
        <div className="absolute inset-0 bg-stone-950/40 z-10" />
        <div className="relative z-20 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs tracking-[0.4em] uppercase text-stone-300">The Space</span>
            <h2 className="text-5xl md:text-7xl font-serif italic text-white leading-tight">
              Nơi công nghệ và <br /> nghệ thuật giao thoa.
            </h2>
            <p className="text-stone-300 font-light max-w-lg mx-auto leading-relaxed">
              Experience Studio của chúng tôi không chỉ là một showroom. Đó là một thánh đường tối giản, 
              nơi bạn có thể chạm, cảm nhận và chiêm ngưỡng sự tĩnh lặng của những cỗ máy.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: THE VISIONARIES (TEAM) */}
      <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-stone-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.3em] uppercase text-stone-500 font-medium">People of Nexus</span>
              <h2 className="text-5xl font-serif italic">The Visionaries</h2>
            </div>
            <p className="max-w-sm text-stone-400 font-light leading-relaxed border-l border-stone-800 pl-8">
              Chúng tôi không dùng chức danh cứng nhắc. Tại đây, mỗi cá nhân là một người điều hướng thẩm mỹ 
              và kỹ thuật, bảo tồn giá trị nguyên bản của từng thiết bị.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-24">
            {/* Member 1 */}
            <div className="group space-y-6">
              <div className="aspect-[4/5] overflow-hidden grayscale contrast-125 filter sepia-[0.2]">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000" 
                  alt="Founder" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif">Alex Nguyen</h3>
                <p className="text-stone-500 italic font-light tracking-wide">Người điều hướng thẩm mỹ</p>
              </div>
            </div>

            {/* Member 2 */}
            <div className="group space-y-6 md:mt-24">
              <div className="aspect-[4/5] overflow-hidden grayscale contrast-125 filter sepia-[0.2]">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000" 
                  alt="CTO" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif">Elena Tran</h3>
                <p className="text-stone-500 italic font-light tracking-wide">Chuyên gia kỹ thuật phần cứng</p>
              </div>
            </div>

            {/* Member 3 */}
            <div className="group space-y-6">
              <div className="aspect-[4/5] overflow-hidden grayscale contrast-125 filter sepia-[0.2]">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1000" 
                  alt="Curator" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif">Marcus Le</h3>
                <p className="text-stone-500 italic font-light tracking-wide">Giám tuyển sản phẩm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: SUSTAINABILITY & ETHICS */}
      <section className="relative py-32 bg-[#2d312a] text-[#d4d8cf] overflow-hidden">
        {/* Subtle Organic Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.3em] uppercase text-[#8c9484] font-medium">Responsibility</span>
              <h2 className="text-5xl md:text-6xl font-serif italic leading-tight">Vĩnh cửu vượt trên sự hào nhoáng.</h2>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="mt-1 w-8 h-px bg-[#8c9484]" />
                <p className="text-lg font-light leading-relaxed">
                  Chúng tôi không ủng hộ việc thay đổi điện thoại mỗi năm. Thông qua chương trình 
                  <span className="text-white font-medium"> Trade-in Reborn</span>, chúng tôi thu cũ đổi mới để giảm thiểu rác thải điện tử, 
                  kéo dài vòng đời của mỗi mảnh vật liệu quý.
                </p>
              </div>
              <div className="flex gap-6 items-start">
                <div className="mt-1 w-8 h-px bg-[#8c9484]" />
                <p className="text-lg font-light leading-relaxed">
                  Bao bì của Nexus được làm hoàn toàn từ sợi thực vật và giấy tái chế 100%, 
                  không chứa nhựa, để hành trình đến tay bạn là hành trình sạch nhất có thể.
                </p>
              </div>
            </div>

            <button className="group flex items-center gap-4 text-xs tracking-[0.2em] uppercase font-bold border-b border-[#8c9484] pb-2 hover:text-white hover:border-white transition-all duration-500">
              Tìm hiểu về cam kết bền vững
              <div className="w-8 h-px bg-current transform origin-left group-hover:scale-x-150 transition-transform duration-500" />
            </button>
          </div>

          <div className="relative aspect-square">
            <div className="absolute inset-0 border border-[#8c9484]/30 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-12 overflow-hidden rounded-full grayscale hover:grayscale-0 transition-all duration-1000">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000" 
                alt="Nature and Tech" 
                className="w-full h-full object-cover scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: THE MASTER'S TOUCH */}
      <section className="relative py-32 bg-white text-stone-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-stone-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
            <div className="aspect-square overflow-hidden rounded-2xl grayscale contrast-125">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000" 
                alt="Precision tools" 
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-[3000ms]"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 p-8 bg-stone-950 text-white rounded-2xl shadow-2xl">
              <span className="text-4xl font-serif italic">0.01mm</span>
              <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60">Độ chính xác tuyệt đối</p>
            </div>
          </div>
          <div className="md:w-1/2 space-y-8">
            <span className="text-xs tracking-[0.3em] uppercase text-stone-400 font-medium">The Craft</span>
            <h2 className="text-5xl font-serif italic leading-tight">Khi máy móc cần đến <br /> cảm quan con người.</h2>
            <p className="text-stone-600 font-light leading-relaxed text-lg">
              Dù robot có thể lắp ráp hàng triệu linh kiện, nhưng chỉ có đôi mắt của một chuyên gia lâu năm 
              mới nhận ra được sự khác biệt trong độ phản chiếu của khung Titanium hay nhịp nhấn của phím bấm vật lý. 
              Tại Nexus, mỗi thiết bị đều được "chạm" bởi con người trước khi đến tay bạn.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: THE ARCHIVE */}
      <section className="relative py-32 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-20">
            <h2 className="text-4xl font-serif italic">The Archive</h2>
            <p className="text-stone-400 font-mono text-sm tracking-tighter">EST. 2020 — COLLECTING FUTURE CLASSICS</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {[
              { year: '2010', name: 'iPhone 4', img: '/products/product-archive-1.jpg' },
              { year: '2017', name: 'iPhone X', img: '/products/product-archive-2.jpg' },
              { year: '2023', name: 'iPhone 15 Pro', img: '/products/product-archive-3.jpg' },
              { year: '2024', name: 'Vision Pro', img: '/products/product-archive-4.jpg' }
            ].map((item, idx) => (
              <div key={idx} className="group relative aspect-[3/4] overflow-hidden bg-stone-200">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <span className="text-white/60 text-xs font-mono">{item.year}</span>
                  <h3 className="text-white text-xl font-serif italic">{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: THE QUIET SERVICE */}
      <section className="relative py-32 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="inline-block p-4 border border-stone-200 rounded-full animate-bounce">
            <div className="w-2 h-2 bg-stone-900 rounded-full" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic leading-snug">
            "Sự hỗ trợ tốt nhất là sự hỗ trợ mà <br /> bạn không bao giờ phải yêu cầu."
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Personalized</h4>
              <p className="text-stone-600 font-light text-sm">Cài đặt thiết bị theo đúng thói quen và bản sắc cá nhân của bạn.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Proactive</h4>
              <p className="text-stone-600 font-light text-sm">Nhắc nhở bảo trì và tối ưu hiệu suất định kỳ mà không cần bạn ghi nhớ.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">Perpetual</h4>
              <p className="text-stone-600 font-light text-sm">Đồng hành trọn đời thiết bị với các đặc quyền thay thế linh kiện ưu tiên.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: THE NEXT CHAPTER (CTA) */}
      <section className="relative h-[90vh] bg-stone-950 flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-500/20 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-12">
          <h2 className="text-5xl md:text-7xl font-serif italic">
            Begin your <br /> <span className="text-stone-500 not-italic">masterpiece.</span>
          </h2>
          <p className="text-stone-400 font-light text-lg tracking-wide">
            Gia nhập cộng đồng của những người trân trọng giá trị nguyên bản và công nghệ đích thực. 
            Mọi hành trình vĩ đại đều bắt đầu từ một quyết định tinh tế.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group relative px-10 py-4 overflow-hidden rounded-full border border-stone-100/20"
            >
              <div className="absolute inset-0 bg-stone-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 text-[10px] uppercase tracking-[0.3em] font-bold text-white group-hover:text-stone-950 transition-colors duration-500">
                Trở lại khởi đầu
              </span>
            </button>
            
            <button 
              className="px-10 py-4 bg-stone-100 rounded-full text-stone-950 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-stone-300 transition-colors shadow-2xl shadow-stone-100/10"
              onClick={() => window.location.href = '/store'}
            >
              Khám phá bộ sưu tập
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="absolute bottom-12 left-0 right-0">
          <p className="text-[9px] uppercase tracking-[0.5em] text-stone-600">Nexus © 2024 — Excellence is a habit.</p>
        </div>
      </section>

      {/* Final Padding */}
      <div className="h-10 bg-stone-950" />
    </div>
  );
};

export default AboutPage;
