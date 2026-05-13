// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Function to get user data from localStorage
const getUserFromStorage = () => {
  try {
    const serializedUser = localStorage.getItem('user');
    if (serializedUser === null) {
      return null;
    }
    return JSON.parse(serializedUser);
  } catch (err) {
    console.error("Could not load user from local storage", err);
    return null;
  }
};

// Function to get token from localStorage
const getTokenFromStorage = () => {
  return localStorage.getItem('token');
};

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set user on login
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      // Save to localStorage
      try {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      } catch (err) {
        console.error("Could not save user/token to local storage", err);
      }
    },
    // Action to clear user on logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear from localStorage
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } catch (err) {
        console.error("Could not remove user/token from local storage", err);
      }
    },
  },
});

// Export actions
export const { setUser, logout } = authSlice.actions;

// Export selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

// Export the reducer
export default authSlice.reducer;
