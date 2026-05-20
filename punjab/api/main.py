from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import os
from pathlib import Path
import logging
import sys

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

app = FastAPI(title="YatraX Geospatial ML Engine", version="10.1.0")
logger.info("FastAPI application initialized - YatraX Geospatial ML Engine v10.1.0")

# ==========================================
# 1. LOCAL MAP LOADING
# ==========================================
logger.info("Booting Geospatial ML Engine...")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'
logger.debug(f"Data directory path: {DATA_DIR}")

try:
    logger.info("Loading Geographic Artifacts...")
    full_map = gpd.read_parquet(DATA_DIR / 'punjab_final_scored.parquet')
    logger.info(f"Loaded full map with {len(full_map):,} records")
    
    # Base Geometric Map
    base_gdf = full_map.drop_duplicates(subset=['shrid2'])[['shrid2', 'geometry', 'village_name', 'district_name', 'viirs_annual_mean']]
    logger.info(f"Base geometric map created with {len(base_gdf):,} unique polygons")
    
    # FORCE SPATIAL INDEX GENERATION ON BOOT
    # This prevents the first API call from hanging while it builds the R-Tree
    _ = base_gdf.sindex 
    logger.info("Spatial index generated successfully")
    
    # ML Anomaly Data
    raw_scored_df = pd.read_parquet(DATA_DIR / 'punjab_lof_anomalies.parquet')
    latest_year = raw_scored_df['year'].max()
    logger.info(f"Loaded ML anomalies data. Latest year: {latest_year}")
    
    # Keep only essential ML data, drop heavy geometry, and set index for O(1) lookups
    scored_df = raw_scored_df[raw_scored_df['year'] == latest_year].copy()
    if 'geometry' in scored_df.columns:
        scored_df = scored_df.drop(columns=['geometry'])
    scored_df.set_index('shrid2', inplace=True)
    logger.info(f"ML scores indexed on shrid2. Records: {len(scored_df):,}")
    
    logger.info(f"Maps Loaded Successfully. Base Polygons: {len(base_gdf):,} | ML Scores: {len(scored_df):,}")
except Exception as e:
    logger.error(f"Map Load Error: {e}", exc_info=True)
    base_gdf, scored_df = None, None

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
    logger.info(f"Received evaluation request - Lat: {req.lat}, Lon: {req.lon}, Local Hour: {req.local_hour}")
    
    if base_gdf is None or scored_df is None:
        logger.error("Intelligence Engine Offline: Artifacts Missing")
        raise HTTPException(status_code=500, detail="Intelligence Engine Offline: Artifacts Missing.")
        
    user_point = Point(req.lon, req.lat)
    logger.debug(f"Created Point geometry: {user_point}")
    
    # ---------------------------------------------------------
    # STEP 1: O(1) SPATIAL INDEX LOOKUP (The Bottleneck Fix)
    # ---------------------------------------------------------
    logger.debug("STEP 1: Performing spatial index lookup")
    # 1a. Narrow down to bounding boxes that intersect the point (Instant)
    possible_matches_index = list(base_gdf.sindex.intersection(user_point.bounds))
    possible_matches = base_gdf.iloc[possible_matches_index]
    logger.debug(f"Spatial index returned {len(possible_matches)} possible matches")
    
    # 1b. Do the expensive exact polygon math ONLY on the 1-2 candidates
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
    # Fixed the >= 19 logic gap
    is_night = req.local_hour < 6 or req.local_hour >= 19
    is_unlit = base_viirs < 0.5
    
    logger.debug(f"Infrastructure assessment - Night: {is_night}, Unlit: {is_unlit}, Penalty Active: {is_night and is_unlit}")
    
    infrastructure_payload = {
        "viirs_nightlight_score": round(base_viirs, 4),
        "is_unlit": is_unlit,
        "is_night": is_night,
        "socio_temporal_penalty_active": is_night and is_unlit
    }
    
    # ==========================================================
    # STEP 3: O(1) ML BASELINE LOOKUP
    # ==========================================================
    logger.debug("STEP 3: Performing O(1) ML baseline lookup")

    if shrid2_id not in scored_df.index:
        logger.warning(f"shrid2_id {shrid2_id} not found in ML scores")
        ml_payload = {
            "status": "UNMAPPED_TERRAIN",
            "is_anomaly": False,
            "anomaly_magnitude": 1.0
        }

    else:
        zone_scored = scored_df.loc[shrid2_id]
        logger.debug(f"Found ML score for shrid2_id {shrid2_id}")

        # Handle duplicates safely
        if isinstance(zone_scored, pd.DataFrame):
            zone_scored = zone_scored.iloc[0]

        raw_status = zone_scored.get('village_status', 'NORMAL')
        status_val = "NORMAL" if pd.isna(raw_status) else str(raw_status)
        is_anomaly = bool(zone_scored.get('hazard_zone', 0) == 1)

        # ======================================================
        # NEW: CONTINUOUS LOF MAGNITUDE
        # ======================================================
        raw_lof = zone_scored.get('lof_score', -1.0)
        lof_score = -1.0 if pd.isna(raw_lof) else float(raw_lof)

        # Convert to positive magnitude
        anomaly_magnitude = abs(lof_score)

        logger.debug(f"ML Status: {status_val} | Anomaly: {is_anomaly} | Magnitude: {anomaly_magnitude:.4f}")

        ml_payload = {
            "status": status_val,
            "is_anomaly": is_anomaly,
            "anomaly_magnitude": round(anomaly_magnitude, 4)
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