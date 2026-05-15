# Nexus AI Configuration Guide (2026)

Tài liệu này hướng dẫn cách cấu hình và khôi phục hệ thống AI Gemini cho dự án Nexus E-commerce để đảm bảo hoạt động ổn định.

## 1. Model AI Khả dụng (Dựa trên API Key hiện tại)

Dựa trên kiểm tra thực tế, hệ thống hoạt động tốt nhất với các model sau:

*   **`gemini-flash-latest` (Khuyên dùng):** Tự động trỏ đến phiên bản ổn định nhất. Đây là cấu hình mặc định giúp hệ thống không bị lỗi 404.
*   **`gemini-2.0-flash`:** Phiên bản tốc độ cao.
*   **`gemini-2.5-flash`:** Phiên bản nâng cấp (Nếu API Key hỗ trợ).
*   **`gemini-3.1-flash-lite`:** Phiên bản thử nghiệm mới nhất.

**Lưu ý:** Tuyệt đối không sử dụng `gemini-1.5-flash` nếu không có hậu tố `-latest` vì Google có thể đã gỡ bỏ định danh cũ này trong tương lai.

## 2. Cấu hình Môi trường (.env)

File `.env` đặt tại thư mục `server/` phải chứa:

```env
GEMINI_API_KEY=your_google_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
```

## 3. Đồng bộ Database (Force Fix)

Nếu hệ thống báo "Bận" hoặc "Lỗi model", hãy chạy lệnh sau để đưa cấu hình trong Database về trạng thái ổn định nhất:

```bash
# Di chuyển vào thư mục gốc của dự án
node server/scripts/force_fix_ai.cjs
```

Lệnh này sẽ:
1. Kết nối database thông qua URI trong `server/.env`.
2. Ép cấu hình `ai_model_name` về `gemini-flash-latest`.
3. Khởi tạo các giá trị mặc định cho Temperature (0.7) và Max Tokens (1000).

## 4. Kiểm tra Model thực tế

Để biết API Key của bạn hiện tại đang hỗ trợ những model cụ thể nào, hãy chạy:

```bash
node server/scripts/list_models_rest.cjs
```

## 5. Quy tắc cho Developer mới

1. **Không Hardcode:** Luôn lấy model name từ `Setting` model trong database hoặc biến môi trường.
2. **Fallback:** Nếu database không có cấu hình, code phải luôn fallback về `gemini-flash-latest` (đã được cấu hình trong `server/utils/gemini.js`).
3. **Quản trị:** Sử dụng trang **Admin AI Hub** để thay đổi tham số, không nên sửa trực tiếp trong code trừ khi cần thay đổi logic xử lý.

---
*Cập nhật lần cuối: 15/05/2026 bởi Gemini CLI*
