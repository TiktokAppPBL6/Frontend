# Quick Deploy Script
# Chạy script này để deploy nhanh

Write-Host "=== TikTok Clone - Quick Deploy ===" -ForegroundColor Cyan
Write-Host ""

# Check if there are uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Có thay đổi chưa commit!" -ForegroundColor Yellow
    Write-Host ""
    git status --short
    Write-Host ""
    $commit = Read-Host "Commit message (Enter để skip)"
    
    if ($commit) {
        git add .
        git commit -m "$commit"
        Write-Host "✅ Đã commit" -ForegroundColor Green
    }
}

# Ask deployment target
Write-Host ""
Write-Host "Chọn nền tảng deploy:" -ForegroundColor Cyan
Write-Host "1. Azure Static Web Apps (Auto deploy qua GitHub)"
Write-Host "2. Vercel"
Write-Host "3. Netlify"
Write-Host "4. Build only (không deploy)"
Write-Host ""

$choice = Read-Host "Chọn (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Deploy lên Azure Static Web Apps..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Bước 1: Push code lên GitHub" -ForegroundColor Yellow
        
        $push = Read-Host "Push lên GitHub? (y/n)"
        if ($push -eq "y") {
            git push origin main
            Write-Host ""
            Write-Host "✅ Đã push! Azure sẽ tự động deploy trong 2-3 phút" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Check deployment status:" -ForegroundColor Cyan
            Write-Host "   https://github.com/YOUR_USERNAME/tiktok-clone/actions"
            Write-Host ""
            Write-Host "🌐 Production URL (sau khi deploy xong):" -ForegroundColor Cyan
            Write-Host "   https://tiktok-clone-prod.azurestaticapps.net"
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Deploy lên Vercel..." -ForegroundColor Green
        Write-Host ""
        
        # Check if vercel CLI installed
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (-not $vercelInstalled) {
            Write-Host "⚠️  Vercel CLI chưa cài đặt!" -ForegroundColor Yellow
            Write-Host "Cài đặt: npm i -g vercel"
            Write-Host ""
            $install = Read-Host "Cài đặt ngay? (y/n)"
            if ($install -eq "y") {
                npm i -g vercel
            } else {
                exit
            }
        }
        
        Write-Host "Building..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build thành công!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Deploying..." -ForegroundColor Yellow
            vercel --prod
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🚀 Deploy lên Netlify..." -ForegroundColor Green
        Write-Host ""
        
        # Check if netlify CLI installed
        $netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
        if (-not $netlifyInstalled) {
            Write-Host "⚠️  Netlify CLI chưa cài đặt!" -ForegroundColor Yellow
            Write-Host "Cài đặt: npm i -g netlify-cli"
            Write-Host ""
            $install = Read-Host "Cài đặt ngay? (y/n)"
            if ($install -eq "y") {
                npm i -g netlify-cli
            } else {
                exit
            }
        }
        
        Write-Host "Building..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build thành công!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Deploying..." -ForegroundColor Yellow
            netlify deploy --prod
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "🔨 Building..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Build thành công!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📁 Output: dist/" -ForegroundColor Cyan
            Write-Host "📊 Files:" -ForegroundColor Cyan
            Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum | ForEach-Object {
                $size = [math]::Round($_.Sum / 1MB, 2)
                Write-Host "   Total: $size MB"
            }
        } else {
            Write-Host ""
            Write-Host "❌ Build failed! Check errors above." -ForegroundColor Red
            exit 1
        }
    }
    
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify production deployment"
Write-Host "2. Update CORS trên Azure Blob Storage"
Write-Host "3. Test các tính năng trên production"
Write-Host ""
Write-Host "📖 Xem chi tiết: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
