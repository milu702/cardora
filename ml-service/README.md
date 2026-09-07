# 🤖 Cardora AI - Python ML Soil & Fertilizer Service

This is the standalone Python Machine Learning microservice for **Cardora AI Soil & Fertilizer Advisor**.

It trains a real machine-learning classifier (**XGBoost** compared against **Random Forest**) to predict optimal fertilizer requirements based on soil parameters (N, P, K, pH, Moisture) and live weather telemetry (Temperature, Humidity, Rainfall).

---

## 📁 Directory Architecture

```text
ml-service/
│
├── dataset/
│   └── fertilizer_data.csv        # Configurable training dataset
│
├── models/
│   ├── fertilizer_model.pkl       # Saved trained ML model (XGBoost / Random Forest)
│   ├── scaler.pkl                 # StandardScaler feature normalizer
│   ├── crop_encoder.pkl           # LabelEncoder for crop types
│   ├── label_encoder.pkl          # LabelEncoder for target fertilizer classes
│   └── evaluation_metrics.json    # Accuracy, F1-Score, Confusion Matrix metrics
│
├── train.py                        # Model training & evaluation pipeline script
├── predict.py                      # Inference engine for structured recommendation output
├── app.py                          # FastAPI service (Runs on http://127.0.0.1:5001)
├── requirements.txt                # Python dependencies
└── README.md                       # Service documentation
```

---

## ⚙️ How to Train the Model

1. Ensure Python 3.9+ is installed.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the training script:
   ```bash
   python train.py
   ```
   This will:
   - Load `dataset/fertilizer_data.csv`.
   - Validate and clean dataset values.
   - Encode categorical features.
   - Perform train-test split (80/20).
   - Train and evaluate both **XGBoost Classifier** and **Random Forest Classifier**.
   - Output evaluation metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix).
   - Save the trained artifacts into the `models/` directory.

---

## 🚀 How to Start the ML Service

Start the FastAPI microservice on port 5001:

```bash
python app.py
```

The service will run on `http://127.0.0.1:5001`.

---

## 🔌 API Specification

### 1. Healthcheck
- **Endpoint**: `GET /health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "Cardora AI Soil & Fertilizer Service",
    "model_loaded": true,
    "port": 5001
  }
  ```

### 2. Predict Fertilizer
- **Endpoint**: `POST /predict`
- **Payload**:
  ```json
  {
    "nitrogen": 40,
    "phosphorus": 20,
    "potassium": 80,
    "ph": 5.2,
    "moisture": 32,
    "temperature": 27,
    "humidity": 82,
    "rainfall": 15,
    "crop": "cardamom"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "fertilizer": "17-17-17 NPK",
    "confidence": 0.87,
    "nutrient_priority": ["Nitrogen", "Phosphorus"],
    "soil_status": {
      "nitrogen": "Good",
      "phosphorus": "Low",
      "potassium": "Good",
      "ph": "Acidic (5.2)",
      "moisture": "32%"
    },
    "weather_status": {
      "temperature": 27,
      "humidity": 82,
      "rainfall": 15
    },
    "recommendation": "Apply 17-17-17 NPK to optimize crop soil nutrition...",
    "weather_advice": "Favorable light rainfall (15 mm) forecast. Ideal conditions for root absorption..."
  }
  ```

---

## 🌾 Custom Cardamom Dataset Notice

The dataset location `ml-service/dataset/fertilizer_data.csv` is completely decoupled from the ML model pipeline.
To train using custom cardamom experimental trial records:
1. Replace `ml-service/dataset/fertilizer_data.csv` with your verified CSV data.
2. Re-run `python train.py`.
