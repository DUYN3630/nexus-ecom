import axiosClient from './axiosClient';

const paymentApi = {
  createMomoPayment: (data) => axiosClient.post('/payment/momo/create', data),
};

export default paymentApi;