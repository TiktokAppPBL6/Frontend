#!/usr/bin/env pwsh
# Clear all caches - Run this when frontend shows 404 errors

Write-Host "🧹 Clearing all caches..." -ForegroundColor Cyan

# Stop Vite dev server
Write-Host "Stopping Vite..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like '*node*' -and $_.MainWindowTitle -like '*vite*' } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clear Vite cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Clear dist
Write-Host "Clearing dist..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Restart Vite
Write-Host "`n✅ Cache cleared!" -ForegroundColor Green
Write-Host "`n📌 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. In browser: Press Ctrl+Shift+R (hard refresh)" -ForegroundColor White
Write-Host "3. Or: Press F12 -> Network tab -> Disable cache" -ForegroundColor White
