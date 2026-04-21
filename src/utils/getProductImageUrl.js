const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const PLACEHOLDER = 'https://placehold.co/600x600?text=Nexus+Product';
const ERROR_PLACEHOLDER = 'https://placehold.co/600x600?text=Image+Error';

/**
 * Xử lý URL ảnh sản phẩm từ backend.
 * Hỗ trợ cả ảnh link ngoài (http) và ảnh nội bộ (relative path).
 */
export const getProductImageUrl = (product, index = 0) => {
  if (!product) return PLACEHOLDER;

  let image = null;
  
  // 1. Lấy từ mảng images (ưu tiên)
  if (product.images && product.images.length > 0) {
    image = product.images[index] || product.images[0];
  } 
  // 2. Fallback sang thuộc tính image đơn lẻ
  else if (product.image) {
    image = product.image;
  }
  // 3. Fallback sang thumbnail (thường dùng cho Category)
  else if (product.thumbnail) {
    image = product.thumbnail;
  }

  // Nếu image là object (từ API cũ hoặc cấu trúc phức tạp)
  if (image && typeof image === 'object') {
    image = image.url || image.path;
  }

  if (!image) return PLACEHOLDER;

  // Nếu là URL tuyệt đối (Unsplash, Cloudinary...)
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
    return image;
  }

  // Nếu là đường dẫn tương đối từ backend
  const cleanPath = typeof image === 'string' ? (image.startsWith('/') ? image : `/${image}`) : '';
  if (!cleanPath) return PLACEHOLDER;

  return `${API_URL}${cleanPath}`;
};

export const IMAGE_ERROR_PLACEHOLDER = ERROR_PLACEHOLDER;

export default getProductImageUrl;
