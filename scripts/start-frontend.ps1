# Start the Regulatory Intelligence frontend dev server
# Usage: .\scripts\start-frontend.ps1

$ErrorActionPreference = "Stop"

Write-Host "Starting Regulatory Intelligence frontend..." -ForegroundColor Green

Push-Location "$PSScriptRoot\.."
try {
    # Check pnpm
    $pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
    if (-not $pnpm) {
        Write-Host "ERROR: pnpm not found. Install with: npm install -g pnpm" -ForegroundColor Red
        exit 1
    }

    # Install if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Installing dependencies..."
        pnpm install
    }

    Write-Host "  UI: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    pnpm run dev
}
finally {
    Pop-Location
}
