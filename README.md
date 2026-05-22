# Nexus E-commerce 🚀 

**Nexus E-commerce** là một nền tảng thương mại điện tử hiện đại chuyên biệt cho hệ sinh thái Apple, kết hợp cùng hệ thống hỗ trợ IT (IT Service Hub). Dự án nổi bật với giao diện người dùng cao cấp và việc tích hợp sâu **Google Gemini AI** để tối ưu hóa trải nghiệm khách hàng và quản lý hệ thống.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)
![React](https://img.shields.io/badge/Frontend-React_Vite-cyan)
![Nodejs](https://img.shields.io/badge/Backend-Node.js_Express-green)
![AI](https://img.shields.io/badge/AI-Google_Gemini-orange)

## ✨ Tính năng nổi bật

### 🛍️ Phân hệ Khách hàng (User)
- **Trải nghiệm mua sắm:** Giao diện mượt mà với Framer Motion, phân loại theo dòng sản phẩm (iPhone, Mac, iPad, Watch).
- **Trình chiếu 3D/Tương tác:** Trang Product Experience độc quyền.
- **Dịch vụ hậu mãi:** Hệ thống yêu cầu bảo hành, sửa chữa phần cứng (Repair Management).
- **Hỗ trợ thông minh:** Đặt lịch hẹn với Chuyên gia IT (Expert Consultation) và Chat AI hỗ trợ giải đáp tự động.

### 🛡️ Phân hệ Quản trị (Admin Dashboard)
- **Phân tích dữ liệu:** Biểu đồ doanh thu trực quan bằng Chart.js.
- **Quản lý AI (AI Hub):** Cho phép thay đổi Model AI (`gemini-2.0-flash`, `gemini-flash-latest`) và cập nhật System Prompt trực tiếp không cần sửa code.
- **Hệ thống điều hành:** Quản lý kho hàng (Inventory), linh kiện (Parts), và các chiến dịch Marketing.

---

## 💻 Công nghệ sử dụng

- **Frontend:** React (Vite), Redux Toolkit, Tailwind CSS, Framer Motion, Chart.js, Phosphor/Lucide Icons.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose ODM).
- **Bảo mật:** JWT (JSON Web Tokens), Google OAuth, Firebase Admin, mongo-sanitize (chống NoSQL Injection).
- **AI & Tools:** Google Generative AI (Gemini API), Multer (xử lý File), Nodemailer (Gửi Email), Vitest.
- **Cloud/Deploy:** Vercel (Frontend), Render (Backend).

---

## 🛠️ Hướng dẫn cài đặt & Chạy dự án (Local)

### 1. Tải dự án
```bash
git clone https://github.com/YOUR_USERNAME/nexus-ecom.git
cd nexus-ecom
```

### 2. Cài đặt Backend
1. Di chuyển vào thư mục server:
   ```bash
   cd server
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` trong thư mục `server/` và cấu hình các biến sau:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   
   # Cấu hình Nodemailer (Email)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
4. Khởi chạy Server:
   ```bash
   node index.js
   ```

### 3. Cài đặt Frontend
1. Mở một terminal mới, chuyển về thư mục gốc và cài đặt thư viện:
   ```bash
   npm install
   ```
2. Khởi chạy Frontend:
   ```bash
   npm run dev
   ```

### 4. Khởi tạo Dữ liệu mẫu (Database Seeding)
Để hệ thống có sẵn dữ liệu (Sản phẩm, Danh mục, Admin, Chuyên gia), hãy mở terminal tại thư mục `server` và chạy lần lượt các lệnh:

```bash
node scripts/seedCategories.js
node scripts/seedProducts.js
node scripts/seedExperts.js
```
*(Lưu ý: Bạn có thể xem thêm các kịch bản seed khác trong thư mục `server/scripts/`)*

---

## 🤖 Lưu ý về Hệ thống AI

Dự án này yêu cầu API Key của Google Gemini. Để đảm bảo AI hoạt động ổn định nhất, hãy tham khảo file [AI_CONFIG_GUIDE.md](./AI_CONFIG_GUIDE.md) trong thư mục gốc.

---
*Developed by Nexus E-com Team - 2026*
