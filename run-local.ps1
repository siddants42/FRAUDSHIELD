$ErrorActionPreference = "Stop"
if (!(Test-Path ".\.venv\Scripts\python.exe")) { throw "Run .\setup-local.ps1 first." }
if (!(Test-Path ".\models\fraud_model.joblib")) { throw "Model missing. Run .\setup-local.ps1 first." }

Write-Host "Starting FraudShield locally..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD'; .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\frontend'; npm run dev"
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "API:      http://localhost:8000/docs" -ForegroundColor Green
