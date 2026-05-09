import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Star, AlertTriangle, CheckCircle, Search, Filter, MoreVertical, ChevronLeft, ChevronRight, Clock, RotateCcw 
} from 'lucide-react';
import reviewApi from '../../api/reviewApi';
import StatCard from '../../components/admin/StatCard';
import FilterableHeader from '../../components/admin/ui/FilterableHeader';
import ReviewsTable from '../../components/admin/ReviewsTable';
import ReplyReviewModal from '../../components/admin/ReplyReviewModal';
import { useToast } from '../../contexts/ToastContext';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    pendingCount: 0,
    spamCount: 0
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    rating: '',
    search: '',
    page: 1,
    limit: 5
  });
  const [selectedReview, setSelectedReview] = useState(null); // For Reply Modal
  const { addToast } = useToast();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reviewApi.getAll(filters);
      setReviews(response.reviews || []);
      setStats(response.stats || { totalReviews: 0, avgRating: 0, pendingCount: 0, spamCount: 0 });
      if (response.totalPages) {
        setPagination({
          page: response.currentPage,
          totalPages: response.totalPages,
          total: response.total
        });
      }
    } catch (error) {
      addToast('Không thể tải danh sách đánh giá', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Actions
  const handleStatusChange = async (id, newStatus) => {
    try {
      await reviewApi.updateStatus(id, newStatus);
      addToast('Cập nhật trạng thái thành công', 'success');
      fetchReviews();
    } catch (error) {
      addToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  const handleToggleSpam = async (id) => {
    try {
      await reviewApi.toggleSpam(id);
      addToast('Đã cập nhật trạng thái spam', 'success');
      fetchReviews();
    } catch (error) {
      addToast('Lỗi thao tác', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await reviewApi.delete(id);
      addToast('Đã xóa đánh giá', 'success');
      fetchReviews();
    } catch (error) {
      addToast(error.response?.data?.message || 'Không thể xóa', 'error');
    }
  };

  const handleReplySubmit = async (reviewId, text) => {
    try {
      await reviewApi.reply(reviewId, text);
      addToast('Đã trả lời đánh giá', 'success');
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      addToast('Lỗi gửi phản hồi', 'error');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đánh giá</h1>
          <p className="text-sm text-slate-500 font-medium">Theo dõi và kiểm duyệt phản hồi từ cộng đồng khách hàng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
            { title: "Tổng đánh giá", value: stats.totalReviews, sub: "+12% so với tháng trước", icon: MessageSquare, color: "bg-brand-50 text-brand-600" },
            { title: "Điểm trung bình", value: stats.avgRating?.toFixed(1) || 0, sub: "Dựa trên trải nghiệm thực", icon: Star, color: "bg-amber-50 text-amber-600" },
            { title: "Chờ phê duyệt", value: stats.pendingCount, sub: "Cần xử lý trong 24h", icon: Clock, color: "bg-blue-50 text-blue-600" },
            { title: "Báo cáo Spam", value: stats.spamCount, sub: "Tự động phát hiện", icon: AlertTriangle, color: "bg-rose-50 text-rose-600" }
        ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.color} border border-transparent group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-black text-slate-800 tabular-nums">{stat.value}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{stat.sub}</p>
                </div>
            </div>
        ))}
      </div>

      {/* 2. Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo nội dung, tên sản phẩm..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-inner"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
                className="flex-1 md:flex-none bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
                <option value="all">Tất cả Trạng thái</option>
                <option value="pending">Chờ phê duyệt</option>
                <option value="published">Đã hiển thị</option>
                <option value="hidden">Đã ẩn (Private)</option>
            </select>
            <button 
                onClick={() => setFilters({ ...filters, search: '', status: 'all', page: 1 })}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 hover:border-brand-100 transition-all shadow-sm"
            >
                <RotateCcw size={18} />
            </button>
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-x-auto">
            <ReviewsTable 
            reviews={reviews} 
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onToggleSpam={handleToggleSpam}
            onDelete={handleDelete}
            onReply={(review) => setSelectedReview(review)}
            />
        </div>
        
        {/* Pagination Navigation */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-left">
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
              Trang {pagination.page} / {pagination.totalPages || 1} • {pagination.total} đánh giá
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                            pagination.page === i + 1 
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                    {i + 1}
                    </button>
                )).slice(Math.max(0, pagination.page - 3), Math.min(pagination.totalPages, pagination.page + 2))}
              </div>

              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <ReplyReviewModal 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
