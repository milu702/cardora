import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from predict import FertilizerPredictor, YieldPredictor, InvestmentRiskEvaluator
from train import run_training

app = FastAPI(
    title="Cardora AI ML Soil, Yield & Risk Decision Support Microservice",
    description="Microservice for ML-based soil nutrition, cardamom crop yield prediction, and investment risk evaluation",
    version="1.1.0"
)

# Enable CORS for local backend Node.js server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictors
predictor = FertilizerPredictor()
yield_predictor = YieldPredictor()
risk_evaluator = InvestmentRiskEvaluator()

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

class YieldRequest(BaseModel):
    area: float = Field(5.0, description="Plantation area in acres")
    plant_age: float = Field(5.0, description="Age of plants in years")
    variety: Optional[str] = Field("njallani", description="Cardamom cultivar variety")
    nitrogen: Optional[float] = Field(140, description="Soil nitrogen")
    phosphorus: Optional[float] = Field(45, description="Soil phosphorus")
    potassium: Optional[float] = Field(180, description="Soil potassium")
    ph: Optional[float] = Field(6.2, description="Soil pH")
    moisture: Optional[float] = Field(72, description="Soil moisture %")
    temperature: Optional[float] = Field(23, description="Temperature °C")
    rainfall: Optional[float] = Field(15, description="Rainfall mm")
    irrigation: Optional[str] = Field("Drip", description="Irrigation method")

class RiskRequest(BaseModel):
    price_per_acre: float = Field(2500000, description="Plot price per acre in INR")
    health_score: Optional[float] = Field(80, description="Plantation health score 0-100")
    soil_suitability: Optional[float] = Field(85, description="Soil suitability score 0-100")
    weather_suitability: Optional[float] = Field(80, description="Weather suitability score 0-100")
    is_verified: Optional[bool] = Field(True, description="Title Pattayam verified status")
    water_access: Optional[bool] = Field(True, description="Irrigation water access")
    historical_yield_kg: Optional[float] = Field(300, description="Historical annual yield per acre in kg")

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Cardora AI Soil, Yield & Risk Service",
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

@app.post("/predict-yield")
def predict_yield(payload: YieldRequest):
    try:
        data_dict = payload.dict()
        result = yield_predictor.predict_yield(data_dict)
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-investment-risk")
def evaluate_investment_risk(payload: RiskRequest):
    try:
        data_dict = payload.dict()
        result = risk_evaluator.evaluate_risk(data_dict)
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
