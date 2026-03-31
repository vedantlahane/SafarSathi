# YatraX Safety ML v3 - Setup and Integration Guide

This guide explains how to train and run the new safety-score model and connect it to both backends.

## What this model does

The new model combines:

1. Rule engine with environment-aware weighting (`urban/suburban/rural/remote/wilderness`).
2. TensorFlow regressor trained on full 153-factor synthetic + legacy data.
3. Forecasting for next `1h/3h/6h` score drift.

Output includes:

- `safety_score` (0-100, higher is safer)
- `danger_score` (0-1, higher is more dangerous)
- `status` (`safe`, `caution`, `danger`)
- factor-level explanations
- short recommendation
- future forecasts

## Framework choice (Colab)

Current implementation is TensorFlow-first:

1. Input space includes the complete 153-factor taxonomy.
2. Numeric preprocessing + deep MLP handles non-linear cross-factor interactions.
3. Artifact format is deployment-friendly (`danger_model.pkl` metadata + `.tf.keras` weights + preprocessor file).

PyTorch remains a valid alternative for future sequence-heavy experiments, but the production path here is TensorFlow.

## Files added

- `model/schemas.py`: typed feature schema and prediction output schema.
- `model/factor_registry.py`: canonical 153-factor taxonomy with bounds, aliases, and source mapping.
- `model/environment.py`: urban/remote/wilderness detector.
- `model/rule_engine.py`: weighted factor scoring with hard safety caps.
- `model/feature_builder.py`: ML feature engineering.
- `model/synthetic_data.py`: synthetic dataset generator + legacy dataset mapper.
- `model/train_pipeline.py`: full training pipeline.
- `model/predictor.py`: model loader + blended inference + forecasting.
- `model/api.py`: Flask API endpoints.
- `model/data_sources.py`: source catalog with official links and feature-to-source mapping.
- `danger_api.py`: now delegates to `model/api.py` app.
- `train_danger_model.py`: now delegates to `model/train_pipeline.py`.

## Prerequisites

- Python 3.11+
- Existing backend Python virtual environment (do not install globally)

## Important workflow constraints

1. Use only the backend virtual environment for all Python commands.
2. Do not run `pip install` in the system/global interpreter.
3. Do model training on Google Colab (or another cloud runtime), not on your local PC.

## Activate backend virtual environment

Use your already-created backend venv path.

Windows PowerShell example:

```powershell
# Example path, replace with your real backend venv path
& "<backend-venv-path>\Scripts\Activate.ps1"
python -m pip install -r requirements.txt
```

Linux/macOS example:

```bash
# Example path, replace with your real backend venv path
source <backend-venv-path>/bin/activate
python -m pip install -r requirements.txt
```

## Train the model (Google Colab / cloud)

Run this in Colab (or another cloud runtime):

```bash
python -m model.train_pipeline --synthetic-samples 42000
```

This writes artifacts to:

- `danger_model.pkl`
- `danger_model.tf.keras`
- `danger_model.preprocessor.pkl`

Optional training flags:

```bash
python -m model.train_pipeline \
  --synthetic-samples 60000 \
  --seed 123 \
  --legacy-csv SafarSathi_Punjab_Data.csv \
  --model-path danger_model.pkl
```

Disable legacy CSV contribution:

```bash
python -m model.train_pipeline --disable-legacy
```

### Suggested Colab workflow

```python
# Cell 1: clone repo and install dependencies in Colab runtime
!git clone https://github.com/vedantlahane/YatraX.git
%cd YatraX
!python -m pip install -r requirements.txt
```

```python
# Cell 2: train model artifact
!python -m model.train_pipeline --synthetic-samples 42000 --seed 42
```

```python
# Cell 3 (optional): train without legacy bootstrap CSV
!python -m model.train_pipeline --disable-legacy
```

Download all three files (`danger_model.pkl`, `danger_model.tf.keras`, and `danger_model.preprocessor.pkl`) from Colab and deploy them together with the Python API service.

### Suggested cloud-VM workflow

```bash
# 1) SSH to cloud machine and enter repo
cd /path/to/YatraX

# 2) Activate existing backend venv
source <backend-venv-path>/bin/activate

# 3) Install/update dependencies in that venv only
python -m pip install -r requirements.txt

# 4) Train model artifact
python -m model.train_pipeline --synthetic-samples 42000 --seed 42

# 5) Optional: retrain without legacy bootstrap data
python -m model.train_pipeline --disable-legacy
```

After training on Colab/cloud, deploy all generated model artifact files with the Python API service.

## Run inference API

From repository root, with backend venv activated:

```bash
python danger_api.py
```

Service default:

- `http://localhost:5000`

For deployment, replace localhost with your deployed ML API base URL.

Health check:

```bash
curl http://localhost:5000/health
```

## API endpoints

### 1) Backward-compatible endpoint for Spring

`GET /predict-safety?lat=<float>&lon=<float>&hour=<0-23>`

Example:

```bash
curl "http://localhost:5000/predict-safety?lat=26.17&lon=91.74&hour=22"
```

Response contains at least:

- `danger_score`
- `dangerScore`

So existing Spring parser remains compatible.

### 2) Rich endpoint for full-factor prediction

`POST /v2/predict-safety`

Example:

```bash
curl -X POST http://localhost:5000/v2/predict-safety \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "latitude": 26.17,
      "longitude": 91.74,
      "hour": 21,
      "month": 7,
      "minutes_to_sunset": -40,
      "network_type": "2g",
      "distance_to_settlement_km": 11,
      "distance_to_road_km": 3.5,
      "hospital_eta_min": 65,
      "police_eta_min": 38,
      "weather_severity": 62,
      "rainfall_mmph": 22,
      "aqi": 112,
      "in_risk_zone": true,
      "risk_zone_level": "HIGH",
      "active_alerts_nearby": 3,
      "historical_incidents_30d": 4,
      "nearby_place_count": 2,
      "open_business_count": 0,
      "wildlife_sanctuary_distance_km": 1.2,
      "snake_activity_index": 0.7
    },
    "forecast_hours": [1, 3, 6]
  }'
```

This response now also includes:

- `provided_factor_count`
- `factor_completeness` (summary with provided/defaulted counts and coverage percentage)

### 3) Reload model after re-training

`POST /v2/reload-model`

```bash
curl -X POST http://localhost:5000/v2/reload-model
```

### 4) Data source catalog and links

`GET /v2/data-sources`

```bash
curl http://localhost:5000/v2/data-sources
```

This returns:

- `sources`: source key -> `{name, url, access, notes}`
- `feature_sources`: model feature -> list of source links used for that feature
- `factor_count`: full taxonomy count (`153`)
- `factor_keys`: canonical factor key list

You can also read the in-code mapping directly in:

- `model/data_sources.py`

### 5) Strict factor completeness checker

`POST /v2/factor-completeness`

Use this endpoint to validate whether all `153` canonical factors are present in a payload before scoring.

Non-strict example (always `200`, returns report):

```bash
curl -X POST http://localhost:5000/v2/factor-completeness \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "latitude": 26.17,
      "longitude": 91.74,
      "hour": 21,
      "hospital_eta_min": 45,
      "weather_severity": 58
    }
  }'
```

Strict example (returns `400` if below threshold):

```bash
curl -X POST http://localhost:5000/v2/factor-completeness \
  -H "Content-Type: application/json" \
  -d '{
    "strict": true,
    "min_coverage_pct": 100,
    "features": {
      "factors": {
        "elevation_m": 360,
        "rainfall_intensity_mmph": 14
      }
    }
  }'
```

Response fields:

- `data.factor_count`
- `data.provided_count`
- `data.defaulted_count`
- `data.coverage_pct`
- `data.is_complete`
- `data.provided_factors`
- `data.defaulted_factors`
- `data.provided_by_category`
- `data.defaulted_by_category`

## Spring integration

Current Spring already calls:

- `GET /predict-safety?lat=...&lon=...&hour=...`

So no code change is required for basic compatibility.

If you want richer data in Spring:

1. Add a new method in `AISafetyService` to call `POST /v2/predict-safety`.
2. Pass additional context from your safety endpoint (ETA, alerts, risk zone, weather).
3. Use returned `data.safety_score`, `data.factors`, and `data.forecast` for better UI decisions.

## Node integration

`backend-node` is already integrated to call ML v2 as primary scoring with automatic phase1 fallback.

Set these env vars in `backend-node`:

- `SAFETY_ML_API_URL=https://<your-ml-host>`
- `SAFETY_ML_TIMEOUT_MS=2500`

Behavior:

- If `SAFETY_ML_API_URL` is set and reachable, `backend-node` uses `POST /v2/predict-safety`.
- If ML API times out/fails, it falls back to local phase1 scoring automatically.

## Feature coverage strategy

This implementation now includes complete taxonomy coverage.

Any factor missing from request payload is safely defaulted/derived, so the API still returns a valid score.

### Current coverage snapshot

- Master taxonomy target: `153` factors
- Implemented taxonomy registry: `153` factors (`model/factor_registry.py`)
- TensorFlow model input: all 153 factors + derived robustness features
- Active weighted rule factors: `18` (environment-adjusted)

## Recommended production workflow

1. Retrain model daily/weekly with updated incident and alert data.
2. Keep one stable artifact bundle (`danger_model.pkl` + `.tf.keras` + preprocessor) for serving.
3. Version models in CI/CD by copying artifacts to dated paths.
4. Monitor drift by tracking average error against real incident outcomes.

## Troubleshooting

- If `/health` says `model_loaded=false`:
  1. Run training command.
  2. Confirm `danger_model.pkl` exists in repository root.
  3. Confirm `danger_model.tf.keras` and `danger_model.preprocessor.pkl` exist in repository root.
  4. Call `/v2/reload-model`.

- If Spring returns default score:
  1. Verify Python service is up on port `5000`.
  2. Verify `AI_API_URL` in Spring config.
  3. Test legacy endpoint directly via curl.

- If scores look too conservative in remote areas:
  1. Provide real `minutes_to_sunset`, ETA, connectivity, and weather severity.
  2. Avoid leaving all advanced factors at defaults.
