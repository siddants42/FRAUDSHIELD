from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Prediction, BatchAnalysis, User
from ..auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("")
def history(limit: int = 50, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(Prediction).filter(Prediction.user_id == user.id).order_by(Prediction.id.desc()).limit(min(limit, 200)).all()
    return [{
        "id": x.id, "amount": x.amount, "fraud_probability": x.fraud_probability,
        "is_fraud": x.is_fraud, "risk_level": x.risk_level, "created_at": x.created_at.isoformat()
    } for x in rows]

@router.get("/stats")
def stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Prediction).filter(Prediction.user_id == user.id)
    total = q.count()
    fraud = q.filter(Prediction.is_fraud == True).count()
    avg_amount = q.with_entities(func.avg(Prediction.amount)).scalar() or 0
    return {"total_predictions": total, "fraud_predictions": fraud,
            "legitimate_predictions": total - fraud,
            "fraud_rate_percent": (fraud / total * 100) if total else 0,
            "average_amount": float(avg_amount)}

@router.get("/batches")
def batches(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(BatchAnalysis).filter(BatchAnalysis.user_id == user.id).order_by(BatchAnalysis.id.desc()).limit(20).all()
    return [{"id": x.id, "filename": x.filename, "total_rows": x.total_rows,
             "fraud_count": x.fraud_count, "legitimate_count": x.legitimate_count,
             "fraud_rate": x.fraud_rate, "created_at": x.created_at.isoformat()} for x in rows]
