# ============================================================
# step_04_environment.py
# Punjab Tourist Safety Intelligence Platform
#
# Input files:
#   RAW_DIR/terrain/
#     District-wise_forest_cover_-_Punjab.xls
#     Forest_and_tree_cover_-_Punjab.xls     (loaded, reserved for extension)
#     Land_use_pattern_-_Punjab.xls          (loaded, reserved for extension)
#   RAW_DIR/disasters/
#     RS_Session_267_AU_1634_A_to_E.1.csv    (water pollution)
#   RAW_DIR/reference/
#     32_3ProtectedAreaNetwork.csv
#
# Output:
#   CLEAN_DIR/environment_master.parquet
#
# Features built:
#   forest_pct, forest_change, scrub_area
#   ecological_sensitivity_score, forest_isolation_risk
#   protected_area_ha, protected_zone_risk
#   water_pollution_severity, water_risk_score  (district-level join via name matching)
#   environmental_risk_score
#   lat, lon
#
# NOTE: Forest_and_tree_cover and Land_use_pattern are loaded
#       but not yet merged — slots are left for future extension.
# ============================================================

import numpy as np
import pandas as pd

from utils import (
    ENV_DIR,
    REF_DIR,
    DISASTER_DIR,
    CLEAN_DIR,
    DISTRICT_CENTROIDS,
    safe_read_csv,
    safe_read_excel,
    safe_float,
    canonical_district,
    add_coordinates,
    normalize_0_100,
)


# ============================================================
# River Stretch → District Mapping
# ============================================================
# Maps water pollution monitoring stretches to their corresponding districts

RIVER_DISTRICT_MAP = {
    "Rupnagar to Harika Bridge": "Roopnagar",
    "Mubarakpur to Sardulgarh": "Sangrur",
    "Sultanpur Lodhi to Conf to Beas": "Kapurthala",
    "Along Mukerian": "Pathankot",
}


# ============================================================
# 1. Forest Cover
# ============================================================

def load_forest() -> pd.DataFrame:
    df = safe_read_excel(
        ENV_DIR / "District-wise_forest_cover_-_Punjab.xls"
    )
    print(f"Forest raw shape: {df.shape}")

    df["district"]     = df["District"].apply(canonical_district)
    df["geo_area"]     = safe_float(df["Geographical Area"])
    df["forest_total"] = safe_float(df["2011 Assessment - Total"])
    df["forest_pct"]   = safe_float(df["Percent of GA"])
    df["forest_change"]= safe_float(df["Change"])
    df["scrub_area"]   = safe_float(df["Scrub"])

    df["ecological_sensitivity_score"] = (
        df["forest_pct"] * 0.7 + df["scrub_area"] * 0.3
    )
    df["forest_isolation_risk"] = np.where(
        df["forest_pct"] > 5, "HIGH",
        np.where(df["forest_pct"] > 2, "MEDIUM", "LOW")
    )

    df = add_coordinates(df)

    return df[[
        "district", "geo_area", "forest_total", "forest_pct",
        "forest_change", "scrub_area",
        "ecological_sensitivity_score", "forest_isolation_risk",
        "lat", "lon",
    ]].copy()


# ============================================================
# 2. Water Pollution
# ============================================================

def load_water_pollution() -> pd.DataFrame:
    df = safe_read_csv(
        DISASTER_DIR / "RS_Session_267_AU_1634_A_to_E.1.csv"
    )
    print(f"Water pollution raw shape: {df.shape}")

    df["bod_mg_l"] = safe_float(df["Max Bod Observed (mg/l)"])

    df["water_pollution_severity"] = np.where(
        df["bod_mg_l"] >= 100, "EXTREME",
        np.where(
            df["bod_mg_l"] >= 30, "HIGH",
            np.where(df["bod_mg_l"] >= 10, "MEDIUM", "LOW")
        )
    )
    df["water_risk_score"] = np.where(
        df["bod_mg_l"] >= 100, 90,
        np.where(
            df["bod_mg_l"] >= 30, 70,
            np.where(df["bod_mg_l"] >= 10, 40, 15)
        )
    )
    
    # Map river stretches to districts
    df["district"] = df["River Stretch"].map(RIVER_DISTRICT_MAP)
    
    # Aggregate by district (multiple river stretches per district)
    summary = (
        df.dropna(subset=["district"])
        .groupby("district", as_index=False)
        .agg({
            "bod_mg_l": "max",
            "water_risk_score": "max",
            "water_pollution_severity": lambda x: x.mode()[0] if len(x.mode()) > 0 else "UNKNOWN",
        })
    )
    
    print(f"Water pollution mapped shape: {summary.shape}")
    return summary


# ============================================================
# 3. Protected Areas
# ============================================================

KNOWN_DISTRICTS = list(DISTRICT_CENTROIDS.keys())


def _detect_district(text: str) -> str | float:
    text = str(text).lower()
    for d in KNOWN_DISTRICTS:
        if d.lower() in text:
            return d
    return np.nan


def load_protected_areas() -> pd.DataFrame:
    df = safe_read_csv(REF_DIR / "32_3ProtectedAreaNetwork.csv")
    df = df.rename(columns={df.columns[0]: "protected_area"})
    df = df[df["protected_area"].notna()].copy()

    # Wildlife sanctuaries only
    df = df[
        df["protected_area"].astype(str)
        .str.contains("wildlife sanctuary", case=False, na=False)
    ].copy()

    df["district"]          = df["protected_area"].apply(_detect_district)
    df["protected_area_ha"] = safe_float(df["2022"])

    summary = (
        df.groupby("district", as_index=False)
          .agg(protected_area_ha=("protected_area_ha", "sum"))
    )
    summary["protected_zone_risk"] = np.where(
        summary["protected_area_ha"] > 5000, "HIGH",
        np.where(summary["protected_area_ha"] > 1000, "MEDIUM", "LOW")
    )
    return summary


# ============================================================
# 4. Merge + Final Risk Score
# ============================================================

def build_environment_master(
    forest:    pd.DataFrame,
    protected: pd.DataFrame,
    water:     pd.DataFrame,
) -> pd.DataFrame:

    # ============================================================
    # Create Full Punjab District Base
    # ============================================================
    # Start with ALL 22 Punjab districts to prevent silent data loss
    
    master = pd.DataFrame({
        "district": list(DISTRICT_CENTROIDS.keys())
    })
    
    # Merge all layers onto full district base using left join
    master = (
        master
        .merge(forest, on="district", how="left")
        .merge(protected, on="district", how="left")
        .merge(
            water[["district", "bod_mg_l", "water_risk_score", "water_pollution_severity"]],
            on="district",
            how="left"
        )
    )

    # ============================================================
    # Handle Missing Values
    # ============================================================
    
    # Ecological data: missing means zero (no forest/protected area/scrub in that district)
    for col in ["forest_pct", "scrub_area", "protected_area_ha"]:
        master[col] = master[col].fillna(0)
    
    # Categorical features
    master["protected_zone_risk"]  = master["protected_zone_risk"].fillna("LOW")
    
    # Water pollution: missing means no pollution monitoring (safe fallback)
    master["bod_mg_l"]             = master["bod_mg_l"].fillna(0)
    master["water_risk_score"]     = master["water_risk_score"].fillna(20)
    master["water_pollution_severity"] = master["water_pollution_severity"].fillna("LOW")
    
    # Add coordinates for all districts
    master = add_coordinates(master)

    # ============================================================
    # Environmental Intelligence Scoring
    # ============================================================
    # 
    # Split into three conceptually distinct layers:
    # 1. Environmental Danger (real public health risk)
    # 2. Ecological Context (tourism richness / biodiversity)
    # 3. Geofence Sensitivity (protected/restricted zones)

    # 1. REAL danger signals: water pollution + degraded land
    master["environmental_danger_score"] = (
        master["water_risk_score"].fillna(20) * 0.75
        + normalize_0_100(master["scrub_area"].fillna(0)) * 0.25
    )

    # 2. Ecological richness/context (tourism signal, not danger)
    master["ecological_context_score"] = (
        normalize_0_100(master["forest_pct"].fillna(0)) * 0.6
        + normalize_0_100(master["protected_area_ha"].fillna(0)) * 0.4
    )

    # 3. Geofence sensitivity (categorical protection level)
    master["geofence_sensitivity"] = np.where(
        master["protected_area_ha"].fillna(0) > 5000,
        "HIGH",
        np.where(
            master["protected_area_ha"].fillna(0) > 1000,
            "MEDIUM",
            "LOW"
        )
    )

    # Keep backward compatibility with downstream steps
    master["environmental_risk_score"] = master["environmental_danger_score"]

    print(f"Environment master shape: {master.shape}")
    return master


# ============================================================
# Save
# ============================================================

def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "environment_master.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    forest    = load_forest()
    protected = load_protected_areas()
    water     = load_water_pollution()
    master    = build_environment_master(forest, protected, water)
    save(master)
    return master


if __name__ == "__main__":
    run()
