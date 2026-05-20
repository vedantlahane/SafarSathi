# ============================================================
# utils.py
# Punjab Tourist Safety Intelligence Platform
# Shared constants, district mappings, and utility functions
# Used by ALL pipeline steps
# ============================================================

import re
import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# Base Paths
# ============================================================

BASE_DIR  = Path("/content/drive/MyDrive/yatrax-ml/punjab")
RAW_DIR   = BASE_DIR / "data" / "raw"
CLEAN_DIR = BASE_DIR / "data" / "clean"

# Sub-directories inside RAW_DIR
ROAD_DIR      = RAW_DIR / "road_accidents"
CRIME_DIR     = RAW_DIR / "crime"
HEALTH_DIR    = RAW_DIR / "health"
ENV_DIR       = RAW_DIR / "terrain"
REF_DIR       = RAW_DIR / "reference"
DISASTER_DIR  = RAW_DIR / "disasters"
TRANSPORT_DIR = RAW_DIR / "transport"
CONTEXT_DIR   = RAW_DIR / "context"


def ensure_dirs():
    """Create output directories if they do not exist."""
    CLEAN_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# Punjab District Canonical Mapping
# Prevents merge-key disasters across datasets
# ============================================================

DISTRICT_ALIAS: dict[str, str] = {
    # Core districts
    "amritsar":          "Amritsar",
    "barnala":           "Barnala",
    "bathinda":          "Bathinda",
    "bhatinda":          "Bathinda",
    "faridkot":          "Faridkot",
    "fatehgarh sahib":   "Fatehgarh Sahib",
    "fazilka":           "Fazilka",
    "firozpur":          "Firozpur",
    "ferozepur":         "Firozpur",
    "gurdaspur":         "Gurdaspur",
    "hoshiarpur":        "Hoshiarpur",
    "jalandhar":         "Jalandhar",
    "kapurthala":        "Kapurthala",
    "ludhiana":          "Ludhiana",
    "mansa":             "Mansa",
    "moga":              "Moga",

    # Rupnagar / Ropar variants
    "rupnagar":           "Roopnagar",
    "roopnagar":          "Roopnagar",
    "ropar":              "Roopnagar",
    "rupnagar (ropar)":   "Roopnagar",

    # SAS Nagar / Mohali
    "sas nagar":                   "SAS Nagar",
    "s.a.s nagar":                 "SAS Nagar",
    "sahibzada ajit singh nagar":  "SAS Nagar",
    "mohali":                      "SAS Nagar",

    # SBS Nagar
    "sbs nagar":                  "SBS Nagar",
    "nawanshahr":                  "SBS Nagar",
    "nawanshahar":                 "SBS Nagar",
    "shahid bhagat singh nagar":   "SBS Nagar",

    "patiala":   "Patiala",
    "pathankot": "Pathankot",
    "sangrur":   "Sangrur",

    # Muktsar variants
    "muktsar":            "Shri Muktsar Sahib",
    "sri muktsar sahib":  "Shri Muktsar Sahib",
    "shri muktsar sahib": "Shri Muktsar Sahib",

    # Tarn Taran
    "tarn taran":  "Tarn Taran",
    "tarntaran":   "Tarn Taran",
}


# ============================================================
# District Centroids (lat, lon)
# Temporary — replace with actual district polygons later
# ============================================================

DISTRICT_CENTROIDS: dict[str, tuple[float, float]] = {
    "Amritsar":          (31.6340, 74.8723),
    "Barnala":           (30.3780, 75.5460),
    "Bathinda":          (30.2110, 74.9455),
    "Faridkot":          (30.6740, 74.7580),
    "Fatehgarh Sahib":   (30.6490, 76.3900),
    "Fazilka":           (30.4040, 74.0270),
    "Firozpur":          (30.9330, 74.6160),
    "Gurdaspur":         (32.0416, 75.4066),
    "Hoshiarpur":        (31.5143, 75.9115),
    "Jalandhar":         (31.3260, 75.5762),
    "Kapurthala":        (31.3813, 75.3810),
    "Ludhiana":          (30.9010, 75.8573),
    "Mansa":             (29.9930, 75.3920),
    "Moga":              (30.8170, 75.1720),
    "Roopnagar":         (30.9650, 76.5190),
    "SAS Nagar":         (30.7046, 76.7179),
    "SBS Nagar":         (31.1254, 76.1151),
    "Patiala":           (30.3398, 76.3869),
    "Pathankot":         (32.2697, 75.6520),
    "Sangrur":           (30.2450, 75.8400),
    "Shri Muktsar Sahib":(30.4740, 74.5150),
    "Tarn Taran":        (31.4518, 74.9273),
}


# ============================================================
# Helper: Text Normalisation
# ============================================================

def normalize_text(x) -> str:
    """Strip, lowercase, collapse whitespace, drop 'district' keyword."""
    if pd.isna(x):
        return ""
    x = str(x).strip().lower()
    x = re.sub(r"\s+", " ", x)
    x = x.replace("district", "").strip()
    return x


def canonical_district(name: str) -> str:
    """Map any district alias to its canonical name."""
    key = normalize_text(name)
    return DISTRICT_ALIAS.get(key, str(name).title().strip())


# ============================================================
# Helper: Safe Numeric Conversion
# ============================================================

def safe_float(series: pd.Series) -> pd.Series:
    s = series.astype(str).str.strip()
    s = s.replace({"": np.nan, "nan": np.nan, "None": np.nan})

    s = s.str.replace(",", "", regex=False)
    s = s.str.replace("%", "", regex=False)
    s = s.str.replace("NA", "", regex=False)
    s = s.str.replace("N/A", "", regex=False)
    s = s.str.replace("NULL", "", regex=False)

    return pd.to_numeric(s, errors="coerce")
VALID_PUNJAB_DISTRICTS = set(DISTRICT_CENTROIDS.keys())

def is_valid_district(name: str) -> bool:
    return canonical_district(name) in VALID_PUNJAB_DISTRICTS    


# ============================================================
# Helper: Detect Year Columns
# ============================================================

def get_year_columns(df: pd.DataFrame) -> list[str]:
    """Return column names that look like calendar years (1900–2100)."""
    years = []
    for c in df.columns:
        c2 = str(c).strip()
        if c2.isdigit() and 1900 <= int(c2) <= 2100:
            years.append(c2)
    return years


# ============================================================
# Helper: Coordinate Lookup
# ============================================================

def add_coordinates(df: pd.DataFrame, district_col: str = "district") -> pd.DataFrame:
    """Attach lat/lon centroid columns to a district-level DataFrame."""
    df = df.copy()
    df["lat"] = df[district_col].map(
        lambda x: DISTRICT_CENTROIDS.get(x, (np.nan, np.nan))[0]
    )
    df["lon"] = df[district_col].map(
        lambda x: DISTRICT_CENTROIDS.get(x, (np.nan, np.nan))[1]
    )
    return df


# ============================================================
# Helper: Normalise Series 0–100
# ============================================================

def normalize_0_100(series: pd.Series) -> pd.Series:
    mn, mx = series.min(), series.max()
    if mn == mx:
        return pd.Series([50.0] * len(series), index=series.index)
    return (series - mn) / (mx - mn) * 100


# ============================================================
# Safe File Readers
# ============================================================

def safe_read_csv(path) -> pd.DataFrame:
    try:
        return pd.read_csv(path)
    except UnicodeDecodeError:
        return pd.read_csv(path, encoding="latin-1")


def safe_read_excel(path) -> pd.DataFrame:
    return pd.read_excel(path)


# ============================================================
# Generic Wide → Long Converter
# ============================================================

def wide_to_long(df: pd.DataFrame, value_name: str) -> pd.DataFrame:
    """
    Convert any government wide-format table (district rows × year cols)
    into a tidy long-format DataFrame.

    Applies canonical district names and safe numeric conversion.
    """
    df = df.copy()
    df = df.rename(columns={df.columns[0]: "district"})

    year_cols = get_year_columns(df)

    long_df = df.melt(
        id_vars=["district"],
        value_vars=year_cols,
        var_name="year",
        value_name=value_name,
    )

    long_df["district"] = long_df["district"].apply(canonical_district)
    long_df[value_name] = safe_float(long_df[value_name])
    long_df["year"] = long_df["year"].astype(int)

    return long_df
