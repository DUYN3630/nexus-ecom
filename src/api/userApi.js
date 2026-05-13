import axiosClient from './axiosClient';

const userApi = {
  /**
   * Lấy thông tin cá nhân (Profile)
   */
  getProfile: () => {
    return axiosClient.get('/users/profile');
  },

  /**
   * Cập nhật thông tin cá nhân
   */
  updateProfile: (userData) => {
    return axiosClient.put('/users/profile', userData);
  },

  /**
   * Lấy danh sách tất cả người dùng
   */
  getAll: (params) => {
    const url = '/users';
    return axiosClient.get(url, { params });
  },

  /**
   * Tạo người dùng mới
   */
  create: (userData) => {
    const url = '/users';
    return axiosClient.post(url, userData);
  },

  /**
   * Cập nhật người dùng
   */
  update: (id, userData) => {
    const url = `/users/${id}`;
    return axiosClient.put(url, userData);
  },

  /**
   * Xóa (mềm) người dùng
   */
  delete: (id) => {
    const url = `/users/${id}`;
    return axiosClient.delete(url);
  },
};

export default userApi;
