# 🧪 Chiến lược Kiểm thử (Testing Strategy)

Nexus Ecom áp dụng phương pháp kiểm thử kết hợp để đảm bảo tính ổn định của hệ thống E-commerce và Admin Dashboard.

## 1. Công cụ & Framework (Tech Stack)

- **Backend:** `Vitest` (Unit/Integration Test), `Supertest` (API Endpoint Test).
- **Frontend:** `Vitest` (Unit Test), `React Testing Library` (Component Test).
- **E2E (Tương lai):** `Playwright` hoặc `Cypress`.

## 2. Quy ước viết Test (Testing Conventions)

### 2.1. Cấu trúc thư mục Test
- Mọi file test phải kết thúc bằng `.test.js` hoặc `.spec.js` (hoặc `.jsx`).
- File test được đặt ngay cạnh file source code để dễ quản lý.
  - Ví dụ: `src/components/common/LoadingSpinner.jsx` -> `src/components/common/LoadingSpinner.test.jsx`.

### 2.2. Trọng tâm Kiểm thử (What to Test)

Chúng ta không viết test cho 100% code (vì tốn thời gian), mà tập trung vào các luồng cốt lõi:

**Backend (Bắt buộc):**
1. Các hàm tính toán giá tiền (Giảm giá, Thuế, Phí ship).
2. Luồng xác thực JWT (Login, Middleware kiểm tra quyền).
3. Các Endpoint quan trọng: Tạo đơn hàng, Đặt lịch hẹn IT.

**Frontend (Ưu tiên):**
1. Các Redux Reducer/Slice (Cart Slice, Auth Slice).
2. Các UI Component dùng chung (Button, Modal, Toast).
3. Luồng (Flow) thêm vào giỏ hàng và thanh toán.

## 3. Cách chạy Test (Running Tests)

**Chạy toàn bộ Test Frontend:**
```bash
cd src
npm run test
```

**Chạy toàn bộ Test Backend:**
```bash
cd server
npm run test
```

## 4. Nguyên tắc cho Senior Dev (Pull Request Rule)
Bất kỳ Pull Request (PR) nào liên quan đến **Logic Thanh toán (Payment/Cart)** hoặc **Bảo mật (Auth)** bắt buộc phải có kèm file `.test.js` để chứng minh logic hoạt động đúng trước khi merge vào nhánh `main`.
