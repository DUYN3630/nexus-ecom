# Nhật ký lỗi Frontend - Nexus E-commerce

| STT | Lỗi (Error Message) | Nguyên nhân (Root Cause) | Cách khắc phục (Fix) | Trạng thái |
|:---:|:---|:---|:---|:---:|
| 1 | ReferenceError: Wrench is not defined | Quên import icon `Wrench` từ thư viện `lucide-react`. | Thêm `Wrench` vào danh sách import trong `AdminSidebar.jsx`. | ✅ Thành công |
| 2 | AxiosError 403 Forbidden | User đăng nhập có role `Customer` trong DB nên bị Backend chặn quyền Admin. | Chạy script Backend cập nhật role user thành `admin` và yêu cầu user Re-login. | ✅ Thành công |
| 3 | TypeError: productApi.getProducts is not a function | Gọi sai tên hàm trong `productApi.js` (hàm chuẩn là `getAll`). | Đổi `productApi.getProducts` thành `productApi.getAll` trong `ComparePage.jsx`. | ✅ Thành công |
| 4 | Lỗi cấu trúc JSX khi Refactor Admin Pages | Sử dụng `replace` với placeholder `...` hoặc thiếu thẻ đóng `</div>` gây lỗi render. | Thực hiện `write_file` toàn bộ nội dung file để đảm bảo cấu trúc JSX chính xác 100%. | ✅ Thành công |
| 5 | Không đồng bộ UI giữa các trang Admin | Mỗi trang dùng một bộ Icon (Phosphor vs Lucide) và bo góc khác nhau. | Đồng bộ toàn bộ về Lucide Icons, `brand-600` palette và `rounded-2xl` chuẩn Nexus Pro. | ✅ Thành công |
| 6 | SyntaxError: 'CursorPointer' not provided by 'lucide-react' | Sử dụng tên icon không tồn tại trong thư viện `lucide-react` mới. | Thay thế `CursorPointer` bằng `MousePointer2` trong `MarketingPage.jsx`. | ✅ Thành công |
