# Pre-Deployment Checklist

Làm theo checklist này trước khi deploy production:

## ✅ Code Quality

- [ ] All TypeScript errors fixed
  ```bash
  npm run build
  ```

- [ ] No console.log in production code
  ```bash
  # Search for console.log
  grep -r "console.log" src/
  ```

- [ ] All tests pass (if any)
  ```bash
  npm test
  ```

## ✅ Environment Variables

- [ ] Production API endpoint configured
  ```
  VITE_API_BASE_URL=https://your-production-api.com/api
  ```

- [ ] Azure Blob Storage URL
  ```
  VITE_BLOB_STORAGE_URL=https://toptop.blob.core.windows.net
  ```

- [ ] Remove hardcoded localhost URLs
  ```bash
  grep -r "localhost" src/
  ```

## ✅ Azure Configuration

- [ ] CORS configured for production domain
  - In Azure Portal → Storage Account → CORS
  - Add production URL to allowed origins

- [ ] Static Web App created (if using Azure)
  - Resource group created
  - GitHub connected
  - Build configuration set

## ✅ Performance

- [ ] Images optimized
  - Use WebP format
  - Lazy loading enabled

- [ ] Code splitting configured
  - Check vite.config.js

- [ ] Bundle size acceptable
  ```bash
  npm run build
  # Check dist/ folder size
  ```

## ✅ Security

- [ ] API keys not exposed in frontend code
  ```bash
  grep -r "API_KEY\|SECRET" src/
  ```

- [ ] HTTPS enforced on production

- [ ] Authentication flow tested

## ✅ Functionality

- [ ] Video upload works
- [ ] Video playback works
- [ ] Audio dubbing works (after CORS fix)
- [ ] Comments system works
- [ ] Like/Follow works
- [ ] Profile pages work
- [ ] Search works
- [ ] Mobile responsive

## ✅ Git

- [ ] All changes committed
  ```bash
  git status
  ```

- [ ] Pushed to main branch
  ```bash
  git push origin main
  ```

- [ ] .gitignore configured properly
  ```
  node_modules/
  dist/
  .env.local
  .env.production.local
  ```

## ✅ Documentation

- [ ] README.md updated
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] API documentation updated (if changed)

## 🚀 Ready to Deploy!

Run:
```bash
./deploy.ps1
```

Or manually:
```bash
# Build
npm run build

# Deploy to chosen platform
# Azure: git push origin main (auto deploy)
# Vercel: vercel --prod
# Netlify: netlify deploy --prod
```

## 📊 Post-Deployment

- [ ] Production URL accessible
- [ ] Test all major features
- [ ] Check console for errors
- [ ] Verify CORS working
- [ ] Monitor performance
- [ ] Check analytics/logs

## 🆘 Rollback Plan

If production breaks:

### Azure Static Web Apps
```bash
# Rollback to previous deployment
# In Azure Portal → Deployments → Select previous → Activate
```

### Vercel/Netlify
```bash
# Rollback via dashboard
# Deployments → Previous deployment → Promote to Production
```

### Git
```bash
# Revert last commit
git revert HEAD
git push origin main
```

## 📱 Monitor After Deploy

- Check logs every 10 minutes for first hour
- Monitor error rate
- Check user feedback
- Watch resource usage

---

**Last checked**: ___________

**Deployed by**: ___________

**Production URL**: ___________
