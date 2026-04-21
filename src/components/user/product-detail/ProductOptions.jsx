import React from 'react';

const ProductOptions = ({ options, selection, setSelection }) => {
  return (
    <div className="space-y-8">
      {options.map((opt) => (
        <div key={opt.type} className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{opt.label}</label>
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
              {opt.values.find(v => v.id === selection[opt.type])?.name}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {opt.type === 'color' ? (
              opt.values.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelection({...selection, color: v.id})}
                  className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${selection.color === v.id ? 'border-black' : 'border-transparent hover:scale-110'}`}
                  title={v.name}
                >
                  <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: v.hex }}></div>
                </button>
              ))
            ) : (
              opt.values.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelection({...selection, storage: v.id})}
                  className={`px-6 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${selection.storage === v.id ? 'bg-black text-white border-black shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                >
                  {v.name}
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductOptions;
