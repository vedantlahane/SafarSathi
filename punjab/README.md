---
title: YatraX Geospatial ML Engine
emoji: 🛰️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# YatraX Geospatial ML Engine (Punjab) 🛰️

A high-performance, stateless Python geospatial microservice built with **FastAPI** that serves as the intelligence core of the YatraX safety ecosystem. It handles state boundary validation, unsupervised anomaly scoring, and socio-temporal nightlight analysis for Punjab, India.

---

## 🛠️ Technology Stack

- **Framework**: FastAPI (Asynchronous, high-performance API serving)
- **Geospatial Processing**: GeoPandas, Shapely (Efficient vector geometry lookups)
- **Data Serialization**: Pandas, PyArrow (Fast `.parquet` load times)
- **Unsupervised Anomaly Model**: Local Outlier Factor (LOF) via Scikit-Learn
- **Server**: Uvicorn (ASGI web server implementation)

---

## 📦 Directory Structure

```text
punjab/
├── api/
│   └── main.py                 # FastAPI App, routing, and scoring logic
├── data/
│   ├── punjab_final_scored.parquet    # Village boundary geoms & VIIRS nightlight baselines
│   └── punjab_lof_anomalies.parquet   # Historical LOF hazard metrics
├── src/
│   └── config.py               # Path configurations & settings
└── requirements.txt            # Python dependencies list
```

---

## 🚀 Setup and Development

### 1. Prerequisites
- Python 3.10+ installed.
- High-resolution `.parquet` files placed inside the `data/` directory (these contain the geographic and LOF profiles).

### 2. Installation
Navigate to the directory, create a virtual environment, and install dependencies:

```bash
# Navigate to the punjab folder
cd punjab

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Running Locally
Run the FastAPI development server:

```bash
uvicorn api.main:app --port 8000 --reload
```
- **Base API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

## 🧬 API Contract

### `POST /safety/evaluate`
Maps GPS coordinates to Punjab villages/districts, assesses local nightlight infrastructure, and queries historical environmental anomalies.

#### Input Payload
```json
{
  "lat": 31.3260,
  "lon": 75.5762,
  "local_hour": 22
}
```

#### Success Response (`200 OK`)
```json
{
  "status": "SUCCESS",
  "spatial_context": {
    "village": "Jalandhar",
    "district": "Jalandhar"
  },
  "ml_baseline": {
    "status": "NORMAL",
    "is_anomaly": false
  },
  "infrastructure": {
    "viirs_nightlight_score": 14.5,
    "is_unlit": false,
    "is_night": true,
    "socio_temporal_penalty_active": false
  }
}
```

#### Out of Bounds Response (`200 OK`)
```json
{
  "status": "OUT_OF_BOUNDS",
  "spatial_context": null,
  "ml_baseline": null,
  "infrastructure": null
}
```

---

## 🛰️ Spatial Algorithms & Heuristics

1. **Boundary Geofencing**: Matches target coordinates against Punjab's border polygons. If outside, immediately returns `OUT_OF_BOUNDS`, letting the master gateway fall back to local heuristics.
2. **Local Outlier Factor (LOF)**: Queries a spatial model pre-trained on historical environmental factors (PM2.5 patterns, industrial density). Flags outliers as `is_anomaly = true`.
3. **Socio-Temporal Infrastructure Math**: Looks up the VIIRS Nightlight score. If the coordinates are unlit and the `local_hour` is within night bounds (`19:00 - 06:00`), a temporal penalty is flagged to advise caution.