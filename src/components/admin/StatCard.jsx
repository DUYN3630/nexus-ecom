// src/components/admin/StatCard.jsx
import { icons } from "lucide-react";

const StatCard = ({ title, value, icon, color }) => {
    const LucideIcon = icons[icon];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {LucideIcon && <LucideIcon className="w-6 h-6" />}
            </div>
            <div className="text-left">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
            </div>
        </div>
    );
};

export default StatCard;
