# Hướng dẫn Deploy Production - TikTok Clone

## Option 1: Azure Static Web Apps (Recommended - Tích hợp Azure)

### Bước 1: Chuẩn bị Code

```bash
# Đảm bảo code đã commit
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Bước 2: Tạo Static Web App

1. **Azure Portal**: https://portal.azure.com
2. Search "Static Web Apps" → Click **Create**
3. **Cấu hình**:
   - Subscription: Chọn subscription của bạn
   - Resource Group: Tạo mới hoặc chọn existing
   - Name: `tiktok-clone-prod`
   - Region: `East Asia` (gần Việt Nam nhất)
   - Deployment source: **GitHub**
   
4. **GitHub Authorization**:
   - Click **Sign in with GitHub**
   - Authorize Azure
   - Chọn Organization: Your account
   - Repository: `tiktok-clone`
   - Branch: `main`

5. **Build Details**:
   - Build Presets: **Custom**
   - App location: `/` 
   - Output location: `dist`

6. Click **Review + Create** → **Create**

### Bước 3: Cấu hình Build (Tự động)

Azure sẽ tự tạo file `.github/workflows/azure-static-web-apps-*.yml`:

```yaml
# File được tạo tự động - KHÔNG XÓA
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
      
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
```

### Bước 4: Thêm Environment Variables

Trong Azure Portal → Your Static Web App → **Configuration**:

```
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_BLOB_STORAGE_URL=https://toptop.blob.core.windows.net
```

### Bước 5: Update CORS

Sau khi deploy, bạn sẽ có URL như: `https://tiktok-clone-prod.azurestaticapps.net`

**Update CORS trên Azure Blob Storage**:

```bash
az storage cors add \
  --services b \
  --methods GET HEAD OPTIONS \
  --origins "https://tiktok-clone-prod.azurestaticapps.net" \
  --allowed-headers '*' \
  --exposed-headers '*' \
  --max-age 3600 \
  --account-name toptop
```

Hoặc qua Portal: Settings → Resource sharing (CORS) → Add rule mới với origin production.

### Bước 6: Custom Domain (Optional)

1. Azure Portal → Your Static Web App → **Custom domains**
2. Click **Add** → **Custom domain on other DNS**
3. Domain: `tiktok.yourdomain.com`
4. Validation type: **TXT**
5. Thêm TXT record vào DNS provider của bạn
6. Click **Validate**
7. Thêm CNAME record: `tiktok` → `tiktok-clone-prod.azurestaticapps.net`

### Bước 7: Deploy Tự động

Từ giờ, mỗi khi bạn push code:

```bash
# Update code
git add .
git commit -m "Update video player"
git push origin main

# Azure tự động:
# 1. Detect push
# 2. Run npm install
# 3. Run npm run build
# 4. Deploy dist/ lên production
# 5. Gửi notification khi done
```

---

## Option 2: Vercel (Nhanh nhất - Free)

### Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Làm theo hướng dẫn:
# - Link to existing project? No
# - Project name: tiktok-clone
# - Directory: ./ (Enter)
# - Override settings? No

# Deploy production
vercel --prod
```

### Environment Variables

```bash
vercel env add VITE_API_BASE_URL
# Nhập: https://your-backend-api.com/api

vercel env add VITE_BLOB_STORAGE_URL
# Nhập: https://toptop.blob.core.windows.net
```

### Auto Deploy

Vercel tự động deploy khi push lên GitHub:

1. Login Vercel: https://vercel.com
2. Import Git Repository
3. Chọn repo `tiktok-clone`
4. Deploy

Từ giờ: **Push code = Auto deploy!**

---

## Option 3: Netlify (Cũng Free)

### Setup

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Build command: npm run build
# Publish directory: dist
```

### Auto Deploy

1. https://app.netlify.com → New site from Git
2. Chọn GitHub → Chọn repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables:
   - `VITE_API_BASE_URL`
   - `VITE_BLOB_STORAGE_URL`

---

## Sau khi Deploy

### 1. Test Production

- [ ] Video playback hoạt động
- [ ] Audio dubbing hoạt động (sau khi fix CORS)
- [ ] Upload video
- [ ] Comments, likes, follows
- [ ] Authentication flow
- [ ] Mobile responsive

### 2. Update Backend CORS

Nếu backend cũng cần CORS, thêm production URL:

```python
# Backend (FastAPI/Django)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-production-url.com",
    "https://tiktok-clone-prod.azurestaticapps.net"
]
```

### 3. Monitor

- Azure Portal → Static Web App → **Metrics**
- Check logs trong **Function** (nếu có API)
- GitHub Actions để xem deployment history

---

## Workflow Hàng Ngày

```bash
# 1. Code trên local
npm run dev

# 2. Test kỹ
# Test các tính năng

# 3. Commit và push
git add .
git commit -m "Add new feature"
git push origin main

# 4. Chờ tự động deploy (2-3 phút)
# Check GitHub Actions hoặc Vercel/Netlify dashboard

# 5. Verify production
# Test trên production URL
```

---

## Troubleshooting

### Deploy Failed?

Check GitHub Actions logs:
```
Repository → Actions → Click failed workflow → View logs
```

### Build Error?

```bash
# Test build locally
npm run build

# Fix errors
# Push lại
```

### CORS vẫn lỗi?

1. Check CORS configuration trong Azure Portal
2. Verify production URL trong allowed origins
3. Clear browser cache (Ctrl+Shift+Delete)
4. Test với curl:
   ```bash
   curl -i -X OPTIONS \
     -H "Origin: https://your-production-url.com" \
     -H "Access-Control-Request-Method: GET" \
     https://toptop.blob.core.windows.net/audios/test.wav
   ```

---

## Performance Tips

### Enable Caching

Trong `vite.config.js`:

```js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
        }
      }
    }
  }
})
```

### Enable Compression

Azure Static Web Apps tự động enable Gzip/Brotli.

### CDN

Azure Static Web Apps có global CDN tích hợp sẵn!

---

## Tóm tắt

1. ✅ **Deploy lần đầu**: Chọn platform (Azure/Vercel/Netlify)
2. ✅ **Link GitHub**: Setup auto-deployment
3. ✅ **Fix CORS**: Thêm production domain vào Azure Blob
4. ✅ **Push code**: Từ giờ push = auto deploy!

🚀 **Recommended**: Azure Static Web Apps (vì đã dùng Azure ecosystem)
