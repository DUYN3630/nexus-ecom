import axiosClient from './axiosClient';

const appointmentApi = {
  getExpertAvailability: (expertId, date) => {
    return axiosClient.get(`/appointments/experts/${expertId}/availability`, { params: { date } });
  },
  create: (data) => {
    return axiosClient.post('/appointments', data);
  },
  getMyAppointments: () => {
    return axiosClient.get('/appointments/my');
  }
};

export default appointmentApi;