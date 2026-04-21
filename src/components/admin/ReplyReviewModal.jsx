import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const ReplyReviewModal = ({ review, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    await onSubmit(review._id, text);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Phản hồi khách hàng</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-black hover:bg-slate-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex gap-1 text-yellow-400 mb-2">
             {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
          </div>
          <p className="text-sm font-medium text-slate-600 italic">"{review.content}"</p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none resize-none mb-6"
            placeholder="Nhập nội dung phản hồi..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          ></textarea>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !text.trim()}
              className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang gửi...' : <><Send size={14} /> Gửi phản hồi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyReviewModal;