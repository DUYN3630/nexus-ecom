import axiosClient from './axiosClient';

const supportApi = {
  checkWarranty: (serialNumber) => axiosClient.get(`/support/warranty/${serialNumber}`),
  submitRepair: (data) => axiosClient.post('/support/repair', data),
  getRepairByPhone: (phone) => axiosClient.get(`/support/repair/track/${phone}`),
  getMyRepairs: () => axiosClient.get('/support/my-repairs'),
  
  // Admin methods
  getAllRepairs: (params) => axiosClient.get('/support/repairs', { params }),
  getExpertRepairs: (expertId) => axiosClient.get(`/support/repairs/expert/${expertId}`),
  updateRepairStatus: (id, data) => axiosClient.patch(`/support/repair/${id}`, data),
};

export default supportApi;
