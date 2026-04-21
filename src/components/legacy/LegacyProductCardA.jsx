import React from 'react';

// GIẢ LẬP COMPONENT CŨ A
// Props: productName, bgColor, detailsLink, buyLink
const LegacyProductCardA = ({ productName, bgColor, detailsLink, buyLink }) => {
  return (
    <div className="group flex flex-col items-center text-center space-y-10">
      <div 
        className={`w-full aspect-[3/4] ${bgColor} rounded-[3.5rem] shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:scale-[1.03] border border-[#F5F5F7] overflow-hidden relative flex items-center justify-center p-12`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
        <div className="w-full h-full bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 rotate-6 shadow-inner"></div>
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-[1000] tracking-tighter uppercase">{productName}</h3>
        <div className="flex items-center justify-center gap-6">
          <a href={detailsLink} className="text-[#0066CC] text-[13px] font-black uppercase tracking-widest hover:opacity-70">Chi tiết</a>
          <a href={buyLink} className="px-6 py-2 bg-[#1D1D1F] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-80">Mua</a>
        </div>
      </div>
    </div>
  );
};

export default LegacyProductCardA;
