import React, { useMemo } from 'react';
import { 
  CheckCircle2, ShieldCheck, RefreshCw, Zap, Headphones, Truck 
} from 'lucide-react';

const TRUST_SIGNALS_CONFIG = [
  { 
    id: 'genuine', 
    label: '100% Chính hãng', 
    sub: 'Đại lý ủy quyền Apple', 
    iconName: 'CheckCircle2', 
  },
  { 
    id: 'shipping', 
    label: 'Giao nhanh 2h', 
    sub: 'Miễn phí nội thành', 
    iconName: 'Truck', 
  },
  { 
    id: 'warranty', 
    label: 'Bảo hành 24 tháng', 
    sub: 'AppleCare+ toàn cầu', 
    iconName: 'ShieldCheck', 
  },
  { 
    id: 'support', 
    label: 'Chuyên gia 24/7', 
    sub: 'Hỗ trợ kỹ thuật tận tâm', 
    iconName: 'Headphones', 
  },
];

const IconRenderer = ({ iconName, size = 20, className }) => {
  const icons = { CheckCircle2, ShieldCheck, RefreshCw, Zap, Headphones, Truck };
  const IconComponent = icons[iconName] || CheckCircle2;
  return <IconComponent size={size} strokeWidth={1.5} className={className} />;
};

const TrustSignalsSection = () => {
  return (
    <section className="py-8 bg-[#FBFBFB] border-y border-slate-100/60">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 md:justify-between items-center">
          {TRUST_SIGNALS_CONFIG.map((signal) => (
            <div key={signal.id} className="flex items-center gap-4 group cursor-default">
              <div className="flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500">
                <IconRenderer iconName={signal.iconName} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 leading-none mb-1">
                  {signal.label}
                </h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  {signal.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;

