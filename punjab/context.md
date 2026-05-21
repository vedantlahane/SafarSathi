# YatraX Punjab ML Engine — Context Document
> Use this file to understand the Python Machine Learning architecture for the YatraX safety aggregator.

---

## 1. Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| Framework | **FastAPI** |
| Server | **Uvicorn** (Running on port 8000) |
| Core ML | **scikit-learn** (RandomForest 1.6.1) |
| Explainability | **SHAP** (TreeExplainer) with pinned `numpy<2.0.0` |
| Geospatial | **GeoPandas**, **Shapely** |
| Data Processing | **Pandas**, **NumPy** |
| Formats | `.joblib` (Model Artifacts), `.parquet` / `.shp` (Geospatial Data) |

---

## 2. Server Architecture

The Punjab ML server is an extremely fast, stateless microservice dedicated purely to geographical terrain and historical safety inference. 

```
Node.js (Master Aggregator) 
       │ (POST /safety/evaluate)
       ▼
FastAPI (port 8000)
       │
       ├── 1. In-Memory Artifacts (Loaded once at startup)
       │      ├── model.joblib (RandomForestRegressor)
       │      ├── explainer.joblib (SHAP TreeExplainer)
       │      └── punjab_safety_base.parquet (GeoPandas DataFrame)
       │
       ├── 2. Spatial Query (O(1) lookup)
       │      └── Uses `gdf.sindex.nearest()` to find the closest 1km grid cell
       │
       ├── 3. Model Inference
       │      └── Predicts base geographic safety score
       │
       └── 4. SHAP Explainability
              └── Calculates exactly which features (elevation, vegetation, PM2.5, etc.) influenced the score, and by how much.
```

---

## 3. Core Philosophy: Separation of Concerns

The Punjab ML engine **only evaluates static geography and historical baseline safety**. 
It specifically does **NOT** compute live emergency factors (like active riots, live police ETAs, or user battery levels). 

**Why?**
Machine learning models are relatively slow and require strict feature schemas. Live, rapidly changing dynamic data (like a sudden power outage or a user dropping to 5% battery) should not be bottlenecked by an ML model.

Instead, the architecture works like this:
1. **Punjab (Python)**: Predicts the geographic baseline (e.g., "This area has dense vegetation, rough terrain, and low lighting. ML Danger Index = 2.5").
2. **Backend (Node.js)**: Takes the ML baseline and modifies it using live APIs (e.g., "The ML Danger is 2.5, but there is a Severe Heat Wave (+2.0), the user is a lone female at 3 AM (+2.0), but a hospital is nearby (-1.5)").

---

## 4. O(1) Geospatial Lookups

To guarantee sub-100ms response times for the Node.js backend, the punjab server completely avoids live database spatial queries. 

At startup, the entire map of the state (`punjab_safety_base.parquet`) is loaded into RAM as a `GeoDataFrame`.
The server utilizes the underlying C-based **GEOS** library via `GeoPandas sindex` (Spatial R-tree Index).
When a lat/lon coordinate comes in, the spatial index locates the exact geological grid cell in roughly **2 milliseconds**.

---

## 5. Explainability (SHAP)

A "black box" safety score is useless to a tourist. They need to know *why* an area is dangerous.
To solve this, the engine uses **SHapley Additive exPlanations (SHAP)**.

When a coordinate is evaluated, the `TreeExplainer` generates an array of localized weights. 
For example:
- `vcf_mean`: -3.14 (Dense tree cover reduced safety)
- `pm25_mean`: +2.89 (Good air quality boosted safety)
- `tri_mean`: -0.41 (Slightly rugged terrain reduced safety)

These raw SHAP values are returned to the Node.js backend, which translates them into human-readable UI cards for the frontend Map.

---

## 6. Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check endpoint. Returns `{"status": "Punjab Safety ML API running"}` |
| POST | `/safety/evaluate` | The core inference engine. Accepts `{lat, lon}`. Returns `{ml_baseline: {predicted_score, shap_values}, spatial_context, infrastructure}` |
| GET | `/system/status` | Diagnostics endpoint checking RAM usage and model load status. |

---

## 7. Deployment (Hugging Face Spaces)
The service is explicitly containerized for deployment on Hugging Face Docker Spaces.

**Crucial Deployment Mechanics:**
1. **Git LFS**: The massive `rf_safety_regressor.pkl` (475MB) and geospatial `.parquet` files MUST be tracked via Git LFS (`.gitattributes`). Pushing directly via standard HTTP will cause a `408 Request Timeout` or `unexpected disconnect`.
2. **Dockerfile CMD**: Uses `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]` to expose the standard HF Spaces port.
3. **C-Extension Compatibility**: The SHAP library requires C-extensions to be built against `numpy 1.x`. Upgrading to `numpy 2.x` causes a fatal `numpy.core.multiarray failed to import` crash on container boot.

---

## 8. Operational Best Practices
- **Never add live database connections to Punjab**. Keep it fully stateless.
- **Never use exact Additivity Checks** in the SHAP explainer (`check_additivity=False`). Floating point rounding errors between Python and underlying C libraries will cause unexpected 500 errors.
- **Deploy with Uvicorn workers**. In production, run `uvicorn main:app --workers 4` to allow concurrent ML inferences.
