// src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Changed from cartItems to items for simplicity
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action to completely replace the cart, useful for loading from localStorage
    setCart: (state, action) => {
      state.items = action.payload;
    },

    addToCart: (state, action) => {
      const { product, quantity = 1, variant = null } = action.payload;
      const priceToUse = product.discountPrice || product.salePrice || product.price || 0;

      const existingItem = state.items.find(item => 
        item._id === product._id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id: product._id,
          name: product.name,
          price: priceToUse,
          image: product.images?.[0] || '',
          slug: product.slug,
          variant,
          quantity,
        });
      }
    },

    removeFromCart: (state, action) => {
      const { productId, variant = null } = action.payload;
      state.items = state.items.filter(item => 
        !(item._id === productId && JSON.stringify(item.variant) === JSON.stringify(variant))
      );
    },

    updateQuantity: (state, action) => {
      const { productId, quantity, variant = null } = action.payload;
      const itemToUpdate = state.items.find(item => 
        item._id === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      if (itemToUpdate) {
        itemToUpdate.quantity = Math.max(1, quantity);
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

// Export actions
export const { setCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Export selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

// Export the reducer
export default cartSlice.reducer;
