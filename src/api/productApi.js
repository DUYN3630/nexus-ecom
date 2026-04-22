import axiosClient from './axiosClient';

const productApi = {
    getAll: (params) => {
        const url = '/products';
        return axiosClient.get(url, { 
            params: {
                ...params,
                status: params?.status || 'all' // Admin mặc định lấy tất cả status
            }
        });
    },
    getBySlug: (slug) => {
        const url = `/products/slug/${slug}`;
        return axiosClient.get(url);
    },
    getRelated: (id) => {
        const url = `/products/${id}/related`;
        return axiosClient.get(url);
    },
    getFeatured: (sessionId) => {
        const url = '/products/featured';
        return axiosClient.get(url, {
            params: { sessionId }
        });
    },
    create: (productData, imageFiles) => {
        const url = '/products';
        const formData = new FormData();
        
        // Append text fields
        Object.keys(productData).forEach(key => {
            if (key === 'specifications') {
                formData.append(key, JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });

        // Append image files
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach(file => {
                formData.append('images', file);
            });
        }

        return axiosClient.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    update: (id, productData, imageFiles) => {
        const url = `/products/${id}`;
        const formData = new FormData();

        // Append text fields
        Object.keys(productData).forEach(key => {
            if (key === 'specifications') {
                formData.append(key, JSON.stringify(productData[key]));
            } else if (key === 'images' && Array.isArray(productData[key])) {
                // Gửi danh sách ảnh cũ còn giữ lại
                productData[key].forEach(img => formData.append('images', img));
            } else {
                formData.append(key, productData[key]);
            }
        });

        // Append new image files
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach(file => {
                formData.append('newImages', file);
            });
        }

        return axiosClient.put(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    delete: (id) => {
        const url = `/products/${id}`;
        return axiosClient.delete(url);
    }
};

export default productApi;