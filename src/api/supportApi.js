import axiosClient from './axiosClient';

const supportApi = {
  checkWarranty: (serialNumber) => axiosClient.get(`/support/warranty/${serialNumber}`),
  submitRepair: (data) => axiosClient.post('/support/repair', data),
  getMyRepairs: () => axiosClient.get('/support/my-repairs'),
  
  // Admin methods
  getAllRepairs: (params) => axiosClient.get('/support/repairs', { params }),
  updateRepairStatus: (id, data) => axiosClient.patch(`/support/repair/${id}`, data),
};

export default supportApi;
