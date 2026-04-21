import { createContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider Component
const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Hàm đăng nhập
  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, []);

  // Hàm đăng xuất
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Sync auth state across tabs & Initialize
  useEffect(() => {
    const syncAuth = (event) => {
      if (event.key === 'token') {
        setToken(event.newValue);
        if (!event.newValue) setUser(null);
      }
      if (event.key === 'user') {
        try {
          setUser(event.newValue ? JSON.parse(event.newValue) : null);
        } catch (e) {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', syncAuth);
    
    // Setup Axios Interceptor
    const interceptorId = axiosClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    const timer = setTimeout(() => setIsAuthLoading(false), 200);

    return () => {
      window.removeEventListener('storage', syncAuth);
      axiosClient.interceptors.response.eject(interceptorId);
      clearTimeout(timer);
    };
  }, [logout]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      logout, 
      isAuthenticated,
      isAuthLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
