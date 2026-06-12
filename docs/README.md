# Nexus E-commerce

## Tổng quan dự án (Overview)
Nexus E-commerce là một nền tảng thương mại điện tử cao cấp chuyên cung cấp các sản phẩm trong hệ sinh thái Apple, kết hợp với Trung tâm Dịch vụ Công nghệ thông tin (IT Service Hub). Dự án cung cấp trải nghiệm mua sắm mượt mà, đồng thời cho phép người dùng đặt lịch sửa chữa, tư vấn chuyên gia và nhận hỗ trợ kỹ thuật thông qua công nghệ AI.

## Tầm nhìn (Vision)
Tạo ra một hệ sinh thái toàn diện kết hợp:
1. **Cửa hàng Apple Cao cấp (Apple Store):** Bán lẻ các thiết bị, phụ kiện Apple chính hãng với giao diện trực quan, sang trọng.
2. **Trung tâm Dịch vụ IT (Repair Hub):** Cung cấp dịch vụ sửa chữa thiết bị, đặt lịch hẹn với chuyên gia và theo dõi tiến độ bảo hành, sửa chữa.
3. **Trợ lý AI (AI Integration):** Tích hợp Google Gemini AI làm trợ lý tư vấn bán hàng (Sales AI) và chuyên gia IT chẩn đoán lỗi (IT Expert AI) với phương pháp RAG-lite để phản hồi dựa trên tài liệu nội bộ.

## Tech Stack (Công nghệ sử dụng)
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Redux.
- **Backend:** Node.js, Express.js, Socket.io (cho thông báo thời gian thực / realtime alerts).
- **Database:** MongoDB kết hợp với Mongoose ORM.
- **AI Integration:** Google Gemini API.

## Các giai đoạn phát triển (Phase Breakdown)
- **Phase 1: E-commerce (Thương mại điện tử)** 
  Xây dựng hệ thống quản lý sản phẩm, giỏ hàng, thanh toán và quản lý đơn hàng. Tích hợp giao diện người dùng cao cấp cho việc khám phá sản phẩm.
- **Phase 2: IT Service Hub (Trung tâm Dịch vụ IT)**
  Phát triển tính năng đặt lịch sửa chữa, quản lý lịch hẹn chuyên gia, theo dõi tiến trình sửa chữa và hệ thống thông báo realtime.
- **Phase 3: AI Integration (Tích hợp AI)**
  Tích hợp Google Gemini API để tạo Sales AI Chatbox tư vấn sản phẩm và IT Expert AI hỗ trợ chẩn đoán sự cố thiết bị qua RAG-lite.
- **Phase 4: Analytics (Phân tích dữ liệu)**
  Xây dựng Admin Dashboard hoàn chỉnh để thống kê doanh số, theo dõi hiệu suất dịch vụ sửa chữa và phân tích hành vi người dùng.