import axiosClient from './axiosClient';

export const getOverviewStats = (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return axiosClient.get('/analytics/overview', { params });
};
