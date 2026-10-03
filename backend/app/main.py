import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, prediction, transactions, batch

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FraudShield API",
    version="2.0.0",
    description="AI-powered credit card fraud detection platform."
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "healthy", "service": "FraudShield API"}

@app.get("/api/model")
def model_info():
    metrics_path = Path(__file__).resolve().parents[2] / "models" / "metrics.json"
    metrics = {}
    if metrics_path.exists():
        import json
        metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    return {"name": "Credit Card Fraud Detection", "model": "Class-weighted Logistic Regression",
            "features": 30, "target": "Class", "metrics": metrics}

app.include_router(auth.router)
app.include_router(prediction.router)
app.include_router(transactions.router)
app.include_router(batch.router)
