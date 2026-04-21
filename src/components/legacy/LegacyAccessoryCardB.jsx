import React from 'react';

// GIẢ LẬP COMPONENT CŨ B (cho phụ kiện hoặc sản phẩm khác)
// Props: title, description, price
const LegacyAccessoryCardB = ({ title, description, price }) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[4rem] shadow-sm border border-[#F5F5F7] transition-all hover:shadow-2xl hover:translate-y-[-8px] group cursor-pointer">
      <div className="aspect-square bg-[#F5F5F7] rounded-[3rem] mb-12 relative overflow-hidden flex items-center justify-center">
        <div className="w-1/2 h-1/2 bg-white/20 blur-2xl rounded-full animate-pulse"></div>
      </div>
      <div className="space-y-4">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{description}</p>
        <h4 className="text-2xl font-[1000] tracking-tighter uppercase leading-tight">{title}</h4>
        <p className="text-sm font-bold pt-4">{price}</p>
      </div>
    </div>
  );
};

export default LegacyAccessoryCardB;
