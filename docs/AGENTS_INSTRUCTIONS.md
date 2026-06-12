# Hướng dẫn cho AI Agents (Agent Instructions)

Tài liệu này cung cấp các chỉ dẫn cụ thể dành cho các hệ thống và tác tử AI (AI Agents) trong quá trình phân tích, tạo mã hoặc điều chỉnh cấu trúc cho dự án Nexus E-commerce.

## 1. Ngữ cảnh & Nền tảng (Context & Tech Stack)
- **Dự án:** Nexus E-commerce.
- **Mục tiêu:** Xây dựng nền tảng thương mại điện tử chuyên biệt cho hệ sinh thái Apple kết hợp trung tâm dịch vụ sửa chữa IT chuyên nghiệp.
- **Tech Stack (MERN):** React (Vite) + Tailwind CSS + Node.js + Express.js + MongoDB (với Mongoose).
- **CẢNH BÁO QUAN TRỌNG:** TUYỆT ĐỐI KHÔNG SỬ DỤNG các công nghệ cũ hoặc không liên quan như: NestJS, Prisma, Next.js, Blockchain, Web3.

## 2. Nguyên tắc khởi tạo mã (Code Generation Rules)
- **Frontend:**
  - Bắt buộc sử dụng Functional Components thay cho Class Components.
  - Sử dụng Tailwind CSS qua thuộc tính `className` cho toàn bộ styling. Hạn chế tối đa việc tạo file CSS tùy chỉnh riêng lẻ.
  - Tích hợp Framer Motion cho các hiệu ứng (animation) giao diện người dùng.
  - Quản lý trạng thái chia sẻ (Global State) như Giỏ hàng, Thông tin Đăng nhập bằng Redux Toolkit.
- **Backend:**
  - Cấu trúc mã Express.js phải tuân theo mô hình module rành mạch: Tách biệt logic Route, Controllers, Models, và Services.
  - Phải có một cơ chế xử lý lỗi (Error Handler middleware) tập trung để bắt các exceptions.
  - API phải trả về dữ liệu chuẩn JSON cùng với các mã HTTP Status chính xác (200, 201, 400, 401, 403, 404, 500).
  - Mọi tương tác với cơ sở dữ liệu MongoDB đều phải thông qua Mongoose Models.
- **Trí tuệ nhân tạo (AI) & Socket:**
  - Việc gọi Google Gemini API phải được đóng gói gọn gàng vào các module chuyên biệt (ví dụ: `services/geminiService.js`).
  - Thể hiện (instance) của Socket.io phải được chia sẻ an toàn trong toàn bộ ứng dụng và kiểm soát tài nguyên tránh rò rỉ bộ nhớ.

## 3. Quy trình làm việc tự động (Autonomy Rules)
- Sử dụng tiếng Anh cho việc đặt tên biến, tên hàm, class, và nội dung commit git. Ghi chú (comments) có thể dùng tiếng Việt để giải thích các logic phức tạp.
- Khi được yêu cầu tạo một API hoặc tính năng mới, bạn phải đảm bảo thực hiện đủ các bước: Định nghĩa/Cập nhật Mongoose Schema -> Cấu hình Route -> Viết logic xử lý trong Controller.
- Đảm bảo mã nguồn sau khi tạo ra phải nhất quán với phần còn lại của hệ thống và chạy ổn định trên môi trường Node.js hiện tại.