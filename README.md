# Utility Tools Hub

Utility Tools Hub là một ứng dụng full-stack hiện đại cung cấp bộ công cụ xử lý đa phương tiện tiện ích (tải video/âm thanh, xử lý audio, v.v.). Ứng dụng sở hữu giao diện tuyệt đẹp mang phong cách Glassmorphism và được thiết kế theo cấu trúc **Monorepo** bao gồm cả Frontend và Backend.

Dự án này được thiết kế để dễ dàng cài đặt, sử dụng và có khả năng mở rộng cao cho các nhà phát triển.

---

## 🚀 Các tính năng chính

- **Video Downloader**: Tải xuống video và trích xuất âm thanh từ nhiều nguồn (YouTube, v.v.) với nhiều chất lượng khác nhau.
- **Audio Tool**: Xử lý và thao tác với các tệp âm thanh một cách trực quan, mượt mà.
- **Giao diện Modern Dashboard UI**: Thiết kế mang phong cách Glassmorphism với các hiệu ứng chuyển động mượt mà, hỗ trợ tương tác người dùng cực tốt, tông màu hiện đại (Royal Purple & Cyber Cyan).

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend (Giao diện người dùng)
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Ngôn ngữ**: TypeScript
- **Styling**: Vanilla CSS (tích hợp Glassmorphism, HSL color palettes).
- **Icons**: Lucide React
- **Cổng mặc định**: `5173`

### Backend (Máy chủ xử lý)
- **Framework**: [NestJS 11](https://nestjs.com/)
- **Ngôn ngữ**: TypeScript
- **Xử lý Media**: `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg` (Tự động tải bộ cài ffmpeg)
- **Công cụ tải (Download engine)**: `youtube-dl-exec`
- **Quản lý Upload**: `multer`
- **Cổng mặc định**: `3009`

---

## ⚙️ Yêu cầu hệ thống (Prerequisites)

Để cài đặt và chạy ứng dụng bình thường, máy tính của bạn cần cài đặt các phần mềm sau:

1. **Node.js**: Phiên bản `v18.x` trở lên. (Tải tại [nodejs.org](https://nodejs.org/)). Trình quản lý gói `npm` sẽ tự động được cài kèm theo Node.js.
2. **Git**: Dùng để pull code về máy (Tải tại [git-scm.com](https://git-scm.com/)).
3. **FFmpeg & Python** *(Khuyến nghị cài đặt trên hệ điều hành)*: Mặc dù ứng dụng có sử dụng package giả lập tự cài FFmpeg, nhưng để công cụ tải video (`youtube-dl-exec`) hoạt động ổn định nhất trên mọi định dạng, máy nên được cài đặt sẵn [FFmpeg](https://ffmpeg.org/download.html) và [Python](https://www.python.org/downloads/) (nhớ thêm vào biến môi trường `PATH`).

---

## 📦 Hướng dẫn kéo code và cài đặt

**Bước 1:** Mở Terminal (Command Prompt hoặc PowerShell) và clone repository về máy tính:
```bash
git clone <đường-dẫn-repo-của-bạn>
cd Utility-tools
```

**Bước 2:** Cài đặt các gói phụ thuộc (Dependencies) cho toàn bộ dự án. Vì đây là Monorepo, bạn chỉ cần đứng ở thư mục gốc và chạy 1 lệnh duy nhất:
```bash
npm run install-all
```
*(Lệnh này sẽ tự động cài đặt `node_modules` cho cả thư mục `frontend` và `backend`).*

---

## 🏃 Hướng dẫn chạy ứng dụng (Môi trường phát triển - Dev Mode)

Để khởi động ứng dụng trong quá trình phát triển (có tính năng Hot-Reload để tự cập nhật khi sửa code):

**Cách 1: Dùng lệnh từ thư mục gốc (Khuyên dùng)**
Tại thư mục `Utility-tools`, chạy lệnh:
```bash
npm run dev
```
Lệnh này sử dụng gói `concurrently` để khởi động cùng lúc cả Frontend và Backend.

**Cách 2: Khởi động riêng lẻ (nếu muốn xem log chi tiết của từng phần)**
- Mở Terminal 1 (Backend): `cd backend` -> `npm run start:dev`
- Mở Terminal 2 (Frontend): `cd frontend` -> `npm run dev`

**Truy cập ứng dụng:**
- **Frontend**: Mở trình duyệt và truy cập: `http://localhost:5173`
- **Backend API**: Đang chạy ngầm tại: `http://localhost:3009`

---

## 🚀 Hướng dẫn Deploy ứng dụng trên máy PC vật lý (Production)

Để triển khai (deploy) ứng dụng trên một máy tính vật lý và cho phép các thiết bị khác trong mạng nội bộ (LAN) truy cập vào, hãy thực hiện theo các bước sau:

### 1. Build mã nguồn (Biên dịch dự án)
Tại thư mục gốc `Utility-tools`, chạy lệnh build cho cả 2 dự án:
```bash
npm run build-all
```
Lệnh này sẽ tạo ra thư mục `backend/dist` (mã nguồn backend đã biên dịch) và `frontend/dist` (mã nguồn frontend tĩnh).

### 2. Cấu hình IP tĩnh cho máy tính vật lý
- Đảm bảo máy tính đóng vai trò làm Server này được gán một địa chỉ IPv4 tĩnh trong mạng LAN (ví dụ: `192.168.1.100`).

### 3. Khởi chạy Backend liên tục (Background)
Khuyến nghị sử dụng **PM2** - một trình quản lý tiến trình cho Node.js, giúp backend luôn chạy và tự khởi động lại nếu có lỗi.
- Cài đặt PM2 toàn cầu: 
  ```bash
  npm install -g pm2
  ```
- Di chuyển vào thư mục `backend` và khởi chạy ứng dụng:
  ```bash
  cd backend
  pm2 start dist/main.js --name "utility-backend"
  ```
- Ứng dụng Backend hiện đã chạy trên port `3009`. 

### 4. Triển khai (Serve) Frontend
Frontend khi build xong chỉ là các file tĩnh (HTML, CSS, JS). Bạn có thể dùng Nginx, IIS (nếu dùng Windows) hoặc dùng package `serve` của Node.js.
- Cài đặt `serve` toàn cầu:
  ```bash
  npm install -g serve
  ```
- Đứng ở thư mục gốc, dùng PM2 để chạy `serve` phục vụ thư mục `frontend/dist` trên port `5173` (hoặc 80/8080 tùy ý):
  ```bash
  pm2 start serve --name "utility-frontend" -- -s frontend/dist -l 5173
  ```

*Lưu ý cho Frontend*: Khi build ra production để dùng trên nhiều máy, hãy chắc chắn trong code của frontend các lời gọi API đang được trỏ tới địa chỉ IP của máy vật lý (Ví dụ: `http://192.168.1.100:3009`) thay vì `localhost`.

### 5. Cấu hình Windows Firewall (Mở Port)
Để các máy tính khác trong mạng có thể truy cập được:
1. Mở **Windows Defender Firewall** -> **Advanced settings**.
2. Chọn **Inbound Rules** -> **New Rule...** -> Chọn **Port**.
3. Điền các port: `5173, 3009` (TCP) và chọn **Allow the connection**.
4. Các máy khác giờ có thể truy cập bằng đường dẫn: `http://<IP-Máy-Vật-Lý>:5173`.

---

## 👨‍💻 Dành cho Developer (Nhà phát triển)

### Cấu trúc dự án

```text
utility-tools/
├── frontend/          # React + Vite (Giao diện người dùng)
│   ├── src/
│   │   ├── components/ # Các UI Component tái sử dụng
│   │   ├── assets/     # Hình ảnh, icon, file tĩnh
│   │   ├── App.tsx     # Component chính
│   │   └── index.css   # Chứa mã CSS (Glassmorphism, biến màu sắc, animations)
│   └── package.json
├── backend/           # NestJS (Máy chủ xử lý API)
│   ├── src/
│   │   ├── audio/      # Module xử lý âm thanh
│   │   ├── download/   # Module phụ trách việc download (youtube-dl)
│   │   ├── app.module.ts
│   │   └── main.ts     # File khởi chạy server (port 3009, cấu hình CORS)
│   └── package.json
├── package.json       # Chứa scripts chạy cho cả 2 repo
└── README.md          # Tài liệu hướng dẫn
```

### Các quy tắc và lưu ý khi code
1. **Frontend Styling**: Dự án sử dụng Vanilla CSS kết hợp các class tiện ích trong `index.css`. Hạn chế dùng style inline. Các hiệu ứng mờ (blur), ánh sáng (glow) đều đã được thiết lập sẵn biến (variables).
2. **Backend Architecture**: Dự án tuân theo chuẩn Dependency Injection (DI) của NestJS. Khi thêm API mới, hãy tạo Module -> Controller -> Service mới.
3. **CORS**: Backend đã được cấu hình `.enableCors()` trong `main.ts` để cho phép React (khác port) gọi API bình thường mà không bị lỗi. Nếu đưa lên server thật với domain, bạn nên giới hạn lại `origin` trong CORS để bảo mật.
4. **Code Quality**: Khuyến khích sử dụng Prettier và ESLint đã cấu hình sẵn trong dự án. Bạn có thể chạy `npm run lint` hoặc format code tự động bằng IDE.
