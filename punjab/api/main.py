# api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import requests
import os
from pathlib import Path

app = FastAPI(title="SafarSathi Production API", version="9.0.0")

# ==========================================
# 1. LOCAL PATH RESOLUTION & MAP LOADING
# ==========================================
print("🚀 Booting SafarSathi Intelligence Engine...")

# Automatically find the /data folder relative to this script
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'

try:
    print("Loading Base and Scored Maps...")
    full_map = gpd.read_parquet(DATA_DIR / 'punjab_final_scored.parquet')
    base_gdf = full_map.drop_duplicates(subset=['shrid2'])[['shrid2', 'geometry', 'village_name', 'district_name', 'viirs_annual_mean']]
    
    scored_df = pd.read_parquet(DATA_DIR / 'punjab_lof_anomalies.parquet')
    latest_year = scored_df['year'].max()
    scored_df = scored_df[scored_df['year'] == latest_year].copy()
    
    if 'geometry' in scored_df.columns:
        scored_df = scored_df.drop(columns=['geometry'])
        
    scored_gdf = base_gdf[['shrid2', 'geometry']].merge(scored_df, on='shrid2', how='inner')
    print(f"✅ Maps Loaded Successfully. Base: {len(base_gdf):,} | Scored: {len(scored_gdf):,}")
except Exception as e:
    print(f"❌ Map Load Error: {e}")
    print(f"Ensure your .parquet files are inside: {DATA_DIR}")
    base_gdf, scored_gdf = None, None

# ==========================================
# 2. LIVE FETCHERS
# ==========================================
IMD_WARNING_MAP = {
    "1": "No Warning", "2": "Heavy Rain", "3": "Heavy Snow",
    "4": "Thunderstorm & Lightning", "5": "Hailstorm", "6": "Dust Storm",
    "7": "Dust Raising Winds", "8": "Strong Surface Winds", "9": "Heat Wave",
    "10": "Hot Day", "11": "Warm Night", "12": "Cold Wave", "13": "Cold Day",
    "14": "Ground Frost", "15": "Fog", "16": "Very Heavy Rain", "17": "Extremely Heavy Rain"
}

def fetch_live_imd_warning(district_name):
    # Free tier IMD wrapper API endpoint
    headers = {"Authorization": "Bearer 5b94d5e39dc7f1cdfbc1e079a53566814c47727a4baea7f7e0e6a93eb1fd8ae5"}
    try:
        res = requests.get("https://api.imd.gov.in/api/v1/districtwarning", headers=headers, timeout=2.0)
        if res.status_code == 200:
            for entry in res.json():
                if str(entry.get("District", "")).lower() == district_name.lower(): return entry
    except: pass
    return None

def fetch_live_multivariate_aqi(lat, lon):
    try:
        res = requests.get(f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone", timeout=2.0)
        if res.status_code == 200: return res.json().get('current', {})
    except: pass
    return {}

# ==========================================
# 3. FASTAPI ENDPOINT
# ==========================================
class LocationRequest(BaseModel):
    lat: float
    lon: float
    local_hour: int 

@app.post("/check_safety")
def check_location_safety(req: LocationRequest):
    if base_gdf is None or scored_gdf is None:
        raise HTTPException(status_code=500, detail="Intelligence Engine Offline: Artifacts Missing.")
        
    user_point = Point(req.lon, req.lat)
    
    # Check 1: Out of Bounds
    base_match = base_gdf[base_gdf.geometry.contains(user_point)]
    if base_match.empty:
        return {"status": "OUT_OF_BOUNDS", "details": "Coordinate outside Punjab footprint.", "risk_factors": []}
        
    zone_base = base_match.iloc[0]
    district = str(zone_base.get('district_name', 'Unknown')).title()
    village = str(zone_base.get('village_name', 'Unknown')).title()
    base_viirs = zone_base.get('viirs_annual_mean', 0.0)
    
    # MANDATORY LIVE DATA FETCH
    imd_data = fetch_live_imd_warning(district)
    aqi_data = fetch_live_multivariate_aqi(req.lat, req.lon)
    
    level = "SAFE"
    risk_factors = []
    
    # LAYER 1: ML & STRUCTURAL BASELINE
    scored_match = scored_gdf[scored_gdf.geometry.contains(user_point)]
    if scored_match.empty:
        level = "WARNING"
        risk_factors.append("Unmapped Terrain (Lacks ML Data)")
    else:
        zone_scored = scored_match.iloc[0]
        if zone_scored['village_status'] == 'PERSISTENT_HAZARD':
            level = "DANGER"
            risk_factors.append("Historical Environmental Decay")
            
    # LAYER 2: SOCIO-TEMPORAL
    is_night = req.local_hour < 6 or req.local_hour > 19
    if is_night and base_viirs < 0.5:
        if level == "SAFE": level = "WARNING"
        risk_factors.append("Unlit Zone at Night")

    # LAYER 3: LIVE CHEMICAL
    pm25 = aqi_data.get('pm2_5', 0.0)
    pm10 = aqi_data.get('pm10', 0.0)
    if pm25 > 100 or pm10 > 200:
        level = "CRITICAL_DANGER"
        risk_factors.append(f"Toxic AQI (PM2.5: {pm25} | PM10: {pm10})")
    elif pm25 > 60:
        if level in ["SAFE", "WARNING"]: level = "WARNING"
        risk_factors.append("Poor Air Quality")

    # LAYER 4: LIVE METEOROLOGICAL
    if imd_data:
        color_code = str(imd_data.get("Day1_Color", "1"))
        warning_codes = str(imd_data.get("Day_1", "1")).split(',')
        active_hazards = [IMD_WARNING_MAP.get(c.strip(), "") for c in warning_codes if c.strip() != "1"]
        active_hazards = [h for h in active_hazards if h] 
        
        if active_hazards and color_code in ['3', '4']:
            level = "CRITICAL_DANGER"
            risk_factors.append(f"IMD SEVERE ALERT: {' | '.join(active_hazards)}")

    return {
        "status": level,
        "village_name": village,
        "district": district,
        "risk_factors": risk_factors
    }