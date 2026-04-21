import axiosClient from './axiosClient';

const ticketApi = {
  getAll: (params) => {
    return axiosClient.get('/tickets', { params });
  },
  update: (id, data) => {
    return axiosClient.put(`/tickets/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/tickets/${id}`);
  }
};

export default ticketApi;
