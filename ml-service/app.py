import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from predict import FertilizerPredictor
from train import run_training

app = FastAPI(
    title="Cardora AI ML Soil & Fertilizer Service",
    description="Microservice for ML-based soil nutrition and fertilizer recommendation",
    version="1.0.0"
)

# Enable CORS for local backend Node.js server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictor
predictor = FertilizerPredictor()

class PredictionRequest(BaseModel):
    nitrogen: float = Field(..., example=40, description="Nitrogen content (mg/kg or ppm)")
    phosphorus: float = Field(..., example=20, description="Phosphorus content (mg/kg or ppm)")
    potassium: float = Field(..., example=80, description="Potassium content (mg/kg or ppm)")
    ph: float = Field(..., example=5.2, description="Soil pH level (0-14)")
    moisture: float = Field(..., example=32, description="Soil moisture percentage (0-100%)")
    temperature: float = Field(..., example=27, description="Ambient temperature (°C)")
    humidity: float = Field(..., example=82, description="Relative humidity (%)")
    rainfall: float = Field(..., example=15, description="Precipitation / rainfall (mm)")
    crop: Optional[str] = Field("cardamom", description="Crop variety / type")

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Cardora AI Soil & Fertilizer Service",
        "model_loaded": predictor.loaded,
        "port": 5001
    }

@app.post("/predict")
def predict_fertilizer(payload: PredictionRequest):
    try:
        data_dict = payload.dict()
        result = predictor.predict(data_dict)
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def train_model():
    try:
        metrics = run_training()
        predictor._load_artifacts()
        return {
            "success": True,
            "message": "Model trained and reloaded successfully.",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

if __name__ == "__main__":
    # Ensure model is trained if not already loaded
    if not predictor.loaded:
        print("[Init] Model artifacts not found on startup. Initiating initial training pipeline...")
        try:
            run_training()
            predictor._load_artifacts()
        except Exception as err:
            print(f"[Warning] Warning during initial training: {err}")

    print("[Start] Starting Cardora ML Service on http://127.0.0.1:5001")
    uvicorn.run("app:app", host="127.0.0.1", port=5001, reload=False)
