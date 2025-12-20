# FIX: Google OAuth Error 400 - redirect_uri_mismatch

## 🐛 Lỗi hiện tại

```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

**Nguyên nhân:** `redirect_uri` mà backend gửi cho Google **không khớp** với redirect_uri đã config trong Google Cloud Console.

---

## 🔍 Phân tích vấn đề

### Luồng OAuth2 hiện tại:

1. User click "Đăng nhập Google" → Frontend redirect đến:
   ```
   https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/login
   ```

2. **Backend** tạo OAuth URL và redirect user đến Google:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=YOUR_CLIENT_ID
     &redirect_uri=BACKEND_REDIRECT_URI    ← Đây là vấn đề!
     &response_type=code
     &scope=email profile
   ```

3. ❌ **Google check:** redirect_uri có trong whitelist của app không?
   - Nếu KHÔNG → **Error 400: redirect_uri_mismatch**
   - Nếu CÓ → Tiếp tục flow

---

## 🔧 Cách fix (2 bước)

### Bước 1: Kiểm tra backend đang dùng redirect_uri gì

**Backend cần check biến môi trường:**
```python
# Backend code (FastAPI/Python)
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
```

**Giá trị redirect_uri phải là URL của backend callback:**
```
https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
```

⚠️ **QUAN TRỌNG:** 
- Phải dùng HTTPS (không dùng HTTP)
- Phải là domain chính xác của Azure backend
- Không có trailing slash
- Không có query parameters

### Bước 2: Config Google Cloud Console

**Truy cập:** https://console.cloud.google.com/apis/credentials

1. Chọn project của bạn
2. Click vào **OAuth 2.0 Client ID** (Web application)
3. Trong **Authorized redirect URIs**, thêm:

   **✅ Production (Azure):**
   ```
   https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
   ```

   **✅ Development (Local - optional):**
   ```
   http://localhost:8000/api/v1/auth/google/callback
   ```

4. Click **Save**

---

## 📋 Checklist để fix

### Backend (Python/FastAPI):

**File:** `app/config.py` hoặc `.env`

```python
# .env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
```

**File:** `app/auth/google.py` hoặc tương tự

```python
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
    # ✅ Đảm bảo redirect_uri đúng
    redirect_uri=GOOGLE_REDIRECT_URI
)

@router.get("/google/login")
async def google_login(request: Request):
    # Authlib sẽ tự động dùng redirect_uri từ config
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    # Process user_info...
```

### Google Cloud Console:

1. **URL:** https://console.cloud.google.com/apis/credentials
2. **OAuth 2.0 Client ID** → Edit
3. **Authorized redirect URIs:**
   ```
   https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
   ```
4. Save

---

## 🧪 Test sau khi fix

### 1. Test OAuth flow:

1. Mở browser, truy cập:
   ```
   https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/login
   ```

2. Sẽ redirect đến Google với URL dạng:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=xxx
     &redirect_uri=https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
     &response_type=code
     &scope=openid%20email%20profile
   ```

3. ✅ **Check:** `redirect_uri` parameter phải chính xác là:
   ```
   https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
   ```

4. Chọn Google account → Authorize

5. ✅ Google redirect về:
   ```
   https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback?code=xxx
   ```

6. Backend xử lý code → exchange token → redirect về frontend

### 2. Test từ Frontend:

1. Vào `/auth/login` hoặc `/auth/register`
2. Click "Đăng nhập bằng Google"
3. ✅ Flow hoạt động bình thường

---

## ⚠️ Common mistakes

### ❌ Sai 1: Dùng frontend URL làm redirect_uri
```python
# SAI - Backend gửi frontend URL cho Google
GOOGLE_REDIRECT_URI = "http://localhost:3000/google-callback.html"
```

**Giải thích:** Google sẽ redirect về URL này với authorization code, nhưng **frontend không thể xử lý code** vì không có GOOGLE_CLIENT_SECRET.

### ❌ Sai 2: Dùng HTTP thay vì HTTPS
```python
# SAI - Production phải dùng HTTPS
GOOGLE_REDIRECT_URI = "http://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback"
```

### ❌ Sai 3: Có trailing slash
```python
# SAI - Không có trailing slash
GOOGLE_REDIRECT_URI = "https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback/"
```

### ❌ Sai 4: Không khớp với Google Console
```python
# Backend code
GOOGLE_REDIRECT_URI = "https://backend.com/api/v1/auth/google/callback"

# Google Console config
# ✅ Authorized redirect URIs:
# https://backend.com/api/auth/google/callback  ← SAI, thiếu /v1
```

---

## ✅ Cấu hình đúng (Full example)

### Backend `.env`:
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
```

### Google Cloud Console:
**OAuth 2.0 Client ID** → **Authorized redirect URIs:**
```
https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
http://localhost:8000/api/v1/auth/google/callback (optional, for local dev)
```

### Backend code (FastAPI):
```python
from fastapi import APIRouter, Request
from authlib.integrations.starlette_client import OAuth

router = APIRouter()
oauth = OAuth()

# Register Google OAuth
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.get("/google/login")
async def google_login(request: Request):
    # Authlib tự động dùng redirect_uri
    redirect_uri = str(request.url_for('google_callback'))
    # Hoặc hardcode: redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request):
    try:
        # Exchange code for token
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        # Create or get user from DB
        user = await get_or_create_user(user_info)
        
        # Generate JWT token
        access_token = create_access_token(user.id)
        
        # Redirect to frontend with token
        frontend_callback = f"http://localhost:3000/google-callback.html?access_token={access_token}"
        return RedirectResponse(url=frontend_callback)
    except Exception as e:
        # Handle error
        return RedirectResponse(url="http://localhost:3000/auth/login?error=oauth_failed")
```

---

## 📞 Liên hệ Developer (Backend)

**Cần yêu cầu backend developer:**

1. ✅ Check biến môi trường `GOOGLE_REDIRECT_URI`
2. ✅ Đảm bảo redirect_uri đúng:
   ```
   https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback
   ```
3. ✅ Deploy backend với config mới
4. ✅ Add redirect_uri vào Google Console
5. ✅ Test OAuth flow

**Azure App Service Environment Variables:**
- Vào Azure Portal
- App Service → Configuration → Application settings
- Thêm/Update:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
- Save → Restart app

---

## 🎯 Kết luận

**Lỗi:** `redirect_uri_mismatch` do backend config sai redirect_uri hoặc Google Console chưa whitelist URI

**Fix:**
1. Backend dùng đúng redirect_uri: `https://toptop-backend-api.azurewebsites.net/api/v1/auth/google/callback`
2. Google Console whitelist URI này
3. Deploy backend với config mới

**Không phải lỗi của frontend!** Frontend chỉ redirect user đến backend `/google/login`, backend chịu trách nhiệm OAuth flow.

---

**Created:** 2024-12-20  
**Status:** ⏳ PENDING (Cần backend fix)  
**Priority:** 🔥 HIGH
