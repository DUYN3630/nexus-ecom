import React from 'react';
import { Star, MoreVertical, MessageCircle, AlertOctagon, Trash2, Check, EyeOff } from 'lucide-react';
import SentimentBadge from '../common/SentimentBadge'; // Assuming this exists or I'll create simple badge

const ReviewsTable = ({ reviews, isLoading, onStatusChange, onToggleSpam, onDelete, onReply }) => {
  if (isLoading) return <div className="p-10 text-center text-slate-400">Đang tải dữ liệu...</div>;
  if (reviews.length === 0) return <div className="p-10 text-center text-slate-400">Không tìm thấy đánh giá nào.</div>;

  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-50 border-b border-slate-100">
        <tr>
          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</th>
          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng</th>
          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Đánh giá</th>
          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {reviews.map((review) => (
          <tr key={review._id} className="hover:bg-slate-50/50 transition-colors group">
            <td className="p-6">
              <div className="flex items-center gap-4">
                <img src={review.product?.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-100" />
                <div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[150px]">{review.product?.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">#{review.order?.toString().slice(-6)}</p>
                </div>
              </div>
            </td>
            <td className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                  {review.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{review.user?.name}</p>
                  <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </td>
            <td className="p-6 max-w-xs">
              <div className="flex items-center gap-1 text-yellow-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-200" : ""} />
                ))}
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{review.content}</p>
              {review.reply && (
                <div className="mt-2 pl-3 border-l-2 border-indigo-100 text-[10px] text-indigo-600 font-medium">
                  Phản hồi: {review.reply.text}
                </div>
              )}
            </td>
            <td className="p-6">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                review.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                review.status === 'hidden' ? 'bg-slate-100 text-slate-500' :
                'bg-amber-100 text-amber-700'
              }`}>
                {review.isSpam ? 'SPAM' : review.status}
              </span>
            </td>
            <td className="p-6 text-right">
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {review.status === 'pending' && (
                  <button 
                    onClick={() => onStatusChange(review._id, 'published')}
                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg tooltip" title="Duyệt"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  onClick={() => onReply(review)}
                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Trả lời"
                >
                  <MessageCircle size={16} />
                </button>
                <button 
                  onClick={() => onToggleSpam(review._id)}
                  className={`p-2 rounded-lg ${review.isSpam ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`} 
                  title="Báo Spam"
                >
                  <AlertOctagon size={16} />
                </button>
                {review.status !== 'published' && (
                   <button 
                     onClick={() => onDelete(review._id)}
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Xóa"
                   >
                     <Trash2 size={16} />
                   </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReviewsTable;