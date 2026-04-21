import { Pencil, Trash, Circle } from '@phosphor-icons/react';

const BannerList = ({ banners, onEdit, onDelete }) => (
  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-50 border-b border-slate-100">
        <tr>
          <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest w-[40%]">Chiến dịch / Tên</th>
          <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Vị trí</th>
          <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
          <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Hiệu quả</th>
          <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Tác vụ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {banners.map((banner) => (
          <tr key={banner._id} className="group hover:bg-slate-50/50 transition-colors">
            <td className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                  {banner.media?.kind === 'video' ? (
                    <video src={`http://127.0.0.1:5000${banner.media.url}`} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={`http://127.0.0.1:5000${banner.media.url}`} alt={banner.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">{banner.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{banner.schedule?.startAt ? new Date(banner.schedule.startAt).toLocaleDateString() : 'Chưa đặt lịch'}</p>
                </div>
              </div>
            </td>
            <td className="p-5 text-center">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                {banner.position?.replace('-', ' ')}
              </span>
            </td>
            <td className="p-5 text-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                banner.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                banner.status === 'scheduled' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <Circle weight="fill" size={8} />
                <span className="text-[10px] font-bold uppercase tracking-wide">{banner.status}</span>
              </div>
            </td>
            <td className="p-5 text-center">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-700">{(banner.analytics?.clicks || 0).toLocaleString()}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Clicks</span>
              </div>
            </td>
            <td className="p-5 text-right">
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(banner)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><Pencil size={16} /></button>
                <button onClick={() => onDelete(banner._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all"><Trash size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BannerList;
