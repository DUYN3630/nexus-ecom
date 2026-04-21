import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CategoryProductCard from './CategoryProductCard';

// Accent color → Tailwind class mapping cho button
const ACCENT_BUTTON_COLORS = {
  indigo: 'hover:bg-indigo-600',
  blue: 'hover:bg-blue-600',
  pink: 'hover:bg-pink-600',
  orange: 'hover:bg-orange-600',
};

const ACCENT_LABEL_COLORS = {
  indigo: 'text-indigo-600',
  blue: 'text-blue-600',
  pink: 'text-pink-600',
  orange: 'text-orange-600',
};

/**
 * Section grid sản phẩm tái sử dụng.
 * Bao gồm: label + title + "xem tất cả" button + product grid.
 * 
 * @param {Array} products - Danh sách products đã filter
 * @param {string} label - Text label nhỏ phía trên tiêu đề
 * @param {string} title - Tiêu đề lớn
 * @param {string} accentColor - 'indigo' | 'blue' | 'pink' | 'orange'
 * @param {string} buttonText - Text nút "Xem toàn bộ"
 * @param {string} buttonLink - Link navigate khi click button
 * @param {number} columns - Số cột grid (default: 3)
 * @param {number} maxItems - Số sản phẩm tối đa (default: 6)
 * @param {string} sectionBg - Background class (default: 'bg-slate-50')
 * @param {Object} cardProps - Additional props cho CategoryProductCard
 */
const ProductGridSection = ({ 
  products = [],
  label = 'The Lineup',
  title = 'Tìm sản phẩm của bạn.',
  accentColor = 'indigo',
  buttonText = 'Xem toàn bộ sản phẩm',
  buttonLink = '/store',
  columns = 3,
  maxItems = 6,
  sectionBg = 'bg-slate-50',
  cardProps = {},
}) => {
  const navigate = useNavigate();

  const gridColsClass = columns === 4 
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const displayProducts = products.slice(0, maxItems);
  const labelColor = ACCENT_LABEL_COLORS[accentColor] || ACCENT_LABEL_COLORS.indigo;
  const buttonHoverColor = ACCENT_BUTTON_COLORS[accentColor] || ACCENT_BUTTON_COLORS.indigo;

  return (
    <section className={`py-40 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="space-y-4 text-left">
            <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${labelColor} italic`}>
              {label}
            </p>
            <h2 className="text-6xl font-black italic tracking-tighter">
              {title}
            </h2>
          </div>
          <button 
            onClick={() => navigate(buttonLink)} 
            className={`group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest ${buttonHoverColor} transition-all shadow-xl`}
          >
            {buttonText} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className={`grid ${gridColsClass} gap-10`}>
          {displayProducts.length > 0 ? (
            displayProducts.map((product) => (
              <CategoryProductCard 
                key={product._id} 
                product={product} 
                accentColor={accentColor}
                {...cardProps}
              />
            ))
          ) : (
            Array.from({ length: Math.min(maxItems, columns) }).map((_, i) => (
              <div key={i} className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 animate-pulse">
                <div className="aspect-square mb-10 bg-slate-100 rounded-3xl" />
                <div className="h-8 w-3/4 bg-slate-100 rounded-lg mb-6" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
