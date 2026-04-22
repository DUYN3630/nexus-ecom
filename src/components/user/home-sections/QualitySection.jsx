import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, Zap } from 'lucide-react';

const QualitySection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Content Side */}
          <div className="space-y-12 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tiêu chuẩn Nexus Gold</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic leading-[0.9] uppercase">
                Chất lượng <br/> là danh dự
              </h2>
              <p className="text-base text-slate-500 leading-relaxed max-w-xl">
                Tại Nexus Store, chúng tôi không chỉ bán thiết bị. Chúng tôi mang đến sự an tâm tuyệt đối với quy trình kiểm định 24 bước độc quyền, đảm bảo mỗi sản phẩm đến tay bạn đều hoàn hảo như mới.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                    <Award size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Kiểm định chuyên sâu</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Đội ngũ kỹ thuật viên tay nghề cao trực tiếp kiểm tra từng linh kiện nhỏ nhất.</p>
               </div>
               <div className="space-y-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                    <Zap size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Hiệu năng tối ưu</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Cam kết dung lượng pin trên 90% và hiệu năng chip xử lý đạt chuẩn Apple.</p>
               </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate('/about')}
                className="px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
              >
                Về chúng tôi
              </button>
            </div>          </div>

          {/* Image Side */}
          <div className="relative order-1 lg:order-2 group">
             <div className="absolute inset-0 bg-indigo-100 rounded-3xl translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700"></div>
             <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-8 border-white shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
                  alt="Quality check" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                   <p className="text-white text-xs font-medium italic leading-relaxed">
                     "Mỗi thiết bị Nexus là một lời hứa về sự bền bỉ và đẳng cấp."
                   </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default QualitySection;

