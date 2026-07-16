# Reset the demo database: delete DB, re-seed, optionally import Tamarind data
# Usage: .\scripts\reset-demo.ps1
# Usage: .\scripts\reset-demo.ps1 -Import
# Usage: .\scripts\reset-demo.ps1 -Import -BatchFile "C:\path\to\Batch1.xlsx"

param(
    [switch]$Import,
    [string]$BatchFile
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host " Regulatory Intelligence Demo Reset"     -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$dbPath = "$PSScriptRoot\..\backend\data\regulatory_intel.db"

# Delete existing database
if (Test-Path $dbPath) {
    Write-Host "Deleting existing database..." -ForegroundColor Yellow
    Remove-Item $dbPath -Force
    Write-Host "  Deleted: $dbPath"
}

# Re-seed
Write-Host "Seeding demo data..." -ForegroundColor Green
Push-Location "$PSScriptRoot\..\backend"
python -c "from database import init_db; from seed import run_seed; init_db(); run_seed()"
Pop-Location

# Import Tamarind data if requested
if ($Import) {
    $defaultBatch = "$env:USERPROFILE\OneDrive - Merit Data and Technology Private Limited\onedrive_backup\tamarind\output_for_testing\Merit_Tamarind Intelligence_POC_Batch 1_Sample Data_v1.0_08Apr2025.xlsx"

    if (-not $BatchFile) {
        $BatchFile = $defaultBatch
    }

    if (Test-Path $BatchFile) {
        Write-Host ""
        Write-Host "Importing Tamarind Batch 1 data..." -ForegroundColor Green
        Push-Location "$PSScriptRoot\.."
        python -m backend.import_tamarind --input "$BatchFile"
        Pop-Location
    }
    else {
        Write-Host "WARNING: Batch file not found: $BatchFile" -ForegroundColor Yellow
        Write-Host "  Skipping Tamarind import."
    }
}

Write-Host ""
Write-Host "Demo reset complete." -ForegroundColor Green
Write-Host "Start the demo with: .\scripts\start-demo.ps1"
