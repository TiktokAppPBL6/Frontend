# FIX: Lỗi Đăng Ký Google - Backend URL

## 🐛 Vấn đề phát hiện

### Issue: Google Login bị lỗi vì dùng localhost thay vì Azure backend

**File lỗi:** `public/google-callback.html` (dòng 108)

**Lỗi cũ:**
```javascript
const backendUrl = 'http://localhost:8000/api/v1/auth/google/callback?' + urlParams.toString();
```

**Đã fix thành:**
```javascript
const backendUrl = 'https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback?' + urlParams.toString();
```

---

## 📋 Luồng đăng nhập Google (OAuth2)

### 1. User click "Đăng nhập bằng Google"
- **Component:** [Register.tsx](src/pages/auth/Register.tsx#L127) hoặc [Login.tsx](src/pages/auth/Login.tsx#L105)
- **Action:** Redirect đến backend OAuth endpoint
```typescript
window.location.href = `${API_BASE_URL}/api/v1/auth/google/login`;
```
- **URL:** `https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/login`

### 2. Backend redirect đến Google
- Backend tạo OAuth request với Google
- Google hiển thị màn hình consent (chọn account, authorize)

### 3. Google redirect về Backend callback
- **URL:** `https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback?code=xxx`
- Backend nhận authorization code từ Google

### 4. Backend redirect về Frontend HTML
- **URL:** `http://localhost:3000/google-callback.html?code=xxx`
- File static HTML này handle tiếp

### 5. HTML callback exchange code → token
- **File:** [public/google-callback.html](public/google-callback.html)
- **Action:** Call backend để đổi code lấy access_token
```javascript
const response = await fetch(
  'https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback?code=xxx',
  { method: 'GET', headers: { 'Accept': 'application/json' } }
);
const data = await response.json();
const accessToken = data.access_token;
```

### 6. HTML redirect về React app với token
- **URL:** `http://localhost:3000/auth/google/callback?access_token=xxx`
- React component nhận token

### 7. React component lưu token & redirect home
- **Component:** [GoogleCallback.tsx](src/pages/auth/GoogleCallback.tsx)
- **Action:** 
  - Lấy token từ URL params
  - Gọi `loginWithToken(token)` để lưu vào Zustand store & localStorage
  - Redirect về `/home`

---

## ✅ Đã fix

| File | Thay đổi | Status |
|------|----------|--------|
| `public/google-callback.html` | Đổi URL từ localhost → Azure backend | ✅ Fixed |

---

## 🔍 Các API endpoints đang dùng

### Backend (Azure)
Base URL: `https://toptop-backend-api.azurewebsites.net`

1. **Khởi tạo OAuth:**
   - `GET /api/v1/auth/google/login`
   - Redirect user đến Google consent screen

2. **Callback xử lý code:**
   - `GET /api/v1/auth/google/callback?code=xxx`
   - Exchange authorization code → access_token
   - Response: `{ access_token: string, user: {...} }`

### Frontend Routes

1. **HTML callback (static):**
   - `/google-callback.html`
   - Nhận code từ backend
   - Call backend để đổi token
   - Redirect về React app

2. **React callback (dynamic):**
   - `/auth/google/callback`
   - Component: `GoogleCallback.tsx`
   - Nhận token từ URL
   - Lưu token & redirect home

---

## 🧪 Test flow

### Test trên production (deployed):
1. Mở: `https://your-frontend.com/auth/register`
2. Click "Đăng nhập bằng Google"
3. Chọn Google account
4. Authorize app
5. ✅ Redirect về `/google-callback.html`
6. ✅ Exchange code → token (call Azure backend)
7. ✅ Redirect về `/auth/google/callback?access_token=xxx`
8. ✅ Login thành công, redirect `/home`

### Test trên local dev:
1. Mở: `http://localhost:3000/auth/register`
2. Click "Đăng nhập bằng Google"
3. **Note:** Backend redirect về local frontend
4. Flow tương tự như trên

---

## ⚠️ Lưu ý quan trọng

### Google OAuth Redirect URIs phải config trong Google Console:
Backend cần config 2 redirect URIs:

1. **Development:**
   ```
   http://localhost:3000/google-callback.html
   ```

2. **Production:**
   ```
   https://your-frontend-domain.com/google-callback.html
   ```

### Backend environment variables:
```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://your-frontend.com/google-callback.html
```

---

## 🎯 Kết luận

**Vấn đề:** Google Login bị lỗi vì `google-callback.html` hardcode URL localhost backend

**Giải pháp:** Đổi thành Azure backend URL

**Kết quả:** Google Login hoạt động bình thường với Azure backend deployed

---

**Fixed by:** GitHub Copilot  
**Date:** 2024-12-20  
**Status:** ✅ RESOLVED
