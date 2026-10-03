$ErrorActionPreference = "Stop"
python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
& .\.venv\Scripts\python.exe ml\train.py
Write-Host "`nModel trained successfully."
Write-Host "Start API with:"
Write-Host "  .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000"
