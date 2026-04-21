import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import categoryApi from '../../../api/categoryApi';
import getProductImageUrl from '../../../utils/getProductImageUrl';

const THEMES = [
  { color: 'bg-slate-900', textColor: 'text-white' },
  { color: 'bg-slate-100', textColor: 'text-slate-900' },
  { color: 'bg-indigo-50', textColor: 'text-slate-900' },
  { color: 'bg-zinc-100', textColor: 'text-slate-900' },
  { color: 'bg-slate-50', textColor: 'text-slate-900' },
  { color: 'bg-slate-200', textColor: 'text-slate-900' }
];

const CategoryHighlight = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getExplore();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch explore categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
        <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-lg mb-16"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[400px] bg-slate-50 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">
            Khám phá theo dòng sản phẩm
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => {
            const theme = THEMES[index % THEMES.length];
            
            // Logic lấy ảnh: Ưu tiên productThumbnail (ảnh thật của SP), sau đó là thumbnail của Category
            let imageUrl = getProductImageUrl({ 
                thumbnail: cat.productThumbnail || cat.thumbnail 
            });

            return (
              <div 
                key={cat._id} 
                onClick={() => {
                  if (cat.slug === 'mac') navigate('/mac');
                  else if (cat.slug === 'ipad') navigate('/ipad');
                  else if (cat.slug === 'iphone') navigate('/iphone');
                  else if (cat.slug === 'watch') navigate('/watch');
                  else if (cat.slug === 'tv-giai-tri') navigate('/tv');
                  else if (cat.slug === 'phu-kien') navigate('/accessories');
                  else navigate(`/store?category=${cat.slug}`);
                }}
                className={`group relative h-[400px] ${theme.color} rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-100`}
              >
                {/* Image background */}
                <div className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110">
                  <img 
                    src={imageUrl} 
                    alt={cat.name} 
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/600x400?text=Nexus+Product';
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay to ensure text readability */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.textColor === 'text-white' ? 'from-black/60 via-black/20' : 'from-white/40 via-transparent'} to-transparent opacity-60 group-hover:opacity-80 transition-opacity`}></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                  <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className={`text-3xl font-black uppercase tracking-tighter italic ${theme.textColor} drop-shadow-sm`}>
                      {cat.name}
                    </h3>
                    {cat.description && (
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${theme.textColor} opacity-80 max-w-[200px] leading-relaxed line-clamp-2`}>
                        {cat.description}
                        </p>
                    )}
                    <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${theme.textColor} bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20`}>
                        Khám phá ngay <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryHighlight;