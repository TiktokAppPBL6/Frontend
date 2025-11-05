# TikTok Clone - Full Stack Application

Ứng dụng TikTok Clone được xây dựng với Vite + React + TypeScript + TailwindCSS, tích hợp đầy đủ tính năng như TikTok gốc.

## 🚀 Tính năng

### Core Features
- ✅ **Authentication**: Đăng ký/Đăng nhập với email & password
- ✅ **Video Feed**: Auto-play video theo scroll với IntersectionObserver
- ✅ **Following Feed**: Xem video từ người đang theo dõi
- ✅ **Video Upload**: Tải video lên với title, description
- ✅ **Video Detail**: Xem chi tiết video với comments
- ✅ **Search**: Tìm kiếm user và video
- ✅ **Profile**: Xem profile user với grid video
- ✅ **Social Actions**: Like, Comment, Follow, Bookmark, Share
- ✅ **Messages**: Chat 1-1 với người dùng khác
- ✅ **Notifications**: Nhận thông báo về tương tác
- ✅ **Settings**: Cập nhật profile, avatar

### Technical Features
- ✅ **Auto-play video**: Video tự động play khi vào viewport (>60%)
- ✅ **Pause khi scroll**: Chỉ 1 video phát tại một thời điểm
- ✅ **Mute/Unmute**: Điều khiển âm thanh video
- ✅ **Infinite Scroll**: Load more video tự động
- ✅ **Skeleton Loading**: Hiển thị skeleton khi loading
- ✅ **Responsive**: Mobile-first, responsive design
- ✅ **Route Guards**: Chặn route khi chưa đăng nhập
- ✅ **API Fallback**: Tự động chuyển sang mock data khi API lỗi

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router v6** - Routing
- **Zustand** - Auth state management
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
