# Nhật ký lỗi Backend - Nexus E-commerce

| STT | Lỗi (Error Message) | Nguyên nhân (Root Cause) | Cách khắc phục (Fix) | Trạng thái |
|:---:|:---|:---|:---|:---:|
| 1 | 403 Forbidden khi gọi API Analytics/Users | Tài khoản `admin123@gmail.com` bị set nhầm role là `Customer` trong Database thay vì `admin`. | Chạy script cập nhật lại Role trong Database. | ✅ Thành công |
| 2 | 500 Internal Server Error (Repair) | Gửi `userId` trống hoặc sai định dạng ObjectId (bao gồm chuỗi "null", "undefined"). | Thêm hàm helper `isValidId` để lọc kỹ các trường ID trước khi gán vào Model. | ✅ Thành công |
| 4 | 500 Internal Server Error (Submit Repair) | Thiếu validation trường bắt buộc và lỗi Duplicate Key tiềm ẩn. | Bổ sung validation `deviceType`, `description` và handle lỗi `11000` (Duplicate Key). | ✅ Thành công |
| 3 | 404 Not Found (Support Repairs) | Route mới chưa được nhận diện do Server chưa khởi động lại hoặc khai báo sai file. | Ghi đè trực tiếp `supportRoutes.js` và thêm log debug tại `index.js`. | ✅ Thành công |
| 5 | 404 Not Found (AI Hub Tickets) | Endpoint `/api/ai-settings/tickets` trả về 404 khi frontend gọi. | Kiểm tra route registration, controller implementation và thêm debug log. Có thể do server chưa kịp reload. | ✅ Đã kiểm tra |
| 6 | net::ERR_CACHE_READ_FAILURE (Images) | Trình duyệt không thể đọc cache của ảnh từ server sau khi restart. | Thêm middleware `Cache-Control: no-store` cho các thư mục static trong `index.js`. | ✅ Thành công |
| 7 | [404 Not Found] models/gemini-1.5-flash is not found | Model `gemini-1.5-flash` bị lỗi thời hoặc không khả dụng cho API Key hiện tại (vào năm 2026). Logic cũ còn ép cứng model 1.5. | Cập nhật `server/utils/gemini.js` để dùng `gemini-flash-latest`, hỗ trợ tự động nhận diện version 2.0+ và update config trong DB. | ✅ Thành công |
