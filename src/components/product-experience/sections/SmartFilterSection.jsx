import React, { useState, useEffect } from 'react';
import { Check, ChevronRight } from 'lucide-react';

const SmartFilterSection = ({ config, isVisible, onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  if (!config) return null;
  
  const { title, subtitle, filters, productData } = config;

  // Notify parent component of filter changes for global effects like background color
  useEffect(() => {
    if (onFilterChange) {
      const activeProductGroup = productData.find(m => m.category.includes(activeFilter));
      onFilterChange(activeFilter, activeProductGroup?.bgTheme || '#FFFFFF');
    }
  }, [activeFilter, onFilterChange, productData]);

  const filteredModels = activeFilter === 'All'
    ? productData
    : productData.filter(m => m.category.includes(activeFilter));

  return (
    <section id="filter" className="py-32 px-6">
      <div className={`max-w-[1100px] mx-auto text-center space-y-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="space-y-4">
          <h2 className="text-5xl md:text-7xl font-[1000] tracking-tighter uppercase" dangerouslySetInnerHTML={{ __html: title }}></h2>
          <p className="text-[#6E6E73] text-lg font-medium">{subtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {(filters || []).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 border-2 ${
                activeFilter === f
                  ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] scale-105 shadow-xl'
                  : 'bg-white/50 text-[#1D1D1F] border-[#D2D2D7] hover:border-black'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-10">
          {filteredModels.map((m) => (
            <div key={m.id} className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group text-left space-y-6">
              <div className="w-10 h-10 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
                <Check size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#6E6E73] uppercase tracking-widest">Recommended</p>
                <h4 className="text-2xl font-[1000] tracking-tighter uppercase">{m.name}</h4>
              </div>
              <div className="h-[1px] w-full bg-[#D2D2D7]/30"></div>
              <button className="text-[#0071E3] text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Xem ngay <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartFilterSection;
