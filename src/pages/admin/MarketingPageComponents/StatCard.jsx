const StatCard = ({ title, value, icon: Icon, bgColor, textColor, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''}`}
    >
      <div className={`w-12 h-12 ${bgColor} ${textColor} rounded-2xl flex items-center justify-center`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
