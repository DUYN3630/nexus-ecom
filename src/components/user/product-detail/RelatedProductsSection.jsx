import React, { useState, useEffect } from 'react';
import productApi from '../../../api/productApi';
import ProductCard from '../../common/ProductCard';

const RelatedProductsSection = ({ currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentProductId) return;

    const fetchRelated = async () => {
      try {
        setIsLoading(true);
        const res = await productApi.getRelated(currentProductId);
        setRelatedProducts(res || []);
      } catch (err) {
        console.error("Failed to load related products", err);
        setRelatedProducts([]); // Ensure it's an array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelated();
  }, [currentProductId]);

  if (isLoading) {
    // Skeleton loader for related products
    return (
      <div className="mt-32 pt-20 border-t border-slate-50">
        <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-10 h-8 bg-slate-100 rounded-lg w-1/3 animate-pulse"></h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-square bg-slate-100 rounded-2xl"></div>
              <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
              <div className="h-6 bg-slate-100 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't render the section if there are no related products
  }

  return (
    <div className="mt-32 pt-20 border-t border-slate-50">
      <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-10">Có thể bạn cũng thích</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {relatedProducts.map((p, idx) => (
          <ProductCard 
            key={p._id} 
            product={p} 
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${idx * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProductsSection;
