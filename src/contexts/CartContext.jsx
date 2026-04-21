import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Key lưu trữ dựa trên userId, nếu không có user thì dùng key cho khách
  const cartKey = useMemo(() => {
    return user ? `nexus_cart_${user._id || user.id}` : 'nexus_cart_guest';
  }, [user]);

  const [cartItems, setCartItems] = useState([]);

  // Load cart khi key thay đổi (đăng nhập/đăng xuất/đổi tài khoản)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(cartKey);
      setCartItems(storedCart ? JSON.parse(storedCart) : []);
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
      setCartItems([]);
    }
  }, [cartKey]);

  // Tự động lưu vào LocalStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, cartKey]);

  const addToCart = (product, quantity = 1, variant = null) => {
    if (!product || !product._id) {
      console.error('Invalid product data:', product);
      return;
    }

    // Determine the correct price (prioritize sale/discount price)
    const priceToUse = product.discountPrice || product.salePrice || product.price || 0;

    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item._id === product._id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      
      if (existingItem) {
        return prev.map(item => 
          item._id === product._id && JSON.stringify(item.variant) === JSON.stringify(variant)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      const newItem = { 
        _id: product._id,
        name: product.name,
        price: priceToUse,
        image: product.images?.[0] || '',
        slug: product.slug,
        variant,
        quantity 
      };

      console.log('Adding new item to cart:', newItem);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId, variant = null) => {
    setCartItems(prev => prev.filter(item => !(item._id === productId && JSON.stringify(item.variant) === JSON.stringify(variant))));
  };

  const updateQuantity = (productId, quantity, variant = null) => {
    setCartItems(prev => prev.map(item => 
      item._id === productId && JSON.stringify(item.variant) === JSON.stringify(variant)
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
