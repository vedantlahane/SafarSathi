# api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import os
from pathlib import Path

app = FastAPI(title="SafarSathi Geospatial ML Engine", version="10.0.0")

# ==========================================
# 1. LOCAL MAP LOADING
# ==========================================
print("Booting Geospatial ML Engine...")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'

try:
    print("Loading Geographic Artifacts...")
    full_map = gpd.read_parquet(DATA_DIR / 'punjab_final_scored.parquet')
    base_gdf = full_map.drop_duplicates(subset=['shrid2'])[['shrid2', 'geometry', 'village_name', 'district_name', 'viirs_annual_mean']]
    
    scored_df = pd.read_parquet(DATA_DIR / 'punjab_lof_anomalies.parquet')
    latest_year = scored_df['year'].max()
    scored_df = scored_df[scored_df['year'] == latest_year].copy()
    
    if 'geometry' in scored_df.columns:
        scored_df = scored_df.drop(columns=['geometry'])
        
    scored_gdf = base_gdf[['shrid2', 'geometry']].merge(scored_df, on='shrid2', how='inner')
    print(f"Maps Loaded Successfully. Base: {len(base_gdf):,} | Scored: {len(scored_gdf):,}")
except Exception as e:
    print(f"Map Load Error: {e}")
    base_gdf, scored_gdf = None, None

# ==========================================
# 2. INPUT CONTRACT
# ==========================================
class LocationRequest(BaseModel):
    lat: float
    lon: float
    local_hour: int 

# ==========================================
# 3. FASTAPI ENDPOINT
# ==========================================
@app.post("/safety/evaluate")
def evaluate_location(req: LocationRequest):
    if base_gdf is None or scored_gdf is None:
        raise HTTPException(status_code=500, detail="Intelligence Engine Offline: Artifacts Missing.")
        
    user_point = Point(req.lon, req.lat)
    
    # ---------------------------------------------------------
    # STEP 1: BASE MAP CHECK (Are they in Punjab?)
    # ---------------------------------------------------------
    base_match = base_gdf[base_gdf.geometry.contains(user_point)]
    if base_match.empty:
        return {
            "status": "OUT_OF_BOUNDS",
            "spatial_context": None,
            "ml_baseline": None,
            "infrastructure": None
        }
        
    zone_base = base_match.iloc[0]
    
    raw_district = zone_base.get('district_name')
    district = "Unknown" if pd.isna(raw_district) else str(raw_district).title()
    
    raw_village = zone_base.get('village_name')
    village = "Unknown" if pd.isna(raw_village) else str(raw_village).title()
    
    raw_viirs = zone_base.get('viirs_annual_mean', 0.0)
    base_viirs = 0.0 if pd.isna(raw_viirs) else float(raw_viirs)
    
    # ---------------------------------------------------------
    # STEP 2: INFRASTRUCTURE CONTEXT
    # ---------------------------------------------------------
    is_night = req.local_hour < 6 or req.local_hour > 19
    is_unlit = base_viirs < 0.5
    
    infrastructure_payload = {
        "viirs_nightlight_score": round(base_viirs, 4),
        "is_unlit": is_unlit,
        "is_night": is_night,
        "socio_temporal_penalty_active": is_night and is_unlit
    }
    
    # ---------------------------------------------------------
    # STEP 3: ML BASELINE CHECK
    # ---------------------------------------------------------
    scored_match = scored_gdf[scored_gdf.geometry.contains(user_point)]
    
    if scored_match.empty:
        ml_payload = {
            "status": "UNMAPPED_TERRAIN",
            "is_anomaly": False
        }
    else:
        zone_scored = scored_match.iloc[0]
        raw_status = zone_scored.get('village_status', 'NORMAL')
        status_val = "NORMAL" if pd.isna(raw_status) else str(raw_status)
        
        ml_payload = {
            "status": status_val,
            "is_anomaly": bool(zone_scored.get('hazard_zone', 0) == 1)
        }
        
    # ---------------------------------------------------------
    # FINAL OUTPUT CONTRACT (For Node.js to consume)
    # ---------------------------------------------------------
    return {
        "status": "SUCCESS",
        "spatial_context": {
            "village": village,
            "district": district
        },
        "ml_baseline": ml_payload,
        "infrastructure": infrastructure_payload
    }