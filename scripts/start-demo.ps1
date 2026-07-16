# Start both backend and frontend for demo
# Usage: .\scripts\start-demo.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host " Regulatory Intelligence Demo Startup"   -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start backend in background
Write-Host "Starting backend..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-backend.ps1" -PassThru
Write-Host "  Backend PID: $($backend.Id)"

# Wait for backend to be ready
Write-Host "  Waiting for backend health check..."
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.status -eq "ok") {
            $ready = $true
            break
        }
    }
    catch {}
}

if ($ready) {
    Write-Host "  Backend ready." -ForegroundColor Green
}
else {
    Write-Host "  WARNING: Backend may not be ready yet. Check the backend window." -ForegroundColor Yellow
}

Write-Host ""

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Demo servers starting"                   -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000"         -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173"         -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:5173 in your browser to start the demo."
Write-Host "Press Ctrl+C to stop this script (backend and frontend run in separate windows)."
