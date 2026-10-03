from pathlib import Path
import joblib

def test_model_artifact_exists():
    path = Path(__file__).resolve().parents[1] / "models" / "fraud_model.joblib"
    assert path.exists(), "Run python ml/train.py first"

def test_model_bundle():
    path = Path(__file__).resolve().parents[1] / "models" / "fraud_model.joblib"
    bundle = joblib.load(path)
    assert "model" in bundle
    assert "features" in bundle
    assert len(bundle["features"]) == 30
