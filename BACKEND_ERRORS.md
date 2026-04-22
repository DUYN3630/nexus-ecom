# Nhật ký lỗi Backend - Nexus E-commerce

| STT | Lỗi (Error Message) | Nguyên nhân (Root Cause) | Cách khắc phục (Fix) | Trạng thái |
|:---:|:---|:---|:---|:---:|
| 1 | 403 Forbidden khi gọi API Analytics/Users | Tài khoản `admin123@gmail.com` bị set nhầm role là `Customer` trong Database thay vì `admin`. | Chạy script cập nhật lại Role trong Database. | ✅ Thành công |
| 2 | 500 Internal Server Error (Repair) | Gửi `userId` trống hoặc sai định dạng ObjectId. | Thêm hàm `mongoose.Types.ObjectId.isValid` để làm sạch dữ liệu. | 🔴 Đang tái phát |
| 4 | 500 Internal Server Error (Submit Repair) | Chưa rõ nguyên nhân (Nghi ngờ lỗi Schema hoặc Logic Ticket Number). | Đang điều tra. | 🔴 Đang sửa |
| 3 | 404 Not Found (Support Repairs) | Route mới chưa được nhận diện do Server chưa khởi động lại hoặc khai báo sai file. | Ghi đè trực tiếp `supportRoutes.js` và thêm log debug tại `index.js`. | ✅ Thành công |
