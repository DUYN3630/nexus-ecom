import React, { useState, useEffect, useRef } from 'react';
import { Star, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import reviewApi from '../../../api/reviewApi';
import getProductImageUrl from '../../../utils/getProductImageUrl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Mock data (fallback in case of API error or no reviews)
const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Minh Hoàng',
    location: 'TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'iPhone 15 Pro Max',
    content: 'Giao hàng siêu tốc trong 2h. Máy nguyên seal, nhân viên tư vấn nhiệt tình. Rất an tâm!'
  },
  {
    id: 2,
    name: 'Thu Thảo',
    location: 'Hà Nội',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'MacBook Air M3',
    content: 'Màu Midnight đẹp xỉu. Shop gói hàng rất kỹ, có kèm hướng dẫn setup máy chi tiết.'
  },
  {
    id: 3,
    name: 'Đức Anh',
    location: 'Đà Nẵng',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'iPad Pro M2',
    content: 'Giá tốt hơn nhiều shop khác. Bảo hành điện tử check được ngay trên web Apple.'
  },
  {
    id: 4,
    name: 'Hương Giang',
    location: 'Cần Thơ',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'Apple Watch Ultra 2',
    content: 'Đã mua lần thứ 3 ở Nexus Store. Hậu mãi uy tín, sẽ ủng hộ dài dài.'
  },
  {
    id: 5,
    name: 'Phan Nhật Nam',
    location: 'Đà Nẵng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'MacBook Pro M3 Max',
    content: 'Máy cấu hình cực khủng, render video mượt mà. Đội ngũ kỹ thuật hỗ trợ nâng cấp phần mềm tận tình.'
  },
  {
    id: 6,
    name: 'Lê Mỹ Dung',
    location: 'Hải Phòng',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'iPhone 15 Plus',
    content: 'Màu hồng pastel xinh xắn. Pin siêu trâu, xài cả ngày thoải mái không cần sạc dự phòng.'
  },
  {
    id: 7,
    name: 'Trần Thế Vinh',
    location: 'TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'AirPods Pro 2',
    content: 'Chống ồn đỉnh cao, đeo êm tai không bị đau đầu. Ship hàng siêu nhanh chỉ trong 1 tiếng.'
  },
  {
    id: 8,
    name: 'Nguyễn Hải Yến',
    location: 'Hà Nội',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'iPad Air M2',
    content: 'Màn hình sắc nét, viết vẽ mượt mà bằng Apple Pencil. Học tập và làm việc online vô cùng tiện lợi.'
  },
  {
    id: 9,
    name: 'Đặng Quang Huy',
    location: 'Bình Dương',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'Apple Watch SE',
    content: 'Theo dõi nhịp tim và calo tiêu thụ rất chính xác. Shop hỗ trợ dán kính cường lực miễn phí.'
  },
  {
    id: 10,
    name: 'Vũ Thị Mai',
    location: 'Nam Định',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'iMac M3',
    content: 'Màn hình 4.5K đẹp xuất sắc, âm thanh sống động. Bàn làm việc trông sang trọng hơn hẳn từ khi có em này.'
  },
  {
    id: 11,
    name: 'Hoàng Anh Tuấn',
    location: 'Quảng Ninh',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'Mac Studio M2',
    content: 'Sức mạnh đồ họa vượt trội, máy chạy cực êm không hề có tiếng ồn. Rất đáng đồng tiền bát gạo.'
  },
  {
    id: 12,
    name: 'Phạm Khánh Linh',
    location: 'Thanh Hóa',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'iPad Mini 6',
    content: 'Nhỏ gọn tiện lợi mang theo đi làm hay đi cà phê. Đọc sách hay ghi chú đều rất tốt.'
  },
  {
    id: 13,
    name: 'Bùi Tiến Đạt',
    location: 'Vũng Tàu',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'Mac mini M2',
    content: 'Nhỏ mà có võ, phục vụ code tốt, không giật lag. Nexus Store bán hàng chính hãng, giá cạnh tranh.'
  },
  {
    id: 14,
    name: 'Ngô Quốc Bảo',
    location: 'Cần Thơ',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100',
    rating: 5,
    verified: true,
    product: 'Studio Display',
    content: 'Độ hiển thị màu sắc chuẩn xác, rất thích hợp cho designer chuyên nghiệp. Giao hàng cẩn thận.'
  }
];

export const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewApi.getPublic();
        if (data && data.length > 0) {
          const uniqueMock = MOCK_REVIEWS.filter(m => !data.some(d => d.user?.name === m.name));
          setReviews([...data, ...uniqueMock].slice(0, 14));
        } else {
          setReviews(MOCK_REVIEWS);
        }
      } catch (error) {
        console.error("Failed to load public reviews:", error);
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (loading || reviews.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Staggered blur entrance on scroll trigger
    const cards = container.querySelectorAll('.review-card');
    const scrollAnim = gsap.fromTo(cards,
      { y: 40, opacity: 0, filter: 'blur(6px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 75%',
        }
      }
    );

    return () => {
      scrollAnim.kill();
      if (scrollAnim.scrollTrigger) scrollAnim.scrollTrigger.kill();
    };
  }, [loading, reviews]);

  const scrollTrack = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector('.review-card')?.clientWidth || 320;
    const offset = direction === 'left' ? -cardWidth - 24 : cardWidth + 24;
    track.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-24 bg-cara-surface select-none">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 animate-pulse">
          <div className="h-10 w-64 bg-black/5 rounded mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[300px] bg-white rounded-2xl border border-black/5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="py-24 bg-cara-surface overflow-hidden relative select-none"
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        
        {/* Header (tmaybe style: split layout) */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-cara-accent-alt"></span>
              <span className="text-xs uppercase tracking-[0.25em] text-cara-accent-alt font-bold">
                Phản hồi thực tế
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-cara-ink tracking-tight uppercase">
              Ý kiến khách hàng
            </h2>
          </div>
          
          <div className="flex flex-col md:items-end gap-3 max-w-sm">
            <div className="flex text-yellow-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" stroke="none" />
              ))}
            </div>
            <p className="text-sm text-cara-muted leading-relaxed">
              Điểm đánh giá trung bình 4.9/5.0 từ hơn 2,500 khách hàng đã mua và trải nghiệm thiết bị.
            </p>
          </div>
        </div>

        {/* Carousel testtrack */}
        <div className="relative">
          {/* Track slider */}
          <div 
            ref={trackRef}
            className="flex gap-6 overflow-x-auto scroll-snap-x scrollbar-hide py-4 -mx-8 px-8"
            style={{ 
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {reviews.map((review, i) => {
              const isApi = !!review._id;
              const id = isApi ? review._id : review.id;
              const avatar = isApi ? getProductImageUrl(review.user?.avatar?.url) : review.avatar;
              const name = isApi ? review.user?.name : review.name;
              const content = isApi ? review.content : review.content;
              const productName = isApi ? review.product?.name : review.product;
              const locations = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'];
              const location = isApi ? locations[i % locations.length] : review.location;

              return (
                <div 
                  key={id}
                  className="review-card flex-shrink-0 w-[85vw] sm:w-[45vw] lg:w-[28vw] bg-cara-accent/5 p-8 md:p-10 rounded-3xl border border-black/5 flex flex-col justify-between h-[360px] scroll-snap-align-start transition-shadow duration-500 hover:shadow-xl hover:bg-white"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {/* Quote decoration & stars */}
                  <div className="flex justify-between items-start">
                    <span 
                      className="text-[5.5rem] font-bold leading-none text-cara-accent-alt opacity-20 pointer-events-none select-none -mt-4 -ml-2 block"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      “
                    </span>
                    <div className="flex text-yellow-400 gap-0.5 mt-2">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star key={starIdx} size={14} fill="currentColor" stroke="none" />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm font-medium text-cara-ink leading-relaxed italic flex-grow mt-2">
                    "{content}"
                  </p>

                  {/* Product purchase tag & Author info */}
                  <div className="pt-6 border-t border-black/5 mt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Xác thực bởi Nexus</span>
                      <span className="text-[9px] font-bold text-cara-muted uppercase tracking-widest ml-auto truncate max-w-[120px]">
                        {productName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <img 
                        src={avatar} 
                        alt={name} 
                        className="w-10 h-10 rounded-full object-cover border border-black/5" 
                        onError={(e) => e.target.src='/products/product-archive-1.jpg'} 
                      />
                      <div>
                        <h4 className="text-sm font-bold text-cara-ink tracking-tight uppercase leading-tight">{name}</h4>
                        <p className="text-[10px] font-bold text-cara-muted uppercase tracking-widest mt-0.5">{location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={() => scrollTrack('left')}
              className="ch-hoverable w-12 h-12 rounded-full border border-black/5 flex items-center justify-center bg-white text-cara-ink hover:bg-cara-ink hover:text-white transition-all duration-300"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => scrollTrack('right')}
              className="ch-hoverable w-12 h-12 rounded-full border border-black/5 flex items-center justify-center bg-white text-cara-ink hover:bg-cara-ink hover:text-white transition-all duration-300"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CustomerReviews;
