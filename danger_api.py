import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS


MODEL_PATH = Path(__file__).resolve().parent / "danger_model.pkl"

app = Flask(__name__)
CORS(app)

try:
    model = joblib.load(MODEL_PATH)
except Exception as exc:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {exc}") from exc


@app.get("/predict-safety")
def predict_safety():
    lat_param = request.args.get("lat")
    lon_param = request.args.get("lon")
    hour_param = request.args.get("hour")

    if lat_param is None or lon_param is None or hour_param is None:
        return jsonify({"error": "Query params lat, lon, and hour are required."}), 400

    try:
        lat = float(lat_param)
        lon = float(lon_param)
        hour = int(hour_param)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid query param types. Use lat=float, lon=float, hour=int."}), 400

    features = pd.DataFrame([
        {
            "Latitude": lat,
            "Longitude": lon,
            "Hour": hour,
        }
    ])

    try:
        predicted_value = float(model.predict(features)[0])
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 500

    return jsonify({"danger_score": predicted_value})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
