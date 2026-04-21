import axiosClient from './axiosClient';

const userApi = {
  /**
   * Lấy danh sách tất cả người dùng
   */
  getAll: () => {
    const url = '/users';
    return axiosClient.get(url);
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
