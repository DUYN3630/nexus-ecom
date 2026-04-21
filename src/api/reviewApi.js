import axiosClient from './axiosClient';

const reviewApi = {
  getProductReviews: (productId, params) => {
    return axiosClient.get(`/reviews/product/${productId}`, { params });
  },
  checkPermission: (productId) => {
    return axiosClient.get(`/reviews/check-permission/${productId}`);
  },
  createReview: (productId, data) => {
    return axiosClient.post(`/reviews/product/${productId}`, data);
  },
  getPublic: (params) => {
    return axiosClient.get('/reviews/public', { params });
  },
  
  // Admin methods
  getAll: (params) => {
    return axiosClient.get('/reviews', { params });
  },
  updateStatus: (id, status) => {
    return axiosClient.patch(`/reviews/${id}/status`, { status });
  },
  toggleSpam: (id) => {
    return axiosClient.patch(`/reviews/${id}/spam`);
  },
  delete: (id) => {
    return axiosClient.delete(`/reviews/${id}`);
  },
  reply: (id, text) => {
    return axiosClient.post(`/reviews/${id}/reply`, { text });
  }
};

export default reviewApi;
