import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Mail, Phone, Facebook, Instagram, Youtube, ChevronDown, MapPin 
} from 'lucide-react';

const FOOTER_LINKS = {
  products: {
    title: 'Sản phẩm',
    links: [
      { label: 'iPhone', path: '/iphone' },
      { label: 'Mac', path: '/mac' },
      { label: 'iPad', path: '/ipad' },
      { label: 'Watch', path: '/iphone' },
      { label: 'Âm thanh', path: '/iphone' },
      { label: 'Phụ kiện', path: '/iphone' },
    ]
  },
  support: {
    title: 'Hỗ trợ khách hàng',
    links: [
      { label: 'Tra cứu đơn hàng', path: '/order-lookup' },
      { label: 'Chính sách bảo hành', path: '/policy/warranty' },
      { label: 'Chính sách đổi trả', path: '/policy/return' },
      { label: 'Phương thức thanh toán', path: '/policy/payment' },
      { label: 'Hướng dẫn mua hàng', path: '/guide/buying' },
      { label: 'Bảo mật thông tin', path: '/policy/privacy' },
    ]
  },
  company: {
    title: 'Về Nexus Store',
    links: [
      { label: 'Về chúng tôi', path: '/about' },
      { label: 'Tuyển dụng', path: '/careers' },
      { label: 'Tin tức', path: '/news' },
      { label: 'Hệ thống cửa hàng', path: '/stores' },
      { label: 'Liên hệ hợp tác', path: '/contact' },
    ]
  }
};

const FooterSection = ({ title, links, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-50 md:border-none pb-4 md:pb-0">
      <button 
        className="w-full flex items-center justify-between md:cursor-default group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 md:mb-6">{title}</h4>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-300 md:hidden ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <ul className={`space-y-3 overflow-hidden transition-all duration-300 md:max-h-none md:opacity-100 ${isOpen ? 'max-h-96 opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
        {links.map((link, idx) => (
          <li 
            key={idx} 
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 cursor-pointer transition-colors w-fit"
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-10 gap-x-8 mb-16 md:mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                <Cpu size={16} strokeWidth={2.5} />
              </div>
              <span className="text-[16px] font-black uppercase tracking-[0.2em]">Tech<span className="text-slate-400">Store</span></span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-xs">
              Hệ thống phân phối thiết bị công nghệ chính hãng. Trải nghiệm mua sắm đẳng cấp và an tâm tuyệt đối.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white transition-all shadow-sm">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            <FooterSection title={FOOTER_LINKS.products.title} links={FOOTER_LINKS.products.links} navigate={navigate} />
            <FooterSection title={FOOTER_LINKS.support.title} links={FOOTER_LINKS.support.links} navigate={navigate} />
            <FooterSection title={FOOTER_LINKS.company.title} links={FOOTER_LINKS.company.links} navigate={navigate} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.1em]">© 2026 Nexus Store Vietnam. All rights reserved.</p>
            <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">GPKD số 0101234567 do Sở KHĐT TP.HCM cấp.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer"><MapPin size={10} /> 123 Nguyễn Huệ, Q.1, TP.HCM</span>
            <span className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer"><Phone size={10} /> 1900 6789</span>
            <span className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer"><Mail size={10} /> cskh@nexus.vn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;