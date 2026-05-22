import { describe, it, expect } from 'vitest';
import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart, selectCartTotal } from './cartSlice';

describe('cartSlice', () => {
  const initialState = {
    items: [],
  };

  const mockProduct = {
    _id: 'p1',
    name: 'iPhone 15',
    price: 1000,
    images: ['test.jpg'],
    slug: 'iphone-15'
  };

  it('should return the initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addToCart', () => {
    const state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 1 }));
    expect(state.items.length).toBe(1);
    expect(state.items[0]._id).toBe('p1');
    expect(state.items[0].quantity).toBe(1);
  });

  it('should increment quantity if same product added again', () => {
    let state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 1 }));
    state = cartReducer(state, addToCart({ product: mockProduct, quantity: 2 }));
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('should handle removeFromCart', () => {
    const populatedState = {
      items: [{ _id: 'p1', name: 'iPhone 15', price: 1000, quantity: 1, variant: null }]
    };
    const state = cartReducer(populatedState, removeFromCart({ productId: 'p1' }));
    expect(state.items.length).toBe(0);
  });

  it('should handle updateQuantity', () => {
    const populatedState = {
      items: [{ _id: 'p1', name: 'iPhone 15', price: 1000, quantity: 1, variant: null }]
    };
    const state = cartReducer(populatedState, updateQuantity({ productId: 'p1', quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
  });

  it('should handle clearCart', () => {
    const populatedState = {
      items: [{ _id: 'p1', name: 'iPhone 15', price: 1000, quantity: 1, variant: null }]
    };
    const state = cartReducer(populatedState, clearCart());
    expect(state.items.length).toBe(0);
  });

  it('should calculate correct total using selector', () => {
    const state = {
      cart: {
        items: [
          { _id: 'p1', price: 1000, quantity: 2 },
          { _id: 'p2', price: 500, quantity: 1 }
        ]
      }
    };
    expect(selectCartTotal(state)).toBe(2500);
  });
});
