import { useBulkAction } from '../../../hooks/useBulkAction';
import { PencilSimpleLine, LockKey } from '@phosphor-icons/react';

const getStatusClass = (s) => {
    if(s==='active') return 'bg-white/90 text-emerald-600 border-emerald-100';
    if(s==='expired') return 'bg-white/90 text-slate-400 border-slate-200';
    if(s==='scheduled') return 'bg-white/90 text-blue-600 border-blue-100';
    return 'bg-white/90 text-slate-400 border-slate-200';
};

const getStatusLabel = (s) => {
    if(s==='active') return 'Đang hiển thị';
    if(s==='expired') return 'Hết hạn/Khóa';
    if(s==='scheduled') return 'Lên lịch';
    return 'Tạm ẩn';
};


const BannerGrid = ({ banners, onEdit }) => {
    const { selectedItems, toggleItemSelection } = useBulkAction();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map(b => {
                const isExpired = b.status === 'expired' || (b.end && new Date(b.end) < new Date());
                const effectiveStatus = isExpired ? 'expired' : b.status;
                
                return (
                    <div key={b.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all relative">
                        <div className="absolute top-4 left-4 z-10">
                            <input 
                                type="checkbox"
                                checked={selectedItems.includes(b.id)}
                                onChange={() => toggleItemSelection(b.id)}
                                className="w-5 h-5 rounded-lg border-white/50 text-brand-600 shadow-lg focus:ring-brand-500"
                            />
                        </div>
                        <div className="aspect-[16/8] relative overflow-hidden bg-slate-100">
                            <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            {isExpired && (
                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center text-white">
                                    <LockKey size={32} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusClass(effectiveStatus)}`}>
                                    {getStatusLabel(effectiveStatus)}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">{b.type}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-base leading-tight mb-4">{b.name}</h4>
                            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                                <span>Ưu tiên: {b.priority || 'N/A'}</span>
                                <button className="hover:text-brand-600" onClick={() => onEdit(b)} disabled={isExpired}>
                                    <PencilSimpleLine size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BannerGrid;
