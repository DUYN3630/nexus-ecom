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
    <section className="bg-transparent">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {SUPPORT_LINKS.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:-translate-y-1 shadow-sm">
                <item.icon size={18} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 flex items-center gap-2">
                  {item.label}
                </h4>
                {item.sub && (
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
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

