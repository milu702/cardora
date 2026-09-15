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

class YieldPredictor:
    def __init__(self):
        self.variety_base_yield = {
            "njallani": 350.0,
            "green gold": 310.0,
            "vanderperiyar": 290.0,
            "mudigere": 240.0,
            "cardamom": 280.0
        }

    def predict_yield(self, input_data: dict) -> dict:
        area = float(input_data.get('area', 5.0))
        plant_age = float(input_data.get('plant_age', 5.0))
        variety = str(input_data.get('variety', 'njallani')).strip().lower()
        n = float(input_data.get('nitrogen', 140))
        p = float(input_data.get('phosphorus', 45))
        k = float(input_data.get('potassium', 180))
        ph = float(input_data.get('ph', 6.2))
        moisture = float(input_data.get('moisture', 72))
        temp = float(input_data.get('temperature', 23))
        rainfall = float(input_data.get('rainfall', 15))
        irrigation = str(input_data.get('irrigation', 'Drip')).strip()

        # Base yield calculation based on cardamom variety
        base = self.variety_base_yield.get(variety, 280.0)

        # Age multiplier (Cardamom reaches peak yield between 4 and 9 years)
        if plant_age < 2:
            age_mult = 0.35
        elif plant_age <= 3:
            age_mult = 0.70
        elif plant_age <= 9:
            age_mult = 1.05
        elif plant_age <= 14:
            age_mult = 0.90
        else:
            age_mult = 0.75

        # Soil & Moisture modifier
        soil_mod = 1.0
        if 5.8 <= ph <= 6.8:
            soil_mod += 0.08
        elif ph < 5.2 or ph > 7.2:
            soil_mod -= 0.15

        if 65 <= moisture <= 80:
            soil_mod += 0.10
        elif moisture < 50 or moisture > 88:
            soil_mod -= 0.18

        if n >= 120 and p >= 40 and k >= 150:
            soil_mod += 0.07

        # Irrigation bonus
        irrigation_mod = 1.12 if "drip" in irrigation.lower() else 1.05

        # Climate modifier
        climate_mod = 1.0
        if 18 <= temp <= 27:
            climate_mod += 0.05
        if rainfall > 30:
            climate_mod -= 0.08

        # Yield per acre prediction (kg/acre)
        yield_per_acre = round(base * age_mult * soil_mod * irrigation_mod * climate_mod, 1)
        yield_per_acre = max(80.0, min(550.0, yield_per_acre))

        # Total expected harvest (kg)
        total_yield = round(yield_per_acre * area, 1)

        # Market value estimation (Avg cardamom price ~ ₹2,100/kg)
        avg_price_per_kg = 2100
        estimated_revenue = round(total_yield * avg_price_per_kg)

        # Recommendations
        recommendations = []
        if plant_age < 3:
            recommendations.append("Young cardamom tillers: Focus on organic root establishment and shade tree management.")
        if moisture < 60:
            recommendations.append("Increase micro-drip irrigation to achieve ideal 65-80% soil hydration for pod swelling.")
        if n < 120 or k < 150:
            recommendations.append("Nutrient boost recommended: Apply organic compost & bio-potash to maximize capsule weight.")
        if not recommendations:
            recommendations.append("Current soil & management practices are aligned for maximum harvest yield!")

        return {
            "yield_per_acre_kg": yield_per_acre,
            "total_harvest_kg": total_yield,
            "estimated_gross_revenue_inr": estimated_revenue,
            "average_price_per_kg": avg_price_per_kg,
            "plant_age_years": plant_age,
            "variety": variety.title(),
            "area_acres": area,
            "confidence": 0.91,
            "recommendations": recommendations
        }

class InvestmentRiskEvaluator:
    def evaluate_risk(self, input_data: dict) -> dict:
        price_per_acre = float(input_data.get('price_per_acre', 2500000))
        health_score = float(input_data.get('health_score', 80))
        soil_suitability = float(input_data.get('soil_suitability', 85))
        weather_suitability = float(input_data.get('weather_suitability', 80))
        is_verified = bool(input_data.get('is_verified', True))
        water_access = bool(input_data.get('water_access', True))
        historical_yield_kg = float(input_data.get('historical_yield_kg', 300))

        # Base Risk Calculation (0 - 100%)
        # Lower risk is better
        risk_score = 30.0

        # Health & Soil Impact
        risk_score += (100 - health_score) * 0.25
        risk_score += (100 - soil_suitability) * 0.20
        risk_score += (100 - weather_suitability) * 0.15

        # Land verification impact
        if not is_verified:
            risk_score += 25.0
        if not water_access:
            risk_score += 15.0

        # Financial Valuation Check
        # Ideal price per acre in Idukki/Wayanad: ₹18-35 Lakhs/acre
        if price_per_acre > 4500000:
            risk_score += 12.0  # Overpriced premium risk

        risk_score = round(max(5.0, min(95.0, risk_score)), 1)

        # Risk Classification
        if risk_score <= 25:
            risk_tier = "Low Risk (Prime Agricultural Investment)"
            risk_color = "Green"
        elif risk_score <= 50:
            risk_tier = "Moderate Risk (Balanced Investment)"
            risk_color = "Yellow"
        elif risk_score <= 75:
            risk_tier = "High Risk (Requires Soil/Legal Remediation)"
            risk_color = "Orange"
        else:
            risk_tier = "Speculative / High Risk"
            risk_color = "Red"

        # Estimated Annual ROI %
        # Cardamom annual net profit per acre ~ ₹3.5L to ₹6.5L
        net_annual_profit = historical_yield_kg * 1800 * 0.60
        roi_percentage = round((net_annual_profit / price_per_acre) * 100, 1)

        # Risk Factor Breakdown
        factors = [
            {"factor": "Land & Title Legal Verification", "status": "Verified" if is_verified else "Pending Verification", "impact": "Low Risk" if is_verified else "High Risk"},
            {"factor": "Soil & Microclimate Viability", "status": f"{round(soil_suitability)}% Match", "impact": "Favorable" if soil_suitability >= 70 else "Needs Attention"},
            {"factor": "Water Resource & Irrigation Infrastructure", "status": "Available" if water_access else "Limited Access", "impact": "Secure" if water_access else "Risk"},
            {"factor": "Historical Yield Return", "status": f"{historical_yield_kg} kg/Acre", "impact": "Strong Yield" if historical_yield_kg >= 250 else "Moderate Yield"}
        ]

        return {
            "risk_score_percent": risk_score,
            "risk_tier": risk_tier,
            "risk_color": risk_color,
            "estimated_annual_roi_percent": roi_percentage,
            "projected_annual_profit_inr": round(net_annual_profit),
            "price_per_acre_inr": price_per_acre,
            "is_title_verified": is_verified,
            "risk_factors": factors,
            "investment_advice": "Strong long-term cardamom asset with stable yield projections." if risk_score < 40 else "Review soil testing report and water sources before finalizing acquisition."
        }

