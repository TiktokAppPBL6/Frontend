# Start Backend + Frontend Servers
# Usage: .\start-servers.ps1

Write-Host "🚀 Starting TikTok Clone Servers..." -ForegroundColor Green
Write-Host ""

# Check if backend is already running
$backendRunning = netstat -ano | findstr ":8000" | findstr "LISTENING"

if (-not $backendRunning) {
    Write-Host "▶️  Starting Backend Server (Port 8000)..." -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "cd '$PSScriptRoot\..\Backend-Business'; D:\Good\backend\.venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    
    Start-Sleep -Seconds 5
    Write-Host "✅ Backend started!" -ForegroundColor Green
} else {
    Write-Host "✓ Backend already running on port 8000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "▶️  Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "✅ Frontend started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Server URLs:" -ForegroundColor Yellow
Write-Host "   • Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   • WebSocket: ws://localhost:8000/api/v1/ws/{token}" -ForegroundColor White
Write-Host ""
Write-Host "💡 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host ""
