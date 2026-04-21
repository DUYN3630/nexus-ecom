import React from 'react';
import ProductCardAdapter from '../core/ProductCardAdapter';

const AccessoriesSection = ({ config, isVisible }) => {
  if (!config) return null;

  const { title, items, cardComponent } = config;

  return (
    <section id="accessories" className="py-40 px-6">
      <div className={`max-w-[1200px] mx-auto text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-5xl font-[1000] tracking-tighter uppercase mb-16">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {(items || []).map((item, i) => (
            <ProductCardAdapter 
              key={i}
              cardType={cardComponent}
              product={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccessoriesSection;
