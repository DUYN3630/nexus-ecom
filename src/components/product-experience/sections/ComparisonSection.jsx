import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ComparisonSection = ({ config, isVisible }) => {
  const [isComparisonOpen, setIsComparisonOpen] = useState(config?.isInitiallyOpen || false);

  if (!config) return null;

  const { title, comparisonData, columnHeaders } = config;

  return (
    <section id="compare" className="py-32 bg-transparent px-6">
      <div className={`max-w-[900px] mx-auto border-t border-[#D2D2D7] pt-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => setIsComparisonOpen(!isComparisonOpen)}
          className="w-full flex items-center justify-between group"
        >
          <h2 className="text-4xl font-[1000] tracking-tighter uppercase">{title}</h2>
          <div className="w-12 h-12 rounded-full bg-[#F5F5F7] flex items-center justify-center group-hover:scale-110 transition-all border border-[#D2D2D7]/50 shadow-inner">
            {isComparisonOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isComparisonOpen ? 'max-h-[1200px] opacity-100 mt-20' : 'max-h-0 opacity-0'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6E6E73] border-b border-[#D2D2D7]/50">
                <th className="py-8">{columnHeaders.feature}</th>
                <th className="py-8">{columnHeaders.pro}</th>
                <th className="py-8">{columnHeaders.standard}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {(comparisonData || []).map((row, i) => (
                <tr key={i} className="border-b border-[#D2D2D7]/30 hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="py-10 text-[#6E6E73] font-bold">{row.feature}</td>
                  <td className="py-10 font-[1000] text-lg tracking-tighter uppercase">{row.pro}</td>
                  <td className="py-10 text-[#6E6E73]">{row.standard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
