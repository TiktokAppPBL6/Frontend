# API Configuration Guide

## 📍 Cấu hình API - Tập trung tại một nơi duy nhất

### File chính: `src/config/api.ts`

Đây là **NƠI DUY NHẤT** để cấu hình API URLs. Mọi file khác **PHẢI import** từ đây.

```typescript
import { API_BASE_URL, API_FULL_URL, WS_BASE_URL } from '@/config/api';
```

---

## 🔧 Cách cấu hình

### 1. **Development (Local)**

File `.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 2. **Production (Azure/Cloud)**

File `.env.production`:
```env
VITE_API_BASE_URL=https://toptop-backend-api.azurewebsites.net
```

---

## 📦 Exported Constants

| Constant | Description | Example |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL của backend API | `http://127.0.0.1:8000` |
| `API_VERSION` | API version | `v1` |
| `API_FULL_URL` | Full API URL (same as base) | `http://127.0.0.1:8000` |
| `WS_BASE_URL` | WebSocket URL (auto-converted) | `ws://127.0.0.1:8000` |

---

## ✅ Các file đã được chuẩn hóa

### TypeScript/React Files
- ✅ `src/api/axiosClient.ts` - Axios instance
- ✅ `src/services/websocket.service.ts` - WebSocket service
- ✅ `src/services/websocket.ts` - WebSocket service (legacy)
- ✅ `src/pages/auth/Login.tsx` - Login page
- ✅ `src/pages/auth/Register.tsx` - Register page
- ✅ `src/lib/utils.ts` - Utility functions

### HTML Files
- ✅ `public/google-callback.html` - Google OAuth callback
- ✅ `index.html` - Main HTML

---

## ⚠️ QUAN TRỌNG

### ❌ KHÔNG BAO GIỜ làm:
```typescript
// ❌ Hardcode URL
const url = 'https://toptop-backend-api.azurewebsites.net/api/v1/users';

// ❌ Tạo axios instance mới với URL khác
const api = axios.create({ baseURL: 'http://localhost:8000' });
```

### ✅ LUÔN LUÔN làm:
```typescript
// ✅ Import từ config
import { API_BASE_URL } from '@/config/api';
const url = `${API_BASE_URL}/api/v1/users`;

// ✅ Dùng axiosClient có sẵn
import { axiosClient } from '@/api/axiosClient';
const response = await axiosClient.get('/api/v1/users');
```

---

## 🚀 Restart sau khi thay đổi .env

Sau khi sửa file `.env`, **BẮT BUỘC restart dev server**:

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

Hoặc Vite sẽ tự động reload khi phát hiện `.env` thay đổi.

---

## 🐛 Troubleshooting

### Vẫn gọi API cũ sau khi đổi .env?

1. **Hard refresh browser**: Ctrl+Shift+R hoặc Ctrl+F5
2. **Clear browser cache**: DevTools → Network → Disable cache
3. **Unregister Service Workers**: DevTools → Application → Service Workers
4. **Thử Incognito mode**: Ctrl+Shift+N
5. **Restart dev server**: Stop (Ctrl+C) và chạy lại `npm run dev`

### Kiểm tra URL đang dùng?

Mở Browser Console, sẽ thấy log:
```
🔍 [axiosClient] BASE_URL: http://127.0.0.1:8000
🔍 [axiosClient] VITE_API_BASE_URL: http://127.0.0.1:8000
```

---

## 📝 Checklist khi thêm API call mới

- [ ] Import `API_BASE_URL` hoặc dùng `axiosClient` từ `@/api/axiosClient`
- [ ] KHÔNG hardcode URL
- [ ] Test với cả local và production URL
- [ ] Kiểm tra Network tab để chắc chắn gọi đúng URL

---

## 🔗 Related Files

- [.env](./.env) - Environment variables (local, DO NOT commit)
- [.env.example](./.env.example) - Example environment variables (commit this)
- [src/config/api.ts](./src/config/api.ts) - API configuration
- [src/api/axiosClient.ts](./src/api/axiosClient.ts) - Axios client instance
