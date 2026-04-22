import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Star, AlertTriangle, CheckCircle, Search, Filter, MoreVertical, ChevronLeft, ChevronRight 
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
    <div className="space-y-8 text-left">
      {/* 1. Header & Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đánh giá</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi phản hồi từ khách hàng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng đánh giá" 
          value={stats.totalReviews} 
          icon={MessageSquare} 
          trend="+12%" 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Điểm trung bình" 
          value={stats.avgRating?.toFixed(1) || 0} 
          icon={Star} 
          trend="Ổn định" 
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard 
          title="Chờ duyệt" 
          value={stats.pendingCount} 
          icon={CheckCircle} 
          trend="Cần xử lý ngay" 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Spam / Rác" 
          value={stats.spamCount} 
          icon={AlertTriangle} 
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* 2. Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung, sản phẩm..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
          <select 
            className="bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="published">Đã đăng</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <ReviewsTable 
          reviews={reviews} 
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onToggleSpam={handleToggleSpam}
          onDelete={handleDelete}
          onReply={(review) => setSelectedReview(review)}
        />
        
        {/* Pagination Navigation */}
        {pagination.totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
              Trang {pagination.page} / {pagination.totalPages} • {pagination.total} đánh giá
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded-xl border transition-all ${pagination.page === 1 ? 'text-slate-200 border-slate-50 cursor-not-allowed' : 'text-slate-500 border-slate-200 hover:bg-white hover:text-indigo-600 shadow-sm'}`}
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${
                    pagination.page === i + 1 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-slate-400 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 rounded-xl border transition-all ${pagination.page === pagination.totalPages ? 'text-slate-200 border-slate-50 cursor-not-allowed' : 'text-slate-500 border-slate-200 hover:bg-white hover:text-indigo-600 shadow-sm'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
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
