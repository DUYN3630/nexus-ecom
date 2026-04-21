// Chúng ta sẽ dùng fetch trực tiếp để tránh các cấu hình mặc định của axiosClient
// gây xung đột với việc upload file (multipart/form-data)

const uploadApi = {
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = localStorage.getItem('token');
        const baseUrl = 'http://127.0.0.1:5000/api'; // Hoặc lấy từ biến môi trường

        try {
            const response = await fetch(`${baseUrl}/upload`, {
                method: 'POST',
                headers: {
                    // KHÔNG set Content-Type ở đây. 
                    // Để trình duyệt tự động set là multipart/form-data kèm boundary
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed with status ' + response.status);
            }

            // Giả lập cấu trúc trả về giống axios để frontend không cần sửa nhiều
            return {
                data: {
                    success: true,
                    data: data.data // server trả về { success: true, data: { url: ... } }
                }
            };

        } catch (error) {
            console.error("Fetch upload error:", error);
            throw error;
        }
    }
};

export default uploadApi;