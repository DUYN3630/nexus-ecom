import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const StorytellingProductCard = ({ product, featured = false }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const handleCardClick = (e) => {
    if (e.target.closest('a')) return;
    navigate(`/product/${product.slug}`);
  };

  const imageSrc = product.images?.[0]?.startsWith('http') 
    ? product.images[0] 
    : `http://127.0.0.1:5000${product.images?.[0]}`;

  return (
    <div 
      onClick={handleCardClick}
      className={`
        bg-paper rounded-3xl overflow-hidden group cursor-pointer border border-soft
        transition-all duration-300 hover:border-slate-300 hover:shadow-2xl flex flex-col
        ${featured ? 'col-span-1 md:col-span-2 row-span-1 md:row-span-2' : 'col-span-1'}
      `}
    >
      {/* Image Container */}
      <div className="bg-white p-4 sm:p-8 aspect-square flex items-center justify-center flex-grow overflow-hidden">
        {product.images?.[0] && (
          <img 
            src={imageSrc}
            alt={product.name}
            className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      {/* Content Container */}
      <div className="p-6 border-t border-soft">
        <p className="text-xs font-bold text-accent uppercase tracking-widest">
          {product.tags?.[0] || 'New Release'}
        </p>
        <h3 className="mt-2 text-2xl font-black uppercase tracking-tighter italic text-charcoal">
          {product.name}
        </h3>
        
        {/* AI Insight Placeholder */}
        <div className="mt-4 p-3 bg-light border border-soft rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            <h4 className="text-sm font-bold text-charcoal">AI's Insight</h4>
          </div>
          <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-slate-500">
            <li>Perfect for capturing cinematic 4K video on your next trip.</li>
            <li>The A17 Pro chip ensures ultra-smooth gaming performance.</li>
          </ul>
        </div>
        
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500">From</p>
            <p className="text-xl font-bold text-charcoal">{formatCurrency(product.price)}</p>
          </div>
          <div className="w-12 h-12 bg-charcoal rounded-full flex items-center justify-center text-white">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorytellingProductCard;
