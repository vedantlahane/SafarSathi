# main.py

import os
from pathlib import Path
import logging
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import joblib
import shap
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('geospatial_engine.log')
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="YatraX Geospatial ML Engine", version="11.0.0")
logger.info("FastAPI application initialized - YatraX Geospatial ML Engine v11.0.0 (RF + SHAP)")

# =========================================================
# 1. LOAD ARTIFACTS
# =========================================================
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'
MODEL_PATH = BASE_DIR / "rf_safety_regressor.pkl"

# Global Variables
full_map = None
base_gdf = None
model = None
explainer = None

FEATURE_COLS = [
    "pm25_mean",
    "vcf_mean",
    "viirs_annual_mean",
    "elevation_mean",
    "tri_mean",
]

try:
    logger.info("Loading Geographic Artifacts...")
    full_map = gpd.read_parquet(DATA_DIR / 'punjab_final_scored.parquet')
    logger.info(f"Loaded full map with {len(full_map):,} records")
    
    # We need the geometry + the 5 features + identification columns
    cols_to_keep = ['shrid2', 'geometry', 'village_name', 'district_name'] + FEATURE_COLS
    
    base_gdf = full_map.drop_duplicates(subset=['shrid2'])[cols_to_keep]
    
    # Fill missing values for the features to avoid prediction errors
    for col in FEATURE_COLS:
        if col in base_gdf.columns:
            base_gdf[col] = base_gdf[col].fillna(0)
    
    logger.info(f"Base geometric map created with {len(base_gdf):,} unique polygons")
    
    # FORCE SPATIAL INDEX GENERATION ON BOOT
    _ = base_gdf.sindex 
    logger.info("Spatial index generated successfully")

except Exception as e:
    logger.error(f"Map Load Error: {e}", exc_info=True)
    base_gdf = None

try:
    logger.info("Loading Random Forest Model...")
    model = joblib.load(MODEL_PATH)
    
    # Create TreeExplainer for SHAP
    logger.info("Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(model)
    
    logger.info("Model and Explainer loaded successfully.")
except Exception as e:
    logger.error(f"Model Load Error: {e}", exc_info=True)
    model = None
    explainer = None

# =========================================================
# 2. INPUT CONTRACT
# =========================================================
class LocationRequest(BaseModel):
    lat: float
    lon: float
    local_hour: int 

# =========================================================
# 3. FASTAPI ENDPOINT
# =========================================================
@app.post("/safety/evaluate")
def evaluate_location(req: LocationRequest):
    logger.info(f"Received evaluation request - Lat: {req.lat}, Lon: {req.lon}, Local Hour: {req.local_hour}")
    
    if base_gdf is None or model is None or explainer is None:
        logger.error("Intelligence Engine Offline: Artifacts Missing")
        raise HTTPException(status_code=500, detail="Intelligence Engine Offline: Artifacts Missing.")
        
    user_point = Point(req.lon, req.lat)
    logger.debug(f"Created Point geometry: {user_point}")
    
    # ---------------------------------------------------------
    # STEP 1: O(1) SPATIAL INDEX LOOKUP
    # ---------------------------------------------------------
    logger.debug("STEP 1: Performing spatial index lookup")
    possible_matches_index = list(base_gdf.sindex.intersection(user_point.bounds))
    possible_matches = base_gdf.iloc[possible_matches_index]
    logger.debug(f"Spatial index returned {len(possible_matches)} possible matches")
    
    precise_matches = possible_matches[possible_matches.geometry.contains(user_point)]
    logger.debug(f"Precise polygon intersection: {len(precise_matches)} matches")
    
    if precise_matches.empty:
        logger.warning(f"Point ({req.lat}, {req.lon}) is OUT_OF_BOUNDS")
        return {
            "status": "OUT_OF_BOUNDS",
            "spatial_context": None,
            "ml_baseline": None,
            "infrastructure": None
        }
        
    zone_base = precise_matches.iloc[0]
    shrid2_id = zone_base.get('shrid2')
    logger.debug(f"Matched zone shrid2_id: {shrid2_id}")
    
    raw_district = zone_base.get('district_name')
    district = "Unknown" if pd.isna(raw_district) else str(raw_district).title()
    
    raw_village = zone_base.get('village_name')
    village = "Unknown" if pd.isna(raw_village) else str(raw_village).title()
    
    raw_viirs = zone_base.get('viirs_annual_mean', 0.0)
    base_viirs = 0.0 if pd.isna(raw_viirs) else float(raw_viirs)
    
    logger.info(f"Location identified: District={district}, Village={village}, VIIRS={base_viirs:.4f}")
    
    # ---------------------------------------------------------
    # STEP 2: INFRASTRUCTURE CONTEXT
    # ---------------------------------------------------------
    logger.debug("STEP 2: Calculating infrastructure context")
    is_night = req.local_hour < 6 or req.local_hour >= 19
    is_unlit = base_viirs < 0.5
    
    logger.debug(f"Infrastructure assessment - Night: {is_night}, Unlit: {is_unlit}, Penalty Active: {is_night and is_unlit}")
    
    infrastructure_payload = {
        "viirs_nightlight_score": round(base_viirs, 4),
        "is_unlit": is_unlit,
        "is_night": is_night,
        "socio_temporal_penalty_active": is_night and is_unlit
    }
    
    # ---------------------------------------------------------
    # STEP 3: ML PREDICTION & SHAP EXPLAINABILITY
    # ---------------------------------------------------------
    logger.debug("STEP 3: Running ML Prediction and SHAP")
    
    # Extract features for this zone
    feature_values = []
    for col in FEATURE_COLS:
        val = zone_base.get(col, 0.0)
        feature_values.append(0.0 if pd.isna(val) else float(val))
        
    input_df = pd.DataFrame([feature_values], columns=FEATURE_COLS)
    
    # Predict
    prediction = model.predict(input_df)[0]
    
    # SHAP Values
    shap_values_raw = explainer.shap_values(input_df, check_additivity=False)
    
    # Depending on scikit-learn/shap version, shap_values might be a list or array
    if isinstance(shap_values_raw, list):
        shap_values_array = shap_values_raw[0][0]
    else:
        # 1D or 2D array
        if len(shap_values_raw.shape) > 1:
            shap_values_array = shap_values_raw[0]
        else:
            shap_values_array = shap_values_raw
            
    expected_value = explainer.expected_value
    if isinstance(expected_value, np.ndarray) or isinstance(expected_value, list):
        expected_value = expected_value[0]
    
    # Map SHAP values to feature names
    shap_dict = {}
    for i, col in enumerate(FEATURE_COLS):
        shap_dict[col] = round(float(shap_values_array[i]), 4)

    ml_payload = {
        "status": "NORMAL",  # Kept for backward compatibility
        "predicted_score": round(float(prediction), 4),
        "shap_base_value": round(float(expected_value), 4),
        "shap_values": shap_dict
    }

    # ==========================================================
    # FINAL RESPONSE
    # ==========================================================
    return {
        "status": "SUCCESS",
        "spatial_context": {
            "village": village,
            "district": district
        },
        "ml_baseline": ml_payload,
        "infrastructure": infrastructure_payload
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )