import axiosClient from './axiosClient';

const expertApi = {
  getAll: () => axiosClient.get('/experts'),
  getById: (id) => axiosClient.get(`/experts/${id}`),
};

export default expertApi;
