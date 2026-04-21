import React from 'react';
import { Truck, Award, CreditCard } from 'lucide-react';

const TrustStrip = () => (
  <div className="w-full bg-white py-6 border-b border-slate-50">
    <div className="max-w-7xl mx-auto px-10 flex flex-wrap justify-center gap-16">
      {[
        { label: "Free Shipping", icon: Truck },
        { label: "Official Warranty", icon: Award },
        { label: "Secure Payment", icon: CreditCard }
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 group">
          <item.icon size={14} strokeWidth={2.5} className="text-slate-300 group-hover:text-black transition-colors" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-black transition-colors">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default TrustStrip;
