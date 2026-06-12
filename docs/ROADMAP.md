# Lộ trình Phát triển (Roadmap) - Nexus E-commerce

## Phase 1: Thương mại điện tử (E-commerce Core)
- [ ] **Authentication:** Đăng nhập, Đăng ký, Quản lý phiên bằng JWT (JSON Web Token), Phân quyền người dùng (User/Admin).
- [ ] **Product Catalog:** Hiển thị danh mục sản phẩm, chi tiết sản phẩm thuộc hệ sinh thái Apple, bộ lọc và tìm kiếm sản phẩm.
- [ ] **Cart & Checkout:** Quản lý giỏ hàng (sử dụng Redux), Tính toán giá trị đơn hàng, Xử lý thanh toán và Quản lý đơn đặt hàng.

## Phase 2: Dịch vụ IT & Sửa chữa (IT Service Hub)
- [ ] **Service Catalog:** Danh sách các dịch vụ sửa chữa thiết bị, dịch vụ phần mềm và bảng giá.
- [ ] **IT Booking:** Giao diện đặt lịch hẹn sửa chữa, cho phép chọn chi nhánh, thời gian và chuyên gia (IT Expert).
- [ ] **Repair Tracking:** Quản lý trạng thái sửa chữa (Chờ tiếp nhận -> Đang xử lý -> Hoàn thành), cho phép người dùng theo dõi tình trạng qua mã đơn.
- [ ] **Realtime Alerts:** Quản trị viên và người dùng nhận thông báo ngay lập tức qua Socket.io khi có lịch hẹn hoặc cập nhật trạng thái mới.

## Phase 3: Tích hợp Trí tuệ nhân tạo (AI Integration)
- [ ] **Sales AI Chatbot:** Trợ lý ảo tư vấn mua sắm thông minh sử dụng Google Gemini API.
- [ ] **IT Expert AI (RAG-lite):** Trợ lý hỗ trợ chẩn đoán sự cố phần cứng/phần mềm thiết bị Apple trước khi khách hàng mang máy đến sửa chữa. Hệ thống sử dụng phương pháp RAG-lite để lấy thông tin từ cơ sở dữ liệu lỗi chuyên ngành.

## Phase 4: Quản trị viên (Admin Dashboard & Analytics)
- [ ] **Admin Dashboard:** Xây dựng bảng điều khiển tổng quan cho quản trị viên với giao diện trực quan.
- [ ] **Quản lý Dữ liệu:** Các tính năng CRUD cho việc quản lý sản phẩm, đơn hàng, lịch hẹn, dịch vụ, và người dùng.
- [ ] **Báo cáo và Thống kê:** Phân tích doanh số bán hàng, hiệu suất của các chuyên gia sửa chữa và xu hướng mua sắm của khách hàng.