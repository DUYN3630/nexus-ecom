import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Star, MessageSquare, 
  ChevronRight, BadgeCheck, Clock, 
  ArrowLeft, Send, X, ShieldCheck
} from 'lucide-react';
import orderApi from '../../api/orderApi';
import reviewApi from '../../api/reviewApi';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import getProductImageUrl from '../../utils/getProductImageUrl';

const PurchasedProductsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
    orderId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getPurchasedProducts();
      setPurchasedProducts(res || []);
    } catch (error) {
      console.error('Failed to fetch purchased products:', error);
      addToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReviewModal = (product) => {
    if (product.isReviewed) return;
    setSelectedProduct(product);
    setFormData({
      rating: 5,
      content: '',
      orderId: product.orderId
    });
    setShowModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      addToast('Vui lòng nhập nội dung đánh giá', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await reviewApi.createReview(selectedProduct.productId, formData);
      addToast('Cảm ơn bạn đã chia sẻ trải nghiệm!', 'success');
      setShowModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      addToast(error.response?.data?.message || 'Không thể gửi đánh giá', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-stone-900 selection:bg-stone-900 selection:text-white pb-24">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-12 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.5em] text-stone-400 font-black">Post-Purchase Journey</span>
          <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter">Your Collection.</h1>
          <p className="text-stone-400 text-lg font-light max-w-xl">
            Nơi lưu giữ những thiết bị công nghệ đỉnh cao bạn đã sở hữu từ Nexus Store. Hãy chia sẻ cảm nhận để cộng đồng cùng phát triển.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-stone-100" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {products.map((item, idx) => (
              <div 
                key={`${item.productId}-${item.orderId}`} 
                className="group bg-white rounded-[32px] border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Product Image */}
                <div className="w-full sm:w-48 h-48 bg-stone-50 overflow-hidden relative">
                  <img 
                    src={getProductImageUrl(item.image)} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  {item.isReviewed && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="bg-white/90 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest text-stone-900">
                          Reviewed
                       </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">#{item.orderNumber}</span>
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{new Date(item.purchaseDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tighter leading-tight truncate max-w-[250px]">{item.name}</h3>
                    <p className="text-xs font-serif italic text-stone-400">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-stone-50 mt-4">
                    {item.isReviewed ? (
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < item.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Đã cảm nhận</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => openReviewModal(item)}
                        className="bg-stone-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
                      >
                        <MessageSquare size={12} /> Viết cảm nhận
                      </button>
                    )}
                    
                    <button 
                      onClick={() => navigate(`/product/${item.productId}`)} // Adjust if uses slug
                      className="p-2 text-stone-300 hover:text-stone-900 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 bg-white rounded-[40px] border border-dashed border-stone-200 text-center space-y-8 shadow-inner">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={32} strokeWidth={1} className="text-stone-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif italic">Empty Archives.</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">Bạn chưa có sản phẩm nào trong bộ sưu tập</p>
            </div>
            <button 
              onClick={() => navigate('/store')}
              className="px-10 py-4 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl"
            >
              Go to Store
            </button>
          </div>
        )}
      </section>

      {/* Review Modal (Consistent with ProductDetail) */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-8 flex justify-between items-center relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10 text-left">
                <p className="text-[10px] uppercase tracking-[0.5em] text-stone-400 font-black mb-2">Verified Review</p>
                <h3 className="text-3xl font-serif italic">Share Your Story.</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all relative z-10 text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="p-10 space-y-8 text-left">
              <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                 <img src={getProductImageUrl(selectedProduct?.image)} className="w-12 h-12 rounded-lg object-cover" alt="" />
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{selectedProduct?.name}</p>
                    <p className="text-[8px] font-bold uppercase text-stone-400">Đơn hàng: {selectedProduct?.orderNumber}</p>
                 </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">Chấm điểm thiết bị</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.rating >= star ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 bg-stone-50 text-stone-300'}`}
                    >
                      <Star size={24} fill={formData.rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">Chi tiết trải nghiệm</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tính năng nào làm bạn ấn tượng nhất? Nexus Store đã hỗ trợ bạn tốt chứ?"
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-6 text-sm font-light focus:border-stone-900 transition-all outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? 'Authenticating...' : <><Send size={16} /> Gửi đánh giá ngay</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedProductsPage;
