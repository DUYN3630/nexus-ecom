import axiosClient from './axiosClient';

const aiSettingApi = {
  // Tab: Cấu hình hệ thống
  getSettings: () => axiosClient.get('/ai-settings'),
  updateSettings: (data) => axiosClient.post('/ai-settings/update', data),
  
  // Tab: Phân tích thông minh
  getAnalytics: () => axiosClient.get('/ai-settings/analytics'),
  
  // Tab: Giám sát chuyên gia
  getExpertPerformance: () => axiosClient.get('/ai-settings/experts-performance'),
};

export default aiSettingApi;
