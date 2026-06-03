import axiosClient from './axiosClient';

export const getOverviewStats = (params) => {
    return axiosClient.get('/analytics/overview', { params });
};

export const getRepairAnalytics = () => {
    return axiosClient.get('/analytics/repairs');
};
