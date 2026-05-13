// src/store/localStorageMiddleware.js

/**
 * A Redux middleware that persists parts of the state to localStorage.
 * It specifically listens for cart actions and saves the cart.
 * It also listens for auth actions to handle cart migration between guest and user.
 */
export const localStorageMiddleware = store => next => action => {
  // Let the action pass through to update the state first
  const result = next(action);

  // After the state is updated, persist to localStorage if needed
  const state = store.getState();
  const user = state.auth.user;
  
  if (action.type.startsWith('cart/')) {
    const cartItems = state.cart.items;
    const cartKey = user ? `nexus_cart_${user._id || user.id}` : 'nexus_cart_guest';
    
    try {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Could not save cart to local storage", e);
    }
  }

  // Handle user logging in: merge guest cart with user cart
  if (action.type === 'auth/setUser') {
    const guestCartKey = 'nexus_cart_guest';
    const userCartKey = `nexus_cart_${action.payload.user._id || action.payload.user.id}`;
    
    try {
      const guestCartRaw = localStorage.getItem(guestCartKey);
      const userCartRaw = localStorage.getItem(userCartKey);
      
      const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : [];
      const userCart = userCartRaw ? JSON.parse(userCartRaw) : [];

      if (guestCart.length > 0) {
        // Simple merge: guest cart items are added to user cart.
        // A more complex strategy could handle quantity updates for duplicate items.
        const mergedCart = [...userCart];
        guestCart.forEach(guestItem => {
          const existingItemIndex = mergedCart.findIndex(userItem => userItem._id === guestItem._id);
          if (existingItemIndex > -1) {
            // Item exists, update quantity
            mergedCart[existingItemIndex].quantity += guestItem.quantity;
          } else {
            // Item does not exist, add it
            mergedCart.push(guestItem);
          }
        });

        localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
        localStorage.removeItem(guestCartKey);
        
        // Dispatch an action to update the state in Redux as well
        store.dispatch({ type: 'cart/setCart', payload: mergedCart });
      }
    } catch (e) {
      console.error("Could not merge carts", e);
    }
  }

  // Handle user logging out: we don't need to do anything special,
  // as the next cart action will use the 'nexus_cart_guest' key.

  return result;
};
