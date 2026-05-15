import axiosClient from './axiosClient';

const logisticsApi = {
  createShippingOrder: (data) => axiosClient.post('/logistics/create-order', data),
};

export default logisticsApi;
