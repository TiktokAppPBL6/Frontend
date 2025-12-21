# Run Multiple Frontend Instances for Testing
# Usage: .\run-multi-instances.ps1

Write-Host "🚀 Starting Multiple TikTok Clone Instances..." -ForegroundColor Green
Write-Host ""

# Array of ports to run
$ports = @(3000, 3001, 3002)

# Start each instance in a new window
foreach ($port in $ports) {
    Write-Host "▶️  Starting instance on port $port..." -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "cd '$PSScriptRoot'; npm run dev:$port"
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "✅ All instances started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Yellow
Write-Host "   • User A: http://localhost:3000" -ForegroundColor White
Write-Host "   • User B: http://localhost:3001" -ForegroundColor White
Write-Host "   • User C: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   1. Login with different accounts on each port" -ForegroundColor White
Write-Host "   2. Test notifications: Like/Comment/Follow from one user" -ForegroundColor White
Write-Host "   3. Test messaging: Send messages between users" -ForegroundColor White
Write-Host "   4. Close all windows when done" -ForegroundColor White
Write-Host ""
