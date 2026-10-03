$ErrorActionPreference = "Stop"
Write-Host "== FraudShield local setup ==" -ForegroundColor Cyan
if (!(Test-Path ".\.venv\Scripts\python.exe")) {
    python -m venv .venv
}
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (!(Test-Path ".\models\fraud_model.joblib")) {
    & .\.venv\Scripts\python.exe ml\train.py
} else {
    Write-Host "Existing model found; skipping training." -ForegroundColor Green
}
Push-Location frontend
npm install
Pop-Location
Write-Host "`nSetup complete." -ForegroundColor Green
Write-Host "Run .\run-local.ps1 to start backend + frontend."
