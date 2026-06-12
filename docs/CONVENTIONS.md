# Tiêu chuẩn và Quy ước Coding (Coding Conventions)

Tài liệu này quy định các tiêu chuẩn lập trình cho toàn bộ dự án Nexus E-commerce (MERN stack).

## 1. Frontend (React / Vite / Tailwind)
- **Cấu trúc Component:** Sử dụng Functional Components và Hooks.
- **Styling:** Sử dụng Tailwind CSS cho styling. Tránh viết CSS thuần hoặc inline styles trừ khi thực sự cần thiết (ví dụ: các giá trị tính toán động).
- **Animation:** Sử dụng Framer Motion cho các hiệu ứng chuyển động và chuyển trang.
- **State Management:** Sử dụng Redux Toolkit cho Global State (Cart, User, Auth) và React hook cơ bản (`useState`, `useReducer`) cho Local State.
- **Đặt tên (Naming):**
  - Thư mục components, pages: PascalCase (vd: `ProductCard`, `HomePage`).
  - Hàm, hooks, biến: camelCase (vd: `useAuth`, `handleAddToCart`).
  - Hằng số: UPPER_SNAKE_CASE (vd: `API_BASE_URL`).

## 2. Backend (Node.js / Express.js)
- **Cấu trúc Thư mục:** Áp dụng mô hình Controller-Route-Model (hoặc Domain-driven cho các module phức tạp).
  - `controllers/`: Xử lý logic nghiệp vụ cho từng endpoint.
  - `routes/`: Định nghĩa các API endpoints và gán middlewares.
  - `models/`: Chứa các định nghĩa Mongoose schemas.
  - `middlewares/`: Xác thực (Auth), xử lý lỗi (Error handling), và upload file v.v.
  - `services/`: Các logic phức tạp, gọi API bên ngoài (ví dụ: tích hợp Gemini API).
- **Quy ước API:** RESTful API chuẩn. Trả về format JSON thống nhất, ví dụ: `{ success: boolean, data: any, message: string }`.
- **Đặt tên (Naming):** File và thư mục sử dụng camelCase hoặc kebab-case.

## 3. Database (MongoDB / Mongoose)
- **Schema Design:** Đặt tên collection ở dạng số nhiều (vd: `users`, `products`, `appointments`).
- **Models:** Đặt tên model ở dạng số ít, PascalCase (vd: `User`, `Product`).
- **Validation:** Áp dụng validation nghiêm ngặt ngay tại Mongoose schema (required, enum, min, max, match).
- **Mối quan hệ:** Sử dụng `ref` và `.populate()` cho các liên kết dữ liệu.

## 4. Realtime (Socket.io)
- Chỉ sử dụng Socket.io cho các tính năng thực sự cần thời gian thực như: Thông báo cho Admin (Alerts), Chatbox AI theo luồng, và Cập nhật trạng thái sửa chữa.
- Tách biệt logic Socket ra khỏi các REST API routes thông thường.