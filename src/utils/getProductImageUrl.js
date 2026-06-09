const RENDER_URL = 'https://nexus-ecom-es17.onrender.com';

// Sử dụng ảnh mặc định có sẵn trong dự án hoặc một ảnh đơn giản
export const PLACEHOLDER = '/products/product-archive-1.jpg'; // Hoặc một ảnh "no-image.png" nếu bạn có
export const IMAGE_ERROR_PLACEHOLDER = '/products/product-archive-1.jpg';

export const getProductImageUrl = (image) => {
  if (!image) return PLACEHOLDER;

  let path = '';
  if (typeof image === 'object') {
    path = image.images?.[0] || image.thumbnail || '';
  } else {
    path = image;
  }

  if (!path || typeof path !== 'string') return PLACEHOLDER;

  // Nếu là blob URL (dùng để preview ảnh vừa chọn local)
  if (path.startsWith('blob:')) return path;

  // Nếu là link tuyệt đối bên ngoài (Unsplash...)
  if (path.startsWith('http') && !path.includes('localhost') && !path.includes('127.0.0.1') && !path.includes('192.168.') && !path.includes('172.')) {
    return path.replace('http://', 'https://');
  }

  // Cắt bỏ phần domain nếu có để lấy đường dẫn tương đối
  const cleanPath = path.replace(/http:\/\/localhost:5000/g, '')
                        .replace(/http:\/\/127.0.0.1:5000/g, '')
                        .replace(/https:\/\/nexus-ecom-es17.onrender.com/g, '');

  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // Kiểm tra môi trường local (bao gồm cả IP nội bộ)
  const isLocal = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('172.') || 
    window.location.hostname.endsWith('.local');

  if (isLocal) {
    // TỰ ĐỘNG SỬA ĐƯỜNG DẪN: Nếu là ảnh upload nhưng thiếu /uploads/
    if (!finalPath.startsWith('/uploads/') && !finalPath.startsWith('/products/') && 
        (finalPath.includes('newImages-') || finalPath.includes('images-') || finalPath.includes('banner-'))) {
      return `/uploads${finalPath}`;
    }
    return finalPath;
  }

  return `${RENDER_URL}${finalPath}`;
};
export default getProductImageUrl;
