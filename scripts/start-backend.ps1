# Start the Regulatory Intelligence backend server
# Usage: .\scripts\start-backend.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $root) { $root = Split-Path -Parent $PSScriptRoot }

Write-Host "Starting Regulatory Intelligence backend..." -ForegroundColor Green
Write-Host "  Working directory: $PSScriptRoot\..\backend"

Push-Location "$PSScriptRoot\..\backend"
try {
    # Check Python
    $py = Get-Command python -ErrorAction SilentlyContinue
    if (-not $py) {
        Write-Host "ERROR: Python not found. Install Python 3.10+ and add to PATH." -ForegroundColor Red
        exit 1
    }

    # Install dependencies if needed
    if (-not (Test-Path "$PSScriptRoot\..\backend\__pycache__")) {
        Write-Host "  Installing dependencies..."
        pip install -r requirements.txt --quiet
    }

    Write-Host "  API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  Health: http://localhost:8000/api/health" -ForegroundColor Cyan
    Write-Host ""
    python main.py
}
finally {
    Pop-Location
}
