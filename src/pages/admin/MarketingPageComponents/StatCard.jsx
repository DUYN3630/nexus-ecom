const StatCard = ({ title, value, icon: Icon, bgColor, textColor, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all group ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''}`}
    >
      <div className={`w-14 h-14 ${bgColor} ${textColor} rounded-xl flex items-center justify-center border border-transparent shadow-sm group-hover:scale-110 transition-transform`}>
        {Icon && <Icon className="w-7 h-7" />}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 tabular-nums">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
