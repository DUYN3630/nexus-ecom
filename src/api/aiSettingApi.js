import axiosClient from './axiosClient';

const aiSettingApi = {
  // Tab: Cấu hình hệ thống
  getSettings: () => axiosClient.get('/ai-settings'),
  updateSettings: (data) => axiosClient.post('/ai-settings/update', data),
  
  // Tab: Phân tích thông minh
  getAnalytics: () => axiosClient.get('/ai-settings/analytics'),
  
  // Tab: Giám sát chuyên gia
  getExpertPerformance: () => axiosClient.get('/ai-settings/experts-performance'),

  // Tab: Giám sát hội thoại
  getSupportTickets: () => axiosClient.get('/ai-settings/tickets'),
  convertToRepair: (ticketId, expertId) => axiosClient.post('/ai-settings/convert-repair', { ticketId, expertId }),
};

export default aiSettingApi;
