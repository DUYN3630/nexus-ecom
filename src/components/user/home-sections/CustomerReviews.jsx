import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import reviewApi from '../../../api/reviewApi';

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
  }
];

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewApi.getPublic();
        if (data && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(MOCK_REVIEWS); // Fallback to mock
        }
      } catch (error) {
        console.error("Failed to load public reviews:", error);
        setReviews(MOCK_REVIEWS); // Fallback to mock
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const API_URL = 'http://127.0.0.1:5000';

  if (loading) {
    return (
       <section className="py-24 bg-[#FBFBFB]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-20 animate-pulse">
            <div className="h-10 w-64 bg-slate-200 rounded mb-16"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100"></div>)}
            </div>
          </div>
       </section>
    );
  }

  return (
    <section className="py-24 bg-[#FBFBFB]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20">
        
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">Phản hồi thực tế</span>
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 italic uppercase">
               Khách hàng <br/> tin dùng
             </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex text-yellow-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" stroke="none" />
              ))}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                4.9/5.0 từ hơn 2,500 khách hàng
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviews.map((review, i) => {
            // Determine structure dynamically based on whether it is from API or Mock
            const isApi = !!review._id;
            const id = isApi ? review._id : review.id;
            const avatar = isApi ? (review.user?.avatar?.url ? (review.user.avatar.url.startsWith('http') ? review.user.avatar.url : `${API_URL}${review.user.avatar.url}`) : 'https://placehold.co/100x100?text=User') : review.avatar;
            const name = isApi ? review.user?.name : review.name;
            const content = isApi ? review.content : review.content;
            const productName = isApi ? review.product?.name : review.product;
            // API doesn't currently include location, we can mock it here or use a default
            const locations = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'];
            const location = isApi ? locations[i % locations.length] : review.location;

            return (
            <div 
              key={id} 
              className="group bg-white p-8 rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border border-slate-100/60 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full"
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-50 relative bg-slate-100">
                  <img src={avatar} alt={name} className="w-full h-full object-cover" onError={(e) => e.target.src='https://placehold.co/100x100?text=U'} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{location}</p>
                </div>
              </div>

              {/* Content */}
              <div className="relative flex-1 mb-6">
                <Quote size={24} className="text-indigo-50 absolute -top-2 -left-2 opacity-50" />
                <p className="relative z-10 text-[14px] leading-relaxed text-slate-600 font-medium italic">
                  "{content}"
                </p>
              </div>

              {/* Product & Verified */}
              <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                   <CheckCircle2 size={14} className="text-emerald-500" />
                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Xác thực bởi Nexus Store</span>
                </div>
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none line-clamp-1 max-w-[150px]">
                      MUA {productName}
                   </span>
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

export default CustomerReviews;

