import React from 'react';
import { Smartphone, Cpu, Camera, Battery, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Link } from 'react-router-dom';

const COMPARISON_DATA = [
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    slug: 'iphone-17-pro-max',
    image: '/products/iphone-16-pro-max_1.webp', // Sử dụng ảnh tốt nhất có sẵn
    price: 34990000,
    specs: {
      chip: 'A19 Pro Bionic',
      camera: '48MP Main | 5x Telephoto',
      battery: 'Lên đến 35h video',
      display: '6.9" Super Retina XDR'
    }
  },
  {
    id: 'iphone-17-series',
    name: 'iPhone 17 Series',
    slug: 'iphone-17',
    image: '/products/iphone-17-256gb-1.webp',
    price: 24990000,
    specs: {
      chip: 'A19 Bionic',
      camera: '48MP Main | 2x Telephoto',
      battery: 'Lên đến 28h video',
      display: '6.1" & 6.7" Super Retina XDR'
    }
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    slug: 'iphone-16',
    image: '/products/iphone-16-1.webp',
    price: 22990000,
    specs: {
      chip: 'A18 Bionic',
      camera: '48MP Main | Siêu rộng',
      battery: 'Lên đến 22h video',
      display: '6.1" Super Retina XDR'
    }
  }
];

const ComparisonMatrix = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-slate-900 mb-4">
            So sánh & Lựa chọn
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Tìm ra thiết bị hoàn hảo cho nhu cầu của bạn. So sánh nhanh các dòng sản phẩm chủ chốt của Apple.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COMPARISON_DATA.map((product) => (
            <div key={product.id} className="flex flex-col bg-[#FBFBFB] rounded-[40px] p-10 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
              {/* Product Info */}
              <div className="text-center mb-8">
                <div className="aspect-square w-48 mx-auto mb-6 transition-transform duration-700 group-hover:scale-110">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{product.name}</h3>
                <p className="text-indigo-600 font-bold">Từ {formatCurrency(product.price)}</p>
              </div>

              {/* Specs Table */}
              <div className="space-y-6 flex-grow">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50">
                  <Cpu size={20} className="text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chipset</span>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{product.specs.chip}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50">
                  <Camera size={20} className="text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Camera</span>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{product.specs.camera}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50">
                  <Battery size={20} className="text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pin</span>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{product.specs.battery}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50">
                  <Smartphone size={20} className="text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Màn hình</span>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{product.specs.display}</span>
                  </div>
                </div>
              </div>

              <Link 
                to={`/product/${product.slug}`}
                className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10 text-center block"
              >
                Cấu hình chi tiết
              </Link>
            </div>
          ))}
        </div>

        {/* Free Comparison Link */}
        <div className="mt-12 text-center">
          <Link 
            to="/compare" 
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-slate-900 transition-colors group"
          >
            Tự tạo bảng so sánh của riêng bạn 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComparisonMatrix;
