import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import categoryApi from '../../../api/categoryApi';
import getProductImageUrl from '../../../utils/getProductImageUrl';

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_CATEGORIES = [
  {
    _id: 'iphone',
    slug: 'iphone',
    name: 'iPhone',
    description: 'Công nghệ chụp ảnh đỉnh cao, hiệu năng vượt bậc.',
    thumbnail: '/products/iphone17pro.jpg',
    spanClass: 'col-span-12 md:col-span-7 h-[420px]',
    tag: 'HOT',
    link: '/iphone'
  },
  {
    _id: 'mac',
    slug: 'mac',
    name: 'MacBook',
    description: 'Sức mạnh chip Apple Silicon thế hệ mới.',
    thumbnail: '/products/macbookprom4.jpg',
    spanClass: 'col-span-12 md:col-span-5 h-[420px]',
    tag: 'NEW CHIP',
    link: '/mac'
  },
  {
    _id: 'ipad',
    slug: 'ipad',
    name: 'iPad',
    description: 'Không gian sáng tạo di động tối ưu.',
    thumbnail: '/products/iPad-Pro-M2-cover.jpg',
    spanClass: 'col-span-12 sm:col-span-6 md:col-span-4 h-[320px]',
    link: '/ipad'
  },
  {
    _id: 'watch',
    slug: 'watch',
    name: 'Apple Watch',
    description: 'Giám sát sức khỏe, đồng hành cùng bạn.',
    thumbnail: '/products/watchpro2.jpg',
    spanClass: 'col-span-12 sm:col-span-6 md:col-span-4 h-[320px]',
    link: '/watch'
  },
  {
    _id: 'tv-giai-tri',
    slug: 'tv-giai-tri',
    name: 'TV & Entertainment',
    description: 'Trung tâm giải trí gia đình thông minh.',
    thumbnail: '/products/tvapple.jpg',
    spanClass: 'col-span-12 sm:col-span-12 md:col-span-4 h-[320px]',
    link: '/tv'
  }
];

export const CaraBento = () => {
  const sectionRef = useRef(null);
  const [bentoItems, setBentoItems] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getExplore();
        if (response.success && response.data) {
          const apiData = response.data;
          
          // Merge API categories into fallback structure
          const merged = FALLBACK_CATEGORIES.map(fallback => {
            const apiCat = apiData.find(c => c.slug === fallback.slug);
            if (apiCat) {
              return {
                ...fallback,
                name: apiCat.name,
                description: apiCat.description || fallback.description,
                thumbnail: apiCat.productThumbnail || apiCat.thumbnail || fallback.thumbnail
              };
            }
            return fallback;
          });
          setBentoItems(merged);
        }
      } catch (error) {
        console.error("Failed to fetch explore categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Staggered fade in of bento items
    const cards = section.querySelectorAll('.bento-item');
    const scrollAnim = gsap.fromTo(cards, 
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        }
      }
    );

    return () => {
      scrollAnim.kill();
      if (scrollAnim.scrollTrigger) scrollAnim.scrollTrigger.kill();
    };
  }, [bentoItems]);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const rotateX = (y - 0.5) * -10; // tilt max 5 deg
    const rotateY = (x - 0.5) * 10;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
      duration: 0.3,
      ease: 'power2.out',
    });

    const glow = card.querySelector('.bento-glow');
    if (glow) {
      gsap.to(glow, {
        x: (x - 0.5) * 60,
        y: (y - 0.5) * 60,
        opacity: 0.2,
        duration: 0.4,
      });
    }
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      duration: 0.5,
      ease: 'power3.out',
    });

    const glow = card.querySelector('.bento-glow');
    if (glow) {
      gsap.to(glow, {
        x: 0,
        y: 0,
        opacity: 0,
        duration: 0.5,
      });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="py-24 bg-white overflow-hidden relative select-none border-t border-black/5"
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        {/* Header */}
        <div className="section-title mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-indigo-600 font-black mb-3">DANH MỤC TRỌNG TÂM</div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Hệ sinh thái<br />Apple Nexus
            </h2>
          </div>
          <p className="text-slate-500 max-w-sm text-sm md:text-base leading-relaxed font-medium">
            Thiết kế dạng hộp Bento tối giản, tích hợp công nghệ tương tác 3D giúp bạn nhanh chóng kết nối với các dòng thiết bị đỉnh cao nhất.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {bentoItems.map((item, index) => {
            const imageUrl = getProductImageUrl({ thumbnail: item.thumbnail });

            return (
              <Link 
                key={item._id}
                to={item.link}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`bento-item group relative overflow-hidden rounded-[32px] border border-slate-100 flex flex-col justify-between transition-all duration-500 ${item.spanClass}`}
                style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
              >
                {/* Image background with hover scaling */}
                <div className="absolute inset-0 w-full h-full transition-transform duration-[1.5s] ease-out group-hover:scale-105">
                  <img 
                    src={imageUrl} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/products/product-archive-1.jpg';
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Premium Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500"></div>
                </div>

                {/* Radial Hover Glow */}
                <div className="bento-glow absolute inset-0 pointer-events-none opacity-0 bg-radial-glow transition-opacity duration-300 rounded-[32px]" />

                {/* Top Row: Tag and Arrow Action button */}
                <div className="z-10 p-8 flex justify-between items-start">
                  {item.tag ? (
                    <span className="text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full font-black bg-white/10 backdrop-blur-md text-white border border-white/20">
                      {item.tag}
                    </span>
                  ) : <div />}
                  
                  {/* Interactive Premium Circle Arrow */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:scale-110">
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Row: Card Meta Content */}
                <div className="z-10 p-8 mt-auto transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-black tracking-tight text-white uppercase italic drop-shadow-md mb-2">
                    {item.name}
                  </h3>
                  <p className="text-xs max-w-[280px] leading-relaxed text-white/70 font-medium">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Radial glow styled definition */}
      <style>{`
        .bg-radial-glow {
          background: radial-gradient(circle 200px at center, rgba(255, 255, 255, 0.15) 0%, transparent 80%);
        }
      `}</style>
    </section>
  );
};

export default CaraBento;
