# Setup Deployment Token

## Lấy Token từ Azure

1. Azure Portal: https://portal.azure.com
2. Tìm Static Web App **toptop** trong Resource Group **TopTop-RG**
3. Click vào resource
4. Toolbar phía trên, click **Manage deployment token**
5. Click nút **Copy** 📋 để copy token

Token có format:
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Thêm Secret vào GitHub

1. Mở: https://github.com/TiktokAppPBL6/Frontend/settings/secrets/actions
2. Click **New repository secret**
3. Điền thông tin:
   
   **Name (chính xác):**
   ```
   AZURE_STATIC_WEB_APPS_API_TOKEN_BRAVE_BAY_03AFE3100
   ```
   
   **Value:**
   ```
   [Paste token từ Azure vào đây]
   ```

4. Click **Add secret**

## Trigger Deployment

Sau khi thêm secret, trigger deployment:

```bash
git commit --allow-empty -m "Trigger deployment with token"
git push origin main
```

Hoặc vào GitHub Actions → Select workflow → **Re-run all jobs**

## Verify

1. GitHub: Actions tab → Xem workflow chạy
2. Đợi ~2-3 phút
3. Azure Portal → Environments → Status = Ready
4. Test production URL

---

## Secret Name Breakdown

File workflow: `.github/workflows/azure-static-web-apps-brave-bay-03afe3100.yml`

Dòng 25:
```yaml
azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_BRAVE_BAY_03AFE3100 }}
```

Secret name phải CHÍNH XÁC: `AZURE_STATIC_WEB_APPS_API_TOKEN_BRAVE_BAY_03AFE3100`

Không được sai 1 ký tự!
