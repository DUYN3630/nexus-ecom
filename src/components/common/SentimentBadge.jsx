// src/components/common/SentimentBadge.jsx
const SentimentBadge = ({ type }) => {
    const styles = {
        positive: "bg-emerald-50 text-emerald-700 border-emerald-100",
        neutral: "bg-slate-100 text-slate-600 border-slate-200",
        negative: "bg-rose-50 text-rose-700 border-rose-100"
    };
    const labels = { positive: "Tích cực", neutral: "Bình thường", negative: "Tiêu cực" };
    return <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${styles[type]}`}>{labels[type]}</span>;
};

export default SentimentBadge;
