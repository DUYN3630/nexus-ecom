import axiosClient from './axiosClient';

const partApi = {
  getAll: () => axiosClient.get('/parts'),
  create: (data) => axiosClient.post('/parts', data),
  update: (id, data) => axiosClient.put(`/parts/${id}`, data),
  delete: (id) => axiosClient.delete(`/parts/${id}`),
};

export default partApi;
