import axios from 'axios';

// Link Backend Render thật của bạn
const RENDER_API_URL = 'https://nexus-ecom-es17.onrender.com/api';

const getBaseURL = () => {
  const isLocal = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('172.') || 
    window.location.hostname.endsWith('.local');

  if (isLocal) {
    // Nếu đang chạy Docker (thông qua Port 80 của Nginx)
    if (window.location.port === '' || window.location.port === '80') {
      return '/api'; // Dùng relative path để Nginx tự proxy sang backend:5000
    }
    return 'http://localhost:5000/api';
  }
  return RENDER_API_URL;
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// TỰ ĐỘNG GẮN TOKEN: Lấy từ localStorage mỗi khi gọi API
axiosClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const token = user.token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// XỬ LÝ LỖI 401: Nếu token hết hạn hoặc sai, tự động đăng xuất
// TUY NHIÊN: Không đăng xuất nếu là lỗi sai mật khẩu khi Login hoặc Đổi mật khẩu
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isChangePasswordRequest = error.config?.url?.includes('/auth/change-password');

    if (error.response?.status === 401 && !isLoginRequest && !isChangePasswordRequest) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (window.location.pathname.startsWith('/admin')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
