import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Star, AlertTriangle, CheckCircle, Search, Filter, MoreVertical 
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
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    rating: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [selectedReview, setSelectedReview] = useState(null); // For Reply Modal
  const { addToast } = useToast();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reviewApi.getAll(filters);
      setReviews(response.reviews);
      setStats(response.stats);
    } catch (error) {
      addToast('Không thể tải danh sách đánh giá', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Actions
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic Update
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      await reviewApi.updateStatus(id, newStatus);
      addToast('Cập nhật trạng thái thành công', 'success');
      fetchReviews(); // Refresh stats
    } catch (error) {
      addToast('Lỗi cập nhật trạng thái', 'error');
      fetchReviews(); // Rollback
    }
  };

  const handleToggleSpam = async (id) => {
    try {
      setReviews(prev => prev.map(r => r._id === id ? { ...r, isSpam: !r.isSpam } : r));
      await reviewApi.toggleSpam(id);
      addToast('Đã đánh dấu spam', 'success');
      fetchReviews();
    } catch (error) {
      addToast('Lỗi thao tác', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await reviewApi.delete(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      addToast('Đã xóa đánh giá', 'success');
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
    <div className="space-y-8">
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
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung, sản phẩm..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select 
            className="bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="published">Đã đăng</option>
            <option value="hidden">Đã ẩn</option>
          </select>
          <select 
            className="bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none"
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
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