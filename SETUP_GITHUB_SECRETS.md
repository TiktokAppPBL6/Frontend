# Setup GitHub Secrets

Để GitHub Actions có thể deploy lên Azure, cần thêm deployment token:

## Bước 1: Lấy Deployment Token từ Azure

1. Vào Azure Portal: https://portal.azure.com
2. Tìm Static Web App: **toptop**
3. Click vào resource
4. Trong menu bên trái, click **Overview**
5. Phía trên, click **Manage deployment token**
6. Click **Copy** để copy token

## Bước 2: Thêm Secret vào GitHub

1. Mở GitHub repository: https://github.com/TiktokAppPBL6/Frontend
2. Click **Settings** tab
3. Sidebar bên trái: **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Điền:
   ```
   Name: AZURE_STATIC_WEB_APPS_API_TOKEN_TOPTOP
   Value: [Paste token từ Azure]
   ```
6. Click **Add secret**

## Bước 3: Push Workflow File

```bash
git add .github/workflows/
git commit -m "Add Azure Static Web Apps workflow"
git push origin main
```

## Bước 4: Verify Deployment

1. Trong GitHub: **Actions** tab
2. Xem workflow "Azure Static Web Apps CI/CD" đang chạy
3. Đợi ~2-3 phút
4. Check deployment status

## Production URL

Sau khi deploy xong:
```
https://toptop.azurestaticapps.net
```

Hoặc xem trong Azure Portal → Static Web App → Overview

---

## Troubleshooting

### Workflow failed với "Invalid deployment token"?
- Verify secret name chính xác: `AZURE_STATIC_WEB_APPS_API_TOKEN_TOPTOP`
- Copy lại token từ Azure Portal
- Update secret trong GitHub Settings

### Build failed?
- Check GitHub Actions logs để xem error
- Test build locally: `npm run build`
- Fix errors và push lại

### Deployment timeout?
- Check Azure Portal → Static Web App → Environments
- Xem logs trong Azure
- Có thể cần restart deployment
