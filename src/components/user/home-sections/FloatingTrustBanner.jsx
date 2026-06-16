import React from 'react';
import { 
  CheckCircle2, ShieldCheck, Truck, Headphones 
} from 'lucide-react';

const TRUST_SIGNALS_CONFIG = [
  { 
    id: 'genuine', 
    label: '100% Chính hãng', 
    sub: 'Đại lý ủy quyền Apple', 
    icon: CheckCircle2, 
  },
  { 
    id: 'shipping', 
    label: 'Giao nhanh 2h', 
    sub: 'Miễn phí nội thành', 
    icon: Truck, 
  },
  { 
    id: 'warranty', 
    label: 'Bảo hành 24 tháng', 
    sub: 'AppleCare+ toàn cầu', 
    icon: ShieldCheck, 
  },
  { 
    id: 'support', 
    label: 'Chuyên gia 24/7', 
    sub: 'Hỗ trợ kỹ thuật tận tâm', 
    icon: Headphones, 
  },
];

const FloatingTrustBanner = () => {
  return (
    <div className="relative z-20 -mt-10 md:-mt-12 px-4 md:px-0">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border border-slate-100/60 py-6 md:py-8 px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-slate-100 md:divide-x">
            {TRUST_SIGNALS_CONFIG.map((signal) => (
              <div key={signal.id} className="flex flex-col md:flex-row items-center justify-center gap-4 px-4 group cursor-default">
                <div className="text-indigo-500 group-hover:scale-110 transition-transform duration-500 ease-out">
                  <signal.icon size={24} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <h4 className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.1em] text-slate-900 leading-tight mb-1">
                    {signal.label}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {signal.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingTrustBanner;
