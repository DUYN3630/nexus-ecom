import axiosClient from './axiosClient';

const aiSettingApi = {
  // Cấu hình kỹ thuật
  getSettings: () => {
    return axiosClient.get('/ai-settings/settings');
  },
  updateSettings: (data) => {
    return axiosClient.post('/ai-settings/settings', data);
  },

  // Phân tích dữ liệu vận hành (Dành cho AI Hub)
  getAnalytics: () => {
    return axiosClient.get('/ai-settings/analytics');
  },
  getExpertPerformance: () => {
    return axiosClient.get('/ai-settings/experts');
  }
};

export default aiSettingApi;
