from pathlib import Path
import os
import joblib
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import BatchAnalysis, User
from ..auth import get_current_user

router = APIRouter(prefix="/api/batch", tags=["CSV Analysis"])
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(Path(__file__).resolve().parents[3] / "models" / "fraud_model.joblib")))
CHUNK_SIZE = 50_000
MAX_UPLOAD_MB = 512


def _validate_columns(columns, features):
    missing = [x for x in features if x not in columns]
    if missing:
        raise HTTPException(status_code=422, detail={"missing_columns": missing})


@router.post("/analyze")
async def analyze_csv(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")

    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]
    features = bundle["features"]
    threshold = float(bundle.get("threshold", .5))

    total = 0
    fraud = 0
    preview = []
    try:
        # Pandas reads the Starlette UploadFile stream in chunks, so large datasets
        # do not need to be loaded into RAM all at once.
        file.file.seek(0)
        for chunk in pd.read_csv(file.file, chunksize=CHUNK_SIZE):
            _validate_columns(chunk.columns, features)
            probs = model.predict_proba(chunk[features])[:, 1]
            predictions = (probs >= threshold).astype(int)
            risk = pd.cut(probs, bins=[-0.01, .4, .8, 1.01], labels=["LOW", "MEDIUM", "HIGH"])

            fraud += int(predictions.sum())
            total += len(chunk)

            if len(preview) < 12:
                p = pd.DataFrame({
                    "Amount": chunk["Amount"].head(12),
                    "Fraud_Probability": probs[:12],
                    "Prediction": predictions[:12],
                    "Risk_Level": risk[:12],
                })
                preview.extend(p.fillna(0).to_dict(orient="records"))

        analysis = BatchAnalysis(
            user_id=user.id,
            filename=file.filename,
            total_rows=total,
            fraud_count=fraud,
            legitimate_count=total - fraud,
            fraud_rate=(fraud / total * 100) if total else 0,
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return {
            "analysis_id": analysis.id,
            "filename": file.filename,
            "total_rows": total,
            "fraud_count": fraud,
            "legitimate_count": total - fraud,
            "fraud_rate": analysis.fraud_rate,
            "preview": preview[:12],
            "upload_limit_mb": MAX_UPLOAD_MB,
            "processed_in_chunks": True,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not analyze CSV: {exc}")


@router.post("/download")
async def download_csv(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")
    content = await file.read()
    df = pd.read_csv(pd.io.common.BytesIO(content))
    bundle = joblib.load(MODEL_PATH)
    features = bundle["features"]
    _validate_columns(df.columns, features)
    probs = bundle["model"].predict_proba(df[features])[:, 1]
    df["Fraud_Probability"] = probs
    df["Prediction"] = (probs >= float(bundle.get("threshold", .5))).astype(int)
    df["Risk_Level"] = pd.cut(probs, bins=[-0.01, .4, .8, 1.01], labels=["LOW", "MEDIUM", "HIGH"])
    out = df.to_csv(index=False)
    return StreamingResponse(iter([out]), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="fraud_predictions.csv"'})
