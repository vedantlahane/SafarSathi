Markdown
# YatraX Geospatial ML Engine (Punjab) 🛰️

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688)
![GeoPandas](https://img.shields.io/badge/GeoPandas-0.14.4-139C77)
![Status](https://img.shields.io/badge/Status-Production_Ready-success)

A high-performance, stateless Python geospatial microservice built with FastAPI. This engine acts as the geographic and machine learning brain of the SafarSathi ecosystem. 

It maps GPS coordinates to specific spatial boundaries (villages and districts) in Punjab, evaluates historical Local Outlier Factor (LOF) environmental anomalies, and calculates nighttime VIIRS infrastructure profiles in milliseconds.

---

## 🏛️ Architectural Context

This microservice is designed to run in parallel with a Master Aggregator (e.g., a Node.js backend). It does **not** fetch live internet data or connect to external APIs. Instead, it relies on pre-calculated `.parquet` spatial artifacts to provide instantaneous structural and historical baselines, which the aggregator then synthesizes with live weather and traffic data.

## 🛠️ Technology Stack

* **Framework**: FastAPI (Asynchronous endpoint serving)
* **Geospatial Processing**: GeoPandas, Shapely (O(1) spatial lookups)
* **Data Serialization**: Pandas, PyArrow (High-speed `.parquet` ingestion)
* **Math/Stats**: NumPy, Scikit-Learn (LOF models)
* **WSGI/ASGI Server**: Uvicorn

---

## 📦 Directory Structure

```text
punjab/
├── api/
│   └── main.py                 # FastAPI App, routes, and logic controllers
├── data/
│   ├── punjab_final_scored.parquet    # Base geometric map and VIIRS data
│   └── punjab_lof_anomalies.parquet   # Historical LOF hazard anomalies
├── models/                 # Serialized model coefficients/weights
├── pipeline/               # Raw geospatial feature extraction routines
└── requirements.txt        # Package dependencies
⚠️ Critical Note: The engine will fail to boot if the data/ directory does not contain the required .parquet artifacts.

🚀 Setup and Development
1. Prerequisites
Ensure you have Python 3.10+ installed on your system.

2. Installation
Navigate to the microservice directory, create an isolated environment, and install the dependencies:

Bash
# Navigate to the punjab directory
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
3. Running Locally
To launch the FastAPI service in development mode with hot-reloading:

Bash
uvicorn api.main:app --port 8000 --reload
Base URL: http://localhost:8000

Swagger UI (API Docs): http://localhost:8000/docs

🧬 API Contract
POST /safety/evaluate
Evaluates a specific GPS coordinate against Punjab's spatial boundaries and anomaly datasets.

Input Payload:
JSON
{
  "lat": 31.250951,
  "lon": 75.700128,
  "local_hour": 7
}
Success Response (200 OK):
Returned when the coordinate successfully maps to a known habitable zone.

JSON
{
  "status": "SUCCESS",
  "spatial_context": {
    "village": "Hradaspur",
    "district": "Kapurthala"
  },
  "ml_baseline": {
    "status": "NORMAL",
    "is_anomaly": false
  },
  "infrastructure": {
    "viirs_nightlight_score": 0.0,
    "is_unlit": true,
    "is_night": false,
    "socio_temporal_penalty_active": false
  }
}
Edge-Case Response (200 OK):
Returned when a coordinate falls entirely outside the state boundaries, allowing the client to fail gracefully.

JSON
{
  "status": "OUT_OF_BOUNDS",
  "spatial_context": null,
  "ml_baseline": null,
  "infrastructure": null
}
🛰️ Spatial Algorithms & Logic
Boundary Containment (Fail-Safe)
The engine validates coordinates against the exact polygon boundaries of Punjab. If a pin is dropped outside the state, it aborts the ML calculation and returns OUT_OF_BOUNDS.

Socio-Temporal Infrastructure Math
Analyzes satellite nightlight indexes (viirs). If the user's local_hour falls within nighttime parameters (19:00 - 06:00) and the geographic zone lacks sufficient illumination, the engine dynamically triggers the socio_temporal_penalty_active boolean.

Unsupervised Anomaly Detection (LOF)
Performs a spatial lookup against the Local Outlier Factor dataset. It identifies zones with historical patterns of extreme environmental decay (e.g., toxic PM2.5 baselines) and flags them as is_anomaly = true or PERSISTENT_HAZARD.