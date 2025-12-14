# Azure Blob Storage CORS Configuration

## Vấn đề hiện tại

Audio files từ Azure Blob Storage bị chặn bởi CORS policy:
```
Access to audio at 'https://toptop.blob.core.windows.net/audios/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Giải pháp

### Option 1: Azure Portal (Recommended)

1. Đăng nhập vào [Azure Portal](https://portal.azure.com)
2. Tìm Storage Account: `toptop`
3. Trong menu bên trái, chọn **Settings** → **Resource sharing (CORS)**
4. Tab **Blob service**, thêm rule mới:

```
Allowed origins: http://localhost:3000,http://localhost:3001,https://yourdomain.com
Allowed methods: GET, HEAD, OPTIONS
Allowed headers: *
Exposed headers: *
Max age: 3600
```

### Option 2: Azure CLI

```bash
az storage cors add \
  --services b \
  --methods GET HEAD OPTIONS \
  --origins http://localhost:3000 http://localhost:3001 https://yourdomain.com \
  --allowed-headers '*' \
  --exposed-headers '*' \
  --max-age 3600 \
  --account-name toptop
```

### Option 3: Azure Storage Explorer

1. Mở Azure Storage Explorer
2. Connect đến Storage Account `toptop`
3. Right-click → Configure CORS Settings
4. Thêm CORS rule như Option 1

## Production Setup

Khi deploy production, thay đổi allowed origins:

```
Allowed origins: https://yourdomain.com,https://www.yourdomain.com
```

## Verify CORS

Test CORS configuration:

```bash
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  https://toptop.blob.core.windows.net/audios/test.wav
```

Response phải có headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
```

## Fallback Strategy

Frontend đã được cập nhật để gracefully handle CORS errors:

✅ App sẽ tiếp tục hoạt động nếu audio bị CORS block
✅ Video vẫn play bình thường
✅ Dubbing feature sẽ bị disable tự động nếu audio fail
✅ Không có error logs spam console

## Notes

- CORS chỉ cần configure 1 lần cho Storage Account
- Áp dụng cho tất cả containers (videos, audios, thumbnails)
- Không ảnh hưởng đến security vì chỉ allow GET/HEAD methods
- Max age 3600s = cache CORS preflight trong 1 giờ
