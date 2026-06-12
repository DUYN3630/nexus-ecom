# 📜 Quy chuẩn API (API Contract)

Tài liệu này định nghĩa cấu trúc giao tiếp chuẩn giữa Frontend và Backend. Tất cả các endpoint mới PHẢI tuân thủ định dạng này để đảm bảo tính nhất quán và dễ dàng xử lý lỗi.

## 1. Cấu trúc Response Chuẩn (Standard Response Format)

Mọi API response (thành công hay thất bại) đều phải bọc trong một đối tượng chuẩn.

### 1.1. Thành công (Success - 2xx)

```json
{
  "success": true,
  "data": { ... }, // Object hoặc Array dữ liệu
  "message": "Lấy dữ liệu thành công", // Tùy chọn
  "meta": { // Tùy chọn (dùng cho Phân trang - Pagination)
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 1.2. Thất bại (Error - 4xx, 5xx)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR", // Mã lỗi quy ước (Tham khảo BACKEND_ERRORS.md)
    "message": "Dữ liệu đầu vào không hợp lệ", // Thông báo cho user/dev
    "details": [ // Tùy chọn (chi tiết lỗi, ví dụ lỗi form validation)
      { "field": "email", "message": "Email không đúng định dạng" }
    ]
  }
}
```

## 2. Quy chuẩn Pagination (Query Parameters)

Các endpoint trả về danh sách (List) phải hỗ trợ phân trang chuẩn:
- `?page=1` (Mặc định: 1)
- `?limit=10` (Mặc định: 10)
- `?sort=-createdAt` (Sắp xếp giảm dần theo thời gian tạo)

## 3. Quy chuẩn Authentication & Authorization

- Tất cả API cần xác thực phải gửi kèm header: `Authorization: Bearer <token>`
- Nếu token hết hạn hoặc không hợp lệ -> Trả về HTTP Status `401 Unauthorized`.
- Nếu user không đủ quyền (ví dụ User truy cập API Admin) -> Trả về HTTP Status `403 Forbidden`.

## 4. Danh sách Endpoints Chính (Core Endpoints Overview)

*(Chi tiết payload xem trong Postman hoặc Swagger, dưới đây là overview để Senior Dev nắm cấu trúc)*

### Auth
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Products (Sản phẩm)
- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang, filter)
- `GET /api/products/:slug` - Lấy chi tiết sản phẩm
- `POST /api/products` (Admin) - Tạo sản phẩm mới

### Orders (Đơn hàng)
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders/my-orders` - Lấy danh sách đơn hàng của user

### Marketing & Banners
- `GET /api/marketing/public` - (Frontend) Lấy banner đang active
- `GET /api/marketing/stats` - (Admin) Thống kê hiệu suất marketing
