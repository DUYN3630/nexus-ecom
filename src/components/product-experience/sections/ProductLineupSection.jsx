import React from 'react';
import ProductCardAdapter from '../core/ProductCardAdapter';

const ProductLineupSection = ({ config, isVisible }) => {
  if (!config) return null;

  const { products, cardComponent, animation } = config;

  return (
    <section id="lineup" className="py-40 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div 
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{ transitionDelay: `${animation?.delay || 0}ms` }}
        >
          {products && products.map((product) => (
            <ProductCardAdapter
              key={product.id}
              cardType={cardComponent}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductLineupSection;
