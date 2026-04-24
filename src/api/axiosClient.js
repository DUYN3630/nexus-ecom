import axios from 'axios';

const getBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return 'https://nexus-ecom-es17.onrender.com/api';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR GỬI TOKEN: Tự động lấy token từ localStorage và đính vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor nhận dữ liệu
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.status, error.config?.url);
    // Nếu bị 401 (hết hạn hoặc token sai), tự động đẩy ra trang login
    if (error.response?.status === 401) {
       localStorage.removeItem('user');
       if (window.location.pathname !== '/login') {
         window.location.href = '/login';
       }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
