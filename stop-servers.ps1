# Stop All Servers (Backend + Frontend)
# Usage: .\stop-servers.ps1

Write-Host "🛑 Stopping all servers..." -ForegroundColor Red
Write-Host ""

# Stop frontend (Node/Vite)
Write-Host "▶️  Stopping Frontend servers..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Frontend stopped" -ForegroundColor Green

# Stop backend (Python/Uvicorn)
Write-Host "▶️  Stopping Backend server..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*uvicorn*"} | Stop-Process -Force
Write-Host "✅ Backend stopped" -ForegroundColor Green

Write-Host ""
Write-Host "✅ All servers stopped!" -ForegroundColor Green
Write-Host ""
