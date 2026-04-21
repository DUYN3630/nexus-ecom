import { useState, useEffect, useCallback } from 'react';

const RECENT_KEY = 'nexus_recently_viewed';
const MAX_ITEMS = 10;

const useRecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentProducts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error reading recently viewed from localStorage', error);
    }
  }, []);

  const addToRecentlyViewed = useCallback((product) => {
    if (!product || !product._id) return;

    setRecentProducts((prev) => {
      // Loại bỏ sản phẩm nếu đã tồn tại để đưa lên đầu
      const filtered = prev.filter((p) => p._id !== product._id);
      
      // Tạo object thu gọn để tiết kiệm bộ nhớ, chỉ lưu thông tin cần thiết hiển thị card
      const minimalProduct = {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images || [product.image], // Lưu mảng images để tương thích với getProductImageUrl
        slug: product.slug,
        category: product.category
      };

      const newRecent = [minimalProduct, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
      } catch (error) {
        console.error('Error saving to localStorage', error);
      }
      
      return newRecent;
    });
  }, []);

  return { recentProducts, addToRecentlyViewed };
};


export default useRecentlyViewed;
