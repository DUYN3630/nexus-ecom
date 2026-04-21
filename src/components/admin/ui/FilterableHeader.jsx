// src/components/admin/ui/FilterableHeader.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const FilterableHeader = ({ title, options, activeFilter, setFilter, filterKey, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    return (
        <th className="px-6 py-4 relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                    {options.map(option => (
                        <button 
                            key={option.value} 
                            onClick={() => { setFilter(filterKey, option.value); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-3 ${activeFilter === option.value ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                           {option.icon} {option.label}
                        </button>
                    ))}
                </div>
            )}
        </th>
    );
};

export default FilterableHeader;
