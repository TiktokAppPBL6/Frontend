# Hướng dẫn sử dụng TikTok Clone

## 🚀 Khởi động ứng dụng

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000/**

## 📖 Flow sử dụng

### 1. Trang giới thiệu (/)
- Truy cập `http://localhost:3000/`
- Xem trang landing với hero section và các tính năng
- Click "Đăng ký ngay" hoặc "Đăng nhập"

### 2. Đăng ký tài khoản (/auth/register)
```
Email: test@example.com
Username: testuser
Họ tên: Test User (optional)
Mật khẩu: 123456 (tối thiểu 6 ký tự)
```
- Nhập thông tin đăng ký
- Click "Đăng ký"
- Sau khi đăng ký thành công → tự động đăng nhập → chuyển đến /home

### 3. Đăng nhập (/auth/login)
```
Email: test@example.com
Mật khẩu: 123456
```
- Nếu đã có tài khoản, đăng nhập trực tiếp
- Access token sẽ được lưu vào localStorage
- Chuyển đến /home sau khi đăng nhập thành công

### 4. Trang chủ - For You Feed (/home)
- Xem video feed với infinite scroll
- Video tự động play khi vào viewport (>60%)
- Video tự động pause khi scroll ra khỏi viewport
- Chỉ 1 video phát tại một thời điểm
- **Tương tác với video:**
  - ❤️ Like/Unlike video (click icon trái tim)
  - 💬 Comment (click icon comment → chuyển đến video detail)
  - 📤 Share (click icon share → copy link hoặc share qua native)
  - 🔖 Bookmark (click icon bookmark → lưu video)
  - 🔇/🔊 Mute/Unmute (click icon âm thanh ở góc dưới trái video)
- **Theo dõi tác giả:**
  - Click vào avatar hoặc tên tác giả → chuyển đến profile
  - Click button "Follow" để theo dõi

### 5. Following Feed (/following)
- Xem video từ những người bạn đang theo dõi
- Tương tự Home feed nhưng chỉ hiển thị video từ following list
- Nếu chưa follow ai → hiển thị thông báo "Bạn chưa theo dõi ai"

### 6. Tải video lên (/upload)
- Click "Tải lên" từ sidebar
- **Chọn video:**
  - Click "Chọn video"
  - Chỉ chấp nhận file video (mp4, mov, avi, etc.)
  - Kích thước tối đa: 100MB
- **Nhập thông tin:**
  - Tiêu đề (bắt buộc)
  - Mô tả (optional)
  - Hiển thị: Công khai / Riêng tư
- Click "Đăng video"
- Sau khi upload thành công → chuyển đến video detail page

### 7. Tìm kiếm (/search)
- Click vào search bar ở topbar (desktop)
- Hoặc truy cập /search
- **Tìm kiếm người dùng:**
  - Tab "Người dùng"
  - Nhập tên hoặc username
  - Click vào user card → chuyển đến profile
- **Tìm kiếm video:**
  - Tab "Video"
  - Nhập từ khóa (search trong title và description)
  - Click vào video thumbnail → chuyển đến video detail

### 8. Profile (/user/:id)
- Xem profile của người dùng
- **Thông tin hiển thị:**
  - Avatar, tên, username
  - Số lượng Following / Followers / Videos
  - Grid video của user
- **Hành động:**
  - Follow/Unfollow user
  - Click "Chỉnh sửa hồ sơ" (nếu là profile của mình) → /settings
  - Click vào video thumbnail → xem video detail

### 9. Video Detail (/video/:id)
- Xem chi tiết video với player full size
- **Tương tác:**
  - Video controls (play, pause, volume, fullscreen)
  - Like, Comment, Share, Bookmark
- **Comments section:**
  - Xem tất cả comments
  - Thêm comment mới (nhập text → click Send)
  - Comments được sắp xếp theo thời gian (mới nhất trước)

### 10. Tin nhắn (/messages)
- Xem danh sách hội thoại (inbox) ở bên trái
- **Gửi tin nhắn:**
  - Click vào conversation
  - Nhập tin nhắn ở ô input
  - Click Send hoặc Enter
- Tin nhắn của mình hiển thị bên phải (màu hồng)
- Tin nhắn của người khác hiển thị bên trái (màu xám)

### 11. Thông báo (/notifications)
- Xem tất cả thông báo về:
  - Like video của bạn
  - Comment video của bạn
  - Follow bạn
  - Thông báo hệ thống
- Thông báo chưa đọc có background màu xanh nhạt
- Click "Đánh dấu đã đọc" để đánh dấu tất cả là đã đọc

### 12. Cài đặt (/settings)
- **Thay đổi avatar:**
  - Click vào icon camera ở góc avatar
  - Chọn ảnh (JPG, PNG, tối đa 5MB)
  - Avatar tự động cập nhật
- **Cập nhật thông tin:**
  - Tên hiển thị
  - Tên người dùng
  - Email (không thể thay đổi)
- Click "Lưu thay đổi"

### 13. Đăng xuất
- Click icon đăng xuất ở topbar
- Access token sẽ bị xóa
- Redirect về /auth/login

## 🎮 Keyboard Shortcuts

- **Space**: Play/Pause video (khi focus vào video)
- **M**: Mute/Unmute video
- **↑/↓**: Scroll video feed
- **Enter**: Submit form (comment, search, etc.)
- **Esc**: Close modal/dialog

## 🔧 API Fallback Mode

Nếu backend API không khả dụng (localhost:8000):
1. Ứng dụng tự động chuyển sang **Mock Data Mode**
2. Toast thông báo: "Không thể kết nối server. Đang dùng dữ liệu tạm."
3. Tất cả tính năng vẫn hoạt động với mock data
4. Mock data được định nghĩa trong `src/mocks/mockDB.ts`

### Test với Mock Data:
```bash
# Không cần chạy backend
npm run dev
# Truy cập http://localhost:3000/
# Đăng nhập với bất kỳ email/password nào
# Tất cả tính năng vẫn hoạt động
```

## 📱 Responsive Testing

### Desktop (> 1024px):
- Full sidebar bên trái
- Video feed center
- Search bar ở topbar

### Tablet (768px - 1024px):
- Sidebar thu gọn hoặc ẩn
- Video grid 2-3 columns
- Hamburger menu

### Mobile (< 768px):
- Hamburger menu
- Video feed full width
- Bottom navigation (optional)

## 🎨 Customization

### Thay đổi màu chủ đạo:
```css
/* src/styles/globals.css */
:root {
  --primary: 348 83% 58%; /* TikTok Pink: #FE2C55 */
  --secondary: 180 100% 47%; /* TikTok Cyan: #00F2EA */
}
```

### Thay đổi logo:
- Replace file trong `public/vite.svg`
- Hoặc update logo component trong `Sidebar.tsx` và `Topbar.tsx`

## 🐛 Troubleshooting

### Lỗi: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: TypeScript compilation error
```bash
# Xóa cache và rebuild
rm -rf dist .vite
npm run build
```

### Video không autoplay:
- Đảm bảo browser cho phép autoplay
- Video phải có thuộc tính `muted` và `playsInline`
- Check console log để xem error

### API không hoạt động:
- Check backend server đang chạy tại localhost:8000
- Hoặc app sẽ tự động fallback sang mock data

## 📝 Notes

- **Access Token**: Được lưu trong localStorage với key `accessToken`
- **User Info**: Được lưu trong localStorage với key `user`
- **Token Expiry**: Nếu token hết hạn (401), tự động logout và redirect về login
- **Network Error**: Tự động fallback sang mock data mode

## 🎯 Test Scenarios

### Scenario 1: First Time User
1. Vào / (Intro)
2. Click "Đăng ký ngay"
3. Đăng ký tài khoản mới
4. Vào /home → xem video feed
5. Like một video
6. Comment một video
7. Follow một user
8. Vào /following → xem video từ user đã follow

### Scenario 2: Video Upload
1. Đăng nhập
2. Click "Tải lên"
3. Chọn video file
4. Nhập title và description
5. Click "Đăng video"
6. Xem video vừa upload trong profile

### Scenario 3: Social Interaction
1. Vào /home
2. Like 3 videos
3. Comment 2 videos
4. Follow 2 users
5. Bookmark 1 video
6. Vào /notifications → xem thông báo

## 🚀 Production Build

```bash
npm run build
npm run preview
```

Build output sẽ ở trong folder `dist/`

## 📚 Tài liệu thêm

- [React Query Docs](https://tanstack.com/query/latest)
- [React Router Docs](https://reactrouter.com/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
