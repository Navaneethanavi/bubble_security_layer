import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

# Import multiple ML classifiers
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

app = Flask(__name__)
CORS(app)

CSV_PATH = "telemetry_data.csv"

if not os.path.exists(CSV_PATH):
    raise FileNotFoundError(f"Critical Error: Ensure your dataset is saved exactly as '{CSV_PATH}' in this folder.")

# =====================================================
# 1. LOAD & TRAIN MULTIPLE MODEL CONFIGURATIONS
# =====================================================
df = pd.read_csv(CSV_PATH)

def encode_weather(w_str):
    mapping = {"Clear": 0, "Rain": 1, "Fog": 2}
    return mapping.get(str(w_str).strip(), 0)

def encode_road(r_str):
    mapping = {"Normal": 0, "Uphill": 1, "Downhill": 2, "Good": 0, "Dry": 0, "Wet": 1, "Ice": 3}
    return mapping.get(str(r_str).strip(), 0)

# Preprocessing categorical strings to numeric features using EXACT columns
df['weather_encoded'] = df['weather'].apply(encode_weather)
df['road_cond_encoded'] = df['road_condition'].apply(encode_road)

# Feature matrix mapped precisely to your column schema names
feature_cols = [
    'energy_input', 'ethical_emergency', 'regulatory_speed', 'traffic_density', 
    'weather_encoded', 'road_cond_encoded', 'battery_status', 
    'current_speed', 'guardian_score'
]

X = df[feature_cols]
y = df['approved']

print("🤖 Training Multi-Model Supervised ML Systems on exact column mapping...")

# Model 1: Random Forest
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X, y)

# Model 2: Logistic Regression
lr_model = LogisticRegression(max_iter=1000, random_state=42)
lr_model.fit(X, y)

# Model 3: XGBoost
xgb_model = XGBClassifier(n_estimators=100, random_state=42, eval_metric='logloss')
xgb_model.fit(X, y)

print("🎯 All 3 Models (Random Forest, Logistic Regression, XGBoost) trained successfully!")

# =====================================================
# 2. LOCAL WORKBENCH DB CONNECTOR
# =====================================================
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",          
        password="SetPass@1234",  # Put your MySQL Workbench password here
        database="guardian_system"
    )

# =====================================================
# 3. MULTI-MODEL API ENDPOINT
# =====================================================
@app.route('/api/telemetry', methods=['POST'])
def process_telemetry():
    data = request.json
    
    # Map React keys to exact dataset property definitions
    energy_input = int(data.get('energyInput', 70))
    ethical_emergency = int(data.get('ethicalEmergency', 0))
    regulatory_speed = int(data.get('regulatorySpeed', 80))
    traffic_density = int(data.get('trafficDensity', 40))
    weather_str = data.get('weather', 'Clear')
    road_condition_str = data.get('roadCondition', 'Normal')
    battery_status = int(data.get('battery', 70))
    current_speed = int(data.get('currentSpeed', 60))
    guardian_score_val = float(data.get('guardianScore', 100.0))

    # Convert text properties to machine learning numeric format
    weather_encoded = encode_weather(weather_str)
    road_cond_encoded = encode_road(road_condition_str)

    live_data_point = pd.DataFrame([{
        'energy_input': energy_input,
        'ethical_emergency': ethical_emergency,
        'regulatory_speed': regulatory_speed,
        'traffic_density': traffic_density,
        'weather_encoded': weather_encoded,
        'road_cond_encoded': road_cond_encoded,
        'battery_status': battery_status,
        'current_speed': current_speed,
        'guardian_score': guardian_score_val
    }])

    # 🔮 Model 1: Random Forest Inference
    rf_pred = int(rf_model.predict(live_data_point)[0])
    rf_conf = float(rf_model.predict_proba(live_data_point)[0][rf_pred] * 100)

    # 🔮 Model 2: Logistic Regression Inference
    lr_pred = int(lr_model.predict(live_data_point)[0])
    lr_conf = float(lr_model.predict_proba(live_data_point)[0][lr_pred] * 100)

    # 🔮 Model 3: XGBoost Inference
    xgb_pred = int(xgb_model.predict(live_data_point)[0])
    xgb_conf = float(xgb_model.predict_proba(live_data_point)[0][xgb_pred] * 100)

    # Consensus output via simple majority rules
    consensus_decision = 1 if (rf_pred + lr_pred + xgb_pred) >= 2 else 0

    # 💾 Save matching parameters directly back into MySQL log table
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = """
            INSERT INTO telemetry_logs 
            (energy_input, ethical_emergency, regulatory_speed, traffic_density, weather, road_condition, battery_status, current_speed, guardian_score, approved)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            energy_input, ethical_emergency, regulatory_speed, traffic_density, 
            weather_str, road_condition_str, battery_status, current_speed, 
            guardian_score_val, consensus_decision
        )
        cursor.execute(insert_query, values)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as db_err:
        print(f"Database write exception: {db_err}")

    # Return structured dynamic evaluations matrix to frontend dashboard UI
    return jsonify({
        "status": "success",
        "models": {
            "random_forest": {"approved": True if rf_pred == 1 else False, "confidence": round(rf_conf, 1)},
            "logistic_regression": {"approved": True if lr_pred == 1 else False, "confidence": round(lr_conf, 1)},
            "xgboost": {"approved": True if xgb_pred == 1 else False, "confidence": round(xgb_conf, 1)}
        }
    })

if __name__ == '__main__':
    app.run(host='localhost', port=3001, debug=True)