# FraudShield — Credit Card Fraud Detection

A credit card fraud detection dashboard built with React, Vite, FastAPI, SQLite and scikit-learn.

## Current version

- Professional fintech-style UI with restrained styling
- Credit-card/security imagery integrated into the product
- Login and registration
- Single transaction prediction
- CSV batch analysis
- Large CSV processing in backend chunks
- Local upload support up to 512 MB
- The standard 143 MB credit-card dataset can be uploaded
- Analytics and model performance views
- GitHub-ready structure
- Docker intentionally deferred for the next phase

## Run locally

From the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-local.ps1
powershell -ExecutionPolicy Bypass -File .\run-local.ps1
```

Open:

- Frontend: http://localhost:5173
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

## CSV format

Expected model columns:

`Time, V1 ... V28, Amount`

The backend processes CSV files in 50,000-row chunks rather than reading the entire file into RAM at once.

The included frontend allows CSV files up to 512 MB for the local version.

## GitHub

Do not commit the large dataset. The `.gitignore` excludes `data/creditcard.csv`.
