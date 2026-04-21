import axiosClient from './axiosClient';

const categoryApi = {
  // Lấy tất cả danh mục theo cấu trúc cây
  getAll: () => {
    const url = '/categories';
    return axiosClient.get(url);
  },

  // Lấy danh mục cho section explore
  getExplore: () => {
    const url = '/categories/explore';
    return axiosClient.get(url);
  },

  // Tạo một danh mục mới
  create: (categoryData) => {
    const url = '/categories';
    return axiosClient.post(url, categoryData);
  },

  // Cập nhật một danh mục
  update: (id, categoryData) => {
    const url = `/categories/${id}`;
    return axiosClient.put(url, categoryData);
  },

  // Xóa một danh mục
  delete: (id) => {
    const url = `/categories/${id}`;
    return axiosClient.delete(url);
  }
};

export default categoryApi;