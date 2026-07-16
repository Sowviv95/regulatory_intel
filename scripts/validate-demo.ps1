# Validate demo readiness
# Usage: .\scripts\validate-demo.ps1
# Checks: backend health, database, expected counts, frontend build

$ErrorActionPreference = "Continue"
$pass = 0
$fail = 0

function Check($name, $condition) {
    if ($condition) {
        Write-Host "  PASS  $name" -ForegroundColor Green
        $script:pass++
    }
    else {
        Write-Host "  FAIL  $name" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Regulatory Intelligence Demo Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Database file ---
Write-Host "Database:" -ForegroundColor White
$dbPath = "$PSScriptRoot\..\backend\data\regulatory_intel.db"
Check "Database file exists" (Test-Path $dbPath)

if (Test-Path $dbPath) {
    Push-Location "$PSScriptRoot\..\backend"
    $counts = python -c "
from database import get_connection
c = get_connection()
src = c.execute('SELECT COUNT(*) FROM sources').fetchone()[0]
reg = c.execute('SELECT COUNT(*) FROM regulations').fetchone()[0]
fld = c.execute('SELECT COUNT(*) FROM regulation_fields').fetchone()[0]
ev  = c.execute('SELECT COUNT(*) FROM evidence').fetchone()[0]
tam = c.execute(""SELECT COUNT(*) FROM sources WHERE origin = 'tamarind'"").fetchone()[0]
c.close()
print(f'{src},{reg},{fld},{ev},{tam}')
" 2>$null
    Pop-Location

    if ($counts) {
        $parts = $counts.Split(',')
        $srcCount = [int]$parts[0]
        $regCount = [int]$parts[1]
        $fldCount = [int]$parts[2]
        $evCount  = [int]$parts[3]
        $tamCount = [int]$parts[4]

        Check "Sources >= 12 (seed data present): $srcCount"   ($srcCount -ge 12)
        Check "Regulations >= 6: $regCount"                     ($regCount -ge 6)
        Check "Fields >= 78: $fldCount"                         ($fldCount -ge 78)
        Check "Evidence >= 78: $evCount"                        ($evCount -ge 78)
        Check "Tamarind imported sources >= 1: $tamCount"       ($tamCount -ge 1)

        Write-Host ""
        Write-Host "  Totals: $srcCount sources, $regCount regulations, $fldCount fields, $evCount evidence" -ForegroundColor Gray
        Write-Host "  Imported: $tamCount Tamarind sources" -ForegroundColor Gray
    }
    else {
        Write-Host "  FAIL  Could not read database counts" -ForegroundColor Red
        $fail++
    }
}
Write-Host ""

# --- Backend health ---
Write-Host "Backend:" -ForegroundColor White
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 3 -ErrorAction Stop
    Check "Backend health endpoint responds" ($health.status -eq "ok")
}
catch {
    Check "Backend health endpoint responds" $false
    Write-Host "    (Is the backend running? Start with: .\scripts\start-backend.ps1)" -ForegroundColor Yellow
}
Write-Host ""

# --- Backend tests ---
Write-Host "Tests:" -ForegroundColor White
Push-Location "$PSScriptRoot\..\backend"
$testResult = python -m pytest tests/ -q 2>&1
$testPassed = $testResult -match "passed"
Pop-Location
Check "Backend tests pass" $testPassed
if (-not $testPassed) {
    Write-Host "    $testResult" -ForegroundColor Yellow
}
Write-Host ""

# --- Frontend build ---
Write-Host "Frontend:" -ForegroundColor White
Push-Location "$PSScriptRoot\.."
$buildResult = pnpm run build 2>&1
$buildPassed = $buildResult -match "built in"
Pop-Location
Check "Frontend build succeeds" $buildPassed
Write-Host ""

# --- Summary ---
$total = $pass + $fail
Write-Host "========================================" -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host " ALL $total CHECKS PASSED" -ForegroundColor Green
    Write-Host " Demo is ready." -ForegroundColor Green
}
else {
    Write-Host " $pass/$total checks passed, $fail FAILED" -ForegroundColor Red
    Write-Host " Fix the failures before running the demo." -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
