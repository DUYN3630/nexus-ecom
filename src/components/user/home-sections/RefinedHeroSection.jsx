import React from 'react';

const RefinedHeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col antialiased text-[#1a1a1a] overflow-hidden bg-black">
      {/* Full-Bleed Clear Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/products/2.png" 
          alt="Nexus Ecom Background" 
          className="w-full h-full object-cover object-[center_20%] opacity-100"
        />
        {/* Very subtle gradient just to ensure text readability on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/20 to-transparent"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center relative z-10 py-12 md:py-24">
        <div className="max-w-[1800px] mx-auto w-full px-8 md:px-12 lg:px-24 xl:px-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Side: Content */}
            <div className="lg:col-span-6 flex flex-col justify-center items-start pt-6 lg:pt-4">
              <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[5.5xl] xl:text-[6.5rem] font-black leading-[0.85] tracking-tighter text-[#161616] uppercase mb-8 drop-shadow-sm">
                NEW TECH<br />NEW EXPERIENCE
              </h1>
              
              <p className="text-xl md:text-2xl text-[#1a1a1a] font-semibold leading-tight mb-12 max-w-[500px]">
                Discover the ultimate collection of premium technology for 2026. Elevate your digital lifestyle with Nexus Ecom.
              </p>
              
              <a 
                href="/store" 
                className="inline-block bg-[#93cbf1] text-[#111] font-bold text-xl px-12 py-5 rounded uppercase tracking-wider transition-all duration-200 ease-in-out hover:translate-y-[-3px] hover:shadow-2xl active:scale-95"
              >
                SHOP NOW
              </a>
            </div>

            {/* Right Side: Empty (Background image shows through) */}
            <div className="lg:col-span-6"></div>
          </div>
        </div>
      </main>

    </section>
  );
};

export default RefinedHeroSection;
