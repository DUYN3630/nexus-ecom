import { Pencil, Trash2, Circle } from 'lucide-react';
import getProductImageUrl from '../../../utils/getProductImageUrl';

const BannerList = ({ banners, onEdit, onDelete }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[40%]">Chiến dịch / Tên</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vị trí</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hiệu quả</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tác vụ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {banners.map((banner) => (
            <tr key={banner._id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                    {banner.media?.kind === 'video' ? (
                      <video src={getProductImageUrl(banner.media.url)} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={getProductImageUrl(banner.media.url)} alt={banner.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-brand-600 transition-colors truncate max-w-[200px]">{banner.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{banner.schedule?.startAt ? new Date(banner.schedule.startAt).toLocaleDateString('vi-VN') : 'Chưa đặt lịch'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight border border-slate-200">
                  {banner.position?.replace('-', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {(() => {
                  const now = new Date();
                  const isExpired = banner.status === 'expired' || (banner.schedule?.endAt && new Date(banner.schedule.endAt) < now);
                  const statusLabel = isExpired ? 'expired' : banner.status;
                  
                  return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                      statusLabel === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      statusLabel === 'scheduled' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      statusLabel === 'expired' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      <Circle className="fill-current" size={6} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{statusLabel}</span>
                    </div>
                  );
                })()}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-slate-800 tabular-nums">{(banner.analytics?.clicks || 0).toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Clicks</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(banner)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><Pencil size={18} /></button>
                  <button onClick={() => onDelete(banner._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default BannerList;
