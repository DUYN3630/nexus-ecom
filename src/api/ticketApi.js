import axiosClient from './axiosClient';

const ticketApi = {
  create: (data) => {
    return axiosClient.post('/tickets', data);
  },
  getAll: (params) => {
    return axiosClient.get('/tickets', { params });
  },
  update: (id, data) => {
    return axiosClient.put(`/tickets/${id}`, data);
  },
  claim: (id, expertId) => {
    return axiosClient.post(`/tickets/${id}/claim`, { expertId });
  },
  sendMessage: (id, data) => {
    return axiosClient.post(`/tickets/${id}/message`, data);
  },
  getHistory: (params) => {
    return axiosClient.get('/tickets/history', { params });
  },
  delete: (id) => {
    return axiosClient.delete(`/tickets/${id}`);
  }
};

export default ticketApi;
