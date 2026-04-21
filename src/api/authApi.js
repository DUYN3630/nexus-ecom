import axiosClient from './axiosClient';

const authApi = {
  login: (email, password) => {
    return axiosClient.post('/auth/login', { email, password });
  },

  googleLogin: (credential) => {
    return axiosClient.post('/auth/google', { credential });
  },

  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },

  forgotPassword: (email) => {
    return axiosClient.post('/auth/forgot-password', { email });
  },

  resetPassword: (token, password, confirmPassword) => {
    return axiosClient.post(`/auth/reset-password/${token}`, { password, confirmPassword });
  },

  phoneAuth: (data) => {
    return axiosClient.post('/auth/phone-auth', data);
  },
};

export default authApi;
