Markdown
# 📖 Playwright Manga Downloader (Cào Truyện Tranh Tự Động)

Một công cụ tự động hóa mạnh mẽ được xây dựng bằng **Playwright** và **Node.js** giúp tự động duyệt qua các chương truyện tranh, giải quyết các cơ chế chặn bot nâng cao, giả lập hành vi cuộn trang của người dùng thật và tải toàn bộ hình ảnh về máy một cách gọn gàng theo từng thư mục.

## 🚀 Tính năng nổi bật

- 📥 **Tải hàng loạt theo khoảng chương:** Cho phép thiết lập `Chương bắt đầu` và `Chương kết thúc` để tự động chạy liên tục qua vòng lặp.
- 📁 **Tự động quản lý thư mục:** Phân tích cấu trúc URL cấu hình để tự động tạo tên thư mục lưu trữ đẹp mắt (`Ví dụ: Hoa_Phung_Lieu_Nguyen_Chuong_1`).
- ⚡ **Cơ chế chống nghẽn & Bypass 403:** Tự động tối ưu hóa Header (`Referer`, `User-Agent`) và giãn cách thời gian tải giữa các bức ảnh để không bị máy chủ chặn.
- 🛡️ **Bypass Anti-bot nâng cao:** - Khởi tạo một `Context` (phiên duyệt web) mới tinh cho mỗi chương truyện nhằm reset hoàn toàn Cookie, Session và dấu vết thiết bị.
  - Sử dụng chiến lược `domcontentloaded` kết hợp tăng giới hạn Timeout lên 60s để khắc phục tình trạng kẹt trang do các đoạn mã quảng cáo ngầm.
- 🔄 **Chế độ cuộn trang "bọc thép":** Kết hợp cuộn bằng mã lệnh Javascript tăng tiến chiều cao phối hợp với giả lập phím cơ học `PageDown` giúp bẻ gãy mọi cơ chế Lazy Load hoặc Fade-in của ảnh truyện.
- 📊 **Theo dõi tiến độ thời gian thực (Real-time Progress):** Hiển thị thanh trạng thái dạng trực quan `⏳ [28/55] Đang tải anh_028.jpg... ✅ Thành công` ngay trên Console/Terminal với hệ màu trực quan.
- 🎯 **Thuật toán kiểm định ảnh thực (`Image Validator`):** Sử dụng hàm kiểm tra thuộc tính thuộc tính `img.complete` và `naturalHeight > 0` từ phía client để đảm bảo ảnh đã tải xong dữ liệu nhị phân 100% trên giao diện rồi mới kích hoạt tiến trình tiếp theo.

---

## 🛠️ Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (Phiên bản 16 trở lên)
- [Playwright](https://playwright.dev/)

---

## 💻 Hướng dẫn cài đặt & Sử dụng

### 1. Khởi tạo dự án và cài đặt thư viện
Mở Terminal/Command Prompt tại thư mục bạn muốn lưu dự án và chạy các lệnh sau:

```bash
# Khởi tạo dự án NodeJS
npm init -y

# Cài đặt Playwright
npm install playwright

# Cài đặt các gói trình duyệt ẩn của Playwright (Chỉ cần chạy lần đầu)
npx playwright install
```
2. Cấu hình kịch bản
Mở file script download_multi.js của bạn và thay đổi các thông số cấu hình ở đầu file cho phù hợp với trang web mục tiêu:

JavaScript
```
// ==================== CẤU HÌNH Ở ĐÂY ====================
const domainTrangWeb = '[https://www.xxxxx.one]'; 
const đườngDẫnMẫu = '/truyen-tranh/xxxx/chuong-'; 

const chuongBatDau = 1;  
const chuongKetThuc = 5;  

const viTriAnhSelector = '.chapter-images-container img'; 
// ========================================================
```
3. Kích hoạt Script
Chạy lệnh sau trong Terminal để bắt đầu quá trình tải tự động:

Bash
```
node download_multi.js
```

📈 Sơ đồ quá trình xử lý của Script
```
[Bắt đầu] ──> Khởi chạy Browser
               │
               ▼
       ┌───────┴──────────────────────────────┐
       │ Vòng lặp: Từ Chương X đến Chương Y   │
       └───────┬──────────────────────────────┘
               │
               ▼
         Tạo New Context & New Page (Sạch Cookies)
               │
               ▼
         Mở URL Truyện (Đợi DOMContentLoaded)
               │
               ▼
         Kiểm tra 3 ảnh đầu hiện hình thật (img.complete)
               │
               ▼
         Cuộn trang thông minh + Giả lập PageDown (Bẻ LazyLoad)
               │
               ▼
         Thu thập toàn bộ link ảnh hợp lệ
               │
               ▼
       ┌───────┴──────────────────────────────┐
       │ Vòng lặp: Tải từng ảnh (Hiện xx/yy)   │
       └───────┬──────────────────────────────┘
               │
               ▼
         Gửi Request với Referer & User-Agent chuẩn ──> [Lưu vào thư mục]
               │
               ▼
         Đóng Tab & Context chương hiện tại
               │
               ▼
   [Kiểm tra chương tiếp theo] ──(Còn)──> [Lặp lại]
               │
            (Hết)
               ▼
         Đóng Browser ──> [Hoàn thành 🎉]
```
