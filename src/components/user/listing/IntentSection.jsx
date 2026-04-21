import React from 'react';
import StorytellingProductCard from './StorytellingProductCard';

const IntentSection = ({ title, subtitle, products }) => {
  if (!products || products.length === 0) {
    return null; // Don't render the section if there are no products
  }

  return (
    <section>
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white">
          {title}
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          {subtitle}
        </p>
      </div>

      {/* Asymmetric Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {products.map((product, index) => (
          <StorytellingProductCard 
            key={product._id} 
            product={product}
            // Make the first item featured to create an asymmetric layout
            featured={index === 0} 
          />
        ))}
      </div>
    </section>
  );
};

export default IntentSection;
