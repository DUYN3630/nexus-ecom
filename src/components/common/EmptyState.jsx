import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "Không tìm thấy dữ liệu", 
  description = "Rất tiếc, chúng tôi không tìm thấy thông tin bạn yêu cầu.",
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed mb-8">
        {description}
      </p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
