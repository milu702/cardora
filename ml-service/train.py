import os
import json
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import xgboost as xgb

def run_training():
    print("=" * 60)
    print("CARDORA AI - FERTILIZER RECOMMENDATION MODEL TRAINING")
    print("=" * 60)

    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, 'dataset', 'fertilizer_data.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load Dataset
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset file not found at: {dataset_path}")

    print(f"[Dataset] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"[Dataset] Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")

    # 2. Validate Required Columns
    required_cols = [
        'nitrogen', 'phosphorus', 'potassium', 'ph', 'moisture',
        'temperature', 'humidity', 'rainfall', 'crop', 'fertilizer'
    ]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns in dataset: {missing_cols}")

    # 3. Handle Missing & Clean Invalid Values
    initial_rows = len(df)
    df.dropna(subset=required_cols, inplace=True)
    
    # Strip whitespace for text columns
    df['crop'] = df['crop'].astype(str).str.strip().str.lower()
    df['fertilizer'] = df['fertilizer'].astype(str).str.strip()

    # Filter invalid numerical ranges
    df = df[
        (df['nitrogen'] >= 0) &
        (df['phosphorus'] >= 0) &
        (df['potassium'] >= 0) &
        (df['ph'] >= 0) & (df['ph'] <= 14) &
        (df['moisture'] >= 0) & (df['moisture'] <= 100) &
        (df['humidity'] >= 0) & (df['humidity'] <= 100)
    ]
    print(f"[Clean] Cleaned dataset: {len(df)} valid records retained ({initial_rows - len(df)} removed)")

    # 4. Encode Categorical Variables
    crop_encoder = LabelEncoder()
    df['crop_encoded'] = crop_encoder.fit_transform(df['crop'])

    label_encoder = LabelEncoder()
    df['target'] = label_encoder.fit_transform(df['fertilizer'])

    print(f"[Target] Target Fertilizer Classes ({len(label_encoder.classes_)}): {list(label_encoder.classes_)}")

    # 5. Feature Selection
    feature_cols = [
        'nitrogen', 'phosphorus', 'potassium', 'ph',
        'moisture', 'temperature', 'humidity', 'rainfall', 'crop_encoded'
    ]
    X = df[feature_cols]
    y = df['target']

    # Scale numerical features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 6. Train-Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42, stratify=y if len(y.unique()) > 1 else None
    )

    print(f"[Split] Train split: {len(X_train)} samples | Test split: {len(X_test)} samples")

    # 7. Model Training & Baseline Comparison
    print("\n--- Model Training & Comparison ---")

    # Baseline: Random Forest
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)

    rf_acc = accuracy_score(y_test, rf_preds)
    rf_f1 = f1_score(y_test, rf_preds, average='weighted')
    print(f"Baseline [Random Forest] -> Accuracy: {rf_acc * 100:.2f}% | F1-Score: {rf_f1:.4f}")

    # Primary Model: XGBoost Classifier
    xgb_model = xgb.XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        eval_metric='mlogloss'
    )
    xgb_model.fit(X_train, y_train)
    xgb_preds = xgb_model.predict(X_test)

    xgb_acc = accuracy_score(y_test, xgb_preds)
    xgb_prec = precision_score(y_test, xgb_preds, average='weighted', zero_division=0)
    xgb_rec = recall_score(y_test, xgb_preds, average='weighted', zero_division=0)
    xgb_f1 = f1_score(y_test, xgb_preds, average='weighted', zero_division=0)
    cm = confusion_matrix(y_test, xgb_preds)

    print(f"Primary [XGBoost] -> Accuracy: {xgb_acc * 100:.2f}% | Precision: {xgb_prec:.4f} | Recall: {xgb_rec:.4f} | F1-Score: {xgb_f1:.4f}")
    print("\nConfusion Matrix (XGBoost):")
    print(cm)

    # 8. Save Trained Model & Pipeline Artifacts
    best_model = xgb_model if xgb_acc >= rf_acc else rf_model
    model_name = "XGBoost" if xgb_acc >= rf_acc else "RandomForest"

    model_path = os.path.join(models_dir, 'fertilizer_model.pkl')
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    crop_encoder_path = os.path.join(models_dir, 'crop_encoder.pkl')
    label_encoder_path = os.path.join(models_dir, 'label_encoder.pkl')
    metrics_path = os.path.join(models_dir, 'evaluation_metrics.json')

    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(crop_encoder, crop_encoder_path)
    joblib.dump(label_encoder, label_encoder_path)

    metrics_data = {
        "selected_model": model_name,
        "xgboost_accuracy": round(float(xgb_acc), 4),
        "xgboost_f1": round(float(xgb_f1), 4),
        "random_forest_accuracy": round(float(rf_acc), 4),
        "random_forest_f1": round(float(rf_f1), 4),
        "confusion_matrix": cm.tolist(),
        "feature_names": feature_cols,
        "classes": list(label_encoder.classes_)
    }

    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)

    print(f"\n[OK] Selected Model ({model_name}) & Artifacts successfully saved to: {models_dir}")
    print("=" * 60)

    # Sanity Check Loading
    loaded_model = joblib.load(model_path)
    print(f"[Sanity Check] Successfully reloaded {loaded_model.__class__.__name__} model.")
    return metrics_data

if __name__ == '__main__':
    run_training()

