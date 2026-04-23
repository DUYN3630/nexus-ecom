// Link Backend Render thật của bạn
const RENDER_BACKEND_URL = 'https://nexus-ecom-es17.onrender.com';

const getProductImageUrl = (image) => {
  // 1. Nếu không có dữ liệu ảnh
  if (!image) return 'https://placehold.co/600x600?text=No+Image';

  let path = '';

  // 2. Xử lý nếu đầu vào là Object (Sản phẩm) hoặc String (Đường dẫn)
  if (typeof image === 'object') {
    path = image.images?.[0] || image.thumbnail || '';
  } else {
    path = image;
  }

  if (!path) return 'https://placehold.co/600x600?text=No+Image';

  // 3. XỬ LÝ QUAN TRỌNG: Nếu đường dẫn chứa localhost hoặc 127.0.0.1
  // Chúng ta sẽ cắt bỏ phần đó để lấy đường dẫn gốc (/uploads/...)
  if (typeof path === 'string' && (path.includes('localhost') || path.includes('127.0.0.1'))) {
    path = path.replace(/http:\/\/localhost:5000/g, '')
               .replace(/http:\/\/127.0.0.1:5000/g, '');
  }

  // 4. Nếu là link tuyệt đối bên ngoài (Unsplash...) -> Trả về luôn và ép HTTPS
  if (path.startsWith('http')) {
    return path.replace('http://', 'https://');
  }

  // 5. Đảm bảo path bắt đầu bằng dấu /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 6. KIỂM TRA MÔI TRƯỜNG ĐỂ GHÉP LINK
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocal) {
    // Nếu ở máy bạn, dùng localhost
    return `http://localhost:5000${cleanPath}`;
  } else {
    // Nếu ở Vercel, ép dùng link Render (HTTPS)
    return `${RENDER_BACKEND_URL}${cleanPath}`;
  }
};

export default getProductImageUrl;
