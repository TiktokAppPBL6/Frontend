# Stop All Frontend Instances
# Usage: .\stop-all-instances.ps1

Write-Host "🛑 Stopping all Vite/Node processes..." -ForegroundColor Red

# Kill all node processes (Vite)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "✅ All instances stopped!" -ForegroundColor Green
