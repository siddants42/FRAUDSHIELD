from pathlib import Path
import os
import joblib
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Prediction, User
from ..schemas import PredictionRequest, PredictionResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

MODEL_PATH = Path(os.getenv(
    "MODEL_PATH",
    str(Path(__file__).resolve().parents[3] / "models" / "fraud_model.joblib")
))
_bundle = None

def get_bundle():
    global _bundle
    if _bundle is None:
        if not MODEL_PATH.exists():
            raise HTTPException(status_code=500, detail="Model not found. Run the training script first.")
        _bundle = joblib.load(MODEL_PATH)
    return _bundle

def classify(probability: float):
    if probability >= 0.80:
        return "HIGH"
    if probability >= 0.40:
        return "MEDIUM"
    return "LOW"

@router.post("", response_model=PredictionResponse)
def predict(request: PredictionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    bundle = get_bundle()
    features = bundle["features"]
    missing = [x for x in features if x not in request.features]
    if missing:
        raise HTTPException(status_code=422, detail={"missing_features": missing})
    row = pd.DataFrame([[request.features[x] for x in features]], columns=features)
    probability = float(bundle["model"].predict_proba(row)[0, 1])
    is_fraud = probability >= float(bundle.get("threshold", 0.5))
    risk = classify(probability)
    amount = float(request.features.get("Amount", 0))
    item = Prediction(user_id=user.id, amount=amount, fraud_probability=probability,
                      is_fraud=is_fraud, risk_level=risk, features=request.features)
    db.add(item); db.commit(); db.refresh(item)
    return PredictionResponse(is_fraud=is_fraud, fraud_probability=probability,
                              risk_level=risk, amount=amount, prediction_id=item.id)
