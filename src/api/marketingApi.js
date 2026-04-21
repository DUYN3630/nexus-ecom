import axiosClient from './axiosClient';

const marketingApi = {
  // --- ADMIN API ---
  getDashboardStats: () => {
    return axiosClient.get('/marketing/stats');
  },

  getBanners: (params) => {
    return axiosClient.get('/marketing/banners', { params });
  },

  addBanner: (bannerData) => {
    const formData = new FormData();
    
    // File upload
    if (bannerData.mediaFile) {
        formData.append('mediaFile', bannerData.mediaFile);
    }

    // Append fields
    Object.keys(bannerData).forEach(key => {
        if (key === 'mediaFile') return; // Skip file

        const value = bannerData[key];
        
        if (value === undefined || value === null) return;

        // Nếu là Object (trừ null), stringify nó để gửi dạng JSON
        // Backend sẽ parse lại
        if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, value);
        }
    });

    return axiosClient.post('/marketing/banners', formData, {
      headers: { 'Content-Type': null }
    });
  },

  updateBanner: (bannerData) => {
    const id = bannerData._id || bannerData.id;
    const formData = new FormData();

    if (bannerData.mediaFile) {
        formData.append('mediaFile', bannerData.mediaFile);
    }

    Object.keys(bannerData).forEach(key => {
        if (key === 'mediaFile' || key === '_id' || key === 'id') return;
        const value = bannerData[key];
        
        if (value === undefined || value === null) return;

        if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, value);
        }
    });

    return axiosClient.put(`/marketing/banners/${id}`, formData, {
      headers: { 'Content-Type': null }
    });
  },

  deleteBanners: (bannerIds) => {
    return axiosClient.delete('/marketing/banners', { data: { ids: bannerIds } });
  },

  updateBannersStatus: (bannerIds, status) => {
    return axiosClient.post('/marketing/banners/bulk-status', { ids: bannerIds, status });
  },

  // --- PUBLIC API ---
  getPublicBanners: (position) => {
      return axiosClient.get('/marketing/public', { params: { position } });
  },

  trackClick: (id) => {
      return axiosClient.post(`/marketing/track/${id}/click`);
  }
};

export default marketingApi;