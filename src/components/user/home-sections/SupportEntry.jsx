import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageSearch, ShieldCheck, HelpCircle, MapPin, ArrowRight } from 'lucide-react';

const SUPPORT_LINKS = [
  {
    id: 'tracking',
    label: 'Tra cứu đơn hàng',
    sub: 'Theo dõi hành trình gói hàng',
    icon: PackageSearch,
    path: '/order-lookup'
  },
  {
    id: 'warranty',
    label: 'Bảo hành Nexus',
    sub: 'Tra cứu hạn bảo hành máy',
    icon: ShieldCheck,
    path: '/warranty-center'
  },
  {
    id: 'faq',
    label: 'Trung tâm hỗ trợ',
    icon: HelpCircle,
    path: '/faqs'
  },
  {
    id: 'stores',
    label: 'Tìm cửa hàng',
    icon: MapPin,
    path: '/stores'
  }
];

const SupportEntry = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white border-t border-slate-50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {SUPPORT_LINKS.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex items-start gap-5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:-translate-y-1">
                <item.icon size={22} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 flex items-center gap-2">
                  {item.label} <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </h4>
                {item.sub && (
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {item.sub}
                    </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportEntry;

