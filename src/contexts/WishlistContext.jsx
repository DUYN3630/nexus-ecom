import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { AuthContext } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  // Key lưu trữ dựa trên userId
  const wishlistKey = useMemo(() => {
    const userId = user?._id || user?.id;
    return userId ? `nexus_wishlist_${userId}` : 'nexus_wishlist_guest';
  }, [user]);

  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist khi key thay đổi
  useEffect(() => {
    try {
      const stored = localStorage.getItem(wishlistKey);
      const initialWishlist = stored ? JSON.parse(stored) : [];
      setWishlist(initialWishlist);
    } catch (error) {
      console.error('Failed to load wishlist', error);
      setWishlist([]);
    } finally {
      setIsLoaded(true);
    }
  }, [wishlistKey]);

  // Tự động lưu vào LocalStorage mỗi khi wishlist thay đổi (chỉ lưu sau khi đã load xong)
  useEffect(() => {
    if (isLoaded && wishlistKey) {
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    }
  }, [wishlist, wishlistKey, isLoaded]);

  const toggleWishlist = (product) => {
    if (!product || !product._id) return;
    
    setWishlist((prev) => {
      const isExist = prev.find(item => item._id === product._id);
      if (isExist) {
        addToast(`Đã gỡ ${product.name} khỏi yêu thích`, 'success');
        return prev.filter(item => item._id !== product._id);
      } else {
        addToast(`Đã thêm ${product.name} vào yêu thích`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => String(item._id) === String(productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
    addToast('Đã xóa tất cả sản phẩm yêu thích', 'success');
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
