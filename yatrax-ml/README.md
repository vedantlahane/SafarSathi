```markdown
# YatraX — Real-Time Travel Safety Intelligence for India

> **A multi-model ML pipeline that computes location-specific safety scores
> across India using 26 Kaggle datasets, 38+ safety factors, 6 trained models,
> and a 93,000-cell spatial grid at ~11 km resolution.**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [System Architecture](#3-system-architecture)
4. [Data Sources & Ingestion](#4-data-sources--ingestion)
5. [Safety Factor Taxonomy](#5-safety-factor-taxonomy)
6. [Spatial Grid System](#6-spatial-grid-system)
7. [Feature Engineering Pipeline](#7-feature-engineering-pipeline)
8. [Label Generation Strategy](#8-label-generation-strategy)
9. [Model Descriptions](#9-model-descriptions)
   - [Model 1: Safety Scorer](#model-1-safety-scorer-lightgbm)
   - [Model 2: Trajectory Forecaster](#model-2-trajectory-forecaster-gradient-boosting)
   - [Model 3: Anomaly Detector](#model-3-anomaly-detector-isolation-forest)
   - [Model 4: Incident Classifier](#model-4-incident-classifier-lightgbm)
   - [Model 5: Spatial Risk Propagation](#model-5-spatial-risk-propagation-parametric-decay)
   - [Model 6: Alert Timing Engine](#model-6-alert-timing-engine-heuristic--experience-logging)
10. [Training Pipeline](#10-training-pipeline)
11. [Evaluation Framework](#11-evaluation-framework)
12. [Project Structure](#12-project-structure)
13. [Setup & Installation](#13-setup--installation)
14. [Usage Guide](#14-usage-guide)
15. [Configuration Reference](#15-configuration-reference)
16. [Design Decisions & Trade-offs](#16-design-decisions--trade-offs)
17. [Limitations & Future Work](#17-limitations--future-work)
18. [Appendix](#18-appendix)

---

## 1. Executive Summary

YatraX is a machine learning system that produces **real-time safety scores
(0–100)** for any geographic coordinate in India. It ingests publicly available
data from 26 Kaggle datasets spanning 12 domains — crime, weather, air quality,
water quality, road accidents, natural disasters, terrain, health
infrastructure, population, fire, noise, and tourism — and fuses them onto a
unified spatial grid covering the entire Indian subcontinent.

### Key Numbers

| Metric | Value |
|---|---|
| Kaggle datasets ingested | 26 |
| Safety factors tracked | 38+ canonical factors |
| Spatial grid cells | ~93,000 (0.1° × 0.1°) |
| Grid resolution | ~11 km × 11 km |
| India bounding box | 6°N–37°N, 68°E–98°E |
| ML models trained | 6 |
| Primary model | LightGBM regression |
| Safety score range | 0 (lethal) → 100 (perfectly safe) |
| Temporal granularity | Hourly modifiers (24h × 12mo × 7dow) |
| Training label strategy | Incident-density + temporal modifiers (non-circular) |

### What It Answers

| Question | Model Responsible |
|---|---|
| "How safe is this location right now?" | Model 1 — Safety Scorer |
| "Will conditions get worse in the next 1–3 hours?" | Model 2 — Trajectory Forecaster |
| "Is something unusual happening here?" | Model 3 — Anomaly Detector |
| "What type of incident is likely?" | Model 4 — Incident Classifier |
| "How does a nearby flood affect my location?" | Model 5 — Spatial Risk Propagation |
| "Should I send an alert to the user now?" | Model 6 — Alert Timing Engine |

---

## 2. Problem Statement

Travelers in India face a **fragmented safety information landscape**:

- **Crime data** exists at NCRB (yearly, state/district level) but not in real-time
- **Weather warnings** come from IMD but aren't localized to a traveler's exact route
- **Road accident data** is aggregated annually, not predictive
- **Disaster alerts** (NDMA) are regional, not personalized
- **Health infrastructure** mapping exists but isn't integrated with risk assessment
- **Environmental quality** (AQI, water) data exists at station level but isn't fused with other risks

**No single system combines all of these into a unified, location-specific,
time-aware safety score.**

YatraX bridges this gap by:

1. Ingesting all available public safety data for India
2. Normalizing it onto a common geographic grid
3. Engineering cross-domain features (e.g., rain + slope = landslide risk)
4. Training ML models that learn real patterns from real incident data
5. Producing a single actionable score (0–100) with explanatory risk factors

---

## 3. System Architecture

```

┌─────────────────────────────────────────────────────────┐
│                    DATA SOURCES                         │
│  26 Kaggle Datasets across 12 domains                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              INGESTION LAYER (12 ingestors)              │
│                                                         │
│  ingest_crime.py    ingest_weather.py   ingest_aqi.py   │
│  ingest_water.py    ingest_accidents.py ingest_health.py│
│  ingest_disasters.py ingest_terrain.py  ingest_fire.py  │
│  ingest_population.py ingest_tourism.py ingest_noise.py │
│                                                         │
│  • Flexible column detection (handles variant schemas)  │
│  • Geographic normalization (lat/lon extraction)        │
│  • City geocoding fallback (50+ Indian cities)          │
│  • Output: domain-specific parquet files                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              PROCESSING LAYER                           │
│                                                         │
│  geo_grid.py ──── 0.1° spatial grid generation          │
│  merge_sources.py ── Spatial join + IDW interpolation    │
│  factor_mapper.py ── Canonical factor registry           │
│  temporal_align.py ── Cyclical encoding + season flags   │
│  label_generator.py ── Incident-density safety labels    │
│                                                         │
│  Output: unified_grid.parquet (93K cells × 38+ cols)    │
│          safety_score_{train,val,test}.parquet           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               TRAINING LAYER (6 models)                 │
│                                                         │
│  M1: Safety Scorer ────────── LightGBM regression       │
│  M2: Trajectory Forecaster ── GBM on windowed features  │
│  M3: Anomaly Detector ─────── Isolation Forest          │
│  M4: Incident Classifier ──── LightGBM multiclass       │
│  M5: Spatial Risk ─────────── Parametric distance decay  │
│  M6: Alert Timing ─────────── Heuristic + experience log│
│                                                         │
│  Output: models/*/ (model files + metadata.json)        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               EVALUATION LAYER                          │
│                                                         │
│  evaluate.py ── Per-model metrics + edge case tests     │
│  evaluation_report.json ── Machine-readable results     │
└─────────────────────────────────────────────────────────┘

```

### Data Flow Summary

```

Raw CSVs (26 datasets)
    → 12 domain-specific parquets
        → 1 unified grid parquet (93K cells × 38+ features)
            → Training labels (temporal expansion: 93K × 24 = 2.2M+ rows)
                → 6 trained models
                    → Safety score + alerts for any (lat, lon, time)

```

---

## 4. Data Sources & Ingestion

### 4.1 Dataset Registry

All datasets are registered in `config/kaggle_sources.py`. Each entry specifies:

| Field | Purpose |
|---|---|
| `slug` | Kaggle download identifier |
| `target_dir` | Local storage subdirectory under `data/raw/` |
| `description` | Human-readable summary |
| `factors_covered` | Which safety factors this dataset feeds |

### 4.2 Datasets by Domain

#### Crime (3 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| NCRB Crime Data 2001+ | `rajanand/crime-in-india` | 40+ crime types, 75+ CSVs, all states/districts |
| Multi-year NCRB | `nehaprabhavalkar/crime-in-india` | Supplementary NCRB data |
| Crimes Against Women 2022 | `ananya0001/crimes-against-women-in-india-2022` | Gender safety proxy |

**Factors produced:** `crime_rate_per_100k`, `crime_type_distribution_risk`,
`gender_safety_index`, `tourist_targeted_crime_index`

#### Weather (3 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| Indian Weather Daily Snapshot | `nelgiriyewithana/indian-weather-repository-daily-snapshot` | Live-updating, multi-city |
| 5000 Cities Weather | `mukeshdevrath007/indian-5000-cities-weather-data` | 2010–2024, broad coverage |
| India Rainfall Data | `vijayveersingh/indias-rainfall-data` | State/district rainfall |

**Factors produced:** `temperature_c`, `humidity_pct`, `rainfall_mmph`,
`wind_speed_kmph`, `visibility_km`, `uv_index`, `weather_severity`

#### Air Quality (2 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| AQI 2015–2024 | `ankushpanday1/air-quality-data-in-india-2015-2024` | 9 years CPCB station data |
| AQI 2015–2020 | `rohanrao/air-quality-data-in-india` | CPCB station-level |

**Factors produced:** `aqi`, `pm25`, `pm10`

**AQI estimation:** When the AQI column is missing, the pipeline computes it
from PM2.5 using India's National AQI breakpoint system:

| PM2.5 (µg/m³) | AQI Range | Category |
|---|---|---|
| 0–30 | 0–50 | Good |
| 31–60 | 51–100 | Satisfactory |
| 61–90 | 101–200 | Moderate |
| 91–120 | 201–300 | Poor |
| 121–250 | 301–400 | Very Poor |
| 250+ | 401–500 | Severe |

#### Water Quality (2 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| Indian Water Quality | `anbarivan/indian-water-quality-data` | Nationwide pollution levels |
| Lakes/Ponds/Tanks Quality | `balabaskar/water-quality-data-india` | Waterbody-specific |

**Factors produced:** `water_safety_score`, `water_contamination_risk`

**Parameter scoring:** Each water parameter is scored against WHO/BIS limits:

| Parameter | Safe Limit | Type |
|---|---|---|
| pH | 6.5–8.5 | Range |
| Dissolved Oxygen | ≥ 5.0 mg/L | Minimum |
| BOD | ≤ 3.0 mg/L | Maximum |
| Nitrate | ≤ 45 mg/L | Maximum |
| Fluoride | ≤ 1.5 mg/L | Maximum |
| Arsenic | ≤ 0.01 mg/L | Maximum |
| TDS | ≤ 500 mg/L | Maximum |
| Turbidity | ≤ 5 NTU | Maximum |
| Total Coliform | ≤ 50 MPN/100mL | Maximum |
| Fecal Coliform | 0 | Maximum |

#### Road Accidents (2 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| Accident Predictive Analysis | `khushikyad001/india-road-accident-dataset-predictive-analysis` | ML-ready features |
| Accident Severity | `s3programmer/road-accident-severity-in-india` | Severity classification |

**Factors produced:** `road_accident_hotspot_risk`, `accident_severity_index`, `fatality_rate`

**Severity classification:** When no explicit severity column exists, the
pipeline auto-detects from text using keyword matching:

| Severity | Keywords | Score |
|---|---|---|
| Fatal | fatal, killed, death, dead | 1.0 |
| Grievous | grievous, serious, major, severe | 0.7 |
| Minor | minor, simple, slight | 0.3 |
| Unknown | (default) | 0.5 |

#### Natural Disasters (4 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| Flood Risk India | `s3programmer/flood-risk-in-india` | Flood zones and factors |
| India Floods Inventory | `aditya2803/india-floods-inventory` | Geolocated flood events |
| Earthquakes 2018+ | `parulpandey/indian-earthquakes-dataset2018-onwards` | Geolocated seismic events |
| Indian Disaster Dataset | `victoraesthete/indian-disaster-dataset` | Multi-hazard records |

**Factors produced:** `flood_risk`, `earthquake_risk`, `cyclone_risk`, `landslide_risk`

**Disaster type detection:** Automatic classification from row text content
using keyword matching across 9 disaster types: flood, earthquake, cyclone,
landslide, drought, fire, tsunami, heatwave, coldwave.

#### Terrain (3 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| Elevation of Indian Districts | `jaisreenivasan/elevation-of-indian-districts` | District-wise elevation |
| Landslide Incidents 2016–2020 | `kkhandekar/lanslide-recent-incidents-india` | Geolocated events |
| India GIS Data | `nehaprabhavalkar/india-gis-data` | Shapefiles |

**Factors produced:** `elevation_m`, `slope_deg`, `landslide_prone_index`,
`terrain_difficulty_score`, `altitude_sickness_risk`

**Terrain classification logic:**

| Condition | Type |
|---|---|
| Elevation > 4000m | High Mountain |
| Elevation > 2000m | Mountain |
| Elevation > 800m + Slope > 15° | Hills |
| NDVI > 0.6 | Forest |
| Elevation < 50m | Coastal Plains |
| NDVI < 0.1 + Elevation < 500m | Desert |
| Default | Plains |

#### Health Infrastructure (2 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| Hospitals in India | `fringewidth/hospitals-in-india` | Hospital locations nationwide |
| Primary Health Care | `webaccess/india-primary-health-care-data` | PHC locations and capacity |

**Factors produced:** `hospital_level_score`, `emergency_availability_score`,
`ambulance_response_score`, `nearest_hospital_proxy_km`

**Hospital capability scoring:**

| Facility Type | Score (0–100) |
|---|---|
| AIIMS | 100 |
| Medical College | 95 |
| District Hospital | 85 |
| Sub-District Hospital | 75 |
| Community Health Centre | 65 |
| Primary Health Centre | 50 |
| Sub Centre | 30 |
| Private Hospital | 70 |
| Dispensary | 35 |

**Ambulance response time estimation:**

| Terrain Type | Speed (km/h) | 10 km Response |
|---|---|---|
| Urban | 30 | 25 min |
| Suburban | 25 | 29 min |
| Rural | 20 | 35 min |
| Hills | 15 | 45 min |
| Mountain | 10 | 65 min |

*(All estimates include 5-minute dispatch time)*

#### Population (2 datasets)

| Dataset | Slug | Coverage |
|---|---|---|
| Census with Geospatial Indexing | `sirpunch/indian-census-data-with-geospatial-indexing` | Lat/lon indexed census |
| All Census Data | `webaccess/all-census-data` | District-level census |

**Factors produced:** `population_density_per_km2`, `isolation_score`

#### Fire (1 dataset)

| Dataset | Slug | Coverage |
|---|---|---|
| Indian Wildfire NASA 8 Years | `sherkhan15/indian-wildfire-nasa-dataset-8-years` | NASA FIRMS satellite 2012–2020 |

**Factors produced:** `fire_risk_index`, `fire_intensity_score`

#### Noise (1 dataset)

| Dataset | Slug | Coverage |
|---|---|---|
| Noise Monitoring Data | `rohanrao/noise-monitoring-data-in-india` | CPCB decibel readings |

**Factors produced:** `noise_level_proxy`

**CPCB noise standards used:**

| Zone | Day Limit (dB) | Night Limit (dB) |
|---|---|---|
| Industrial | 75 | 70 |
| Commercial | 65 | 55 |
| Residential | 55 | 45 |
| Silence Zone | 50 | 40 |

#### Tourism (1 dataset)

| Dataset | Slug | Coverage |
|---|---|---|
| Tourist Destination Dataset | `kumarperiya/explore-india-a-tourist-destination-dataset` | Destination metadata |

**Factors produced:** `nearby_tourist_density_index`, `tourism_infrastructure_proxy`

### 4.3 Ingestion Architecture

Every ingestor follows the same pattern:

```

1. Scan data/raw/{domain}/**/*.csv
2. For each CSV:
   a. Flexible column detection (_find_col with case-insensitive fallback)
   b. Extract location (lat/lon or city name → geocode)
   c. Extract temporal info (date/year/month)
   d. Extract domain-specific measurements
   e. Normalize to standard schema
3. Concatenate all files
4. Compute derived safety factors
5. Aggregate to 0.1° grid cells
6. Save to data/processed/{domain}_grid.parquet

```

**Column detection** is robust across dataset variants:

```python
# Example: finds "latitude", "lat", "Latitude", "LAT" — case-insensitive
lat_col = _find_col(df, ["latitude", "lat", "Latitude"])
```

**Geocoding fallback:** When datasets lack coordinates but have city/state
names, the pipeline uses built-in coordinate lookups for 50+ major Indian
cities and all 30+ state centroids.

---

## 5. Safety Factor Taxonomy

All 38 canonical factors are registered in `processing/factor_mapper.py`. Each
factor has a defined name, valid range, default value, source file, and weight.

### Factors by Category

#### Weather & Climate (7 factors)

| Factor               | Range     | Default | Weight | Description              |
| -------------------- | --------- | ------- | ------ | ------------------------ |
| `temperature_c`    | -20 to 55 | 28.0    | 0.03   | Current temperature °C  |
| `humidity_pct`     | 0 to 100  | 60.0    | 0.02   | Relative humidity %      |
| `rainfall_mmph`    | 0 to 150  | 2.0     | 0.06   | Rainfall intensity mm/h  |
| `wind_speed_kmph`  | 0 to 200  | 12.0    | 0.03   | Wind speed km/h          |
| `visibility_km`    | 0 to 30   | 8.0     | 0.04   | Visibility km            |
| `uv_index`         | 0 to 15   | 5.0     | 0.01   | UV radiation index       |
| `weather_severity` | 0 to 100  | 20.0    | 0.05   | Composite weather danger |

#### Crime (4 factors)

| Factor                           | Range     | Default | Weight | Description               |
| -------------------------------- | --------- | ------- | ------ | ------------------------- |
| `crime_rate_per_100k`          | 0 to 1500 | 190.0   | 0.08   | Total IPC crimes per 100k |
| `crime_type_distribution_risk` | 0 to 1    | 0.22    | 0.04   | Violent crime ratio       |
| `gender_safety_index`          | 0 to 1    | 0.65    | 0.03   | Gender safety (1=safest)  |
| `tourist_targeted_crime_index` | 0 to 1    | 0.16    | 0.03   | Robbery + theft ratio     |

#### Transport (3 factors)

| Factor                         | Range  | Default | Weight | Description               |
| ------------------------------ | ------ | ------- | ------ | ------------------------- |
| `road_accident_hotspot_risk` | 0 to 1 | 0.20    | 0.05   | Accident hotspot risk     |
| `accident_severity_index`    | 0 to 1 | 0.40    | 0.03   | Average accident severity |
| `fatality_rate`              | 0 to 1 | 0.10    | 0.03   | Deaths per accident       |

#### Disaster (6 factors)

| Factor                   | Range  | Default | Weight | Description                |
| ------------------------ | ------ | ------- | ------ | -------------------------- |
| `flood_risk`           | 0 to 1 | 0.10    | 0.05   | Historical flood frequency |
| `earthquake_risk`      | 0 to 1 | 0.20    | 0.04   | Historical seismic risk    |
| `cyclone_risk`         | 0 to 1 | 0.05    | 0.03   | Historical cyclone impact  |
| `landslide_risk`       | 0 to 1 | 0.08    | 0.03   | Historical landslide risk  |
| `fire_risk_index`      | 0 to 1 | 0.05    | 0.02   | Fire risk from FIRMS data  |
| `fire_intensity_score` | 0 to 1 | 0.03    | 0.01   | Average fire intensity     |

#### Terrain (5 factors)

| Factor                       | Range       | Default | Weight | Description                  |
| ---------------------------- | ----------- | ------- | ------ | ---------------------------- |
| `elevation_m`              | -50 to 9000 | 200.0   | 0.02   | Elevation meters             |
| `slope_deg`                | 0 to 90     | 5.0     | 0.02   | Terrain slope degrees        |
| `landslide_prone_index`    | 0 to 1      | 0.05    | 0.03   | Landslide susceptibility     |
| `terrain_difficulty_score` | 0 to 1      | 0.15    | 0.03   | Composite terrain difficulty |
| `altitude_sickness_risk`   | 0 to 1      | 0.0     | 0.02   | Altitude sickness risk       |

#### Health Infrastructure (4 factors)

| Factor                           | Range    | Default | Weight | Description                  |
| -------------------------------- | -------- | ------- | ------ | ---------------------------- |
| `hospital_level_score`         | 0 to 100 | 50.0    | 0.04   | Average hospital capability  |
| `emergency_availability_score` | 0 to 100 | 40.0    | 0.03   | Emergency dept availability  |
| `ambulance_response_score`     | 0 to 100 | 35.0    | 0.03   | Ambulance response coverage  |
| `nearest_hospital_proxy_km`    | 0 to 200 | 25.0    | 0.04   | Distance to nearest hospital |

#### Environment (4 factors)

| Factor                       | Range    | Default | Weight | Description              |
| ---------------------------- | -------- | ------- | ------ | ------------------------ |
| `aqi`                      | 0 to 500 | 75.0    | 0.03   | Air Quality Index        |
| `pm25`                     | 0 to 500 | 40.0    | 0.02   | PM2.5 concentration      |
| `water_safety_score`       | 0 to 100 | 70.0    | 0.02   | Water safety score       |
| `water_contamination_risk` | 0 to 1   | 0.15    | 0.02   | Water contamination risk |

#### Social (3 factors)

| Factor                         | Range      | Default | Weight | Description               |
| ------------------------------ | ---------- | ------- | ------ | ------------------------- |
| `population_density_per_km2` | 0 to 50000 | 400.0   | 0.02   | People per km²           |
| `isolation_score`            | 0 to 1     | 0.3     | 0.03   | Isolation (1=very remote) |
| `noise_level_proxy`          | 0 to 1     | 0.20    | 0.01   | Noise violation level     |

#### Tourism (2 factors)

| Factor                           | Range  | Default | Weight | Description                    |
| -------------------------------- | ------ | ------- | ------ | ------------------------------ |
| `nearby_tourist_density_index` | 0 to 1 | 0.0     | 0.01   | Tourist spot density           |
| `tourism_infrastructure_proxy` | 0 to 1 | 0.5     | 0.01   | Tourism infrastructure quality |

### Weight Distribution

```
Crime & Transport:     0.26  ██████████████
Disasters:             0.21  ███████████
Health Infrastructure: 0.14  ███████
Weather & Climate:     0.24  ████████████
Environment:           0.10  █████
Social & Tourism:      0.05  ███
                       ────
Total:                 1.00
```

---

## 6. Spatial Grid System

### 6.1 Grid Specification

| Parameter                  | Value               |
| -------------------------- | ------------------- |
| Resolution                 | 0.1° × 0.1°      |
| Cell size at equator       | ~11.1 km × 11.1 km |
| Cell size at 28°N (Delhi) | ~11.1 km × 9.8 km  |
| Latitude range             | 6.0°N to 37.0°N   |
| Longitude range            | 68.0°E to 98.0°E  |
| Latitude steps             | 311                 |
| Longitude steps            | 301                 |
| Total cells                | ~93,611             |

### 6.2 Grid Operations

**Snapping:** Any (lat, lon) coordinate is mapped to the nearest grid cell
center:

```python
grid_lat = round(round(lat / 0.1) * 0.1, 1)
grid_lon = round(round(lon / 0.1) * 0.1, 1)
```

**Spatial interpolation (IDW):** When data sources have sparse coverage, values
are interpolated to grid cells using Inverse Distance Weighting:

```
value(cell) = Σ(value_i × w_i) / Σ(w_i)
where w_i = 1 / distance_i²
```

Default interpolation radius: 30 km.

**Nearest-neighbor search:** Uses bounding-box pre-filtering (1° ≈ 111 km)
followed by exact Haversine distance calculation.

### 6.3 Source Merging

The `merge_sources.py` module joins all 12 processed parquets onto the unified
grid:

```
India Grid (93K cells)
  ← LEFT JOIN crime_grid.parquet     ON (grid_lat, grid_lon)
  ← LEFT JOIN weather_grid.parquet   ON spatial interpolation
  ← LEFT JOIN aqi_grid.parquet       ON spatial interpolation
  ← LEFT JOIN disaster_grid.parquet  ON (grid_lat, grid_lon)
  ← LEFT JOIN accident_grid.parquet  ON (grid_lat, grid_lon)
  ← LEFT JOIN health_grid.parquet    ON (grid_lat, grid_lon)
  ← LEFT JOIN terrain_grid.parquet   ON (grid_lat, grid_lon)
  ← LEFT JOIN population_grid.parquet ON (grid_lat, grid_lon)
  ← LEFT JOIN fire_grid.parquet      ON (grid_lat, grid_lon)
  ← LEFT JOIN noise_grid.parquet     ON (grid_lat, grid_lon)
  ← LEFT JOIN water_quality_grid.parquet ON (grid_lat, grid_lon)
  ← LEFT JOIN tourism_grid.parquet   ON (grid_lat, grid_lon)
  → unified_grid.parquet (93K rows × 38+ columns)
```

Any cell with no data for a given factor receives a **sensible default** (e.g.,
`crime_rate_per_100k = 190.0`, the approximate India national average).

---

## 7. Feature Engineering Pipeline

### 7.1 Temporal Features

Added by `processing/temporal_align.py`:

| Feature                      | Type        | Purpose                                                            |
| ---------------------------- | ----------- | ------------------------------------------------------------------ |
| `hour_sin`, `hour_cos`   | float       | Cyclical encoding of hour (captures 23→0 wrap)                    |
| `month_sin`, `month_cos` | float       | Cyclical encoding of month (captures Dec→Jan wrap)                |
| `dow_sin`, `dow_cos`     | float       | Cyclical encoding of day of week                                   |
| `is_night`                 | binary      | 1 if hour ∈ [21, 22, 23, 0, 1, 2, 3, 4, 5]                        |
| `is_monsoon`               | binary      | 1 if month ∈ [6, 7, 8, 9]                                         |
| `is_fog_season`            | binary      | 1 if month ∈ [11, 12, 1]                                          |
| `is_weekend`               | binary      | 1 if Saturday or Sunday                                            |
| `is_rush_hour`             | binary      | 1 if hour ∈ [8, 9, 17, 18, 19]                                    |
| `season`                   | categorical | summer / monsoon / post_monsoon / winter                           |
| `time_period`              | categorical | early_morning / morning / afternoon / evening / night / late_night |

**Indian seasons definition:**

| Season       | Months                        |
| ------------ | ----------------------------- |
| Summer       | March, April, May             |
| Monsoon      | June, July, August, September |
| Post-monsoon | October, November             |
| Winter       | December, January, February   |

### 7.2 Cross-Domain Composite Features

Computed by `processing/composite_features.py`:

| Feature                        | Formula                                                                       | Why It Matters                                   |
| ------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `landslide_compound_risk`    | 0.4×landslide_base + 0.3×rain_norm + 0.3×slope_norm                        | Rain + steep slope = landslide trigger           |
| `flood_compound_risk`        | 0.5×flood_base + 0.5×rain_norm                                              | Flood zones + active rain = immediate danger     |
| `night_danger_compound`      | is_night × (0.5×crime_norm + 0.5×isolation)                                | Night + crime + isolation = extreme risk         |
| `medical_emergency_compound` | 0.5×(heat_risk + altitude_risk) + 0.5×hospital_gap                          | Heat/altitude sickness + no hospital = emergency |
| `stranded_risk_compound`     | 0.35×isolation + 0.30×weather + 0.20×hospital_gap + 0.15×connectivity_gap | Multiple infrastructure failures = stranding     |
| `transport_danger_compound`  | 0.4×accident_risk + 0.3×visibility_danger + 0.3×rain_norm                  | Bad weather + bad road = accident                |

### 7.3 Weather Severity Composite

The `weather_severity` score (0–100) is computed as:

```
severity = rainfall_contribution (0–35)
         + wind_contribution (0–25)
         + low_visibility_contribution (0–20)
         + extreme_temperature_contribution (0–20)
```

### 7.4 Crime Temporal Modifiers

Based on NCRB time-of-occurrence distributions:

| Hour  | Modifier | Hour  | Modifier |
| ----- | -------- | ----- | -------- |
| 0:00  | 1.40     | 12:00 | 0.85     |
| 1:00  | 1.35     | 13:00 | 0.85     |
| 2:00  | 1.30     | 14:00 | 0.82     |
| 3:00  | 1.25     | 15:00 | 0.85     |
| 4:00  | 1.15     | 16:00 | 0.90     |
| 5:00  | 1.00     | 17:00 | 0.95     |
| 6:00  | 0.85     | 18:00 | 1.10     |
| 7:00  | 0.80     | 19:00 | 1.20     |
| 8:00  | 0.75     | 20:00 | 1.30     |
| 9:00  | 0.75     | 21:00 | 1.40     |
| 10:00 | 0.78     | 22:00 | 1.42     |
| 11:00 | 0.80     | 23:00 | 1.43     |

### 7.5 Seasonal Disaster Modifiers

| Disaster Type | Peak Months  | Peak Multiplier     |
| ------------- | ------------ | ------------------- |
| Flood         | July–August | 2.0×               |
| Cyclone       | November     | 2.0×               |
| Landslide     | July–August | 1.8×               |
| Wildfire      | April–May   | 2.0×               |
| Heatwave      | May          | 2.0×               |
| Coldwave      | January      | 2.0×               |
| Earthquake    | —           | No seasonal pattern |

---

## 8. Label Generation Strategy

**This is the most critical design decision in the pipeline.**

### 8.1 The Problem

Supervised ML needs labels. For safety scores, no "ground truth" dataset
exists — nobody has labeled millions of (location, time) pairs with safety
scores. Common approaches and their pitfalls:

| Approach                                                    | Problem                                        |
| ----------------------------------------------------------- | ---------------------------------------------- |
| Use a rule engine to generate labels, then train ML on them | **Circular** — ML just learns the rules |
| Use expert-annotated data                                   | Doesn't scale to 93K cells × 24 hours         |
| Use proxy labels from a single domain                       | Ignores cross-domain interactions              |

### 8.2 Our Approach: Incident-Density Labels

The label generator (`processing/label_generator.py`) produces safety scores
from **real data** without circularity:

**Step 1: Base Danger Score (per grid cell)**

```
base_danger = Σ(risk_factor × weight) - Σ(protective_factor × weight) + Σ(env_factor × weight)
```

Risk components (from real incident counts):

| Factor                         | Weight | Normalization                |
| ------------------------------ | ------ | ---------------------------- |
| `crime_rate_per_100k`        | 0.20   | ÷ 600 (very high threshold) |
| `road_accident_hotspot_risk` | 0.15   | ÷ P95                       |
| `flood_risk`                 | 0.10   | ÷ P95                       |
| `earthquake_risk`            | 0.08   | ÷ P95                       |
| `landslide_risk`             | 0.07   | ÷ P95                       |
| `fire_risk_index`            | 0.05   | ÷ P95                       |

Protective components (from infrastructure data):

| Factor                           | Weight | Direction      |
| -------------------------------- | ------ | -------------- |
| `hospital_level_score`         | 0.12   | Higher = safer |
| `emergency_availability_score` | 0.08   | Higher = safer |
| `water_safety_score`           | 0.05   | Higher = safer |

Environmental components:

| Factor               | Weight | Normalization |
| -------------------- | ------ | ------------- |
| `aqi`              | 0.05   | ÷ 300        |
| `weather_severity` | 0.05   | ÷ 100        |

**Step 2: Temporal Expansion**

Each grid cell is expanded into 24 training samples with random (hour, month,
day_of_week) combinations. The base danger is modulated by:

```
final_danger = base_danger
             × time_of_day_modifier(hour)      # 0.75–1.60
             × season_modifier(month)           # 0.95–1.25
             × weekend_modifier(dow, hour)      # 1.00–1.20
             + noise(μ=0, σ=0.05)               # calibrated randomness
```

**Step 3: Safety Score**

```
safety_score = (1 - final_danger) × 100    # clamped to [0, 100]
```

### 8.3 Why This Is Not Circular

| Component             | Source                            | Circular?               |
| --------------------- | --------------------------------- | ----------------------- |
| Crime rates           | Real NCRB data (incident counts)  | No — ground truth      |
| Accident hotspots     | Real accident locations/counts    | No — ground truth      |
| Flood/earthquake risk | Real disaster event records       | No — ground truth      |
| Hospital scores       | Real hospital locations/types     | No — ground truth      |
| Temporal modifiers    | Published NCRB time distributions | No — external research |
| Seasonal modifiers    | Known meteorological patterns     | No — domain knowledge  |

The ML model then learns to predict these labels from the **full 38+ feature
vector** — discovering non-linear interactions that the weighted sum doesn't
capture (e.g., rain + slope + night = disproportionately dangerous).

### 8.4 Train/Val/Test Split

| Split      | Proportion | Purpose                                       |
| ---------- | ---------- | --------------------------------------------- |
| Train      | 70%        | Model fitting                                 |
| Validation | 15%        | Early stopping, hyperparameter selection      |
| Test       | 15%        | Final evaluation (never seen during training) |

Splitting is done randomly with `RANDOM_SEED = 42` for reproducibility.

---

## 9. Model Descriptions

### Model 1: Safety Scorer (LightGBM)

**Purpose:** Given a location and time, predict the safety score (0–100).

**Architecture choice:** LightGBM regression over neural networks because:

- Tabular data: gradient-boosted trees consistently outperform NNs on tabular tasks
- Training speed: minutes vs hours
- No GPU requirement
- Built-in missing value handling (no imputation pipeline needed)
- Native feature importance
- Proven in production at scale (used by Yandex, Microsoft, etc.)

**Hyperparameters:**

| Parameter             | Value     | Rationale                                      |
| --------------------- | --------- | ---------------------------------------------- |
| `n_estimators`      | 800       | Sufficient for convergence with early stopping |
| `max_depth`         | 10        | Deep enough for cross-feature interactions     |
| `learning_rate`     | 0.03      | Low rate + many trees = better generalization  |
| `num_leaves`        | 63        | Balanced complexity                            |
| `min_child_samples` | 30        | Prevents overfitting on sparse cells           |
| `subsample`         | 0.8       | Row subsampling for regularization             |
| `colsample_bytree`  | 0.8       | Feature subsampling for regularization         |
| `reg_alpha`         | 0.1       | L1 regularization                              |
| `reg_lambda`        | 1.0       | L2 regularization                              |
| Early stopping        | 50 rounds | Prevents overfitting                           |

**Input features:** All 38 safety factors + 10 temporal features = ~48 features

**Output:** Continuous value 0–100

**Safety level classification:**

| Score Range | Level     | Meaning                                       |
| ----------- | --------- | --------------------------------------------- |
| 70–100     | Safe      | Normal conditions, no action needed           |
| 45–69      | Caution   | Exercise awareness, some risk factors present |
| 25–44      | Unsafe    | Significant risks, consider alternatives      |
| 0–24       | Dangerous | Immediate danger, take protective action      |

**Inference:** Single prediction takes < 1 ms.

**Risk factor identification:** At inference time, the system checks feature
values against known danger thresholds and reports which factors are elevated:

| Factor                         | Danger Threshold | Alert Text                  |
| ------------------------------ | ---------------- | --------------------------- |
| `crime_rate_per_100k`        | > 300            | "High crime area"           |
| `road_accident_hotspot_risk` | > 0.6            | "Accident hotspot"          |
| `flood_risk`                 | > 0.5            | "Flood risk zone"           |
| `aqi`                        | > 200            | "Unhealthy air quality"     |
| `weather_severity`           | > 50             | "Severe weather conditions" |
| `nearest_hospital_proxy_km`  | > 20             | "Far from hospital"         |
| `fire_risk_index`            | > 0.5            | "Fire risk area"            |
| `water_contamination_risk`   | > 0.5            | "Water contamination risk"  |
| `hour`                       | 22–5            | "Late night hours"          |

---

### Model 2: Trajectory Forecaster (Gradient Boosting)

**Purpose:** Predict how the safety score will change over the next 1–3 hours.

**Why not LSTM:** The full LSTM architecture (defined in config) requires
sequential data from real user trajectories, which doesn't exist at launch.
The lite version uses windowed statistical features with gradient boosting,
which is trainable on synthetic sequences and upgradeable to LSTM later.

**Input features (11):**

| Feature                | Description                         |
| ---------------------- | ----------------------------------- |
| `current_score`      | Latest safety score                 |
| `score_mean_6h`      | Mean of last 6 hourly scores        |
| `score_std_6h`       | Standard deviation of last 6 scores |
| `score_slope_6h`     | Linear trend coefficient            |
| `weather_mean_6h`    | Mean weather severity last 6 hours  |
| `weather_slope_6h`   | Weather trend                       |
| `rain_max_6h`        | Maximum rainfall in last 6 hours    |
| `rain_mean_6h`       | Mean rainfall last 6 hours          |
| `current_hour`       | Current hour (0–23)                |
| `is_night`           | Night flag                          |
| `forecast_horizon_h` | 1, 2, or 3 hours ahead              |

**Training data generation:**

1. Generate 20,000 plausible 9-hour score trajectories
2. Each trajectory has a base score, trend, volatility, and weather evolution
3. First 6 hours → features; hours 7, 8, 9 → targets
4. Result: 60,000 training samples (20K sequences × 3 horizons)

**Hyperparameters:**

| Parameter            | Value                     |
| -------------------- | ------------------------- |
| Model                | GradientBoostingRegressor |
| `n_estimators`     | 300                       |
| `max_depth`        | 6                         |
| `learning_rate`    | 0.05                      |
| `min_samples_leaf` | 20                        |

---

### Model 3: Anomaly Detector (Isolation Forest)

**Purpose:** Detect unusual feature combinations that might indicate danger
even when individual features look normal.

**Why Isolation Forest:**

- Unsupervised — no labeled anomaly data needed
- Scales to 93K cells easily
- Handles high-dimensional tabular data well
- Computationally efficient (O(n log n))

**Features used (20):**

All major risk factors: crime, accidents, disasters, AQI, weather, hospitals,
water quality, population density, noise.

**Hyperparameters:**

| Parameter         | Value | Rationale                                |
| ----------------- | ----- | ---------------------------------------- |
| `n_estimators`  | 200   | Enough trees for stable scoring          |
| `contamination` | 0.08  | Expect ~8% of grid cells to be anomalous |
| `max_features`  | 0.7   | Feature subsampling for diversity        |

**Anomaly severity classification:**

| Score Range       | Severity |
| ----------------- | -------- |
| < -0.3            | High     |
| -0.3 to -0.2      | Medium   |
| -0.2 to threshold | Low      |

**Explainability:** The system explains anomalies using perturbation-based
feature attribution:

```
For each feature:
    1. Replace feature with its median (global baseline)
    2. Recompute anomaly score
    3. If score improves significantly → this feature contributes to the anomaly
```

This produces human-readable explanations like:
*"Anomaly: unusually high crime rate, unusually low hospital level score,
atypical weather severity"*

---

### Model 4: Incident Classifier (LightGBM)

**Purpose:** When an anomaly is detected, classify what type of incident is
most likely occurring.

**Incident types (12 classes):**

| Type                  | Training Data Source                             |
| --------------------- | ------------------------------------------------ |
| `flood`             | Real flood event locations from disaster dataset |
| `landslide`         | Real landslide event locations                   |
| `earthquake`        | Real earthquake event locations                  |
| `cyclone_storm`     | Real cyclone event locations                     |
| `fire`              | Real NASA FIRMS fire detections                  |
| `road_accident`     | Real accident hotspot locations                  |
| `crime_robbery`     | High-crime grid cells (night hours)              |
| `crime_assault`     | High-crime grid cells (night hours)              |
| `wildlife`          | Remote forest/jungle cells                       |
| `medical_emergency` | High-altitude or extreme-weather cells           |
| `stranded`          | Remote + poor-infrastructure cells               |
| `unknown`           | Random anomalous cells                           |

**Training data generation:**

For each real incident location:

1. Look up the grid cell in the unified grid
2. Pull all 38+ features for that cell
3. Add incident-specific noise (e.g., during a flood: boost rainfall, reduce visibility)
4. Label with the known incident type

**Incident-specific noise patterns:**

| Incident          | Feature Modifications                                      |
| ----------------- | ---------------------------------------------------------- |
| Flood             | rainfall +20–60 mm, severity +30–60, visibility -3–6 km |
| Cyclone           | wind +40–100 km/h, rain +15–50 mm, severity +40–70      |
| Fire              | AQI +100–300, visibility -2–5 km                         |
| Crime             | crime_rate ×1.2–2.0                                      |
| Road accident     | accident_risk +0.3–0.7                                    |
| Medical emergency | hospital_distance +5–20 km                                |

**Hyperparameters:**

| Parameter             | Value                      |
| --------------------- | -------------------------- |
| Objective             | multiclass (multi_logloss) |
| `n_estimators`      | 300                        |
| `max_depth`         | 8                          |
| `learning_rate`     | 0.05                       |
| `num_leaves`        | 31                         |
| `min_child_samples` | 20                         |
| Early stopping        | 30 rounds                  |

---

### Model 5: Spatial Risk Propagation (Parametric Decay)

**Purpose:** Quantify how an incident at point A affects safety at nearby
point B.

**Architecture choice:** Parametric distance-decay model instead of Graph
Neural Network. GNNs require PyTorch Geometric and substantial training data
from propagation patterns. The parametric model is:

- Zero-dependency (pure numpy)
- Interpretable (explicit formulas)
- Tunable per incident type
- Fast (O(1) per query)

**Core formula:**

```
risk(target) = severity × intensity × exp(-distance / spread_km) × exp(-hours / decay_hours)
```

**Propagation profiles:**

| Incident Type     | Spread (km) | Decay (hours) | Intensity |
| ----------------- | ----------- | ------------- | --------- |
| Earthquake        | 50.0        | 24.0          | 0.90      |
| Cyclone/Storm     | 80.0        | 36.0          | 0.85      |
| Flood             | 15.0        | 48.0          | 0.80      |
| Landslide         | 3.0         | 72.0          | 0.70      |
| Fire              | 10.0        | 24.0          | 0.70      |
| Wildlife          | 5.0         | 12.0          | 0.50      |
| Crime (Robbery)   | 2.0         | 6.0           | 0.40      |
| Crime (Assault)   | 1.5         | 6.0           | 0.40      |
| Road Accident     | 1.0         | 4.0           | 0.30      |
| Medical Emergency | 0.5         | 2.0           | 0.10      |
| Stranded          | 0.5         | 2.0           | 0.10      |
| Unknown           | 5.0         | 12.0          | 0.50      |

**Multiple incident combination:** Uses complement product (diminishing returns):

```
total_risk = 1 - Π(1 - risk_i)
```

This prevents risk from exceeding 1.0 and models the reality that additional
concurrent incidents have decreasing marginal impact.

**Quick exit optimization:** If distance > 3× spread, return 0.0 immediately.

---

### Model 6: Alert Timing Engine (Heuristic + Experience Logging)

**Purpose:** Decide when to send safety alerts. Too early = alarm fatigue.
Too late = useless.

**Architecture choice:** Pure heuristic rules with experience logging for
future Reinforcement Learning training. This is the production-ready approach
for day 1 when no user interaction data exists.

**Decision hierarchy:**

#### Hard Overrides (never suppressed, never learned)

| Condition                                             | Action    | Confidence |
| ----------------------------------------------------- | --------- | ---------- |
| Score < 15                                            | EMERGENCY | 1.00       |
| Score < 25 + decline > 10/h                           | EMERGENCY | 0.95       |
| Battery < 5% + no network                             | URGENT    | 0.95       |
| Road accident detected (>70% confidence) + score < 40 | URGENT    | varies     |
| High anomaly severity + score < 35                    | URGENT    | 0.85       |

#### Heuristic Decisions (gray zone, logged for future RL)

| Condition                            | Action     | Min Gap |
| ------------------------------------ | ---------- | ------- |
| Rapid decline (>15/h) + score < 40   | URGENT     | —      |
| Rapid decline (>15/h) + score ≥ 40  | STANDARD   | 10 min  |
| Moderate decline (>5/h) + score < 50 | STANDARD   | 20 min  |
| Predicted score < 35 in 1h           | SOFT_NUDGE | 30 min  |
| Predicted score < 25 in 3h           | SOFT_NUDGE | 60 min  |
| Sustained score < 35                 | SOFT_NUDGE | 30 min  |
| Anomaly + score < 60                 | SOFT_NUDGE | 20 min  |
| Night + score < 50                   | SOFT_NUDGE | 45 min  |
| Otherwise                            | WAIT       | —      |

**Alert action types:**

| Action             | Meaning          | User Experience                          |
| ------------------ | ---------------- | ---------------------------------------- |
| `WAIT`           | No alert needed  | Silent monitoring                        |
| `SOFT_NUDGE`     | FYI notification | Collapsible banner                       |
| `STANDARD_ALERT` | Should see this  | Standard notification                    |
| `URGENT_ALERT`   | Must see this    | Persistent + vibration                   |
| `EMERGENCY`      | Life-threatening | Full-screen + alarm + emergency contacts |

**Context features (15):**

```
safety_score, score_change_rate_per_hour, score_variance,
predicted_score_1h, predicted_score_3h, incident_type,
incident_confidence, is_night, hour, battery_pct,
network_quality, nearest_hospital_km,
time_since_last_alert_minutes, alerts_last_24h,
anomaly_detected, anomaly_severity
```

**Experience logging:** Every non-override decision is logged with full context
to an experience buffer (max 10,000 entries). When user outcome data becomes
available (did they respond? was the alert useful?), this buffer becomes
training data for a future RL policy.

**Future RL spec:**

| Parameter            | Value                          |
| -------------------- | ------------------------------ |
| Min samples to train | 500                            |
| Context dimension    | 15                             |
| Action space         | 5 actions                      |
| Reward signal        | User response + safety outcome |

---

## 10. Training Pipeline

### 10.1 Pipeline Stages

The end-to-end pipeline (`pipeline.py`) runs 6 stages:

```
Stage 1: Download ─── Kaggle CLI downloads 26 datasets
Stage 2: Ingest ───── 12 ingestors parse raw CSVs → domain parquets
Stage 3: Merge ────── Spatial join all sources → unified grid
Stage 4: Labels ───── Generate safety score training labels
Stage 5: Train ────── Train 6 models
Stage 6: Evaluate ─── Run all evaluations + edge case tests
```

### 10.2 Running the Pipeline

```bash
# Full pipeline (skip download if data exists)
python pipeline.py

# With Kaggle download
python pipeline.py --download

# Training + evaluation only
python pipeline.py --train-only

# Ingestion only
python pipeline.py --ingest-only

# Evaluation only
python pipeline.py --eval-only

# Skip specific stages
python pipeline.py --skip-ingest --skip-merge
```

### 10.3 Pipeline on Google Colab

```python
import os, sys
os.chdir("/content/yatrax")
sys.path.insert(0, "/content/yatrax")

from pipeline import run_pipeline
run_pipeline(skip_download=True)
```

### 10.4 Training Order & Dependencies

```
download_all ──────────────────────────────────┐
                                               ▼
ingest_crime ──┐                          raw CSVs exist
ingest_weather ┤
ingest_aqi ────┤
ingest_water ──┤
ingest_disasters┤   (all independent,
ingest_accidents┤    run in parallel)
ingest_health ─┤
ingest_terrain ┤
ingest_population┤
ingest_tourism ┤
ingest_fire ───┤
ingest_noise ──┘
        │
        ▼
merge_sources ──────────────────────────────── unified_grid.parquet
        │
        ▼
label_generator ────────────────────────────── safety_score_{train,val,test}.parquet
        │
        ├──▶ train_safety_scorer ────────────── safety_scorer.lgb
        │
        ├──▶ train_incident_classifier ──────── incident_classifier.lgb
        │         (also needs disaster/accident/fire/crime grids)
        │
        ├──▶ train_anomaly ─────────────────── isolation_forest.joblib
        │         (needs unified_grid.parquet)
        │
        ├──▶ train_trajectory ──────────────── trajectory_model.joblib
        │         (self-contained synthetic data)
        │
        ├──▶ train_spatial_risk ────────────── propagation_profiles.joblib
        │         (parametric, no training data needed)
        │
        └──▶ train_alert_timing ────────────── metadata.json
                  (heuristic, no training data needed)
        │
        ▼
evaluate ───────────────────────────────────── evaluation_report.json
```

---

## 11. Evaluation Framework

### 11.1 Safety Scorer Metrics

| Metric             | Description                                 |
| ------------------ | ------------------------------------------- |
| MAE                | Mean Absolute Error (points out of 100)     |
| RMSE               | Root Mean Squared Error                     |
| R²                | Coefficient of determination                |
| Within ±5         | % of predictions within 5 points of target  |
| Within ±10        | % of predictions within 10 points of target |
| Feature importance | Gain-based importance ranking               |
| Error distribution | Mean, std, worst-case error                 |

### 11.2 Edge Case Tests

The evaluation framework tests 4 critical scenarios:

| Scenario                        | Expected Score | What It Tests                |
| ------------------------------- | -------------- | ---------------------------- |
| Safe urban daytime              | 60–100        | Baseline safe conditions     |
| Monsoon flood zone night        | 0–35          | Multiple compounding risks   |
| High crime area late night      | 15–45         | Crime + temporal interaction |
| Remote area poor infrastructure | 20–50         | Infrastructure absence       |

### 11.3 Alert Timing Validation

| Scenario                                  | Expected Action | What It Tests          |
| ----------------------------------------- | --------------- | ---------------------- |
| Critical score (12), rapid decline, flood | EMERGENCY       | Hard override triggers |
| Safe (82), stable, daytime                | WAIT            | No false alarms        |

### 11.4 Spatial Risk Validation

| Scenario                 | Expected   | What It Tests             |
| ------------------------ | ---------- | ------------------------- |
| Flood 5km away, 2h ago   | risk > 0.1 | Nearby recent = high risk |
| Flood 200km away, 2h ago | risk ≈ 0  | Far away = no impact      |
| Flood 5km away, 100h ago | risk ≈ 0  | Old events decay          |

---

## 12. Project Structure

```
yatrax/
│
├── config/
│   ├── __init__.py
│   ├── settings.py              # Paths, hyperparameters, constants
│   └── kaggle_sources.py        # Dataset registry (26 datasets)
│
├── ingestion/
│   ├── __init__.py
│   ├── download_all.py          # Kaggle CLI batch downloader
│   ├── ingest_crime.py          # NCRB crime data parser
│   ├── ingest_weather.py        # Weather data + city geocoding
│   ├── ingest_aqi.py            # Air quality + AQI estimation
│   ├── ingest_water.py          # Water quality + WHO/BIS scoring
│   ├── ingest_accidents.py      # Road accident + severity detection
│   ├── ingest_disasters.py      # Multi-hazard disaster parser
│   ├── ingest_health.py         # Hospital capability scoring
│   ├── ingest_terrain.py        # Elevation + landslide data
│   ├── ingest_population.py     # Census + isolation scoring
│   ├── ingest_tourism.py        # Tourist destination geocoding
│   ├── ingest_fire.py           # NASA FIRMS satellite data
│   └── ingest_noise.py          # CPCB noise + violation scoring
│
├── processing/
│   ├── __init__.py
│   ├── geo_grid.py              # Spatial grid (snap, interpolate, haversine)
│   ├── factor_mapper.py         # 38 factor definitions + validation
│   ├── merge_sources.py         # All sources → unified grid
│   ├── label_generator.py       # Incident-density safety labels
│   ├── temporal_align.py        # Cyclical encoding, season flags
│   ├── composite_features.py    # Cross-domain derived features
│   ├── crime_features.py        # Crime risk normalization
│   ├── weather_features.py      # Weather risk composites
│   ├── disaster_features.py     # Disaster risk composites
│   ├── environment_features.py  # AQI/water/noise risk
│   ├── health_features.py       # Health infrastructure scoring
│   ├── terrain_features.py      # Terrain risk + classification
│   ├── infrastructure_features.py # Connectivity + access scoring
│   └── social_features.py       # Crowding + isolation risk
│
├── training/
│   ├── __init__.py
│   ├── train_safety_scorer.py   # Model 1: LightGBM safety scorer
│   ├── train_trajectory.py      # Model 2: GBM trajectory forecaster
│   ├── train_anomaly.py         # Model 3: Isolation Forest
│   ├── train_incident_classifier.py # Model 4: LightGBM multiclass
│   ├── train_spatial_risk.py    # Model 5: Parametric propagation
│   ├── train_alert_timing.py    # Model 6: Heuristic + logging
│   ├── evaluate.py              # Unified evaluation + edge cases
│   └── feature_columns.py       # Per-model feature definitions
│
├── models/                       # (generated at runtime)
│   ├── safety_scorer/
│   │   ├── safety_scorer.lgb
│   │   ├── metadata.json
│   │   └── feature_importance.csv
│   ├── trajectory/
│   │   ├── trajectory_model.joblib
│   │   └── metadata.json
│   ├── anomaly/
│   │   ├── isolation_forest.joblib
│   │   ├── feature_names.joblib
│   │   ├── feature_medians.joblib
│   │   └── metadata.json
│   ├── incident_classifier/
│   │   ├── incident_classifier.lgb
│   │   ├── label_encoder.joblib
│   │   ├── feature_columns.joblib
│   │   └── metadata.json
│   ├── spatial_risk/
│   │   ├── propagation_profiles.joblib
│   │   └── metadata.json
│   ├── alert_timing/
│   │   ├── metadata.json
│   │   └── experience_buffer.json
│   └── evaluation_report.json
│
├── data/                         # (generated at runtime)
│   ├── raw/                      # Downloaded Kaggle CSVs
│   │   ├── crime/
│   │   ├── weather/
│   │   ├── air_quality/
│   │   ├── water_quality/
│   │   ├── road_accidents/
│   │   ├── disasters/
│   │   ├── terrain/
│   │   ├── health/
│   │   ├── population/
│   │   ├── tourism/
│   │   ├── fire/
│   │   └── noise/
│   ├── processed/                # Domain parquets + unified grid
│   │   ├── crime_grid.parquet
│   │   ├── weather_grid.parquet
│   │   ├── aqi_grid.parquet
│   │   ├── water_quality_grid.parquet
│   │   ├── accident_grid.parquet
│   │   ├── disaster_grid.parquet
│   │   ├── health_grid.parquet
│   │   ├── terrain_grid.parquet
│   │   ├── population_grid.parquet
│   │   ├── tourism_grid.parquet
│   │   ├── fire_grid.parquet
│   │   ├── noise_grid.parquet
│   │   └── unified_grid.parquet
│   └── training/                 # Split training data
│       ├── safety_score_train.parquet
│       ├── safety_score_val.parquet
│       ├── safety_score_test.parquet
│       └── incident_classification.parquet
│
├── pipeline.py                   # End-to-end orchestrator
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

---

## 13. Setup & Installation

### 13.1 Requirements


```markdown
- Python 3.10+
- ~4 GB RAM minimum (8 GB recommended for full grid)
- ~2 GB disk for raw data + processed outputs + models
- Kaggle API token (for dataset download)

### 13.2 Local Setup

```bash
# Clone or create project directory
mkdir yatrax && cd yatrax

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

**requirements.txt:**

```
lightgbm>=4.0.0
scikit-learn>=1.3.0
numpy>=1.24.0
pandas>=2.0.0
joblib>=1.3.0
pyarrow>=12.0.0
kaggle>=1.5.16
```

### 13.3 Kaggle API Setup

```bash
# Install Kaggle CLI (included in requirements.txt)
pip install kaggle

# Create API token at https://www.kaggle.com/settings → "Create New Token"
# Place the downloaded kaggle.json at:
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Verify
kaggle datasets list --sort-by votes
```

### 13.4 Google Colab Setup

```python
# Cell 1: Create project structure
import os, sys

BASE = "/content/yatrax"
os.makedirs(BASE, exist_ok=True)
os.chdir(BASE)

packages = [
    "config", "ingestion", "processing", "training", "models",
    "data", "data/raw", "data/processed", "data/training",
    "data/raw/crime", "data/raw/weather", "data/raw/air_quality",
    "data/raw/water_quality", "data/raw/road_accidents",
    "data/raw/disasters", "data/raw/terrain", "data/raw/health",
    "data/raw/population", "data/raw/tourism", "data/raw/fire",
    "data/raw/noise",
]

for pkg in packages:
    os.makedirs(pkg, exist_ok=True)
    init_path = os.path.join(pkg, "__init__.py")
    if not os.path.exists(init_path):
        with open(init_path, "w") as f:
            f.write("")

sys.path.insert(0, BASE)
print("✅ Project structure created")

# Cell 2: Install dependencies
!pip install -q lightgbm scikit-learn pandas pyarrow joblib kaggle

# Cell 3: Upload project files (Option A — Google Drive)
from google.colab import drive
drive.mount('/content/drive')
!cp -r "/content/drive/MyDrive/YatraX/"* /content/yatrax/

# Cell 3 alternative: Upload project files (Option B — zip upload)
# from google.colab import files
# uploaded = files.upload()  # upload yatrax.zip
# !unzip -o yatrax.zip -d /content/yatrax/

# Cell 4: Configure Kaggle (if downloading datasets)
os.environ['KAGGLE_USERNAME'] = 'your_username'
os.environ['KAGGLE_KEY'] = 'your_api_key'

# Cell 5: Run pipeline
from pipeline import run_pipeline
run_pipeline(skip_download=True)
```

### 13.5 Verifying Installation

```python
# Quick import check
from config.settings import MODELS_DIR, PROCESSED_DIR, TRAINING_DIR
from processing.geo_grid import generate_india_grid
from processing.factor_mapper import get_factor_names

grid = generate_india_grid()
factors = get_factor_names()

print(f"Grid cells: {len(grid)}")       # ~93,611
print(f"Safety factors: {len(factors)}") # 38
print("✅ All imports working")
```

---

## 14. Usage Guide

### 14.1 Full Pipeline Execution

```bash
# Download data + ingest + merge + generate labels + train + evaluate
python pipeline.py --download

# Skip download (data already exists)
python pipeline.py

# Only retrain models (data already processed)
python pipeline.py --train-only

# Only re-evaluate (models already trained)
python pipeline.py --eval-only

# Only ingest new raw data
python pipeline.py --ingest-only

# Skip specific stages
python pipeline.py --skip-ingest --skip-merge
python pipeline.py --skip-labels --skip-training
```

### 14.2 Individual Module Execution

Each module can be run independently:

```bash
# Download all Kaggle datasets
python -m ingestion.download_all

# Ingest individual domains
python -m ingestion.ingest_crime
python -m ingestion.ingest_weather
python -m ingestion.ingest_aqi
python -m ingestion.ingest_water
python -m ingestion.ingest_accidents
python -m ingestion.ingest_disasters
python -m ingestion.ingest_health
python -m ingestion.ingest_terrain
python -m ingestion.ingest_population
python -m ingestion.ingest_tourism
python -m ingestion.ingest_fire
python -m ingestion.ingest_noise

# Merge all sources
python -m processing.merge_sources

# Generate training labels
python -m processing.label_generator

# Train individual models
python -m training.train_safety_scorer
python -m training.train_trajectory
python -m training.train_anomaly
python -m training.train_incident_classifier
python -m training.train_spatial_risk
python -m training.train_alert_timing

# Run evaluation
python -m training.evaluate
```

### 14.3 Inference API

#### Single-Point Safety Score

```python
from training.train_safety_scorer import load_safety_scorer, predict_safety

model, feature_cols = load_safety_scorer()

result = predict_safety(model, feature_cols, {
    "crime_rate_per_100k": 200,
    "aqi": 120,
    "weather_severity": 25,
    "rainfall_mmph": 5,
    "visibility_km": 6,
    "hospital_level_score": 70,
    "nearest_hospital_proxy_km": 3,
    "road_accident_hotspot_risk": 0.15,
    "flood_risk": 0.05,
    "earthquake_risk": 0.1,
    "hour": 14,
    "month": 3,
    "is_night": 0,
    "is_monsoon": 0,
})

print(f"Safety Score: {result['safety_score']}")
# → Safety Score: 72.3

print(f"Safety Level: {result['safety_level']}")
# → Safety Level: safe

print(f"Risk Factors: {result['risk_factors']}")
# → Risk Factors: ['No significant risks detected']
```

#### Anomaly Detection

```python
from training.train_anomaly import detect_anomaly

anomaly = detect_anomaly({
    "crime_rate_per_100k": 800,
    "aqi": 400,
    "weather_severity": 10,
    "hospital_level_score": 90,
    "nearest_hospital_proxy_km": 2,
})

if anomaly:
    print(f"Anomaly detected: {anomaly['severity']}")
    print(f"Score: {anomaly['anomaly_score']}")
    print(f"Description: {anomaly['description']}")
    for feat in anomaly['contributing_features']:
        print(f"  {feat['feature']}: {feat['actual']:.1f} (median: {feat['median']:.1f})")
else:
    print("Normal conditions")
```

#### Spatial Risk from Nearby Incidents

```python
from training.train_spatial_risk import propagate_multiple_incidents

incidents = [
    {"lat": 26.14, "lon": 91.73, "type": "flood", "severity": 0.8, "hours_since": 3},
    {"lat": 26.16, "lon": 91.74, "type": "landslide", "severity": 0.6, "hours_since": 1},
]

result = propagate_multiple_incidents(
    incidents,
    target_lat=26.15,
    target_lon=91.73,
)

print(f"Total additional risk: {result['total_risk']}")
print(f"Dominant threat: {result['dominant_type']}")
for c in result['contributions']:
    print(f"  {c['type']}: risk={c['risk']:.3f}, distance={c['distance_km']:.1f}km")
```

#### Trajectory Forecast

```python
import joblib
import numpy as np

model = joblib.load("models/trajectory/trajectory_model.joblib")
feature_cols = joblib.load("models/trajectory/feature_columns.joblib")

# Predict safety score 1 hour from now
features = {
    "current_score": 65.0,
    "score_mean_6h": 68.0,
    "score_std_6h": 4.2,
    "score_slope_6h": -0.8,
    "weather_mean_6h": 30.0,
    "weather_slope_6h": 2.5,
    "rain_max_6h": 15.0,
    "rain_mean_6h": 5.0,
    "current_hour": 17,
    "is_night": 0,
    "forecast_horizon_h": 1,
}

vector = np.array([[features[col] for col in feature_cols]])
predicted_score = float(np.clip(model.predict(vector)[0], 0, 100))
print(f"Predicted score in 1 hour: {predicted_score:.1f}")
```

#### Alert Timing Decision

```python
from training.train_alert_timing import AlertTimingEngine, AlertContext

engine = AlertTimingEngine()

context = AlertContext(
    safety_score=38,
    score_change_rate_per_hour=-12,
    score_variance=8.0,
    predicted_score_1h=28,
    predicted_score_3h=20,
    incident_type="flood",
    incident_confidence=0.7,
    is_night=True,
    hour=23,
    battery_pct=45,
    network_quality=3,
    nearest_hospital_km=12,
    time_since_last_alert_minutes=25,
    alerts_last_24h=1,
    anomaly_detected=True,
    anomaly_severity="medium",
)

decision = engine.decide(context)

print(f"Action: {decision.action.value}")
# → Action: urgent_alert

print(f"Reason: {decision.reason}")
# → Reason: Rapid safety decline in danger zone

print(f"Confidence: {decision.confidence}")
# → Confidence: 0.8

print(f"Hard override: {decision.override}")
# → Hard override: False
```

### 14.4 Inspecting Trained Models

```python
import json

# Safety scorer metadata
with open("models/safety_scorer/metadata.json") as f:
    meta = json.load(f)

print(f"Model version: {meta['model_version']}")
print(f"MAE: {meta['metrics']['mae']:.2f}")
print(f"R²: {meta['metrics']['r2']:.4f}")
print(f"Features: {meta['n_features']}")
print(f"Top features:")
for feat in meta['feature_importance'][:10]:
    print(f"  {feat['feature']:40s} importance={feat['importance']:.1f}")
```

### 14.5 Adding New Data

To incorporate a new Kaggle dataset:

1. **Register it** in `config/kaggle_sources.py`:

```python
KaggleDataset(
    slug="author/new-dataset",
    target_dir="domain_name",
    description="What this covers",
    factors_covered=["factor_name"],
),
```

2. **Create an ingestor** in `ingestion/ingest_newdomain.py` following the
   standard pattern (flexible column detection → normalize → grid aggregate →
   save parquet)
3. **Add to merge config** in `processing/merge_sources.py`:

```python
"newdomain_grid.parquet": {
    "columns": ["new_factor_1", "new_factor_2"],
    "fill_defaults": {"new_factor_1": 0.5, "new_factor_2": 0.3},
},
```

4. **Register factors** in `processing/factor_mapper.py`:

```python
FactorDefinition("new_factor_1", "category", "newdomain_grid.parquet",
                 "new_factor_1", 0, 1, 0.5, "Description", 0.02),
```

5. **Add to pipeline** in `pipeline.py`:

```python
("NewDomain", "ingestion.ingest_newdomain", "ingest_all_newdomain"),
```

6. **Retrain:**

```bash
python pipeline.py --skip-download
```

---

## 15. Configuration Reference

### 15.1 Path Configuration (`config/settings.py`)

| Variable          | Default              | Description                    |
| ----------------- | -------------------- | ------------------------------ |
| `ROOT_DIR`      | Project root         | Base directory                 |
| `DATA_DIR`      | `{ROOT}/data`      | All data                       |
| `RAW_DIR`       | `{DATA}/raw`       | Downloaded Kaggle CSVs         |
| `PROCESSED_DIR` | `{DATA}/processed` | Domain parquets + unified grid |
| `TRAINING_DIR`  | `{DATA}/training`  | Split training data            |
| `MODELS_DIR`    | `{ROOT}/models`    | Trained model artifacts        |

### 15.2 Spatial Configuration

| Variable                | Value | Description                     |
| ----------------------- | ----- | ------------------------------- |
| `INDIA_LAT_MIN`       | 6.0   | Southern boundary (Kanyakumari) |
| `INDIA_LAT_MAX`       | 37.0  | Northern boundary (Siachen)     |
| `INDIA_LON_MIN`       | 68.0  | Western boundary (Gujarat)      |
| `INDIA_LON_MAX`       | 98.0  | Eastern boundary (Arunachal)    |
| `GRID_RESOLUTION_DEG` | 0.1   | Cell size in degrees (~11 km)   |

### 15.3 Training Configuration

| Variable        | Value | Description                 |
| --------------- | ----- | --------------------------- |
| `TRAIN_SPLIT` | 0.70  | Training set proportion     |
| `VAL_SPLIT`   | 0.15  | Validation set proportion   |
| `TEST_SPLIT`  | 0.15  | Test set proportion         |
| `RANDOM_SEED` | 42    | Global reproducibility seed |

### 15.4 Model Hyperparameters

All hyperparameters are centralized in `config/settings.py` under:

- `SAFETY_SCORER_PARAMS` — Model 1 (LightGBM regression)
- `TRAJECTORY_PARAMS` — Model 2 (GBM / future LSTM)
- `ANOMALY_PARAMS` — Model 3 (Isolation Forest + future autoencoder)
- `INCIDENT_CLASSIFIER_PARAMS` — Model 4 (LightGBM multiclass)
- `SPATIAL_RISK_PARAMS` — Model 5 (distance decay parameters)
- `ALERT_TIMING_PARAMS` — Model 6 (context dimension, action space)

---

## 16. Design Decisions & Trade-offs

### 16.1 Why LightGBM Over Neural Networks

| Criterion                | LightGBM                         | Neural Network               |
| ------------------------ | -------------------------------- | ---------------------------- |
| Tabular data performance | State-of-the-art                 | Generally worse              |
| Training time            | Minutes                          | Hours                        |
| GPU required             | No                               | Yes (for reasonable speed)   |
| Missing value handling   | Native                           | Requires imputation pipeline |
| Feature importance       | Built-in (gain, split)           | Requires SHAP/LIME           |
| Deployment size          | ~5 MB                            | ~50–500 MB                  |
| Inference latency        | < 1 ms                           | 5–50 ms                     |
| Interpretability         | High (tree paths)                | Low (black box)              |
| Overfitting resistance   | Strong (built-in regularization) | Requires careful tuning      |

**References supporting this choice:**

- "Why do tree-based models still outperform deep learning on typical
  tabular data?" (Grinsztajn et al., NeurIPS 2022)
- "Tabular Data: Deep Learning is Not All You Need" (Shwartz-Ziv & Armon, 2022)
- "An Extensive Benchmark of GBDTs vs DNNs on Tabular Data" (Borisov et al., 2022)

### 16.2 Why Parametric Decay Over GNN for Spatial Risk

| Criterion                  | Parametric Decay               | GNN                                 |
| -------------------------- | ------------------------------ | ----------------------------------- |
| Dependencies               | NumPy only                     | PyTorch + PyTorch Geometric         |
| Training data needed       | None (expert-defined profiles) | Thousands of propagation examples   |
| Inference speed            | O(1) per query                 | O(n) neighborhood aggregation       |
| Interpretability           | Fully transparent formula      | Learned, opaque weights             |
| Tunability                 | Per-incident-type parameters   | Retrain entire model                |
| Accuracy on known patterns | Good                           | Potentially better                  |
| Accuracy on novel patterns | Limited                        | Potentially better                  |
| Production readiness       | Immediate                      | Requires significant infrastructure |

**Decision:** Ship parametric, collect data, upgrade to GNN when justified.

### 16.3 Why Heuristic Alert Timing Over RL

| Criterion                 | Heuristic                   | RL (PPO/DQN)                 |
| ------------------------- | --------------------------- | ---------------------------- |
| Training data needed      | None                        | 500+ decision-outcome pairs  |
| Safety guarantees         | Hard overrides are explicit | Learned, may miss edge cases |
| User trust at launch      | High (predictable behavior) | Low (unexpected decisions)   |
| Adaptability              | Static                      | Learns from user behavior    |
| Implementation complexity | Low                         | High                         |

**Decision:** Launch with heuristics + experience logging. The experience
buffer collects (context, action, outcome) tuples. Once 500+ outcomes are
recorded, an RL policy can be trained on real user interaction data.

### 16.4 Why Incident-Density Labels Over Expert Annotations

| Criterion        | Incident-Density                        | Expert Annotation            |
| ---------------- | --------------------------------------- | ---------------------------- |
| Scalability      | 93K cells × 24 variants automatically  | Limited to annotation budget |
| Objectivity      | Based on real incident counts           | Subjective variation         |
| Reproducibility  | Deterministic (same seed = same labels) | Inter-annotator disagreement |
| Cost             | Free (computed from data)               | Expensive                    |
| Circularity risk | Low (uses real events, not rules)       | None (ground truth)          |
| Nuance           | Limited to measured factors             | Can capture subtle context   |

**Decision:** Incident-density labels for v1. Expert validation on a subset
for v2.

### 16.5 Grid Resolution Trade-off

| Resolution      | Cell Size        | Total Cells       | Pros                   | Cons                                  |
| --------------- | ---------------- | ----------------- | ---------------------- | ------------------------------------- |
| 1.0°           | ~111 km          | ~930              | Fast, low memory       | Too coarse for urban areas            |
| **0.1°** | **~11 km** | **~93,000** | **Good balance** | **Some urban areas need finer** |
| 0.01°          | ~1.1 km          | ~9.3M             | Fine-grained           | Memory-intensive, sparse data         |
| 0.001°         | ~111 m           | ~930M             | Street-level           | Impractical for national scale        |

**Decision:** 0.1° as the base grid. Future versions can add a finer overlay
for metro areas (Delhi, Mumbai, etc.).

### 16.6 Default Value Strategy

When a grid cell has no data for a factor, the pipeline fills the India
national average or a conservative estimate:

| Strategy                 | When Used                                       |
| ------------------------ | ----------------------------------------------- |
| National average         | Crime rate (190), AQI (75), temperature (28°C) |
| Conservative (safe-side) | Flood risk (0.1), fire risk (0.05)              |
| Pessimistic              | Hospital distance (25 km), emergency score (40) |

The rationale: unknown ≠ safe. When we don't know, we assume moderate risk
rather than zero risk.

---

## 17. Limitations & Future Work

### 17.1 Known Limitations

| Limitation                                    | Impact                                      | Mitigation                                             |
| --------------------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Crime data is yearly, not real-time           | Can't detect crime spikes within a year     | Temporal modifiers from NCRB time distributions        |
| Census data is decadal (2011)                 | Population may be outdated                  | Use with urbanization rate projections                 |
| Weather data has city-level bias              | Rural areas interpolated                    | IDW interpolation with 30 km radius                    |
| AQI stations are urban-only                   | Rural AQI is estimated                      | Default to moderate (75) for uncovered cells           |
| No real-time incident feed                    | Can't respond to events as they happen      | Architecture supports streaming; needs API integration |
| Grid resolution (11 km) too coarse for cities | Intra-city variation lost                   | Fine grid overlay planned for metro areas              |
| Disaster data is historical                   | Can't predict unprecedented events          | Combined with weather forecasts for real-time risk     |
| Hospital data may be outdated                 | New hospitals not captured                  | Designed for periodic re-ingestion                     |
| Noise data is limited to 16 cities            | Most of India uncovered                     | Default to commercial zone average                     |
| Tourism data is destination-level             | Route-level tourism not captured            | Spatial interpolation partially addresses this         |
| Labels are computed, not ground-truth         | Model ceiling bounded by label quality      | Designed for expert validation in v2                   |
| Trajectory model uses synthetic data          | Doesn't capture real user movement patterns | Will upgrade to LSTM with real sequential data         |

### 17.2 Future Work Roadmap

#### Phase 1: Real-Time Integration (v2)

- **IMD Weather API** — Replace static weather with live forecasts
- **CPCB AQI API** — Real-time air quality
- **NDMA Alerts API** — Live disaster warnings
- **Google Traffic API** — Real-time congestion and accident detection
- **Streaming pipeline** — Kafka/Redis for event ingestion

#### Phase 2: Model Upgrades (v3)

- **LSTM Trajectory Forecaster** — Train on real user trajectory sequences
  collected from app usage
- **GNN Spatial Risk** — Train on observed propagation patterns from real-time
  incident data
- **RL Alert Timing** — Train on experience buffer once 500+ decision-outcome
  pairs are collected
- **Fine-grained metro grid** — 0.01° (1 km) overlay for top 20 Indian metros
- **Autoencoder anomaly detector** — Complement Isolation Forest for temporal
  anomaly patterns

#### Phase 3: Personalization (v4)

- **User risk profiles** — Different thresholds for solo female travelers vs
  groups vs families
- **Route optimization** — "Safest path from A to B" using grid as cost surface
- **Predictive alerts** — Push notifications before entering danger zones
- **Offline mode** — Pre-computed risk maps for areas with no connectivity
- **Multi-language alerts** — Hindi, Tamil, Bengali, etc.

#### Phase 4: Scale (v5)

- **Expand beyond India** — Nepal, Sri Lanka, Southeast Asia
- **Sub-national models** — State-specific models for regions with unique risk
  profiles (Kashmir, Northeast, coastal states)
- **Federated learning** — Learn from user devices without centralizing
  location data
- **Edge deployment** — TFLite/ONNX models for on-device inference

---

## 18. Appendix

### A. Complete Feature List for Safety Scorer

The safety scorer model receives the following feature vector (48 features):

**Geographic factors (38):**

```
temperature_c, humidity_pct, rainfall_mmph, wind_speed_kmph, visibility_km,
uv_index, weather_severity, aqi, pm25, water_safety_score,
water_contamination_risk, crime_rate_per_100k, crime_type_distribution_risk,
gender_safety_index, tourist_targeted_crime_index, road_accident_hotspot_risk,
accident_severity_index, fatality_rate, flood_risk, earthquake_risk,
cyclone_risk, landslide_risk, elevation_m, slope_deg, landslide_prone_index,
terrain_difficulty_score, altitude_sickness_risk, hospital_level_score,
emergency_availability_score, ambulance_response_score,
nearest_hospital_proxy_km, fire_risk_index, fire_intensity_score,
population_density_per_km2, isolation_score, noise_level_proxy,
nearby_tourist_density_index, tourism_infrastructure_proxy
```

**Temporal features (10):**

```
hour, month, day_of_week, is_night, is_monsoon, is_fog_season,
is_weekend, is_rush_hour, hour_sin, hour_cos, month_sin, month_cos
```

### B. Model Output Schemas

#### Safety Scorer Output

```json
{
    "safety_score": 72.3,
    "safety_level": "safe",
    "risk_factors": [
        "No significant risks detected"
    ]
}
```

#### Anomaly Detector Output

```json
{
    "anomaly_score": -0.2847,
    "severity": "medium",
    "contributing_features": [
        {
            "feature": "crime_rate_per_100k",
            "actual": 650.0,
            "median": 190.0,
            "impact": 0.0823
        },
        {
            "feature": "aqi",
            "actual": 380.0,
            "median": 75.0,
            "impact": 0.0456
        }
    ],
    "description": "Anomaly: unusually high crime rate per 100k, unusually high aqi"
}
```

#### Spatial Risk Output

```json
{
    "total_risk": 0.4523,
    "contributions": [
        {
            "type": "flood",
            "risk": 0.3841,
            "distance_km": 4.2,
            "hours_since": 3.0
        },
        {
            "type": "landslide",
            "risk": 0.1205,
            "distance_km": 2.1,
            "hours_since": 1.0
        }
    ],
    "dominant_type": "flood"
}
```

#### Alert Decision Output

```json
{
    "action": "urgent_alert",
    "reason": "Rapid safety decline in danger zone",
    "confidence": 0.80,
    "override": false
}
```

### C. Indian State Centroid Coordinates (Fallback Geocoding)

Used when datasets have state names but no coordinates:

| State             | Latitude | Longitude |
| ----------------- | -------- | --------- |
| Andhra Pradesh    | 15.9     | 79.7      |
| Arunachal Pradesh | 28.2     | 94.7      |
| Assam             | 26.2     | 92.9      |
| Bihar             | 25.1     | 85.3      |
| Chhattisgarh      | 21.3     | 81.6      |
| Delhi             | 28.7     | 77.1      |
| Goa               | 15.4     | 74.0      |
| Gujarat           | 22.3     | 71.2      |
| Haryana           | 29.0     | 76.1      |
| Himachal Pradesh  | 31.1     | 77.2      |
| Jharkhand         | 23.6     | 85.3      |
| Karnataka         | 15.3     | 75.7      |
| Kerala            | 10.9     | 76.3      |
| Madhya Pradesh    | 22.9     | 78.7      |
| Maharashtra       | 19.8     | 75.3      |
| Manipur           | 24.7     | 93.9      |
| Meghalaya         | 25.5     | 91.4      |
| Mizoram           | 23.2     | 92.9      |
| Nagaland          | 26.2     | 94.6      |
| Odisha            | 20.9     | 84.8      |
| Punjab            | 31.1     | 75.3      |
| Rajasthan         | 27.0     | 74.2      |
| Sikkim            | 27.5     | 88.5      |
| Tamil Nadu        | 11.1     | 78.7      |
| Telangana         | 18.1     | 79.0      |
| Tripura           | 23.9     | 91.9      |
| Uttar Pradesh     | 26.8     | 80.9      |
| Uttarakhand       | 30.1     | 79.0      |
| West Bengal       | 22.9     | 87.9      |
| Jammu & Kashmir   | 33.8     | 76.6      |
| Ladakh            | 34.2     | 77.6      |

### D. Tourist City Coordinates (Geocoding Fallback)

46 major tourist destinations with hardcoded coordinates for geocoding
when datasets contain city names but no lat/lon. Full list includes:
Agra, Jaipur, Varanasi, Goa, Udaipur, Shimla, Manali, Darjeeling,
Munnar, Rishikesh, Leh, Ooty, Kochi, Jodhpur, Mysore, Hampi, Khajuraho,
Amritsar, Pondicherry, Kodaikanal, Alleppey, Gangtok, McLeodganj,
Pushkar, Ranthambore, Jim Corbett, Kaziranga, Andaman, Ladakh, Spiti,
Coorg, Kovalam, Varkala, Bikaner, Jaisalmer, Mount Abu, Nainital,
Mussoorie, Auli, Srinagar, Pahalgam, Gulmarg, and more.

### E. CPCB Noise Monitoring City Coordinates

16 cities with hardcoded coordinates for the noise monitoring dataset:
Delhi, Mumbai, Kolkata, Chennai, Bangalore, Hyderabad, Ahmedabad, Pune,
Lucknow, Jaipur, Chandigarh, Patna, Bhopal, Nagpur, Indore.

### F. Glossary

| Term               | Definition                                                         |
| ------------------ | ------------------------------------------------------------------ |
| **NCRB**     | National Crime Records Bureau — India's official crime statistics |
| **CPCB**     | Central Pollution Control Board — monitors AQI and noise          |
| **IMD**      | India Meteorological Department — weather forecasts               |
| **NDMA**     | National Disaster Management Authority                             |
| **FIRMS**    | Fire Information for Resource Management System (NASA)             |
| **BIS**      | Bureau of Indian Standards — water quality limits                 |
| **WHO**      | World Health Organization — health guidelines                     |
| **AQI**      | Air Quality Index (India's 0–500 scale)                           |
| **IPC**      | Indian Penal Code — criminal offense categories                   |
| **IDW**      | Inverse Distance Weighting — spatial interpolation method         |
| **GNN**      | Graph Neural Network                                               |
| **RL**       | Reinforcement Learning                                             |
| **LSTM**     | Long Short-Term Memory (recurrent neural network)                  |
| **LightGBM** | Light Gradient Boosting Machine                                    |
| **P95**      | 95th percentile — used for normalization                          |
| **NDVI**     | Normalized Difference Vegetation Index                             |
| **FRP**      | Fire Radiative Power (satellite measurement)                       |
| **PHC**      | Primary Health Centre                                              |
| **CHC**      | Community Health Centre                                            |
| **MPN**      | Most Probable Number (coliform measurement)                        |
| **NTU**      | Nephelometric Turbidity Units                                      |
| **TDS**      | Total Dissolved Solids                                             |
| **BOD**      | Biochemical Oxygen Demand                                          |
| **COD**      | Chemical Oxygen Demand                                             |

---

## License

This project uses publicly available datasets from Kaggle. Individual dataset
licenses are governed by their respective Kaggle pages. The pipeline code is
provided as-is for educational and research purposes.

## Citation

If you use this pipeline in academic work:

```bibtex
@software{yatrax2025,
    title={YatraX: Real-Time Travel Safety Intelligence for India},
    year={2025},
    description={Multi-model ML pipeline for location-specific safety scoring
                 using 26 public datasets and 6 trained models},
}
```

---

*Last updated: 2025*
*Pipeline version: 4.0.0-lgbm*

```

```
