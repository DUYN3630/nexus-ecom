// src/store/slices/authSlice.test.js
import { describe, it, expect, vi } from 'vitest';
import authReducer, { setUser, logout } from './authSlice';

// Mock localStorage before each test
vi.spyOn(Storage.prototype, 'setItem');
vi.spyOn(Storage.prototype, 'getItem');
vi.spyOn(Storage.prototype, 'removeItem');

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  it('should return the initial state', () => {
    // We pass undefined as the state to ensure it uses the default initial state
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUser action', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'fake-jwt-token';
    const payload = { user: mockUser, token: mockToken };

    const state = authReducer(initialState, setUser(payload));

    // Check state
    expect(state.user).toEqual(mockUser);
    expect(state.token).toEqual(mockToken);
    expect(state.isAuthenticated).toBe(true);

    // Check localStorage interaction
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should handle logout action', () => {
    // Create a logged-in state first
    const loggedInState = {
      user: { id: '1', name: 'Test User' },
      token: 'fake-jwt-token',
      isAuthenticated: true,
    };

    const state = authReducer(loggedInState, logout());

    // Check state
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);

    // Check localStorage interaction
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
});
