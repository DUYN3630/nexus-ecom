import React from 'react';
import { Sparkles, Lock, RefreshCw, Heart } from 'lucide-react';

// Map icon names from JSON to actual components
const ICONS = {
  Sparkles,
  Lock,
  RefreshCw,
  Heart
};

const EcosystemSection = ({ config, isVisible }) => {
  if (!config) return null;

  const { items, backgroundColor } = config;

  return (
    <section id="ecosystem" className="py-32 px-6" style={{ backgroundColor: backgroundColor || '#F5F5F7' }}>
      <div className="max-w-[1000px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
        {(items || []).map((item, i) => {
          const IconComponent = ICONS[item.icon];
          return (
            <div key={i} className={`flex flex-col items-center text-center space-y-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: `${i * 100}ms`}}>
              <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-black border border-white/50 transition-transform hover:scale-110">
                {IconComponent ? <IconComponent size={24} strokeWidth={1.5} /> : null}
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-black uppercase tracking-widest">{item.title}</h5>
                <p className="text-[11px] text-[#6E6E73] font-medium leading-tight">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EcosystemSection;
