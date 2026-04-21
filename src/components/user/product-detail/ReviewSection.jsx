import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, BadgeCheck, X, Send, Filter, ChevronDown } from 'lucide-react';
import reviewApi from '../../../api/reviewApi';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';

const ReviewSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState({ canReview: false, message: '' });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination & Filtering state (Task 9)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(null); // null means all
  
  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
    orderId: ''
  });

  const fetchReviews = async (pageNum = 1, isNewFilter = false) => {
    try {
      setLoading(true);
      const res = await reviewApi.getProductReviews(productId, { 
        page: pageNum, 
        limit: 6,
        rating: ratingFilter 
      });
      
      if (isNewFilter || pageNum === 1) {
        setReviews(res.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(res.reviews || [])]);
      }
      
      setHasMore(res.currentPage < res.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await reviewApi.checkPermission(productId);
      setCanReview(res);
      if (res.canReview) {
        setFormData(prev => ({ ...prev, orderId: res.orderId }));
      }
    } catch (error) {
      console.error('Failed to check review permission:', error);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchReviews(1, true);
    checkPermission();
  }, [productId, isAuthenticated, ratingFilter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      addToast('Vui lòng nhập nội dung đánh giá', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await reviewApi.createReview(productId, formData);
      addToast('Cảm ơn bạn đã gửi đánh giá cho Nexus Store!', 'success');
      setShowModal(false);
      setFormData({ rating: 5, content: '', orderId: '' });
      setPage(1);
      fetchReviews(1, true); // Refresh
      setCanReview({ canReview: false, message: 'Bạn đã gửi đánh giá cho đơn hàng này.' });
    } catch (error) {
      addToast(error.response?.data?.message || 'Không thể gửi đánh giá', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="py-24 border-t border-stone-200 mt-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black">Community Insights</span>
          <h2 className="text-4xl font-serif italic tracking-tight text-stone-900">The Perspective.</h2>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
            <p className="text-4xl font-serif italic text-stone-900">{averageRating || '—'}</p>
            <div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={12} fill={i <= Math.round(averageRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="text-[9px] uppercase tracking-widest text-stone-400 mt-1 font-bold">{reviews.length} Phản hồi</p>
            </div>
          </div>

          {canReview.canReview && (
            <button 
              onClick={() => setShowModal(true)}
              className="px-10 py-5 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center gap-3"
            >
              <MessageSquare size={16} /> Viết đánh giá
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar (Task 9) */}
      <div className="flex items-center gap-4 mb-12 overflow-x-auto no-scrollbar pb-2">
         <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-xl text-stone-400 text-[10px] font-black uppercase tracking-widest mr-4">
            <Filter size={14} /> Lọc theo
         </div>
         <button 
            onClick={() => setRatingFilter(null)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${ratingFilter === null ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-900'}`}
         >
            Tất cả
         </button>
         {[5, 4, 3, 2, 1].map(star => (
           <button 
              key={star}
              onClick={() => setRatingFilter(star)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${ratingFilter === star ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-900'}`}
           >
              {star} <Star size={10} fill="currentColor" />
           </button>
         ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {reviews.map(review => (
          <div key={review._id} className="bg-white p-10 rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={10} fill={i <= review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                {review.isVerifiedPurchase && (
                  <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    <BadgeCheck size={10} /> Chủ sở hữu
                  </div>
                )}
              </div>
              <p className="text-stone-600 text-sm font-light leading-relaxed italic border-l-2 border-stone-100 pl-4 group-hover:border-stone-900 transition-colors">
                "{review.content}"
              </p>
            </div>

            <div className="flex items-center gap-4 pt-8 border-t border-stone-50 mt-8">
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
                {review.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-stone-900">{review.user?.name}</p>
                <p className="text-[9px] uppercase tracking-widest text-stone-400 mt-1 font-bold">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')} — Verified
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && page === 1 && (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-stone-100 animate-pulse rounded-2xl border border-stone-50" />)
        )}
      </div>

      {!loading && reviews.length === 0 && (
          <div className="col-span-full py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center space-y-4 mt-10">
             <MessageSquare size={32} strokeWidth={1} className="text-stone-300 mx-auto" />
             <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">Chưa có đánh giá nào phù hợp</p>
          </div>
      )}

      {/* Load More Button (Task 9) */}
      {hasMore && (
        <div className="mt-16 text-center">
           <button 
              onClick={handleLoadMore}
              disabled={loading}
              className="px-12 py-4 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:bg-stone-50 transition-all flex items-center gap-3 mx-auto"
           >
              {loading ? 'Đang tải...' : <><ChevronDown size={14} /> Xem thêm cảm nhận</>}
           </button>
        </div>
      )}

      {/* CTA Card for buyers who haven't reviewed */}
      {canReview.canReview && !loading && reviews.length > 0 && (
          <div className="mt-20 max-w-2xl mx-auto bg-blue-50/50 p-12 rounded-2xl border border-dashed border-blue-200 flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer" onClick={() => setShowModal(true)}>
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <MessageSquare size={24} strokeWidth={1.5} />
             </div>
             <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-black">Trải nghiệm của bạn thế nào?</p>
             <button className="text-xs font-serif italic border-b border-blue-900 pb-1 text-blue-900">Chia sẻ với cộng đồng Nexus</button>
          </div>
      )}

      {/* REVIEW MODAL (Task 6) */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-8 flex justify-between items-center relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <MessageSquare size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.5em] text-stone-400 font-black mb-2">Write a review</p>
                <h3 className="text-3xl font-serif italic">The Feedback Form.</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all relative z-10">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="p-10 space-y-8">
              {/* Star Rating */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">Đánh giá của bạn</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.rating >= star ? 'border-amber-400 bg-amber-50 text-amber-500' : 'border-stone-100 bg-stone-50 text-stone-300'}`}
                    >
                      <Star size={24} fill={formData.rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">Cảm nhận chi tiết</label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Hành trình trải nghiệm của bạn với sản phẩm này tại Nexus Store như thế nào?"
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-6 text-sm font-light focus:border-stone-900 transition-all outline-none resize-none"
                />
              </div>

              {/* Order Info (Non-editable) */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <BadgeCheck size={16} className="text-emerald-600" />
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">
                  Xác thực bởi đơn hàng: <span className="text-emerald-900">{canReview.orderNumber}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? 'Đang gửi...' : <><Send size={16} /> Gửi cảm nhận của bạn</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
