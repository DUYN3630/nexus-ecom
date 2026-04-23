const RENDER_URL = 'https://nexus-ecom-es17.onrender.com';
const LOCAL_URL = 'http://localhost:5000';

export const PLACEHOLDER = 'https://placehold.co/600x600?text=No+Image';
export const IMAGE_ERROR_PLACEHOLDER = 'https://placehold.co/600x600?text=Error';

export const getProductImageUrl = (image) => {
  if (!image) return PLACEHOLDER;

  let path = '';
  if (typeof image === 'object') {
    path = image.images?.[0] || image.thumbnail || '';
  } else {
    path = image;
  }

  if (!path || typeof path !== 'string') return PLACEHOLDER;

  // Nếu là link tuyệt đối bên ngoài (Unsplash...)
  if (path.startsWith('http') && !path.includes('localhost') && !path.includes('127.0.0.1')) {
    return path.replace('http://', 'https://');
  }

  // Cắt bỏ phần localhost/127.0.0.1 nếu có
  const cleanPath = path.replace(/http:\/\/localhost:5000/g, '')
                        .replace(/http:\/\/127.0.0.1:5000/g, '');
  
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // Kiểm tra môi trường
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocal ? LOCAL_URL : RENDER_URL;

  return `${base}${finalPath}`;
};

export default getProductImageUrl;
