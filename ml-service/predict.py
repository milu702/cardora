import os
import numpy as np
import pandas as pd
import joblib

class FertilizerPredictor:
    def __init__(self, models_dir=None):
        if models_dir is None:
            models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')

        self.model_path = os.path.join(models_dir, 'fertilizer_model.pkl')
        self.scaler_path = os.path.join(models_dir, 'scaler.pkl')
        self.crop_encoder_path = os.path.join(models_dir, 'crop_encoder.pkl')
        self.label_encoder_path = os.path.join(models_dir, 'label_encoder.pkl')

        self.loaded = False
        self._load_artifacts()

    def _load_artifacts(self):
        if not (os.path.exists(self.model_path) and os.path.exists(self.scaler_path)
                and os.path.exists(self.crop_encoder_path) and os.path.exists(self.label_encoder_path)):
            print("[Warning] ML Artifacts not found. Training required.")
            self.loaded = False
            return

        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.crop_encoder = joblib.load(self.crop_encoder_path)
            self.label_encoder = joblib.load(self.label_encoder_path)
            self.loaded = True
            print("[OK] FertilizerPredictor loaded model artifacts successfully.")
        except Exception as e:
            print(f"[Error] Error loading model artifacts: {e}")
            self.loaded = False

    def predict(self, input_data: dict) -> dict:
        if not self.loaded:
            self._load_artifacts()
            if not self.loaded:
                raise RuntimeError("ML model is not trained yet. Please run python train.py first.")

        # Extract features with safe defaults
        n = float(input_data.get('nitrogen', 40))
        p = float(input_data.get('phosphorus', 20))
        k = float(input_data.get('potassium', 80))
        ph = float(input_data.get('ph', 5.5))
        moisture = float(input_data.get('moisture', 35))
        temp = float(input_data.get('temperature', 25))
        humidity = float(input_data.get('humidity', 80))
        rainfall = float(input_data.get('rainfall', 15))
        crop = str(input_data.get('crop', 'cardamom')).strip().lower()

        # Encode crop
        if crop in self.crop_encoder.classes_:
            crop_encoded = self.crop_encoder.transform([crop])[0]
        else:
            # Fallback to default class if crop not in encoder
            crop_encoded = self.crop_encoder.transform([self.crop_encoder.classes_[0]])[0]

        # Prepare feature vector: [nitrogen, phosphorus, potassium, ph, moisture, temperature, humidity, rainfall, crop_encoded]
        raw_features = np.array([[n, p, k, ph, moisture, temp, humidity, rainfall, crop_encoded]])
        scaled_features = self.scaler.transform(raw_features)

        # Model Prediction & Probabilities
        pred_idx = self.model.predict(scaled_features)[0]
        predicted_fertilizer = str(self.label_encoder.inverse_transform([pred_idx])[0])

        confidence = 0.85
        if hasattr(self.model, 'predict_proba'):
            probabilities = self.model.predict_proba(scaled_features)[0]
            confidence = float(np.max(probabilities))
            confidence = round(confidence, 2)

        # Compute Soil Status
        soil_status = {
            "nitrogen": "Low" if n < 30 else ("Good" if n <= 60 else "High"),
            "phosphorus": "Low" if p < 25 else ("Good" if p <= 50 else "High"),
            "potassium": "Low" if k < 40 else ("Good" if k <= 80 else "High"),
            "ph": f"Acidic ({ph})" if ph < 5.5 else (f"Optimal ({ph})" if ph <= 6.8 else f"Alkaline ({ph})"),
            "moisture": f"{round(moisture)}%"
        }

        # Determine Nutrient Priority
        nutrient_priority = []
        if soil_status["nitrogen"] == "Low":
            nutrient_priority.append("Nitrogen")
        if soil_status["phosphorus"] == "Low":
            nutrient_priority.append("Phosphorus")
        if soil_status["potassium"] == "Low":
            nutrient_priority.append("Potassium")
        if not nutrient_priority:
            nutrient_priority = ["Balanced Maintenance (NPK)"]

        # Compute Weather Advisory based on environmental conditions
        weather_advice_parts = []
        if rainfall > 20:
            weather_advice_parts.append(f"Moderate to heavy rainfall ({rainfall} mm) expected. Split fertilizer into 2-3 soil applications to avoid nutrient leaching.")
        elif rainfall > 5:
            weather_advice_parts.append(f"Favorable light rainfall ({rainfall} mm) forecast. Ideal conditions for root absorption after application.")
        else:
            weather_advice_parts.append("Low rainfall forecast. Ensure soil irrigation immediately following fertilizer application.")

        if humidity > 80:
            weather_advice_parts.append(f"High relative humidity ({humidity}%). High moisture environment boosts root assimilation.")
        
        if temp > 30:
            weather_advice_parts.append(f"Warm ambient temperature ({temp}°C). Apply fertilizers in early morning or late afternoon to prevent evaporation stress.")

        weather_advice = " ".join(weather_advice_parts)

        # Farmer Friendly Explanation
        recommendation_text = f"Apply {predicted_fertilizer} to optimize crop soil nutrition. "
        if "Nitrogen" in nutrient_priority:
            recommendation_text += "Nitrogen levels are currently low; boost tiller vegetative growth and leaf greenness. "
        if "Phosphorus" in nutrient_priority:
            recommendation_text += "Phosphorus levels are low; essential for root establishment and capsule flowering. "
        if "Potassium" in nutrient_priority:
            recommendation_text += "Potassium levels require support for pod size, weight, and drought resistance. "

        return {
            "fertilizer": predicted_fertilizer,
            "confidence": confidence,
            "nutrient_priority": nutrient_priority,
            "soil_status": soil_status,
            "weather_status": {
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "rainfall": round(rainfall, 1)
            },
            "recommendation": recommendation_text.strip(),
            "weather_advice": weather_advice
        }
