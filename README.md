# Nexus E-commerce Project

Dự án website thương mại điện tử bán đồ Apple tích hợp AI Gemini.

## Công nghệ sử dụng
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB.
- **AI:** Google Gemini API.

## Cách cài đặt và chạy dự án

### 1. Tải dự án
```bash
git clone https://github.com/YOUR_USERNAME/nexus-ecom.git
cd nexus-ecom
```

### 2. Cài đặt Backend
1. Di chuyển vào thư mục server: `cd server`
2. Cài đặt thư viện: `npm install`
3. Tạo file `.env` và cấu hình các biến sau:
   ```env
   MONGODB_URI=link_mongodb_cua_ban
   GEMINI_API_KEY=key_gemini_cua_ban
   PORT=5000
   ```
4. Chạy server: `node index.js`

### 3. Cài đặt Frontend
1. Quay lại thư mục gốc: `cd ..`
2. Cài đặt thư viện: `npm install`
3. Chạy frontend: `npm run dev`

### 4. Dữ liệu mẫu (Seeding)
Để có dữ liệu sản phẩm, hãy chạy lệnh sau trong thư mục `server`:
```bash
node seedCategories.js
node seedProducts.js
```

## Lưu ý
Dự án yêu cầu API Key của Google Gemini để tính năng Chat AI hoạt động.
