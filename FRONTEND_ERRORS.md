# Nhật ký lỗi Frontend - Nexus E-commerce

| STT | Lỗi (Error Message) | Nguyên nhân (Root Cause) | Cách khắc phục (Fix) | Trạng thái |
|:---:|:---|:---|:---|:---:|
| 1 | ReferenceError: Wrench is not defined | Quên import icon `Wrench` từ thư viện `lucide-react`. | Thêm `Wrench` vào danh sách import trong `AdminSidebar.jsx`. | ✅ Thành công |
| 2 | AxiosError 403 Forbidden | User đăng nhập có role `Customer` trong DB nên bị Backend chặn quyền Admin. | Chạy script Backend cập nhật role user thành `admin` và yêu cầu user Re-login. | ✅ Thành công |
| 3 | TypeError: productApi.getProducts is not a function | Gọi sai tên hàm trong `productApi.js` (hàm chuẩn là `getAll`). | Đổi `productApi.getProducts` thành `productApi.getAll` trong `ComparePage.jsx`. | 🔴 Đang sửa |
