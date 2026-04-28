import { createContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const login = useCallback((newToken, newUser) => {
    const userData = { ...newUser, token: newToken };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', newToken); // Lưu rời để đảm bảo các thành phần cũ vẫn đọc được
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    // Tắt trạng thái Loading sau khi đã đọc xong Storage
    const timer = setTimeout(() => setIsAuthLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Kiểm tra đăng nhập dựa trên việc có User và có Token
  const isAuthenticated = !!(user && (user.token || localStorage.getItem('token')));

  return (
    <AuthContext.Provider value={{ 
      user, 
      token: user?.token || localStorage.getItem('token'),
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
