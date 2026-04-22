import axiosClient from './axiosClient';

const orderApi = {
  getOrders: (params) => {
    const url = '/orders';
    return axiosClient.get(url, { params });
  },

  createOrder: (payload) => {
    const url = '/orders';
    return axiosClient.post(url, payload);
  },

  updateOrder: (id, payload) => {
    const url = `/orders/${id}`;
    return axiosClient.put(url, payload);
  },

  softDeleteOrder: (id) => {
    const url = `/orders/${id}/soft-delete`;
    return axiosClient.patch(url);
  },

  restoreOrder: (id) => {
    const url = `/orders/${id}/restore`;
    return axiosClient.patch(url);
  },

  getPurchasedProducts: () => {
    const url = '/orders/purchased-products';
    return axiosClient.get(url);
  },
};

export default orderApi;
