
============================================================
  YatraX ML Training Pipeline
=============================

⏭️  Skipping download (use --download to enable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP: 2/6 — Ingest Raw Data
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── Crime ──
Found 91 crime CSV files
  Parsed 01_District_wise_crimes_committed_IPC_2001_2012.csv: 8597 rows
  Parsed 01_District_wise_crimes_committed_IPC_2013.csv: 788 rows
  Parsed 01_District_wise_crimes_committed_IPC_2014.csv: 802 rows
  Parsed 42_District_wise_crimes_committed_against_women_2001_2012.csv: 8597 rows
  Parsed 42_District_wise_crimes_committed_against_women_2013.csv: 788 rows
  Parsed 42_District_wise_crimes_committed_against_women_2014.csv: 801 rows
Combined: 20373 rows
Crime factors computed: 799 districts
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/crime_grid.parquet (692 rows)

── Weather ──
Found 86 weather CSV files
  Parsed fix_weather.csv: 50186 rows
  Parsed Sub_Division_IMD_2017.csv: 50186 rows
  Parsed Abbigeri.csv: 123936 rows
  Parsed Abdullahnagar.csv: 123936 rows
  Parsed Abhayapuri.csv: 123936 rows
  Parsed Abhia.csv: 123936 rows
  Parsed Abhwar.csv: 123936 rows
  Parsed Abiramam.csv: 123936 rows
  Parsed Ablu.csv: 123936 rows
  Parsed Abohar.csv: 123936 rows
  Parsed Abu.csv: 123936 rows
  Parsed Achaljamu.csv: 123936 rows
  Parsed Achampet.csv: 123936 rows
  Parsed Acharipallam.csv: 123936 rows
  Parsed Achchippatti.csv: 123936 rows
  Parsed Achhnera.csv: 123936 rows
  Parsed Adalaj.csv: 123936 rows
  Parsed Adalpur.csv: 123936 rows
  Parsed Adamankottai.csv: 123936 rows
  Parsed Adampur.csv: 123936 rows
  Parsed Addanki.csv: 123936 rows
  Parsed Adigappadi.csv: 123936 rows
  Parsed Adigaratti.csv: 123936 rows
  Parsed Adigoppula.csv: 123936 rows
  Parsed Adilabad.csv: 123936 rows
  Parsed Adivala.csv: 123936 rows
  Parsed Adiyakkamangalam.csv: 123936 rows
  Parsed Adoni.csv: 123936 rows
  Parsed Adra.csv: 123936 rows
  Parsed Advi Devalpalli.csv: 123936 rows
  Parsed Adyar.csv: 123936 rows
  Parsed Afzala.csv: 123936 rows
  Parsed Afzalpur.csv: 123936 rows
  Parsed Agadallanka.csv: 123936 rows
  Parsed Agadi.csv: 123936 rows
  Parsed Agar.csv: 123936 rows
  Parsed Agaram.csv: 123936 rows
  Parsed Agarpur.csv: 123936 rows
  Parsed Agartala.csv: 123936 rows
  Parsed Aginiparru.csv: 123936 rows
  Parsed Agiripalle.csv: 123936 rows
  Parsed Agra.csv: 123936 rows
  Parsed Agwar.csv: 123936 rows
  Parsed Ahirauliya.csv: 123936 rows
  Parsed Ahiro.csv: 123936 rows
  Parsed Ahmadabad.csv: 123936 rows
  Parsed Ahmadnagar.csv: 123936 rows
  Parsed Ahmadpur.csv: 123936 rows
  Parsed Ahmedabad.csv: 123936 rows
  Parsed Aigali.csv: 123936 rows
  Parsed Ainapur.csv: 123936 rows
  Parsed Aizawl.csv: 123936 rows
  Parsed Ajaigarh.csv: 123936 rows
  Parsed Ajas.csv: 123936 rows
  Parsed Ajjampur.csv: 123936 rows
  Parsed Ajjanahalli.csv: 123936 rows
  Parsed Ajjipuram.csv: 123936 rows
  Parsed Ajmer.csv: 123936 rows
  Parsed Ajnala.csv: 123936 rows
  Parsed Ajodhya.csv: 123936 rows
  Parsed Akalgarh.csv: 123936 rows
  Parsed Akanavaritota.csv: 123936 rows
  Parsed Akbarpur.csv: 123936 rows
  Parsed Akbarpur_2.csv: 123936 rows
  Parsed Akhnur.csv: 123936 rows
  Parsed Akividu.csv: 123936 rows
  Parsed Aklvidu.csv: 123936 rows
  Parsed Akola.csv: 123936 rows
  Parsed Akora.csv: 123936 rows
  Parsed Akot.csv: 123936 rows
  Parsed Alagappapuram.csv: 123936 rows
  Parsed Alagarai.csv: 123936 rows
  Parsed Alamnagar.csv: 123936 rows
  Parsed Alampalaiyam.csv: 123936 rows
  Parsed Alampur Gonpura.csv: 123936 rows
  Parsed Alampur.csv: 123936 rows
  Parsed Alampur_2.csv: 123936 rows
  Parsed Alampur_3.csv: 123936 rows
  Parsed Alamuru.csv: 123936 rows
  Parsed Aland.csv: 123936 rows
  Parsed Alanganallur.csv: 123936 rows
  Parsed Alangayam.csv: 123936 rows
  Parsed Alangudi.csv: 123936 rows
  Parsed Alangulam.csv: 123936 rows
  Parsed Alasandigutta.csv: 41242 rows
Combined weather data: 1829860 rows with coordinates
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/weather_grid.parquet (48 grid cells)

── AQI ──
Found 5 AQI CSV files
  Parsed city_day.csv: 24850 rows, AQI range: 13-500
  Parsed city_hour.csv: 578795 rows, AQI range: 8-500
  Parsed station_day.csv: 87025 rows, AQI range: 8-500
  Parsed station_hour.csv: 2018893 rows, AQI range: 5-500
Combined AQI data: 2709563 rows
Coordinate coverage: 91.0%
Unique cities/stations: 135
AQI value range: 5.0 - 500.0
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/aqi_grid.parquet (19 grid cells)

── Water Quality ──
Found 5 water quality CSV files
  Parsed water_dataX_fixed.csv: 1983 rows, safety=53.1
  Parsed fix_water.csv: 1983 rows, safety=53.1
  Parsed water_dataX.csv: 1983 rows, safety=53.1
Combined: 5949 water quality records
Coverage breakdown: {}
Coordinate coverage: 0.0%
  ⚠️ Water coverage is very low (0.0%)
No spatial water factors could be computed!

── Disasters ──
Found 4 disaster CSV files
  Parsed flood_risk_dataset_india.csv: 10000 events — {'unknown': 10000}
  Parsed India_Floods_Inventory.csv: 1027 events — {'unknown': 653, 'flood': 299, 'landslide': 57, 'cyclone': 18}
  Parsed Indian_earthquake_data.csv: 2719 events — {'unknown': 2719}
  Parsed disasterIND.csv: 783 events — {'flood': 363, 'cyclone': 183, 'unknown': 79, 'landslide': 49, 'heatwave': 31, 'coldwave': 30, 'earthquake': 27, 'drought': 17, 'fire': 4}
Combined: 14529 disaster events
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/disaster_grid.parquet (11571 grid cells)

── Accidents ──
Found 2 accident CSV files
  Parsed accident_prediction_india.csv: 3000 rows
  Parsed Road.csv: 12316 rows
Combined: 15316 accident records
Coverage breakdown: {}
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/accident_grid.parquet (545 grid cells)

── Health ──
Found 22 health CSV files
  Parsed Hospitals In India (Anonymized).csv: 2566 facilities
Combined: 2380 unique facilities
Facilities kept: 2380
Facilities dropped for missing coordinates: 0
Coordinate coverage: 100.0%
Unique grid cells covered: 759
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/health_grid.parquet (759 grid cells)

── Terrain ──
Found 2 terrain CSV files
  Parsed elevation: Districts_elevation.csv: 626 rows
Elevation records: 626
Landslide events: 0
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/terrain_grid.parquet (620 grid cells)

── Population ──
Found 43 population CSV files
  Parsed district wise centroids.csv: 594 rows
  Parsed district wise population and centroids.csv: 431 rows
  Parsed district wise population for year 2001 and 2011.csv: 640 rows
  Parsed state wise centroids_2001.csv: 35 rows
  Parsed state wise centroids_2011.csv: 35 rows
  Parsed india-districts-census-2011.csv: 640 rows
  Parsed district_centroids.csv: 594 rows
Combined: 2969 population records
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/population_grid.parquet (636 grid cells)

── Tourism ──
Found 1 tourism CSV files
  Parsed Expanded_Indian_Travel_Dataset.csv: 110 places
Combined: 110 tourist locations
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/tourism_grid.parquet (14 grid cells)

── Fire ──
Found 4 fire CSV files
  Parsed fire_archive_M6_107977.csv: 644255 fire detections in India
  Parsed fire_archive_V1_107978.csv: 4420214 fire detections in India
  Parsed fire_nrt_M6_107977.csv: 2946 fire detections in India
  Parsed fire_nrt_V1_107978.csv: 122879 fire detections in India
Combined: 5190294 fire detections
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/fire_grid.parquet (25609 grid cells)

── Noise ──
Found 2 noise CSV files
  Parsed station_month.csv: 5005 rows
  Parsed stations.csv: 70 rows
Combined: 5075 raw noise records
Valid noise records after drop: 5002
Coordinate coverage: 0.0%
Stations matched: 0
  ⚠️ Noise coverage is very low (0.0%)
Saved: /content/drive/MyDrive/yatrax-ml/data/processed/noise_grid.parquet (0 grid cells)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP: 3/6 — Merge All Sources into Unified Grid
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generating India grid...
Grid: 93611 cells

Merging: crime_grid.parquet
  Loaded crime_grid.parquet: 692 rows, columns: ['state', 'district', 'murder', 'robbery', 'theft', 'rape', 'kidnapping', 'assault', 'riots', 'total_ipc', 'crime_rate_per_100k', 'crime_type_distribution_risk', 'tourist_targeted_crime_index', 'women_risk_total', 'gender_safety_index', 'latitude', 'longitude']
  ✓ Propagated real data to 82524 cells via Nearest Neighbor
  Coverage: crime_rate_per_100k: source_coverage=100.00% default_pct=0.00%; crime_type_distribution_risk: source_coverage=100.00% default_pct=0.02%; gender_safety_index: source_coverage=100.00% default_pct=0.00%; tourist_targeted_crime_index: source_coverage=100.00% default_pct=0.00%

Merging: weather_grid.parquet
  Loaded weather_grid.parquet: 48 rows, columns: ['grid_lat', 'grid_lon', 'temperature_c', 'humidity_pct', 'wind_speed_kmph', 'rainfall_mmph', 'visibility_km', 'uv_index', 'pressure_mb', 'weather_severity', 'sample_count', 'latitude', 'longitude']
  ✓ Propagated real data to 93563 cells via Nearest Neighbor
  Coverage: temperature_c: source_coverage=16.25% default_pct=83.75%; humidity_pct: source_coverage=16.25% default_pct=83.75%; wind_speed_kmph: source_coverage=16.25% default_pct=83.75%; rainfall_mmph: source_coverage=100.00% default_pct=0.00%; visibility_km: source_coverage=0.00% default_pct=100.00%; uv_index: source_coverage=0.00% default_pct=100.00%; weather_severity: source_coverage=100.00% default_pct=0.00%
  ⚠️ Feature visibility_km from weather has too few unique values (1)
  ⚠️ Feature uv_index from weather has too few unique values (1)

Merging: aqi_grid.parquet
  Loaded aqi_grid.parquet: 19 rows, columns: ['grid_lat', 'grid_lon', 'aqi', 'pm25', 'pm10', 'sample_count', 'latitude', 'longitude']
  ✓ Propagated real data to 93592 cells via Nearest Neighbor
  Coverage: aqi: source_coverage=100.00% default_pct=0.00%; pm25: source_coverage=100.00% default_pct=0.00%; pm10: source_coverage=95.93% default_pct=4.07%

Merging: water_quality_grid.parquet
  Loaded water_quality_grid.parquet: 341 rows, columns: ['state', 'water_safety_score', 'water_contamination_risk', 'district', 'latitude', 'longitude', 'drinking_water_safe']
  ✓ Propagated real data to 85751 cells via Nearest Neighbor
  Coverage: water_safety_score: source_coverage=100.00% default_pct=0.00%; water_contamination_risk: source_coverage=100.00% default_pct=0.00%

Merging: accident_grid.parquet
  Loaded accident_grid.parquet: 545 rows, columns: ['state', 'total_accidents', 'total_killed', 'total_injured', 'avg_severity', 'district', 'latitude', 'longitude', 'road_accident_hotspot_risk', 'accident_severity_index', 'fatality_rate']
  ✓ Propagated real data to 81360 cells via Nearest Neighbor
  Coverage: road_accident_hotspot_risk: source_coverage=100.00% default_pct=0.00%; accident_severity_index: source_coverage=100.00% default_pct=0.00%; fatality_rate: source_coverage=100.00% default_pct=0.00%
  ⚠️ Feature fatality_rate from accident has too few unique values (1)

Merging: disaster_grid.parquet
  Loaded disaster_grid.parquet: 11571 rows, columns: ['grid_lat', 'grid_lon', 'total_events', 'flood_count', 'flood_severity_avg', 'flood_deaths', 'earthquake_count', 'earthquake_severity_avg', 'earthquake_deaths', 'cyclone_count', 'cyclone_severity_avg', 'cyclone_deaths', 'landslide_count', 'landslide_severity_avg', 'landslide_deaths', 'flood_risk', 'earthquake_risk', 'cyclone_risk', 'landslide_risk', 'latitude', 'longitude']
  ✓ Propagated real data to 88720 cells via Nearest Neighbor
  Coverage: flood_risk: source_coverage=100.00% default_pct=0.00%; earthquake_risk: source_coverage=100.00% default_pct=0.00%; cyclone_risk: source_coverage=100.00% default_pct=0.00%; landslide_risk: source_coverage=100.00% default_pct=0.00%; total_events: source_coverage=100.00% default_pct=0.00%
  ⚠️ Feature flood_risk from disaster has too few unique values (1)
  ⚠️ Feature earthquake_risk from disaster has too few unique values (1)
  ⚠️ Feature cyclone_risk from disaster has too few unique values (1)
  ⚠️ Feature landslide_risk from disaster has too few unique values (1)

Merging: health_grid.parquet
  Loaded health_grid.parquet: 759 rows, columns: ['grid_lat', 'grid_lon', 'hospital_count', 'avg_capability', 'total_beds', 'emergency_count', 'icu_count', 'hospital_level_score', 'emergency_availability_score', 'ambulance_response_score', 'nearest_hospital_proxy_km', 'latitude', 'longitude']
  ✓ Propagated real data to 92852 cells via Nearest Neighbor
  Coverage: hospital_level_score: source_coverage=100.00% default_pct=0.00%; emergency_availability_score: source_coverage=100.00% default_pct=0.00%; ambulance_response_score: source_coverage=100.00% default_pct=0.00%; nearest_hospital_proxy_km: source_coverage=100.00% default_pct=0.00%
  ⚠️ Feature hospital_level_score from health has too few unique values (1)
  ⚠️ Feature emergency_availability_score from health has too few unique values (1)

Merging: fire_grid.parquet
  Loaded fire_grid.parquet: 25609 rows, columns: ['grid_lat', 'grid_lon', 'fire_count', 'avg_brightness', 'avg_frp', 'max_frp', 'fire_risk_index', 'fire_intensity_score', 'winter_fire_count', 'latitude', 'longitude']
  ✓ Propagated real data to 82932 cells via Nearest Neighbor
  Coverage: fire_risk_index: source_coverage=100.00% default_pct=0.00%; fire_intensity_score: source_coverage=100.00% default_pct=0.00%

Merging: population_grid.parquet
  Loaded population_grid.parquet: 636 rows, columns: ['grid_lat', 'grid_lon', 'population_density_per_km2', 'urbanization_rate', 'literacy_rate', 'total_population', 'isolation_score', 'latitude', 'longitude']
  Coverage: population_density_per_km2: source_coverage=0.00% default_pct=100.00%
  ⚠️ Feature population_density_per_km2 from population has too few unique values (1)

Merging: noise_grid.parquet
  Loaded noise_grid.parquet: 0 rows, columns: []
  ⚠️ Source noise has too few rows (0). Will proceed with defaults.
  ⚠️ Source noise is missing all key columns: ['noise_level_proxy']. Will proceed with defaults.
  Coverage: noise_level_proxy: source_coverage=0.00% default_pct=100.00%

Unified grid: 93611 cells × 45 columns
Columns: ['accident_data_available', 'accident_severity_index', 'ambulance_response_score', 'aqi', 'aqi_data_available', 'cell_id', 'crime_data_available', 'crime_rate_per_100k', 'crime_type_distribution_risk', 'cyclone_risk', 'disaster_data_available', 'earthquake_risk', 'emergency_availability_score', 'fatality_rate', 'fire_data_available', 'fire_intensity_score', 'fire_risk_index', 'flood_risk', 'gender_safety_index', 'grid_lat', 'grid_lon', 'health_data_available', 'hospital_level_score', 'humidity_pct', 'landslide_risk', 'nearest_hospital_proxy_km', 'noise_data_available', 'noise_level_proxy', 'pm10', 'pm25', 'population_data_available', 'population_density_per_km2', 'rainfall_mmph', 'road_accident_hotspot_risk', 'temperature_c', 'total_events', 'tourist_targeted_crime_index', 'uv_index', 'visibility_km', 'water_contamination_risk', 'water_data_available', 'water_safety_score', 'weather_data_available', 'weather_severity', 'wind_speed_kmph']

Saved: /content/drive/MyDrive/yatrax-ml/data/processed/unified_grid.parquet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP: 4/6 — Generate Training Labels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated 2246664 training samples.
Saved to: /content/drive/MyDrive/yatrax-ml/data/training/training_samples.parquet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP: 5/6 — Train Models
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── Safety Scorer ──
Train: 840480, Val: 179520, Test: 180000
Feature columns: 35

Training LightGBM safety scorer...
Training until validation scores don't improve for 50 rounds
[100]	train's l1: 4.55534	train's rmse: 5.76122	val's l1: 4.57659	val's rmse: 5.78614
[200]	train's l1: 3.26553	train's rmse: 4.21108	val's l1: 3.27712	val's rmse: 4.233
[300]	train's l1: 3.03078	train's rmse: 3.91933	val's l1: 3.04461	val's rmse: 3.94131
[400]	train's l1: 2.91886	train's rmse: 3.79594	val's l1: 2.93496	val's rmse: 3.81992
[500]	train's l1: 2.85345	train's rmse: 3.72807	val's l1: 2.87203	val's rmse: 3.75506
[600]	train's l1: 2.81905	train's rmse: 3.69181	val's l1: 2.83993	val's rmse: 3.72207
[700]	train's l1: 2.78994	train's rmse: 3.66247	val's l1: 2.81337	val's rmse: 3.69646
[800]	train's l1: 2.77114	train's rmse: 3.64259	val's l1: 2.79721	val's rmse: 3.68048
Did not meet early stopping. Best iteration is:
[800]	train's l1: 2.77114	train's rmse: 3.64259	val's l1: 2.79721	val's rmse: 3.68048

==================================================
  TEST SET RESULTS
==================

MAE:  2.60 points (out of 100)
  RMSE: 3.63
  R²:   0.9731
===============

Top 15 features:
  hour                                     2461887676.0
  emergency_availability_score             1411890960.0
  nearest_hospital_proxy_km                1369465109.3
  crime_rate_per_100k                      863774352.5
  flood_risk                               281395411.9
  month                                    117374259.2
  earthquake_risk                          76453756.8
  road_accident_hotspot_risk               61269247.0
  accident_severity_index                  49347656.3
  day_of_week                              32747642.9
  cyclone_risk                             22285944.2
  total_events                             19381505.8
  water_safety_score                       3811834.2
  fire_risk_index                          2675953.7
  water_contamination_risk                 1194466.0

Error distribution:
  Mean error:   -0.20
  Std error:    3.63
  Within ±5:    83.0%
  Within ±10:   98.8%
  Worst error:  25.6

Model saved: /content/drive/MyDrive/yatrax-ml/models/safety_scorer/safety_scorer.lgb
Metadata saved: /content/drive/MyDrive/yatrax-ml/models/safety_scorer/metadata.json

── Incident Classifier ──
Loaded 56013 incident samples
Features: 34
Classes: ['crime_assault', 'crime_robbery', 'cyclone_storm', 'earthquake', 'fire', 'flood', 'landslide', 'medical_emergency', 'road_accident', 'stranded', 'unknown', 'wildlife']

Training LightGBM incident classifier...
Training until validation scores don't improve for 30 rounds
[50]	val's multi_logloss: 0.13475
[100]	val's multi_logloss: 0.129559
Early stopping, best iteration is:
[87]	val's multi_logloss: 0.129243

Classification Report:
                   precision    recall  f1-score   support

    crime_assault       0.51      0.52      0.51       100
    crime_robbery       0.52      0.50      0.51       100
    cyclone_storm       1.00      1.00      1.00       100
       earthquake       0.00      0.00      0.00       100
             fire       1.00      1.00      1.00      8648
            flood       1.00      1.00      1.00       100
        landslide       1.00      1.00      1.00       100
medical_emergency       0.57      0.73      0.64       400
    road_accident       0.99      1.00      1.00       955
         stranded       0.70      0.99      0.82       400
          unknown       0.00      0.00      0.00       100
         wildlife       0.50      0.03      0.06       100

    accuracy                           0.95     11203
        macro avg       0.65      0.65      0.63     11203
     weighted avg       0.94      0.95      0.95     11203

Model saved to /content/drive/MyDrive/yatrax-ml/models/incident_classifier

── Anomaly Detector ──
Loaded grid: 93611 cells
Anomaly features: 20

Training Isolation Forest...

Results on training data:
  Normal:    86141 (92.0%)
  Anomalous: 7470 (8.0%)
  Score range: -0.7191 to -0.3740
  Score mean:  -0.4613
  Score std:   0.0657

Top 10 most anomalous cells:
  (24.2, 73.3) score=-0.7191 — crime_rate_per_100k=538.8(med=107.8)
  (25.9, 90.7) score=-0.6995 — crime_rate_per_100k=505.3(med=107.8)
  (25.8, 90.7) score=-0.6990 — crime_rate_per_100k=505.3(med=107.8)
  (25.8, 90.8) score=-0.6990 — crime_rate_per_100k=505.3(med=107.8)
  (25.9, 90.8) score=-0.6981 — crime_rate_per_100k=505.3(med=107.8)
  (25.7, 90.9) score=-0.6973 — crime_rate_per_100k=391.3(med=107.8)
  (25.8, 90.9) score=-0.6969 — crime_rate_per_100k=337.4(med=107.8)
  (25.6, 90.9) score=-0.6959 — crime_rate_per_100k=307.2(med=107.8)
  (22.5, 72.5) score=-0.6951 — crime_rate_per_100k=750.0(med=107.8)
  (25.9, 90.9) score=-0.6940 — crime_rate_per_100k=295.8(med=107.8)

Model saved to /content/drive/MyDrive/yatrax-ml/models/anomaly

── Trajectory Forecaster ──
Generating trajectory training data...
Generated 60000 samples
Training Gradient Boosting trajectory model...

Trajectory Model Results:
  MAE: 4.40 points
  Within ±5: 66.2%
  Within ±10: 91.0%
Saved to /content/drive/MyDrive/yatrax-ml/models/trajectory

── Spatial Risk ──
Spatial risk propagation model saved to /content/drive/MyDrive/yatrax-ml/models/spatial_risk
Profiles: 12 incident types
  flood                spread= 15.0km  decay= 48.0h  intensity=0.80
  landslide            spread=  3.0km  decay= 72.0h  intensity=0.70
  earthquake           spread= 50.0km  decay= 24.0h  intensity=0.90
  cyclone_storm        spread= 80.0km  decay= 36.0h  intensity=0.85
  wildlife             spread=  5.0km  decay= 12.0h  intensity=0.50
  crime_robbery        spread=  2.0km  decay=  6.0h  intensity=0.40
  crime_assault        spread=  1.5km  decay=  6.0h  intensity=0.40
  road_accident        spread=  1.0km  decay=  4.0h  intensity=0.30
  fire                 spread= 10.0km  decay= 24.0h  intensity=0.70
  medical_emergency    spread=  0.5km  decay=  2.0h  intensity=0.10
  stranded             spread=  0.5km  decay=  2.0h  intensity=0.10
  unknown              spread=  5.0km  decay= 12.0h  intensity=0.50

── Alert Timing ──
Alert timing model saved to /content/drive/MyDrive/yatrax-ml/models/alert_timing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STEP: 6/6 — Evaluate All Models
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

======================================================================
  YatraX ML Pipeline — Evaluation Report
  2026-05-09 14:01 UTC
======================

📊 SAFETY SCORER (LightGBM)
   MAE:       2.60 / 100
   RMSE:      3.63
   R²:        0.9731
   Within ±5: 83.0%
   Within ±10:98.8%
   Features:  35
   Samples:   840480

📊 TRAJECTORY FORECASTER (GBM)
   MAE:       4.40 points
   Within ±5: 66.2%
   Within ±10:91.0%
   Samples:   60000

📊 ANOMALY DETECTOR (Isolation Forest)
   Training cells:    93611
   Anomalies found:   7470 (8.0%)
   Features:          20
   Score range:       [-0.7191, -0.3740]
   Score mean±std:    -0.4613 ± 0.0657

📊 INCIDENT CLASSIFIER (LightGBM)
   Accuracy:  95.47%
   Classes:   12
   Samples:   56013
   Per-class F1:
     cyclone_storm        ████████████████████ 1.00
     fire                 ████████████████████ 1.00
     flood                ████████████████████ 1.00
     landslide            ████████████████████ 1.00
     road_accident        ███████████████████░ 1.00
     stranded             ████████████████░░░░ 0.82
     medical_emergency    ████████████░░░░░░░░ 0.64
     crime_assault        ██████████░░░░░░░░░░ 0.51
     crime_robbery        ██████████░░░░░░░░░░ 0.51
     wildlife             █░░░░░░░░░░░░░░░░░░░ 0.06
     earthquake           ░░░░░░░░░░░░░░░░░░░░ 0.00
     unknown              ░░░░░░░░░░░░░░░░░░░░ 0.00

📊 SPATIAL RISK PROPAGATION (parametric_distance_decay)
   Incident profiles: 12
     flood                spread=15km decay=48h
     landslide            spread=3km decay=72h
     earthquake           spread=50km decay=24h
     cyclone_storm        spread=80km decay=36h
     wildlife             spread=5km decay=12h
     ... and 7 more

📊 ALERT TIMING (heuristic_with_experience_logging)
   Actions:   ['wait', 'soft_nudge', 'standard_alert', 'urgent_alert', 'emergency']
   Danger zone: score < 35
   Caution zone: score < 50
   Min alert gap: 10min
   RL status: collecting_experience

📊 EDGE CASE VALIDATION
   ✅ Safe urban daytime                  →  89.3  (expected 60-100)
   ✅ Monsoon flood zone night            →  19.9  (expected 0-55)
   ✅ High crime area late night          →  26.1  (expected 15-45)
   ✅ Remote area poor infrastructure     →  46.5  (expected 20-50)
   Passed: 4/4

📊 ALERT TIMING VALIDATION
   ✅ Critical             → emergency (expected emergency)
   ✅ Safe                 → wait (expected wait)
   Passed: 2/2

📊 SPATIAL RISK VALIDATION
   Flood 5km/2h:   0.4564 (should be >0.1)   ✅
   Flood 200km/2h: 0.0000 (should be ~0)     ✅
   Flood 5km/100h: 0.0592 (should be <0.1)   ✅

======================================================================
Report saved: /content/drive/MyDrive/yatrax-ml/models/evaluation_report.json

============================================================
  Pipeline complete in 20m 7s
=============================

📁 Outputs:
  Processed data       →  13 files, 2.1 MB
  Training data        →   5 files, 68.5 MB
  Trained models       →  18 files, 12.0 MB

Colab paid products - Cancel contracts here

Inspecting data in: /content/drive/MyDrive/yatrax-ml/data/raw
=============================================================

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/crime
----------------------------------------------------------

📄 File: 32_Murder_victim_age_sex.csv (0.08 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Victims_Above_50_Yrs', 'Victims_Total', 'Victims_Upto_10_15_Yrs', 'Victims_Upto_10_Yrs', 'Victims_Upto_15_18_Yrs', 'Victims_Upto_18_30_Yrs', 'Victims_Upto_30_50_Yrs']
Preview:
state	Year	Group_Name	Sub_Group_Name	Victims_Above_50_Yrs	Victims_Total	Victims_Upto_10_15_Yrs	Victims_Upto_10_Yrs	Victims_Upto_15_18_Yrs	Victims_Upto_18_30_Yrs	Victims_Upto_30_50_Yrs
0	Andaman & Nicobar Islands	2001	Murder - Female Victims	2. Female Victims	NaN	6	NaN	NaN	NaN	4.0	2.0
1	Andhra Pradesh	2001	Murder - Female Victims	2. Female Victims	67.0	607	15.0	38.0	43.0	269.0	175.0
2	Arunachal Pradesh	2001	Murder - Female Victims	2. Female Victims	2.0	16	0.0	0.0	0.0	10.0	4.0
3	Assam	2001	Murder - Female Victims	2. Female Victims	11.0	128	8.0	4.0	23.0	45.0	37.0
4	Bihar	2001	Murder - Female Victims	2. Female Victims	12.0	366	0.0	0.0	40.0	191.0	123.0

........................................

📄 File: 25_Complaints_against_police.csv (0.04 MB)
Features: ['state', 'Year', 'Sub_group', 'CPA_-_Cases_Registered', 'CPA_-_Cases_Reported_for_Dept._Action', 'CPA_-_Complaints/Cases_Declared_False/Unsubstantiated', 'CPA_-_Complaints_Received/Alleged', 'CPA_-_No_of_Departmental_Enquiries', 'CPA_-_No_of_Magisterial_Enquiries', 'CPA-_Cases_Sent_for_Trials/Charge-sheeted', 'CPA-_No_of_Judicial_Enquiries', 'CPB_-_Police_Personnel_Acquitted', 'CPB_-_Police_Personnel_Convicted', 'CPB_-_Police_Personnel_sent_up_for_Trial', 'CPB_-_Police_Personnel_Trial_Completed', 'CPB-_Police_Personnel_Cases_Withdrawn_or_Otherwise_disposed_of', 'CPC_-_Police_personnel_Cases_Trial_Completed', 'CPC_-_Police_Personnel_Cases_Withdrawn_or_Otherwise_disposed_of', 'CPC_-_Police_Personnel_Disciplinary_Action_Initiated', 'CPC_-_Police_Personnel_Dismissal/Removal_from_Service', 'CPC_-_Police_Personnel_Major_Punishment_awarded', 'CPC_-_Police_Personnel_Minor_Punishment_awarded']
Preview:
state	Year	Sub_group	CPA_-_Cases_Registered	CPA_-_Cases_Reported_for_Dept._Action	CPA_-_Complaints/Cases_Declared_False/Unsubstantiated	CPA_-_Complaints_Received/Alleged	CPA_-_No_of_Departmental_Enquiries	CPA_-_No_of_Magisterial_Enquiries	CPA-_Cases_Sent_for_Trials/Charge-sheeted	...	CPB_-_Police_Personnel_Convicted	CPB_-_Police_Personnel_sent_up_for_Trial	CPB_-_Police_Personnel_Trial_Completed	CPB-_Police_Personnel_Cases_Withdrawn_or_Otherwise_disposed_of	CPC_-_Police_personnel_Cases_Trial_Completed	CPC_-_Police_Personnel_Cases_Withdrawn_or_Otherwise_disposed_of	CPC_-_Police_Personnel_Disciplinary_Action_Initiated	CPC_-_Police_Personnel_Dismissal/Removal_from_Service	CPC_-_Police_Personnel_Major_Punishment_awarded	CPC_-_Police_Personnel_Minor_Punishment_awarded
0	Andaman & Nicobar Islands	2001	Complaints Against Police Personnel	10	4	0	10	4	0	5	...	0	5	1	0	6	25	73	2	11	20
1	Andhra Pradesh	2001	Complaints Against Police Personnel	3078	72	109	3229	160	2969	3039	...	3	92	15	16	23	476	1506	47	248	1085
2	Arunachal Pradesh	2001	Complaints Against Police Personnel	24	39	5	54	44	0	17	...	0	17	0	1	8	43	107	4	17	15
3	Assam	2001	Complaints Against Police Personnel	17	3	1	52	52	3	9	...	0	7	1	1	0	7	144	5	61	102
4	Bihar	2001	Complaints Against Police Personnel	1	1	12	125	3	15	18	...	0	81	0	6	537	141	1385	33	470	1557
5 rows × 22 columns

........................................

📄 File: 30_Auto_theft.csv (0.14 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Auto_Theft_Coordinated/Traced', 'Auto_Theft_Recovered', 'Auto_Theft_Stolen']
Preview:
state	Year	Group_Name	Sub_Group_Name	Auto_Theft_Coordinated/Traced	Auto_Theft_Recovered	Auto_Theft_Stolen
0	Andaman & Nicobar Islands	2001	AT1-Motor Cycles/ Scooters	1. Motor Cycles/ Scooters	NaN	4.0	4
1	Andhra Pradesh	2001	AT1-Motor Cycles/ Scooters	1. Motor Cycles/ Scooters	136.0	1311.0	2725
2	Arunachal Pradesh	2001	AT1-Motor Cycles/ Scooters	1. Motor Cycles/ Scooters	0.0	21.0	27
3	Assam	2001	AT1-Motor Cycles/ Scooters	1. Motor Cycles/ Scooters	0.0	94.0	205
4	Bihar	2001	AT1-Motor Cycles/ Scooters	1. Motor Cycles/ Scooters	44.0	205.0	946
........................................

📄 File: 33_CH_not_murder_victim_age_sex.csv (0.05 MB)
Features: ['state', 'Year', 'Sub_Group_Name', 'Victims_Above_50_Yrs', 'Victims_Total', 'Victims_Upto_10_15_Yrs', 'Victims_Upto_10_Yrs', 'Victims_Upto_15_18_Yrs', 'Victims_Upto_18_30_Yrs', 'Victims_Upto_30_50_Yrs']
Preview:
state	Year	Sub_Group_Name	Victims_Above_50_Yrs	Victims_Total	Victims_Upto_10_15_Yrs	Victims_Upto_10_Yrs	Victims_Upto_15_18_Yrs	Victims_Upto_18_30_Yrs	Victims_Upto_30_50_Yrs
0	Andhra Pradesh	2001	1. Male Victims	17.0	144.0	3.0	1.0	5.0	54.0	64.0
1	Arunachal Pradesh	2001	1. Male Victims	1.0	6.0	0.0	0.0	0.0	3.0	2.0
2	Assam	2001	1. Male Victims	2.0	38.0	0.0	0.0	0.0	20.0	16.0
3	Bihar	2001	1. Male Victims	20.0	232.0	3.0	0.0	19.0	116.0	74.0
4	Chandigarh	2001	1. Male Victims	0.0	6.0	NaN	0.0	NaN	6.0	0.0
........................................

📄 File: 31_Serious_fraud.csv (0.04 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Loss_of_Property_1_10_Crores', 'Loss_of_Property_10_25_Crores', 'Loss_of_Property_25_50_Crores', 'Loss_of_Property_50_100_Crores', 'Loss_of_Property_Above_100_Crores']
Preview:
state	Year	Group_Name	Sub_Group_Name	Loss_of_Property_1_10_Crores	Loss_of_Property_10_25_Crores	Loss_of_Property_25_50_Crores	Loss_of_Property_50_100_Crores	Loss_of_Property_Above_100_Crores
0	Andhra Pradesh	2001	Serious Fraud - Cheating	2. Cheating	4.0	0.0	0.0	0.0	0.0
1	Arunachal Pradesh	2001	Serious Fraud - Cheating	2. Cheating	0.0	0.0	0.0	0.0	0.0
2	Assam	2001	Serious Fraud - Cheating	2. Cheating	0.0	0.0	0.0	0.0	0.0
3	Bihar	2001	Serious Fraud - Cheating	2. Cheating	0.0	0.0	0.0	0.0	0.0
4	Chandigarh	2001	Serious Fraud - Cheating	2. Cheating	0.0	0.0	0.0	0.0	0.0
........................................

📄 File: 29_Period_of_trials_by_courts.csv (0.19 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'PT_1_3_Years', 'PT_3_5_Years', 'PT_5_10_Years', 'PT_6_12_Months', 'PT_Less_than_6_Months', 'PT_Over_10_Years', 'PT_Total']
Preview:
state	Year	Group_Name	Sub_Group_Name	PT_1_3_Years	PT_3_5_Years	PT_5_10_Years	PT_6_12_Months	PT_Less_than_6_Months	PT_Over_10_Years	PT_Total
0	Andhra Pradesh	2004	PT1. District/Session Judge	1. District/Session Judge	1931.0	805.0	196.0	293.0	44.0	57.0	3326.0
1	Arunachal Pradesh	2004	PT1. District/Session Judge	1. District/Session Judge	13.0	6.0	0.0	5.0	0.0	0.0	24.0
2	Assam	2004	PT1. District/Session Judge	1. District/Session Judge	582.0	444.0	170.0	127.0	69.0	22.0	1414.0
3	Bihar	2004	PT1. District/Session Judge	1. District/Session Judge	297.0	590.0	594.0	11.0	0.0	233.0	1725.0
4	Chhattisgarh	2004	PT1. District/Session Judge	1. District/Session Judge	239.0	171.0	72.0	222.0	271.0	17.0	992.0
........................................

📄 File: 20_Victims_of_rape.csv (0.06 MB)
Features: ['state', 'Year', 'Subgroup', 'Rape_Cases_Reported', 'Victims_Above_50_Yrs', 'Victims_Between_10-14_Yrs', 'Victims_Between_14-18_Yrs', 'Victims_Between_18-30_Yrs', 'Victims_Between_30-50_Yrs', 'Victims_of_Rape_Total', 'Victims_Upto_10_Yrs']
Preview:
state	Year	Subgroup	Rape_Cases_Reported	Victims_Above_50_Yrs	Victims_Between_10-14_Yrs	Victims_Between_14-18_Yrs	Victims_Between_18-30_Yrs	Victims_Between_30-50_Yrs	Victims_of_Rape_Total	Victims_Upto_10_Yrs
0	Andaman & Nicobar Islands	2001	Total Rape Victims	3	0	0	3	0	0	3	0
1	Andaman & Nicobar Islands	2001	Victims of Incest Rape	1	0	0	1	0	0	1	0
2	Andaman & Nicobar Islands	2001	Victims of Other Rape	2	0	0	2	0	0	2	0
3	Andaman & Nicobar Islands	2002	Total Rape Victims	2	0	0	1	1	0	2	0
4	Andaman & Nicobar Islands	2002	Victims of Incest Rape	0	0	0	0	0	0	0	0
........................................

📄 File: 10_Property_stolen_and_recovered.csv (0.19 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Cases_Property_Recovered', 'Cases_Property_Stolen', 'Value_of_Property_Recovered', 'Value_of_Property_Stolen']
Preview:
state	Year	Group_Name	Sub_Group_Name	Cases_Property_Recovered	Cases_Property_Stolen	Value_of_Property_Recovered	Value_of_Property_Stolen
0	Andaman & Nicobar Islands	2001	Burglary - Property	3. Burglary	27	64	755858	1321961
1	Andhra Pradesh	2001	Burglary - Property	3. Burglary	3321	7134	51483437	147019348
2	Arunachal Pradesh	2001	Burglary - Property	3. Burglary	66	248	825115	4931904
3	Assam	2001	Burglary - Property	3. Burglary	539	2423	3722850	21466955
4	Bihar	2001	Burglary - Property	3. Burglary	367	3231	2327135	17023937
........................................

📄 File: 28_Trial_of_violent_crimes_by_courts.csv (0.31 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Trial_of_Violent_Crimes_by_Courts_By_Confession', 'Trial_of_Violent_Crimes_by_Courts_By_trial', 'Trial_of_Violent_Crimes_by_Courts_Total']
Preview:
state	Year	Group_Name	Sub_Group_Name	Trial_of_Violent_Crimes_by_Courts_By_Confession	Trial_of_Violent_Crimes_by_Courts_By_trial	Trial_of_Violent_Crimes_by_Courts_Total
0	Andhra Pradesh	2001	TVC- Arson	10. Arson	20.0	517.0	537.0
1	Arunachal Pradesh	2001	TVC- Arson	10. Arson	0.0	3.0	3.0
2	Assam	2001	TVC- Arson	10. Arson	5.0	142.0	147.0
3	Bihar	2001	TVC- Arson	10. Arson	0.0	208.0	208.0
4	Chandigarh	2001	TVC- Arson	10. Arson	0.0	3.0	3.0
........................................

📄 File: 35_Human_rights_violation_by_police.csv (0.17 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Cases_Registered_under_Human_Rights_Violations', 'Policemen_Chargesheeted', 'Policemen_Convicted']
Preview:
state	Year	Group_Name	Sub_Group_Name	Cases_Registered_under_Human_Rights_Violations	Policemen_Chargesheeted	Policemen_Convicted
0	Andhra Pradesh	2001	HR_Disappearance of Persons	01. Disappearance of Persons	0.0	0.0	0.0
1	Arunachal Pradesh	2001	HR_Disappearance of Persons	01. Disappearance of Persons	0.0	0.0	0.0
2	Assam	2001	HR_Disappearance of Persons	01. Disappearance of Persons	0.0	0.0	0.0
3	Bihar	2001	HR_Disappearance of Persons	01. Disappearance of Persons	0.0	0.0	0.0
4	Chandigarh	2001	HR_Disappearance of Persons	01. Disappearance of Persons	0.0	0.0	0.0
........................................

📄 File: 36_Police_housing.csv (0.07 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'PH_Houses_Provided_by_Department', 'PH_Houses_provided_on_LeaseRentGPRA', 'PH_Sanctioned_Strength']
Preview:
state	Year	Group_Name	Sub_Group_Name	PH_Houses_Provided_by_Department	PH_Houses_provided_on_LeaseRentGPRA	PH_Sanctioned_Strength
0	Andaman & Nicobar Islands	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	7.0	NaN	17
1	Andhra Pradesh	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	102.0	189.0	569
2	Arunachal Pradesh	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	81.0	11.0	92
3	Assam	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	0.0	0.0	531
4	Bihar	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	130.0	89.0	222
........................................

📄 File: 40_01_Custodial_death_person_remanded.csv (0.03 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'CD_Deaths_Reported', 'CD_No_of_Autopsy_conducted', 'CD_No_of_Cases_registered_in_connection_with_deaths', 'CD_No_of_Judicial_enquiry_orderedconducted', 'CD_No_of_Magisterial_enquiry_orderedconducted', 'CD_No_of_Policemen_Charge_sheeted', 'CD_No_of_Policemen_Convicted']
Preview:
state	Year	Group_Name	Sub_Group_Name	CD_Deaths_Reported	CD_No_of_Autopsy_conducted	CD_No_of_Cases_registered_in_connection_with_deaths	CD_No_of_Judicial_enquiry_orderedconducted	CD_No_of_Magisterial_enquiry_orderedconducted	CD_No_of_Policemen_Charge_sheeted	CD_No_of_Policemen_Convicted
0	Andhra Pradesh	2001	Persons Remand to Police Custody by Court	1. Deaths in Custody/Lockup of Persons Remande...	5.0	5.0	2.0	2.0	2.0	0.0	0.0
1	Arunachal Pradesh	2001	Persons Remand to Police Custody by Court	1. Deaths in Custody/Lockup of Persons Remande...	0.0	0.0	0.0	0.0	0.0	0.0	0.0
2	Assam	2001	Persons Remand to Police Custody by Court	1. Deaths in Custody/Lockup of Persons Remande...	1.0	1.0	0.0	0.0	1.0	0.0	0.0
3	Bihar	2001	Persons Remand to Police Custody by Court	1. Deaths in Custody/Lockup of Persons Remande...	0.0	0.0	0.0	0.0	0.0	0.0	0.0
4	Chandigarh	2001	Persons Remand to Police Custody by Court	1. Deaths in Custody/Lockup of Persons Remande...	0.0	0.0	0.0	0.0	0.0	0.0	0.0
........................................

📄 File: 40_02_Custodial_death_person_not_remanded.csv (0.04 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'CD_Deaths_Reported', 'CD_No_of_Autopsy_conducted', 'CD_No_of_Cases_registered_in_connection_with_deaths', 'CD_No_of_Judicial_enquiry_orderedconducted', 'CD_No_of_Magisterial_enquiry_orderedconducted', 'CD_No_of_Policemen_Charge_sheeted', 'CD_No_of_Policemen_Convicted']
Preview:
state	Year	Group_Name	Sub_Group_Name	CD_Deaths_Reported	CD_No_of_Autopsy_conducted	CD_No_of_Cases_registered_in_connection_with_deaths	CD_No_of_Judicial_enquiry_orderedconducted	CD_No_of_Magisterial_enquiry_orderedconducted	CD_No_of_Policemen_Charge_sheeted	CD_No_of_Policemen_Convicted
0	Andhra Pradesh	2001	Persons Not Remand to Police Custody by Court	2. Deaths in Custody/Lockup of Persons Not Rem...	8	8.0	2.0	1.0	5.0	1.0	0.0
1	Arunachal Pradesh	2001	Persons Not Remand to Police Custody by Court	2. Deaths in Custody/Lockup of Persons Not Rem...	0	0.0	0.0	0.0	0.0	0.0	0.0
2	Assam	2001	Persons Not Remand to Police Custody by Court	2. Deaths in Custody/Lockup of Persons Not Rem...	2	2.0	0.0	0.0	2.0	0.0	0.0
3	Bihar	2001	Persons Not Remand to Police Custody by Court	2. Deaths in Custody/Lockup of Persons Not Rem...	0	0.0	0.0	0.0	0.0	0.0	0.0
4	Chandigarh	2001	Persons Not Remand to Police Custody by Court	2. Deaths in Custody/Lockup of Persons Not Rem...	0	0.0	0.0	NaN	0.0	0.0	0.0
........................................

📄 File: 40_04_Custodial_death_during_hospitalization_or_treatment.csv (0.02 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'CD_Hospitalisation_Treatment']
Preview:
state	Year	Group_Name	Sub_Group_Name	CD_Hospitalisation_Treatment
0	Andhra Pradesh	2001	During Hospitalisation/Treatment/Other Reasons	4. Deaths during Hospitalisation/Treatment	15
1	Arunachal Pradesh	2001	During Hospitalisation/Treatment/Other Reasons	4. Deaths during Hospitalisation/Treatment	1
2	Bihar	2001	During Hospitalisation/Treatment/Other Reasons	4. Deaths during Hospitalisation/Treatment	0
3	Chandigarh	2001	During Hospitalisation/Treatment/Other Reasons	4. Deaths during Hospitalisation/Treatment	0
4	Chhattisgarh	2001	During Hospitalisation/Treatment/Other Reasons	4. Deaths during Hospitalisation/Treatment	0
........................................

📄 File: 40_03_Custodial_death_during_production.csv (0.04 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'CD_Deaths_Reported', 'CD_No_of_Autopsy_conducted', 'CD_No_of_Cases_registered_in_connection_with_deaths', 'CD_No_of_Judicial_enquiry_orderedconducted', 'CD_No_of_Magisterial_enquiry_orderedconducted', 'CD_No_of_Policemen_Charge_sheeted', 'CD_No_of_Policemen_Convicted']
Preview:
state	Year	Group_Name	Sub_Group_Name	CD_Deaths_Reported	CD_No_of_Autopsy_conducted	CD_No_of_Cases_registered_in_connection_with_deaths	CD_No_of_Judicial_enquiry_orderedconducted	CD_No_of_Magisterial_enquiry_orderedconducted	CD_No_of_Policemen_Charge_sheeted	CD_No_of_Policemen_Convicted
0	Andhra Pradesh	2001	During Production/Process in Courts/Journey Co...	3. Deaths in Custody during production/process...	3	3.0	3.0	1.0	1.0	0.0	0.0
1	Arunachal Pradesh	2001	During Production/Process in Courts/Journey Co...	3. Deaths in Custody during production/process...	0	0.0	0.0	0.0	0.0	0.0	0.0
2	Assam	2001	During Production/Process in Courts/Journey Co...	3. Deaths in Custody during production/process...	0	0.0	0.0	0.0	0.0	0.0	0.0
3	Bihar	2001	During Production/Process in Courts/Journey Co...	3. Deaths in Custody during production/process...	0	0.0	0.0	0.0	0.0	0.0	0.0
4	Chandigarh	2001	During Production/Process in Courts/Journey Co...	3. Deaths in Custody during production/process...	0	0.0	0.0	0.0	0.0	0.0	0.0
........................................

📄 File: 39_Specific_purpose_of_kidnapping_and_abduction.csv (0.42 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'K_A_Cases_Reported', 'K_A_Female_10_15_Years', 'K_A_Female_15_18_Years', 'K_A_Female_18_30_Years', 'K_A_Female_30_50_Years', 'K_A_Female_Above_50_Years', 'K_A_Female_Total', 'K_A_Female_Upto_10_Years', 'K_A_Grand_Total', 'K_A_Male_10_15_Years', 'K_A_Male_15_18_Years', 'K_A_Male_18_30_Years', 'K_A_Male_30_50_Years', 'K_A_Male_Above_50_Years', 'K_A_Male_Total', 'K_A_Male_Upto_10_Years']
Preview:
state	Year	Group_Name	Sub_Group_Name	K_A_Cases_Reported	K_A_Female_10_15_Years	K_A_Female_15_18_Years	K_A_Female_18_30_Years	K_A_Female_30_50_Years	K_A_Female_Above_50_Years	K_A_Female_Total	K_A_Female_Upto_10_Years	K_A_Grand_Total	K_A_Male_10_15_Years	K_A_Male_15_18_Years	K_A_Male_18_30_Years	K_A_Male_30_50_Years	K_A_Male_Above_50_Years	K_A_Male_Total	K_A_Male_Upto_10_Years
0	Andhra Pradesh	2001	Kidnap - For Adoption	01. For Adoption	8.0	0.0	0.0	4.0	0.0	0.0	5.0	1.0	8.0	0.0	0.0	0.0	0.0	0.0	3.0	3.0
1	Arunachal Pradesh	2001	Kidnap - For Adoption	01. For Adoption	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0
2	Assam	2001	Kidnap - For Adoption	01. For Adoption	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0
3	Bihar	2001	Kidnap - For Adoption	01. For Adoption	18.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	18.0	0.0	0.0	15.0	3.0	0.0	18.0	0.0
4	Chandigarh	2001	Kidnap - For Adoption	01. For Adoption	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0	0.0
........................................

📄 File: 36_Police_housing_fixed.csv (0.07 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'PH_Houses_Provided_by_Department', 'PH_Houses_provided_on_LeaseRentGPRA', 'PH_Sanctioned_Strength']
Preview:
state	Year	Group_Name	Sub_Group_Name	PH_Houses_Provided_by_Department	PH_Houses_provided_on_LeaseRentGPRA	PH_Sanctioned_Strength
0	Andaman & Nicobar Islands	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	7.0	NaN	17
1	Andhra Pradesh	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	102.0	189.0	569
2	Arunachal Pradesh	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	81.0	11.0	92
3	Assam	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	0.0	0.0	531
4	Bihar	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	130.0	89.0	222
........................................

📄 File: 40_05_Custodial_death_others.csv (0.03 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'CD_Accidents', 'CD_By_Mob_AttackRiots', 'CD_By_other_Criminals', 'CD_By_Suicide', 'CD_IllnessNatural_Death', 'CD_While_Escaping_from_Custody']
Preview:
state	Year	Group_Name	Sub_Group_Name	CD_Accidents	CD_By_Mob_AttackRiots	CD_By_other_Criminals	CD_By_Suicide	CD_IllnessNatural_Death	CD_While_Escaping_from_Custody
0	Andhra Pradesh	2001	During Hospitalisation/Treatment/Other Reasons	5. Deaths due to Other Reasons	0.0	0.0	0.0	2.0	1.0	2.0
1	Arunachal Pradesh	2001	During Hospitalisation/Treatment/Other Reasons	5. Deaths due to Other Reasons	0.0	0.0	0.0	0.0	0.0	0.0
2	Bihar	2001	During Hospitalisation/Treatment/Other Reasons	5. Deaths due to Other Reasons	0.0	0.0	0.0	0.0	0.0	0.0
3	Chandigarh	2001	During Hospitalisation/Treatment/Other Reasons	5. Deaths due to Other Reasons	0.0	0.0	1.0	0.0	0.0	0.0
4	Chhattisgarh	2001	During Hospitalisation/Treatment/Other Reasons	5. Deaths due to Other Reasons	0.0	0.0	0.0	1.0	0.0	0.0
........................................

📄 File: 42_Cases_under_crime_against_women.csv (0.31 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Cases_Acquitted_or_Discharged', 'Cases_charge_sheets_were_not_laid_but_Final_Report_submitted', 'Cases_Chargesheeted', 'Cases_Compounded_or_Withdrawn', 'Cases_Convicted', 'Cases_Declared_False_on_Account_of_Mistake_of_Fact_or_of_Law', 'Cases_Investigated_Chargesheets+FR_Submitted', 'Cases_not_Investigated_or_in_which_investigation_was_refused', 'Cases_Pending_Investigation_at_Year_End', 'Cases_Pending_Investigation_from_previous_year', 'Cases_Pending_Trial_at_Year_End', 'Cases_Pending_Trial_from_the_previous_year', 'Cases_Reported', 'Cases_Sent_for_Trial', 'Cases_Trials_Completed', 'Cases_Withdrawn_by_the_Govt', 'Cases_withdrawn_by_the_Govt_during_investigation', 'Total_Cases_for_Trial']
Preview:
state	Year	Group_Name	Sub_Group_Name	Cases_Acquitted_or_Discharged	Cases_charge_sheets_were_not_laid_but_Final_Report_submitted	Cases_Chargesheeted	Cases_Compounded_or_Withdrawn	Cases_Convicted	Cases_Declared_False_on_Account_of_Mistake_of_Fact_or_of_Law	...	Cases_Pending_Investigation_at_Year_End	Cases_Pending_Investigation_from_previous_year	Cases_Pending_Trial_at_Year_End	Cases_Pending_Trial_from_the_previous_year	Cases_Reported	Cases_Sent_for_Trial	Cases_Trials_Completed	Cases_Withdrawn_by_the_Govt	Cases_withdrawn_by_the_Govt_during_investigation	Total_Cases_for_Trial
0	Andaman & Nicobar Islands	2001	Rape	01. Rape	5	2	3	0	0	0	...	1	3	34	36	3	3	5	0	0	39
1	Andhra Pradesh	2001	Rape	01. Rape	731	22	769	35	197	74	...	393	390	1974	2170	871	769	928	2	0	2937
2	Arunachal Pradesh	2001	Rape	01. Rape	1	2	25	0	2	0	...	18	12	282	260	33	25	3	0	0	285
3	Assam	2001	Rape	01. Rape	334	95	495	10	101	45	...	1045	863	1964	1914	817	495	435	0	0	2409
4	Bihar	2001	Rape	01. Rape	406	141	685	0	155	105	...	488	531	3185	3061	888	685	561	0	0	3746
5 rows × 22 columns

........................................

📄 File: 43_Arrests_under_crime_against_women.csv (0.27 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Persons_Acquitted', 'Persons_against_whom_cases_Compounded_or_Withdrawn', 'Persons_Arrested', 'Persons_Chargesheeted', 'Persons_Convicted', 'Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_beginning', 'Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_end', 'Persons_in_Custody_or_on_Bail_during_Trial_at_Year_End', 'Persons_Released_or_Freed_by_Police_or_Magistrate_before_Trial_for_want_of_evidence_or_any_other_reason', 'Persons_Trial_Completed', 'Persons_under_Trial_at_Year_beginning', 'Total_Persons_under_Trial']
Preview:
state	Year	Group_Name	Sub_Group_Name	Persons_Acquitted	Persons_against_whom_cases_Compounded_or_Withdrawn	Persons_Arrested	Persons_Chargesheeted	Persons_Convicted	Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_beginning	Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_end	Persons_in_Custody_or_on_Bail_during_Trial_at_Year_End	Persons_Released_or_Freed_by_Police_or_Magistrate_before_Trial_for_want_of_evidence_or_any_other_reason	Persons_Trial_Completed	Persons_under_Trial_at_Year_beginning	Total_Persons_under_Trial
0	Andaman & Nicobar Islands	2001	Rape	01. Rape	6	0	3	3	0	6	6	45	0	6	48	51
1	Andhra Pradesh	2001	Rape	01. Rape	1168	13	1150	1021	246	450	545	2191	34	1414	2597	3618
2	Arunachal Pradesh	2001	Rape	01. Rape	1	0	51	31	2	25	30	347	15	3	319	350
3	Assam	2001	Rape	01. Rape	403	14	928	585	120	806	959	2331	190	523	2283	2868
4	Bihar	2001	Rape	01. Rape	756	0	1400	1302	217	719	576	5963	241	973	5634	6936
........................................

📄 File: fix_1.csv (0.07 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'PH_Houses_Provided_by_Department', 'PH_Houses_provided_on_LeaseRentGPRA', 'PH_Sanctioned_Strength']
Preview:
state	Year	Group_Name	Sub_Group_Name	PH_Houses_Provided_by_Department	PH_Houses_provided_on_LeaseRentGPRA	PH_Sanctioned_Strength
0	Andaman & Nicobar Islands	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	7.0	NaN	17
1	Andhra Pradesh	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	102.0	189.0	569
2	Arunachal Pradesh	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	81.0	11.0	92
3	Assam	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	0.0	0.0	531
4	Bihar	2001	PH_Officers (DySP & Above)	1. For Officers (Dy.SP & Above)	130.0	89.0	222
........................................

📄 File: 43_Arrests_under_crime_against_women_fixed.csv (0.27 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Persons_Acquitted', 'Persons_against_whom_cases_Compounded_or_Withdrawn', 'Persons_Arrested', 'Persons_Chargesheeted', 'Persons_Convicted', 'Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_beginning', 'Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_end', 'Persons_in_Custody_or_on_Bail_during_Trial_at_Year_End', 'Persons_Released_or_Freed_by_Police_or_Magistrate_before_Trial_for_want_of_evidence_or_any_other_reason', 'Persons_Trial_Completed', 'Persons_under_Trial_at_Year_beginning', 'Total_Persons_under_Trial']
Preview:
state	Year	Group_Name	Sub_Group_Name	Persons_Acquitted	Persons_against_whom_cases_Compounded_or_Withdrawn	Persons_Arrested	Persons_Chargesheeted	Persons_Convicted	Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_beginning	Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_end	Persons_in_Custody_or_on_Bail_during_Trial_at_Year_End	Persons_Released_or_Freed_by_Police_or_Magistrate_before_Trial_for_want_of_evidence_or_any_other_reason	Persons_Trial_Completed	Persons_under_Trial_at_Year_beginning	Total_Persons_under_Trial
0	Andaman & Nicobar Islands	2001	Rape	01. Rape	6	0	3	3	0	6	6	45	0	6	48	51
1	Andhra Pradesh	2001	Rape	01. Rape	1168	13	1150	1021	246	450	545	2191	34	1414	2597	3618
2	Arunachal Pradesh	2001	Rape	01. Rape	1	0	51	31	2	25	30	347	15	3	319	350
3	Assam	2001	Rape	01. Rape	403	14	928	585	120	806	959	2331	190	523	2283	2868
4	Bihar	2001	Rape	01. Rape	756	0	1400	1302	217	719	576	5963	241	973	5634	6936
........................................

📄 File: 42_Cases_under_crime_against_women_fixed.csv (0.31 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Cases_Acquitted_or_Discharged', 'Cases_charge_sheets_were_not_laid_but_Final_Report_submitted', 'Cases_Chargesheeted', 'Cases_Compounded_or_Withdrawn', 'Cases_Convicted', 'Cases_Declared_False_on_Account_of_Mistake_of_Fact_or_of_Law', 'Cases_Investigated_Chargesheets+FR_Submitted', 'Cases_not_Investigated_or_in_which_investigation_was_refused', 'Cases_Pending_Investigation_at_Year_End', 'Cases_Pending_Investigation_from_previous_year', 'Cases_Pending_Trial_at_Year_End', 'Cases_Pending_Trial_from_the_previous_year', 'Cases_Reported', 'Cases_Sent_for_Trial', 'Cases_Trials_Completed', 'Cases_Withdrawn_by_the_Govt', 'Cases_withdrawn_by_the_Govt_during_investigation', 'Total_Cases_for_Trial']
Preview:
state	Year	Group_Name	Sub_Group_Name	Cases_Acquitted_or_Discharged	Cases_charge_sheets_were_not_laid_but_Final_Report_submitted	Cases_Chargesheeted	Cases_Compounded_or_Withdrawn	Cases_Convicted	Cases_Declared_False_on_Account_of_Mistake_of_Fact_or_of_Law	...	Cases_Pending_Investigation_at_Year_End	Cases_Pending_Investigation_from_previous_year	Cases_Pending_Trial_at_Year_End	Cases_Pending_Trial_from_the_previous_year	Cases_Reported	Cases_Sent_for_Trial	Cases_Trials_Completed	Cases_Withdrawn_by_the_Govt	Cases_withdrawn_by_the_Govt_during_investigation	Total_Cases_for_Trial
0	Andaman & Nicobar Islands	2001	Rape	01. Rape	5	2	3	0	0	0	...	1	3	34	36	3	3	5	0	0	39
1	Andhra Pradesh	2001	Rape	01. Rape	731	22	769	35	197	74	...	393	390	1974	2170	871	769	928	2	0	2937
2	Arunachal Pradesh	2001	Rape	01. Rape	1	2	25	0	2	0	...	18	12	282	260	33	25	3	0	0	285
3	Assam	2001	Rape	01. Rape	334	95	495	10	101	45	...	1045	863	1964	1914	817	495	435	0	0	2409
4	Bihar	2001	Rape	01. Rape	406	141	685	0	155	105	...	488	531	3185	3061	888	685	561	0	0	3746
5 rows × 22 columns

........................................

📄 File: fix_2.csv (0.31 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Cases_Acquitted_or_Discharged', 'Cases_charge_sheets_were_not_laid_but_Final_Report_submitted', 'Cases_Chargesheeted', 'Cases_Compounded_or_Withdrawn', 'Cases_Convicted', 'Cases_Declared_False_on_Account_of_Mistake_of_Fact_or_of_Law', 'Cases_Investigated_Chargesheets+FR_Submitted', 'Cases_not_Investigated_or_in_which_investigation_was_refused', 'Cases_Pending_Investigation_at_Year_End', 'Cases_Pending_Investigation_from_previous_year', 'Cases_Pending_Trial_at_Year_End', 'Cases_Pending_Trial_from_the_previous_year', 'Cases_Reported', 'Cases_Sent_for_Trial', 'Cases_Trials_Completed', 'Cases_Withdrawn_by_the_Govt', 'Cases_withdrawn_by_the_Govt_during_investigation', 'Total_Cases_for_Trial']
Preview:
state	Year	Group_Name	Sub_Group_Name	Cases_Acquitted_or_Discharged	Cases_charge_sheets_were_not_laid_but_Final_Report_submitted	Cases_Chargesheeted	Cases_Compounded_or_Withdrawn	Cases_Convicted	Cases_Declared_False_on_Account_of_Mistake_of_Fact_or_of_Law	...	Cases_Pending_Investigation_at_Year_End	Cases_Pending_Investigation_from_previous_year	Cases_Pending_Trial_at_Year_End	Cases_Pending_Trial_from_the_previous_year	Cases_Reported	Cases_Sent_for_Trial	Cases_Trials_Completed	Cases_Withdrawn_by_the_Govt	Cases_withdrawn_by_the_Govt_during_investigation	Total_Cases_for_Trial
0	Andaman & Nicobar Islands	2001	Rape	01. Rape	5	2	3	0	0	0	...	1	3	34	36	3	3	5	0	0	39
1	Andhra Pradesh	2001	Rape	01. Rape	731	22	769	35	197	74	...	393	390	1974	2170	871	769	928	2	0	2937
2	Arunachal Pradesh	2001	Rape	01. Rape	1	2	25	0	2	0	...	18	12	282	260	33	25	3	0	0	285
3	Assam	2001	Rape	01. Rape	334	95	495	10	101	45	...	1045	863	1964	1914	817	495	435	0	0	2409
4	Bihar	2001	Rape	01. Rape	406	141	685	0	155	105	...	488	531	3185	3061	888	685	561	0	0	3746
5 rows × 22 columns

........................................

📄 File: fix_3.csv (0.27 MB)
Features: ['state', 'Year', 'Group_Name', 'Sub_Group_Name', 'Persons_Acquitted', 'Persons_against_whom_cases_Compounded_or_Withdrawn', 'Persons_Arrested', 'Persons_Chargesheeted', 'Persons_Convicted', 'Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_beginning', 'Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_end', 'Persons_in_Custody_or_on_Bail_during_Trial_at_Year_End', 'Persons_Released_or_Freed_by_Police_or_Magistrate_before_Trial_for_want_of_evidence_or_any_other_reason', 'Persons_Trial_Completed', 'Persons_under_Trial_at_Year_beginning', 'Total_Persons_under_Trial']
Preview:
state	Year	Group_Name	Sub_Group_Name	Persons_Acquitted	Persons_against_whom_cases_Compounded_or_Withdrawn	Persons_Arrested	Persons_Chargesheeted	Persons_Convicted	Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_beginning	Persons_in_Custody_or_on_Bail_during_Investigation_at_Year_end	Persons_in_Custody_or_on_Bail_during_Trial_at_Year_End	Persons_Released_or_Freed_by_Police_or_Magistrate_before_Trial_for_want_of_evidence_or_any_other_reason	Persons_Trial_Completed	Persons_under_Trial_at_Year_beginning	Total_Persons_under_Trial
0	Andaman & Nicobar Islands	2001	Rape	01. Rape	6	0	3	3	0	6	6	45	0	6	48	51
1	Andhra Pradesh	2001	Rape	01. Rape	1168	13	1150	1021	246	450	545	2191	34	1414	2597	3618
2	Arunachal Pradesh	2001	Rape	01. Rape	1	0	51	31	2	25	30	347	15	3	319	350
3	Assam	2001	Rape	01. Rape	403	14	928	585	120	806	959	2331	190	523	2283	2868
4	Bihar	2001	Rape	01. Rape	756	0	1400	1302	217	719	576	5963	241	973	5634	6936
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/crime/crime
----------------------------------------------------------------

📄 File: 01_District_wise_crimes_committed_IPC_2001_2012.csv (0.97 MB)
Features: ['STATE/UT', 'DISTRICT', 'YEAR', 'MURDER', 'ATTEMPT TO MURDER', 'CULPABLE HOMICIDE NOT AMOUNTING TO MURDER', 'RAPE', 'CUSTODIAL RAPE', 'OTHER RAPE', 'KIDNAPPING & ABDUCTION', 'KIDNAPPING AND ABDUCTION OF WOMEN AND GIRLS', 'KIDNAPPING AND ABDUCTION OF OTHERS', 'DACOITY', 'PREPARATION AND ASSEMBLY FOR DACOITY', 'ROBBERY', 'BURGLARY', 'THEFT', 'AUTO THEFT', 'OTHER THEFT', 'RIOTS', 'CRIMINAL BREACH OF TRUST', 'CHEATING', 'COUNTERFIETING', 'ARSON', 'HURT/GREVIOUS HURT', 'DOWRY DEATHS', 'ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY', 'INSULT TO MODESTY OF WOMEN', 'CRUELTY BY HUSBAND OR HIS RELATIVES', 'IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES', 'CAUSING DEATH BY NEGLIGENCE', 'OTHER IPC CRIMES', 'TOTAL IPC CRIMES']
Preview:
STATE/UT	DISTRICT	YEAR	MURDER	ATTEMPT TO MURDER	CULPABLE HOMICIDE NOT AMOUNTING TO MURDER	RAPE	CUSTODIAL RAPE	OTHER RAPE	KIDNAPPING & ABDUCTION	...	ARSON	HURT/GREVIOUS HURT	DOWRY DEATHS	ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY	INSULT TO MODESTY OF WOMEN	CRUELTY BY HUSBAND OR HIS RELATIVES	IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES	CAUSING DEATH BY NEGLIGENCE	OTHER IPC CRIMES	TOTAL IPC CRIMES
0	ANDHRA PRADESH	ADILABAD	2001	101	60	17	50	0	50	46	...	30	1131	16	149	34	175	0	181	1518	4154
1	ANDHRA PRADESH	ANANTAPUR	2001	151	125	1	23	0	23	53	...	69	1543	7	118	24	154	0	270	754	4125
2	ANDHRA PRADESH	CHITTOOR	2001	101	57	2	27	0	27	59	...	38	2088	14	112	83	186	0	404	1262	5818
3	ANDHRA PRADESH	CUDDAPAH	2001	80	53	1	20	0	20	25	...	23	795	17	126	38	57	0	233	1181	3140
4	ANDHRA PRADESH	EAST GODAVARI	2001	82	67	1	23	0	23	49	...	41	1244	12	109	58	247	0	431	2313	6507
5 rows × 33 columns

........................................

📄 File: 01_District_wise_crimes_committed_IPC_2013.csv (0.09 MB)
Features: ['STATE/UT', 'DISTRICT', 'YEAR', 'MURDER', 'ATTEMPT TO MURDER', 'CULPABLE HOMICIDE NOT AMOUNTING TO MURDER', 'RAPE', 'CUSTODIAL RAPE', 'OTHER RAPE', 'KIDNAPPING & ABDUCTION', 'KIDNAPPING AND ABDUCTION OF WOMEN AND GIRLS', 'KIDNAPPING AND ABDUCTION OF OTHERS', 'DACOITY', 'PREPARATION AND ASSEMBLY FOR DACOITY', 'ROBBERY', 'BURGLARY', 'THEFT', 'AUTO THEFT', 'OTHER THEFT', 'RIOTS', 'CRIMINAL BREACH OF TRUST', 'CHEATING', 'COUNTERFIETING', 'ARSON', 'HURT/GREVIOUS HURT', 'DOWRY DEATHS', 'ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY', 'INSULT TO MODESTY OF WOMEN', 'CRUELTY BY HUSBAND OR HIS RELATIVES', 'IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES', 'CAUSING DEATH BY NEGLIGENCE', 'OTHER IPC CRIMES', 'TOTAL IPC CRIMES']
Preview:
STATE/UT	DISTRICT	YEAR	MURDER	ATTEMPT TO MURDER	CULPABLE HOMICIDE NOT AMOUNTING TO MURDER	RAPE	CUSTODIAL RAPE	OTHER RAPE	KIDNAPPING & ABDUCTION	...	ARSON	HURT/GREVIOUS HURT	DOWRY DEATHS	ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY	INSULT TO MODESTY OF WOMEN	CRUELTY BY HUSBAND OR HIS RELATIVES	IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES	CAUSING DEATH BY NEGLIGENCE	OTHER IPC CRIMES	TOTAL IPC CRIMES
0	Andhra Pradesh	ADILABAD	2013	96	72	13	61	0	61	65	...	30	2394	12	197	138	464	0	376	1390	6381
1	Andhra Pradesh	ANANTAPUR	2013	156	149	3	28	0	28	110	...	29	2537	23	337	43	161	0	573	1634	6913
2	Andhra Pradesh	CHITTOOR	2013	72	61	2	31	0	31	52	...	18	937	13	119	84	435	0	546	2239	5610
3	Andhra Pradesh	CUDDAPAH	2013	93	107	7	19	0	19	84	...	34	2310	9	318	163	207	0	464	1741	7048
4	Andhra Pradesh	CYBERABAD	2013	162	123	16	138	0	138	192	...	40	4284	43	350	338	1526	0	1104	3139	19992
5 rows × 33 columns

........................................

📄 File: 01_District_wise_crimes_committed_IPC_2014.csv (0.20 MB)
Features: ['States/UTs', 'District', 'Year', 'Murder', 'Attempt to commit Murder', 'Culpable Homicide not amounting to Murder', 'Attempt to commit Culpable Homicide', 'Rape', 'Custodial Rape', 'Custodial_Gang Rape', 'Custodial_Other Rape', 'Rape other than Custodial', 'Rape_Gang Rape', 'Rape_Others', 'Attempt to commit Rape', 'Kidnapping & Abduction_Total', 'Kidnapping & Abduction', 'Kidnapping & Abduction in order to Murder', 'Kidnapping for Ransom', 'Kidnapping & Abduction of Women to compel her for marriage', 'Other Kidnapping', 'Dacoity', 'Dacoity with Murder', 'Other Dacoity', 'Making Preparation and Assembly for committing Dacoity', 'Robbery', 'Criminal Trespass/Burglary', 'Criminal Trespass or Burglary', 'House Trespass & House Breaking', 'Theft', 'Auto Theft', 'Other Thefts', 'Unlawful Assembly', 'Riots', 'Riots_Communal', 'Riots_Industrial', 'Riots_Political', 'Riots_Caste Conflict', 'Riots_SC/STs Vs Non-SCs/STs', 'Riots_Other Caste Conflict', 'Riots_Agrarian', 'Riots_Students', 'Riots_Sectarian', 'Riots_Others', 'Criminal Breach of Trust', 'Cheating', 'Forgery', 'Counterfeiting', 'Counterfeit Offences related to Counterfeit Coin', 'Counterfeiting Government Stamp', 'Counterfeit currency & Bank notes', 'Counterfeiting currency notes/Bank notes', 'Using forged or counterfeiting currency/Bank notes', 'Possession of forged or counterfeiting currency/Bank notes', 'Making or Possessing materials for forged currency/Bank notes', 'Making or Using documents resembling currency', 'Arson', 'Grievous Hurt', 'Hurt', 'Acid attack', 'Attempt to Acid Attack', 'Dowry Deaths', 'Assault on Women with intent to outrage her Modesty', 'Sexual Harassment', 'Assault or use of criminal force to women with intent to Disrobe', 'Voyeurism', 'Stalking', 'Other Assault on Women', 'Insult to the Modesty of Women', 'At Office premises', 'Other places related to work', 'In Public Transport system', 'Places other than 231, 232 & 233', 'Cruelty by Husband or his Relatives', 'Importation of Girls from Foreign Country', 'Causing Death by Negligence', 'Deaths due to negligent driving/act', 'Deaths due to Other Causes', 'Offences against State', 'Sedition', 'Other offences against State', 'Offences promoting enmity between different groups', 'Promoting enmity between different groups', 'Imputation, assertions prejudicial to national integration', 'Extortion', 'Disclosure of Identity of Victims', 'Incidence of Rash Driving', 'HumanTrafficking', 'Unnatural Offence', 'Other IPC crimes', 'Total Cognizable IPC crimes']
Preview:
States/UTs	District	Year	Murder	Attempt to commit Murder	Culpable Homicide not amounting to Murder	Attempt to commit Culpable Homicide	Rape	Custodial Rape	Custodial_Gang Rape	...	Offences promoting enmity between different groups	Promoting enmity between different groups	Imputation, assertions prejudicial to national integration	Extortion	Disclosure of Identity of Victims	Incidence of Rash Driving	HumanTrafficking	Unnatural Offence	Other IPC crimes	Total Cognizable IPC crimes
0	Andhra Pradesh	Anantapur	2014	134	171	8	0	35	0	0	...	0	0	0	0	0	1038	0	0	3800	8376
1	Andhra Pradesh	Chittoor	2014	84	170	2	0	32	0	0	...	0	0	0	19	0	249	0	0	2567	5374
2	Andhra Pradesh	Cuddapah	2014	80	162	1	0	28	0	0	...	0	0	0	0	0	948	0	0	2604	5803
3	Andhra Pradesh	East Godavari	2014	64	84	2	0	85	0	0	...	0	0	0	32	0	39	0	0	3791	7630
4	Andhra Pradesh	Guntakal Railway	2014	14	4	0	0	0	0	0	...	0	0	0	0	0	1	0	0	37	490
5 rows × 91 columns

........................................

📄 File: 02_01_District_wise_crimes_committed_against_SC_2001_2012.csv (0.44 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping and Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Prevention of atrocities (POA) Act', 'Protection of Civil Rights (PCR) Act', 'Other Crimes Against SCs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping and Abduction	Dacoity	Robbery	Arson	Hurt	Prevention of atrocities (POA) Act	Protection of Civil Rights (PCR) Act	Other Crimes Against SCs
0	ANDHRA PRADESH	ADILABAD	2001	0	1	4	0	0	0	3	0	15	32
1	ANDHRA PRADESH	ANANTAPUR	2001	0	4	0	0	0	0	49	21	0	53
2	ANDHRA PRADESH	CHITTOOR	2001	3	3	0	0	0	0	38	36	0	34
3	ANDHRA PRADESH	CUDDAPAH	2001	0	3	0	0	0	0	20	52	0	25
4	ANDHRA PRADESH	EAST GODAVARI	2001	1	3	0	0	0	0	3	12	63	7
........................................

📄 File: 02_01_District_wise_crimes_committed_against_SC_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping and Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Protection of Civil Rights (PCR) Act', 'Prevention of atrocities (POA) Act', 'Other Crimes Against SCs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping and Abduction	Dacoity	Robbery	Arson	Hurt	Protection of Civil Rights (PCR) Act	Prevention of atrocities (POA) Act	Other Crimes Against SCs
0	Andhra Pradesh	ADILABAD	2013	2	3	0	0	0	0	8	0	15	42
1	Andhra Pradesh	ANANTAPUR	2013	2	4	0	0	0	0	37	0	18	56
2	Andhra Pradesh	CHITTOOR	2013	2	3	0	0	0	1	27	0	9	55
3	Andhra Pradesh	CUDDAPAH	2013	2	2	0	0	0	0	78	0	22	72
4	Andhra Pradesh	CYBERABAD	2013	2	8	0	0	0	0	15	1	61	58
........................................

📄 File: 02_01_District_wise_crimes_committed_against_SC_2014.csv (0.13 MB)
Features: ['States/UTs', 'District', 'Year', 'Protection of Civil Rights Act, 1955', 'POA_Murder', 'POA_Attempt to commit Murder', 'POA_Rape', 'POA_Attempt to commit Rape', 'POA_Assault on women with intent to outrage her Modesty', 'POA_Sexual Harassment', 'POA_Assault on women with intent to Disrobe', 'POA_Voyeurism', 'POA_Stalking', 'POA_Other Sexual Harassment', 'POA_Insult to the Modesty of women', 'POA_Kidnapping & Abduction_GrandTotal', 'POA_Kidnaping & Abduction_Total', 'POA_Kidnaping & Abduction in order to Murder', 'POA_Kidnapping for Ransom', 'POA_Kidnapping & Abduction of Women to compel her for marriage', 'POA_Other Kidnapping', 'POA_Dacoity', 'POA_Dacoity with Murder', 'POA_Other Dacoity', 'POA_Robbery', 'POA_Arson', 'POA_Grievous Hurt', 'POA_Hurt', 'POA_Acid attack', 'POA_Attempt to Acid Attack', 'POA_Riots', 'POA_Other IPC crimes', 'POA_SC / ST (Prevention of Atrocities) Act only', 'Total of SC/ST (Prevention of Atrocities) Act ,1989', 'IPC_Murder', 'IPC_Attempt to commit Murder', 'IPC_Rape', 'IPC_Attempt to commit Rape', 'IPC_Assault on women with intent to outrage her Modesty', 'IPC_Sexual Harassment', 'IPC_Assault on women with intent to Disrobe', 'IPC_Voyeurism', 'IPC_Stalking', 'IPC_Other Sexual Harassment', 'IPC_Insult to the Modesty of women', 'IPC_Kidnapping & Abduction', 'IPC_Kidnaping & Abduction', 'IPC_Kidnaping & Abduction in order to Murder', 'IPC_Kidnapping for Ransom', 'IPC_Kidnapping & Abduction of Women to compel her for marriage', 'IPC_Other Kidnapping', 'IPC_Dacoity', 'IPC_Dacoity with Murder', 'IPC_Other Dacoity', 'IPC_Robbery', 'IPC_Arson', 'IPC_Grievous Hurt', 'IPC_Hurt', 'IPC_Acid attack', 'IPC_Attempt to Acid Attack', 'IPC_Riots', 'IPC_Other IPC crimes', 'Total IPC Crimes against SCs', 'Manual Scavengers and Construction of Dry Latrines (P) Act, 1993', 'Other SLL Crime against SCs', 'Total crimes against SCs']
Preview:
States/UTs	District	Year	Protection of Civil Rights Act, 1955	POA_Murder	POA_Attempt to commit Murder	POA_Rape	POA_Attempt to commit Rape	POA_Assault on women with intent to outrage her Modesty	POA_Sexual Harassment	...	IPC_Grievous Hurt	IPC_Hurt	IPC_Acid attack	IPC_Attempt to Acid Attack	IPC_Riots	IPC_Other IPC crimes	Total IPC Crimes against SCs	Manual Scavengers and Construction of Dry Latrines (P) Act, 1993	Other SLL Crime against SCs	Total crimes against SCs
0	Andhra Pradesh	Anantapur	2014	0	3	0	1	0	5	0	...	0	0	0	0	0	0	0	0	0	170
1	Andhra Pradesh	Chittoor	2014	0	2	3	1	0	5	0	...	0	0	0	0	0	0	0	0	0	118
2	Andhra Pradesh	Cuddapah	2014	0	4	5	5	1	3	0	...	0	0	0	0	0	0	0	0	0	262
3	Andhra Pradesh	East Godavari	2014	6	0	2	4	0	22	8	...	0	0	0	0	0	0	1	0	0	178
4	Andhra Pradesh	Guntakal Railway	2014	0	0	0	0	0	0	0	...	0	0	0	0	0	0	0	0	0	0
5 rows × 66 columns

........................................

📄 File: 02_District_wise_crimes_committed_against_ST_2001_2012.csv (0.43 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Protection of Civil Rights (PCR) Act', 'Prevention of atrocities (POA) Act', 'Other Crimes Against STs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping Abduction	Dacoity	Robbery	Arson	Hurt	Protection of Civil Rights (PCR) Act	Prevention of atrocities (POA) Act	Other Crimes Against STs
0	ANDHRA PRADESH	ADILABAD	2001	0	1	2	0	0	0	2	0	0	13
1	ANDHRA PRADESH	ANANTAPUR	2001	0	0	0	0	0	0	7	0	1	6
2	ANDHRA PRADESH	CHITTOOR	2001	0	0	0	0	0	0	2	0	0	0
3	ANDHRA PRADESH	CUDDAPAH	2001	0	0	0	0	0	0	2	0	2	0
4	ANDHRA PRADESH	EAST GODAVARI	2001	0	0	0	0	0	0	0	0	0	14
........................................

📄 File: 02_District_wise_crimes_committed_against_ST_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Protection of Civil Rights (PCR) Act', 'Prevention of atrocities (POA) Act', 'Other Crimes Against STs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping Abduction	Dacoity	Robbery	Arson	Hurt	Protection of Civil Rights (PCR) Act	Prevention of atrocities (POA) Act	Other Crimes Against STs
0	Andhra Pradesh	ADILABAD	2013	0	7	0	0	0	0	2	0	6	25
1	Andhra Pradesh	ANANTAPUR	2013	0	0	0	0	0	0	3	0	1	9
2	Andhra Pradesh	CHITTOOR	2013	0	0	0	0	0	0	0	0	0	0
3	Andhra Pradesh	CUDDAPAH	2013	0	1	0	0	0	0	17	0	2	10
4	Andhra Pradesh	CYBERABAD	2013	1	2	0	0	0	0	1	0	19	18
........................................

📄 File: 02_District_wise_crimes_committed_against_ST_2014.csv (0.12 MB)
Features: ['States/UTs', 'District', 'Year', 'Protection of Civil Rights Act, 1955', 'POA_Murder', 'POA_Attempt to commit Murder', 'POA_Rape', 'POA_Attempt to commit Rape', 'POA_Assault on women with intent to outrage her Modesty', 'POA_Sexual Harassment', 'POA_Assault on women with intent to Disrobe', 'POA_Voyeurism', 'POA_Stalking', 'POA_Other Sexual Harassment', 'POA_Insult to the Modesty of women', 'POA_Kidnapping & Abduction_GrandTotal', 'POA_Kidnaping & Abduction_Total', 'POA_Kidnaping & Abduction in order to Murder', 'POA_Kidnapping for Ransom', 'POA_Kidnapping & Abduction of Women to compel her for marriage', 'POA_Other Kidnapping', 'POA_Dacoity', 'POA_Dacoity with Murder', 'POA_Other Dacoity', 'POA_Robbery', 'POA_Arson', 'POA_Grievous Hurt', 'POA_Hurt', 'POA_Acid attack', 'POA_Attempt to Acid Attack', 'POA_Riots', 'POA_Other IPC crimes', 'POA_SC / ST (Prevention of Atrocities) Act only', 'Total of SC/ST (Prevention of Atrocities) Act ,1989', 'IPC_Murder', 'IPC_Attempt to commit Murder', 'IPC_Rape', 'IPC_Attempt to commit Rape', 'IPC_Assault on women with intent to outrage her Modesty', 'IPC_Sexual Harassment', 'IPC_Assault on women with intent to Disrobe', 'IPC_Voyeurism', 'IPC_Stalking', 'IPC_Other Sexual Harassment', 'IPC_Insult to the Modesty of women', 'IPC_Kidnapping & Abduction', 'IPC_Kidnaping & Abduction', 'IPC_Kidnaping & Abduction in order to Murder', 'IPC_Kidnapping for Ransom', 'IPC_Kidnapping & Abduction of Women to compel her for marriage', 'IPC_Other Kidnapping', 'IPC_Dacoity', 'IPC_Dacoity with Murder', 'IPC_Other Dacoity', 'IPC_Robbery', 'IPC_Arson', 'IPC_Grievous Hurt', 'IPC_Hurt', 'IPC_Acid attack', 'IPC_Attempt to Acid Attack', 'IPC_Riots', 'IPC_Other IPC crimes', 'Total IPC Crimes against STs', 'Manual Scavengers and Construction of Dry Latrines (P) Act, 1993', 'Other SLL Crime against STs', 'Total crimes against STs']
Preview:
States/UTs	District	Year	Protection of Civil Rights Act, 1955	POA_Murder	POA_Attempt to commit Murder	POA_Rape	POA_Attempt to commit Rape	POA_Assault on women with intent to outrage her Modesty	POA_Sexual Harassment	...	IPC_Grievous Hurt	IPC_Hurt	IPC_Acid attack	IPC_Attempt to Acid Attack	IPC_Riots	IPC_Other IPC crimes	Total IPC Crimes against STs	Manual Scavengers and Construction of Dry Latrines (P) Act, 1993	Other SLL Crime against STs	Total crimes against STs
0	Andhra Pradesh	Anantapur	2014	0	1	2	0	1	2	1	...	0	0	0	0	0	0	0	0	0	23
1	Andhra Pradesh	Chittoor	2014	0	0	0	0	0	1	0	...	0	0	0	0	0	0	0	0	0	17
2	Andhra Pradesh	Cuddapah	2014	0	1	0	1	0	0	0	...	0	0	0	0	0	0	0	0	0	33
3	Andhra Pradesh	East Godavari	2014	0	1	0	7	0	3	0	...	0	0	0	0	0	0	0	0	0	35
4	Andhra Pradesh	Guntakal Railway	2014	0	0	0	0	0	0	0	...	0	0	0	0	0	0	0	0	0	0
5 rows × 66 columns

........................................

📄 File: 03_District_wise_crimes_committed_against_children_2001_2012.csv (0.48 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping and Abduction', 'Foeticide', 'Abetment of suicide', 'Exposure and abandonment', 'Procuration of minor girls', 'Buying of girls for prostitution', 'Selling of girls for prostitution', 'Prohibition of child marriage act', 'Other Crimes', 'Total']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping and Abduction	Foeticide	Abetment of suicide	Exposure and abandonment	Procuration of minor girls	Buying of girls for prostitution	Selling of girls for prostitution	Prohibition of child marriage act	Other Crimes	Total
0	ANDHRA PRADESH	ADILABAD	2001	0	0	0	0	0	0	0	0	0	0	0	0
1	ANDHRA PRADESH	ANANTAPUR	2001	19	12	29	0	6	0	0	0	0	0	0	66
2	ANDHRA PRADESH	CHITTOOR	2001	0	0	0	0	0	0	0	0	0	0	0	0
3	ANDHRA PRADESH	CUDDAPAH	2001	0	0	0	0	0	0	0	0	0	0	0	0
4	ANDHRA PRADESH	EAST GODAVARI	2001	0	0	0	0	0	0	0	0	0	0	0	0
........................................

📄 File: 03_District_wise_crimes_committed_against_children_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Infanticid', 'Other murder', 'Rape', 'Kidnapping and Abduction', 'Foeticide', 'Abetment of suicide', 'Exposure and abandonment', 'Procuration of minor girls', 'Buying of girls for prostitution', 'Selling of girls for prostitution', 'Prohibition of child marriage act', 'Other Crimes', 'Total']
Preview:
STATE/UT	DISTRICT	Year	Infanticid	Other murder	Rape	Kidnapping and Abduction	Foeticide	Abetment of suicide	Exposure and abandonment	Procuration of minor girls	Buying of girls for prostitution	Selling of girls for prostitution	Prohibition of child marriage act	Other Crimes	Total
0	Andhra Pradesh	ADILABAD	2013	0	1	21	9	0	0	0	0	0	0	1	1	33
1	Andhra Pradesh	ANANTAPUR	2013	0	1	15	68	0	3	0	0	0	0	0	0	87
2	Andhra Pradesh	CHITTOOR	2013	0	6	1	0	0	0	0	0	0	0	0	0	7
3	Andhra Pradesh	CUDDAPAH	2013	2	0	14	32	0	0	0	0	0	0	1	0	49
4	Andhra Pradesh	CYBERABAD	2013	1	8	45	69	2	0	2	9	0	0	1	19	156
........................................

📄 File: 03_Persons_arrested_and_their_disposal_by_police_and_court_under_crime_against_children_2012.csv (0.04 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	ANDHRA PRADESH	INFANTICIDE (SECTION 315 IPC)	0	6	0	5	1	4	5	0	5	0	0	0
1	ARUNACHAL PRADESH	INFANTICIDE (SECTION 315 IPC)	0	0	0	0	0	0	0	0	0	0	0	0
2	ASSAM	INFANTICIDE (SECTION 315 IPC)	0	0	0	0	0	0	0	0	0	0	0	0
3	BIHAR	INFANTICIDE (SECTION 315 IPC)	0	2	0	0	2	7	9	0	6	3	1	2
4	CHHATTISGARH	INFANTICIDE (SECTION 315 IPC)	0	5	0	0	5	16	21	0	17	4	2	2
........................................

📄 File: 03_Persons_arrested_and_their_disposal_by_police_and_court_under_crime_against_children_2013.csv (0.03 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	Andhra Pradesh	Abetment of Suicide	0	25	0	7	18	26	44	0	44	0	0	0
1	Arunachal Pradesh	Abetment of Suicide	0	0	0	0	0	0	0	0	0	0	0	0
2	Assam	Abetment of Suicide	2	0	2	0	0	4	4	0	0	4	0	4
3	Bihar	Abetment of Suicide	0	0	0	0	0	0	0	0	0	0	0	0
4	Chhattisgarh	Abetment of Suicide	0	7	0	0	7	18	25	0	19	6	3	3
........................................

📄 File: 03_Persons_arrested_and_their_disposal_by_police_and_court_under_crime_against_children_2014.csv (0.35 MB)
Features: ['States/UTs', 'Crime Head', 'Year', 'Persons in custody during inv stage at beginning of Year_Male', 'Persons in custody during inv stage at beginning of Year_Female', 'Persons in custody during inv stage at beginning of Year_Total', 'Persons on bail during inv stage at beginning of Year_Male', 'Persons on bail during inv stage at beginning of Year_Female', 'Persons on bail during inv stage at beginning of Year_Total', 'Persons arrested during the year_Male', 'Persons arrested during the year_Female', 'Persons arrested during the year_Total', 'Persons released or freed before trial for want of evidence_Male', 'Persons released or freed before trial for want of evidence_Fem', 'Persons released or freed before trial for want of evidence_Tot', 'Persons in custody during inv stage at year end_Male', 'Persons in custody during inv stage at year end_Female', 'Persons in custody during inv stage at year end_Total', 'Persons on Bail during inv stage at year end_Male', 'Persons on Bail during inv stage at Year end_Female', 'Persons on Bail during inv stage at year end_Total', 'Persons charge sheeted_Male', 'Persons charge sheeted_Female', 'Persons charge sheeted_Total', 'Persons in custody during trial stage at begin of year_Male', 'Persons in custody during trial stage at begin of year_Female', 'Persons in custody during trial stage at begin of year_Total', 'Persons on Bail during trial stage at begin of year_Male', 'Persons on Bail during trial stage at begin of year_Female', 'Persons on Bail during trial stage at begin of year_Total', 'Total number of persons under Trial_Male', 'Total number of persons under Trial_Female', 'Total number of persons under Trial_Total', 'Persons against whom cases were compounded by Courts_Male', 'Persons against whom cases were compounded by Courts_Female', 'Persons against whom cases were compounded by Courts_Total', 'Persons against whom cases were withdrawn_Male', 'Persons against whom cases were withdrawn_Female', 'Persons against whom cases were withdrawn_Total', 'Persons in custody during trial stage at Year end_Male', 'Persons in custody during trial stage at Year end_Female', 'Persons in custody during trial stage at Year end_Total', 'Persons on bail during trial stage at Year End_Male', 'Persons on bail during trial stage at Year End_Female', 'Persons on bail during trial stage at Year End_Total', 'Persons whose cases trials were completed during the year_Male', 'Persons whose cases trials were completed during the year_Female', 'Persons whose cases trials were completed during the year_Total', 'Persons convicted_Male', 'Persons convicted_Female', 'Persons convicted_Total', 'Persons acquitted_Male', 'Persons acquitted_Female', 'Persons acquitted_Total', 'Persons Discharged by Court_Male', 'Persons Discharged by Court_Female', 'Persons Discharged by Court_Total']
Preview:
States/UTs	Crime Head	Year	Persons in custody during inv stage at beginning of Year_Male	Persons in custody during inv stage at beginning of Year_Female	Persons in custody during inv stage at beginning of Year_Total	Persons on bail during inv stage at beginning of Year_Male	Persons on bail during inv stage at beginning of Year_Female	Persons on bail during inv stage at beginning of Year_Total	Persons arrested during the year_Male	...	Persons whose cases trials were completed during the year_Total	Persons convicted_Male	Persons convicted_Female	Persons convicted_Total	Persons acquitted_Male	Persons acquitted_Female	Persons acquitted_Total	Persons Discharged by Court_Male	Persons Discharged by Court_Female	Persons Discharged by Court_Total
0	Andhra Pradesh	1 - Murder (Section 302 and 303 IPC)	2014	1	0	1	28	0	28	68	...	33	3	0	3	29	1	30	0	0	0
1	Andhra Pradesh	2 - Infanticide (Section 315 IPC)	2014	0	0	0	2	0	2	3	...	1	0	0	0	1	0	1	0	0	0
2	Andhra Pradesh	3 - Rape	2014	21	0	21	187	0	187	617	...	236	13	0	13	222	1	223	0	0	0
3	Andhra Pradesh	4 - Assault on women with intent to outrage he...	2014	0	0	0	79	4	83	281	...	69	7	0	7	62	0	62	0	0	0
4	Andhra Pradesh	4.1 - Sexual Harassment (Section 354A IPC)	2014	0	0	0	6	0	6	69	...	8	0	0	0	8	0	8	0	0	0
5 rows × 57 columns

........................................

📄 File: 04_01_Person_arrested_and_their_disposal_by_police_and_court_SLL_crime_2012.csv (0.09 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	ANDHRA PRADESH	ARMS ACT, 1959	301	549	0	295	555	1153	1708	0	1324	384	46	338
1	ARUNACHAL PRADESH	ARMS ACT, 1959	3	14	0	5	12	194	206	0	199	7	4	3
2	ASSAM	ARMS ACT, 1959	1705	575	114	1934	232	2483	2715	0	2498	217	31	186
3	BIHAR	ARMS ACT, 1959	1761	2479	14	1383	2843	26223	29066	0	27108	1958	681	1277
4	CHHATTISGARH	ARMS ACT, 1959	6	914	0	6	914	3869	4783	237	3695	851	236	615
........................................

📄 File: 04_01_Person_arrested_and_their_disposal_by_police_and_court_SLL_crime_2013.csv (0.02 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	Andhra Pradesh	Arson	4	8	0	7	5	35	40	0	38	2	0	2
1	Arunachal Pradesh	Arson	0	0	0	0	0	0	0	0	0	0	0	0
2	Assam	Arson	2	0	2	0	0	6	6	0	0	6	0	6
3	Bihar	Arson	32	73	0	22	83	222	305	0	277	28	0	28
4	Chhattisgarh	Arson	0	1	0	0	1	1	2	0	2	0	0	0
........................................

📄 File: 04_01_Person_arrested_and_their_disposal_by_police_and_court_SLL_crime_2014.csv (0.48 MB)
Features: ['States/UTs', 'Crime Head', 'Year', 'Persons in custody during inv stage at beginning of Year_Male', 'Persons in custody during inv stage at beginning of Year_Female', 'Persons in custody during inv stage at beginning of Year_Total', 'Persons on bail during inv stage at beginning of Year_Male', 'Persons on bail during inv stage at beginning of Year_Female', 'Persons on bail during inv stage at beginning of Year_Total', 'Persons arrested during the year_Male', 'Persons arrested during the year_Female', 'Persons arrested during the year_Total', 'Persons released or freed before trial for want of evidence_Male', 'Persons released or freed before trial for want of evidence_Fem', 'Persons released or freed before trial for want of evidence_Tot', 'Persons in custody during inv stage at year end_Male', 'Persons in custody during inv stage at year end_Female', 'Persons in custody during inv stage at year end_Total', 'Persons on Bail during inv stage at year end_Male', 'Persons on Bail during inv stage at Year end_Female', 'Persons on Bail during inv stage at year end_Total', 'Persons charge sheeted_Male', 'Persons charge sheeted_Female', 'Persons charge sheeted_Total', 'Persons in custody during trial stage at begin of year_Male', 'Persons in custody during trial stage at begin of year_Female', 'Persons in custody during trial stage at begin of year_Total', 'Persons on Bail during trial stage at begin of year_Male', 'Persons on Bail during trial stage at begin of year_Female', 'Persons on Bail during trial stage at begin of year_Total', 'Total number of persons under Trial_Male', 'Total number of persons under Trial_Female', 'Total number of persons under Trial_Total', 'Persons against whom cases were compounded by Courts_Male', 'Persons against whom cases were compounded by Courts_Female', 'Persons against whom cases were compounded by Courts_Total', 'Persons against whom cases were withdrawn_Male', 'Persons against whom cases were withdrawn_Female', 'Persons against whom cases were withdrawn_Total', 'Persons in custody during trial stage at Year end_Male', 'Persons in custody during trial stage at Year end_Female', 'Persons in custody during trial stage at Year end_Total', 'Persons on bail during trial stage at Year End_Male', 'Persons on bail during trial stage at Year End_Female', 'Persons on bail during trial stage at Year End_Total', 'Persons whose cases trials were completed during the year_Male', 'Persons whose cases trials were completed during the year_Female', 'Persons whose cases trials were completed during the year_Total', 'Persons convicted_Male', 'Persons convicted_Female', 'Persons convicted_Total', 'Persons acquitted_Male', 'Persons acquitted_Female', 'Persons acquitted_Total', 'Persons Discharged by Court_Male', 'Persons Discharged by Court_Female', 'Persons Discharged by Court_Total']
Preview:
States/UTs	Crime Head	Year	Persons in custody during inv stage at beginning of Year_Male	Persons in custody during inv stage at beginning of Year_Female	Persons in custody during inv stage at beginning of Year_Total	Persons on bail during inv stage at beginning of Year_Male	Persons on bail during inv stage at beginning of Year_Female	Persons on bail during inv stage at beginning of Year_Total	Persons arrested during the year_Male	...	Persons whose cases trials were completed during the year_Total	Persons convicted_Male	Persons convicted_Female	Persons convicted_Total	Persons acquitted_Male	Persons acquitted_Female	Persons acquitted_Total	Persons Discharged by Court_Male	Persons Discharged by Court_Female	Persons Discharged by Court_Total
0	Andhra Pradesh	1 - Arms Act, 1959	2014	4	0	4	96	0	96	261	...	128	39	0	39	89	0	89	0	0	0
1	Andhra Pradesh	2 - Narcotic Drugs & Psychotropic Substances A...	2014	26	0	26	447	17	464	739	...	243	32	0	32	209	2	211	0	0	0
2	Andhra Pradesh	3 - Gambling Act, 1867	2014	15	0	15	907	0	907	24119	...	21865	21135	0	21135	730	0	730	0	0	0
3	Andhra Pradesh	4 - Excise Act, 1944	2014	103	0	103	877	32	909	5599	...	2142	722	8	730	1314	98	1412	0	0	0
4	Andhra Pradesh	5 - Prohibition Act	2014	31	0	31	286	24	310	1710	...	1024	431	12	443	556	25	581	0	0	0
5 rows × 57 columns

........................................

📄 File: 04_02_Person_arrested_and_their_disposal_by_police_and_court_IPC_crime_2012.csv (0.11 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	ANDHRA PRADESH	MURDER (SECTION 302 IPC)	3263	5509	0	3138	5634	12111	17745	2	13142	4601	754	3847
1	ARUNACHAL PRADESH	MURDER (SECTION 302 IPC)	85	113	28	109	61	1108	1169	0	1161	8	2	6
2	ASSAM	MURDER (SECTION 302 IPC)	4628	1650	466	4756	1056	8040	9096	0	8183	913	308	605
3	BIHAR	MURDER (SECTION 302 IPC)	7459	7198	51	7399	7207	52966	60173	0	54985	5188	1450	3738
4	CHHATTISGARH	MURDER (SECTION 302 IPC)	188	1490	0	158	1520	7803	9323	1221	6661	1441	590	851
........................................

📄 File: 04_02_Person_arrested_and_their_disposal_by_police_and_court_IPC_crime_2013.csv (0.08 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	Andhra Pradesh	Arson	411	820	13	404	814	1878	2692	87	1815	790	63	727
1	Arunachal Pradesh	Arson	9	17	3	12	11	124	135	0	135	0	0	0
2	Assam	Arson	1214	771	405	1205	375	1674	2049	0	1795	254	29	225
3	Bihar	Arson	807	1342	89	653	1407	5821	7228	188	6033	1007	100	907
4	Chhattisgarh	Arson	0	252	0	0	252	1036	1288	17	979	292	49	243
........................................

📄 File: 04_02_Person_arrested_and_their_disposal_by_police_and_court_IPC_crime_2014.csv (0.68 MB)
Features: ['States/UTs', 'Crime Head', 'Year', 'Persons in custody during inv stage at beginning of Year_Male', 'Persons in custody during inv stage at beginning of Year_Female', 'Persons in custody during inv stage at beginning of Year_Total', 'Persons on bail during inv stage at beginning of Year_Male', 'Persons on bail during inv stage at beginning of Year_Female', 'Persons on bail during inv stage at beginning of Year_Total', 'Persons arrested during the year_Male', 'Persons arrested during the year_Female', 'Persons arrested during the year_Total', 'Persons released or freed before trial for want of evidence_Male', 'Persons released or freed before trial for want of evidence_Fem', 'Persons released or freed before trial for want of evidence_Tot', 'Persons in custody during inv stage at year end_Male', 'Persons in custody during inv stage at year end_Female', 'Persons in custody during inv stage at year end_Total', 'Persons on Bail during inv stage at year end_Male', 'Persons on Bail during inv stage at Year end_Female', 'Persons on Bail during inv stage at year end_Total', 'Persons charge sheeted_Male', 'Persons charge sheeted_Female', 'Persons charge sheeted_Total', 'Persons in custody during trial stage at begin of year_Male', 'Persons in custody during trial stage at begin of year_Female', 'Persons in custody during trial stage at begin of year_Total', 'Persons on Bail during trial stage at begin of year_Male', 'Persons on Bail during trial stage at begin of year_Female', 'Persons on Bail during trial stage at begin of year_Total', 'Total number of persons under Trial_Male', 'Total number of persons under Trial_Female', 'Total number of persons under Trial_Total', 'Persons against whom cases were compounded by Courts_Male', 'Persons against whom cases were compounded by Courts_Female', 'Persons against whom cases were compounded by Courts_Total', 'Persons against whom cases were withdrawn_Male', 'Persons against whom cases were withdrawn_Female', 'Persons against whom cases were withdrawn_Total', 'Persons in custody during trial stage at Year end_Male', 'Persons in custody during trial stage at Year end_Female', 'Persons in custody during trial stage at Year end_Total', 'Persons on bail during trial stage at Year End_Male', 'Persons on bail during trial stage at Year End_Female', 'Persons on bail during trial stage at Year End_Total', 'Persons whose cases trials were completed during the year_Male', 'Persons whose cases trials were completed during the year_Female', 'Persons whose cases trials were completed during the year_Total', 'Persons convicted_Male', 'Persons convicted_Female', 'Persons convicted_Total', 'Persons acquitted_Male', 'Persons acquitted_Female', 'Persons acquitted_Total', 'Persons Discharged by Court_Male', 'Persons Discharged by Court_Female', 'Persons Discharged by Court_Total']
Preview:
States/UTs	Crime Head	Year	Persons in custody during inv stage at beginning of Year_Male	Persons in custody during inv stage at beginning of Year_Female	Persons in custody during inv stage at beginning of Year_Total	Persons on bail during inv stage at beginning of Year_Male	Persons on bail during inv stage at beginning of Year_Female	Persons on bail during inv stage at beginning of Year_Total	Persons arrested during the year_Male	...	Persons whose cases trials were completed during the year_Total	Persons convicted_Male	Persons convicted_Female	Persons convicted_Total	Persons acquitted_Male	Persons acquitted_Female	Persons acquitted_Total	Persons Discharged by Court_Male	Persons Discharged by Court_Female	Persons Discharged by Court_Total
0	Andhra Pradesh	1 - Murder (Section 302 IPC)	2014	281	8	289	1529	125	1654	2111	...	1679	252	18	270	1320	85	1405	4	0	4
1	Andhra Pradesh	2 - Attempt to commit Murder (Section 307 IPC)	2014	152	0	152	1232	155	1387	2578	...	2206	184	2	186	1897	114	2011	9	0	9
2	Andhra Pradesh	3 - Culpable Homicide not amounting to Murder ...	2014	7	0	7	68	2	70	94	...	102	6	0	6	90	6	96	0	0	0
3	Andhra Pradesh	4 - Attempt to commit Culpable Homicide (Secti...	2014	0	0	0	0	0	0	4	...	0	0	0	0	0	0	0	0	0	0
4	Andhra Pradesh	5 - Rape (Section 376 IPC)	2014	71	0	71	586	11	597	1191	...	692	70	0	70	610	12	622	0	0	0
5 rows × 57 columns

........................................

📄 File: 07_01_Persons_arrested_by_sex_and_age_group_IPC_2012.csv (0.10 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	ANDHRA PRADESH	MURDER (SECTION 302 IPC)	65	3	2054	187	1866	216	919	104	85	10	4989	520	5509
1	ARUNACHAL PRADESH	MURDER (SECTION 302 IPC)	0	0	53	0	52	2	6	0	0	0	111	2	113
2	ASSAM	MURDER (SECTION 302 IPC)	38	0	584	23	738	19	238	2	8	0	1606	44	1650
3	BIHAR	MURDER (SECTION 302 IPC)	60	5	2983	108	2462	145	1202	82	147	4	6854	344	7198
4	CHHATTISGARH	MURDER (SECTION 302 IPC)	64	5	560	43	487	46	228	13	36	8	1375	115	1490
........................................

📄 File: 07_01_Persons_arrested_by_sex_and_age_group_IPC_2013.csv (0.07 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	Andhra Pradesh	Arson	4	0	298	11	359	11	116	4	16	1	793	27	820
1	Arunachal Pradesh	Arson	0	0	7	0	10	0	0	0	0	0	17	0	17
2	Assam	Arson	9	0	291	0	421	0	50	0	0	0	771	0	771
3	Bihar	Arson	1	0	687	7	487	7	131	0	22	0	1328	14	1342
4	Chhattisgarh	Arson	2	2	127	4	92	1	22	1	1	0	244	8	252
........................................

📄 File: 07_01_Persons_arrested_by_sex_and_age_group_IPC_2014.csv (0.34 MB)
Features: ['States/UTs', 'Crime Head', 'Year', '18 and above and below 30 years_Male', '18 and above and below 30 years_Female', '18 and above and below 30 years_Total', '30 and above and below 45 years_Male', '30 and above and below 45 years_Female', '30 and above and below 45 years_Total', '45 and above and below 60 years_Male', '45 and above and below 60 years_Female', '45 and above and below 60 years_Total', '60 years and above_Male', '60 years and above_Female', '60 years and above_Total', 'Total Male', 'Total Female', 'Total Persons Arrested by age and Sex']
Preview:
States/UTs	Crime Head	Year	18 and above and below 30 years_Male	18 and above and below 30 years_Female	18 and above and below 30 years_Total	30 and above and below 45 years_Male	30 and above and below 45 years_Female	30 and above and below 45 years_Total	45 and above and below 60 years_Male	45 and above and below 60 years_Female	45 and above and below 60 years_Total	60 years and above_Male	60 years and above_Female	60 years and above_Total	Total Male	Total Female	Total Persons Arrested by age and Sex
0	Andhra Pradesh	1 - Murder (Section 302 IPC)	2014	754	59	813	772	113	885	517	48	565	48	0	48	2091	220	2311
1	Andhra Pradesh	2 - Attempt to commit Murder (Section 307 IPC)	2014	1175	38	1213	920	43	963	448	16	464	22	0	22	2565	97	2662
2	Andhra Pradesh	3 - Culpable Homicide not amounting to Murder ...	2014	16	2	18	64	4	68	13	1	14	0	0	0	93	7	100
3	Andhra Pradesh	4 - Attempt to commit Culpable Homicide (Secti...	2014	0	0	0	2	0	2	2	0	2	0	0	0	4	0	4
4	Andhra Pradesh	5 - Rape (Section 376 IPC)	2014	708	7	715	341	28	369	88	10	98	11	1	12	1148	46	1194
........................................

📄 File: 07_02_Persons_arrested_by_sex_and_age_group_SLL_2012.csv (0.08 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	ANDHRA PRADESH	ARMS ACT	4	0	262	0	231	0	46	0	6	0	549	0	549
1	ARUNACHAL PRADESH	ARMS ACT	0	0	10	0	4	0	0	0	0	0	14	0	14
2	ASSAM	ARMS ACT	2	0	290	2	249	1	31	0	0	0	572	3	575
3	BIHAR	ARMS ACT	25	0	1483	17	788	2	164	0	0	0	2460	19	2479
4	CHHATTISGARH	ARMS ACT	17	0	527	0	312	0	58	0	0	0	914	0	914
........................................

📄 File: 07_02_Persons_arrested_by_sex_and_age_group_SLL_2013.csv (0.07 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	Andhra Pradesh	Antiquity & Art Treasures Act, 1972	0	0	7	0	16	0	5	1	0	0	28	1	29
1	Arunachal Pradesh	Antiquity & Art Treasures Act, 1972	0	0	0	0	0	0	0	0	0	0	0	0	0
2	Assam	Antiquity & Art Treasures Act, 1972	0	0	0	0	0	0	0	0	0	0	0	0	0
3	Bihar	Antiquity & Art Treasures Act, 1972	0	0	4	0	0	0	0	0	0	0	4	0	4
4	Chhattisgarh	Antiquity & Art Treasures Act, 1972	0	0	0	0	0	0	0	0	0	0	0	0	0
........................................

📄 File: 07_02_Persons_arrested_by_sex_and_age_group_SLL_2014.csv (0.24 MB)
Features: ['States/UTs', 'Crime Head', 'Year', '18 and above and below 30 years_Male', '18 and above and below 30 years_Female', '18 and above and below 30 years_Total', '30 and above and below 45 years_Male', '30 and above and below 45 years_Female', '30 and above and below 45 years_Total', '45 and above and below 60 years_Male', '45 and above and below 60 years_Female', '45 and above and below 60 years_Total', '60 years and above_Male', '60 years and above_Female', '60 years and above_Total', 'Total Male', 'Total Female', 'Total Persons Arrested by age and Sex']
Preview:
States/UTs	Crime Head	Year	18 and above and below 30 years_Male	18 and above and below 30 years_Female	18 and above and below 30 years_Total	30 and above and below 45 years_Male	30 and above and below 45 years_Female	30 and above and below 45 years_Total	45 and above and below 60 years_Male	45 and above and below 60 years_Female	45 and above and below 60 years_Total	60 years and above_Male	60 years and above_Female	60 years and above_Total	Total Male	Total Female	Total Persons Arrested by age and Sex
0	Andhra Pradesh	1 - Arms Act, 1959	2014	73	3	76	155	0	155	27	0	27	6	0	6	261	3	264
1	Andhra Pradesh	2 - Narcotic Drugs & Psychotropic Substances A...	2014	303	14	317	310	15	325	118	8	126	7	3	10	738	40	778
2	Andhra Pradesh	3 - Gambling Act, 1867	2014	12473	0	12473	7860	0	7860	3672	0	3672	114	0	114	24119	0	24119
3	Andhra Pradesh	4 - Excise Act, 1944	2014	2142	38	2180	2270	61	2331	953	54	1007	232	2	234	5597	155	5752
4	Andhra Pradesh	5 - Prohibition Act	2014	300	2	302	968	26	994	426	18	444	12	0	12	1706	46	1752
........................................

📄 File: 08_01_Juvenile_apprehended_state_IPC.csv (0.54 MB)
Features: ['STATE/UT', 'Year', 'CRIME', 'Boys 7-12 Years', 'Girls 7-12 Years', 'Boys 12-16 Years', 'Girls 12-16 Years', 'Boys 16-18 Years', 'Girls 16-18 Years', 'Total for boys all Age Groups', 'Total for girls all Age Groups', 'Grand total']
Preview:
STATE/UT	Year	CRIME	Boys 7-12 Years	Girls 7-12 Years	Boys 12-16 Years	Girls 12-16 Years	Boys 16-18 Years	Girls 16-18 Years	Total for boys all Age Groups	Total for girls all Age Groups	Grand total
0	Andhra Pradesh	2001	Murder	3	0	7	0	5	0	15	0	15
1	Andhra Pradesh	2001	Attempt to Commit Murder	2	0	0	0	11	0	13	0	13
2	Andhra Pradesh	2001	C H Not amounting to Murder	0	0	0	0	0	0	0	0	0
3	Andhra Pradesh	2001	Rape	2	0	15	0	2	1	19	1	20
4	Andhra Pradesh	2001	Custodial Rape	0	0	0	0	0	0	0	0	0
........................................

📄 File: 08_02_Juvenile_apprehended_state_SLL.csv (0.56 MB)
Features: ['STATE/UT', 'Year', 'CRIME', 'Boys 7-12 Years', 'Girls 7-12 Years', 'Boys 12-16 Years', 'Girls 12-16 Years', 'Boys 16-18 Years', 'Girls 16-18 Years', 'Total for boys all Age Groups', 'Total for girls all Age Groups', 'Grand total']
Preview:
STATE/UT	Year	CRIME	Boys 7-12 Years	Girls 7-12 Years	Boys 12-16 Years	Girls 12-16 Years	Boys 16-18 Years	Girls 16-18 Years	Total for boys all Age Groups	Total for girls all Age Groups	Grand total
0	Andhra Pradesh	2001	Arms Act, 1959	0	0	2	0	0	0	2	0	2
1	Andhra Pradesh	2001	Narcotic Drugs and Psychotropic Substanc	0	0	0	0	0	0	0	0	0
2	Andhra Pradesh	2001	Gambling Act	0	0	6	0	0	0	6	0	6
3	Andhra Pradesh	2001	Excise Act	0	0	7	0	0	0	7	0	7
4	Andhra Pradesh	2001	Prohibition Act	0	0	37	0	0	0	37	0	37
........................................

📄 File: 09_Juveniles_arrested_and_their_disposal.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Juveniles_Acquitted_or_Otherwise_Disposed_of', 'Juveniles_Arrested', 'Juveniles_Dealt_with_Fine', 'Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Fit_Institutions', 'Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Parent_Guardian', 'Juveniles_Sent_Home_after_Advice_or_Admonition', 'Juveniles_Sent_to_Special_Home', 'Juveniles_whose_Cases_Pending_Disposal']
Preview:
Area_Name	Year	Juveniles_Acquitted_or_Otherwise_Disposed_of	Juveniles_Arrested	Juveniles_Dealt_with_Fine	Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Fit_Institutions	Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Parent_Guardian	Juveniles_Sent_Home_after_Advice_or_Admonition	Juveniles_Sent_to_Special_Home	Juveniles_whose_Cases_Pending_Disposal
0	Madhya Pradesh	2002	435	8536	388	329	3774	1239	515	1856
1	Madhya Pradesh	2003	304	7672	512	364	2587	1011	403	2491
2	Madhya Pradesh	2004	605	7433	398	161	1435	1642	572	2620
3	Madhya Pradesh	2007	401	7350	929	343	810	1466	533	2868
4	Madhya Pradesh	2001	180	7328	322	181	1425	1917	1361	1942
........................................

📄 File: 11_Property_stolen_and_recovered_nature_of_property.csv (0.43 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Sub_Group_Name', 'Cases_Property_Recovered', 'Cases_Property_Stolen', 'Value_of_Property_Recovered', 'Value_of_Property_Stolen']
Preview:
Area_Name	Year	Group_Name	Sub_Group_Name	Cases_Property_Recovered	Cases_Property_Stolen	Value_of_Property_Recovered	Value_of_Property_Stolen
0	Andaman & Nicobar Islands	2001	Cattle - Property	2. Cattle	0	1	0	1000
1	Andhra Pradesh	2001	Cattle - Property	2. Cattle	448	580	6490596	7233876
2	Arunachal Pradesh	2001	Cattle - Property	2. Cattle	22	34	135500	704500
3	Assam	2001	Cattle - Property	2. Cattle	149	322	683350	1816386
4	Bihar	2001	Cattle - Property	2. Cattle	144	334	896019	1911068
........................................

📄 File: 12_Police_strength_actual_and_sanctioned.csv (0.56 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Sub_Group_Name', 'Rank_All_Ranks_Total', 'Rank_ASI_Equivalent', 'Rank_ASPDySPAssttCommandant', 'Rank_Below_HC_and_Above_Constables', 'Rank_Constables', 'Rank_DGAddl_DG', 'Rank_DIG', 'Rank_Head_Constables', 'Rank_IGSplIG', 'Rank_Inspectors_Equivalent', 'Rank_SI_Equivalent', 'Rank_SSPSPAddlSPCommandant']
Preview:
Area_Name	Year	Group_Name	Sub_Group_Name	Rank_All_Ranks_Total	Rank_ASI_Equivalent	Rank_ASPDySPAssttCommandant	Rank_Below_HC_and_Above_Constables	Rank_Constables	Rank_DGAddl_DG	Rank_DIG	Rank_Head_Constables	Rank_IGSplIG	Rank_Inspectors_Equivalent	Rank_SI_Equivalent	Rank_SSPSPAddlSPCommandant
0	Andaman & Nicobar Islands	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	766	7	2	0	646	0	1	84	0	6	20	0
1	Andhra Pradesh	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	12510	433	56	0	8742	0	0	2864	0	132	270	13
2	Arunachal Pradesh	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	2232	14	15	169	1645	0	0	322	0	19	45	3
3	Assam	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	23963	36	135	2347	16591	0	0	3868	0	235	699	52
4	Bihar	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	373	0	0	0	326	0	0	41	0	2	4	0
........................................

📄 File: 13_Police_killed_or_injured_on_duty.csv (0.21 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Sub_Group_Name', 'Police_Injured_By_Criminals', 'Police_Injured_By_Riotous_Mobs', 'Police_Injured_In_Accidents', 'Police_Injured_In_Dacoity_OperationsOther_raids', 'Police_Injured_In_TerroristsExtremists_Operations', 'Police_Injured_On_Border_Duties', 'Police_Injured_Total_Policemen', 'Police_Killed_By_Criminals', 'Police_Killed_By_Riotous_Mobs', 'Police_Killed_In_Accidents', 'Police_Killed_In_Dacoity_OperationsOther_raids', 'Police_Killed_In_TerroristsExtremists_Operations', 'Police_Killed_On_Border_Duties', 'Police_Killed_Total_Policemen']
Preview:
Area_Name	Year	Group_Name	Sub_Group_Name	Police_Injured_By_Criminals	Police_Injured_By_Riotous_Mobs	Police_Injured_In_Accidents	Police_Injured_In_Dacoity_OperationsOther_raids	Police_Injured_In_TerroristsExtremists_Operations	Police_Injured_On_Border_Duties	Police_Injured_Total_Policemen	Police_Killed_By_Criminals	Police_Killed_By_Riotous_Mobs	Police_Killed_In_Accidents	Police_Killed_In_Dacoity_OperationsOther_raids	Police_Killed_In_TerroristsExtremists_Operations	Police_Killed_On_Border_Duties	Police_Killed_Total_Policemen
0	Andaman & Nicobar Islands	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	0	0	0	0	0	0	0	0	0	0	0	0	0
1	Andhra Pradesh	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	3	4	1	3	0	11	0	0	2	0	3	0	5
2	Arunachal Pradesh	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	0	0	0	0	0	0	0	0	0	0	0	0	0
3	Assam	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	0	0	0	1	0	1	0	0	1	0	0	0	1
4	Bihar	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	1	0	0	0	2	0	3	0	0	0	0	2	0	2
........................................

📄 File: 14_Age_profile_of_police_personnel_killed_on_duty.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Age_18_25_Yrs', 'Age_25_35_Yrs', 'Age_35_45_Yrs', 'Age_45_55_Yrs', 'Age_Above_55_Yrs', 'Age_Total']
Preview:
Area_Name	Year	Age_18_25_Yrs	Age_25_35_Yrs	Age_35_45_Yrs	Age_45_55_Yrs	Age_Above_55_Yrs	Age_Total
0	Jammu & Kashmir	2001	52	67	24	7	0	150
1	Chhattisgarh	2010	8	54	18	2	0	82
2	Jammu & Kashmir	2004	4	48	9	4	0	65
3	Jammu & Kashmir	2002	27	43	18	8	0	96
4	Chhattisgarh	2007	10	38	27	4	1	80
........................................

📄 File: 15_Police_natural_death_and_suicide.csv (0.05 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Age_18_25_Yrs', 'Age_25_35_Yrs', 'Age_35_45_Yrs', 'Age_45_55_Yrs', 'Age_Above_55_Yrs', 'Age_Total']
Preview:
Area_Name	Year	Group_Name	Age_18_25_Yrs	Age_25_35_Yrs	Age_35_45_Yrs	Age_45_55_Yrs	Age_Above_55_Yrs	Age_Total
0	Andaman & Nicobar Islands	2001	Natural Deaths of Policemen while in Service	0	0	0	0	1	1
1	Andhra Pradesh	2001	Natural Deaths of Policemen while in Service	7	39	100	76	11	233
2	Arunachal Pradesh	2001	Natural Deaths of Policemen while in Service	0	2	0	0	0	2
3	Assam	2001	Natural Deaths of Policemen while in Service	0	2	4	8	3	17
4	Bihar	2001	Natural Deaths of Policemen while in Service	0	7	22	27	13	69
........................................

📄 File: 16_Casualties_under_police_firing_and_lathi_charge.csv (0.09 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Civilians_Injured', 'Civilians_Killed', 'No_of_Firings', 'Policemen_Injured', 'Policemen_Killed']
Preview:
Area_Name	Year	Group_Name	Civilians_Injured	Civilians_Killed	No_of_Firings	Policemen_Injured	Policemen_Killed
0	Andaman & Nicobar Islands	2001	Against Extremists & Terrorists	0	0	0	0	0
1	Andhra Pradesh	2001	Against Extremists & Terrorists	4	105	108	14	8
2	Arunachal Pradesh	2001	Against Extremists & Terrorists	0	0	0	0	0
3	Assam	2001	Against Extremists & Terrorists	4	26	37	3	9
4	Bihar	2001	Against Extremists & Terrorists	0	7	12	13	5
........................................

📄 File: 17_Case_reported_and_value_of_property_taken_away_by_place_of_occurrence_2001_2012.csv (0.27 MB)
Features: ['STATE/UT', 'YEAR', 'Place Of Occurrence', 'Dacoity (Section 395-398 IPC) - Number of cases registered', 'Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)', 'Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered', 'Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)', 'Theft (Section 379-382 IPC) - Number of cases registered', 'Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)']
Preview:
STATE/UT	YEAR	Place Of Occurrence	Dacoity (Section 395-398 IPC) - Number of cases registered	Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)	Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered	Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)	Theft (Section 379-382 IPC) - Number of cases registered	Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)
0	Andhra Pradesh	2001	RESIDENTIAL PREMISES	100	4446961	177	5962460	5158	105324332	4257	53517835
1	Andhra Pradesh	2001	HIGH-WAY	57	5340335	172	6364866	31	2000574	74	1593092
2	Andhra Pradesh	2001	RIVER & SEA	2	145345	11	209330	101	1412516	110	1610200
3	Andhra Pradesh	2001	RAILWAYS	8	1750800	19	304336	6	24392	943	16418110
4	Andhra Pradesh	2001	RUNNING TRAINS	5	75000	3	164000	0	0	296	6170175
........................................

📄 File: 17_Case_reported_and_value_of_property_taken_away_by_place_of_occurrence_2013.csv (0.03 MB)
Features: ['STATE/UT', 'YEAR', 'Place Of Occurrence', 'Dacoity (Section 395-398 IPC) - Number of cases registered', 'Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)', 'Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered', 'Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)', 'Theft (Section 379-382 IPC) - Number of cases registered', 'Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)']
Preview:
STATE/UT	YEAR	Place Of Occurrence	Dacoity (Section 395-398 IPC) - Number of cases registered	Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)	Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered	Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)	Theft (Section 379-382 IPC) - Number of cases registered	Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)
0	Andhra Pradesh	2013	RESIDENTIAL PREMISES	43	21295800	229	23719985	7264	409568072	10539	470463463
1	Andhra Pradesh	2013	HIGH-WAY	31	6713585	109	11701238	0	0	528	24368531
2	Andhra Pradesh	2013	RIVER & SEA	0	0	1	8000	0	0	58	6612000
3	Andhra Pradesh	2013	RAILWAYS	3	37500	14	246920	0	0	1627	75617986
4	Andhra Pradesh	2013	RUNNING TRAINS	2	4000	4	58000	0	0	818	33655111
........................................

📄 File: 17_Crime_by_place_of_occurrence_2001_2012.csv (0.05 MB)
Features: ['STATE/UT', 'YEAR', 'RESIDENTIAL PREMISES - Dacoity', 'RESIDENTIAL PREMISES - Robbery', 'RESIDENTIAL PREMISES - Burglary', 'RESIDENTIAL PREMISES - Theft', 'HIGHWAYS - Dacoity', 'HIGHWAYS - Robbery', 'HIGHWAYS - Burglary', 'HIGHWAYS - Theft', 'RIVER and SEA - Dacoity', 'RIVER and SEA - Robbery', 'RIVER and SEA - Burglary', 'RIVER and SEA - Theft', 'RAILWAYS - Dacoity', 'RAILWAYS - Robbery', 'RAILWAYS - Burglary', 'RAILWAYS - Theft', 'BANKS - Dacoity', 'BANKS - Robbery', 'BANKS - Burglary', 'BANKS - Theft', 'COMMERCIAL ESTABLISHMENTS - Dacoity', 'COMMERCIAL ESTABLISHMENTS - Robbery', 'COMMERCIAL ESTABLISHMENTS - Burglary', 'COMMERCIAL ESTABLISHMENTS - Theft', 'OTHER PLACES - Dacoity', 'OTHER PLACES - Robbery', 'OTHER PLACES - Burglary', 'OTHER PLACES - Theft', 'TOTAL - Dacoity', 'TOTAL - Robbery', 'TOTAL - Burglary', 'TOTAL - Theft']
Preview:
STATE/UT	YEAR	RESIDENTIAL PREMISES - Dacoity	RESIDENTIAL PREMISES - Robbery	RESIDENTIAL PREMISES - Burglary	RESIDENTIAL PREMISES - Theft	HIGHWAYS - Dacoity	HIGHWAYS - Robbery	HIGHWAYS - Burglary	HIGHWAYS - Theft	...	COMMERCIAL ESTABLISHMENTS - Burglary	COMMERCIAL ESTABLISHMENTS - Theft	OTHER PLACES - Dacoity	OTHER PLACES - Robbery	OTHER PLACES - Burglary	OTHER PLACES - Theft	TOTAL - Dacoity	TOTAL - Robbery	TOTAL - Burglary	TOTAL - Theft
0	ANDHRA PRADESH	2001	100	177	5158	4257	57	172	31	74	...	1041	2502	37	232	862	8849	214	629	7220	16751
1	ARUNACHAL PRADESH	2001	9	26	99	131	0	0	0	8	...	84	54	8	40	65	249	22	84	248	443
2	ASSAM	2001	381	191	1695	2901	46	136	7	87	...	442	967	77	261	271	1342	532	687	2423	5367
3	BIHAR	2001	818	326	2486	4741	162	826	0	257	...	231	686	210	880	505	2582	1291	2203	3233	9701
4	CHHATTISGARH	2001	54	42	3336	1417	10	38	12	72	...	370	299	15	239	420	2835	87	338	4144	4812
5 rows × 34 columns

........................................

📄 File: 17_Crime_by_place_of_occurrence_2013.csv (0.00 MB)
Features: ['STATE/UT', 'YEAR', 'RESIDENTIAL PREMISES - Dacoity', 'RESIDENTIAL PREMISES - Robbery', 'RESIDENTIAL PREMISES - Burglary', 'RESIDENTIAL PREMISES - Theft', 'HIGHWAYS - Dacoity', 'HIGHWAYS - Robbery', 'HIGHWAYS - Burglary', 'HIGHWAYS - Theft', 'RIVER and SEA - Dacoity', 'RIVER and SEA - Robbery', 'RIVER and SEA - Burglary', 'RIVER and SEA - Theft', 'RAILWAYS - Dacoity', 'RAILWAYS - Robbery', 'RAILWAYS - Burglary', 'RAILWAYS - Theft', 'BANKS - Dacoity', 'BANKS - Robbery', 'BANKS - Burglary', 'BANKS - Theft', 'COMMERCIAL ESTABLISHMENTS - Dacoity', 'COMMERCIAL ESTABLISHMENTS - Robbery', 'COMMERCIAL ESTABLISHMENTS - Burglary', 'COMMERCIAL ESTABLISHMENTS - Theft', 'OTHER PLACES - Dacoity', 'OTHER PLACES - Robbery', 'OTHER PLACES - Burglary', 'OTHER PLACES - Theft', 'TOTAL - Dacoity', 'TOTAL - Robbery', 'TOTAL - Burglary', 'TOTAL - Theft']
Preview:
STATE/UT	YEAR	RESIDENTIAL PREMISES - Dacoity	RESIDENTIAL PREMISES - Robbery	RESIDENTIAL PREMISES - Burglary	RESIDENTIAL PREMISES - Theft	HIGHWAYS - Dacoity	HIGHWAYS - Robbery	HIGHWAYS - Burglary	HIGHWAYS - Theft	...	COMMERCIAL ESTABLISHMENTS - Burglary	COMMERCIAL ESTABLISHMENTS - Theft	OTHER PLACES - Dacoity	OTHER PLACES - Robbery	OTHER PLACES - Burglary	OTHER PLACES - Theft	TOTAL - Dacoity	TOTAL - Robbery	TOTAL - Burglary	TOTAL - Theft
0	Andhra Pradesh	2013	43	229	7264	10539	31	109	0	528	...	796	2578	45	325	1740	15670	125	709	9820	31032
1	Arunachal Pradesh	2013	6	19	85	138	3	12	0	7	...	54	168	15	28	57	200	24	75	196	514
2	Assam	2013	133	313	2652	6449	12	92	17	22	...	542	797	92	437	1072	3223	246	923	4291	10515
3	Bihar	2013	260	85	3084	9360	240	1244	9	588	...	312	2129	42	119	777	7989	579	1521	4185	21423
4	Chhattisgarh	2013	7	15	2759	1356	7	51	67	37	...	313	402	31	271	376	3200	47	351	3527	5189
5 rows × 34 columns

........................................

📄 File: 17_Crime_by_place_of_occurrence_2014.csv (0.02 MB)
Features: ['States/UTs', 'Year', 'Residence_Dacoity_Cases reported', 'Residence_Dacoity_Value of property stolen', 'Residence_Robbery_Cases reported', 'Residence_Robbery_Value of property stolen', 'Residence_Burglary_Cases reported', 'Residence_Burglary_Value of property stolen', 'Residence_Theft_Cases reported', 'Residence_Theft_Value of property stolen', 'Highways_Dacoity_Cases reported', 'Highways_Dacoity_Value of property stolen', 'Highways_Robbery_Cases reported', 'Highways_Robbery_Value of property stolen', 'Highways_Burglary_Cases reported', 'Highways_Burglary_Value of property stolen', 'Highways_Theft_Cases reported', 'Highways_Theft_Value of property stolen', 'RiverOrSea_Dacoity_Cases reported', 'RiverOrSea_Dacoity_Value of property stolen', 'RiverOrSea_Robbery_Cases reported', 'RiverOrSea_Robbery_Value of property stolen', 'RiverOrSea_Burglary_Cases reported', 'RiverOrSea_Burglary_Value of property stolen', 'RiverOrSea_Theft_Cases reported', 'RiverOrSea_Theft_Value of property stolen', 'Railways_Dacoity_Cases reported', 'Railways_Dacoity_Value of property stolen', 'Railways_Robbery_Cases reported', 'Railways_Robbery_Value of property stolen', 'Railways_Burglary_Cases reported', 'Railways_Burglary_Value of property stolen', 'Railways_Theft_Cases reported', 'Railways_Theft_Value of property stolen', 'Religious Places_Dacoity_Cases reported', 'Religious Places_Dacoity_Value of property stolen', 'Religious Places_Robbery_Cases reported', 'Religious Places_Robbery_Value of property stolen', 'Religious Places_Burglary_Cases reported', 'Religious Places_Burglary_Value of property stolen', 'Religious Places_Theft_Cases reported', 'Religious Places_Theft_Value of property stolen', 'ATM_Dacoity_Cases reported', 'ATM_Dacoity_Value of property stolen', 'ATM_Robbery_Cases reported', 'ATM_Robbery_Value of property stolen', 'ATM_Burglary_Cases reported', 'ATM_Burglary_Value of property stolen', 'ATM_Theft_Cases reported', 'ATM_Theft_Value of property stolen', 'Bank_Dacoity_Cases reported', 'Bank_Dacoity_Value of property stolen', 'Bank_Robbery_Cases reported', 'Bank_Robbery_Value of property stolen', 'Bank_Burglary_Cases reported', 'Bank_Burglary_Value of property stolen', 'Bank_Theft_Cases reported', 'Bank_Theft_Value of property stolen', 'CommEst_Dacoity_Cases reported', 'CommEst_Dacoity_Value of property stolen', 'CommEst_Robbery_Cases reported', 'CommEst_Robbery_Value of property stolen', 'CommEst_Burglary_Cases reported', 'CommEst_Burglary_Value of property stolen', 'CommEst_Theft_Cases reported', 'CommEst_Theft_Value of property stolen', 'OtherPlaces_Dacoity_Cases reported', 'OtherPlaces_Dacoity_Value of property stolen', 'OtherPlaces_Robbery_Cases reported', 'OtherPlaces_Robbery_Value of property stolen', 'OtherPlaces_Burglary_Cases reported', 'OtherPlaces_Burglary_Value of property stolen', 'OtherPlaces_Theft_Cases reported', 'OtherPlaces_Theft_Value of property stolen', 'Total_Dacoity_Cases reported', 'Total_Dacoity_Value of property stolen', 'Total_Robbery_Cases reported', 'Total_Robbery_Value of property stolen', 'Total_Burglary_Cases reported', 'Total_Burglary_Value of property stolen', 'Total_Theft_Cases reported', 'Total_Theft_Value of property stolen']
Preview:
States/UTs	Year	Residence_Dacoity_Cases reported	Residence_Dacoity_Value of property stolen	Residence_Robbery_Cases reported	Residence_Robbery_Value of property stolen	Residence_Burglary_Cases reported	Residence_Burglary_Value of property stolen	Residence_Theft_Cases reported	Residence_Theft_Value of property stolen	...	OtherPlaces_Theft_Cases reported	OtherPlaces_Theft_Value of property stolen	Total_Dacoity_Cases reported	Total_Dacoity_Value of property stolen	Total_Robbery_Cases reported	Total_Robbery_Value of property stolen	Total_Burglary_Cases reported	Total_Burglary_Value of property stolen	Total_Theft_Cases reported	Total_Theft_Value of property stolen
0	Andhra Pradesh	2014	27	7983001	124	10577950	3530	226363051	5757	199348324	...	4997	199285711	75	27152368	433	41148643	4719	321352316	15617	641880290
1	Arunachal Pradesh	2014	3	67500	8	86350	103	6637940	173	15422078	...	158	37247470	12	477000	61	8718930	224	12324815	498	78789228
2	Assam	2014	144	10693775	315	4191631	2293	26376373	4503	131897564	...	5981	130654964	267	16603231	1038	18121153	4954	49369570	12737	311982322
3	Bihar	2014	174	27725940	117	6558972	3693	262152615	6655	116467719	...	10874	416911296	538	151516733	1600	74012959	4674	279472385	22888	693664033
4	Chhattisgarh	2014	27	3076170	25	1137900	1985	85802275	1235	53896428	...	3057	125524854	58	911101420	405	26477826	3247	150182672	6098	266495669
5 rows × 82 columns

........................................

📄 File: 18_01_Juveniles_arrested_Education.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Education_Above_Primary_but_below_Matric_or_Higher_Secondary', 'Education_Illiterate', 'Education_Matric_or_Higher_Secondary_&_above', 'Education_Total', 'Education_Upto_primary']
Preview:
Area_Name	Year	Sub_Group_Name	Education_Above_Primary_but_below_Matric_or_Higher_Secondary	Education_Illiterate	Education_Matric_or_Higher_Secondary_&_above	Education_Total	Education_Upto_primary
0	Andaman & Nicobar Islands	2001	1. Education	12	0	0	16	4
1	Andhra Pradesh	2001	1. Education	178	640	64	1565	683
2	Arunachal Pradesh	2001	1. Education	39	16	12	137	70
3	Assam	2001	1. Education	74	91	0	253	88
4	Bihar	2001	1. Education	87	190	56	586	253
........................................

📄 File: 18_02_Juveniles_arrested_Economic_setup.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Economic_Set_up_Annual_Income_250001_to_50000', 'Economic_Set_up_Annual_Income_upto_Rs_25000', 'Economic_Set_up_Middle_income_from_100001_to_200000', 'Economic_Set_up_Middle_income_from_50001_to_100000', 'Economic_Set_up_Total', 'Economic_Set_up_Upper_income_above_Rs_300000', 'Economic_Set_up_Upper_middle_income_from_200001_to_300000']
Preview:
Area_Name	Year	Sub_Group_Name	Economic_Set_up_Annual_Income_250001_to_50000	Economic_Set_up_Annual_Income_upto_Rs_25000	Economic_Set_up_Middle_income_from_100001_to_200000	Economic_Set_up_Middle_income_from_50001_to_100000	Economic_Set_up_Total	Economic_Set_up_Upper_income_above_Rs_300000	Economic_Set_up_Upper_middle_income_from_200001_to_300000
0	Andaman & Nicobar Islands	2001	2. Economic Setup	12	4	0	0	16	0	0
1	Andhra Pradesh	2001	2. Economic Setup	104	1421	9	27	1565	4	0
2	Arunachal Pradesh	2001	2. Economic Setup	38	99	0	0	137	0	0
3	Assam	2001	2. Economic Setup	47	177	13	16	253	0	0
4	Bihar	2001	2. Economic Setup	213	303	12	58	586	0	0
........................................

📄 File: 18_03_Juveniles_arrested_Family_background.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Family_back_ground_Homeless', 'Family_back_ground_Living_with_guardian', 'Family_back_ground_Living_with_parents', 'Family_back_ground_Total']
Preview:
Area_Name	Year	Sub_Group_Name	Family_back_ground_Homeless	Family_back_ground_Living_with_guardian	Family_back_ground_Living_with_parents	Family_back_ground_Total
0	Andaman & Nicobar Islands	2001	3. Family Background	0	0	16	16
1	Andhra Pradesh	2001	3. Family Background	552	287	726	1565
2	Arunachal Pradesh	2001	3. Family Background	0	58	79	137
3	Assam	2001	3. Family Background	21	74	158	253
4	Bihar	2001	3. Family Background	43	101	442	586
........................................

📄 File: 18_04_Juveniles_arrested_Recidivism.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Recidivism_New_Delinquent', 'Recidivism_Old_Delinquent', 'Recidivism_Total']
Preview:
Area_Name	Year	Sub_Group_Name	Recidivism_New_Delinquent	Recidivism_Old_Delinquent	Recidivism_Total
0	Andaman & Nicobar Islands	2001	4. Recidivism	16	0	16
1	Andhra Pradesh	2001	4. Recidivism	1392	173	1565
2	Arunachal Pradesh	2001	4. Recidivism	130	7	137
3	Assam	2001	4. Recidivism	248	5	253
4	Bihar	2001	4. Recidivism	576	10	586
........................................

📄 File: 19_Motive_or_cause_of_murder_and_culpable_homicide_not_amounting_to_murder.csv (0.03 MB)
Features: ['Area_Name', 'Year', 'CHNAMurder_Cause_By_TerroristExtremist', 'CHNAMurder_Cause_Casteism', 'CHNAMurder_Cause_Class_Conflict', 'CHNAMurder_Cause_Communalism', 'CHNAMurder_Cause_Dowry', 'CHNAMurder_Cause_For_Political_reason', 'CHNAMurder_Cause_Gain', 'CHNAMurder_Cause_Love_AffairsSexual_Relations', 'CHNAMurder_Cause_Lunacy', 'CHNAMurder_Cause_Other_Causes_or_Motives', 'CHNAMurder_Cause_Personal_Vendetta_or_Enmity', 'CHNAMurder_Cause_Property_Dispute', 'CHNAMurder_Cause_Total', 'CHNAMurder_Cause_Witchcraft', 'Murder_Cause_By_TerroristExtremist', 'Murder_Cause_Casteism', 'Murder_Cause_Class_Conflict', 'Murder_Cause_Communalism', 'Murder_Cause_Dowry', 'Murder_Cause_For_Political_reason', 'Murder_Cause_Gain', 'Murder_Cause_Love_AffairsSexual_Relations', 'Murder_Cause_Lunacy', 'Murder_Cause_Other_Causes_or_Motives', 'Murder_Cause_Personal_Vendetta_or_Enmity', 'Murder_Cause_Property_Dispute', 'Murder_Cause_Total', 'Murder_Cause_Witchcraft']
Preview:
Area_Name	Year	CHNAMurder_Cause_By_TerroristExtremist	CHNAMurder_Cause_Casteism	CHNAMurder_Cause_Class_Conflict	CHNAMurder_Cause_Communalism	CHNAMurder_Cause_Dowry	CHNAMurder_Cause_For_Political_reason	CHNAMurder_Cause_Gain	CHNAMurder_Cause_Love_AffairsSexual_Relations	...	Murder_Cause_Dowry	Murder_Cause_For_Political_reason	Murder_Cause_Gain	Murder_Cause_Love_AffairsSexual_Relations	Murder_Cause_Lunacy	Murder_Cause_Other_Causes_or_Motives	Murder_Cause_Personal_Vendetta_or_Enmity	Murder_Cause_Property_Dispute	Murder_Cause_Total	Murder_Cause_Witchcraft
0	Odisha	2007	0	11	0	0	2	0	0	0	...	138	4	60	61	1	755	113	43	1210	28
1	Jharkhand	2002	0	3	2	2	13	3	7	9	...	70	25	103	158	3	599	242	228	1488	26
2	Jharkhand	2004	0	3	2	2	13	3	7	9	...	70	25	103	158	3	599	242	228	1488	26
3	Bihar	2010	0	2	2	0	11	0	47	35	...	168	24	352	187	5	1228	441	916	3362	2
4	Karnataka	2002	0	1	0	0	0	0	0	1	...	52	6	55	130	0	1093	188	98	1627	0
5 rows × 30 columns

........................................

📄 File: 21_Offenders_known_to_the_victim.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'No_of_Cases_in_which_offenders_were_known_to_the_Victims', 'No_of_Cases_in_which_offenders_were_Neighbours', 'No_of_Cases_in_which_offenders_were_Other_Known_persons', 'No_of_Cases_in_which_offenders_were_Parentsclose_family_members', 'No_of_Cases_in_which_offenders_were_Relatives']
Preview:
Area_Name	Year	No_of_Cases_in_which_offenders_were_known_to_the_Victims	No_of_Cases_in_which_offenders_were_Neighbours	No_of_Cases_in_which_offenders_were_Other_Known_persons	No_of_Cases_in_which_offenders_were_Parentsclose_family_members	No_of_Cases_in_which_offenders_were_Relatives
0	Madhya Pradesh	2007	3010	1397	1384	49	180
1	Madhya Pradesh	2008	2937	1279	1433	52	173
2	Madhya Pradesh	2009	2998	1254	1528	14	202
3	Madhya Pradesh	2010	3135	1223	1659	21	232
4	West Bengal	2010	2134	1037	987	4	106
........................................

📄 File: 22_Persons_arrested_under_recidivism.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Offenders_Arrested', 'Offenders_Arrested_for_the_First_time', 'Offenders_Conviction_in_the_past_Once', 'Offenders_Conviction_in_the_past_Three_times_or_More', 'Offenders_Conviction_in_the_past_Twice']
Preview:
Area_Name	Year	Offenders_Arrested	Offenders_Arrested_for_the_First_time	Offenders_Conviction_in_the_past_Once	Offenders_Conviction_in_the_past_Three_times_or_More	Offenders_Conviction_in_the_past_Twice
0	Uttar Pradesh	2001	314055	305811	6528	305	1411
1	Maharashtra	2008	311598	304892	5622	246	838
2	Maharashtra	2010	305629	301091	3139	375	1024
3	Madhya Pradesh	2010	343192	294222	37544	3119	8307
4	Uttar Pradesh	2010	292050	289905	1562	76	507
........................................

📄 File: 23_Anti_corruprion_cases.csv (0.08 MB)
Features: ['Area_Name', 'Year', 'AC01_No_of_cases_pending_investigation_from_previous_year', 'AC02_No_of_cases_registered_during_the_year', 'AC03_Total_No_of_cases_for_investigation_during_the_year', 'AC04_No_of_cases_investigated_during_the_year', 'AC05_No_of_cases_not_investigatedor_in_which_investigation_was_dropped_due_to_any_reason_during_the_year', 'AC06_No_of_cases_transferred_to_local_police_during_the_year', 'AC07_No_of_cases_declared_false_mistake_of_fact_or_of_law_or_non_cognizable_or_civil_in_nature', 'AC08_No_of_cases_in_which_charge_sheets_were_laid_during_the_year', 'AC09_No_of_cases_pending_departmental_sanction_for_prosecution_during_the_year', 'AC10_No_of_cases_sent_up_for_trial_and_also_reported_for_departmental_action_during_the_year', 'AC11_No_of_cases_reported_for_regular_departmental_action_during_the_year', 'AC12_No_of_cases_reported_for_suitable_action_during_the_year', 'AC13_No_of_cases_in_which_charge_sheets_were_not_laid_but_final_report_submitted_during_the_year', 'AC14_No_of_cases_pending_investigation_at_the_end_of_the_year', 'AC15_No_of_cases_resulted_in_recoveries_or_seizures_during_the_year', 'AC16_Value_of_property_recoveredseized_during_the_year_in_Rs', 'AC17_Percentage_of_cases_charge_sheeted_to_total_cases_investigated', 'AC18_No_of_cases_pending_trial_from_the_previous_year', 'AC19_No_of_cases_sent_up_for_trial_during_the_year', 'AC20_Total_No_of_cases_for_trial_during_the_year', 'AC21_No_of_cases_withdrawn_or_other_wise_disposed_off_on_account_of_death_of_the_accused_during_the_year', 'AC22_No_of_cases_in_which_trials_were_completed_during_the_year', 'AC23_No_of_cases_convicted_during_the_year', 'AC24_No_of_cases_acquitted_or_discharged_during_the_year', 'AC25_No_of_cases_pending_trial_at_the_end_of_the_year', 'AC26_Percentage_of_cases_convicted_to_cases_in_which_trials_were_completed_during_the_year', 'AC27_Total_amount_of_fine_imposed_during_the_year_in_Rs']
Preview:
Area_Name	Year	AC01_No_of_cases_pending_investigation_from_previous_year	AC02_No_of_cases_registered_during_the_year	AC03_Total_No_of_cases_for_investigation_during_the_year	AC04_No_of_cases_investigated_during_the_year	AC05_No_of_cases_not_investigatedor_in_which_investigation_was_dropped_due_to_any_reason_during_the_year	AC06_No_of_cases_transferred_to_local_police_during_the_year	AC07_No_of_cases_declared_false_mistake_of_fact_or_of_law_or_non_cognizable_or_civil_in_nature	AC08_No_of_cases_in_which_charge_sheets_were_laid_during_the_year	...	AC18_No_of_cases_pending_trial_from_the_previous_year	AC19_No_of_cases_sent_up_for_trial_during_the_year	AC20_Total_No_of_cases_for_trial_during_the_year	AC21_No_of_cases_withdrawn_or_other_wise_disposed_off_on_account_of_death_of_the_accused_during_the_year	AC22_No_of_cases_in_which_trials_were_completed_during_the_year	AC23_No_of_cases_convicted_during_the_year	AC24_No_of_cases_acquitted_or_discharged_during_the_year	AC25_No_of_cases_pending_trial_at_the_end_of_the_year	AC26_Percentage_of_cases_convicted_to_cases_in_which_trials_were_completed_during_the_year	AC27_Total_amount_of_fine_imposed_during_the_year_in_Rs
0	Rajasthan	2010	740.0	576.0	1316.0	1316.0	0.0	0.0	0.0	281.0	...	1817.0	281.0	2098.0	8.0	57.0	11.0	46.0	2033.0	0.0	33750.0
1	Maharashtra	2010	724.0	528.0	1252.0	1252.0	2.0	0.0	4.0	446.0	...	2042.0	446.0	2488.0	5.0	366.0	68.0	298.0	2117.0	0.0	383000.0
2	Maharashtra	2003	509.0	521.0	1030.0	1030.0	3.0	3.0	1.0	479.0	...	2602.0	479.0	3081.0	5.0	396.0	113.0	283.0	2680.0	0.0	404600.0
3	Tamil Nadu	2009	347.0	498.0	845.0	845.0	0.0	0.0	0.0	156.0	...	308.0	156.0	464.0	13.0	52.0	26.0	26.0	399.0	0.0	149300.0
4	Maharashtra	2001	505.0	497.0	1002.0	1002.0	2.0	6.0	6.0	472.0	...	2321.0	472.0	2793.0	3.0	287.0	97.0	190.0	2503.0	0.0	1061500.0
5 rows × 29 columns

........................................

📄 File: 24_Anti_corruption_arrests.csv (0.06 MB)
Features: ['Area_Name', 'Year', 'ACA01_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_beginning_of_the_year', 'ACA02_No_of_persons_arrested_during_the_year', 'ACA04_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_end_of_the_year', 'ACA05_No_of_persons_in_whose_cases_charge_sheets_were_laid_during_the_year', 'ACA06_No_of_persons_under_trial_at_the_beginning_of_the_year', 'ACA07_Total_No_of_persons_under_trial_during_the_year', 'ACA08_No_of_persons_whose_cases_were_withdrawn_or_otherwise_disposed_off_during_the_year', 'ACA09_No_of_persons_in_custody_or_on_bail_during_the_stage_of_trial_at_the_end_of_the_year', 'ACA10_No_of_persons_in_whose_cases_trials_were_completed_during_the_year', 'ACA11_No_of_persons_convicted_during_the_year', 'ACA12_No_of_persons_acquitted_during_the_year', 'ACA13_Percentage_of_persons_convicted_to_total_persons_in_whose_cases_trials_were_completed_during_the_year', 'ACA14_No_of_persons_involved_in_the_cases_reported_for_Regular_Departmental_Action_during_the_year', 'ACA15_No_of_persons_involved_in_the_cases_reported_for_suitable_action_during_the_year', 'ACA16_No_of_persons_punished_departmentally_during_the_year:', 'ACA161_No_of_persons_dismissed_from_Service_during_the_year', 'ACA162_No_of_persons_removed_from_service_during_the_year', 'ACA163_No_of_persons_awarded_other_major_punishments_during_the_year', 'ACA164_No_of_persons_awarded_minor_punishments_during_the_year', "ACA171_No_of_Group_`A'_Officers_out_of_above", "ACA172_No_of_Group_`B'_Officers_out_of_above", 'ACA19_No_of_private_persons_involved_during_the_year']
Preview:
Area_Name	Year	ACA01_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_beginning_of_the_year	ACA02_No_of_persons_arrested_during_the_year	ACA04_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_end_of_the_year	ACA05_No_of_persons_in_whose_cases_charge_sheets_were_laid_during_the_year	ACA06_No_of_persons_under_trial_at_the_beginning_of_the_year	ACA07_Total_No_of_persons_under_trial_during_the_year	ACA08_No_of_persons_whose_cases_were_withdrawn_or_otherwise_disposed_off_during_the_year	ACA09_No_of_persons_in_custody_or_on_bail_during_the_stage_of_trial_at_the_end_of_the_year	...	ACA14_No_of_persons_involved_in_the_cases_reported_for_Regular_Departmental_Action_during_the_year	ACA15_No_of_persons_involved_in_the_cases_reported_for_suitable_action_during_the_year	ACA16_No_of_persons_punished_departmentally_during_the_year:	ACA161_No_of_persons_dismissed_from_Service_during_the_year	ACA162_No_of_persons_removed_from_service_during_the_year	ACA163_No_of_persons_awarded_other_major_punishments_during_the_year	ACA164_No_of_persons_awarded_minor_punishments_during_the_year	ACA171_No_of_Group_ `A'_Officers_out_of_above	ACA172_No_of_Group_`B'_Officers_out_of_above	ACA19_No_of_private_persons_involved_during_the_year
0	Bihar	2007	13.0	950.0	20.0	943.0	0.0	0.0	4.0	0.0	...	0.0	0.0	0.0	0.0	0.0	0.0	0.0	246.0	150.0	215.0
1	Gujarat	2010	144.0	947.0	449.0	642.0	959.0	1601.0	0.0	1378.0	...	5.0	35.0	6.0	1.0	0.0	2.0	3.0	9.0	46.0	35.0
2	Maharashtra	2007	775.0	870.0	1188.0	453.0	3588.0	4041.0	21.0	3553.0	...	10.0	0.0	3.0	1.0	0.0	1.0	1.0	88.0	72.0	73.0
3	Maharashtra	2003	825.0	792.0	869.0	730.0	3717.0	4447.0	14.0	3929.0	...	5.0	0.0	3.0	0.0	0.0	0.0	3.0	54.0	81.0	93.0
4	Punjab	2005	338.0	748.0	523.0	529.0	1037.0	1566.0	35.0	1244.0	...	0.0	26.0	8.0	8.0	0.0	0.0	0.0	79.0	0.0	115.0
5 rows × 24 columns

........................................

📄 File: 27_Nature_of_complaints_received_by_police.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'PC1_Oral_Complaints', 'PC2_Written_Complaints', 'PC3_Distress_call_over_phoneNo_100_etc', 'PC4_Complaints_initiated_sue_motto_by_Police', 'PC5_Total_Complaints_Sum_of_1_4_Above', 'PC6_Total_Complaints_as_recorded_in_GD', 'PC7_IPC_Cases_Registered', 'PC8_SLL_Cases_Registered']
Preview:
Area_Name	Year	PC1_Oral_Complaints	PC2_Written_Complaints	PC3_Distress_call_over_phoneNo_100_etc	PC4_Complaints_initiated_sue_motto_by_Police	PC5_Total_Complaints_Sum_of_1_4_Above	PC6_Total_Complaints_as_recorded_in_GD	PC7_IPC_Cases_Registered	PC8_SLL_Cases_Registered
0	Maharashtra	2010	239448	561217	13049	549410	1363124	1106219	208168	127940
1	Maharashtra	2009	242585	525157	7697	436688	1212127	979735	199598	135418
2	Maharashtra	2008	233929	499832	7307	404182	1145250	1019301	206243	120138
3	Maharashtra	2005	221580	474289	5013	209806	910688	811193	187027	142293
4	Maharashtra	2007	209595	470614	6479	203440	890128	696871	195707	120310
........................................

📄 File: 34_Use_of_fire_arms_in_murder_cases.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Victims_of_Murder_by_Fire_arms', 'Victims_of_Murder_by_Licensed_arms', 'Victims_of_Murder_by_Un_licensedImprovisedCrudeCountry_made_Arms_Etc']
Preview:
Area_Name	Year	Victims_of_Murder_by_Fire_arms	Victims_of_Murder_by_Licensed_arms	Victims_of_Murder_by_Un_licensedImprovisedCrudeCountry_made_Arms_Etc
0	Uttar Pradesh	2004	4969	437	4532
1	Uttar Pradesh	2002	4098	403	3695
2	Uttar Pradesh	2006	2565	330	2235
3	Uttar Pradesh	2003	3855	317	3538
4	Uttar Pradesh	2008	1470	261	1209
........................................

📄 File: 37_Home_guards_and_auxilliary_force.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'HG_Lower_Subordinates_Actual_Strength', 'HG_Lower_Subordinates_Sanctioned_Strength', 'HG_Officers_Actual_Strength', 'HG_Officers_Sanctioned_Strength', 'HG_Upper_Subordinates_Actual_Strength', 'HG_Upper_Subordinates_Sanctioned_Strength']
Preview:
Area_Name	Year	HG_Lower_Subordinates_Actual_Strength	HG_Lower_Subordinates_Sanctioned_Strength	HG_Officers_Actual_Strength	HG_Officers_Sanctioned_Strength	HG_Upper_Subordinates_Actual_Strength	HG_Upper_Subordinates_Sanctioned_Strength
0	Gujarat	2001	39236	45595	104	155	1366	1568
1	Gujarat	2002	40098	43630	105	150	1350	1500
2	Gujarat	2003	39834	43630	102	150	1283	1500
3	Gujarat	2004	36740	43630	82	150	1199	1500
4	Gujarat	2005	39123	43630	75	150	1159	1500
........................................

📄 File: 38_Unidentified_dead_bodies_recovered_and_inquest_conducted.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Unidentified_Dead_bodies_Recovered_Inquest_Conducted']
Preview:
Area_Name	Year	Unidentified_Dead_bodies_Recovered_Inquest_Conducted
0	Andhra Pradesh	2001	5290
1	Arunachal Pradesh	2001	0
2	Assam	2001	14
3	Bihar	2001	1438
4	Chandigarh	2001	18
........................................

📄 File: 41_Escapes_from_police_custody.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'EPC_Cases_Cases_Acquitted', 'EPC_Cases_Cases_Convicted', 'EPC_Cases_Cases_Pending_for_Trial', 'EPC_Cases_Registered', 'EPC_Cases_Trial_Completed', 'EPC_Escapees_Re_Arrested_from_Lockup', 'EPC_Escapees_Re_Arrested_from_Others', 'EPC_FR_Submitted', 'EPC_Persons_Awarded_more_than_3_Years_Imprisonment', 'EPC_Persons_Awarded_upto_3_Years_Imprisonment', 'EPC_Persons_Cases_Acquitted', 'EPC_Persons_Cases_Convicted', 'EPC_Persons_Cases_Pending_for_Trial', 'EPC_Persons_Chargesheeted_for_Escape', 'EPC_Persons_Escaped', 'EPC_Persons_Escaped_from_Lockup', 'EPC_Persons_Escaped_Outside_the_Lockup', 'EPC_Persons_Escaped_Total', 'EPC_Persons_Trial_Completed']
Preview:
Area_Name	Year	EPC_Cases_Cases_Acquitted	EPC_Cases_Cases_Convicted	EPC_Cases_Cases_Pending_for_Trial	EPC_Cases_Registered	EPC_Cases_Trial_Completed	EPC_Escapees_Re_Arrested_from_Lockup	EPC_Escapees_Re_Arrested_from_Others	EPC_FR_Submitted	...	EPC_Persons_Awarded_upto_3_Years_Imprisonment	EPC_Persons_Cases_Acquitted	EPC_Persons_Cases_Convicted	EPC_Persons_Cases_Pending_for_Trial	EPC_Persons_Chargesheeted_for_Escape	EPC_Persons_Escaped	EPC_Persons_Escaped_from_Lockup	EPC_Persons_Escaped_Outside_the_Lockup	EPC_Persons_Escaped_Total	EPC_Persons_Trial_Completed
0	Jharkhand	2005	235	66	1853	17	301	1747	7	188	...	2	671	236	3238	1252	12	5	7	12	907
1	Assam	2006	30	24	19	81	54	21	3	19	...	8	27	14	19	15	99	11	88	99	41
2	Andhra Pradesh	2009	68	22	38	96	90	13	51	18	...	2	146	32	30	45	96	8	88	96	178
3	Haryana	2006	7	20	76	33	27	7	26	9	...	8	15	26	172	21	36	8	28	36	41
4	Assam	2005	30	19	15	70	49	17	1	16	...	6	22	12	16	12	88	10	78	88	34
5 rows × 21 columns

........................................

📄 File: 42_District_wise_crimes_committed_against_women_2001_2012.csv (0.42 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Rape', 'Kidnapping and Abduction', 'Dowry Deaths', 'Assault on women with intent to outrage her modesty', 'Insult to modesty of Women', 'Cruelty by Husband or his Relatives', 'Importation of Girls']
Preview:
STATE/UT	DISTRICT	Year	Rape	Kidnapping and Abduction	Dowry Deaths	Assault on women with intent to outrage her modesty	Insult to modesty of Women	Cruelty by Husband or his Relatives	Importation of Girls
0	ANDHRA PRADESH	ADILABAD	2001	50	30	16	149	34	175	0
1	ANDHRA PRADESH	ANANTAPUR	2001	23	30	7	118	24	154	0
2	ANDHRA PRADESH	CHITTOOR	2001	27	34	14	112	83	186	0
3	ANDHRA PRADESH	CUDDAPAH	2001	20	20	17	126	38	57	0
4	ANDHRA PRADESH	EAST GODAVARI	2001	23	26	12	109	58	247	0
........................................

📄 File: 42_District_wise_crimes_committed_against_women_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Rape', 'Kidnapping and Abduction', 'Dowry Deaths', 'Assault on women with intent to outrage her modesty', 'Insult to modesty of Women', 'Cruelty by Husband or his Relatives', 'Importation of Girls']
Preview:
STATE/UT	DISTRICT	Year	Rape	Kidnapping and Abduction	Dowry Deaths	Assault on women with intent to outrage her modesty	Insult to modesty of Women	Cruelty by Husband or his Relatives	Importation of Girls
0	Andhra Pradesh	ADILABAD	2013	61	47	12	197	138	464	0
1	Andhra Pradesh	ANANTAPUR	2013	28	84	23	337	43	161	0
2	Andhra Pradesh	CHITTOOR	2013	31	27	13	119	84	435	0
3	Andhra Pradesh	CUDDAPAH	2013	19	50	9	318	163	207	0
4	Andhra Pradesh	CYBERABAD	2013	138	129	43	350	338	1526	0
........................................

📄 File: 42_District_wise_crimes_committed_against_women_2014.csv (0.13 MB)
Features: ['States/UTs', 'District', 'Year', 'Rape', 'Custodial Rape', 'Custodial_Gang Rape', 'Custodial_Other Rape', 'Rape other than Custodial', 'Rape_Gang Rape', 'Rape_Others', 'Attempt to commit Rape', 'Kidnapping & Abduction_Total', 'Kidnaping & Abduction', 'Kidnaping & Abduction in order to Murder', 'Kidnapping for Ransom', 'Kidnapping & Abduction of Women to compel her for marriage', 'Kidnaping & Abduction_Others', 'Dowry Deaths', 'Assault on Women with intent to outrage her Modesty_Total', 'Sexual Harassment', 'Assault on women with intent to Disrobe', 'Voyeurism', 'Stalking', 'Others', 'Insult to the Modesty of Women_Total', 'At Office premises', 'In places related to work', 'In Public Transport system', 'In other Places', 'Cruelty by Husband or his Relatives', 'Importation of Girls from Foreign Country', 'Murder', 'Attempt to commit Murder', 'Culpable Homicide not amounting to Murder', 'Attempt to commit Culpable Homicide', 'Grievous Hurt', 'Hurt', 'Acid attack', 'Attempt to Acid Attack', 'Deaths caused with intent to cause miscarriage', 'Causing miscarriage without consent of women', 'Dacoity_Total', 'Dacoity with Murder', 'Other Dacoity', 'Robbery', 'Arson', 'HumanTrafficking', 'Abetment of Suicides of Women', 'UnNatural Offences', 'Other IPC Crimes', 'Dowry Prohibition Act, 1961', 'Indecent Representation of Women (P) Act, 1986', 'Commission of Sati Prevention Act, 1987', 'Protection of Women from Domestic Violence Act, 2005', 'Immoral Traffic Prevention Act', 'ITP Under Section 5', 'ITP Under Section 6', 'ITP Under Section 7', 'ITP Under Section 8', 'ITP Under Other Sections', 'Other SLL Crimes against Women', 'Total Crimes against Women']
Preview:
States/UTs	District	Year	Rape	Custodial Rape	Custodial_Gang Rape	Custodial_Other Rape	Rape other than Custodial	Rape_Gang Rape	Rape_Others	...	Commission of Sati Prevention Act, 1987	Protection of Women from Domestic Violence Act, 2005	Immoral Traffic Prevention Act	ITP Under Section 5	ITP Under Section 6	ITP Under Section 7	ITP Under Section 8	ITP Under Other Sections	Other SLL Crimes against Women	Total Crimes against Women
0	Andhra Pradesh	Anantapur	2014	35	0	0	0	35	0	35	...	0	0	0	0	0	0	0	0	0	1097
1	Andhra Pradesh	Chittoor	2014	32	0	0	0	32	1	31	...	0	0	4	4	0	0	0	0	0	607
2	Andhra Pradesh	Cuddapah	2014	28	0	0	0	28	0	28	...	0	0	5	0	0	0	0	5	0	609
3	Andhra Pradesh	East Godavari	2014	85	0	0	0	85	0	85	...	0	0	16	0	0	0	0	16	0	1277
4	Andhra Pradesh	Guntakal Railway	2014	0	0	0	0	0	0	0	...	0	0	0	0	0	0	0	0	0	4
5 rows × 62 columns

........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/crime/crime/crime
----------------------------------------------------------------------

📄 File: 01_District_wise_crimes_committed_IPC_2001_2012.csv (0.97 MB)
Features: ['STATE/UT', 'DISTRICT', 'YEAR', 'MURDER', 'ATTEMPT TO MURDER', 'CULPABLE HOMICIDE NOT AMOUNTING TO MURDER', 'RAPE', 'CUSTODIAL RAPE', 'OTHER RAPE', 'KIDNAPPING & ABDUCTION', 'KIDNAPPING AND ABDUCTION OF WOMEN AND GIRLS', 'KIDNAPPING AND ABDUCTION OF OTHERS', 'DACOITY', 'PREPARATION AND ASSEMBLY FOR DACOITY', 'ROBBERY', 'BURGLARY', 'THEFT', 'AUTO THEFT', 'OTHER THEFT', 'RIOTS', 'CRIMINAL BREACH OF TRUST', 'CHEATING', 'COUNTERFIETING', 'ARSON', 'HURT/GREVIOUS HURT', 'DOWRY DEATHS', 'ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY', 'INSULT TO MODESTY OF WOMEN', 'CRUELTY BY HUSBAND OR HIS RELATIVES', 'IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES', 'CAUSING DEATH BY NEGLIGENCE', 'OTHER IPC CRIMES', 'TOTAL IPC CRIMES']
Preview:
STATE/UT	DISTRICT	YEAR	MURDER	ATTEMPT TO MURDER	CULPABLE HOMICIDE NOT AMOUNTING TO MURDER	RAPE	CUSTODIAL RAPE	OTHER RAPE	KIDNAPPING & ABDUCTION	...	ARSON	HURT/GREVIOUS HURT	DOWRY DEATHS	ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY	INSULT TO MODESTY OF WOMEN	CRUELTY BY HUSBAND OR HIS RELATIVES	IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES	CAUSING DEATH BY NEGLIGENCE	OTHER IPC CRIMES	TOTAL IPC CRIMES
0	ANDHRA PRADESH	ADILABAD	2001	101	60	17	50	0	50	46	...	30	1131	16	149	34	175	0	181	1518	4154
1	ANDHRA PRADESH	ANANTAPUR	2001	151	125	1	23	0	23	53	...	69	1543	7	118	24	154	0	270	754	4125
2	ANDHRA PRADESH	CHITTOOR	2001	101	57	2	27	0	27	59	...	38	2088	14	112	83	186	0	404	1262	5818
3	ANDHRA PRADESH	CUDDAPAH	2001	80	53	1	20	0	20	25	...	23	795	17	126	38	57	0	233	1181	3140
4	ANDHRA PRADESH	EAST GODAVARI	2001	82	67	1	23	0	23	49	...	41	1244	12	109	58	247	0	431	2313	6507
5 rows × 33 columns

........................................

📄 File: 01_District_wise_crimes_committed_IPC_2013.csv (0.09 MB)
Features: ['STATE/UT', 'DISTRICT', 'YEAR', 'MURDER', 'ATTEMPT TO MURDER', 'CULPABLE HOMICIDE NOT AMOUNTING TO MURDER', 'RAPE', 'CUSTODIAL RAPE', 'OTHER RAPE', 'KIDNAPPING & ABDUCTION', 'KIDNAPPING AND ABDUCTION OF WOMEN AND GIRLS', 'KIDNAPPING AND ABDUCTION OF OTHERS', 'DACOITY', 'PREPARATION AND ASSEMBLY FOR DACOITY', 'ROBBERY', 'BURGLARY', 'THEFT', 'AUTO THEFT', 'OTHER THEFT', 'RIOTS', 'CRIMINAL BREACH OF TRUST', 'CHEATING', 'COUNTERFIETING', 'ARSON', 'HURT/GREVIOUS HURT', 'DOWRY DEATHS', 'ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY', 'INSULT TO MODESTY OF WOMEN', 'CRUELTY BY HUSBAND OR HIS RELATIVES', 'IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES', 'CAUSING DEATH BY NEGLIGENCE', 'OTHER IPC CRIMES', 'TOTAL IPC CRIMES']
Preview:
STATE/UT	DISTRICT	YEAR	MURDER	ATTEMPT TO MURDER	CULPABLE HOMICIDE NOT AMOUNTING TO MURDER	RAPE	CUSTODIAL RAPE	OTHER RAPE	KIDNAPPING & ABDUCTION	...	ARSON	HURT/GREVIOUS HURT	DOWRY DEATHS	ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY	INSULT TO MODESTY OF WOMEN	CRUELTY BY HUSBAND OR HIS RELATIVES	IMPORTATION OF GIRLS FROM FOREIGN COUNTRIES	CAUSING DEATH BY NEGLIGENCE	OTHER IPC CRIMES	TOTAL IPC CRIMES
0	Andhra Pradesh	ADILABAD	2013	96	72	13	61	0	61	65	...	30	2394	12	197	138	464	0	376	1390	6381
1	Andhra Pradesh	ANANTAPUR	2013	156	149	3	28	0	28	110	...	29	2537	23	337	43	161	0	573	1634	6913
2	Andhra Pradesh	CHITTOOR	2013	72	61	2	31	0	31	52	...	18	937	13	119	84	435	0	546	2239	5610
3	Andhra Pradesh	CUDDAPAH	2013	93	107	7	19	0	19	84	...	34	2310	9	318	163	207	0	464	1741	7048
4	Andhra Pradesh	CYBERABAD	2013	162	123	16	138	0	138	192	...	40	4284	43	350	338	1526	0	1104	3139	19992
5 rows × 33 columns

........................................

📄 File: 01_District_wise_crimes_committed_IPC_2014.csv (0.20 MB)
Features: ['States/UTs', 'District', 'Year', 'Murder', 'Attempt to commit Murder', 'Culpable Homicide not amounting to Murder', 'Attempt to commit Culpable Homicide', 'Rape', 'Custodial Rape', 'Custodial_Gang Rape', 'Custodial_Other Rape', 'Rape other than Custodial', 'Rape_Gang Rape', 'Rape_Others', 'Attempt to commit Rape', 'Kidnapping & Abduction_Total', 'Kidnapping & Abduction', 'Kidnapping & Abduction in order to Murder', 'Kidnapping for Ransom', 'Kidnapping & Abduction of Women to compel her for marriage', 'Other Kidnapping', 'Dacoity', 'Dacoity with Murder', 'Other Dacoity', 'Making Preparation and Assembly for committing Dacoity', 'Robbery', 'Criminal Trespass/Burglary', 'Criminal Trespass or Burglary', 'House Trespass & House Breaking', 'Theft', 'Auto Theft', 'Other Thefts', 'Unlawful Assembly', 'Riots', 'Riots_Communal', 'Riots_Industrial', 'Riots_Political', 'Riots_Caste Conflict', 'Riots_SC/STs Vs Non-SCs/STs', 'Riots_Other Caste Conflict', 'Riots_Agrarian', 'Riots_Students', 'Riots_Sectarian', 'Riots_Others', 'Criminal Breach of Trust', 'Cheating', 'Forgery', 'Counterfeiting', 'Counterfeit Offences related to Counterfeit Coin', 'Counterfeiting Government Stamp', 'Counterfeit currency & Bank notes', 'Counterfeiting currency notes/Bank notes', 'Using forged or counterfeiting currency/Bank notes', 'Possession of forged or counterfeiting currency/Bank notes', 'Making or Possessing materials for forged currency/Bank notes', 'Making or Using documents resembling currency', 'Arson', 'Grievous Hurt', 'Hurt', 'Acid attack', 'Attempt to Acid Attack', 'Dowry Deaths', 'Assault on Women with intent to outrage her Modesty', 'Sexual Harassment', 'Assault or use of criminal force to women with intent to Disrobe', 'Voyeurism', 'Stalking', 'Other Assault on Women', 'Insult to the Modesty of Women', 'At Office premises', 'Other places related to work', 'In Public Transport system', 'Places other than 231, 232 & 233', 'Cruelty by Husband or his Relatives', 'Importation of Girls from Foreign Country', 'Causing Death by Negligence', 'Deaths due to negligent driving/act', 'Deaths due to Other Causes', 'Offences against State', 'Sedition', 'Other offences against State', 'Offences promoting enmity between different groups', 'Promoting enmity between different groups', 'Imputation, assertions prejudicial to national integration', 'Extortion', 'Disclosure of Identity of Victims', 'Incidence of Rash Driving', 'HumanTrafficking', 'Unnatural Offence', 'Other IPC crimes', 'Total Cognizable IPC crimes']
Preview:
States/UTs	District	Year	Murder	Attempt to commit Murder	Culpable Homicide not amounting to Murder	Attempt to commit Culpable Homicide	Rape	Custodial Rape	Custodial_Gang Rape	...	Offences promoting enmity between different groups	Promoting enmity between different groups	Imputation, assertions prejudicial to national integration	Extortion	Disclosure of Identity of Victims	Incidence of Rash Driving	HumanTrafficking	Unnatural Offence	Other IPC crimes	Total Cognizable IPC crimes
0	Andhra Pradesh	Anantapur	2014	134	171	8	0	35	0	0	...	0	0	0	0	0	1038	0	0	3800	8376
1	Andhra Pradesh	Chittoor	2014	84	170	2	0	32	0	0	...	0	0	0	19	0	249	0	0	2567	5374
2	Andhra Pradesh	Cuddapah	2014	80	162	1	0	28	0	0	...	0	0	0	0	0	948	0	0	2604	5803
3	Andhra Pradesh	East Godavari	2014	64	84	2	0	85	0	0	...	0	0	0	32	0	39	0	0	3791	7630
4	Andhra Pradesh	Guntakal Railway	2014	14	4	0	0	0	0	0	...	0	0	0	0	0	1	0	0	37	490
5 rows × 91 columns

........................................

📄 File: 02_01_District_wise_crimes_committed_against_SC_2001_2012.csv (0.44 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping and Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Prevention of atrocities (POA) Act', 'Protection of Civil Rights (PCR) Act', 'Other Crimes Against SCs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping and Abduction	Dacoity	Robbery	Arson	Hurt	Prevention of atrocities (POA) Act	Protection of Civil Rights (PCR) Act	Other Crimes Against SCs
0	ANDHRA PRADESH	ADILABAD	2001	0	1	4	0	0	0	3	0	15	32
1	ANDHRA PRADESH	ANANTAPUR	2001	0	4	0	0	0	0	49	21	0	53
2	ANDHRA PRADESH	CHITTOOR	2001	3	3	0	0	0	0	38	36	0	34
3	ANDHRA PRADESH	CUDDAPAH	2001	0	3	0	0	0	0	20	52	0	25
4	ANDHRA PRADESH	EAST GODAVARI	2001	1	3	0	0	0	0	3	12	63	7
........................................

📄 File: 02_01_District_wise_crimes_committed_against_SC_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping and Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Protection of Civil Rights (PCR) Act', 'Prevention of atrocities (POA) Act', 'Other Crimes Against SCs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping and Abduction	Dacoity	Robbery	Arson	Hurt	Protection of Civil Rights (PCR) Act	Prevention of atrocities (POA) Act	Other Crimes Against SCs
0	Andhra Pradesh	ADILABAD	2013	2	3	0	0	0	0	8	0	15	42
1	Andhra Pradesh	ANANTAPUR	2013	2	4	0	0	0	0	37	0	18	56
2	Andhra Pradesh	CHITTOOR	2013	2	3	0	0	0	1	27	0	9	55
3	Andhra Pradesh	CUDDAPAH	2013	2	2	0	0	0	0	78	0	22	72
4	Andhra Pradesh	CYBERABAD	2013	2	8	0	0	0	0	15	1	61	58
........................................

📄 File: 02_01_District_wise_crimes_committed_against_SC_2014.csv (0.13 MB)
Features: ['States/UTs', 'District', 'Year', 'Protection of Civil Rights Act, 1955', 'POA_Murder', 'POA_Attempt to commit Murder', 'POA_Rape', 'POA_Attempt to commit Rape', 'POA_Assault on women with intent to outrage her Modesty', 'POA_Sexual Harassment', 'POA_Assault on women with intent to Disrobe', 'POA_Voyeurism', 'POA_Stalking', 'POA_Other Sexual Harassment', 'POA_Insult to the Modesty of women', 'POA_Kidnapping & Abduction_GrandTotal', 'POA_Kidnaping & Abduction_Total', 'POA_Kidnaping & Abduction in order to Murder', 'POA_Kidnapping for Ransom', 'POA_Kidnapping & Abduction of Women to compel her for marriage', 'POA_Other Kidnapping', 'POA_Dacoity', 'POA_Dacoity with Murder', 'POA_Other Dacoity', 'POA_Robbery', 'POA_Arson', 'POA_Grievous Hurt', 'POA_Hurt', 'POA_Acid attack', 'POA_Attempt to Acid Attack', 'POA_Riots', 'POA_Other IPC crimes', 'POA_SC / ST (Prevention of Atrocities) Act only', 'Total of SC/ST (Prevention of Atrocities) Act ,1989', 'IPC_Murder', 'IPC_Attempt to commit Murder', 'IPC_Rape', 'IPC_Attempt to commit Rape', 'IPC_Assault on women with intent to outrage her Modesty', 'IPC_Sexual Harassment', 'IPC_Assault on women with intent to Disrobe', 'IPC_Voyeurism', 'IPC_Stalking', 'IPC_Other Sexual Harassment', 'IPC_Insult to the Modesty of women', 'IPC_Kidnapping & Abduction', 'IPC_Kidnaping & Abduction', 'IPC_Kidnaping & Abduction in order to Murder', 'IPC_Kidnapping for Ransom', 'IPC_Kidnapping & Abduction of Women to compel her for marriage', 'IPC_Other Kidnapping', 'IPC_Dacoity', 'IPC_Dacoity with Murder', 'IPC_Other Dacoity', 'IPC_Robbery', 'IPC_Arson', 'IPC_Grievous Hurt', 'IPC_Hurt', 'IPC_Acid attack', 'IPC_Attempt to Acid Attack', 'IPC_Riots', 'IPC_Other IPC crimes', 'Total IPC Crimes against SCs', 'Manual Scavengers and Construction of Dry Latrines (P) Act, 1993', 'Other SLL Crime against SCs', 'Total crimes against SCs']
Preview:
States/UTs	District	Year	Protection of Civil Rights Act, 1955	POA_Murder	POA_Attempt to commit Murder	POA_Rape	POA_Attempt to commit Rape	POA_Assault on women with intent to outrage her Modesty	POA_Sexual Harassment	...	IPC_Grievous Hurt	IPC_Hurt	IPC_Acid attack	IPC_Attempt to Acid Attack	IPC_Riots	IPC_Other IPC crimes	Total IPC Crimes against SCs	Manual Scavengers and Construction of Dry Latrines (P) Act, 1993	Other SLL Crime against SCs	Total crimes against SCs
0	Andhra Pradesh	Anantapur	2014	0	3	0	1	0	5	0	...	0	0	0	0	0	0	0	0	0	170
1	Andhra Pradesh	Chittoor	2014	0	2	3	1	0	5	0	...	0	0	0	0	0	0	0	0	0	118
2	Andhra Pradesh	Cuddapah	2014	0	4	5	5	1	3	0	...	0	0	0	0	0	0	0	0	0	262
3	Andhra Pradesh	East Godavari	2014	6	0	2	4	0	22	8	...	0	0	0	0	0	0	1	0	0	178
4	Andhra Pradesh	Guntakal Railway	2014	0	0	0	0	0	0	0	...	0	0	0	0	0	0	0	0	0	0
5 rows × 66 columns

........................................

📄 File: 02_District_wise_crimes_committed_against_ST_2001_2012.csv (0.43 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Protection of Civil Rights (PCR) Act', 'Prevention of atrocities (POA) Act', 'Other Crimes Against STs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping Abduction	Dacoity	Robbery	Arson	Hurt	Protection of Civil Rights (PCR) Act	Prevention of atrocities (POA) Act	Other Crimes Against STs
0	ANDHRA PRADESH	ADILABAD	2001	0	1	2	0	0	0	2	0	0	13
1	ANDHRA PRADESH	ANANTAPUR	2001	0	0	0	0	0	0	7	0	1	6
2	ANDHRA PRADESH	CHITTOOR	2001	0	0	0	0	0	0	2	0	0	0
3	ANDHRA PRADESH	CUDDAPAH	2001	0	0	0	0	0	0	2	0	2	0
4	ANDHRA PRADESH	EAST GODAVARI	2001	0	0	0	0	0	0	0	0	0	14
........................................

📄 File: 02_District_wise_crimes_committed_against_ST_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping Abduction', 'Dacoity', 'Robbery', 'Arson', 'Hurt', 'Protection of Civil Rights (PCR) Act', 'Prevention of atrocities (POA) Act', 'Other Crimes Against STs']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping Abduction	Dacoity	Robbery	Arson	Hurt	Protection of Civil Rights (PCR) Act	Prevention of atrocities (POA) Act	Other Crimes Against STs
0	Andhra Pradesh	ADILABAD	2013	0	7	0	0	0	0	2	0	6	25
1	Andhra Pradesh	ANANTAPUR	2013	0	0	0	0	0	0	3	0	1	9
2	Andhra Pradesh	CHITTOOR	2013	0	0	0	0	0	0	0	0	0	0
3	Andhra Pradesh	CUDDAPAH	2013	0	1	0	0	0	0	17	0	2	10
4	Andhra Pradesh	CYBERABAD	2013	1	2	0	0	0	0	1	0	19	18
........................................

📄 File: 02_District_wise_crimes_committed_against_ST_2014.csv (0.12 MB)
Features: ['States/UTs', 'District', 'Year', 'Protection of Civil Rights Act, 1955', 'POA_Murder', 'POA_Attempt to commit Murder', 'POA_Rape', 'POA_Attempt to commit Rape', 'POA_Assault on women with intent to outrage her Modesty', 'POA_Sexual Harassment', 'POA_Assault on women with intent to Disrobe', 'POA_Voyeurism', 'POA_Stalking', 'POA_Other Sexual Harassment', 'POA_Insult to the Modesty of women', 'POA_Kidnapping & Abduction_GrandTotal', 'POA_Kidnaping & Abduction_Total', 'POA_Kidnaping & Abduction in order to Murder', 'POA_Kidnapping for Ransom', 'POA_Kidnapping & Abduction of Women to compel her for marriage', 'POA_Other Kidnapping', 'POA_Dacoity', 'POA_Dacoity with Murder', 'POA_Other Dacoity', 'POA_Robbery', 'POA_Arson', 'POA_Grievous Hurt', 'POA_Hurt', 'POA_Acid attack', 'POA_Attempt to Acid Attack', 'POA_Riots', 'POA_Other IPC crimes', 'POA_SC / ST (Prevention of Atrocities) Act only', 'Total of SC/ST (Prevention of Atrocities) Act ,1989', 'IPC_Murder', 'IPC_Attempt to commit Murder', 'IPC_Rape', 'IPC_Attempt to commit Rape', 'IPC_Assault on women with intent to outrage her Modesty', 'IPC_Sexual Harassment', 'IPC_Assault on women with intent to Disrobe', 'IPC_Voyeurism', 'IPC_Stalking', 'IPC_Other Sexual Harassment', 'IPC_Insult to the Modesty of women', 'IPC_Kidnapping & Abduction', 'IPC_Kidnaping & Abduction', 'IPC_Kidnaping & Abduction in order to Murder', 'IPC_Kidnapping for Ransom', 'IPC_Kidnapping & Abduction of Women to compel her for marriage', 'IPC_Other Kidnapping', 'IPC_Dacoity', 'IPC_Dacoity with Murder', 'IPC_Other Dacoity', 'IPC_Robbery', 'IPC_Arson', 'IPC_Grievous Hurt', 'IPC_Hurt', 'IPC_Acid attack', 'IPC_Attempt to Acid Attack', 'IPC_Riots', 'IPC_Other IPC crimes', 'Total IPC Crimes against STs', 'Manual Scavengers and Construction of Dry Latrines (P) Act, 1993', 'Other SLL Crime against STs', 'Total crimes against STs']
Preview:
States/UTs	District	Year	Protection of Civil Rights Act, 1955	POA_Murder	POA_Attempt to commit Murder	POA_Rape	POA_Attempt to commit Rape	POA_Assault on women with intent to outrage her Modesty	POA_Sexual Harassment	...	IPC_Grievous Hurt	IPC_Hurt	IPC_Acid attack	IPC_Attempt to Acid Attack	IPC_Riots	IPC_Other IPC crimes	Total IPC Crimes against STs	Manual Scavengers and Construction of Dry Latrines (P) Act, 1993	Other SLL Crime against STs	Total crimes against STs
0	Andhra Pradesh	Anantapur	2014	0	1	2	0	1	2	1	...	0	0	0	0	0	0	0	0	0	23
1	Andhra Pradesh	Chittoor	2014	0	0	0	0	0	1	0	...	0	0	0	0	0	0	0	0	0	17
2	Andhra Pradesh	Cuddapah	2014	0	1	0	1	0	0	0	...	0	0	0	0	0	0	0	0	0	33
3	Andhra Pradesh	East Godavari	2014	0	1	0	7	0	3	0	...	0	0	0	0	0	0	0	0	0	35
4	Andhra Pradesh	Guntakal Railway	2014	0	0	0	0	0	0	0	...	0	0	0	0	0	0	0	0	0	0
5 rows × 66 columns

........................................

📄 File: 03_District_wise_crimes_committed_against_children_2001_2012.csv (0.48 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Murder', 'Rape', 'Kidnapping and Abduction', 'Foeticide', 'Abetment of suicide', 'Exposure and abandonment', 'Procuration of minor girls', 'Buying of girls for prostitution', 'Selling of girls for prostitution', 'Prohibition of child marriage act', 'Other Crimes', 'Total']
Preview:
STATE/UT	DISTRICT	Year	Murder	Rape	Kidnapping and Abduction	Foeticide	Abetment of suicide	Exposure and abandonment	Procuration of minor girls	Buying of girls for prostitution	Selling of girls for prostitution	Prohibition of child marriage act	Other Crimes	Total
0	ANDHRA PRADESH	ADILABAD	2001	0	0	0	0	0	0	0	0	0	0	0	0
1	ANDHRA PRADESH	ANANTAPUR	2001	19	12	29	0	6	0	0	0	0	0	0	66
2	ANDHRA PRADESH	CHITTOOR	2001	0	0	0	0	0	0	0	0	0	0	0	0
3	ANDHRA PRADESH	CUDDAPAH	2001	0	0	0	0	0	0	0	0	0	0	0	0
4	ANDHRA PRADESH	EAST GODAVARI	2001	0	0	0	0	0	0	0	0	0	0	0	0
........................................

📄 File: 03_District_wise_crimes_committed_against_children_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Infanticid', 'Other murder', 'Rape', 'Kidnapping and Abduction', 'Foeticide', 'Abetment of suicide', 'Exposure and abandonment', 'Procuration of minor girls', 'Buying of girls for prostitution', 'Selling of girls for prostitution', 'Prohibition of child marriage act', 'Other Crimes', 'Total']
Preview:
STATE/UT	DISTRICT	Year	Infanticid	Other murder	Rape	Kidnapping and Abduction	Foeticide	Abetment of suicide	Exposure and abandonment	Procuration of minor girls	Buying of girls for prostitution	Selling of girls for prostitution	Prohibition of child marriage act	Other Crimes	Total
0	Andhra Pradesh	ADILABAD	2013	0	1	21	9	0	0	0	0	0	0	1	1	33
1	Andhra Pradesh	ANANTAPUR	2013	0	1	15	68	0	3	0	0	0	0	0	0	87
2	Andhra Pradesh	CHITTOOR	2013	0	6	1	0	0	0	0	0	0	0	0	0	7
3	Andhra Pradesh	CUDDAPAH	2013	2	0	14	32	0	0	0	0	0	0	1	0	49
4	Andhra Pradesh	CYBERABAD	2013	1	8	45	69	2	0	2	9	0	0	1	19	156
........................................

📄 File: 03_Persons_arrested_and_their_disposal_by_police_and_court_under_crime_against_children_2012.csv (0.04 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	ANDHRA PRADESH	INFANTICIDE (SECTION 315 IPC)	0	6	0	5	1	4	5	0	5	0	0	0
1	ARUNACHAL PRADESH	INFANTICIDE (SECTION 315 IPC)	0	0	0	0	0	0	0	0	0	0	0	0
2	ASSAM	INFANTICIDE (SECTION 315 IPC)	0	0	0	0	0	0	0	0	0	0	0	0
3	BIHAR	INFANTICIDE (SECTION 315 IPC)	0	2	0	0	2	7	9	0	6	3	1	2
4	CHHATTISGARH	INFANTICIDE (SECTION 315 IPC)	0	5	0	0	5	16	21	0	17	4	2	2
........................................

📄 File: 03_Persons_arrested_and_their_disposal_by_police_and_court_under_crime_against_children_2013.csv (0.03 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	Andhra Pradesh	Abetment of Suicide	0	25	0	7	18	26	44	0	44	0	0	0
1	Arunachal Pradesh	Abetment of Suicide	0	0	0	0	0	0	0	0	0	0	0	0
2	Assam	Abetment of Suicide	2	0	2	0	0	4	4	0	0	4	0	4
3	Bihar	Abetment of Suicide	0	0	0	0	0	0	0	0	0	0	0	0
4	Chhattisgarh	Abetment of Suicide	0	7	0	0	7	18	25	0	19	6	3	3
........................................

📄 File: 03_Persons_arrested_and_their_disposal_by_police_and_court_under_crime_against_children_2014.csv (0.35 MB)
Features: ['States/UTs', 'Crime Head', 'Year', 'Persons in custody during inv stage at beginning of Year_Male', 'Persons in custody during inv stage at beginning of Year_Female', 'Persons in custody during inv stage at beginning of Year_Total', 'Persons on bail during inv stage at beginning of Year_Male', 'Persons on bail during inv stage at beginning of Year_Female', 'Persons on bail during inv stage at beginning of Year_Total', 'Persons arrested during the year_Male', 'Persons arrested during the year_Female', 'Persons arrested during the year_Total', 'Persons released or freed before trial for want of evidence_Male', 'Persons released or freed before trial for want of evidence_Fem', 'Persons released or freed before trial for want of evidence_Tot', 'Persons in custody during inv stage at year end_Male', 'Persons in custody during inv stage at year end_Female', 'Persons in custody during inv stage at year end_Total', 'Persons on Bail during inv stage at year end_Male', 'Persons on Bail during inv stage at Year end_Female', 'Persons on Bail during inv stage at year end_Total', 'Persons charge sheeted_Male', 'Persons charge sheeted_Female', 'Persons charge sheeted_Total', 'Persons in custody during trial stage at begin of year_Male', 'Persons in custody during trial stage at begin of year_Female', 'Persons in custody during trial stage at begin of year_Total', 'Persons on Bail during trial stage at begin of year_Male', 'Persons on Bail during trial stage at begin of year_Female', 'Persons on Bail during trial stage at begin of year_Total', 'Total number of persons under Trial_Male', 'Total number of persons under Trial_Female', 'Total number of persons under Trial_Total', 'Persons against whom cases were compounded by Courts_Male', 'Persons against whom cases were compounded by Courts_Female', 'Persons against whom cases were compounded by Courts_Total', 'Persons against whom cases were withdrawn_Male', 'Persons against whom cases were withdrawn_Female', 'Persons against whom cases were withdrawn_Total', 'Persons in custody during trial stage at Year end_Male', 'Persons in custody during trial stage at Year end_Female', 'Persons in custody during trial stage at Year end_Total', 'Persons on bail during trial stage at Year End_Male', 'Persons on bail during trial stage at Year End_Female', 'Persons on bail during trial stage at Year End_Total', 'Persons whose cases trials were completed during the year_Male', 'Persons whose cases trials were completed during the year_Female', 'Persons whose cases trials were completed during the year_Total', 'Persons convicted_Male', 'Persons convicted_Female', 'Persons convicted_Total', 'Persons acquitted_Male', 'Persons acquitted_Female', 'Persons acquitted_Total', 'Persons Discharged by Court_Male', 'Persons Discharged by Court_Female', 'Persons Discharged by Court_Total']
Preview:
States/UTs	Crime Head	Year	Persons in custody during inv stage at beginning of Year_Male	Persons in custody during inv stage at beginning of Year_Female	Persons in custody during inv stage at beginning of Year_Total	Persons on bail during inv stage at beginning of Year_Male	Persons on bail during inv stage at beginning of Year_Female	Persons on bail during inv stage at beginning of Year_Total	Persons arrested during the year_Male	...	Persons whose cases trials were completed during the year_Total	Persons convicted_Male	Persons convicted_Female	Persons convicted_Total	Persons acquitted_Male	Persons acquitted_Female	Persons acquitted_Total	Persons Discharged by Court_Male	Persons Discharged by Court_Female	Persons Discharged by Court_Total
0	Andhra Pradesh	1 - Murder (Section 302 and 303 IPC)	2014	1	0	1	28	0	28	68	...	33	3	0	3	29	1	30	0	0	0
1	Andhra Pradesh	2 - Infanticide (Section 315 IPC)	2014	0	0	0	2	0	2	3	...	1	0	0	0	1	0	1	0	0	0
2	Andhra Pradesh	3 - Rape	2014	21	0	21	187	0	187	617	...	236	13	0	13	222	1	223	0	0	0
3	Andhra Pradesh	4 - Assault on women with intent to outrage he...	2014	0	0	0	79	4	83	281	...	69	7	0	7	62	0	62	0	0	0
4	Andhra Pradesh	4.1 - Sexual Harassment (Section 354A IPC)	2014	0	0	0	6	0	6	69	...	8	0	0	0	8	0	8	0	0	0
5 rows × 57 columns

........................................

📄 File: 04_01_Person_arrested_and_their_disposal_by_police_and_court_SLL_crime_2012.csv (0.09 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	ANDHRA PRADESH	ARMS ACT, 1959	301	549	0	295	555	1153	1708	0	1324	384	46	338
1	ARUNACHAL PRADESH	ARMS ACT, 1959	3	14	0	5	12	194	206	0	199	7	4	3
2	ASSAM	ARMS ACT, 1959	1705	575	114	1934	232	2483	2715	0	2498	217	31	186
3	BIHAR	ARMS ACT, 1959	1761	2479	14	1383	2843	26223	29066	0	27108	1958	681	1277
4	CHHATTISGARH	ARMS ACT, 1959	6	914	0	6	914	3869	4783	237	3695	851	236	615
........................................

📄 File: 04_01_Person_arrested_and_their_disposal_by_police_and_court_SLL_crime_2013.csv (0.02 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	Andhra Pradesh	Arson	4	8	0	7	5	35	40	0	38	2	0	2
1	Arunachal Pradesh	Arson	0	0	0	0	0	0	0	0	0	0	0	0
2	Assam	Arson	2	0	2	0	0	6	6	0	0	6	0	6
3	Bihar	Arson	32	73	0	22	83	222	305	0	277	28	0	28
4	Chhattisgarh	Arson	0	1	0	0	1	1	2	0	2	0	0	0
........................................

📄 File: 04_01_Person_arrested_and_their_disposal_by_police_and_court_SLL_crime_2014.csv (0.48 MB)
Features: ['States/UTs', 'Crime Head', 'Year', 'Persons in custody during inv stage at beginning of Year_Male', 'Persons in custody during inv stage at beginning of Year_Female', 'Persons in custody during inv stage at beginning of Year_Total', 'Persons on bail during inv stage at beginning of Year_Male', 'Persons on bail during inv stage at beginning of Year_Female', 'Persons on bail during inv stage at beginning of Year_Total', 'Persons arrested during the year_Male', 'Persons arrested during the year_Female', 'Persons arrested during the year_Total', 'Persons released or freed before trial for want of evidence_Male', 'Persons released or freed before trial for want of evidence_Fem', 'Persons released or freed before trial for want of evidence_Tot', 'Persons in custody during inv stage at year end_Male', 'Persons in custody during inv stage at year end_Female', 'Persons in custody during inv stage at year end_Total', 'Persons on Bail during inv stage at year end_Male', 'Persons on Bail during inv stage at Year end_Female', 'Persons on Bail during inv stage at year end_Total', 'Persons charge sheeted_Male', 'Persons charge sheeted_Female', 'Persons charge sheeted_Total', 'Persons in custody during trial stage at begin of year_Male', 'Persons in custody during trial stage at begin of year_Female', 'Persons in custody during trial stage at begin of year_Total', 'Persons on Bail during trial stage at begin of year_Male', 'Persons on Bail during trial stage at begin of year_Female', 'Persons on Bail during trial stage at begin of year_Total', 'Total number of persons under Trial_Male', 'Total number of persons under Trial_Female', 'Total number of persons under Trial_Total', 'Persons against whom cases were compounded by Courts_Male', 'Persons against whom cases were compounded by Courts_Female', 'Persons against whom cases were compounded by Courts_Total', 'Persons against whom cases were withdrawn_Male', 'Persons against whom cases were withdrawn_Female', 'Persons against whom cases were withdrawn_Total', 'Persons in custody during trial stage at Year end_Male', 'Persons in custody during trial stage at Year end_Female', 'Persons in custody during trial stage at Year end_Total', 'Persons on bail during trial stage at Year End_Male', 'Persons on bail during trial stage at Year End_Female', 'Persons on bail during trial stage at Year End_Total', 'Persons whose cases trials were completed during the year_Male', 'Persons whose cases trials were completed during the year_Female', 'Persons whose cases trials were completed during the year_Total', 'Persons convicted_Male', 'Persons convicted_Female', 'Persons convicted_Total', 'Persons acquitted_Male', 'Persons acquitted_Female', 'Persons acquitted_Total', 'Persons Discharged by Court_Male', 'Persons Discharged by Court_Female', 'Persons Discharged by Court_Total']
Preview:
States/UTs	Crime Head	Year	Persons in custody during inv stage at beginning of Year_Male	Persons in custody during inv stage at beginning of Year_Female	Persons in custody during inv stage at beginning of Year_Total	Persons on bail during inv stage at beginning of Year_Male	Persons on bail during inv stage at beginning of Year_Female	Persons on bail during inv stage at beginning of Year_Total	Persons arrested during the year_Male	...	Persons whose cases trials were completed during the year_Total	Persons convicted_Male	Persons convicted_Female	Persons convicted_Total	Persons acquitted_Male	Persons acquitted_Female	Persons acquitted_Total	Persons Discharged by Court_Male	Persons Discharged by Court_Female	Persons Discharged by Court_Total
0	Andhra Pradesh	1 - Arms Act, 1959	2014	4	0	4	96	0	96	261	...	128	39	0	39	89	0	89	0	0	0
1	Andhra Pradesh	2 - Narcotic Drugs & Psychotropic Substances A...	2014	26	0	26	447	17	464	739	...	243	32	0	32	209	2	211	0	0	0
2	Andhra Pradesh	3 - Gambling Act, 1867	2014	15	0	15	907	0	907	24119	...	21865	21135	0	21135	730	0	730	0	0	0
3	Andhra Pradesh	4 - Excise Act, 1944	2014	103	0	103	877	32	909	5599	...	2142	722	8	730	1314	98	1412	0	0	0
4	Andhra Pradesh	5 - Prohibition Act	2014	31	0	31	286	24	310	1710	...	1024	431	12	443	556	25	581	0	0	0
5 rows × 57 columns

........................................

📄 File: 04_02_Person_arrested_and_their_disposal_by_police_and_court_IPC_crime_2012.csv (0.11 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	ANDHRA PRADESH	MURDER (SECTION 302 IPC)	3263	5509	0	3138	5634	12111	17745	2	13142	4601	754	3847
1	ARUNACHAL PRADESH	MURDER (SECTION 302 IPC)	85	113	28	109	61	1108	1169	0	1161	8	2	6
2	ASSAM	MURDER (SECTION 302 IPC)	4628	1650	466	4756	1056	8040	9096	0	8183	913	308	605
3	BIHAR	MURDER (SECTION 302 IPC)	7459	7198	51	7399	7207	52966	60173	0	54985	5188	1450	3738
4	CHHATTISGARH	MURDER (SECTION 302 IPC)	188	1490	0	158	1520	7803	9323	1221	6661	1441	590	851
........................................

📄 File: 04_02_Person_arrested_and_their_disposal_by_police_and_court_IPC_crime_2013.csv (0.08 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Persons in custody or on bail during the stage of investigation at the beginning of the year', 'Persons arrested during the year', 'Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason', 'Persons in custody or on bail during the stage of investigation at the end of the year', 'Persons in whose cases charge sheets were laid during the year', 'Persons under trial at the beginning of the year', 'Total number of persons under trial during the year', 'Persons against whom cases were compounded or withdrawn', 'Persons in custody or on bail during the stage of trial at the end of the year', 'Persons in whose cases trials were completed during the year', 'Persons convicted', 'Persons acquitted']
Preview:
STATE/UT	CRIME HEAD	Persons in custody or on bail during the stage of investigation at the beginning of the year	Persons arrested during the year	Persons released or freed by Police or Magistrate before trial for want of evidence or any other reason	Persons in custody or on bail during the stage of investigation at the end of the year	Persons in whose cases charge sheets were laid during the year	Persons under trial at the beginning of the year	Total number of persons under trial during the year	Persons against whom cases were compounded or withdrawn	Persons in custody or on bail during the stage of trial at the end of the year	Persons in whose cases trials were completed during the year	Persons convicted	Persons acquitted
0	Andhra Pradesh	Arson	411	820	13	404	814	1878	2692	87	1815	790	63	727
1	Arunachal Pradesh	Arson	9	17	3	12	11	124	135	0	135	0	0	0
2	Assam	Arson	1214	771	405	1205	375	1674	2049	0	1795	254	29	225
3	Bihar	Arson	807	1342	89	653	1407	5821	7228	188	6033	1007	100	907
4	Chhattisgarh	Arson	0	252	0	0	252	1036	1288	17	979	292	49	243
........................................

📄 File: 04_02_Person_arrested_and_their_disposal_by_police_and_court_IPC_crime_2014.csv (0.68 MB)
Features: ['States/UTs', 'Crime Head', 'Year', 'Persons in custody during inv stage at beginning of Year_Male', 'Persons in custody during inv stage at beginning of Year_Female', 'Persons in custody during inv stage at beginning of Year_Total', 'Persons on bail during inv stage at beginning of Year_Male', 'Persons on bail during inv stage at beginning of Year_Female', 'Persons on bail during inv stage at beginning of Year_Total', 'Persons arrested during the year_Male', 'Persons arrested during the year_Female', 'Persons arrested during the year_Total', 'Persons released or freed before trial for want of evidence_Male', 'Persons released or freed before trial for want of evidence_Fem', 'Persons released or freed before trial for want of evidence_Tot', 'Persons in custody during inv stage at year end_Male', 'Persons in custody during inv stage at year end_Female', 'Persons in custody during inv stage at year end_Total', 'Persons on Bail during inv stage at year end_Male', 'Persons on Bail during inv stage at Year end_Female', 'Persons on Bail during inv stage at year end_Total', 'Persons charge sheeted_Male', 'Persons charge sheeted_Female', 'Persons charge sheeted_Total', 'Persons in custody during trial stage at begin of year_Male', 'Persons in custody during trial stage at begin of year_Female', 'Persons in custody during trial stage at begin of year_Total', 'Persons on Bail during trial stage at begin of year_Male', 'Persons on Bail during trial stage at begin of year_Female', 'Persons on Bail during trial stage at begin of year_Total', 'Total number of persons under Trial_Male', 'Total number of persons under Trial_Female', 'Total number of persons under Trial_Total', 'Persons against whom cases were compounded by Courts_Male', 'Persons against whom cases were compounded by Courts_Female', 'Persons against whom cases were compounded by Courts_Total', 'Persons against whom cases were withdrawn_Male', 'Persons against whom cases were withdrawn_Female', 'Persons against whom cases were withdrawn_Total', 'Persons in custody during trial stage at Year end_Male', 'Persons in custody during trial stage at Year end_Female', 'Persons in custody during trial stage at Year end_Total', 'Persons on bail during trial stage at Year End_Male', 'Persons on bail during trial stage at Year End_Female', 'Persons on bail during trial stage at Year End_Total', 'Persons whose cases trials were completed during the year_Male', 'Persons whose cases trials were completed during the year_Female', 'Persons whose cases trials were completed during the year_Total', 'Persons convicted_Male', 'Persons convicted_Female', 'Persons convicted_Total', 'Persons acquitted_Male', 'Persons acquitted_Female', 'Persons acquitted_Total', 'Persons Discharged by Court_Male', 'Persons Discharged by Court_Female', 'Persons Discharged by Court_Total']
Preview:
States/UTs	Crime Head	Year	Persons in custody during inv stage at beginning of Year_Male	Persons in custody during inv stage at beginning of Year_Female	Persons in custody during inv stage at beginning of Year_Total	Persons on bail during inv stage at beginning of Year_Male	Persons on bail during inv stage at beginning of Year_Female	Persons on bail during inv stage at beginning of Year_Total	Persons arrested during the year_Male	...	Persons whose cases trials were completed during the year_Total	Persons convicted_Male	Persons convicted_Female	Persons convicted_Total	Persons acquitted_Male	Persons acquitted_Female	Persons acquitted_Total	Persons Discharged by Court_Male	Persons Discharged by Court_Female	Persons Discharged by Court_Total
0	Andhra Pradesh	1 - Murder (Section 302 IPC)	2014	281	8	289	1529	125	1654	2111	...	1679	252	18	270	1320	85	1405	4	0	4
1	Andhra Pradesh	2 - Attempt to commit Murder (Section 307 IPC)	2014	152	0	152	1232	155	1387	2578	...	2206	184	2	186	1897	114	2011	9	0	9
2	Andhra Pradesh	3 - Culpable Homicide not amounting to Murder ...	2014	7	0	7	68	2	70	94	...	102	6	0	6	90	6	96	0	0	0
3	Andhra Pradesh	4 - Attempt to commit Culpable Homicide (Secti...	2014	0	0	0	0	0	0	4	...	0	0	0	0	0	0	0	0	0	0
4	Andhra Pradesh	5 - Rape (Section 376 IPC)	2014	71	0	71	586	11	597	1191	...	692	70	0	70	610	12	622	0	0	0
5 rows × 57 columns

........................................

📄 File: 07_01_Persons_arrested_by_sex_and_age_group_IPC_2012.csv (0.10 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	ANDHRA PRADESH	MURDER (SECTION 302 IPC)	65	3	2054	187	1866	216	919	104	85	10	4989	520	5509
1	ARUNACHAL PRADESH	MURDER (SECTION 302 IPC)	0	0	53	0	52	2	6	0	0	0	111	2	113
2	ASSAM	MURDER (SECTION 302 IPC)	38	0	584	23	738	19	238	2	8	0	1606	44	1650
3	BIHAR	MURDER (SECTION 302 IPC)	60	5	2983	108	2462	145	1202	82	147	4	6854	344	7198
4	CHHATTISGARH	MURDER (SECTION 302 IPC)	64	5	560	43	487	46	228	13	36	8	1375	115	1490
........................................

📄 File: 07_01_Persons_arrested_by_sex_and_age_group_IPC_2013.csv (0.07 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	Andhra Pradesh	Arson	4	0	298	11	359	11	116	4	16	1	793	27	820
1	Arunachal Pradesh	Arson	0	0	7	0	10	0	0	0	0	0	17	0	17
2	Assam	Arson	9	0	291	0	421	0	50	0	0	0	771	0	771
3	Bihar	Arson	1	0	687	7	487	7	131	0	22	0	1328	14	1342
4	Chhattisgarh	Arson	2	2	127	4	92	1	22	1	1	0	244	8	252
........................................

📄 File: 07_01_Persons_arrested_by_sex_and_age_group_IPC_2014.csv (0.34 MB)
Features: ['States/UTs', 'Crime Head', 'Year', '18 and above and below 30 years_Male', '18 and above and below 30 years_Female', '18 and above and below 30 years_Total', '30 and above and below 45 years_Male', '30 and above and below 45 years_Female', '30 and above and below 45 years_Total', '45 and above and below 60 years_Male', '45 and above and below 60 years_Female', '45 and above and below 60 years_Total', '60 years and above_Male', '60 years and above_Female', '60 years and above_Total', 'Total Male', 'Total Female', 'Total Persons Arrested by age and Sex']
Preview:
States/UTs	Crime Head	Year	18 and above and below 30 years_Male	18 and above and below 30 years_Female	18 and above and below 30 years_Total	30 and above and below 45 years_Male	30 and above and below 45 years_Female	30 and above and below 45 years_Total	45 and above and below 60 years_Male	45 and above and below 60 years_Female	45 and above and below 60 years_Total	60 years and above_Male	60 years and above_Female	60 years and above_Total	Total Male	Total Female	Total Persons Arrested by age and Sex
0	Andhra Pradesh	1 - Murder (Section 302 IPC)	2014	754	59	813	772	113	885	517	48	565	48	0	48	2091	220	2311
1	Andhra Pradesh	2 - Attempt to commit Murder (Section 307 IPC)	2014	1175	38	1213	920	43	963	448	16	464	22	0	22	2565	97	2662
2	Andhra Pradesh	3 - Culpable Homicide not amounting to Murder ...	2014	16	2	18	64	4	68	13	1	14	0	0	0	93	7	100
3	Andhra Pradesh	4 - Attempt to commit Culpable Homicide (Secti...	2014	0	0	0	2	0	2	2	0	2	0	0	0	4	0	4
4	Andhra Pradesh	5 - Rape (Section 376 IPC)	2014	708	7	715	341	28	369	88	10	98	11	1	12	1148	46	1194
........................................

📄 File: 07_02_Persons_arrested_by_sex_and_age_group_SLL_2012.csv (0.08 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	ANDHRA PRADESH	ARMS ACT	4	0	262	0	231	0	46	0	6	0	549	0	549
1	ARUNACHAL PRADESH	ARMS ACT	0	0	10	0	4	0	0	0	0	0	14	0	14
2	ASSAM	ARMS ACT	2	0	290	2	249	1	31	0	0	0	572	3	575
3	BIHAR	ARMS ACT	25	0	1483	17	788	2	164	0	0	0	2460	19	2479
4	CHHATTISGARH	ARMS ACT	17	0	527	0	312	0	58	0	0	0	914	0	914
........................................

📄 File: 07_02_Persons_arrested_by_sex_and_age_group_SLL_2013.csv (0.07 MB)
Features: ['STATE/UT', 'CRIME HEAD', 'Male Below 18 Years', 'Female Below 18 Years', 'Male Between 18-30 Years', 'Female Between 18-30 Years', 'Male Between 30-45 Years', 'Female Between 30-45 Years', 'Male Between 45-60 Years', 'Female Between 45-60 Years', 'Male Above 60 Years', 'Female Above 60 Years', 'Male Total', 'Female Total', 'Grand Total']
Preview:
STATE/UT	CRIME HEAD	Male Below 18 Years	Female Below 18 Years	Male Between 18-30 Years	Female Between 18-30 Years	Male Between 30-45 Years	Female Between 30-45 Years	Male Between 45-60 Years	Female Between 45-60 Years	Male Above 60 Years	Female Above 60 Years	Male Total	Female Total	Grand Total
0	Andhra Pradesh	Antiquity & Art Treasures Act, 1972	0	0	7	0	16	0	5	1	0	0	28	1	29
1	Arunachal Pradesh	Antiquity & Art Treasures Act, 1972	0	0	0	0	0	0	0	0	0	0	0	0	0
2	Assam	Antiquity & Art Treasures Act, 1972	0	0	0	0	0	0	0	0	0	0	0	0	0
3	Bihar	Antiquity & Art Treasures Act, 1972	0	0	4	0	0	0	0	0	0	0	4	0	4
4	Chhattisgarh	Antiquity & Art Treasures Act, 1972	0	0	0	0	0	0	0	0	0	0	0	0	0
........................................

📄 File: 07_02_Persons_arrested_by_sex_and_age_group_SLL_2014.csv (0.24 MB)
Features: ['States/UTs', 'Crime Head', 'Year', '18 and above and below 30 years_Male', '18 and above and below 30 years_Female', '18 and above and below 30 years_Total', '30 and above and below 45 years_Male', '30 and above and below 45 years_Female', '30 and above and below 45 years_Total', '45 and above and below 60 years_Male', '45 and above and below 60 years_Female', '45 and above and below 60 years_Total', '60 years and above_Male', '60 years and above_Female', '60 years and above_Total', 'Total Male', 'Total Female', 'Total Persons Arrested by age and Sex']
Preview:
States/UTs	Crime Head	Year	18 and above and below 30 years_Male	18 and above and below 30 years_Female	18 and above and below 30 years_Total	30 and above and below 45 years_Male	30 and above and below 45 years_Female	30 and above and below 45 years_Total	45 and above and below 60 years_Male	45 and above and below 60 years_Female	45 and above and below 60 years_Total	60 years and above_Male	60 years and above_Female	60 years and above_Total	Total Male	Total Female	Total Persons Arrested by age and Sex
0	Andhra Pradesh	1 - Arms Act, 1959	2014	73	3	76	155	0	155	27	0	27	6	0	6	261	3	264
1	Andhra Pradesh	2 - Narcotic Drugs & Psychotropic Substances A...	2014	303	14	317	310	15	325	118	8	126	7	3	10	738	40	778
2	Andhra Pradesh	3 - Gambling Act, 1867	2014	12473	0	12473	7860	0	7860	3672	0	3672	114	0	114	24119	0	24119
3	Andhra Pradesh	4 - Excise Act, 1944	2014	2142	38	2180	2270	61	2331	953	54	1007	232	2	234	5597	155	5752
4	Andhra Pradesh	5 - Prohibition Act	2014	300	2	302	968	26	994	426	18	444	12	0	12	1706	46	1752
........................................

📄 File: 08_01_Juvenile_apprehended_state_IPC.csv (0.54 MB)
Features: ['STATE/UT', 'Year', 'CRIME', 'Boys 7-12 Years', 'Girls 7-12 Years', 'Boys 12-16 Years', 'Girls 12-16 Years', 'Boys 16-18 Years', 'Girls 16-18 Years', 'Total for boys all Age Groups', 'Total for girls all Age Groups', 'Grand total']
Preview:
STATE/UT	Year	CRIME	Boys 7-12 Years	Girls 7-12 Years	Boys 12-16 Years	Girls 12-16 Years	Boys 16-18 Years	Girls 16-18 Years	Total for boys all Age Groups	Total for girls all Age Groups	Grand total
0	Andhra Pradesh	2001	Murder	3	0	7	0	5	0	15	0	15
1	Andhra Pradesh	2001	Attempt to Commit Murder	2	0	0	0	11	0	13	0	13
2	Andhra Pradesh	2001	C H Not amounting to Murder	0	0	0	0	0	0	0	0	0
3	Andhra Pradesh	2001	Rape	2	0	15	0	2	1	19	1	20
4	Andhra Pradesh	2001	Custodial Rape	0	0	0	0	0	0	0	0	0
........................................

📄 File: 08_02_Juvenile_apprehended_state_SLL.csv (0.56 MB)
Features: ['STATE/UT', 'Year', 'CRIME', 'Boys 7-12 Years', 'Girls 7-12 Years', 'Boys 12-16 Years', 'Girls 12-16 Years', 'Boys 16-18 Years', 'Girls 16-18 Years', 'Total for boys all Age Groups', 'Total for girls all Age Groups', 'Grand total']
Preview:
STATE/UT	Year	CRIME	Boys 7-12 Years	Girls 7-12 Years	Boys 12-16 Years	Girls 12-16 Years	Boys 16-18 Years	Girls 16-18 Years	Total for boys all Age Groups	Total for girls all Age Groups	Grand total
0	Andhra Pradesh	2001	Arms Act, 1959	0	0	2	0	0	0	2	0	2
1	Andhra Pradesh	2001	Narcotic Drugs and Psychotropic Substanc	0	0	0	0	0	0	0	0	0
2	Andhra Pradesh	2001	Gambling Act	0	0	6	0	0	0	6	0	6
3	Andhra Pradesh	2001	Excise Act	0	0	7	0	0	0	7	0	7
4	Andhra Pradesh	2001	Prohibition Act	0	0	37	0	0	0	37	0	37
........................................

📄 File: 09_Juveniles_arrested_and_their_disposal.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Juveniles_Acquitted_or_Otherwise_Disposed_of', 'Juveniles_Arrested', 'Juveniles_Dealt_with_Fine', 'Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Fit_Institutions', 'Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Parent_Guardian', 'Juveniles_Sent_Home_after_Advice_or_Admonition', 'Juveniles_Sent_to_Special_Home', 'Juveniles_whose_Cases_Pending_Disposal']
Preview:
Area_Name	Year	Juveniles_Acquitted_or_Otherwise_Disposed_of	Juveniles_Arrested	Juveniles_Dealt_with_Fine	Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Fit_Institutions	Juveniles_Released_on_Probation_and_placed_under_the_Care_of_Parent_Guardian	Juveniles_Sent_Home_after_Advice_or_Admonition	Juveniles_Sent_to_Special_Home	Juveniles_whose_Cases_Pending_Disposal
0	Madhya Pradesh	2002	435	8536	388	329	3774	1239	515	1856
1	Madhya Pradesh	2003	304	7672	512	364	2587	1011	403	2491
2	Madhya Pradesh	2004	605	7433	398	161	1435	1642	572	2620
3	Madhya Pradesh	2007	401	7350	929	343	810	1466	533	2868
4	Madhya Pradesh	2001	180	7328	322	181	1425	1917	1361	1942
........................................

📄 File: 11_Property_stolen_and_recovered_nature_of_property.csv (0.43 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Sub_Group_Name', 'Cases_Property_Recovered', 'Cases_Property_Stolen', 'Value_of_Property_Recovered', 'Value_of_Property_Stolen']
Preview:
Area_Name	Year	Group_Name	Sub_Group_Name	Cases_Property_Recovered	Cases_Property_Stolen	Value_of_Property_Recovered	Value_of_Property_Stolen
0	Andaman & Nicobar Islands	2001	Cattle - Property	2. Cattle	0	1	0	1000
1	Andhra Pradesh	2001	Cattle - Property	2. Cattle	448	580	6490596	7233876
2	Arunachal Pradesh	2001	Cattle - Property	2. Cattle	22	34	135500	704500
3	Assam	2001	Cattle - Property	2. Cattle	149	322	683350	1816386
4	Bihar	2001	Cattle - Property	2. Cattle	144	334	896019	1911068
........................................

📄 File: 12_Police_strength_actual_and_sanctioned.csv (0.56 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Sub_Group_Name', 'Rank_All_Ranks_Total', 'Rank_ASI_Equivalent', 'Rank_ASPDySPAssttCommandant', 'Rank_Below_HC_and_Above_Constables', 'Rank_Constables', 'Rank_DGAddl_DG', 'Rank_DIG', 'Rank_Head_Constables', 'Rank_IGSplIG', 'Rank_Inspectors_Equivalent', 'Rank_SI_Equivalent', 'Rank_SSPSPAddlSPCommandant']
Preview:
Area_Name	Year	Group_Name	Sub_Group_Name	Rank_All_Ranks_Total	Rank_ASI_Equivalent	Rank_ASPDySPAssttCommandant	Rank_Below_HC_and_Above_Constables	Rank_Constables	Rank_DGAddl_DG	Rank_DIG	Rank_Head_Constables	Rank_IGSplIG	Rank_Inspectors_Equivalent	Rank_SI_Equivalent	Rank_SSPSPAddlSPCommandant
0	Andaman & Nicobar Islands	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	766	7	2	0	646	0	1	84	0	6	20	0
1	Andhra Pradesh	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	12510	433	56	0	8742	0	0	2864	0	132	270	13
2	Arunachal Pradesh	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	2232	14	15	169	1645	0	0	322	0	19	45	3
3	Assam	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	23963	36	135	2347	16591	0	0	3868	0	235	699	52
4	Bihar	2001	Actual Police Strength - Armed Police	A2. Acual Armed Police (Incl. Women Police)	373	0	0	0	326	0	0	41	0	2	4	0
........................................

📄 File: 13_Police_killed_or_injured_on_duty.csv (0.21 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Sub_Group_Name', 'Police_Injured_By_Criminals', 'Police_Injured_By_Riotous_Mobs', 'Police_Injured_In_Accidents', 'Police_Injured_In_Dacoity_OperationsOther_raids', 'Police_Injured_In_TerroristsExtremists_Operations', 'Police_Injured_On_Border_Duties', 'Police_Injured_Total_Policemen', 'Police_Killed_By_Criminals', 'Police_Killed_By_Riotous_Mobs', 'Police_Killed_In_Accidents', 'Police_Killed_In_Dacoity_OperationsOther_raids', 'Police_Killed_In_TerroristsExtremists_Operations', 'Police_Killed_On_Border_Duties', 'Police_Killed_Total_Policemen']
Preview:
Area_Name	Year	Group_Name	Sub_Group_Name	Police_Injured_By_Criminals	Police_Injured_By_Riotous_Mobs	Police_Injured_In_Accidents	Police_Injured_In_Dacoity_OperationsOther_raids	Police_Injured_In_TerroristsExtremists_Operations	Police_Injured_On_Border_Duties	Police_Injured_Total_Policemen	Police_Killed_By_Criminals	Police_Killed_By_Riotous_Mobs	Police_Killed_In_Accidents	Police_Killed_In_Dacoity_OperationsOther_raids	Police_Killed_In_TerroristsExtremists_Operations	Police_Killed_On_Border_Duties	Police_Killed_Total_Policemen
0	Andaman & Nicobar Islands	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	0	0	0	0	0	0	0	0	0	0	0	0	0
1	Andhra Pradesh	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	3	4	1	3	0	11	0	0	2	0	3	0	5
2	Arunachal Pradesh	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	0	0	0	0	0	0	0	0	0	0	0	0	0
3	Assam	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	0	0	0	0	1	0	1	0	0	1	0	0	0	1
4	Bihar	2001	Police - Assistant Sub-Inspectors	3. Assistant Sub-Inspectos	1	0	0	0	2	0	3	0	0	0	0	2	0	2
........................................

📄 File: 14_Age_profile_of_police_personnel_killed_on_duty.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Age_18_25_Yrs', 'Age_25_35_Yrs', 'Age_35_45_Yrs', 'Age_45_55_Yrs', 'Age_Above_55_Yrs', 'Age_Total']
Preview:
Area_Name	Year	Age_18_25_Yrs	Age_25_35_Yrs	Age_35_45_Yrs	Age_45_55_Yrs	Age_Above_55_Yrs	Age_Total
0	Jammu & Kashmir	2001	52	67	24	7	0	150
1	Chhattisgarh	2010	8	54	18	2	0	82
2	Jammu & Kashmir	2004	4	48	9	4	0	65
3	Jammu & Kashmir	2002	27	43	18	8	0	96
4	Chhattisgarh	2007	10	38	27	4	1	80
........................................

📄 File: 15_Police_natural_death_and_suicide.csv (0.05 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Age_18_25_Yrs', 'Age_25_35_Yrs', 'Age_35_45_Yrs', 'Age_45_55_Yrs', 'Age_Above_55_Yrs', 'Age_Total']
Preview:
Area_Name	Year	Group_Name	Age_18_25_Yrs	Age_25_35_Yrs	Age_35_45_Yrs	Age_45_55_Yrs	Age_Above_55_Yrs	Age_Total
0	Andaman & Nicobar Islands	2001	Natural Deaths of Policemen while in Service	0	0	0	0	1	1
1	Andhra Pradesh	2001	Natural Deaths of Policemen while in Service	7	39	100	76	11	233
2	Arunachal Pradesh	2001	Natural Deaths of Policemen while in Service	0	2	0	0	0	2
3	Assam	2001	Natural Deaths of Policemen while in Service	0	2	4	8	3	17
4	Bihar	2001	Natural Deaths of Policemen while in Service	0	7	22	27	13	69
........................................

📄 File: 16_Casualties_under_police_firing_and_lathi_charge.csv (0.09 MB)
Features: ['Area_Name', 'Year', 'Group_Name', 'Civilians_Injured', 'Civilians_Killed', 'No_of_Firings', 'Policemen_Injured', 'Policemen_Killed']
Preview:
Area_Name	Year	Group_Name	Civilians_Injured	Civilians_Killed	No_of_Firings	Policemen_Injured	Policemen_Killed
0	Andaman & Nicobar Islands	2001	Against Extremists & Terrorists	0	0	0	0	0
1	Andhra Pradesh	2001	Against Extremists & Terrorists	4	105	108	14	8
2	Arunachal Pradesh	2001	Against Extremists & Terrorists	0	0	0	0	0
3	Assam	2001	Against Extremists & Terrorists	4	26	37	3	9
4	Bihar	2001	Against Extremists & Terrorists	0	7	12	13	5
........................................

📄 File: 17_Case_reported_and_value_of_property_taken_away_by_place_of_occurrence_2001_2012.csv (0.27 MB)
Features: ['STATE/UT', 'YEAR', 'Place Of Occurrence', 'Dacoity (Section 395-398 IPC) - Number of cases registered', 'Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)', 'Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered', 'Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)', 'Theft (Section 379-382 IPC) - Number of cases registered', 'Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)']
Preview:
STATE/UT	YEAR	Place Of Occurrence	Dacoity (Section 395-398 IPC) - Number of cases registered	Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)	Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered	Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)	Theft (Section 379-382 IPC) - Number of cases registered	Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)
0	Andhra Pradesh	2001	RESIDENTIAL PREMISES	100	4446961	177	5962460	5158	105324332	4257	53517835
1	Andhra Pradesh	2001	HIGH-WAY	57	5340335	172	6364866	31	2000574	74	1593092
2	Andhra Pradesh	2001	RIVER & SEA	2	145345	11	209330	101	1412516	110	1610200
3	Andhra Pradesh	2001	RAILWAYS	8	1750800	19	304336	6	24392	943	16418110
4	Andhra Pradesh	2001	RUNNING TRAINS	5	75000	3	164000	0	0	296	6170175
........................................

📄 File: 17_Case_reported_and_value_of_property_taken_away_by_place_of_occurrence_2013.csv (0.03 MB)
Features: ['STATE/UT', 'YEAR', 'Place Of Occurrence', 'Dacoity (Section 395-398 IPC) - Number of cases registered', 'Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)', 'Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered', 'Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered', 'Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)', 'Theft (Section 379-382 IPC) - Number of cases registered', 'Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)']
Preview:
STATE/UT	YEAR	Place Of Occurrence	Dacoity (Section 395-398 IPC) - Number of cases registered	Dacoity (Section 395-398 IPC) - Value Of Property Stolen (in rupees)	Robbery(Section 392-394, 397, 398 IPC) - Number of cases registered	Robbery(Section 392-394, 397, 398 IPC) - Value Of Property Stolen (in rupees)	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Number of cases registered	Burglary(Section 449-452, 454, 455, 457-460 IPC) - Value Of Property Stolen (in rupees)	Theft (Section 379-382 IPC) - Number of cases registered	Theft (Section 379-382 IPC) - Value Of Property Stolen (in rupees)
0	Andhra Pradesh	2013	RESIDENTIAL PREMISES	43	21295800	229	23719985	7264	409568072	10539	470463463
1	Andhra Pradesh	2013	HIGH-WAY	31	6713585	109	11701238	0	0	528	24368531
2	Andhra Pradesh	2013	RIVER & SEA	0	0	1	8000	0	0	58	6612000
3	Andhra Pradesh	2013	RAILWAYS	3	37500	14	246920	0	0	1627	75617986
4	Andhra Pradesh	2013	RUNNING TRAINS	2	4000	4	58000	0	0	818	33655111
........................................

📄 File: 17_Crime_by_place_of_occurrence_2001_2012.csv (0.05 MB)
Features: ['STATE/UT', 'YEAR', 'RESIDENTIAL PREMISES - Dacoity', 'RESIDENTIAL PREMISES - Robbery', 'RESIDENTIAL PREMISES - Burglary', 'RESIDENTIAL PREMISES - Theft', 'HIGHWAYS - Dacoity', 'HIGHWAYS - Robbery', 'HIGHWAYS - Burglary', 'HIGHWAYS - Theft', 'RIVER and SEA - Dacoity', 'RIVER and SEA - Robbery', 'RIVER and SEA - Burglary', 'RIVER and SEA - Theft', 'RAILWAYS - Dacoity', 'RAILWAYS - Robbery', 'RAILWAYS - Burglary', 'RAILWAYS - Theft', 'BANKS - Dacoity', 'BANKS - Robbery', 'BANKS - Burglary', 'BANKS - Theft', 'COMMERCIAL ESTABLISHMENTS - Dacoity', 'COMMERCIAL ESTABLISHMENTS - Robbery', 'COMMERCIAL ESTABLISHMENTS - Burglary', 'COMMERCIAL ESTABLISHMENTS - Theft', 'OTHER PLACES - Dacoity', 'OTHER PLACES - Robbery', 'OTHER PLACES - Burglary', 'OTHER PLACES - Theft', 'TOTAL - Dacoity', 'TOTAL - Robbery', 'TOTAL - Burglary', 'TOTAL - Theft']
Preview:
STATE/UT	YEAR	RESIDENTIAL PREMISES - Dacoity	RESIDENTIAL PREMISES - Robbery	RESIDENTIAL PREMISES - Burglary	RESIDENTIAL PREMISES - Theft	HIGHWAYS - Dacoity	HIGHWAYS - Robbery	HIGHWAYS - Burglary	HIGHWAYS - Theft	...	COMMERCIAL ESTABLISHMENTS - Burglary	COMMERCIAL ESTABLISHMENTS - Theft	OTHER PLACES - Dacoity	OTHER PLACES - Robbery	OTHER PLACES - Burglary	OTHER PLACES - Theft	TOTAL - Dacoity	TOTAL - Robbery	TOTAL - Burglary	TOTAL - Theft
0	ANDHRA PRADESH	2001	100	177	5158	4257	57	172	31	74	...	1041	2502	37	232	862	8849	214	629	7220	16751
1	ARUNACHAL PRADESH	2001	9	26	99	131	0	0	0	8	...	84	54	8	40	65	249	22	84	248	443
2	ASSAM	2001	381	191	1695	2901	46	136	7	87	...	442	967	77	261	271	1342	532	687	2423	5367
3	BIHAR	2001	818	326	2486	4741	162	826	0	257	...	231	686	210	880	505	2582	1291	2203	3233	9701
4	CHHATTISGARH	2001	54	42	3336	1417	10	38	12	72	...	370	299	15	239	420	2835	87	338	4144	4812
5 rows × 34 columns

........................................

📄 File: 17_Crime_by_place_of_occurrence_2013.csv (0.00 MB)
Features: ['STATE/UT', 'YEAR', 'RESIDENTIAL PREMISES - Dacoity', 'RESIDENTIAL PREMISES - Robbery', 'RESIDENTIAL PREMISES - Burglary', 'RESIDENTIAL PREMISES - Theft', 'HIGHWAYS - Dacoity', 'HIGHWAYS - Robbery', 'HIGHWAYS - Burglary', 'HIGHWAYS - Theft', 'RIVER and SEA - Dacoity', 'RIVER and SEA - Robbery', 'RIVER and SEA - Burglary', 'RIVER and SEA - Theft', 'RAILWAYS - Dacoity', 'RAILWAYS - Robbery', 'RAILWAYS - Burglary', 'RAILWAYS - Theft', 'BANKS - Dacoity', 'BANKS - Robbery', 'BANKS - Burglary', 'BANKS - Theft', 'COMMERCIAL ESTABLISHMENTS - Dacoity', 'COMMERCIAL ESTABLISHMENTS - Robbery', 'COMMERCIAL ESTABLISHMENTS - Burglary', 'COMMERCIAL ESTABLISHMENTS - Theft', 'OTHER PLACES - Dacoity', 'OTHER PLACES - Robbery', 'OTHER PLACES - Burglary', 'OTHER PLACES - Theft', 'TOTAL - Dacoity', 'TOTAL - Robbery', 'TOTAL - Burglary', 'TOTAL - Theft']
Preview:
STATE/UT	YEAR	RESIDENTIAL PREMISES - Dacoity	RESIDENTIAL PREMISES - Robbery	RESIDENTIAL PREMISES - Burglary	RESIDENTIAL PREMISES - Theft	HIGHWAYS - Dacoity	HIGHWAYS - Robbery	HIGHWAYS - Burglary	HIGHWAYS - Theft	...	COMMERCIAL ESTABLISHMENTS - Burglary	COMMERCIAL ESTABLISHMENTS - Theft	OTHER PLACES - Dacoity	OTHER PLACES - Robbery	OTHER PLACES - Burglary	OTHER PLACES - Theft	TOTAL - Dacoity	TOTAL - Robbery	TOTAL - Burglary	TOTAL - Theft
0	Andhra Pradesh	2013	43	229	7264	10539	31	109	0	528	...	796	2578	45	325	1740	15670	125	709	9820	31032
1	Arunachal Pradesh	2013	6	19	85	138	3	12	0	7	...	54	168	15	28	57	200	24	75	196	514
2	Assam	2013	133	313	2652	6449	12	92	17	22	...	542	797	92	437	1072	3223	246	923	4291	10515
3	Bihar	2013	260	85	3084	9360	240	1244	9	588	...	312	2129	42	119	777	7989	579	1521	4185	21423
4	Chhattisgarh	2013	7	15	2759	1356	7	51	67	37	...	313	402	31	271	376	3200	47	351	3527	5189
5 rows × 34 columns

........................................

📄 File: 17_Crime_by_place_of_occurrence_2014.csv (0.02 MB)
Features: ['States/UTs', 'Year', 'Residence_Dacoity_Cases reported', 'Residence_Dacoity_Value of property stolen', 'Residence_Robbery_Cases reported', 'Residence_Robbery_Value of property stolen', 'Residence_Burglary_Cases reported', 'Residence_Burglary_Value of property stolen', 'Residence_Theft_Cases reported', 'Residence_Theft_Value of property stolen', 'Highways_Dacoity_Cases reported', 'Highways_Dacoity_Value of property stolen', 'Highways_Robbery_Cases reported', 'Highways_Robbery_Value of property stolen', 'Highways_Burglary_Cases reported', 'Highways_Burglary_Value of property stolen', 'Highways_Theft_Cases reported', 'Highways_Theft_Value of property stolen', 'RiverOrSea_Dacoity_Cases reported', 'RiverOrSea_Dacoity_Value of property stolen', 'RiverOrSea_Robbery_Cases reported', 'RiverOrSea_Robbery_Value of property stolen', 'RiverOrSea_Burglary_Cases reported', 'RiverOrSea_Burglary_Value of property stolen', 'RiverOrSea_Theft_Cases reported', 'RiverOrSea_Theft_Value of property stolen', 'Railways_Dacoity_Cases reported', 'Railways_Dacoity_Value of property stolen', 'Railways_Robbery_Cases reported', 'Railways_Robbery_Value of property stolen', 'Railways_Burglary_Cases reported', 'Railways_Burglary_Value of property stolen', 'Railways_Theft_Cases reported', 'Railways_Theft_Value of property stolen', 'Religious Places_Dacoity_Cases reported', 'Religious Places_Dacoity_Value of property stolen', 'Religious Places_Robbery_Cases reported', 'Religious Places_Robbery_Value of property stolen', 'Religious Places_Burglary_Cases reported', 'Religious Places_Burglary_Value of property stolen', 'Religious Places_Theft_Cases reported', 'Religious Places_Theft_Value of property stolen', 'ATM_Dacoity_Cases reported', 'ATM_Dacoity_Value of property stolen', 'ATM_Robbery_Cases reported', 'ATM_Robbery_Value of property stolen', 'ATM_Burglary_Cases reported', 'ATM_Burglary_Value of property stolen', 'ATM_Theft_Cases reported', 'ATM_Theft_Value of property stolen', 'Bank_Dacoity_Cases reported', 'Bank_Dacoity_Value of property stolen', 'Bank_Robbery_Cases reported', 'Bank_Robbery_Value of property stolen', 'Bank_Burglary_Cases reported', 'Bank_Burglary_Value of property stolen', 'Bank_Theft_Cases reported', 'Bank_Theft_Value of property stolen', 'CommEst_Dacoity_Cases reported', 'CommEst_Dacoity_Value of property stolen', 'CommEst_Robbery_Cases reported', 'CommEst_Robbery_Value of property stolen', 'CommEst_Burglary_Cases reported', 'CommEst_Burglary_Value of property stolen', 'CommEst_Theft_Cases reported', 'CommEst_Theft_Value of property stolen', 'OtherPlaces_Dacoity_Cases reported', 'OtherPlaces_Dacoity_Value of property stolen', 'OtherPlaces_Robbery_Cases reported', 'OtherPlaces_Robbery_Value of property stolen', 'OtherPlaces_Burglary_Cases reported', 'OtherPlaces_Burglary_Value of property stolen', 'OtherPlaces_Theft_Cases reported', 'OtherPlaces_Theft_Value of property stolen', 'Total_Dacoity_Cases reported', 'Total_Dacoity_Value of property stolen', 'Total_Robbery_Cases reported', 'Total_Robbery_Value of property stolen', 'Total_Burglary_Cases reported', 'Total_Burglary_Value of property stolen', 'Total_Theft_Cases reported', 'Total_Theft_Value of property stolen']
Preview:
States/UTs	Year	Residence_Dacoity_Cases reported	Residence_Dacoity_Value of property stolen	Residence_Robbery_Cases reported	Residence_Robbery_Value of property stolen	Residence_Burglary_Cases reported	Residence_Burglary_Value of property stolen	Residence_Theft_Cases reported	Residence_Theft_Value of property stolen	...	OtherPlaces_Theft_Cases reported	OtherPlaces_Theft_Value of property stolen	Total_Dacoity_Cases reported	Total_Dacoity_Value of property stolen	Total_Robbery_Cases reported	Total_Robbery_Value of property stolen	Total_Burglary_Cases reported	Total_Burglary_Value of property stolen	Total_Theft_Cases reported	Total_Theft_Value of property stolen
0	Andhra Pradesh	2014	27	7983001	124	10577950	3530	226363051	5757	199348324	...	4997	199285711	75	27152368	433	41148643	4719	321352316	15617	641880290
1	Arunachal Pradesh	2014	3	67500	8	86350	103	6637940	173	15422078	...	158	37247470	12	477000	61	8718930	224	12324815	498	78789228
2	Assam	2014	144	10693775	315	4191631	2293	26376373	4503	131897564	...	5981	130654964	267	16603231	1038	18121153	4954	49369570	12737	311982322
3	Bihar	2014	174	27725940	117	6558972	3693	262152615	6655	116467719	...	10874	416911296	538	151516733	1600	74012959	4674	279472385	22888	693664033
4	Chhattisgarh	2014	27	3076170	25	1137900	1985	85802275	1235	53896428	...	3057	125524854	58	911101420	405	26477826	3247	150182672	6098	266495669
5 rows × 82 columns

........................................

📄 File: 18_01_Juveniles_arrested_Education.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Education_Above_Primary_but_below_Matric_or_Higher_Secondary', 'Education_Illiterate', 'Education_Matric_or_Higher_Secondary_&_above', 'Education_Total', 'Education_Upto_primary']
Preview:
Area_Name	Year	Sub_Group_Name	Education_Above_Primary_but_below_Matric_or_Higher_Secondary	Education_Illiterate	Education_Matric_or_Higher_Secondary_&_above	Education_Total	Education_Upto_primary
0	Andaman & Nicobar Islands	2001	1. Education	12	0	0	16	4
1	Andhra Pradesh	2001	1. Education	178	640	64	1565	683
2	Arunachal Pradesh	2001	1. Education	39	16	12	137	70
3	Assam	2001	1. Education	74	91	0	253	88
4	Bihar	2001	1. Education	87	190	56	586	253
........................................

📄 File: 18_02_Juveniles_arrested_Economic_setup.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Economic_Set_up_Annual_Income_250001_to_50000', 'Economic_Set_up_Annual_Income_upto_Rs_25000', 'Economic_Set_up_Middle_income_from_100001_to_200000', 'Economic_Set_up_Middle_income_from_50001_to_100000', 'Economic_Set_up_Total', 'Economic_Set_up_Upper_income_above_Rs_300000', 'Economic_Set_up_Upper_middle_income_from_200001_to_300000']
Preview:
Area_Name	Year	Sub_Group_Name	Economic_Set_up_Annual_Income_250001_to_50000	Economic_Set_up_Annual_Income_upto_Rs_25000	Economic_Set_up_Middle_income_from_100001_to_200000	Economic_Set_up_Middle_income_from_50001_to_100000	Economic_Set_up_Total	Economic_Set_up_Upper_income_above_Rs_300000	Economic_Set_up_Upper_middle_income_from_200001_to_300000
0	Andaman & Nicobar Islands	2001	2. Economic Setup	12	4	0	0	16	0	0
1	Andhra Pradesh	2001	2. Economic Setup	104	1421	9	27	1565	4	0
2	Arunachal Pradesh	2001	2. Economic Setup	38	99	0	0	137	0	0
3	Assam	2001	2. Economic Setup	47	177	13	16	253	0	0
4	Bihar	2001	2. Economic Setup	213	303	12	58	586	0	0
........................................

📄 File: 18_03_Juveniles_arrested_Family_background.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Family_back_ground_Homeless', 'Family_back_ground_Living_with_guardian', 'Family_back_ground_Living_with_parents', 'Family_back_ground_Total']
Preview:
Area_Name	Year	Sub_Group_Name	Family_back_ground_Homeless	Family_back_ground_Living_with_guardian	Family_back_ground_Living_with_parents	Family_back_ground_Total
0	Andaman & Nicobar Islands	2001	3. Family Background	0	0	16	16
1	Andhra Pradesh	2001	3. Family Background	552	287	726	1565
2	Arunachal Pradesh	2001	3. Family Background	0	58	79	137
3	Assam	2001	3. Family Background	21	74	158	253
4	Bihar	2001	3. Family Background	43	101	442	586
........................................

📄 File: 18_04_Juveniles_arrested_Recidivism.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Sub_Group_Name', 'Recidivism_New_Delinquent', 'Recidivism_Old_Delinquent', 'Recidivism_Total']
Preview:
Area_Name	Year	Sub_Group_Name	Recidivism_New_Delinquent	Recidivism_Old_Delinquent	Recidivism_Total
0	Andaman & Nicobar Islands	2001	4. Recidivism	16	0	16
1	Andhra Pradesh	2001	4. Recidivism	1392	173	1565
2	Arunachal Pradesh	2001	4. Recidivism	130	7	137
3	Assam	2001	4. Recidivism	248	5	253
4	Bihar	2001	4. Recidivism	576	10	586
........................................

📄 File: 19_Motive_or_cause_of_murder_and_culpable_homicide_not_amounting_to_murder.csv (0.03 MB)
Features: ['Area_Name', 'Year', 'CHNAMurder_Cause_By_TerroristExtremist', 'CHNAMurder_Cause_Casteism', 'CHNAMurder_Cause_Class_Conflict', 'CHNAMurder_Cause_Communalism', 'CHNAMurder_Cause_Dowry', 'CHNAMurder_Cause_For_Political_reason', 'CHNAMurder_Cause_Gain', 'CHNAMurder_Cause_Love_AffairsSexual_Relations', 'CHNAMurder_Cause_Lunacy', 'CHNAMurder_Cause_Other_Causes_or_Motives', 'CHNAMurder_Cause_Personal_Vendetta_or_Enmity', 'CHNAMurder_Cause_Property_Dispute', 'CHNAMurder_Cause_Total', 'CHNAMurder_Cause_Witchcraft', 'Murder_Cause_By_TerroristExtremist', 'Murder_Cause_Casteism', 'Murder_Cause_Class_Conflict', 'Murder_Cause_Communalism', 'Murder_Cause_Dowry', 'Murder_Cause_For_Political_reason', 'Murder_Cause_Gain', 'Murder_Cause_Love_AffairsSexual_Relations', 'Murder_Cause_Lunacy', 'Murder_Cause_Other_Causes_or_Motives', 'Murder_Cause_Personal_Vendetta_or_Enmity', 'Murder_Cause_Property_Dispute', 'Murder_Cause_Total', 'Murder_Cause_Witchcraft']
Preview:
Area_Name	Year	CHNAMurder_Cause_By_TerroristExtremist	CHNAMurder_Cause_Casteism	CHNAMurder_Cause_Class_Conflict	CHNAMurder_Cause_Communalism	CHNAMurder_Cause_Dowry	CHNAMurder_Cause_For_Political_reason	CHNAMurder_Cause_Gain	CHNAMurder_Cause_Love_AffairsSexual_Relations	...	Murder_Cause_Dowry	Murder_Cause_For_Political_reason	Murder_Cause_Gain	Murder_Cause_Love_AffairsSexual_Relations	Murder_Cause_Lunacy	Murder_Cause_Other_Causes_or_Motives	Murder_Cause_Personal_Vendetta_or_Enmity	Murder_Cause_Property_Dispute	Murder_Cause_Total	Murder_Cause_Witchcraft
0	Odisha	2007	0	11	0	0	2	0	0	0	...	138	4	60	61	1	755	113	43	1210	28
1	Jharkhand	2002	0	3	2	2	13	3	7	9	...	70	25	103	158	3	599	242	228	1488	26
2	Jharkhand	2004	0	3	2	2	13	3	7	9	...	70	25	103	158	3	599	242	228	1488	26
3	Bihar	2010	0	2	2	0	11	0	47	35	...	168	24	352	187	5	1228	441	916	3362	2
4	Karnataka	2002	0	1	0	0	0	0	0	1	...	52	6	55	130	0	1093	188	98	1627	0
5 rows × 30 columns

........................................

📄 File: 21_Offenders_known_to_the_victim.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'No_of_Cases_in_which_offenders_were_known_to_the_Victims', 'No_of_Cases_in_which_offenders_were_Neighbours', 'No_of_Cases_in_which_offenders_were_Other_Known_persons', 'No_of_Cases_in_which_offenders_were_Parentsclose_family_members', 'No_of_Cases_in_which_offenders_were_Relatives']
Preview:
Area_Name	Year	No_of_Cases_in_which_offenders_were_known_to_the_Victims	No_of_Cases_in_which_offenders_were_Neighbours	No_of_Cases_in_which_offenders_were_Other_Known_persons	No_of_Cases_in_which_offenders_were_Parentsclose_family_members	No_of_Cases_in_which_offenders_were_Relatives
0	Madhya Pradesh	2007	3010	1397	1384	49	180
1	Madhya Pradesh	2008	2937	1279	1433	52	173
2	Madhya Pradesh	2009	2998	1254	1528	14	202
3	Madhya Pradesh	2010	3135	1223	1659	21	232
4	West Bengal	2010	2134	1037	987	4	106
........................................

📄 File: 22_Persons_arrested_under_recidivism.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Offenders_Arrested', 'Offenders_Arrested_for_the_First_time', 'Offenders_Conviction_in_the_past_Once', 'Offenders_Conviction_in_the_past_Three_times_or_More', 'Offenders_Conviction_in_the_past_Twice']
Preview:
Area_Name	Year	Offenders_Arrested	Offenders_Arrested_for_the_First_time	Offenders_Conviction_in_the_past_Once	Offenders_Conviction_in_the_past_Three_times_or_More	Offenders_Conviction_in_the_past_Twice
0	Uttar Pradesh	2001	314055	305811	6528	305	1411
1	Maharashtra	2008	311598	304892	5622	246	838
2	Maharashtra	2010	305629	301091	3139	375	1024
3	Madhya Pradesh	2010	343192	294222	37544	3119	8307
4	Uttar Pradesh	2010	292050	289905	1562	76	507
........................................

📄 File: 23_Anti_corruprion_cases.csv (0.08 MB)
Features: ['Area_Name', 'Year', 'AC01_No_of_cases_pending_investigation_from_previous_year', 'AC02_No_of_cases_registered_during_the_year', 'AC03_Total_No_of_cases_for_investigation_during_the_year', 'AC04_No_of_cases_investigated_during_the_year', 'AC05_No_of_cases_not_investigatedor_in_which_investigation_was_dropped_due_to_any_reason_during_the_year', 'AC06_No_of_cases_transferred_to_local_police_during_the_year', 'AC07_No_of_cases_declared_false_mistake_of_fact_or_of_law_or_non_cognizable_or_civil_in_nature', 'AC08_No_of_cases_in_which_charge_sheets_were_laid_during_the_year', 'AC09_No_of_cases_pending_departmental_sanction_for_prosecution_during_the_year', 'AC10_No_of_cases_sent_up_for_trial_and_also_reported_for_departmental_action_during_the_year', 'AC11_No_of_cases_reported_for_regular_departmental_action_during_the_year', 'AC12_No_of_cases_reported_for_suitable_action_during_the_year', 'AC13_No_of_cases_in_which_charge_sheets_were_not_laid_but_final_report_submitted_during_the_year', 'AC14_No_of_cases_pending_investigation_at_the_end_of_the_year', 'AC15_No_of_cases_resulted_in_recoveries_or_seizures_during_the_year', 'AC16_Value_of_property_recoveredseized_during_the_year_in_Rs', 'AC17_Percentage_of_cases_charge_sheeted_to_total_cases_investigated', 'AC18_No_of_cases_pending_trial_from_the_previous_year', 'AC19_No_of_cases_sent_up_for_trial_during_the_year', 'AC20_Total_No_of_cases_for_trial_during_the_year', 'AC21_No_of_cases_withdrawn_or_other_wise_disposed_off_on_account_of_death_of_the_accused_during_the_year', 'AC22_No_of_cases_in_which_trials_were_completed_during_the_year', 'AC23_No_of_cases_convicted_during_the_year', 'AC24_No_of_cases_acquitted_or_discharged_during_the_year', 'AC25_No_of_cases_pending_trial_at_the_end_of_the_year', 'AC26_Percentage_of_cases_convicted_to_cases_in_which_trials_were_completed_during_the_year', 'AC27_Total_amount_of_fine_imposed_during_the_year_in_Rs']
Preview:
Area_Name	Year	AC01_No_of_cases_pending_investigation_from_previous_year	AC02_No_of_cases_registered_during_the_year	AC03_Total_No_of_cases_for_investigation_during_the_year	AC04_No_of_cases_investigated_during_the_year	AC05_No_of_cases_not_investigatedor_in_which_investigation_was_dropped_due_to_any_reason_during_the_year	AC06_No_of_cases_transferred_to_local_police_during_the_year	AC07_No_of_cases_declared_false_mistake_of_fact_or_of_law_or_non_cognizable_or_civil_in_nature	AC08_No_of_cases_in_which_charge_sheets_were_laid_during_the_year	...	AC18_No_of_cases_pending_trial_from_the_previous_year	AC19_No_of_cases_sent_up_for_trial_during_the_year	AC20_Total_No_of_cases_for_trial_during_the_year	AC21_No_of_cases_withdrawn_or_other_wise_disposed_off_on_account_of_death_of_the_accused_during_the_year	AC22_No_of_cases_in_which_trials_were_completed_during_the_year	AC23_No_of_cases_convicted_during_the_year	AC24_No_of_cases_acquitted_or_discharged_during_the_year	AC25_No_of_cases_pending_trial_at_the_end_of_the_year	AC26_Percentage_of_cases_convicted_to_cases_in_which_trials_were_completed_during_the_year	AC27_Total_amount_of_fine_imposed_during_the_year_in_Rs
0	Rajasthan	2010	740.0	576.0	1316.0	1316.0	0.0	0.0	0.0	281.0	...	1817.0	281.0	2098.0	8.0	57.0	11.0	46.0	2033.0	0.0	33750.0
1	Maharashtra	2010	724.0	528.0	1252.0	1252.0	2.0	0.0	4.0	446.0	...	2042.0	446.0	2488.0	5.0	366.0	68.0	298.0	2117.0	0.0	383000.0
2	Maharashtra	2003	509.0	521.0	1030.0	1030.0	3.0	3.0	1.0	479.0	...	2602.0	479.0	3081.0	5.0	396.0	113.0	283.0	2680.0	0.0	404600.0
3	Tamil Nadu	2009	347.0	498.0	845.0	845.0	0.0	0.0	0.0	156.0	...	308.0	156.0	464.0	13.0	52.0	26.0	26.0	399.0	0.0	149300.0
4	Maharashtra	2001	505.0	497.0	1002.0	1002.0	2.0	6.0	6.0	472.0	...	2321.0	472.0	2793.0	3.0	287.0	97.0	190.0	2503.0	0.0	1061500.0
5 rows × 29 columns

........................................

📄 File: 24_Anti_corruption_arrests.csv (0.06 MB)
Features: ['Area_Name', 'Year', 'ACA01_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_beginning_of_the_year', 'ACA02_No_of_persons_arrested_during_the_year', 'ACA04_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_end_of_the_year', 'ACA05_No_of_persons_in_whose_cases_charge_sheets_were_laid_during_the_year', 'ACA06_No_of_persons_under_trial_at_the_beginning_of_the_year', 'ACA07_Total_No_of_persons_under_trial_during_the_year', 'ACA08_No_of_persons_whose_cases_were_withdrawn_or_otherwise_disposed_off_during_the_year', 'ACA09_No_of_persons_in_custody_or_on_bail_during_the_stage_of_trial_at_the_end_of_the_year', 'ACA10_No_of_persons_in_whose_cases_trials_were_completed_during_the_year', 'ACA11_No_of_persons_convicted_during_the_year', 'ACA12_No_of_persons_acquitted_during_the_year', 'ACA13_Percentage_of_persons_convicted_to_total_persons_in_whose_cases_trials_were_completed_during_the_year', 'ACA14_No_of_persons_involved_in_the_cases_reported_for_Regular_Departmental_Action_during_the_year', 'ACA15_No_of_persons_involved_in_the_cases_reported_for_suitable_action_during_the_year', 'ACA16_No_of_persons_punished_departmentally_during_the_year:', 'ACA161_No_of_persons_dismissed_from_Service_during_the_year', 'ACA162_No_of_persons_removed_from_service_during_the_year', 'ACA163_No_of_persons_awarded_other_major_punishments_during_the_year', 'ACA164_No_of_persons_awarded_minor_punishments_during_the_year', "ACA171_No_of_Group_`A'_Officers_out_of_above", "ACA172_No_of_Group_`B'_Officers_out_of_above", 'ACA19_No_of_private_persons_involved_during_the_year']
Preview:
Area_Name	Year	ACA01_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_beginning_of_the_year	ACA02_No_of_persons_arrested_during_the_year	ACA04_No_of_persons_in_custody_or_on_bail_during_the_stage_of_investigation_at_the_end_of_the_year	ACA05_No_of_persons_in_whose_cases_charge_sheets_were_laid_during_the_year	ACA06_No_of_persons_under_trial_at_the_beginning_of_the_year	ACA07_Total_No_of_persons_under_trial_during_the_year	ACA08_No_of_persons_whose_cases_were_withdrawn_or_otherwise_disposed_off_during_the_year	ACA09_No_of_persons_in_custody_or_on_bail_during_the_stage_of_trial_at_the_end_of_the_year	...	ACA14_No_of_persons_involved_in_the_cases_reported_for_Regular_Departmental_Action_during_the_year	ACA15_No_of_persons_involved_in_the_cases_reported_for_suitable_action_during_the_year	ACA16_No_of_persons_punished_departmentally_during_the_year:	ACA161_No_of_persons_dismissed_from_Service_during_the_year	ACA162_No_of_persons_removed_from_service_during_the_year	ACA163_No_of_persons_awarded_other_major_punishments_during_the_year	ACA164_No_of_persons_awarded_minor_punishments_during_the_year	ACA171_No_of_Group_ `A'_Officers_out_of_above	ACA172_No_of_Group_`B'_Officers_out_of_above	ACA19_No_of_private_persons_involved_during_the_year
0	Bihar	2007	13.0	950.0	20.0	943.0	0.0	0.0	4.0	0.0	...	0.0	0.0	0.0	0.0	0.0	0.0	0.0	246.0	150.0	215.0
1	Gujarat	2010	144.0	947.0	449.0	642.0	959.0	1601.0	0.0	1378.0	...	5.0	35.0	6.0	1.0	0.0	2.0	3.0	9.0	46.0	35.0
2	Maharashtra	2007	775.0	870.0	1188.0	453.0	3588.0	4041.0	21.0	3553.0	...	10.0	0.0	3.0	1.0	0.0	1.0	1.0	88.0	72.0	73.0
3	Maharashtra	2003	825.0	792.0	869.0	730.0	3717.0	4447.0	14.0	3929.0	...	5.0	0.0	3.0	0.0	0.0	0.0	3.0	54.0	81.0	93.0
4	Punjab	2005	338.0	748.0	523.0	529.0	1037.0	1566.0	35.0	1244.0	...	0.0	26.0	8.0	8.0	0.0	0.0	0.0	79.0	0.0	115.0
5 rows × 24 columns

........................................

📄 File: 27_Nature_of_complaints_received_by_police.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'PC1_Oral_Complaints', 'PC2_Written_Complaints', 'PC3_Distress_call_over_phoneNo_100_etc', 'PC4_Complaints_initiated_sue_motto_by_Police', 'PC5_Total_Complaints_Sum_of_1_4_Above', 'PC6_Total_Complaints_as_recorded_in_GD', 'PC7_IPC_Cases_Registered', 'PC8_SLL_Cases_Registered']
Preview:
Area_Name	Year	PC1_Oral_Complaints	PC2_Written_Complaints	PC3_Distress_call_over_phoneNo_100_etc	PC4_Complaints_initiated_sue_motto_by_Police	PC5_Total_Complaints_Sum_of_1_4_Above	PC6_Total_Complaints_as_recorded_in_GD	PC7_IPC_Cases_Registered	PC8_SLL_Cases_Registered
0	Maharashtra	2010	239448	561217	13049	549410	1363124	1106219	208168	127940
1	Maharashtra	2009	242585	525157	7697	436688	1212127	979735	199598	135418
2	Maharashtra	2008	233929	499832	7307	404182	1145250	1019301	206243	120138
3	Maharashtra	2005	221580	474289	5013	209806	910688	811193	187027	142293
4	Maharashtra	2007	209595	470614	6479	203440	890128	696871	195707	120310
........................................

📄 File: 34_Use_of_fire_arms_in_murder_cases.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Victims_of_Murder_by_Fire_arms', 'Victims_of_Murder_by_Licensed_arms', 'Victims_of_Murder_by_Un_licensedImprovisedCrudeCountry_made_Arms_Etc']
Preview:
Area_Name	Year	Victims_of_Murder_by_Fire_arms	Victims_of_Murder_by_Licensed_arms	Victims_of_Murder_by_Un_licensedImprovisedCrudeCountry_made_Arms_Etc
0	Uttar Pradesh	2004	4969	437	4532
1	Uttar Pradesh	2002	4098	403	3695
2	Uttar Pradesh	2006	2565	330	2235
3	Uttar Pradesh	2003	3855	317	3538
4	Uttar Pradesh	2008	1470	261	1209
........................................

📄 File: 37_Home_guards_and_auxilliary_force.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'HG_Lower_Subordinates_Actual_Strength', 'HG_Lower_Subordinates_Sanctioned_Strength', 'HG_Officers_Actual_Strength', 'HG_Officers_Sanctioned_Strength', 'HG_Upper_Subordinates_Actual_Strength', 'HG_Upper_Subordinates_Sanctioned_Strength']
Preview:
Area_Name	Year	HG_Lower_Subordinates_Actual_Strength	HG_Lower_Subordinates_Sanctioned_Strength	HG_Officers_Actual_Strength	HG_Officers_Sanctioned_Strength	HG_Upper_Subordinates_Actual_Strength	HG_Upper_Subordinates_Sanctioned_Strength
0	Gujarat	2001	39236	45595	104	155	1366	1568
1	Gujarat	2002	40098	43630	105	150	1350	1500
2	Gujarat	2003	39834	43630	102	150	1283	1500
3	Gujarat	2004	36740	43630	82	150	1199	1500
4	Gujarat	2005	39123	43630	75	150	1159	1500
........................................

📄 File: 38_Unidentified_dead_bodies_recovered_and_inquest_conducted.csv (0.01 MB)
Features: ['Area_Name', 'Year', 'Unidentified_Dead_bodies_Recovered_Inquest_Conducted']
Preview:
Area_Name	Year	Unidentified_Dead_bodies_Recovered_Inquest_Conducted
0	Andhra Pradesh	2001	5290
1	Arunachal Pradesh	2001	0
2	Assam	2001	14
3	Bihar	2001	1438
4	Chandigarh	2001	18
........................................

📄 File: 41_Escapes_from_police_custody.csv (0.02 MB)
Features: ['Area_Name', 'Year', 'EPC_Cases_Cases_Acquitted', 'EPC_Cases_Cases_Convicted', 'EPC_Cases_Cases_Pending_for_Trial', 'EPC_Cases_Registered', 'EPC_Cases_Trial_Completed', 'EPC_Escapees_Re_Arrested_from_Lockup', 'EPC_Escapees_Re_Arrested_from_Others', 'EPC_FR_Submitted', 'EPC_Persons_Awarded_more_than_3_Years_Imprisonment', 'EPC_Persons_Awarded_upto_3_Years_Imprisonment', 'EPC_Persons_Cases_Acquitted', 'EPC_Persons_Cases_Convicted', 'EPC_Persons_Cases_Pending_for_Trial', 'EPC_Persons_Chargesheeted_for_Escape', 'EPC_Persons_Escaped', 'EPC_Persons_Escaped_from_Lockup', 'EPC_Persons_Escaped_Outside_the_Lockup', 'EPC_Persons_Escaped_Total', 'EPC_Persons_Trial_Completed']
Preview:
Area_Name	Year	EPC_Cases_Cases_Acquitted	EPC_Cases_Cases_Convicted	EPC_Cases_Cases_Pending_for_Trial	EPC_Cases_Registered	EPC_Cases_Trial_Completed	EPC_Escapees_Re_Arrested_from_Lockup	EPC_Escapees_Re_Arrested_from_Others	EPC_FR_Submitted	...	EPC_Persons_Awarded_upto_3_Years_Imprisonment	EPC_Persons_Cases_Acquitted	EPC_Persons_Cases_Convicted	EPC_Persons_Cases_Pending_for_Trial	EPC_Persons_Chargesheeted_for_Escape	EPC_Persons_Escaped	EPC_Persons_Escaped_from_Lockup	EPC_Persons_Escaped_Outside_the_Lockup	EPC_Persons_Escaped_Total	EPC_Persons_Trial_Completed
0	Jharkhand	2005	235	66	1853	17	301	1747	7	188	...	2	671	236	3238	1252	12	5	7	12	907
1	Assam	2006	30	24	19	81	54	21	3	19	...	8	27	14	19	15	99	11	88	99	41
2	Andhra Pradesh	2009	68	22	38	96	90	13	51	18	...	2	146	32	30	45	96	8	88	96	178
3	Haryana	2006	7	20	76	33	27	7	26	9	...	8	15	26	172	21	36	8	28	36	41
4	Assam	2005	30	19	15	70	49	17	1	16	...	6	22	12	16	12	88	10	78	88	34
5 rows × 21 columns

........................................

📄 File: 42_District_wise_crimes_committed_against_women_2001_2012.csv (0.42 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Rape', 'Kidnapping and Abduction', 'Dowry Deaths', 'Assault on women with intent to outrage her modesty', 'Insult to modesty of Women', 'Cruelty by Husband or his Relatives', 'Importation of Girls']
Preview:
STATE/UT	DISTRICT	Year	Rape	Kidnapping and Abduction	Dowry Deaths	Assault on women with intent to outrage her modesty	Insult to modesty of Women	Cruelty by Husband or his Relatives	Importation of Girls
0	ANDHRA PRADESH	ADILABAD	2001	50	30	16	149	34	175	0
1	ANDHRA PRADESH	ANANTAPUR	2001	23	30	7	118	24	154	0
2	ANDHRA PRADESH	CHITTOOR	2001	27	34	14	112	83	186	0
3	ANDHRA PRADESH	CUDDAPAH	2001	20	20	17	126	38	57	0
4	ANDHRA PRADESH	EAST GODAVARI	2001	23	26	12	109	58	247	0
........................................

📄 File: 42_District_wise_crimes_committed_against_women_2013.csv (0.04 MB)
Features: ['STATE/UT', 'DISTRICT', 'Year', 'Rape', 'Kidnapping and Abduction', 'Dowry Deaths', 'Assault on women with intent to outrage her modesty', 'Insult to modesty of Women', 'Cruelty by Husband or his Relatives', 'Importation of Girls']
Preview:
STATE/UT	DISTRICT	Year	Rape	Kidnapping and Abduction	Dowry Deaths	Assault on women with intent to outrage her modesty	Insult to modesty of Women	Cruelty by Husband or his Relatives	Importation of Girls
0	Andhra Pradesh	ADILABAD	2013	61	47	12	197	138	464	0
1	Andhra Pradesh	ANANTAPUR	2013	28	84	23	337	43	161	0
2	Andhra Pradesh	CHITTOOR	2013	31	27	13	119	84	435	0
3	Andhra Pradesh	CUDDAPAH	2013	19	50	9	318	163	207	0
4	Andhra Pradesh	CYBERABAD	2013	138	129	43	350	338	1526	0
........................................

📄 File: 42_District_wise_crimes_committed_against_women_2014.csv (0.13 MB)
Features: ['States/UTs', 'District', 'Year', 'Rape', 'Custodial Rape', 'Custodial_Gang Rape', 'Custodial_Other Rape', 'Rape other than Custodial', 'Rape_Gang Rape', 'Rape_Others', 'Attempt to commit Rape', 'Kidnapping & Abduction_Total', 'Kidnaping & Abduction', 'Kidnaping & Abduction in order to Murder', 'Kidnapping for Ransom', 'Kidnapping & Abduction of Women to compel her for marriage', 'Kidnaping & Abduction_Others', 'Dowry Deaths', 'Assault on Women with intent to outrage her Modesty_Total', 'Sexual Harassment', 'Assault on women with intent to Disrobe', 'Voyeurism', 'Stalking', 'Others', 'Insult to the Modesty of Women_Total', 'At Office premises', 'In places related to work', 'In Public Transport system', 'In other Places', 'Cruelty by Husband or his Relatives', 'Importation of Girls from Foreign Country', 'Murder', 'Attempt to commit Murder', 'Culpable Homicide not amounting to Murder', 'Attempt to commit Culpable Homicide', 'Grievous Hurt', 'Hurt', 'Acid attack', 'Attempt to Acid Attack', 'Deaths caused with intent to cause miscarriage', 'Causing miscarriage without consent of women', 'Dacoity_Total', 'Dacoity with Murder', 'Other Dacoity', 'Robbery', 'Arson', 'HumanTrafficking', 'Abetment of Suicides of Women', 'UnNatural Offences', 'Other IPC Crimes', 'Dowry Prohibition Act, 1961', 'Indecent Representation of Women (P) Act, 1986', 'Commission of Sati Prevention Act, 1987', 'Protection of Women from Domestic Violence Act, 2005', 'Immoral Traffic Prevention Act', 'ITP Under Section 5', 'ITP Under Section 6', 'ITP Under Section 7', 'ITP Under Section 8', 'ITP Under Other Sections', 'Other SLL Crimes against Women', 'Total Crimes against Women']
Preview:
States/UTs	District	Year	Rape	Custodial Rape	Custodial_Gang Rape	Custodial_Other Rape	Rape other than Custodial	Rape_Gang Rape	Rape_Others	...	Commission of Sati Prevention Act, 1987	Protection of Women from Domestic Violence Act, 2005	Immoral Traffic Prevention Act	ITP Under Section 5	ITP Under Section 6	ITP Under Section 7	ITP Under Section 8	ITP Under Other Sections	Other SLL Crimes against Women	Total Crimes against Women
0	Andhra Pradesh	Anantapur	2014	35	0	0	0	35	0	35	...	0	0	0	0	0	0	0	0	0	1097
1	Andhra Pradesh	Chittoor	2014	32	0	0	0	32	1	31	...	0	0	4	4	0	0	0	0	0	607
2	Andhra Pradesh	Cuddapah	2014	28	0	0	0	28	0	28	...	0	0	5	0	0	0	0	5	0	609
3	Andhra Pradesh	East Godavari	2014	85	0	0	0	85	0	85	...	0	0	16	0	0	0	0	16	0	1277
4	Andhra Pradesh	Guntakal Railway	2014	0	0	0	0	0	0	0	...	0	0	0	0	0	0	0	0	0	4
5 rows × 62 columns

........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/crime/Cases against Police Personnels
------------------------------------------------------------------------------------------

📄 File: 2016 Cases against Police Personnels.csv (0.00 MB)
Features: ['S. No.', 'Category', 'State/UT', 'Total Number of Criminal Cases Registered during the year', 'Police Personnel Arrested', 'Cases Chargesheeted', 'Police Personnel Chargesheeted', 'Police Personnel whose Cases were withdrawn/ Disposed Off', 'Police Personnel whose Trials were Completed', 'Police Personnel Convicted', 'Police Personnel Acquitted']
Preview:
S. No.	Category	State/UT	Total Number of Criminal Cases Registered during the year	Police Personnel Arrested	Cases Chargesheeted	Police Personnel Chargesheeted	Police Personnel whose Cases were withdrawn/ Disposed Off	Police Personnel whose Trials were Completed	Police Personnel Convicted	Police Personnel Acquitted
0	1	State	Andhra Pradesh	100	36	28	29	5	8	0	8
1	2	State	Arunachal Pradesh	24	10	13	13	0	6	5	1
2	3	State	Assam	37	18	8	8	1	0	0	0
3	4	State	Bihar	43	0	40	40	0	0	0	0
4	5	State	Chhattisgarh	65	26	32	38	1	1	0	1
........................................

📄 File: 2017 Cases against Police Personnels.csv (0.00 MB)
Features: ['S. No.', 'Category', 'State/UT', 'Number of Cases - Registered', 'Number of Cases - Quashed/Stayed by Courts', 'Number of Cases - Chargesheeted', 'Number of Cases - Final Report Submitted', 'Number of Police Personel - Arrested', 'Number of Police Personel - Chargesheeted', 'Number of Police Personel - Cases Withdrawn/Disposed Off', 'Number of Police Personel - Trials were Completed', 'Number of Police Personel - Convicted', 'Number of Police Personel - Acquitted or Discharged']
Preview:
S. No.	Category	State/UT	Number of Cases - Registered	Number of Cases - Quashed/Stayed by Courts	Number of Cases - Chargesheeted	Number of Cases - Final Report Submitted	Number of Police Personel - Arrested	Number of Police Personel - Chargesheeted	Number of Police Personel - Cases Withdrawn/Disposed Off	Number of Police Personel - Trials were Completed	Number of Police Personel - Convicted	Number of Police Personel - Acquitted or Discharged
0	1	State	Andhra Pradesh	164	0	344	95	103	101	2	61	0	61
1	2	State	Arunachal Pradesh	9	0	1	4	0	5	0	0	0	0
2	3	State	Assam	8	4	1	2	0	1	0	0	0	0
3	4	State	Bihar	4	0	4	0	0	5	0	0	0	0
4	5	State	Chhattisgarh	20	0	10	15	0	17	3	99	3	96
........................................

📄 File: 2018 Cases against Police Personnels.csv (0.00 MB)
Features: ['S. No.', 'Category', 'State/UT', 'Number of Cases - Registered', 'Number of Cases - Quashed/Stayed by Courts', 'Number of Cases - Chargesheeted', 'Number of Cases - Final Report Submitted', 'Number of Police Personel - Arrested', 'Number of Police Personel - Chargesheeted', 'Number of Police Personel - Cases Withdrawn/Disposed Off', 'Number of Police Personel - Trials were Completed', 'Number of Police Personel - Convicted', 'Number of Police Personel - Acquitted or Discharged']
Preview:
S. No.	Category	State/UT	Number of Cases - Registered	Number of Cases - Quashed/Stayed by Courts	Number of Cases - Chargesheeted	Number of Cases - Final Report Submitted	Number of Police Personel - Arrested	Number of Police Personel - Chargesheeted	Number of Police Personel - Cases Withdrawn/Disposed Off	Number of Police Personel - Trials were Completed	Number of Police Personel - Convicted	Number of Police Personel - Acquitted or Discharged
0	1	State	Andhra Pradesh	97	2	45	5	0	61	0	11	1	10
1	2	State	Arunachal Pradesh	5	0	0	1	0	0	0	0	0	0
2	3	State	Assam	30	0	5	10	0	5	6	1	0	1
3	4	State	Bihar	17	0	11	1	0	63	55	0	0	0
4	5	State	Chhattisgarh	255	2	3	16	19	12	0	4	1	3
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/crime/Escapes from Police Custody
--------------------------------------------------------------------------------------

📄 File: 2016 Escapes from Police Custody.csv (0.00 MB)
Features: ['S. No.', 'Category', 'State/UT', 'Number of Cases Registered (U/S 224, 225 B)', 'Total Number of Persons Escaped from Police Custody', 'Persons Escaped from Lockup', 'Persons Escaped Outside the Lockup', 'Escapees Rearrested who Escaped - From Lockup', 'Escapees Rearrested who Escaped - Other than Lockup', 'Number of Persons Chargedsheeted for Offence of Escape', 'Disposal by Courts - Trials Completed - Cases Involved', 'Disposal by Courts - Trials Completed - Number of Persons', 'Disposal by Courts - Convicted - Cases Involved', 'Disposal by Courts - Convicted - Number of Persons', 'Disposal by Courts - Acquitted - Cases Involved', 'Disposal by Courts - Acquitted - Number of Persons', 'Disposal by Courts - Number Pending for Trial - Cases Involved', 'Disposal by Courts - Number Pending for Trial - Number of Persons']
Preview:
S. No.	Category	State/UT	Number of Cases Registered (U/S 224, 225 B)	Total Number of Persons Escaped from Police Custody	Persons Escaped from Lockup	Persons Escaped Outside the Lockup	Escapees Rearrested who Escaped - From Lockup	Escapees Rearrested who Escaped - Other than Lockup	Number of Persons Chargedsheeted for Offence of Escape	Disposal by Courts - Trials Completed - Cases Involved	Disposal by Courts - Trials Completed - Number of Persons	Disposal by Courts - Convicted - Cases Involved	Disposal by Courts - Convicted - Number of Persons	Disposal by Courts - Acquitted - Cases Involved	Disposal by Courts - Acquitted - Number of Persons	Disposal by Courts - Number Pending for Trial - Cases Involved	Disposal by Courts - Number Pending for Trial - Number of Persons
0	1	State	Andhra Pradesh	33	34	4	30	2	20	19	37	6	4	4	33	2	12	12
1	2	State	Arunachal Pradesh	8	18	14	4	13	4	9	0	0	0	0	0	0	2	6
2	3	State	Assam	39	42	8	34	8	14	10	3	3	3	3	0	0	4	4
3	4	State	Bihar	49	51	9	42	19	12	38	0	0	0	0	0	0	30	39
4	5	State	Chhattisgarh	27	28	1	27	1	18	16	0	0	0	0	0	0	14	13
........................................

📄 File: 2017 Escapes from Police Custody.csv (0.00 MB)
Features: ['S. No.', 'Category', 'State/UT', 'Cases Reported', 'Persons Escaped - From lockup', 'Persons Escaped - Outside Lockup', 'Persons Escaped - Total', 'Escapees - Re-Arrested', 'Escapees - Absconding', 'Cases against Police for Negligence', 'Action taken for Negligence - Police Personnel Arrested', 'Action taken for Negligence - Police Personnel Chargesheeted', 'Action taken for Negligence - Police Personnel Convicted']
Preview:
S. No.	Category	State/UT	Cases Reported	Persons Escaped - From lockup	Persons Escaped - Outside Lockup	Persons Escaped - Total	Escapees - Re-Arrested	Escapees - Absconding	Cases against Police for Negligence	Action taken for Negligence - Police Personnel Arrested	Action taken for Negligence - Police Personnel Chargesheeted	Action taken for Negligence - Police Personnel Convicted
0	1	State	Andhra Pradesh	36	3	35	38	33	4	0	0	0	1
1	2	State	Arunachal Pradesh	3	9	1	10	10	0	0	0	0	0
2	3	State	Assam	13	5	9	14	11	3	0	0	0	0
3	4	State	Bihar	62	15	50	65	43	16	0	0	4	0
4	5	State	Chhattisgarh	27	6	24	30	25	8	8	0	0	0
........................................

📄 File: 2018 Escapes from Police Custody.csv (0.00 MB)
Features: ['S. No.', 'Category', 'State/UT', 'Cases Reported', 'Persons Escaped - From lockup', 'Persons Escaped - Outside Lockup', 'Persons Escaped - Total', 'Escapees - Re-Arrested', 'Escapees - Absconding', 'Cases against Police for Negligence', 'Action taken for Negligence - Police Personnel Arrested', 'Action taken for Negligence - Police Personnel Chargesheeted', 'Action taken for Negligence - Police Personnel Convicted']
Preview:
S. No.	Category	State/UT	Cases Reported	Persons Escaped - From lockup	Persons Escaped - Outside Lockup	Persons Escaped - Total	Escapees - Re-Arrested	Escapees - Absconding	Cases against Police for Negligence	Action taken for Negligence - Police Personnel Arrested	Action taken for Negligence - Police Personnel Chargesheeted	Action taken for Negligence - Police Personnel Convicted
0	1	State	Andhra Pradesh	26	1	35	36	22	6	3	0	1	0
1	2	State	Arunachal Pradesh	2	2	0	2	2	0	0	0	0	0
2	3	State	Assam	38	25	12	37	6	28	0	0	0	0
3	4	State	Bihar	54	14	50	64	35	18	1	0	1	0
4	5	State	Chhattisgarh	31	5	27	32	24	15	0	0	0	0
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/crime/Victims of Rape
--------------------------------------------------------------------------

📄 File: 2016 Victims of Rape.csv (0.00 MB)
Features: ['S. No', 'Category', 'State/UT', 'Cases Reported', 'Child Victims of Rape (Below 18 Yrs) - Below 6 Years', 'Child Victims of Rape (Below 18 Yrs) - 6 Years & Above - Below 12 Years', 'Child Victims of Rape (Below 18 Yrs) - 12 Years & Above - Below 16 Years', 'Child Victims of Rape (Below 18 Yrs) - 16 Years & Above - Below 18 Years', 'Child Victims of Rape (Below 18 Yrs) - Total Girl /Child Victims', 'Women Victims of Rape (Above 18 Yrs) - 18 Years & Above - Below 30 Years', 'Women Victims of Rape (Above 18 Yrs) - 30 Years & Above - Below 45 Years', 'Women Victims of Rape (Above 18 Yrs) - 45 Years & Above - Below 60 Years', 'Women Victims of Rape (Above 18 Yrs) - 60 Years & Above', 'Women Victims of Rape (Above 18 Yrs) - Total Women/Adult Victims', 'Total Victims']
Preview:
S. No	Category	State/UT	Cases Reported	Child Victims of Rape (Below 18 Yrs) - Below 6 Years	Child Victims of Rape (Below 18 Yrs) - 6 Years & Above - Below 12 Years	Child Victims of Rape (Below 18 Yrs) - 12 Years & Above - Below 16 Years	Child Victims of Rape (Below 18 Yrs) - 16 Years & Above - Below 18 Years	Child Victims of Rape (Below 18 Yrs) - Total Girl /Child Victims	Women Victims of Rape (Above 18 Yrs) - 18 Years & Above - Below 30 Years	Women Victims of Rape (Above 18 Yrs) - 30 Years & Above - Below 45 Years	Women Victims of Rape (Above 18 Yrs) - 45 Years & Above - Below 60 Years	Women Victims of Rape (Above 18 Yrs) - 60 Years & Above	Women Victims of Rape (Above 18 Yrs) - Total Women/Adult Victims	Total Victims
0	1	State	Andhra Pradesh	988	14	46	185	296	541	333	121	6	4	464	1005
1	2	State	Arunachal Pradesh	59	1	9	19	13	42	24	5	0	0	29	71
2	3	State	Assam	1772	2	44	29	25	100	1291	582	75	0	1948	2048
3	4	State	Bihar	605	0	0	0	0	0	546	68	2	0	616	616
4	5	State	Chhattisgarh	1908	47	77	396	614	1134	525	245	14	8	792	1926
........................................

📄 File: 2017 Victims of Rape.csv (0.00 MB)
Features: ['S. No', 'Category', 'State/UT', 'Cases Reported', 'Child Victims of Rape (Below 18 Yrs) - Below 6 Years', 'Child Victims of Rape (Below 18 Yrs) - 6 Years & Above - Below 12 Years', 'Child Victims of Rape (Below 18 Yrs) - 12 Years & Above - Below 16 Years', 'Child Victims of Rape (Below 18 Yrs) - 16 Years & Above - Below 18 Years', 'Child Victims of Rape (Below 18 Yrs) - Total Girl /Child Victims', 'Women Victims of Rape (Above 18 Yrs) - 18 Years & Above - Below 30 Years', 'Women Victims of Rape (Above 18 Yrs) - 30 Years & Above - Below 45 Years', 'Women Victims of Rape (Above 18 Yrs) - 45 Years & Above - Below 60 Years', 'Women Victims of Rape (Above 18 Yrs) - 60 Years & Above', 'Women Victims of Rape (Above 18 Yrs) - Total Women/Adult Victims', 'Total Victims']
Preview:
S. No	Category	State/UT	Cases Reported	Child Victims of Rape (Below 18 Yrs) - Below 6 Years	Child Victims of Rape (Below 18 Yrs) - 6 Years & Above - Below 12 Years	Child Victims of Rape (Below 18 Yrs) - 12 Years & Above - Below 16 Years	Child Victims of Rape (Below 18 Yrs) - 16 Years & Above - Below 18 Years	Child Victims of Rape (Below 18 Yrs) - Total Girl /Child Victims	Women Victims of Rape (Above 18 Yrs) - 18 Years & Above - Below 30 Years	Women Victims of Rape (Above 18 Yrs) - 30 Years & Above - Below 45 Years	Women Victims of Rape (Above 18 Yrs) - 45 Years & Above - Below 60 Years	Women Victims of Rape (Above 18 Yrs) - 60 Years & Above	Women Victims of Rape (Above 18 Yrs) - Total Women/Adult Victims	Total Victims
0	1	State	Andhra Pradesh	988	14	46	185	296	541	333	121	6	4	464	1005
1	2	State	Arunachal Pradesh	59	1	9	19	13	42	24	5	0	0	29	71
2	3	State	Assam	1772	2	44	29	25	100	1291	582	75	0	1948	2048
3	4	State	Bihar	605	0	0	0	0	0	546	68	2	0	616	616
4	5	State	Chhattisgarh	1908	47	77	396	614	1134	525	245	14	8	792	1926
........................................

📄 File: 2018 Victims of Rape.csv (0.00 MB)
Features: ['S. No', 'Category', 'State/UT ', 'Cases Reported', 'Child Victims of Rape (Below 18 Yrs) - Below 6 Years', 'Child Victims of Rape (Below 18 Yrs) - 6 Years & Above ', 'Child Victims of Rape (Below 18 Yrs) - 12 Years & Above ', 'Child Victims of Rape (Below 18 Yrs) - 16 Years & Above ', 'Child Victims of Rape (Below 18 Yrs) - Total Girl/Child Victims', 'Women Victims of Rape (Above 18 Yrs) - 18 Years & Above - Below 30 Years', 'Women Victims of Rape (Above 18 Yrs) - 30 Years & Above - Below 45 Years', 'Women Victims of Rape (Above 18 Yrs) - 45 Years & Above - Below 60 Years', 'Women Victims of Rape (Above 18 Yrs) - 60 Years & Above', 'Women Victims of Rape (Above 18 Yrs) - Total Women/Adult Victims', 'Total Victims']
Preview:
S. No	Category	State/UT	Cases Reported	Child Victims of Rape (Below 18 Yrs) - Below 6 Years	Child Victims of Rape (Below 18 Yrs) - 6 Years & Above	Child Victims of Rape (Below 18 Yrs) - 12 Years & Above	Child Victims of Rape (Below 18 Yrs) - 16 Years & Above	Child Victims of Rape (Below 18 Yrs) - Total Girl/Child Victims	Women Victims of Rape (Above 18 Yrs) - 18 Years & Above - Below 30 Years	Women Victims of Rape (Above 18 Yrs) - 30 Years & Above - Below 45 Years	Women Victims of Rape (Above 18 Yrs) - 45 Years & Above - Below 60 Years	Women Victims of Rape (Above 18 Yrs) - 60 Years & Above	Women Victims of Rape (Above 18 Yrs) - Total Women/Adult Victims	Total Victims
0	1	State	Andhra Pradesh	971	16	57	181	251	505	373	76	14	5	468	973
1	2	State	Arunachal Pradesh	67	4	4	13	11	32	29	9	0	0	38	70
2	3	State	Assam	1648	7	24	6	52	89	1043	523	107	5	1678	1767
3	4	State	Bihar	651	0	0	1	3	4	520	111	16	0	647	651
4	5	State	Chhattisgarh	2091	41	80	557	541	1219	644	190	42	6	882	2101
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/weather
------------------------------------------------------------

📄 File: fix_weather.csv (2.10 MB)
Features: ['city', 'YEAR', 'month_label', 'precipitation', 'month', 'date']
Preview:
city	YEAR	month_label	precipitation	month	date
0	Andaman & Nicobar Islands	1901	JAN	49.2	1	1901-01-01
1	Andaman & Nicobar Islands	1902	JAN	0.0	1	1902-01-01
2	Andaman & Nicobar Islands	1903	JAN	12.7	1	1903-01-01
3	Andaman & Nicobar Islands	1904	JAN	9.4	1	1904-01-01
4	Andaman & Nicobar Islands	1905	JAN	1.3	1	1905-01-01
........................................

📄 File: Sub_Division_IMD_2017.csv (2.10 MB)
Features: ['city', 'YEAR', 'month_label', 'precipitation', 'month', 'date']
Preview:
city	YEAR	month_label	precipitation	month	date
0	Andaman & Nicobar Islands	1901	JAN	49.2	1	1901-01-01
1	Andaman & Nicobar Islands	1902	JAN	0.0	1	1902-01-01
2	Andaman & Nicobar Islands	1903	JAN	12.7	1	1903-01-01
3	Andaman & Nicobar Islands	1904	JAN	9.4	1	1904-01-01
4	Andaman & Nicobar Islands	1905	JAN	1.3	1	1905-01-01
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/weather/Weather_Data_Scraping_and_Analysis
-----------------------------------------------------------------------------------------------

📄 File: weather.csv (0.17 MB)
Features: ['Unnamed: 0', 'city', 'lat', 'lng']
Preview:
Unnamed: 0	city	lat	lng
0	0	Delhi	28.6100	77.2300
1	1	Mumbai	19.0761	72.8775
2	2	Kolkata	22.5675	88.3700
3	3	Bangalore	12.9789	77.5917
4	4	Chennai	13.0825	80.2750
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/weather/w_d_1
------------------------------------------------------------------

📄 File: Abbigeri.csv (19.77 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.619501	91.34468	18.169500	21.770710	0.0	0.0	0.0	0.0	...	942.51730	1.8	2.0	0.0	0.0	5.760000	12.313893	90.000000	105.25517	10.080000
1	1	2010-01-01 01:00:00+00:00	19.369501	91.04204	17.869501	21.319320	0.0	0.0	0.0	0.0	...	943.11240	0.0	0.0	0.0	0.0	6.214563	14.154915	79.992090	97.30567	12.599999
2	2	2010-01-01 02:00:00+00:00	19.669500	88.24221	17.669500	21.166674	0.0	0.0	0.0	0.0	...	944.11224	1.8	0.0	3.0	0.0	8.707238	16.575644	82.875084	92.48950	16.919998
3	3	2010-01-01 03:00:00+00:00	21.669500	78.01420	17.669500	22.908940	0.0	0.0	0.0	0.0	...	945.58875	1.8	0.0	3.0	0.0	10.464798	15.480000	86.054890	90.00000	24.119999
4	4	2010-01-01 04:00:00+00:00	23.719501	67.81361	17.419500	24.480686	0.0	0.0	0.0	0.0	...	946.41870	0.0	0.0	0.0	0.0	12.979984	16.622490	93.179770	94.96966	31.319998
5 rows × 21 columns

........................................

📄 File: Abdullahnagar.csv (19.65 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	10.4065	87.71776	8.4565	8.784169	0.0	0.0	0.0	0.0	...	1011.08453	0.0	0.0	0.0	0.0	8.350138	19.995400	277.43130	283.53586	12.240000
1	1	2010-01-01 01:00:00+00:00	10.0565	90.09657	8.5065	8.429230	0.0	0.0	0.0	0.0	...	1011.77606	0.0	0.0	0.0	0.0	8.473393	20.380579	282.26477	287.47485	10.799999
2	2	2010-01-01 02:00:00+00:00	11.2065	86.61571	9.0565	9.394749	0.0	0.0	0.0	0.0	...	1012.78973	0.0	0.0	0.0	0.0	10.739833	19.011953	283.57043	288.77814	15.119999
3	3	2010-01-01 03:00:00+00:00	14.4065	72.40965	9.5065	12.673269	0.0	0.0	0.0	0.0	...	1013.73596	0.0	0.0	0.0	0.0	11.043261	14.707222	289.02570	291.54105	18.720000
4	4	2010-01-01 04:00:00+00:00	16.7565	64.19996	9.9565	15.068995	0.0	0.0	0.0	0.0	...	1014.17050	0.0	0.0	0.0	0.0	11.592895	14.812590	295.76926	295.94223	21.960000
5 rows × 21 columns

........................................

📄 File: Abhayapuri.csv (19.63 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	13.558500	97.745660	13.2085	14.275818	0.0	0.0	0.0	0.0	...	1010.23834	82.500000	91.0	1.0	0.0	2.099143	1.527351	210.96368	224.99990	7.920000
1	1	2010-01-01 01:00:00+00:00	13.658501	97.429276	13.2585	14.266228	0.0	0.0	0.0	0.0	...	1011.23520	82.799995	92.0	0.0	0.0	2.968636	2.595997	165.96373	146.30990	9.360000
2	2	2010-01-01 02:00:00+00:00	14.308500	94.019050	13.3585	14.888342	0.0	0.0	0.0	0.0	...	1012.34050	80.100000	89.0	0.0	0.0	3.396233	4.213692	122.00535	109.98319	12.959999
3	3	2010-01-01 03:00:00+00:00	15.608500	87.322266	13.5085	16.103382	0.0	0.0	0.0	0.0	...	1013.35620	82.800000	90.0	3.0	0.0	4.334974	6.130579	85.23644	86.63361	16.199999
4	4	2010-01-01 04:00:00+00:00	17.408500	79.411964	13.8085	17.774988	0.0	0.0	0.0	0.0	...	1013.68256	62.100000	55.0	21.0	0.0	5.937272	7.695920	75.96373	79.21575	19.800000
5 rows × 21 columns

........................................

📄 File: Abhia.csv (19.69 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.893499	90.696890	8.4435	8.435502	0.0	0.0	0.0	0.0	...	1011.29803	0.0	0.0	0.0	0.0	7.200000	19.245697	270.00000	277.52370	11.520000
1	1	2010-01-01 01:00:00+00:00	9.593500	91.603390	8.2935	8.084888	0.0	0.0	0.0	0.0	...	1011.99054	0.0	0.0	0.0	0.0	7.280550	19.296133	278.53067	284.03625	11.520000
2	2	2010-01-01 02:00:00+00:00	10.643499	90.749344	9.1935	8.983034	0.0	0.0	0.0	0.0	...	1013.10200	0.0	0.0	0.0	0.0	9.957109	17.873554	282.52880	288.80000	14.040000
3	3	2010-01-01 03:00:00+00:00	14.393499	73.632200	9.7435	12.808083	0.0	0.0	0.0	0.0	...	1014.05530	0.0	0.0	0.0	0.0	10.483357	14.345898	285.94547	287.52567	18.359999
4	4	2010-01-01 04:00:00+00:00	16.693500	65.050590	10.0935	14.970982	0.0	0.0	0.0	0.0	...	1014.48785	0.0	0.0	0.0	0.0	12.101570	15.978484	292.75100	292.52060	22.680000
5 rows × 21 columns

........................................

📄 File: Abhwar.csv (19.65 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.993500	92.562065	8.8435	8.557529	0.0	0.0	0.0	0.0	...	1008.88710	0.0	0.0	0.0	0.0	7.771331	17.760810	283.39252	287.70050	11.520000
1	1	2010-01-01 01:00:00+00:00	9.543500	93.798040	8.5935	8.061006	0.0	0.0	0.0	0.0	...	1009.57166	0.0	0.0	0.0	0.0	7.636753	17.377226	278.13000	283.17255	10.440001
2	2	2010-01-01 02:00:00+00:00	10.343500	93.207080	9.2935	8.926702	0.0	0.0	0.0	0.0	...	1010.78280	0.0	0.0	0.0	0.0	8.473393	16.071491	282.26477	285.59286	14.400000
3	3	2010-01-01 03:00:00+00:00	13.943500	75.555470	9.6935	12.574165	0.0	0.0	0.0	0.0	...	1011.76060	0.0	0.0	0.0	0.0	8.905908	12.313893	284.03625	285.25516	17.640000
4	4	2010-01-01 04:00:00+00:00	16.293499	66.060420	9.9435	14.864895	0.0	0.0	0.0	0.0	...	1012.11273	0.0	0.0	0.0	0.0	9.793058	12.864649	287.10280	287.92800	20.880001
5 rows × 21 columns

........................................

📄 File: Abiramam.csv (19.92 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.904501	91.995180	19.554500	23.227000	0.0	0.0	0.0	0.0	...	1005.23346	0.900000	0.0	0.0	3.0	9.064569	19.852295	353.157320	4.159563	16.919998
1	1	2010-01-01 01:00:00+00:00	20.754500	91.986435	19.404501	22.959764	0.0	0.0	0.0	0.0	...	1005.82780	1.200000	0.0	0.0	4.0	9.366919	20.774214	2.202549	8.972550	17.640000
2	2	2010-01-01 02:00:00+00:00	21.704500	88.686730	19.754500	23.850122	0.0	0.0	0.0	0.0	...	1007.03827	3.600000	0.0	0.0	12.0	10.948973	20.696085	9.462261	13.069325	20.880001
3	3	2010-01-01 03:00:00+00:00	23.904501	80.800350	20.404501	26.129150	0.0	0.0	0.0	0.0	...	1007.97260	15.900001	0.0	0.0	53.0	12.641076	18.118410	19.983198	20.955858	25.919998
4	4	2010-01-01 04:00:00+00:00	25.854500	73.946266	20.854500	27.966152	0.0	0.0	0.0	0.0	...	1008.60360	5.400000	6.0	0.0	0.0	15.003839	20.316889	30.256361	29.744795	30.960001
5 rows × 21 columns

........................................

📄 File: Ablu.csv (19.06 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.10	93.408485	7.10	6.225119	0.0	0.0	0.0	0.0	...	990.36650	0.0	0.0	0.0	0.0	7.754637	11.119281	338.19852	330.94550	11.159999
1	1	2010-01-01 01:00:00+00:00	7.75	93.711730	6.80	5.781998	0.0	0.0	0.0	0.0	...	990.53064	0.0	0.0	0.0	0.0	7.903619	10.883676	329.93150	325.78424	11.520000
2	2	2010-01-01 02:00:00+00:00	7.60	93.062560	6.55	5.663067	0.0	0.0	0.0	0.0	...	991.00520	0.0	0.0	0.0	0.0	7.289445	10.514218	327.09476	321.95290	10.799999
3	3	2010-01-01 03:00:00+00:00	9.50	88.234406	7.65	8.109865	0.0	0.0	0.0	0.0	...	991.85430	0.0	0.0	0.0	0.0	5.351785	9.931042	312.27362	313.53125	9.720000
4	4	2010-01-01 04:00:00+00:00	14.10	71.867690	9.10	13.442694	0.0	0.0	0.0	0.0	...	992.83370	0.0	0.0	0.0	0.0	2.902413	8.587338	299.74478	303.02386	11.520000
5 rows × 21 columns

........................................

📄 File: Abohar.csv (19.42 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.580501	92.16609	7.3805	7.471521	0.0	0.0	0.0	0.0	...	992.42090	0.0	0.0	0.0	0.0	2.968636	5.904439	14.036275	322.43134	9.720000
1	1	2010-01-01 01:00:00+00:00	8.830501	90.93177	7.4305	7.851691	0.0	0.0	0.0	0.0	...	992.53894	0.0	0.0	0.0	0.0	2.160000	5.623380	360.000000	320.19450	8.640000
2	2	2010-01-01 02:00:00+00:00	9.830501	87.36736	7.8305	9.003378	0.0	0.0	0.0	0.0	...	993.20570	0.0	0.0	0.0	0.0	1.800000	5.600286	306.869960	315.00010	7.200000
3	3	2010-01-01 03:00:00+00:00	10.130500	86.80379	8.0305	9.170877	0.0	0.0	0.0	0.0	...	993.91394	0.0	0.0	0.0	0.0	3.054701	5.815978	224.999900	291.80148	5.400000
4	4	2010-01-01 04:00:00+00:00	14.230500	73.85076	9.6305	13.584192	0.0	0.0	0.0	0.0	...	994.82400	0.0	0.0	0.0	0.0	3.826853	7.200000	228.814180	270.00000	10.440001
5 rows × 21 columns

........................................

📄 File: Abu.csv (19.51 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	5.7805	65.58930	-0.1695	2.782062	0.0	0.0	0.0	0.0	...	881.6574	6.3	0.0	0.0	21.0	5.815978	9.693296	111.801476	111.801476	12.240000
1	1	2010-01-01 01:00:00+00:00	5.2805	69.14551	0.0805	2.299561	0.0	0.0	0.0	0.0	...	882.0459	0.0	0.0	0.0	0.0	5.959060	10.805998	115.016870	119.981550	12.599999
2	2	2010-01-01 02:00:00+00:00	4.8805	73.44937	0.5305	1.970246	0.0	0.0	0.0	0.0	...	882.3039	0.0	0.0	0.0	0.0	5.959060	11.183201	115.016870	123.178530	12.599999
3	3	2010-01-01 03:00:00+00:00	6.2805	75.29929	2.2305	3.469277	0.0	0.0	0.0	0.0	...	883.7881	0.0	0.0	0.0	0.0	7.244860	11.983188	116.564990	122.735220	14.040000
4	4	2010-01-01 04:00:00+00:00	12.2805	53.41197	3.0805	9.859444	0.0	0.0	0.0	0.0	...	886.9746	0.0	0.0	0.0	0.0	5.634891	11.486200	116.564990	122.195700	14.759999
5 rows × 21 columns

........................................

📄 File: Achaljamu.csv (19.50 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	7.641000	91.793040	6.391	5.622892	0.0	0.0	0.0	0.0	...	968.7825	0.0	0.0	0.0	0.0	7.594208	19.513195	301.42950	307.50420	14.040000
1	1	2010-01-01 01:00:00+00:00	7.291000	91.770990	6.041	5.148109	0.0	0.0	0.0	0.0	...	969.2011	0.0	0.0	0.0	0.0	7.903619	20.380579	300.06848	305.65543	13.679999
2	2	2010-01-01 02:00:00+00:00	8.341000	91.210014	6.991	6.066661	0.0	0.0	0.0	0.0	...	970.5180	0.0	0.0	0.0	0.0	10.315115	19.171478	299.24872	304.28693	15.119999
3	3	2010-01-01 03:00:00+00:00	12.990999	73.631830	8.391	11.127645	0.0	0.0	0.0	0.0	...	972.2255	0.0	0.0	0.0	0.0	9.885262	14.777550	303.11136	304.07724	17.640000
4	4	2010-01-01 04:00:00+00:00	15.391000	61.347565	7.991	12.969818	0.0	0.0	0.0	0.0	...	972.7008	0.0	0.0	0.0	0.0	13.004922	17.339897	311.63345	311.63345	22.680000
5 rows × 21 columns

........................................

📄 File: Achampet.csv (19.82 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	21.882	89.251976	20.032	25.124107	0.0	0.0	0.0	0.0	...	1007.45640	16.199999	9.0	12.0	3.0	4.379589	6.763786	80.537750	64.79892	7.559999
1	1	2010-01-01 01:00:00+00:00	21.282	92.017150	19.932	24.318666	0.0	0.0	0.0	0.0	...	1008.04297	4.800000	2.0	5.0	0.0	5.447788	7.559999	97.594550	90.00000	9.000000
2	2	2010-01-01 02:00:00+00:00	21.632	91.470400	20.182	24.904305	0.0	0.0	0.0	0.0	...	1009.04390	0.000000	0.0	0.0	0.0	4.693825	7.235910	94.398620	95.71050	12.240000
3	3	2010-01-01 03:00:00+00:00	24.682	70.166010	18.882	27.515150	0.0	0.0	0.0	0.0	...	1009.99225	0.600000	0.0	1.0	0.0	3.319036	4.024922	77.471200	79.69521	19.080000
4	4	2010-01-01 04:00:00+00:00	26.782	54.798630	16.932	28.706490	0.0	0.0	0.0	0.0	...	1010.52520	0.000000	0.0	0.0	0.0	3.545589	4.213692	66.037506	70.01681	24.119999
5 rows × 21 columns

........................................

📄 File: Acharipallam.csv (19.73 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	23.051	86.370950	20.651	25.814468	0.0	0.0	0.0	0.0	...	1006.8261	24.600000	4.0	0.0	70.0	9.826088	17.238699	28.442837	28.705854	25.919998
1	1	2010-01-01 01:00:00+00:00	22.951	86.627990	20.601	25.662855	0.0	0.0	0.0	0.0	...	1007.3242	30.900002	6.0	0.0	85.0	10.002560	17.906157	30.256361	30.173443	27.000000
2	2	2010-01-01 02:00:00+00:00	23.401	84.044136	20.551	25.841562	0.0	0.0	0.0	0.0	...	1008.5249	30.900002	3.0	0.0	94.0	11.681987	18.278645	33.690100	32.124966	30.239998
3	3	2010-01-01 03:00:00+00:00	25.101	73.364136	20.001	27.060574	0.0	0.0	0.0	0.0	...	1009.5377	27.300001	0.0	0.0	91.0	13.044722	17.713316	39.400646	37.568665	34.560000
4	4	2010-01-01 04:00:00+00:00	26.701	65.502140	19.701	27.957016	0.0	0.0	0.0	0.0	...	1010.2498	27.600000	0.0	0.0	92.0	16.831684	22.493519	41.531677	39.805527	43.199997
5 rows × 21 columns

........................................

📄 File: Achchippatti.csv (19.65 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.415000	90.473885	17.815	21.048414	0.0	0.0	0.0	0.0	...	979.32355	6.3	7.0	0.0	0.0	8.217153	17.253730	61.189304	66.64442	20.519999
1	1	2010-01-01 01:00:00+00:00	19.365000	91.041740	17.865	21.020765	0.0	0.0	0.0	0.0	...	979.89910	3.6	4.0	0.0	0.0	8.217153	17.399586	61.189304	65.55606	20.880001
2	2	2010-01-01 02:00:00+00:00	20.065000	89.671715	18.315	21.736275	0.0	0.0	0.0	0.0	...	980.94260	14.4	15.0	0.0	3.0	9.504273	16.981165	65.376460	68.87521	22.680000
3	3	2010-01-01 03:00:00+00:00	22.515001	79.867370	18.865	23.965616	0.0	0.0	0.0	0.0	...	981.97736	24.3	22.0	0.0	15.0	12.758432	18.000000	73.610380	73.73973	29.519999
4	4	2010-01-01 04:00:00+00:00	24.265001	71.639010	18.815	25.226725	0.0	0.0	0.0	0.0	...	982.64496	48.3	45.0	0.0	26.0	15.937878	21.971800	71.564964	71.86183	37.079998
5 rows × 21 columns

........................................

📄 File: Achhnera.csv (19.51 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.7565	87.566154	6.8065	6.908604	0.0	0.0	0.0	0.0	...	994.41974	0.0	0.0	0.0	0.0	7.091177	19.734436	293.96250	308.33337	12.599999
1	1	2010-01-01 01:00:00+00:00	8.4565	88.445640	6.6565	6.525185	0.0	0.0	0.0	0.0	...	995.37726	0.0	0.0	0.0	0.0	7.421590	17.373497	284.03625	304.01938	12.240000
2	2	2010-01-01 02:00:00+00:00	8.0065	89.942154	6.4565	6.212355	0.0	0.0	0.0	0.0	...	996.03000	0.0	0.0	0.0	0.0	6.162207	15.459054	276.70975	297.75842	11.159999
3	3	2010-01-01 03:00:00+00:00	10.0065	88.278750	8.1565	8.526960	0.0	0.0	0.0	0.0	...	997.25300	0.0	0.0	0.0	0.0	6.840000	13.570615	270.00000	291.80148	13.679999
4	4	2010-01-01 04:00:00+00:00	14.4565	68.620220	8.7565	13.395401	0.0	0.0	0.0	0.0	...	998.25604	0.0	0.0	0.0	0.0	5.040000	8.825508	270.00000	281.76825	14.040000
5 rows × 21 columns

........................................

📄 File: Adalaj.csv (19.54 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	15.576000	52.080580	5.776	12.857841	0.0	0.0	0.0	0.0	...	1005.95890	2.4	0.0	0.0	8.0	11.440979	26.208395	65.854460	74.054535	20.519999
1	1	2010-01-01 01:00:00+00:00	15.376000	53.302536	5.926	12.549421	0.0	0.0	0.0	0.0	...	1006.64820	0.3	0.0	0.0	1.0	12.413476	27.288855	73.141520	81.656200	21.240000
2	2	2010-01-01 02:00:00+00:00	15.226000	54.566593	6.126	12.408236	0.0	0.0	0.0	0.0	...	1007.14075	0.0	0.0	0.0	0.0	12.661564	27.511160	75.173480	83.991090	21.240000
3	3	2010-01-01 03:00:00+00:00	16.575998	51.989407	6.676	13.527229	0.0	0.0	0.0	0.0	...	1008.16860	0.0	0.0	0.0	0.0	15.111424	26.795223	77.619255	83.829926	23.039999
4	4	2010-01-01 04:00:00+00:00	19.575998	43.953785	6.976	16.638260	0.0	0.0	0.0	0.0	...	1008.94116	0.0	0.0	0.0	0.0	14.830076	21.626984	84.427900	87.137660	27.000000
5 rows × 21 columns

........................................

📄 File: Adalpur.csv (19.65 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.932500	92.246470	8.7325	8.632310	0.0	0.0	0.0	0.0	...	1009.71484	0.0	0.0	0.0	0.0	6.638072	16.808569	282.52880	279.86575	10.799999
1	1	2010-01-01 01:00:00+00:00	9.382501	93.790380	8.4325	7.961765	0.0	0.0	0.0	0.0	...	1010.39910	0.0	0.0	0.0	0.0	6.924738	15.328561	278.97253	279.46225	10.799999
2	2	2010-01-01 02:00:00+00:00	10.032500	93.821290	9.0825	8.680307	0.0	0.0	0.0	0.0	...	1011.60590	0.0	0.0	0.0	0.0	7.636753	14.618837	278.13000	279.92618	10.799999
3	3	2010-01-01 03:00:00+00:00	13.582500	77.550600	9.7325	12.426710	0.0	0.0	0.0	0.0	...	1012.67410	0.0	0.0	0.0	0.0	7.517021	10.390226	286.69930	284.03625	15.119999
4	4	2010-01-01 04:00:00+00:00	15.982500	67.786064	10.0325	14.710854	0.0	0.0	0.0	0.0	...	1013.12060	0.0	0.0	0.0	0.0	8.891344	11.165805	291.37070	290.77234	17.640000
5 rows × 21 columns

........................................

📄 File: Adamankottai.csv (19.50 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.198	97.23121	18.748	21.788502	0.0	0.0	0.0	0.0	...	956.81360	25.199999	26.0	3.0	0.0	4.582052	9.686609	44.999897	48.012870	12.240000
1	1	2010-01-01 01:00:00+00:00	19.098	96.92544	18.598	21.654490	0.0	0.0	0.0	0.0	...	957.36220	20.700000	19.0	6.0	0.0	4.334974	9.422101	41.633450	46.548110	11.879999
2	2	2010-01-01 02:00:00+00:00	19.448	96.63147	18.898	21.916174	0.0	0.0	0.0	0.0	...	958.37170	10.500000	11.0	1.0	0.0	5.904439	9.449572	37.568665	40.364468	14.400000
3	3	2010-01-01 03:00:00+00:00	21.948	80.54372	18.448	24.056543	0.0	0.0	0.0	0.0	...	959.58325	6.300000	7.0	0.0	0.0	6.915374	9.178235	38.659830	41.820090	19.080000
4	4	2010-01-01 04:00:00+00:00	23.698	66.74612	17.148	25.044388	0.0	0.0	0.0	0.0	...	960.55990	0.900000	1.0	0.0	0.0	8.161764	10.464797	48.576430	49.185013	22.680000
5 rows × 21 columns

........................................

📄 File: Adampur.csv (19.40 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	7.572	85.95250	5.372	5.632844	0.0	0.0	0.0	0.0	...	984.9096	0.0	0.0	0.0	0.0	5.495161	8.557102	31.607454	345.37910	8.64
1	1	2010-01-01 01:00:00+00:00	7.722	85.37392	5.422	5.819903	0.0	0.0	0.0	0.0	...	985.1195	0.0	0.0	0.0	0.0	5.315336	8.225035	28.300660	336.80140	8.28
2	2	2010-01-01 02:00:00+00:00	6.872	87.69451	4.972	4.827021	0.0	0.0	0.0	0.0	...	985.8060	0.0	0.0	0.0	0.0	5.634891	9.693296	26.564985	338.19852	8.28
3	3	2010-01-01 03:00:00+00:00	8.372	84.56334	5.922	6.436770	0.0	0.0	0.0	0.0	...	986.6431	0.0	0.0	0.0	0.0	6.297428	10.483357	30.963696	344.05453	9.00
4	4	2010-01-01 04:00:00+00:00	12.372	71.54288	7.372	11.114004	0.0	0.0	0.0	0.0	...	987.6394	0.0	0.0	0.0	0.0	3.976330	9.605998	5.194350	347.00537	12.24
5 rows × 21 columns

........................................

📄 File: Addanki.csv (19.55 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.00	96.645340	19.45	23.053500	0.0	0.0	0.0	0.0	...	1007.49475	12.299999	9.0	7.0	0.0	3.706427	3.415260	330.945500	288.435030	7.200000
1	1	2010-01-01 01:00:00+00:00	19.90	96.943910	19.40	22.629745	0.0	0.0	0.0	0.0	...	1008.18980	14.099998	12.0	4.0	3.0	5.760000	7.280550	360.000000	8.530692	6.479999
2	2	2010-01-01 02:00:00+00:00	20.75	95.180336	19.95	23.519810	0.0	0.0	0.0	0.0	...	1009.29834	9.000000	10.0	0.0	0.0	7.342588	11.966953	11.309895	21.161337	9.720000
3	3	2010-01-01 03:00:00+00:00	24.10	79.588790	20.35	27.104527	0.0	0.0	0.0	0.0	...	1010.24710	23.400000	26.0	0.0	0.0	7.100310	9.387651	30.465475	32.471172	14.759999
4	4	2010-01-01 04:00:00+00:00	26.05	69.771290	20.10	28.879639	0.0	0.0	0.0	0.0	...	1010.87476	25.199999	28.0	0.0	0.0	7.412853	9.339208	60.945490	62.447273	19.440000
5 rows × 21 columns

........................................

📄 File: Adigappadi.csv (19.83 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.282500	97.232950	18.832499	22.096884	0.0	0.0	0.0	0.0	...	958.55176	36.0	40.0	0.0	0.0	3.319036	6.989936	49.398785	55.491425	10.080000
1	1	2010-01-01 01:00:00+00:00	19.182499	96.927390	18.682499	22.000504	0.0	0.0	0.0	0.0	...	959.10210	36.6	40.0	1.0	0.0	2.811690	6.915374	39.805527	51.340170	9.720000
2	2	2010-01-01 02:00:00+00:00	19.532500	96.633590	18.982500	22.217240	0.0	0.0	0.0	0.0	...	960.11140	36.0	40.0	0.0	0.0	4.693826	7.200000	32.471172	36.869990	11.520000
3	3	2010-01-01 03:00:00+00:00	22.032500	80.554900	18.532500	24.327488	0.0	0.0	0.0	0.0	...	961.40730	18.0	20.0	0.0	0.0	5.904439	7.928177	37.568665	39.472430	17.640000
4	4	2010-01-01 04:00:00+00:00	23.782500	66.763405	17.232500	25.262987	0.0	0.0	0.0	0.0	...	962.28200	4.5	5.0	0.0	0.0	7.491114	10.086427	54.782326	55.175446	22.319998
5 rows × 21 columns

........................................

📄 File: Adigaratti.csv (19.61 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	13.7095	96.48175	13.1595	14.448387	0.0	0.0	0.0	0.0	...	799.97174	53.700000	55.0	7.0	0.0	1.835647	6.439876	168.69011	116.56499	11.879999
1	1	2010-01-01 01:00:00+00:00	13.5095	97.10876	13.0595	14.214216	0.0	0.0	0.0	0.0	...	800.31620	50.699997	53.0	5.0	0.0	1.835647	6.924738	168.69011	117.89718	12.959999
2	2	2010-01-01 02:00:00+00:00	14.2595	94.63144	13.4095	14.952528	0.0	0.0	0.0	0.0	...	801.58940	57.600000	62.0	3.0	0.0	2.741678	6.287130	156.80138	113.62939	15.480000
3	3	2010-01-01 03:00:00+00:00	16.8095	84.37930	14.1595	17.569685	0.0	0.0	0.0	0.0	...	803.93140	13.200000	14.0	1.0	0.0	4.104631	6.287130	105.25517	103.24053	21.599998
4	4	2010-01-01 04:00:00+00:00	18.5095	77.54110	14.5095	18.840950	0.0	0.0	0.0	0.0	...	805.40140	22.499998	22.0	3.0	3.0	7.920000	10.799999	90.00000	90.00000	29.880000
5 rows × 21 columns

........................................

📄 File: Adigoppula.csv (19.72 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	22.020500	85.471770	19.470500	25.008370	0.0	0.0	0.0	0.0	...	995.66016	14.100000	13.0	4.0	0.0	4.213692	5.692100	19.983198	18.435053	5.760000
1	1	2010-01-01 01:00:00+00:00	21.320501	90.043860	19.620500	24.282917	0.0	0.0	0.0	0.0	...	996.30840	9.299999	9.0	2.0	0.0	4.896530	7.993297	36.027473	35.837746	7.920000
2	2	2010-01-01 02:00:00+00:00	21.620500	89.508920	19.820501	24.763517	0.0	0.0	0.0	0.0	...	997.40717	1.800000	2.0	0.0	0.0	4.334974	8.404285	41.633450	43.264330	10.080000
3	3	2010-01-01 03:00:00+00:00	24.420500	68.811584	18.320501	26.792156	0.0	0.0	0.0	0.0	...	998.45050	0.900000	1.0	0.0	0.0	4.693826	5.991594	32.471172	32.735230	19.080000
4	4	2010-01-01 04:00:00+00:00	26.320501	57.893818	17.370500	28.204632	0.0	0.0	0.0	0.0	...	998.94965	0.000000	0.0	0.0	0.0	5.116561	6.369050	39.289394	42.709366	24.119999
5 rows × 21 columns

........................................

📄 File: Adilabad.csv (19.52 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	14.563000	80.858270	11.313000	13.933136	0.0	0.0	0.0	0.0	...	983.76685	0.0	0.0	0.0	0.0	7.100310	18.678415	59.534540	62.447273	14.040000
1	1	2010-01-01 01:00:00+00:00	13.912999	82.397610	10.962999	13.248150	0.0	0.0	0.0	0.0	...	984.57166	0.0	0.0	0.0	0.0	6.608722	17.873556	60.642340	62.402794	12.959999
2	2	2010-01-01 02:00:00+00:00	13.763000	83.203865	10.962999	12.954458	0.0	0.0	0.0	0.0	...	985.52560	0.0	0.0	0.0	0.0	7.594208	17.068707	58.570484	62.354122	12.599999
3	3	2010-01-01 03:00:00+00:00	17.363000	63.907013	10.462999	16.215630	0.0	0.0	0.0	0.0	...	986.96735	0.0	0.0	0.0	0.0	8.891343	13.708390	58.240574	60.068577	18.359999
4	4	2010-01-01 04:00:00+00:00	19.863000	53.928684	10.263000	18.566048	0.0	0.0	0.0	0.0	...	987.41626	0.0	0.0	0.0	0.0	9.511088	13.044723	60.524208	62.020620	23.039999
5 rows × 21 columns

........................................

📄 File: Adivala.csv (19.63 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.273500	99.07003	19.123500	22.025710	0.0	0.0	0.0	0.0	...	944.34960	0.6	0.0	1.0	0.0	4.693826	10.972620	122.471176	131.008990	10.440001
1	1	2010-01-01 01:00:00+00:00	19.423500	98.76313	19.223501	22.078062	0.0	0.0	0.0	0.0	...	945.03610	0.0	0.0	0.0	0.0	5.692099	12.819235	124.695220	128.157270	12.240000
2	2	2010-01-01 02:00:00+00:00	19.673500	98.45891	19.423500	22.098654	0.0	0.0	0.0	0.0	...	945.93146	0.0	0.0	0.0	0.0	7.928177	14.291592	129.472430	130.914290	14.040000
3	3	2010-01-01 03:00:00+00:00	21.173500	91.72603	19.773500	23.769539	0.0	0.0	0.0	0.0	...	947.10310	0.0	0.0	0.0	0.0	7.928177	10.972620	129.472430	131.008990	17.640000
4	4	2010-01-01 04:00:00+00:00	23.823502	72.46117	18.573502	25.631980	0.0	0.0	0.0	0.0	...	948.14840	0.0	0.0	0.0	0.0	9.360001	12.101570	112.619910	112.751015	24.119999
5 rows × 21 columns

........................................

📄 File: Adiyakkamangalam.csv (19.63 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	23.648	79.52673	19.898	25.135630	0.0	0.0	0.0	0.0	...	1008.87330	51.300000	57.0	0.0	0.0	15.937878	22.206486	18.435053	16.966234	24.119999
1	1	2010-01-01 01:00:00+00:00	23.648	80.26887	20.048	25.094591	0.0	0.0	0.0	0.0	...	1009.57214	48.600000	54.0	0.0	0.0	16.735160	22.768398	18.824812	18.435053	25.199999
2	2	2010-01-01 02:00:00+00:00	23.998	80.31542	20.398	25.525259	0.0	0.0	0.0	0.0	...	1010.67230	44.100000	49.0	0.0	0.0	17.399586	22.406927	24.443953	23.682100	26.640000
3	3	2010-01-01 03:00:00+00:00	25.248	76.39181	20.798	26.925476	0.0	0.0	0.0	0.0	...	1011.57760	44.100000	49.0	0.0	0.0	17.782686	21.178896	31.759440	31.798878	28.440000
4	4	2010-01-01 04:00:00+00:00	26.498	71.15826	20.848	27.889328	0.0	0.0	0.0	0.0	...	1012.38293	43.199997	48.0	0.0	0.0	19.914215	24.014996	40.601215	40.135426	30.239998
5 rows × 21 columns

........................................

📄 File: Adoni.csv (19.71 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	21.578000	75.335990	17.028000	22.736820	0.0	0.0	0.0	0.0	...	964.09770	16.199999	16.0	3.0	0.0	9.107359	18.204042	108.435040	114.537710	15.840000
1	1	2010-01-01 01:00:00+00:00	20.977999	78.655450	17.127998	22.145218	0.0	0.0	0.0	0.0	...	964.76460	13.500000	15.0	0.0	0.0	9.346143	18.584510	105.642310	111.595375	16.199999
2	2	2010-01-01 02:00:00+00:00	21.178000	78.188400	17.227999	22.207008	0.0	0.0	0.0	0.0	...	965.65344	10.799999	12.0	0.0	0.0	10.587917	18.250260	107.818985	112.011340	18.000000
3	3	2010-01-01 03:00:00+00:00	23.078000	67.900100	16.828000	23.850613	0.0	0.0	0.0	0.0	...	966.81134	7.200000	8.0	0.0	0.0	11.165805	15.042659	110.772330	111.037580	24.119999
4	4	2010-01-01 04:00:00+00:00	25.278000	57.827522	16.377998	25.693836	0.0	0.0	0.0	0.0	...	967.44116	0.000000	0.0	0.0	0.0	12.313893	15.379206	105.255170	106.313930	29.519999
5 rows × 21 columns

........................................

📄 File: Adra.csv (19.56 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	10.211000	91.952290	8.961000	8.731137	0.0	0.0	0.0	0.0	...	994.33154	0.0	0.0	0.0	0.0	8.287822	20.447239	325.61960	333.88614	12.599999
1	1	2010-01-01 01:00:00+00:00	9.711000	92.546036	8.561001	8.283682	0.0	0.0	0.0	0.0	...	994.88055	0.0	0.0	0.0	0.0	7.200000	19.022177	323.13000	330.52420	11.159999
2	2	2010-01-01 02:00:00+00:00	10.611000	91.360060	9.261001	9.156650	0.0	0.0	0.0	0.0	...	996.12310	0.0	0.0	0.0	0.0	8.669949	16.873980	318.36655	326.30990	13.320000
3	3	2010-01-01 03:00:00+00:00	14.561001	70.754770	9.311001	13.154228	0.0	0.0	0.0	0.0	...	997.39716	0.3	0.0	0.0	1.0	8.435069	12.313894	320.19450	322.12497	16.919998
4	4	2010-01-01 04:00:00+00:00	17.011000	58.292862	8.761001	15.127256	0.0	0.0	0.0	0.0	...	997.77240	0.0	0.0	0.0	0.0	10.685391	14.277983	327.38077	326.30990	21.240000
5 rows × 21 columns

........................................

📄 File: Advi Devalpalli.csv (19.65 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	22.730000	78.659805	18.830000	25.267351	0.0	0.0	0.0	0.0	...	1002.25770	18.9	17.0	5.0	2.0	5.191994	11.923557	33.690100	28.886486	9.720000
1	1	2010-01-01 01:00:00+00:00	22.279999	78.841920	18.429998	24.645992	0.0	0.0	0.0	0.0	...	1002.83620	9.6	10.0	1.0	0.0	5.091168	11.753876	44.999897	40.030197	11.520000
2	2	2010-01-01 02:00:00+00:00	22.380000	74.756380	17.679998	24.329556	0.0	0.0	0.0	0.0	...	1003.92834	2.7	3.0	0.0	0.0	5.623380	10.440000	39.805527	43.602894	14.759999
3	3	2010-01-01 03:00:00+00:00	24.630000	56.032246	15.280000	25.530409	0.0	0.0	0.0	0.0	...	1004.99603	5.1	5.0	1.0	0.0	5.991594	7.787991	32.735230	33.690100	22.680000
4	4	2010-01-01 04:00:00+00:00	26.679998	44.598278	13.630000	26.949417	0.0	0.0	0.0	0.0	...	1005.46204	0.9	1.0	0.0	0.0	6.130579	7.421590	40.236294	39.093860	26.280000
5 rows × 21 columns

........................................

📄 File: Adyar.csv (19.68 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	22.966501	93.531910	21.866500	27.222700	0.0	0.0	0.0	0.0	...	997.65240	0.000000	0.0	0.0	0.0	4.072935	7.200000	44.999897	36.869990	10.080000
1	1	2010-01-01 01:00:00+00:00	22.916500	93.529550	21.816502	27.198465	0.0	0.0	0.0	0.0	...	998.34270	0.000000	0.0	0.0	0.0	3.706427	6.409617	60.945490	51.842735	10.799999
2	2	2010-01-01 02:00:00+00:00	22.916500	93.244380	21.766500	26.968860	0.0	0.0	0.0	0.0	...	999.23254	29.699999	33.0	0.0	0.0	5.091168	6.519877	81.869990	83.659904	12.240000
3	3	2010-01-01 03:00:00+00:00	24.266500	88.082924	22.166500	28.546257	0.0	0.0	0.0	0.0	...	1000.17410	0.000000	0.0	0.0	0.0	5.052841	7.636753	94.085540	98.130020	13.679999
4	4	2010-01-01 04:00:00+00:00	25.866500	80.561260	22.266500	30.173240	0.0	0.0	0.0	0.0	...	1000.92676	0.000000	0.0	0.0	0.0	5.241679	6.989935	105.945465	101.888630	13.320000
5 rows × 21 columns

........................................

📄 File: Afzala.csv (19.69 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	10.119500	92.257500	8.919499	8.838272	0.0	0.0	0.0	0.0	...	1010.10610	0.0	0.0	0.0	0.0	6.849467	17.819090	273.01273	278.13000	11.159999
1	1	2010-01-01 01:00:00+00:00	9.669499	93.804054	8.719500	8.330901	0.0	0.0	0.0	0.0	...	1010.89294	0.0	0.0	0.0	0.0	6.877790	16.808569	276.00890	279.86575	10.080000
2	2	2010-01-01 02:00:00+00:00	10.319500	93.205830	9.269500	8.914111	0.0	0.0	0.0	0.0	...	1011.99960	0.0	0.0	0.0	0.0	8.350138	15.745627	277.43130	280.53912	13.320000
3	3	2010-01-01 03:00:00+00:00	13.919499	76.315010	9.819500	12.597342	0.0	0.0	0.0	0.0	...	1013.06310	0.0	0.0	0.0	0.0	8.825508	11.874544	281.76825	284.03625	16.560000
4	4	2010-01-01 04:00:00+00:00	16.369501	66.297980	10.069500	14.910824	0.0	0.0	0.0	0.0	...	1013.50680	0.0	0.0	0.0	0.0	10.245780	12.864649	288.43503	287.92800	19.800000
5 rows × 21 columns

........................................

📄 File: Afzalpur.csv (19.67 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.2215	67.10406	13.9215	19.875576	0.0	0.0	0.0	0.0	...	965.59870	12.300000	3.0	16.0	0.0	11.090103	22.253124	76.865974	80.69013	23.400000
1	1	2010-01-01 01:00:00+00:00	20.0715	69.73225	14.3715	19.876202	0.0	0.0	0.0	0.0	...	966.33813	17.400002	10.0	14.0	0.0	11.177405	22.608458	75.068535	80.83774	22.680000
2	2	2010-01-01 02:00:00+00:00	20.2215	71.35360	14.8715	20.029957	0.0	0.0	0.0	0.0	...	967.12445	0.900000	1.0	0.0	0.0	12.429127	22.424270	79.992090	84.47256	22.319998
3	3	2010-01-01 03:00:00+00:00	22.3215	65.61719	15.5715	22.268621	0.0	0.0	0.0	0.0	...	968.49910	0.000000	0.0	0.0	0.0	13.320000	18.720000	90.000000	90.00000	27.720000
4	4	2010-01-01 04:00:00+00:00	24.6215	59.92085	16.3215	24.606745	0.0	0.0	0.0	0.0	...	969.13690	0.000000	0.0	0.0	0.0	15.111424	19.296133	102.380750	104.03627	34.560000
5 rows × 21 columns

........................................

📄 File: Agadallanka.csv (19.52 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.980500	97.24744	19.530499	22.929360	0.0	0.0	0.0	0.0	...	1011.87420	9.3	4.0	9.0	1.0	4.693826	9.220499	32.471172	51.340170	7.559999
1	1	2010-01-01 01:00:00+00:00	19.630499	97.84765	19.280499	22.438150	0.0	0.0	0.0	0.0	...	1012.47270	13.5	2.0	15.0	9.0	4.829907	10.440000	26.564985	46.397110	8.280000
2	2	2010-01-01 02:00:00+00:00	20.480500	96.65739	19.930500	23.437784	0.0	0.0	0.0	0.0	...	1013.47440	2.7	0.0	0.0	9.0	5.991594	10.195057	32.735230	47.862484	10.440001
3	3	2010-01-01 03:00:00+00:00	23.630499	82.78459	20.530499	27.049763	0.0	0.0	0.0	0.0	...	1014.38230	0.0	0.0	0.0	0.0	4.896530	6.489992	53.972538	56.309900	14.040000
4	4	2010-01-01 04:00:00+00:00	25.780499	70.80823	20.080500	28.967579	0.0	0.0	0.0	0.0	...	1014.98785	0.0	0.0	0.0	0.0	4.896529	6.151683	72.897190	69.443870	16.560000
5 rows × 21 columns

........................................

📄 File: Agadi.csv (19.70 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.882000	94.557594	18.981998	22.508308	0.0	0.0	0.0	0.0	...	949.81104	2.1	1.0	2.0	0.0	5.091168	13.363711	81.869990	85.364624	11.520000
1	1	2010-01-01 01:00:00+00:00	19.831999	93.381676	18.731998	22.241138	0.0	0.0	0.0	0.0	...	950.45844	6.9	1.0	10.0	0.0	5.771239	15.137133	86.423744	92.726260	12.959999
2	2	2010-01-01 02:00:00+00:00	19.932000	92.226270	18.632000	21.928448	0.0	0.0	0.0	0.0	...	951.22986	6.6	0.0	11.0	0.0	8.280000	16.299694	90.000000	96.340096	14.759999
3	3	2010-01-01 03:00:00+00:00	21.882000	81.805660	18.632000	23.771942	0.0	0.0	0.0	0.0	...	952.56256	7.8	0.0	13.0	0.0	9.000000	14.058450	90.000000	92.935616	21.240000
4	4	2010-01-01 04:00:00+00:00	24.182000	70.071915	18.382000	25.683773	0.0	0.0	0.0	0.0	...	953.49036	1.2	0.0	2.0	0.0	10.853866	14.113653	95.710500	95.855920	27.720000
5 rows × 21 columns

........................................

📄 File: Agar.csv (19.61 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.485499	77.437675	5.7355	7.407910	0.0	0.0	0.0	0.0	...	954.29456	0.0	0.0	0.0	0.0	6.989936	17.496150	124.50858	126.634210	12.959999
1	1	2010-01-01 01:00:00+00:00	9.135500	79.008490	5.6855	6.985191	0.0	0.0	0.0	0.0	...	955.06683	0.0	0.0	0.0	0.0	7.412853	17.287498	119.05451	121.372955	12.959999
2	2	2010-01-01 02:00:00+00:00	8.885500	80.909670	5.7855	6.899160	0.0	0.0	0.0	0.0	...	955.48380	0.0	0.0	0.0	0.0	6.439876	16.583460	116.56499	117.121230	12.959999
3	3	2010-01-01 03:00:00+00:00	11.485499	78.548550	7.8855	9.807467	0.0	0.0	0.0	0.0	...	957.06040	0.0	0.0	0.0	0.0	7.729527	16.099690	117.75845	116.564990	14.400000
4	4	2010-01-01 04:00:00+00:00	16.635500	50.246780	6.2355	14.537388	0.0	0.0	0.0	0.0	...	958.67267	0.0	0.0	0.0	0.0	7.895416	11.113451	114.22774	114.904740	17.280000
5 rows × 21 columns

........................................

📄 File: Agaram.csv (19.65 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	21.056	89.18818	19.206	24.082440	0.0	0.0	0.0	0.0	...	984.7961	10.799999	12.0	0.0	0.0	3.075841	8.669949	110.556130	85.236440	9.720000
1	1	2010-01-01 01:00:00+00:00	21.106	90.02849	19.406	24.341557	0.0	0.0	0.0	0.0	...	985.3849	1.800000	2.0	0.0	0.0	2.305125	7.695920	128.659840	79.215750	9.720000
2	2	2010-01-01 02:00:00+00:00	21.506	89.50028	19.706	24.918385	0.0	0.0	0.0	0.0	...	986.5890	33.600000	37.0	0.0	1.0	2.099143	6.830519	120.963690	71.564964	10.440001
3	3	2010-01-01 03:00:00+00:00	23.456	80.74195	19.956	26.731672	0.0	0.0	0.0	0.0	...	987.6381	1.800000	0.0	0.0	6.0	3.877318	5.634891	68.198530	63.435013	15.480000
4	4	2010-01-01 04:00:00+00:00	24.756	73.53280	19.706	27.597559	0.0	0.0	0.0	0.0	...	988.4340	8.100000	4.0	0.0	15.0	5.991594	8.089994	57.264786	57.724377	20.519999
5 rows × 21 columns

........................................

📄 File: Agarpur.csv (19.72 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.730500	89.462740	8.080501	8.179056	0.0	0.0	0.0	0.0	...	1011.05164	0.0	0.0	0.0	0.0	7.200000	19.201874	270.00000	276.45870	11.879999
1	1	2010-01-01 01:00:00+00:00	9.380500	90.352940	7.880500	7.757626	0.0	0.0	0.0	0.0	...	1011.84200	0.0	0.0	0.0	0.0	7.342588	19.296133	281.30990	284.03625	11.159999
2	2	2010-01-01 02:00:00+00:00	10.430500	89.820670	8.830501	8.710786	0.0	0.0	0.0	0.0	...	1012.85480	0.0	0.0	0.0	0.0	9.693295	18.214718	285.06854	288.43503	13.679999
3	3	2010-01-01 03:00:00+00:00	14.430500	71.929240	9.430500	12.808310	0.0	0.0	0.0	0.0	...	1013.91473	0.0	0.0	0.0	0.0	10.137692	14.345898	286.50443	287.52567	18.000000
4	4	2010-01-01 04:00:00+00:00	16.880499	63.373695	9.880500	15.116825	0.0	0.0	0.0	0.0	...	1014.35150	0.0	0.0	0.0	0.0	11.966953	15.844089	291.16132	291.31800	21.960000
5 rows × 21 columns

........................................

📄 File: Agartala.csv (19.72 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	12.923500	91.509056	11.5735	12.358969	0.0	0.0	0.0	0.0	...	1012.96870	2.4	2.0	0.0	2.0	7.208994	15.745627	357.13766	349.46088	11.879999
1	1	2010-01-01 01:00:00+00:00	12.523499	92.703450	11.3735	12.106451	0.0	0.0	0.0	0.0	...	1013.96540	0.0	0.0	0.0	0.0	5.771239	15.629972	356.42374	352.05660	11.159999
2	2	2010-01-01 02:00:00+00:00	14.623500	84.969060	12.1235	14.281900	0.0	0.0	0.0	0.0	...	1014.87415	0.9	1.0	0.0	0.0	6.877790	13.397612	353.99110	353.82993	14.759999
3	3	2010-01-01 03:00:00+00:00	17.523500	70.616165	12.1235	17.181072	0.0	0.0	0.0	0.0	...	1015.78600	0.0	0.0	0.0	0.0	6.877790	9.387650	353.99110	355.60138	18.359999
4	4	2010-01-01 04:00:00+00:00	19.723501	62.555145	12.3735	19.414530	0.0	0.0	0.0	0.0	...	1015.99567	0.0	0.0	0.0	0.0	7.200000	9.000000	360.00000	360.00000	20.160000
5 rows × 21 columns

........................................

📄 File: Aginiparru.csv (19.73 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.437000	93.12084	19.286999	23.245237	0.0	0.0	0.0	0.0	...	1003.19086	18.6	2.0	26.0	4.0	4.843305	5.483357	41.987130	66.801384	7.920000
1	1	2010-01-01 01:00:00+00:00	20.536999	92.54824	19.286999	23.271006	0.0	0.0	0.0	0.0	...	1003.68930	14.1	0.0	17.0	13.0	5.351785	5.692100	47.726370	71.564964	6.479999
2	2	2010-01-01 02:00:00+00:00	20.737000	93.13597	19.587000	23.683426	0.0	0.0	0.0	0.0	...	1004.68646	2.1	1.0	2.0	0.0	4.896530	7.289444	53.972538	69.775055	7.200000
3	3	2010-01-01 03:00:00+00:00	23.187000	82.98842	20.137000	26.505037	0.0	0.0	0.0	0.0	...	1005.65680	0.0	0.0	0.0	0.0	4.213692	5.692100	70.016810	71.564964	11.879999
4	4	2010-01-01 04:00:00+00:00	25.286999	70.06122	19.437000	28.237595	0.0	0.0	0.0	0.0	...	1006.31820	0.0	0.0	0.0	0.0	4.334974	5.447788	85.236440	82.405460	15.480000
5 rows × 21 columns

........................................

📄 File: Agiripalle.csv (19.52 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.960001	92.284450	19.66	23.949942	0.0	0.0	0.0	0.0	...	1007.52240	18.6	2.0	26.0	4.0	4.843305	5.483357	41.987130	66.801384	7.920000
1	1	2010-01-01 01:00:00+00:00	20.910000	92.281624	19.61	23.801200	0.0	0.0	0.0	0.0	...	1008.01886	14.1	0.0	17.0	13.0	5.351785	5.692100	47.726370	71.564964	6.479999
2	2	2010-01-01 02:00:00+00:00	21.110000	92.579370	19.86	24.191238	0.0	0.0	0.0	0.0	...	1009.01746	2.1	1.0	2.0	0.0	4.896530	7.289444	53.972538	69.775055	7.200000
3	3	2010-01-01 03:00:00+00:00	23.560000	82.266970	20.36	26.991184	0.0	0.0	0.0	0.0	...	1009.95620	0.0	0.0	0.0	0.0	4.213692	5.692100	70.016810	71.564964	11.879999
4	4	2010-01-01 04:00:00+00:00	25.560000	69.462550	19.56	28.570393	0.0	0.0	0.0	0.0	...	1010.58826	0.0	0.0	0.0	0.0	4.334974	5.447788	85.236440	82.405460	15.480000
5 rows × 21 columns

........................................

📄 File: Agra.csv (19.32 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.683001	87.559326	6.733000	6.795393	0.0	0.0	0.0	0.0	...	992.97470	0.0	0.0	0.0	0.0	7.244860	20.304129	296.56497	307.07315	12.959999
1	1	2010-01-01 01:00:00+00:00	8.383000	88.439260	6.583000	6.420627	0.0	0.0	0.0	0.0	...	993.92930	0.0	0.0	0.0	0.0	7.517021	17.673029	286.69930	303.36636	12.599999
2	2	2010-01-01 02:00:00+00:00	7.983000	89.940370	6.433000	6.183432	0.0	0.0	0.0	0.0	...	994.58270	0.0	0.0	0.0	0.0	6.162207	15.946010	276.70975	298.30066	11.879999
3	3	2010-01-01 03:00:00+00:00	9.983001	87.977440	8.083000	8.430889	0.0	0.0	0.0	0.0	...	995.91205	0.0	0.0	0.0	0.0	7.208994	13.905509	272.86234	291.25058	14.040000
4	4	2010-01-01 04:00:00+00:00	14.283000	69.284134	8.733001	13.161457	0.0	0.0	0.0	0.0	...	996.82690	0.0	0.0	0.0	0.0	5.411986	8.825508	273.81400	281.76825	14.400000
5 rows × 21 columns

........................................

📄 File: Agwar.csv (19.32 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.683001	87.559326	6.733000	6.795393	0.0	0.0	0.0	0.0	...	992.97470	0.0	0.0	0.0	0.0	7.244860	20.304129	296.56497	307.07315	12.959999
1	1	2010-01-01 01:00:00+00:00	8.383000	88.439260	6.583000	6.420627	0.0	0.0	0.0	0.0	...	993.92930	0.0	0.0	0.0	0.0	7.517021	17.673029	286.69930	303.36636	12.599999
2	2	2010-01-01 02:00:00+00:00	7.983000	89.940370	6.433000	6.183432	0.0	0.0	0.0	0.0	...	994.58270	0.0	0.0	0.0	0.0	6.162207	15.946010	276.70975	298.30066	11.879999
3	3	2010-01-01 03:00:00+00:00	9.983001	87.977440	8.083000	8.430889	0.0	0.0	0.0	0.0	...	995.91205	0.0	0.0	0.0	0.0	7.208994	13.905509	272.86234	291.25058	14.040000
4	4	2010-01-01 04:00:00+00:00	14.283000	69.284134	8.733001	13.161457	0.0	0.0	0.0	0.0	...	996.82690	0.0	0.0	0.0	0.0	5.411986	8.825508	273.81400	281.76825	14.400000
5 rows × 21 columns

........................................

📄 File: Ahirauliya.csv (19.65 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.367499	94.107830	8.4675	7.946365	0.0	0.0	0.0	0.0	...	1007.28973	0.0	0.0	0.0	0.0	6.989935	16.299694	258.11136	263.65990	11.159999
1	1	2010-01-01 01:00:00+00:00	8.967500	95.052740	8.2175	7.570741	0.0	0.0	0.0	0.0	...	1007.97235	0.0	0.0	0.0	0.0	6.379216	14.561099	253.61038	261.46933	10.080000
2	2	2010-01-01 02:00:00+00:00	9.817500	93.494930	8.8175	8.511802	0.0	0.0	0.0	0.0	...	1009.28674	0.9	1.0	0.0	0.0	6.830519	13.084402	251.56496	262.09293	10.799999
3	3	2010-01-01 03:00:00+00:00	13.217500	76.715904	9.2175	12.057455	0.0	0.0	0.0	0.0	...	1010.57513	0.0	0.0	0.0	0.0	6.569383	9.470120	260.53775	261.25390	14.040000
4	4	2010-01-01 04:00:00+00:00	15.767500	65.947660	9.4175	14.620989	0.0	0.0	0.0	0.0	...	1011.04425	0.0	0.0	0.0	0.0	6.849467	8.647496	273.01273	272.38590	15.840000
5 rows × 21 columns

........................................

📄 File: Ahiro.csv (19.55 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.637000	88.24642	7.787	7.895784	0.0	0.0	0.0	0.0	...	1007.25287	0.0	0.0	0.0	0.0	7.993298	19.493261	262.23492	274.23633	12.599999
1	1	2010-01-01 01:00:00+00:00	9.337001	88.82399	7.587	7.607976	0.0	0.0	0.0	0.0	...	1007.83870	0.0	0.0	0.0	0.0	7.568566	19.562946	272.72626	282.75754	12.599999
2	2	2010-01-01 02:00:00+00:00	10.337001	88.00905	8.437	8.546263	0.0	0.0	0.0	0.0	...	1008.95984	0.0	0.0	0.0	0.0	9.470120	18.104100	278.74606	287.35410	14.400000
3	3	2010-01-01 03:00:00+00:00	14.387000	70.72133	9.137	12.799961	0.0	0.0	0.0	0.0	...	1010.07130	0.0	0.0	0.0	0.0	9.346143	13.551500	285.64230	286.99090	17.280000
4	4	2010-01-01 04:00:00+00:00	16.786999	62.09021	9.487	14.989841	0.0	0.0	0.0	0.0	...	1010.53740	0.0	0.0	0.0	0.0	11.440979	15.463246	294.14554	294.77512	20.880001
5 rows × 21 columns

........................................

📄 File: Ahmadabad.csv (19.72 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	10.606501	89.531680	8.956500	9.086163	0.0	0.0	0.0	0.0	...	1011.35315	0.0	0.0	0.0	0.0	8.557102	20.620806	284.6209	286.22028	13.320000
1	1	2010-01-01 01:00:00+00:00	10.256500	91.029150	8.856501	8.660665	0.0	0.0	0.0	0.0	...	1012.04520	0.0	0.0	0.0	0.0	8.891344	20.991426	291.3707	292.16638	12.959999
2	2	2010-01-01 02:00:00+00:00	11.406500	88.697230	9.606501	9.760673	0.0	0.0	0.0	0.0	...	1013.15753	0.0	0.0	0.0	0.0	10.636766	19.161337	293.9625	295.60214	15.480000
3	3	2010-01-01 03:00:00+00:00	14.906500	71.776825	9.856501	13.284958	0.0	0.0	0.0	0.0	...	1014.10410	0.0	0.0	0.0	0.0	10.948973	15.459054	297.4075	297.75842	19.800000
4	4	2010-01-01 04:00:00+00:00	17.006500	63.827488	10.106501	15.304890	0.0	0.0	0.0	0.0	...	1014.53200	0.0	0.0	0.0	0.0	11.983188	15.876775	302.7352	302.96942	23.400000
5 rows × 21 columns

........................................

📄 File: Ahmadnagar.csv (19.60 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	15.986000	69.621790	10.436000	14.947969	0.0	0.0	0.0	0.0	...	939.9574	15.000001	0.0	25.0	0.0	8.089993	17.339897	69.14546	85.236440	16.560000
1	1	2010-01-01 01:00:00+00:00	15.686000	71.921585	10.636001	14.689556	0.0	0.0	0.0	0.0	...	940.6261	6.600000	0.0	11.0	0.0	8.209263	17.280000	74.74483	90.000000	15.840000
2	2	2010-01-01 02:00:00+00:00	15.586000	73.596924	10.886001	14.747685	0.0	0.0	0.0	0.0	...	941.3434	1.200000	0.0	2.0	0.0	7.636753	17.339897	81.86999	94.763560	15.119999
3	3	2010-01-01 03:00:00+00:00	17.685999	65.050140	11.036000	16.640049	0.0	0.0	0.0	0.0	...	942.9665	3.600000	4.0	0.0	0.0	9.366919	14.869351	92.20255	96.952866	17.280000
4	4	2010-01-01 04:00:00+00:00	20.585999	54.475147	11.086000	19.239256	0.0	0.0	0.0	0.0	...	943.9386	0.300000	0.0	0.0	1.0	11.525623	14.241629	104.47034	106.144410	23.039999
5 rows × 21 columns

........................................

📄 File: Ahmadpur.csv (19.54 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	12.124	82.449180	9.224	10.715221	0.0	0.0	0.0	0.0	...	1009.68260	6.9	0.0	0.0	23.0	8.287822	19.201874	325.61960	329.58900	12.599999
1	1	2010-01-01 01:00:00+00:00	11.524	84.628980	9.024	10.146151	0.0	0.0	0.0	0.0	...	1010.36630	2.7	0.0	0.0	9.0	7.704336	18.278645	322.59457	327.87503	12.240000
2	2	2010-01-01 02:00:00+00:00	12.074	85.260315	9.674	10.789551	0.0	0.0	0.0	0.0	...	1011.57074	3.0	0.0	0.0	10.0	8.287822	16.485485	325.61960	328.39255	12.599999
3	3	2010-01-01 03:00:00+00:00	15.474	66.777504	9.324	14.102390	0.0	0.0	0.0	0.0	...	1012.63367	0.0	0.0	0.0	0.0	8.217153	12.101570	331.18930	329.62094	16.560000
4	4	2010-01-01 04:00:00+00:00	17.974	55.275920	8.874	16.222464	0.0	0.0	0.0	0.0	...	1012.98120	0.6	0.0	0.0	2.0	9.983106	13.527572	334.35904	334.79892	20.880001
5 rows × 21 columns

........................................

📄 File: Ahmedabad.csv (19.56 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	15.954500	50.584114	5.7045	13.245445	0.0	0.0	0.0	0.0	...	1007.19570	0.0	0.0	0.0	0.0	11.269782	25.620771	63.435013	70.291930	20.519999
1	1	2010-01-01 01:00:00+00:00	15.704500	52.476326	6.0045	12.978825	0.0	0.0	0.0	0.0	...	1007.78660	0.0	0.0	0.0	0.0	11.841756	26.124195	70.463260	78.070700	20.880001
2	2	2010-01-01 02:00:00+00:00	15.504500	54.264095	6.3045	12.813646	0.0	0.0	0.0	0.0	...	1008.27936	0.0	0.0	0.0	0.0	12.069400	26.632700	72.645890	80.665080	20.519999
3	3	2010-01-01 03:00:00+00:00	16.854500	52.063747	6.9545	13.961376	0.0	0.0	0.0	0.0	...	1009.40140	0.0	0.0	0.0	0.0	14.494192	25.455843	75.618570	81.869990	21.960000
4	4	2010-01-01 04:00:00+00:00	19.904501	43.746220	7.2045	17.171970	0.0	0.0	0.0	0.0	...	1010.16156	0.0	0.0	0.0	0.0	13.797912	19.881649	82.504240	84.805664	25.919998
5 rows × 21 columns

........................................

📄 File: Aigali.csv (19.55 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.507000	71.22109	14.157001	19.359394	0.0	0.0	0.0	0.0	...	947.62537	45.9	27.0	36.0	0.0	10.315115	20.523157	60.751270	68.385170	15.840000
1	1	2010-01-01 01:00:00+00:00	19.257000	72.57182	14.207001	19.073702	0.0	0.0	0.0	0.0	...	948.22730	6.9	5.0	4.0	0.0	10.685391	21.603000	57.380775	66.425285	16.919998
2	2	2010-01-01 02:00:00+00:00	19.257000	74.71302	14.657001	18.915989	0.0	0.0	0.0	0.0	...	948.97614	0.0	0.0	0.0	0.0	12.904882	22.077717	59.858700	65.942660	18.000000
3	3	2010-01-01 03:00:00+00:00	20.907000	71.47994	15.557000	20.616447	0.0	0.0	0.0	0.0	...	950.26263	0.0	0.0	0.0	0.0	14.917212	20.037485	70.253075	72.216020	23.039999
4	4	2010-01-01 04:00:00+00:00	23.057001	67.03921	16.607000	23.098070	0.0	0.0	0.0	0.0	...	951.08856	0.0	0.0	0.0	0.0	15.546833	19.469976	84.685550	86.820240	28.800000
5 rows × 21 columns

........................................

📄 File: Ainapur.csv (19.69 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.267500	78.406890	15.417500	20.090237	0.0	0.0	0.0	0.0	...	945.43770	33.6	32.0	8.0	0.0	6.915374	16.179987	51.340170	57.724377	13.320000
1	1	2010-01-01 01:00:00+00:00	18.867500	76.601654	14.667500	19.289022	0.0	0.0	0.0	0.0	...	946.09740	3.3	3.0	1.0	0.0	7.704336	18.089775	52.594578	58.840755	13.679999
2	2	2010-01-01 02:00:00+00:00	18.767500	77.081690	14.667500	19.015966	0.0	0.0	0.0	0.0	...	946.82270	0.0	0.0	0.0	0.0	8.891343	18.998316	58.240574	62.949482	14.759999
3	3	2010-01-01 03:00:00+00:00	20.917501	69.224600	15.067500	20.984293	0.0	0.0	0.0	0.0	...	948.32000	0.0	0.0	0.0	0.0	11.165805	16.394829	69.227670	70.769230	21.240000
4	4	2010-01-01 04:00:00+00:00	23.167501	64.344080	16.067501	23.501999	0.0	0.0	0.0	0.0	...	949.17896	0.0	0.0	0.0	0.0	12.015589	15.986595	81.384440	82.234924	27.720000
5 rows × 21 columns

........................................

📄 File: Aizawl.csv (19.39 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	5.659000	94.92346	4.909	3.894718	0.0	0.0	0.0	0.0	...	891.55660	13.5	15.0	0.0	0.0	3.617955	4.896529	84.289500	72.897190	7.559999
1	1	2010-01-01 01:00:00+00:00	5.359000	95.24346	4.659	3.646927	0.0	0.0	0.0	0.0	...	892.22440	24.0	19.0	0.0	23.0	2.902413	5.091168	82.875084	81.869990	6.479999
2	2	2010-01-01 02:00:00+00:00	8.509000	92.16181	7.309	7.287905	0.0	0.0	0.0	0.0	...	894.20610	11.7	13.0	0.0	0.0	3.617955	4.735060	84.289500	81.253920	10.799999
3	3	2010-01-01 03:00:00+00:00	12.809000	77.95425	9.059	12.296347	0.0	0.0	0.0	0.0	...	896.61444	1.8	2.0	0.0	0.0	1.835647	2.620839	78.690100	74.054535	11.520000
4	4	2010-01-01 04:00:00+00:00	14.858999	66.42241	8.659	14.507059	0.0	0.0	0.0	0.0	...	897.14580	0.0	0.0	0.0	0.0	0.000000	0.509117	180.000000	135.000100	11.520000
5 rows × 21 columns

........................................

📄 File: Ajaigarh.csv (19.55 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.2775	87.823530	6.3775	6.367725	0.0	0.0	0.0	0.0	...	989.82400	0.0	0.0	0.0	0.0	6.830519	14.264361	198.43504	222.95459	11.520000
1	1	2010-01-01 01:00:00+00:00	8.1775	87.814415	6.2775	6.177886	0.0	0.0	0.0	0.0	...	990.39900	0.0	0.0	0.0	0.0	7.289444	15.307410	200.22495	221.18582	11.520000
2	2	2010-01-01 02:00:00+00:00	8.4275	88.139700	6.5775	6.380292	0.0	0.0	0.0	0.0	...	991.20160	0.0	0.0	0.0	0.0	8.089993	15.580141	200.85454	220.31403	12.959999
3	3	2010-01-01 03:00:00+00:00	12.5275	75.574295	8.3275	10.915414	0.0	0.0	0.0	0.0	...	992.55010	0.0	0.0	0.0	0.0	8.049845	14.799459	206.56499	221.05472	18.000000
4	4	2010-01-01 04:00:00+00:00	16.7775	59.629498	8.8775	15.433104	0.0	0.0	0.0	0.0	...	993.41504	0.0	0.0	0.0	0.0	7.200000	9.957108	216.86998	220.60121	18.359999
5 rows × 21 columns

........................................

📄 File: Ajas.csv (19.55 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	-3.156	31.039143	-17.906	-7.470269	0.0	0.0	0.0	0.1	...	834.24756	0.0	0.0	0.0	0.0	4.024922	3.396233	280.30478	327.99466	15.84
1	1	2010-01-01 01:00:00+00:00	-3.506	30.929651	-18.256	-7.828473	0.0	0.0	0.0	0.1	...	834.11444	0.0	0.0	0.0	0.0	3.976330	3.563818	275.19434	315.00010	15.48
2	2	2010-01-01 02:00:00+00:00	-3.806	30.704910	-18.606	-8.150446	0.0	0.0	0.0	0.1	...	834.74630	0.0	0.0	0.0	0.0	4.024922	3.600000	280.30478	323.13000	15.48
3	3	2010-01-01 03:00:00+00:00	-3.606	31.693909	-18.056	-7.788493	0.0	0.0	0.0	0.1	...	835.11440	0.0	0.0	0.0	0.0	3.075841	3.319036	290.55612	319.39877	15.84
4	4	2010-01-01 04:00:00+00:00	-1.456	33.875343	-15.356	-5.478972	0.0	0.0	0.0	0.1	...	836.83826	0.0	0.0	0.0	0.0	2.880000	3.319036	270.00000	310.60123	18.00
5 rows × 21 columns

........................................

📄 File: Ajjampur.csv (19.62 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	17.604	98.434525	17.354	19.372784	0.0	0.0	0.0	0.0	...	927.1756	70.2	78.0	0.0	0.0	5.904439	10.805998	127.568665	119.981550	10.08
1	1	2010-01-01 01:00:00+00:00	17.554	98.433920	17.304	19.332075	0.0	0.0	0.0	0.0	...	927.8029	71.1	79.0	0.0	0.0	5.692099	13.363711	124.695220	117.255250	12.24
2	2	2010-01-01 02:00:00+00:00	18.104	98.131130	17.804	19.692581	0.0	0.0	0.0	0.0	...	928.7800	89.1	99.0	0.0	0.0	8.496305	15.077082	126.384445	123.310646	15.84
3	3	2010-01-01 03:00:00+00:00	20.704	90.845146	19.154	22.473476	0.0	0.0	0.0	0.0	...	930.5943	70.2	78.0	0.0	0.0	11.525623	15.913465	128.659840	127.647690	23.40
4	4	2010-01-01 04:00:00+00:00	22.404	81.870640	19.154	23.973103	0.0	0.0	0.0	0.0	...	931.5139	37.8	42.0	0.0	0.0	12.889810	17.577440	125.909810	124.992096	29.16
5 rows × 21 columns

........................................

📄 File: Ajjanahalli.csv (19.51 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.099	95.156990	19.299	22.890257	0.0	0.0	0.0	0.0	...	972.74744	13.799999	12.0	5.0	0.0	5.001280	7.993297	30.256361	35.837746	11.159999
1	1	2010-01-01 01:00:00+00:00	20.049	94.859360	19.199	22.769728	0.0	0.0	0.0	0.0	...	973.31790	11.099999	9.0	5.0	0.0	5.154415	8.396570	24.775122	30.963696	11.159999
2	2	2010-01-01 02:00:00+00:00	20.249	95.162400	19.449	23.090660	0.0	0.0	0.0	0.0	...	974.30530	5.100000	5.0	1.0	0.0	5.154415	9.021574	24.775122	28.610369	12.599999
3	3	2010-01-01 03:00:00+00:00	22.499	80.365364	18.949	24.931614	0.0	0.0	0.0	0.0	...	975.36570	3.600000	4.0	0.0	0.0	6.297428	8.396570	30.963696	30.963696	17.280000
4	4	2010-01-01 04:00:00+00:00	24.149	67.049340	17.649	25.894905	0.0	0.0	0.0	0.0	...	976.25030	1.800000	2.0	0.0	0.0	6.915374	9.000000	38.659830	36.869990	20.160000
5 rows × 21 columns

........................................

📄 File: Ajjipuram.csv (19.68 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.654501	94.54841	18.754500	21.957926	0.0	0.0	0.0	0.0	...	939.86456	6.3	7.0	0.0	0.0	6.569383	14.471821	80.537750	84.289500	15.119999
1	1	2010-01-01 01:00:00+00:00	19.504500	94.83856	18.654501	21.761208	0.0	0.0	0.0	0.0	...	940.57180	10.2	8.0	5.0	0.0	6.569383	14.799459	80.537750	85.815160	14.400000
2	2	2010-01-01 02:00:00+00:00	19.654501	94.84430	18.804500	21.806147	0.0	0.0	0.0	0.0	...	941.53595	9.6	8.0	4.0	0.0	7.771331	13.755580	76.607490	83.991090	15.119999
3	3	2010-01-01 03:00:00+00:00	21.304500	85.39865	18.754500	23.143340	0.0	0.0	0.0	0.0	...	942.76070	45.0	50.0	0.0	0.0	9.746631	12.979984	85.763690	86.820240	21.599998
4	4	2010-01-01 04:00:00+00:00	23.254500	70.56089	17.604500	24.411573	0.0	0.0	0.0	0.0	...	943.67950	27.9	31.0	0.0	0.0	10.823973	14.058450	86.186005	87.064384	26.280000
5 rows × 21 columns

........................................

📄 File: Ajmer.csv (19.29 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.514999	56.599392	1.315	6.531711	0.0	0.0	0.0	0.0	...	958.4144	0.0	0.0	0.0	0.0	7.342588	10.787993	101.30990	115.70991	9.360000
1	1	2010-01-01 01:00:00+00:00	9.115000	59.194027	1.565	6.117527	0.0	0.0	0.0	0.0	...	959.0909	0.0	0.0	0.0	0.0	7.729527	11.592894	117.75845	126.15828	9.720000
2	2	2010-01-01 02:00:00+00:00	8.714999	62.132156	1.865	5.625442	0.0	0.0	0.0	0.0	...	959.5783	0.0	0.0	0.0	0.0	8.714677	12.218805	128.29020	135.00010	10.440001
3	3	2010-01-01 03:00:00+00:00	11.014999	56.986298	2.815	8.284067	0.0	0.0	0.0	0.0	...	961.0662	0.0	0.0	0.0	0.0	7.421590	13.276144	129.09386	139.39879	11.159999
4	4	2010-01-01 04:00:00+00:00	16.415000	43.817142	4.065	14.076727	0.0	0.0	0.0	0.0	...	962.6631	0.0	0.0	0.0	0.0	6.369050	10.739832	132.70937	140.44037	14.400000
5 rows × 21 columns

........................................

📄 File: Ajnala.csv (19.32 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	6.037000	90.104800	4.537	3.778184	0.0	0.0	0.0	0.0	...	986.88350	0.0	0.0	0.0	0.0	6.479999	9.360001	270.00000	292.61990	10.440001
1	1	2010-01-01 01:00:00+00:00	5.787000	90.718666	4.387	3.392506	0.0	0.0	0.0	0.0	...	987.05300	0.0	0.0	0.0	0.0	7.200000	10.931203	270.00000	287.24155	10.080000
2	2	2010-01-01 02:00:00+00:00	6.087000	89.481050	4.487	3.666715	0.0	0.0	0.0	0.0	...	987.76340	0.0	0.0	0.0	0.0	7.517021	11.440979	286.69930	294.14554	10.080000
3	3	2010-01-01 03:00:00+00:00	8.337001	83.397370	5.687	6.291453	0.0	0.0	0.0	0.0	...	988.66600	0.0	0.0	0.0	0.0	6.696387	11.384198	306.25394	304.69522	10.080000
4	4	2010-01-01 04:00:00+00:00	11.587001	77.502045	7.787	10.491747	0.0	0.0	0.0	0.0	...	989.56445	0.0	0.0	0.0	0.0	3.563818	9.673221	315.00010	315.00010	11.520000
5 rows × 21 columns

........................................

📄 File: Ajodhya.csv (19.52 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.5175	92.16232	7.3175	6.886941	0.0	0.0	0.0	0.0	...	1002.93030	0.0	0.0	0.0	0.0	6.439876	16.167967	243.43501	258.43990	10.440001
1	1	2010-01-01 01:00:00+00:00	8.1675	92.77469	7.0675	6.476566	0.0	0.0	0.0	0.0	...	1003.60620	0.0	0.0	0.0	0.0	6.439876	15.815435	243.43501	258.17853	10.440001
2	2	2010-01-01 02:00:00+00:00	8.1675	93.73198	7.2175	6.277875	0.0	0.0	0.0	0.0	...	1004.79144	0.0	0.0	0.0	0.0	8.049845	15.815435	243.43501	258.17853	10.440001
3	3	2010-01-01 03:00:00+00:00	11.7175	79.38738	8.2675	10.229795	0.0	0.0	0.0	0.0	...	1006.03280	0.0	0.0	0.0	0.0	7.091177	12.413476	246.03750	253.14151	14.400000
4	4	2010-01-01 04:00:00+00:00	14.5675	68.18074	8.7675	13.263519	0.0	0.0	0.0	0.0	...	1006.54950	0.0	0.0	0.0	0.0	6.725354	8.905908	254.47583	255.96373	16.560000
5 rows × 21 columns

........................................

📄 File: Akalgarh.csv (19.35 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	7.063	91.123825	5.713	4.809347	0.0	0.0	0.0	0.0	...	984.35596	0.0	0.0	0.0	0.0	8.161764	16.489416	318.57642	323.88055	12.959999
1	1	2010-01-01 01:00:00+00:00	6.713	91.734380	5.463	4.369203	0.0	0.0	0.0	0.0	...	984.51215	0.0	0.0	0.0	0.0	8.404285	16.363178	316.73566	320.35587	12.599999
2	2	2010-01-01 02:00:00+00:00	6.413	91.715280	5.163	4.000094	0.0	0.0	0.0	0.0	...	985.15857	0.0	0.0	0.0	0.0	8.435069	16.870138	320.19450	320.19450	12.599999
3	3	2010-01-01 03:00:00+00:00	7.663	91.478950	6.363	5.506907	0.0	0.0	0.0	0.0	...	985.97217	0.0	0.0	0.0	0.0	8.496305	16.641972	323.61554	321.14660	12.240000
4	4	2010-01-01 04:00:00+00:00	12.813	71.382850	7.763	11.328144	0.0	0.0	0.0	0.0	...	987.09790	0.0	0.0	0.0	0.0	6.193674	13.979872	324.46225	325.49140	14.400000
5 rows × 21 columns

........................................

📄 File: Akanavaritota.csv (19.74 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.837	99.381805	19.737000	22.724040	0.0	0.0	0.0	0.0	...	1011.08460	1.200000	0.0	2.0	0.0	5.815978	11.525623	21.801476	38.659830	11.879999
1	1	2010-01-01 01:00:00+00:00	19.737	99.381330	19.637000	22.542814	0.0	0.0	0.0	0.0	...	1011.68304	6.300000	7.0	0.0	0.0	6.034700	12.682018	17.354122	34.592358	12.240000
2	2	2010-01-01 02:00:00+00:00	20.737	97.865460	20.387000	23.702970	0.0	0.0	0.0	0.0	...	1012.78630	20.699999	23.0	0.0	0.0	7.517021	12.287555	16.699326	31.827414	14.040000
3	3	2010-01-01 03:00:00+00:00	23.587	85.629860	21.036999	27.067450	0.0	0.0	0.0	0.0	...	1013.79860	0.000000	0.0	0.0	0.0	6.297428	8.496305	30.963696	36.384450	15.480000
4	4	2010-01-01 04:00:00+00:00	25.437	73.648544	20.387000	28.576057	0.0	0.0	0.0	0.0	...	1014.40630	2.700000	3.0	0.0	0.0	6.297428	7.903619	59.036320	59.931510	16.919998
5 rows × 21 columns

........................................

📄 File: Akbarpur.csv (19.49 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.0565	90.947320	7.6565	7.484653	0.0	0.0	0.0	0.0	...	1004.26483	0.0	0.0	0.0	0.0	6.608722	17.309973	240.64233	253.07240	10.799999
1	1	2010-01-01 01:00:00+00:00	8.7065	91.859620	7.4565	7.058485	0.0	0.0	0.0	0.0	...	1004.94324	0.0	0.0	0.0	0.0	6.792466	17.533146	237.99466	250.82089	10.799999
2	2	2010-01-01 02:00:00+00:00	8.7565	92.807280	7.6565	6.806826	0.0	0.0	0.0	0.0	...	1006.13190	0.0	0.0	0.0	0.0	9.199390	17.533146	239.42085	250.82089	10.799999
3	3	2010-01-01 03:00:00+00:00	12.0565	78.634000	8.4565	10.500435	0.0	0.0	0.0	0.0	...	1007.34937	0.0	0.0	0.0	0.0	7.895416	13.441071	245.77226	249.62347	15.480000
4	4	2010-01-01 04:00:00+00:00	15.0565	66.914536	8.9565	13.671179	0.0	0.0	0.0	0.0	...	1007.86035	0.0	0.0	0.0	0.0	7.628263	9.793058	250.70985	252.89719	17.640000
5 rows × 21 columns

........................................

📄 File: Akbarpur_2.csv (19.46 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	7.477	90.83790	6.077000	5.508469	0.0	0.0	0.0	0.0	...	957.70807	0.0	0.0	0.0	0.0	6.763786	14.685176	244.79890	258.69010	12.959999
1	1	2010-01-01 01:00:00+00:00	7.277	91.45374	5.977000	5.308571	0.0	0.0	0.0	0.0	...	958.13840	0.0	0.0	0.0	0.0	6.608722	15.827721	240.64233	252.80138	12.959999
2	2	2010-01-01 02:00:00+00:00	8.027	90.87622	6.627000	5.901270	0.0	0.0	0.0	0.0	...	959.23240	0.0	0.0	0.0	0.0	8.707237	16.311613	240.25520	247.96371	14.040000
3	3	2010-01-01 03:00:00+00:00	12.677	72.33580	7.827001	11.101562	0.0	0.0	0.0	0.0	...	961.10040	0.0	0.0	0.0	0.0	6.924738	12.245293	242.10283	245.69547	16.919998
4	4	2010-01-01 04:00:00+00:00	15.627	58.74724	7.577000	13.852160	0.0	0.0	0.0	0.0	...	962.05010	0.0	0.0	0.0	0.0	7.862518	9.957109	254.05453	257.47120	20.160000
5 rows × 21 columns

........................................

📄 File: Akhnur.csv (19.46 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	2.777	71.20008	-1.923	-0.036503	0.0	0.0	0.0	0.0	...	976.22125	0.0	0.0	0.0	0.0	2.811690	1.138420	39.805527	161.564960	9.000000
1	1	2010-01-01 01:00:00+00:00	2.377	70.07581	-2.523	-0.558206	0.0	0.0	0.0	0.0	...	976.64734	0.0	0.0	0.0	0.0	3.096837	0.720000	35.537766	270.000000	9.720000
2	2	2010-01-01 02:00:00+00:00	2.127	69.50658	-2.873	-0.926885	0.0	0.0	0.0	0.0	...	977.47845	0.0	0.0	0.0	0.0	3.600000	2.189795	36.869990	9.462248	10.080000
3	3	2010-01-01 03:00:00+00:00	3.077	72.31394	-1.423	0.070411	0.0	0.0	0.0	0.0	...	977.89746	0.0	0.0	0.0	0.0	4.610250	1.297998	38.659830	33.690100	12.599999
4	4	2010-01-01 04:00:00+00:00	9.127	66.33157	3.177	7.020855	0.0	0.0	0.0	0.0	...	979.18980	0.0	0.0	0.0	0.0	3.600000	0.360000	36.869990	360.000000	13.679999
5 rows × 21 columns

........................................

📄 File: Akividu.csv (19.47 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.05	97.85445	19.70	22.991577	0.0	0.0	0.0	0.0	...	1011.43884	1.8	0.0	3.0	0.0	5.315336	11.212135	28.300660	42.397392	9.000000
1	1	2010-01-01 01:00:00+00:00	19.80	98.15498	19.50	22.549555	0.0	0.0	0.0	0.0	...	1012.03723	2.4	0.0	3.0	2.0	5.959060	12.819235	25.016869	38.157276	9.000000
2	2	2010-01-01 02:00:00+00:00	20.70	96.66284	20.15	23.537659	0.0	0.0	0.0	0.0	...	1013.13960	0.6	0.0	0.0	2.0	7.568566	12.599998	25.346138	36.869990	12.599999
3	3	2010-01-01 03:00:00+00:00	23.60	83.29294	20.60	26.760876	0.0	0.0	0.0	0.0	...	1014.14870	0.0	0.0	0.0	0.0	6.915374	8.669949	38.659830	41.633450	15.840000
4	4	2010-01-01 04:00:00+00:00	25.65	71.44450	20.10	28.622002	0.0	0.0	0.0	0.0	...	1014.75543	0.0	0.0	0.0	0.0	6.439876	7.729527	63.435013	62.241560	18.359999
5 rows × 21 columns

........................................

📄 File: Aklvidu.csv (19.86 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.075998	97.85486	19.726000	23.030418	0.0	0.0	0.0	0.0	...	1011.91046	1.8	0.0	3.0	0.0	5.315336	11.212135	28.300660	42.397392	9.000000
1	1	2010-01-01 01:00:00+00:00	19.825998	98.15533	19.526000	22.588257	0.0	0.0	0.0	0.0	...	1012.50950	2.4	0.0	3.0	2.0	5.959060	12.819235	25.016869	38.157276	9.000000
2	2	2010-01-01 02:00:00+00:00	20.726000	96.66350	20.175999	23.576817	0.0	0.0	0.0	0.0	...	1013.61084	0.6	0.0	0.0	2.0	7.568566	12.599998	25.346138	36.869990	12.599999
3	3	2010-01-01 03:00:00+00:00	23.626000	83.29593	20.626000	26.800346	0.0	0.0	0.0	0.0	...	1014.61597	0.0	0.0	0.0	0.0	6.915374	8.669949	38.659830	41.633450	15.840000
4	4	2010-01-01 04:00:00+00:00	25.675999	71.44919	20.126000	28.661102	0.0	0.0	0.0	0.0	...	1015.21967	0.0	0.0	0.0	0.0	6.439876	7.729527	63.435013	62.241560	18.359999
5 rows × 21 columns

........................................

📄 File: Akola.csv (19.52 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	13.863000	78.376000	10.162999	12.751957	0.0	0.0	0.0	0.0	...	980.65320	3.9	0.0	0.0	13.0	8.049845	20.008356	79.69521	81.724200	14.040000
1	1	2010-01-01 01:00:00+00:00	13.363000	80.696205	10.113000	12.304090	0.0	0.0	0.0	0.0	...	981.56195	4.5	0.0	0.0	15.0	7.594207	19.523155	84.55976	84.710014	12.599999
2	2	2010-01-01 02:00:00+00:00	13.063000	83.676250	10.363000	12.133978	0.0	0.0	0.0	0.0	...	982.30023	1.8	0.0	0.0	6.0	7.200000	18.374111	90.00000	87.754310	12.240000
3	3	2010-01-01 03:00:00+00:00	15.912999	71.249450	10.712999	14.927906	0.0	0.0	0.0	0.0	...	983.78910	0.0	0.0	0.0	0.0	8.287822	15.496736	92.48950	92.662950	16.199999
4	4	2010-01-01 04:00:00+00:00	18.463001	59.238125	10.363000	17.265987	0.0	0.0	0.0	0.0	...	984.46515	0.0	0.0	0.0	0.0	9.028754	12.682018	94.57384	96.519714	20.160000
5 rows × 21 columns

........................................

📄 File: Akora.csv (19.50 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.615	87.553024	6.665000	6.809965	0.0	0.0	0.0	0.0	...	999.03894	0.0	0.0	0.0	0.0	6.569383	17.298738	260.53775	282.01144	11.520000
1	1	2010-01-01 01:00:00+00:00	8.165	89.031080	6.465000	6.303435	0.0	0.0	0.0	0.0	...	999.99660	0.0	0.0	0.0	0.0	6.638072	16.394829	257.47120	278.84174	10.799999
2	2	2010-01-01 02:00:00+00:00	7.865	89.931366	6.315000	6.030682	0.0	0.0	0.0	0.0	...	1000.66766	0.0	0.0	0.0	0.0	6.214563	15.745627	259.99210	280.53912	10.799999
3	3	2010-01-01 03:00:00+00:00	10.565	83.949020	7.965000	8.982951	0.0	0.0	0.0	0.0	...	1001.90590	0.0	0.0	0.0	0.0	7.208994	14.205182	267.13766	278.74606	14.759999
4	4	2010-01-01 04:00:00+00:00	14.565	69.106970	8.964999	13.454502	0.0	0.0	0.0	0.0	...	1002.72220	0.0	0.0	0.0	0.0	5.760000	9.028754	270.00000	274.57382	15.119999
5 rows × 21 columns

........................................

📄 File: Akot.csv (19.43 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	12.950501	74.628685	8.550500	11.418909	0.0	0.0	0.0	0.0	...	977.52840	3.0	0.0	0.0	10.0	7.895416	20.431387	65.772260	75.718880	14.400000
1	1	2010-01-01 01:00:00+00:00	12.550500	75.578156	8.350500	11.035980	0.0	0.0	0.0	0.0	...	978.44135	0.6	0.0	0.0	2.0	7.421590	19.134260	67.166310	78.055850	12.599999
2	2	2010-01-01 02:00:00+00:00	12.600500	76.876440	8.650500	11.164309	0.0	0.0	0.0	0.0	...	979.21870	0.9	0.0	0.0	3.0	7.421590	18.289274	67.166310	79.796090	12.240000
3	3	2010-01-01 03:00:00+00:00	16.250500	65.171950	9.700501	15.007504	0.0	0.0	0.0	0.0	...	980.73640	0.0	0.0	0.0	0.0	8.049845	16.299694	79.695210	83.659904	16.199999
4	4	2010-01-01 04:00:00+00:00	19.600500	49.686916	8.800500	18.023623	0.0	0.0	0.0	0.0	...	981.62920	0.0	0.0	0.0	0.0	8.647496	12.245294	92.385895	91.684650	20.160000
5 rows × 21 columns

........................................

📄 File: Alagappapuram.csv (19.70 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	23.3525	86.399720	20.9525	26.273819	0.0	0.0	0.0	0.0	...	1006.13370	24.600000	4.0	0.0	70.0	9.826088	17.238699	28.442837	28.705854	25.919998
1	1	2010-01-01 01:00:00+00:00	23.2525	86.124855	20.8025	26.069181	0.0	0.0	0.0	0.0	...	1006.63074	30.900002	6.0	0.0	85.0	10.002560	17.906157	30.256361	30.173443	27.000000
2	2	2010-01-01 02:00:00+00:00	23.5525	83.544560	20.6025	26.019590	0.0	0.0	0.0	0.0	...	1007.83026	30.900002	3.0	0.0	94.0	11.681987	18.278645	33.690100	32.124966	30.239998
3	3	2010-01-01 03:00:00+00:00	24.7525	75.144455	20.0525	26.738361	0.0	0.0	0.0	0.0	...	1008.84045	27.300001	0.0	0.0	91.0	13.044722	17.713316	39.400646	37.568665	34.560000
4	4	2010-01-01 04:00:00+00:00	26.0025	68.265540	19.7025	27.260086	0.0	0.0	0.0	0.0	...	1009.55220	27.600000	0.0	0.0	92.0	16.831684	22.493519	41.531677	39.805527	43.199997
5 rows × 21 columns

........................................

📄 File: Alagarai.csv (19.56 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.461	94.28753	19.511000	23.426640	0.0	0.0	0.0	0.0	...	999.97980	0.0	0.0	0.0	0.0	4.510787	10.086427	28.610369	34.824570	11.159999
1	1	2010-01-01 01:00:00+00:00	20.361	94.57686	19.461000	23.255749	0.0	0.0	0.0	0.0	...	1000.56934	6.0	6.0	1.0	0.0	4.829907	10.495713	26.564985	30.963696	11.159999
2	2	2010-01-01 02:00:00+00:00	21.211	92.29856	19.911001	24.280010	0.0	0.0	0.0	0.0	...	1001.68930	1.8	2.0	0.0	0.0	5.154415	10.002560	24.775122	30.256361	12.959999
3	3	2010-01-01 03:00:00+00:00	23.811	80.29055	20.211000	27.066334	0.0	0.0	0.0	0.0	...	1002.67680	0.0	0.0	0.0	0.0	4.896530	6.989936	36.027473	34.508590	15.480000
4	4	2010-01-01 04:00:00+00:00	25.511	68.59472	19.311000	28.023888	0.0	0.0	0.0	0.0	...	1003.43220	0.0	0.0	0.0	0.0	6.915374	9.178235	51.340170	48.179924	20.160000
5 rows × 21 columns

........................................

📄 File: Alamnagar.csv (19.67 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	10.643499	90.14015	9.093500	9.285658	0.0	0.0	0.0	0.0	...	1011.08840	0.0	0.0	0.0	0.0	7.695920	19.486610	280.78424	281.72507	11.520000
1	1	2010-01-01 01:00:00+00:00	10.293500	91.64786	8.993500	8.868873	0.0	0.0	0.0	0.0	...	1011.77985	0.0	0.0	0.0	0.0	7.968939	20.037485	288.43503	287.78397	10.440001
2	2	2010-01-01 02:00:00+00:00	11.093500	89.87110	9.493500	9.455873	0.0	0.0	0.0	0.0	...	1012.88776	0.0	0.0	0.0	0.0	10.365251	18.584510	290.32320	291.59537	14.400000
3	3	2010-01-01 03:00:00+00:00	14.343500	74.61669	9.893499	12.700922	0.0	0.0	0.0	0.0	...	1013.83466	0.0	0.0	0.0	0.0	11.165805	15.509274	290.77234	291.80148	19.080000
4	4	2010-01-01 04:00:00+00:00	16.743500	65.06151	10.143499	14.966402	0.0	0.0	0.0	0.0	...	1014.26970	0.0	0.0	0.0	0.0	12.574260	16.450070	293.62940	293.19860	23.400000
5 rows × 21 columns

........................................

📄 File: Alampalaiyam.csv (19.51 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	22.410000	84.98279	19.76	25.634710	0.0	0.0	0.0	0.0	...	990.84360	26.099998	29.0	0.0	0.0	3.563818	5.991594	135.000100	122.735220	5.760000
1	1	2010-01-01 01:00:00+00:00	22.310000	85.50119	19.76	25.584953	0.0	0.0	0.0	0.0	...	991.42450	27.000000	30.0	0.0	0.0	3.219938	4.802999	116.564990	102.994620	4.680000
2	2	2010-01-01 02:00:00+00:00	22.360000	86.03784	19.91	25.800581	0.0	0.0	0.0	0.0	...	992.40760	14.400000	16.0	0.0	0.0	2.595997	4.334974	123.690094	94.763560	5.760000
3	3	2010-01-01 03:00:00+00:00	23.960001	79.81585	20.26	27.418781	0.0	0.0	0.0	0.0	...	993.30096	5.400000	6.0	0.0	0.0	3.671294	4.553680	78.690100	71.564964	11.520000
4	4	2010-01-01 04:00:00+00:00	25.410000	71.40106	19.86	28.370941	0.0	0.0	0.0	0.0	...	993.98730	17.700000	19.0	0.0	2.0	5.692099	7.421590	55.304783	50.906155	16.919998
5 rows × 21 columns

........................................

📄 File: Alampur Gonpura.csv (19.57 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.9175	90.698590	8.467500	8.286760	0.0	0.0	0.0	0.0	...	1008.9398	0.0	0.0	0.0	0.0	8.427383	19.839235	250.01680	258.48620	12.959999
1	1	2010-01-01 01:00:00+00:00	9.6675	91.608100	8.367499	8.176720	0.0	0.0	0.0	0.0	...	1009.6290	0.0	0.0	0.0	0.0	7.289444	18.356470	249.77505	258.69010	12.959999
2	2	2010-01-01 02:00:00+00:00	10.2675	89.808220	8.667500	8.590036	0.0	0.0	0.0	0.0	...	1010.7361	0.0	0.0	0.0	0.0	9.107359	16.808569	251.56496	260.13425	14.759999
3	3	2010-01-01 03:00:00+00:00	13.9175	72.808846	9.117499	12.462604	0.0	0.0	0.0	0.0	...	1011.9171	0.0	0.0	0.0	0.0	8.404284	11.966953	260.13425	263.08887	17.280000
4	4	2010-01-01 04:00:00+00:00	16.7675	62.085686	9.467500	15.320927	0.0	0.0	0.0	0.0	...	1012.4811	0.0	0.0	0.0	0.0	9.000000	11.525623	270.00000	271.78986	19.800000
5 rows × 21 columns

........................................

📄 File: Alampur.csv (19.10 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	8.687000	88.162704	6.837000	6.846296	0.0	0.0	0.0	0.0	...	995.98596	0.0	0.0	0.0	0.0	7.091177	17.339897	246.03750	265.23645	11.879999
1	1	2010-01-01 01:00:00+00:00	8.337001	89.351685	6.687000	6.481180	0.0	0.0	0.0	0.0	...	996.84430	0.0	0.0	0.0	0.0	6.952755	16.981165	248.74942	265.13556	11.520000
2	2	2010-01-01 02:00:00+00:00	8.187000	89.955890	6.637000	6.319479	0.0	0.0	0.0	0.0	...	997.52040	0.0	0.0	0.0	0.0	6.952755	15.844090	248.74942	268.69810	11.520000
3	3	2010-01-01 03:00:00+00:00	11.037001	82.591940	8.187000	9.431888	0.0	0.0	0.0	0.0	...	998.79530	0.0	0.0	0.0	0.0	7.754637	14.799459	248.19853	265.81516	15.840000
4	4	2010-01-01 04:00:00+00:00	15.287001	67.415306	9.287001	14.237778	0.0	0.0	0.0	0.0	...	999.66943	0.0	0.0	0.0	0.0	5.937272	9.826088	255.96373	261.57312	15.840000
5 rows × 21 columns

........................................

📄 File: Alampur_2.csv (19.52 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	9.194500	90.03208	7.644500	7.648718	0.0	0.0	0.0	0.0	...	1003.34186	0.0	0.0	0.0	0.0	6.409617	14.917212	231.84273	250.25307	12.599999
1	1	2010-01-01 01:00:00+00:00	8.944500	90.62990	7.494500	7.402357	0.0	0.0	0.0	0.0	...	1003.72534	0.0	0.0	0.0	0.0	6.130579	15.646544	229.76372	246.97447	12.599999
2	2	2010-01-01 02:00:00+00:00	9.544499	90.67234	8.094500	7.816501	0.0	0.0	0.0	0.0	...	1004.83870	0.0	0.0	0.0	0.0	8.435069	15.137133	230.19447	244.65387	13.320000
3	3	2010-01-01 03:00:00+00:00	14.394500	72.40744	9.494499	13.365177	0.0	0.0	0.0	0.0	...	1006.14343	0.0	0.0	0.0	0.0	6.193674	11.269782	234.46223	243.43501	16.199999
4	4	2010-01-01 04:00:00+00:00	17.644499	57.28001	9.094500	16.528112	0.0	0.0	0.0	0.0	...	1006.77970	0.0	0.0	0.0	0.0	6.034700	7.862518	252.64589	254.05453	17.280000
5 rows × 21 columns

........................................

📄 File: Alampur_3.csv (19.68 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.967001	85.36400	18.417000	23.379995	0.0	0.0	0.0	0.0	...	980.79724	10.200000	11.0	0.0	1.0	4.735060	8.209263	98.746080	105.255170	7.559999
1	1	2010-01-01 01:00:00+00:00	20.467001	88.86388	18.567001	22.957806	0.0	0.0	0.0	0.0	...	981.51980	8.099999	9.0	0.0	0.0	4.680000	7.993298	90.000000	97.765080	8.280000
2	2	2010-01-01 02:00:00+00:00	20.667000	89.71646	18.917000	23.273104	0.0	0.0	0.0	0.0	...	982.50970	2.700000	3.0	0.0	0.0	5.014219	8.669949	68.962420	85.236440	10.080000
3	3	2010-01-01 03:00:00+00:00	23.767000	69.77375	17.917000	25.819199	0.0	0.0	0.0	0.0	...	983.80250	0.900000	1.0	0.0	0.0	5.634891	7.754637	63.435013	68.198530	16.199999
4	4	2010-01-01 04:00:00+00:00	25.867000	59.83096	17.467001	27.277620	0.0	0.0	0.0	0.0	...	984.30914	0.000000	0.0	0.0	0.0	8.654986	11.177405	73.072410	75.068535	23.759998
5 rows × 21 columns

........................................

📄 File: Alamuru.csv (19.79 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.193500	99.378770	19.0935	21.901840	0.0	0.0	0.0	0.0	...	1011.29944	1.500000	1.0	1.0	0.0	4.896529	10.990322	17.102825	31.607454	10.080000
1	1	2010-01-01 01:00:00+00:00	18.993500	99.688520	18.9435	21.644167	0.0	0.0	0.0	0.0	...	1011.79780	14.400000	16.0	0.0	0.0	4.802999	11.298495	12.994630	30.650600	10.440001
2	2	2010-01-01 02:00:00+00:00	20.043499	98.158350	19.7435	22.883110	0.0	0.0	0.0	0.0	...	1012.90125	39.899998	44.0	0.0	1.0	6.162207	10.144082	6.709750	27.474344	11.520000
3	3	2010-01-01 03:00:00+00:00	23.593500	84.065315	20.7435	27.155119	0.0	0.0	0.0	0.0	...	1013.91550	0.900000	1.0	0.0	0.0	4.680000	6.608722	22.619910	29.357658	14.759999
4	4	2010-01-01 04:00:00+00:00	25.493500	72.754040	20.2435	28.748210	0.0	0.0	0.0	0.0	...	1014.52264	1.800000	2.0	0.0	0.0	5.001280	6.120000	59.743652	61.927620	18.720000
5 rows × 21 columns

........................................

📄 File: Aland.csv (19.75 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	18.829498	71.791885	13.6295	18.337646	0.0	0.0	0.0	0.0	...	956.18915	3.0	2.0	2.0	0.0	11.384199	23.664352	71.564964	76.809390	21.960000
1	1	2010-01-01 01:00:00+00:00	18.679500	73.893890	13.9295	18.294323	0.0	0.0	0.0	0.0	...	956.91610	5.4	4.0	3.0	0.0	11.384199	23.863409	71.564964	78.690100	21.599998
2	2	2010-01-01 02:00:00+00:00	18.929500	74.176610	14.2295	18.466370	0.0	0.0	0.0	0.0	...	957.71826	1.8	2.0	0.0	0.0	12.661564	23.266697	75.173480	81.995360	21.960000
3	3	2010-01-01 03:00:00+00:00	21.179500	65.798620	14.5295	20.665900	0.0	0.0	0.0	0.0	...	959.08276	0.9	1.0	0.0	0.0	13.755580	19.469976	83.991090	86.820240	27.359999
4	4	2010-01-01 04:00:00+00:00	23.679500	57.999060	14.9295	23.136560	0.0	0.0	0.0	0.0	...	959.82654	0.0	0.0	0.0	0.0	14.973576	19.770523	99.688720	100.491425	33.480000
5 rows × 21 columns

........................................

📄 File: Alanganallur.csv (19.79 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	19.120499	94.23058	18.170502	21.525518	0.0	0.0	0.0	0.0	...	989.30160	4.5	5.0	0.0	0.0	4.024922	8.280000	349.695220	360.000000	8.640000
1	1	2010-01-01 01:00:00+00:00	18.970500	94.52067	18.070500	21.174782	0.0	0.0	0.0	0.0	...	989.87744	3.6	3.0	0.0	3.0	5.091168	9.064569	351.870000	6.842679	9.000000
2	2	2010-01-01 02:00:00+00:00	20.120499	93.10486	18.970500	22.589590	0.0	0.0	0.0	0.0	...	991.03800	42.6	45.0	0.0	7.0	6.130579	9.885262	356.633600	10.491434	10.440001
3	3	2010-01-01 03:00:00+00:00	23.720500	78.55701	19.770500	26.665770	0.0	0.0	0.0	0.0	...	992.17840	3.9	0.0	0.0	13.0	5.506941	9.346143	11.309895	15.642312	14.759999
4	4	2010-01-01 04:00:00+00:00	25.070500	71.33952	19.520500	27.424469	0.0	0.0	0.0	0.0	...	993.05750	11.4	1.0	0.0	35.0	8.707237	11.609651	29.744795	29.744795	22.680000
5 rows × 21 columns

........................................

📄 File: Alangayam.csv (19.70 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	18.536499	97.829780	18.186499	20.949156	0.0	0.0	0.0	0.0	...	954.9821	90.0	100.0	0.0	0.0	4.024922	5.411986	349.69522	3.814010	18.000000
1	1	2010-01-01 01:00:00+00:00	18.636500	97.831436	18.286499	21.083105	0.0	0.0	0.0	0.0	...	955.5670	90.0	100.0	0.0	0.0	4.104631	5.400000	344.74480	360.000000	18.359999
2	2	2010-01-01 02:00:00+00:00	19.386500	93.653120	18.336500	21.970108	0.0	0.0	0.0	0.0	...	956.7472	90.0	100.0	0.0	0.0	3.319036	6.479999	347.47120	360.000000	19.800000
3	3	2010-01-01 03:00:00+00:00	21.936499	75.156456	17.336500	24.030970	0.0	0.0	0.0	0.0	...	958.0770	81.0	90.0	0.0	0.0	3.600000	6.638072	360.00000	12.528798	21.240000
4	4	2010-01-01 04:00:00+00:00	23.586500	64.434456	16.486500	25.063873	0.0	0.0	0.0	0.0	...	959.1391	0.0	0.0	0.0	0.0	5.351785	7.653705	42.27363	41.185837	26.280000
5 rows × 21 columns

........................................

📄 File: Alangudi.csv (19.74 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.587000	94.585915	19.687000	22.823143	0.0	0.0	0.0	0.0	...	1001.23190	0.000000	0.0	0.0	0.0	10.105681	21.316135	355.914460	4.843920	16.560000
1	1	2010-01-01 01:00:00+00:00	20.587000	95.174510	19.786999	22.876421	0.0	0.0	0.0	0.0	...	1001.92530	0.000000	0.0	0.0	0.0	10.080000	21.746504	360.000000	6.654330	17.280000
2	2	2010-01-01 02:00:00+00:00	21.437000	92.311220	20.137000	23.740307	0.0	0.0	0.0	0.0	...	1003.14105	0.900000	1.0	0.0	0.0	11.183201	21.129885	3.691312	8.820306	20.160000
3	3	2010-01-01 03:00:00+00:00	23.637000	83.554146	20.687000	26.068895	0.0	0.0	0.0	0.0	...	1004.10260	8.099999	9.0	0.0	0.0	12.224107	17.208603	13.627024	15.780828	24.119999
4	4	2010-01-01 04:00:00+00:00	25.286999	77.342880	21.036999	27.295832	0.0	0.0	0.0	0.0	...	1004.84784	34.200000	38.0	0.0	0.0	16.375053	22.171440	33.340725	32.399826	28.080000
5 rows × 21 columns

........................................

📄 File: Alangulam.csv (19.74 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	20.6525	92.267130	19.3525	23.179234	0.0	0.0	0.0	0.0	...	995.93884	18.300000	8.0	0.0	37.0	6.989936	14.759999	325.491400	347.31960	15.840000
1	1	2010-01-01 01:00:00+00:00	20.7025	92.269920	19.4025	23.262985	0.0	0.0	0.0	0.0	...	996.43420	21.300001	7.0	0.0	50.0	6.924738	15.273505	332.102800	351.87000	16.199999
2	2	2010-01-01 02:00:00+00:00	21.3525	90.606636	19.7525	23.963280	0.0	0.0	0.0	0.0	...	997.64880	29.100002	4.0	0.0	85.0	7.754637	14.830076	338.198520	354.42790	18.720000
3	3	2010-01-01 03:00:00+00:00	23.6025	80.511570	20.0525	26.230854	0.0	0.0	0.0	0.0	...	998.84247	26.100000	0.0	0.0	87.0	8.647496	12.261158	2.385899	3.36640	23.400000
4	4	2010-01-01 04:00:00+00:00	25.0525	72.902756	19.8525	27.063715	0.0	0.0	0.0	0.0	...	999.60230	28.500000	6.0	0.0	77.0	12.181625	16.279802	18.970512	18.03438	29.160000
5 rows × 21 columns

........................................

📄 File: Alasandigutta.csv (6.56 MB)
Features: ['Unnamed: 0', 'date', 'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature', 'precipitation', 'rain', 'snowfall', 'snow_depth', 'pressure_msl', 'surface_pressure', 'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'wind_speed_10m', 'wind_speed_100m', 'wind_direction_10m', 'wind_direction_100m', 'wind_gusts_10m']
Preview:
Unnamed: 0	date	temperature_2m	relative_humidity_2m	dew_point_2m	apparent_temperature	precipitation	rain	snowfall	snow_depth	...	surface_pressure	cloud_cover	cloud_cover_low	cloud_cover_mid	cloud_cover_high	wind_speed_10m	wind_speed_100m	wind_direction_10m	wind_direction_100m	wind_gusts_10m
0	0	2010-01-01 00:00:00+00:00	21.5455	75.330700	16.995500	22.793024	0.0	0.0	0.0	0.0	...	963.53906	16.800000	18.0	0.0	2.0	8.404284	17.418196	99.865746	108.060560	16.919998
1	1	2010-01-01 01:00:00+00:00	20.9455	78.650760	17.095499	22.236164	0.0	0.0	0.0	0.0	...	964.20430	14.700000	15.0	2.0	0.0	8.404284	17.418196	99.865746	108.060560	16.560000
2	2	2010-01-01 02:00:00+00:00	21.1455	78.183650	17.195500	22.252518	0.0	0.0	0.0	0.0	...	965.09296	15.000000	16.0	1.0	0.0	9.957109	16.854767	102.528800	109.983190	17.280000
3	3	2010-01-01 03:00:00+00:00	23.0455	67.893600	16.795500	23.903963	0.0	0.0	0.0	0.0	...	966.25420	12.599999	14.0	0.0	0.0	10.483357	13.661038	105.945465	108.435040	23.039999
4	4	2010-01-01 04:00:00+00:00	25.2455	57.819714	16.345499	25.724060	0.0	0.0	0.0	0.0	...	966.88740	5.400000	6.0	0.0	0.0	11.792404	14.759999	102.339070	102.680374	28.800000
5 rows × 21 columns

........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/air_quality
----------------------------------------------------------------

📄 File: city_day.csv (2.45 MB)
Features: ['City', 'Date', 'PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene', 'AQI', 'AQI_Bucket']
Preview:
City	Date	PM2.5	PM10	NO	NO2	NOx	NH3	CO	SO2	O3	Benzene	Toluene	Xylene	AQI	AQI_Bucket
0	Ahmedabad	2015-01-01	NaN	NaN	0.92	18.22	17.15	NaN	0.92	27.64	133.36	0.00	0.02	0.00	NaN	NaN
1	Ahmedabad	2015-01-02	NaN	NaN	0.97	15.69	16.46	NaN	0.97	24.55	34.06	3.68	5.50	3.77	NaN	NaN
2	Ahmedabad	2015-01-03	NaN	NaN	17.40	19.30	29.70	NaN	17.40	29.07	30.70	6.80	16.40	2.25	NaN	NaN
3	Ahmedabad	2015-01-04	NaN	NaN	1.70	18.48	17.97	NaN	1.70	18.59	36.08	4.43	10.14	1.00	NaN	NaN
4	Ahmedabad	2015-01-05	NaN	NaN	22.10	21.42	37.76	NaN	22.10	39.33	39.31	7.01	18.89	2.78	NaN	NaN
........................................

📄 File: city_hour.csv (62.61 MB)
Features: ['City', 'Datetime', 'PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene', 'AQI', 'AQI_Bucket']
Preview:
City	Datetime	PM2.5	PM10	NO	NO2	NOx	NH3	CO	SO2	O3	Benzene	Toluene	Xylene	AQI	AQI_Bucket
0	Ahmedabad	2015-01-01 01:00:00	NaN	NaN	1.00	40.01	36.37	NaN	1.00	122.07	NaN	0.0	0.0	0.0	NaN	NaN
1	Ahmedabad	2015-01-01 02:00:00	NaN	NaN	0.02	27.75	19.73	NaN	0.02	85.90	NaN	0.0	0.0	0.0	NaN	NaN
2	Ahmedabad	2015-01-01 03:00:00	NaN	NaN	0.08	19.32	11.08	NaN	0.08	52.83	NaN	0.0	0.0	0.0	NaN	NaN
3	Ahmedabad	2015-01-01 04:00:00	NaN	NaN	0.30	16.45	9.20	NaN	0.30	39.53	153.58	0.0	0.0	0.0	NaN	NaN
4	Ahmedabad	2015-01-01 05:00:00	NaN	NaN	0.12	14.90	7.85	NaN	0.12	32.63	NaN	0.0	0.0	0.0	NaN	NaN
........................................

📄 File: station_day.csv (8.23 MB)
Features: ['StationId', 'Date', 'PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene', 'AQI', 'AQI_Bucket']
Preview:
StationId	Date	PM2.5	PM10	NO	NO2	NOx	NH3	CO	SO2	O3	Benzene	Toluene	Xylene	AQI	AQI_Bucket
0	AP001	2017-11-24	71.36	115.75	1.75	20.65	12.40	12.19	0.10	10.76	109.26	0.17	5.92	0.10	NaN	NaN
1	AP001	2017-11-25	81.40	124.50	1.44	20.50	12.08	10.72	0.12	15.24	127.09	0.20	6.50	0.06	184.0	Moderate
2	AP001	2017-11-26	78.32	129.06	1.26	26.00	14.85	10.28	0.14	26.96	117.44	0.22	7.95	0.08	197.0	Moderate
3	AP001	2017-11-27	88.76	135.32	6.60	30.85	21.77	12.91	0.11	33.59	111.81	0.29	7.63	0.12	198.0	Moderate
4	AP001	2017-11-28	64.18	104.09	2.56	28.07	17.01	11.42	0.09	19.00	138.18	0.17	5.02	0.07	188.0	Moderate
........................................

📄 File: station_hour.csv (209.50 MB)
Features: ['StationId', 'Datetime', 'PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene', 'AQI', 'AQI_Bucket']
Preview:
StationId	Datetime	PM2.5	PM10	NO	NO2	NOx	NH3	CO	SO2	O3	Benzene	Toluene	Xylene	AQI	AQI_Bucket
0	AP001	2017-11-24 17:00:00	60.50	98.00	2.35	30.80	18.25	8.50	0.1	11.85	126.40	0.1	6.10	0.10	NaN	NaN
1	AP001	2017-11-24 18:00:00	65.50	111.25	2.70	24.20	15.07	9.77	0.1	13.17	117.12	0.1	6.25	0.15	NaN	NaN
2	AP001	2017-11-24 19:00:00	80.00	132.00	2.10	25.18	15.15	12.02	0.1	12.08	98.98	0.2	5.98	0.18	NaN	NaN
3	AP001	2017-11-24 20:00:00	81.50	133.25	1.95	16.25	10.23	11.58	0.1	10.47	112.20	0.2	6.72	0.10	NaN	NaN
4	AP001	2017-11-24 21:00:00	75.25	116.00	1.43	17.48	10.43	12.03	0.1	9.12	106.35	0.2	5.75	0.08	NaN	NaN
........................................

📄 File: stations.csv (0.01 MB)
Features: ['StationId', 'StationName', 'City', 'State', 'Status']
Preview:
StationId	StationName	City	State	Status
0	AP001	Secretariat, Amaravati - APPCB	Amaravati	Andhra Pradesh	Active
1	AP002	Anand Kala Kshetram, Rajamahendravaram - APPCB	Rajamahendravaram	Andhra Pradesh	NaN
2	AP003	Tirumala, Tirupati - APPCB	Tirupati	Andhra Pradesh	NaN
3	AP004	PWD Grounds, Vijayawada - APPCB	Vijayawada	Andhra Pradesh	NaN
4	AP005	GVM Corporation, Visakhapatnam - APPCB	Visakhapatnam	Andhra Pradesh	Active
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/water_quality
------------------------------------------------------------------

📄 File: Water_pond_tanks_2021_fixed.csv (0.07 MB)
Features: ['STN\nCode', 'Name of Monitoring Location', 'Type Water Body', 'State Name', 'Temperature\n?C (Min)', 'Temperature\n?C (Max)', 'Dissolved Oxygen (mg/L) (Min)', 'Dissolved Oxygen (mg/L) (Max)', 'pH (Min)', 'pH (Max)', 'Conductivity (?mhos/cm) (Min)', 'Conductivity (?mhos/cm) (Max)', 'BOD (mg/L) (Min)', 'BOD (mg/L) (Max)', 'Nitrate N + Nitrite N(mg/L) (Min)', 'Nitrate N + Nitrite N(mg/L) (Max)', 'Fecal Coliform (MPN/100ml) (Min)', 'Fecal Coliform (MPN/100ml) (Max)', 'Total Coliform (MPN/100ml) (Min)', 'Total Coliform (MPN/100ml) (Max)']
Preview:
STN\nCode	Name of Monitoring Location	Type Water Body	State Name	Temperature\n?C (Min)	Temperature\n?C (Max)	Dissolved Oxygen (mg/L) (Min)	Dissolved Oxygen (mg/L) (Max)	pH (Min)	pH (Max)	Conductivity (?mhos/cm) (Min)	Conductivity (?mhos/cm) (Max)	BOD (mg/L) (Min)	BOD (mg/L) (Max)	Nitrate N + Nitrite N(mg/L) (Min)	Nitrate N + Nitrite N(mg/L) (Max)	Fecal Coliform (MPN/100ml) (Min)	Fecal Coliform (MPN/100ml) (Max)	Total Coliform (MPN/100ml) (Min)	Total Coliform (MPN/100ml) (Max)
0	4368.0	KOLLERU LAKE KOKKIRAYALANKA (V), KAILALUR (M)	LAKE	ANDHRA PRADESH	24.0	27.0	3.2	6.5	7.0	8.0	245	5160	1.6	3.2	1.02	3.60	9	21	120	210
1	2353.0	KONDAKARLA-AAVA LAKE, PARAWADA PHARMA CITY, VI...	LAKE	ANDHRA PRADESH	26.0	29.0	3.0	6.8	6.9	7.8	599	1179	1.9	4.6	0.77	3.56	15	23	150	240
2	1790.0	PULICATE LAKE , NELLORE DIST	LAKE	ANDHRA PRADESH	18.0	24.0	4.2	6.0	7.2	8.2	28000	56900	2.4	2.8	1.20	1.64	3	3	47	150
3	4391.0	CHENGAMBAKAM TANK IN SRI CITY SEZ,\nTIRUPATHI	TANK	ANDHRA PRADESH	22.0	29.0	5.4	6.2	6.3	7.9	180	476	1.0	2.5	0.34	2.30	24	365	170	549
4	4921.0	ANNAMAYYA PROJECT ON CHEYYERU\nRESERVOIR	Wetland	ANDHRA PRADESH	21.0	30.0	5.4	6.5	7.3	8.0	496	734	1.0	2.3	0.35	1.00	43	289	240	727
........................................

📄 File: water_dataX_fixed.csv (0.17 MB)
Features: ['STATION CODE', 'LOCATIONS', 'STATE', 'Temp', 'D.O. (mg/l)', 'PH', 'CONDUCTIVITY (µmhos/cm)', 'B.O.D. (mg/l)', 'NITRATENAN N+ NITRITENANN (mg/l)', 'FECAL COLIFORM (MPN/100ml)', 'TOTAL COLIFORM (MPN/100ml)Mean', 'year']
Preview:
STATION CODE	LOCATIONS	STATE	Temp	D.O. (mg/l)	PH	CONDUCTIVITY (µmhos/cm)	B.O.D. (mg/l)	NITRATENAN N+ NITRITENANN (mg/l)	FECAL COLIFORM (MPN/100ml)	TOTAL COLIFORM (MPN/100ml)Mean	year
0	1393	DAMANGANGA AT D/S OF MADHUBAN, DAMAN	DAMAN & DIU	30.6	6.7	7.5	203	NAN	0.1	11	27	2014
1	1399	ZUARI AT D/S OF PT. WHERE KUMBARJRIA CANAL JOI...	GOA	29.8	5.7	7.2	189	2	0.2	4953	8391	2014
2	1475	ZUARI AT PANCHAWADI	GOA	29.5	6.3	6.9	179	1.7	0.1	3243	5330	2014
3	3181	RIVER ZUARI AT BORIM BRIDGE	GOA	29.7	5.8	6.9	64	3.8	0.5	5382	8443	2014
4	3182	RIVER ZUARI AT MARCAIM JETTY	GOA	29.5	5.8	7.3	83	1.9	0.4	3428	5500	2014
........................................

📄 File: Water_pond_tanks_2021.csv (0.07 MB)
Features: ['STN\nCode', 'Name of Monitoring Location', 'Type Water Body', 'State Name', 'Temperature\n?C (Min)', 'Temperature\n?C (Max)', 'Dissolved Oxygen (mg/L) (Min)', 'Dissolved Oxygen (mg/L) (Max)', 'pH (Min)', 'pH (Max)', 'Conductivity (?mhos/cm) (Min)', 'Conductivity (?mhos/cm) (Max)', 'BOD (mg/L) (Min)', 'BOD (mg/L) (Max)', 'Nitrate N + Nitrite N(mg/L) (Min)', 'Nitrate N + Nitrite N(mg/L) (Max)', 'Fecal Coliform (MPN/100ml) (Min)', 'Fecal Coliform (MPN/100ml) (Max)', 'Total Coliform (MPN/100ml) (Min)', 'Total Coliform (MPN/100ml) (Max)']
Preview:
STN\nCode	Name of Monitoring Location	Type Water Body	State Name	Temperature\n?C (Min)	Temperature\n?C (Max)	Dissolved Oxygen (mg/L) (Min)	Dissolved Oxygen (mg/L) (Max)	pH (Min)	pH (Max)	Conductivity (?mhos/cm) (Min)	Conductivity (?mhos/cm) (Max)	BOD (mg/L) (Min)	BOD (mg/L) (Max)	Nitrate N + Nitrite N(mg/L) (Min)	Nitrate N + Nitrite N(mg/L) (Max)	Fecal Coliform (MPN/100ml) (Min)	Fecal Coliform (MPN/100ml) (Max)	Total Coliform (MPN/100ml) (Min)	Total Coliform (MPN/100ml) (Max)
0	4368.0	KOLLERU LAKE KOKKIRAYALANKA (V), KAILALUR (M)	LAKE	ANDHRA PRADESH	24.0	27.0	3.2	6.5	7.0	8.0	245	5160	1.6	3.2	1.02	3.60	9	21	120	210
1	2353.0	KONDAKARLA-AAVA LAKE, PARAWADA PHARMA CITY, VI...	LAKE	ANDHRA PRADESH	26.0	29.0	3.0	6.8	6.9	7.8	599	1179	1.9	4.6	0.77	3.56	15	23	150	240
2	1790.0	PULICATE LAKE , NELLORE DIST	LAKE	ANDHRA PRADESH	18.0	24.0	4.2	6.0	7.2	8.2	28000	56900	2.4	2.8	1.20	1.64	3	3	47	150
3	4391.0	CHENGAMBAKAM TANK IN SRI CITY SEZ,\nTIRUPATHI	TANK	ANDHRA PRADESH	22.0	29.0	5.4	6.2	6.3	7.9	180	476	1.0	2.5	0.34	2.30	24	365	170	549
4	4921.0	ANNAMAYYA PROJECT ON CHEYYERU\nRESERVOIR	Wetland	ANDHRA PRADESH	21.0	30.0	5.4	6.5	7.3	8.0	496	734	1.0	2.3	0.35	1.00	43	289	240	727
........................................

📄 File: fix_water.csv (0.17 MB)
Features: ['STATION CODE', 'LOCATIONS', 'STATE', 'Temp', 'D.O. (mg/l)', 'PH', 'CONDUCTIVITY (Âµmhos/cm)', 'B.O.D. (mg/l)', 'NITRATENAN N+ NITRITENANN (mg/l)', 'FECAL COLIFORM (MPN/100ml)', 'TOTAL COLIFORM (MPN/100ml)Mean', 'year']
Preview:
STATION CODE	LOCATIONS	STATE	Temp	D.O. (mg/l)	PH	CONDUCTIVITY (Âµmhos/cm)	B.O.D. (mg/l)	NITRATENAN N+ NITRITENANN (mg/l)	FECAL COLIFORM (MPN/100ml)	TOTAL COLIFORM (MPN/100ml)Mean	year
0	1393	DAMANGANGA AT D/S OF MADHUBAN, DAMAN	DAMAN & DIU	30.6	6.7	7.5	203	NAN	0.1	11	27	2014
1	1399	ZUARI AT D/S OF PT. WHERE KUMBARJRIA CANAL JOI...	GOA	29.8	5.7	7.2	189	2	0.2	4953	8391	2014
2	1475	ZUARI AT PANCHAWADI	GOA	29.5	6.3	6.9	179	1.7	0.1	3243	5330	2014
3	3181	RIVER ZUARI AT BORIM BRIDGE	GOA	29.7	5.8	6.9	64	3.8	0.5	5382	8443	2014
4	3182	RIVER ZUARI AT MARCAIM JETTY	GOA	29.5	5.8	7.3	83	1.9	0.4	3428	5500	2014
........................................

📄 File: water_dataX.csv (0.17 MB)
Features: ['STATION CODE', 'LOCATIONS', 'STATE', 'Temp', 'D.O. (mg/l)', 'PH', 'CONDUCTIVITY (Âµmhos/cm)', 'B.O.D. (mg/l)', 'NITRATENAN N+ NITRITENANN (mg/l)', 'FECAL COLIFORM (MPN/100ml)', 'TOTAL COLIFORM (MPN/100ml)Mean', 'year']
Preview:
STATION CODE	LOCATIONS	STATE	Temp	D.O. (mg/l)	PH	CONDUCTIVITY (Âµmhos/cm)	B.O.D. (mg/l)	NITRATENAN N+ NITRITENANN (mg/l)	FECAL COLIFORM (MPN/100ml)	TOTAL COLIFORM (MPN/100ml)Mean	year
0	1393	DAMANGANGA AT D/S OF MADHUBAN, DAMAN	DAMAN & DIU	30.6	6.7	7.5	203	NAN	0.1	11	27	2014
1	1399	ZUARI AT D/S OF PT. WHERE KUMBARJRIA CANAL JOI...	GOA	29.8	5.7	7.2	189	2	0.2	4953	8391	2014
2	1475	ZUARI AT PANCHAWADI	GOA	29.5	6.3	6.9	179	1.7	0.1	3243	5330	2014
3	3181	RIVER ZUARI AT BORIM BRIDGE	GOA	29.7	5.8	6.9	64	3.8	0.5	5382	8443	2014
4	3182	RIVER ZUARI AT MARCAIM JETTY	GOA	29.5	5.8	7.3	83	1.9	0.4	3428	5500	2014
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/road_accidents
-------------------------------------------------------------------

📄 File: accident_prediction_india.csv (0.40 MB)
Features: ['State Name', 'City Name', 'Year', 'Month', 'Day of Week', 'Time of Day', 'Accident Severity', 'Number of Vehicles Involved', 'Vehicle Type Involved', 'Number of Casualties', 'Number of Fatalities', 'Weather Conditions', 'Road Type', 'Road Condition', 'Lighting Conditions', 'Traffic Control Presence', 'Speed Limit (km/h)', 'Driver Age', 'Driver Gender', 'Driver License Status', 'Alcohol Involvement', 'Accident Location Details']
Preview:
State Name	City Name	Year	Month	Day of Week	Time of Day	Accident Severity	Number of Vehicles Involved	Vehicle Type Involved	Number of Casualties	...	Road Type	Road Condition	Lighting Conditions	Traffic Control Presence	Speed Limit (km/h)	Driver Age	Driver Gender	Driver License Status	Alcohol Involvement	Accident Location Details
0	Jammu and Kashmir	Unknown	2021	May	Monday	1:46	Serious	5	Cycle	0	...	National Highway	Wet	Dark	Signs	61	66	Male	NaN	Yes	Curve
1	Uttar Pradesh	Lucknow	2018	January	Wednesday	21:30	Minor	5	Truck	5	...	Urban Road	Dry	Dusk	Signs	92	60	Male	NaN	Yes	Straight Road
2	Chhattisgarh	Unknown	2023	May	Wednesday	5:37	Minor	5	Pedestrian	6	...	National Highway	Under Construction	Dawn	Signs	120	26	Female	NaN	No	Bridge
3	Uttar Pradesh	Lucknow	2020	June	Saturday	0:31	Minor	3	Bus	10	...	State Highway	Dry	Dark	Signals	76	34	Female	Valid	Yes	Straight Road
4	Sikkim	Unknown	2021	August	Thursday	11:21	Minor	5	Cycle	7	...	Urban Road	Wet	Dusk	Signs	115	30	Male	NaN	No	Intersection
5 rows × 22 columns

........................................

📄 File: Road.csv (4.10 MB)
Features: ['Time', 'Day_of_week', 'Age_band_of_driver', 'Sex_of_driver', 'Educational_level', 'Vehicle_driver_relation', 'Driving_experience', 'Type_of_vehicle', 'Owner_of_vehicle', 'Service_year_of_vehicle', 'Defect_of_vehicle', 'Area_accident_occured', 'Lanes_or_Medians', 'Road_allignment', 'Types_of_Junction', 'Road_surface_type', 'Road_surface_conditions', 'Light_conditions', 'Weather_conditions', 'Type_of_collision', 'Number_of_vehicles_involved', 'Number_of_casualties', 'Vehicle_movement', 'Casualty_class', 'Sex_of_casualty', 'Age_band_of_casualty', 'Casualty_severity', 'Work_of_casuality', 'Fitness_of_casuality', 'Pedestrian_movement', 'Cause_of_accident', 'Accident_severity']
Preview:
Time	Day_of_week	Age_band_of_driver	Sex_of_driver	Educational_level	Vehicle_driver_relation	Driving_experience	Type_of_vehicle	Owner_of_vehicle	Service_year_of_vehicle	...	Vehicle_movement	Casualty_class	Sex_of_casualty	Age_band_of_casualty	Casualty_severity	Work_of_casuality	Fitness_of_casuality	Pedestrian_movement	Cause_of_accident	Accident_severity
0	17:02:00	Monday	18-30	Male	Above high school	Employee	1-2yr	Automobile	Owner	Above 10yr	...	Going straight	na	na	na	na	NaN	NaN	Not a Pedestrian	Moving Backward	Slight Injury
1	17:02:00	Monday	31-50	Male	Junior high school	Employee	Above 10yr	Public (> 45 seats)	Owner	5-10yrs	...	Going straight	na	na	na	na	NaN	NaN	Not a Pedestrian	Overtaking	Slight Injury
2	17:02:00	Monday	18-30	Male	Junior high school	Employee	1-2yr	Lorry (41?100Q)	Owner	NaN	...	Going straight	Driver or rider	Male	31-50	3	Driver	NaN	Not a Pedestrian	Changing lane to the left	Serious Injury
3	1:06:00	Sunday	18-30	Male	Junior high school	Employee	5-10yr	Public (> 45 seats)	Governmental	NaN	...	Going straight	Pedestrian	Female	18-30	3	Driver	Normal	Not a Pedestrian	Changing lane to the right	Slight Injury
4	1:06:00	Sunday	18-30	Male	Junior high school	Employee	2-5yr	NaN	Owner	5-10yrs	...	Going straight	na	na	na	na	NaN	NaN	Not a Pedestrian	Overtaking	Slight Injury
5 rows × 32 columns

........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/disasters
--------------------------------------------------------------

📄 File: flood_risk_dataset_india.csv (1.77 MB)
Features: ['Latitude', 'Longitude', 'Rainfall (mm)', 'Temperature (°C)', 'Humidity (%)', 'River Discharge (m³/s)', 'Water Level (m)', 'Elevation (m)', 'Land Cover', 'Soil Type', 'Population Density', 'Infrastructure', 'Historical Floods', 'Flood Occurred']
Preview:
Latitude	Longitude	Rainfall (mm)	Temperature (°C)	Humidity (%)	River Discharge (m³/s)	Water Level (m)	Elevation (m)	Land Cover	Soil Type	Population Density	Infrastructure	Historical Floods	Flood Occurred
0	18.861663	78.835584	218.999493	34.144337	43.912963	4236.182888	7.415552	377.465433	Water Body	Clay	7276.742184	1	0	1
1	35.570715	77.654451	55.353599	28.778774	27.585422	2472.585219	8.811019	7330.608875	Forest	Peat	6897.736956	0	1	0
2	29.227824	73.108463	103.991908	43.934956	30.108738	977.328053	4.631799	2205.873488	Agricultural	Loam	4361.518494	1	1	1
3	25.361096	85.610733	198.984191	21.569354	34.453690	3683.208933	2.891787	2512.277800	Desert	Sandy	6163.069701	1	1	0
4	12.524541	81.822101	144.626803	32.635692	36.292267	2093.390678	3.188466	2001.818223	Agricultural	Loam	6167.964591	1	0	0
........................................

📄 File: India_Floods_Inventory.csv (0.23 MB)
Features: ['UEI', 'Start Date', 'End Date', 'Duration(Days)', 'Main Cause', 'Location', 'Districts', 'State', 'Latitude', 'Longitude', 'Severity', 'Area Affected', 'Human fatality', 'Human injured', 'Human Displaced', 'Animal Fatality', 'Description of Casualties/injured', 'Extent of damage ', 'Event Source', 'Event Souce ID']
Preview:
UEI	Start Date	End Date	Duration(Days)	Main Cause	Location	Districts	State	Latitude	Longitude	Severity	Area Affected	Human fatality	Human injured	Human Displaced	Animal Fatality	Description of Casualties/injured	Extent of damage	Event Source	Event Souce ID
0	UEI-IMD-FL-2015-0001	2015-06-20	2015-06-21	1	Heavy rains	NaN	East Godavari, Srikakulam, Visakhapatnam and W...	ANDHRA PRADESH	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	NaN	i) Damage to 2000 hectares of crops reported. ...	IMD	NaN
1	UEI-IMD-FL-2015-0002	2015-11-15	2015-11-23	8	Heavy rains	NaN	Anantapur, Chittoor, East Godavari, Krishna, N...	ANDHRA PRADESH	NaN	NaN	NaN	NaN	88.0	NaN	NaN	16710.0	88 persons died. 16710 animals perished. (844 ...	i) Extensive damage to Agricultural crops (mor...	IMD	NaN
2	UEI-IMD-FL-2015-0003	2015-12-22	2015-12-22	0	Heavy rains	NaN	Vishakhapatnam	ANDHRA PRADESH	NaN	NaN	NaN	NaN	4.0	NaN	NaN	NaN	4 persons died due to landslips	Landslips	IMD	NaN
3	UEI-IMD-FL-2015-0004	2015-10-06	2015-10-06	0	Heavy rains	NaN	Parts of Arunachal Pradesh	ARUNACHAL PRADESH	NaN	NaN	NaN	NaN	2.0	NaN	NaN	NaN	2 persons died.	NaN	IMD	NaN
4	UEI-IMD-FL-2015-0005	2015-02-19	2015-02-19	0	Heavy rains	NaN	Parts of Assam	ASSAM	NaN	NaN	NaN	NaN	2.0	NaN	NaN	NaN	2 persons died due to landslide	NaN	IMD	NaN
........................................

📄 File: Indian_earthquake_data.csv (0.21 MB)
Features: ['Origin Time', 'Latitude', 'Longitude', 'Depth', 'Magnitude', 'Location']
Preview:
Origin Time	Latitude	Longitude	Depth	Magnitude	Location
0	2021-07-31 09:43:23 IST	29.06	77.42	5	2.5	53km NNE of New Delhi, India
1	2021-07-30 23:04:57 IST	19.93	72.92	5	2.4	91km W of Nashik, Maharashtra, India
2	2021-07-30 21:31:10 IST	31.50	74.37	33	3.4	49km WSW of Amritsar, Punjab, India
3	2021-07-30 13:56:31 IST	28.34	76.23	5	3.1	50km SW of Jhajjar, Haryana
4	2021-07-30 07:19:38 IST	27.09	89.97	10	2.1	53km SE of Thimphu, Bhutan
........................................

📄 File: disasterIND.csv (0.35 MB)
Features: ['DisNo.', 'Historic', 'Classification Key', 'Disaster Group', 'Disaster Subgroup', 'Disaster Type', 'Disaster Subtype', 'External IDs', 'Event Name', 'ISO', 'Country', 'Subregion', 'Region', 'Location', 'Origin', 'Associated Types', 'OFDA/BHA Response', 'Appeal', 'Declaration', "AID Contribution ('000 US$)", 'Magnitude', 'Magnitude Scale', 'Latitude', 'Longitude', 'River Basin', 'Start Year', 'Start Month', 'Start Day', 'End Year', 'End Month', 'End Day', 'Total Deaths', 'No. Injured', 'No. Affected', 'No. Homeless', 'Total Affected', "Reconstruction Costs ('000 US$)", "Reconstruction Costs, Adjusted ('000 US$)", "Insured Damage ('000 US$)", "Insured Damage, Adjusted ('000 US$)", "Total Damage ('000 US$)", "Total Damage, Adjusted ('000 US$)", 'CPI', 'Admin Units', 'Entry Date', 'Last Update']
Preview:
DisNo.	Historic	Classification Key	Disaster Group	Disaster Subgroup	Disaster Type	Disaster Subtype	External IDs	Event Name	ISO	...	Reconstruction Costs ('000 US$)	Reconstruction Costs, Adjusted ('000 US$)	Insured Damage ('000 US$)	Insured Damage, Adjusted ('000 US$)	Total Damage ('000 US$)	Total Damage, Adjusted ('000 US$)	CPI	Admin Units	Entry Date	Last Update
0	1900-9001-IND	Yes	nat-cli-dro-dro	Natural	Climatological	Drought	Drought	NaN	NaN	IND	...	NaN	NaN	NaN	NaN	NaN	NaN	2.730451	NaN	2006-12-01	2023-09-25
1	1905-0003-IND	Yes	nat-geo-ear-gro	Natural	Geophysical	Earthquake	Ground movement	NaN	NaN	IND	...	NaN	NaN	NaN	NaN	25000.0	847777.0	2.948887	NaN	2003-07-01	2023-09-25
2	1907-0001-IND	Yes	nat-bio-epi-bac	Natural	Biological	Epidemic	Bacterial disease	NaN	Bubonic	IND	...	NaN	NaN	NaN	NaN	NaN	NaN	3.058105	NaN	2003-07-01	2023-09-25
3	1916-0004-IND	Yes	nat-met-sto-tro	Natural	Meteorological	Storm	Tropical cyclone	NaN	NaN	IND	...	NaN	NaN	NaN	NaN	NaN	NaN	3.576717	NaN	2003-07-01	2023-09-25
4	1920-0001-IND	Yes	nat-bio-epi-bac	Natural	Biological	Epidemic	Bacterial disease	NaN	Bubonic	IND	...	NaN	NaN	NaN	NaN	NaN	NaN	6.562784	NaN	2003-07-01	2023-09-25
5 rows × 46 columns

........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/terrain
------------------------------------------------------------

📄 File: Districts_elevation.csv (0.02 MB)
Features: ['District', 'Latitude', 'Longitude', 'elevation']
Preview:
District	Latitude	Longitude	elevation
0	Adilabad	19.663259	78.555315	256
1	Agra	27.175680	78.008109	170
2	Ahmadabad	23.026157	72.589687	51
3	Ahmadnagar	19.093412	74.746855	657
4	Aizawl	23.748659	92.728016	937
........................................

📄 File: LandslideIncidences.csv (0.03 MB)
Features: ['Unnamed: 0', 'Title', 'LandslideIncidence']
Preview:
Unnamed: 0	Title	LandslideIncidence
0	0	Landslide at TNEB Colony, Emerald, Nilgiri Dis...	A landslide (earth-flow) occurred near the TNE...
1	1	Landslide at Talacauvery, Bhagamandala, Kodagu...	The landslide in Talacauvery has occurred on 0...
2	2	Landslide at Pettimudi, near Munnar, Idukki Di...	A landslide occurred at Pettimudi, near Munnar...
3	3	Landslide in and around Longmai-Khumji Noney A...	The Longmai landslide (Lat: 24°51’19.3”N and ...
4	4	Landslide around Mao Town, Senapati District, ...	The Mao landslide (Lat: 25°30’57.3”N and Lon: ...
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/health
-----------------------------------------------------------

📄 File: Hospitals In India (Anonymized).csv (0.23 MB)
Features: ['id', 'City', 'State', 'District', 'Density', 'Latitude', 'Longitude', 'Rating', 'Number of Reviews']
Preview:
id	City	State	District	Density	Latitude	Longitude	Rating	Number of Reviews
0	Hospital #0	Anantpur	Andhra Pradesh	Ananthapuramu	219.608	14.696533	77.584570	4.1	229
1	Hospital #1	Anantpur	Andhra Pradesh	Ananthapuramu	219.608	14.660635	77.579342	4.9	19172
2	Hospital #2	Chitoor	Andhra Pradesh	Chittoor	273.230	13.229217	79.084472	3.9	139
3	Hospital #3	Chittoor	Andhra Pradesh	Chittoor	273.230	13.303435	78.972117	4.0	92
4	Hospital #4	East Godavari	Andhra Pradesh	East Godavari	715.460	16.970995	82.230396	4.8	8090
........................................

📄 File: allo-doc-PHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]', 'Note of Shortfall - [R-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]	Note of Shortfall - [R-P]
0	1	Andhra Pradesh	1147	1952.0	1644	308.0	NaN	NaN	NaN	*
1	2	Arunachal Pradesh	143	NaN	122	NaN	21.0	NaN	NaN	NaN
2	3	Assam	1014	NaN	1048	NaN	NaN	NaN	NaN	*
3	4	Bihar	1899	2078.0	1786	292.0	113.0	#	NaN	NaN
4	5	Chhattisgarh	785	798.0	341	457.0	444.0	NaN	NaN	NaN
........................................

📄 File: assistant-female-PHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]', 'Note of Shortfall - [R-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]	Note of Shortfall - [R-P]
0	1	Andhra Pradesh	1147	1264.0	1143	121.0	4	NaN	NaN	NaN
1	2	Arunachal Pradesh	143	NaN	6	NaN	137	NaN	NaN	NaN
2	3	Assam	1014	379.0	308	71.0	706	$	NaN	NaN
3	4	Bihar	1899	850.0	95	755.0	1804	#	NaN	NaN
4	5	Chhattisgarh	785	800.0	640	160.0	145	NaN	NaN	NaN
........................................

📄 File: assistant-male-PHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]', 'Note of Shortfall - [R-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]	Note of Shortfall - [R-P]
0	1	Andhra Pradesh	1147	0.0	0	0.0	1147	NaN	NaN	NaN
1	2	Arunachal Pradesh	143	NaN	81	NaN	62	NaN	NaN	NaN
2	3	Assam	1014	NaN	106	NaN	908	NaN	NaN	NaN
3	4	Bihar	1899	649.0	212	437.0	1687	#	NaN	NaN
4	5	Chhattisgarh	785	588.0	425	163.0	360	NaN	NaN	NaN
........................................

📄 File: dis-subdis-doctors_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'District Hospital - Sanctioned', 'District Hospital - In Position', 'Sub District/ Sub Divisional Hospital - Sanctioned', 'Sub District/ Sub Divisional Hospital - In Position', 'Note of State/ UT']
Preview:
S. No.	State/ UT	District Hospital - Sanctioned	District Hospital - In Position	Sub District/ Sub Divisional Hospital - Sanctioned	Sub District/ Sub Divisional Hospital - In Position	Note of State/ UT
0	1	Andhra Pradesh	433.0	306	668.0	459.0	NaN
1	2	Arunachal Pradesh	NaN	381	NaN	NaN	NaN
2	3	Assam	NaN	655	NaN	127.0	NaN
3	4	Bihar	888.0	558	NaN	287.0	NaN
4	5	Chhattisgarh	872.0	581	175.0	70.0	NaN
........................................

📄 File: facilities-CHCS_2017.csv (0.00 MB)
Features: ['State/ UT - Col. 1', 'Number of CHCs Functioning - Col. 2', 'Number of Community Health Centres - With all four specialists - Col. 3', 'Number of Community Health Centres - With computer/ Statistical Asst. for MIS/ Accountant - Col. 4', 'Number of Community Health Centres - With functional Laboratory - Col. 5', 'Number of Community Health Centres - With functional O.T. - Col. 6', 'Number of Community Health Centres - With functional Labor Room - Col. 7', 'Number of Community Health Centres - With functioning Stabilization Units for New Born - Col. 8', 'Number of Community Health Centres - With New Born Care Corner - Col. 9', 'Number of Community Health Centres - With at least 30 beds - Col. 10', 'Number of Community Health Centres - With functional X-Ray machine - Col. 11', 'Number of Community Health Centres - With quarters for specialist Doctors - Col. 12', 'Number of Community Health Centres - With specialist Doctors living in quarters - Col. 13', 'Number of Community Health Centres - With referral transport available - Col. 14', 'Number of Community Health Centres - With registered RKS - Col. 15', 'Number of Community Health Centres - Functioning as per IPHS norms - Col. 16', 'No. of CHC having a regular supply of - Allopathic drugs for common ailments - Col. 17', 'No. of CHC having a regular supply of - AYUSH drugs for common ailments - Col. 18']
Preview:
State/ UT - Col. 1	Number of CHCs Functioning - Col. 2	Number of Community Health Centres - With all four specialists - Col. 3	Number of Community Health Centres - With computer/ Statistical Asst. for MIS/ Accountant - Col. 4	Number of Community Health Centres - With functional Laboratory - Col. 5	Number of Community Health Centres - With functional O.T. - Col. 6	Number of Community Health Centres - With functional Labor Room - Col. 7	Number of Community Health Centres - With functioning Stabilization Units for New Born - Col. 8	Number of Community Health Centres - With New Born Care Corner - Col. 9	Number of Community Health Centres - With at least 30 beds - Col. 10	Number of Community Health Centres - With functional X-Ray machine - Col. 11	Number of Community Health Centres - With quarters for specialist Doctors - Col. 12	Number of Community Health Centres - With specialist Doctors living in quarters - Col. 13	Number of Community Health Centres - With referral transport available - Col. 14	Number of Community Health Centres - With registered RKS - Col. 15	Number of Community Health Centres - Functioning as per IPHS norms - Col. 16	No. of CHC having a regular supply of - Allopathic drugs for common ailments - Col. 17	No. of CHC having a regular supply of - AYUSH drugs for common ailments - Col. 18
0	Andhra Pradesh	193	7	193	193	193	193	63.0	193	193	95	0	0	193	193	0.0	193	91.0
1	Arunachal Pradesh	63	1	30	50	29	57	21.0	48	13	7	5	2	53	56	0.0	59	24.0
2	Assam	158	6	148	154	153	158	99.0	158	90	59	114	79	136	158	0.0	158	108.0
3	Bihar	150	24	150	150	150	150	NaN	51	150	150	28	24	148	68	NaN	150	NaN
4	Chhattisgarh	169	6	155	155	133	155	94.0	150	131	123	87	51	155	152	0.0	157	88.0
........................................

📄 File: facilities-PHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Number of PHCs Functioning', 'Number of Primary Health Centres - PHCs functoning on 24X7 basis - Number', 'Number of Primary Health Centres - PHCs functoning on 24X7 basis - %', 'Number of Primary Health Centres - With Labour Room - Number', 'Number of Primary Health Centres - With Labour Room - %', 'Number of Primary Health Centres - With OT - Number', 'Number of Primary Health Centres - With OT - %', 'Number of Primary Health Centres - With at least 4 beds - Number', 'Number of Primary Health Centres - With at least 4 beds - %', 'Number of Primary Health Centres - Without Electric Supply - Number', 'Number of Primary Health Centres - Without Electric Supply - %', 'Number of Primary Health Centres - Without Regular Water Supply - Number', 'Number of Primary Health Centres - Without Regular Water Supply - %', 'Number of Primary Health Centres - Without All-Weather Motorable Approach Road - Number', 'Number of Primary Health Centres - Without All-Weather Motorable Approach Road - %', 'Number of Primary Health Centres - With Telephone - Number', 'Number of Primary Health Centres - With Telephone - %', 'Number of Primary Health Centres - With Computer - Number', 'Number of Primary Health Centres - With Computer - %', 'Number of Primary Health Centres - Referral Transport', 'Registered RKS', 'No. of PHCs Functioning as per IPHS norms']
Preview:
S. No.	State/ UT	Number of PHCs Functioning	Number of Primary Health Centres - PHCs functoning on 24X7 basis - Number	Number of Primary Health Centres - PHCs functoning on 24X7 basis - %	Number of Primary Health Centres - With Labour Room - Number	Number of Primary Health Centres - With Labour Room - %	Number of Primary Health Centres - With OT - Number	Number of Primary Health Centres - With OT - %	Number of Primary Health Centres - With at least 4 beds - Number	...	Number of Primary Health Centres - Without Regular Water Supply - %	Number of Primary Health Centres - Without All-Weather Motorable Approach Road - Number	Number of Primary Health Centres - Without All-Weather Motorable Approach Road - %	Number of Primary Health Centres - With Telephone - Number	Number of Primary Health Centres - With Telephone - %	Number of Primary Health Centres - With Computer - Number	Number of Primary Health Centres - With Computer - %	Number of Primary Health Centres - Referral Transport	Registered RKS	No. of PHCs Functioning as per IPHS norms
0	1	Andhra Pradesh	1147	514	44.8	979	85.4	946	82.5	1147	...	0.0	0	0.0	1075	93.7	1075	93.7	1147	1147	514.0
1	2	Arunachal Pradesh	143	64	44.8	72	50.3	20	14.0	54	...	16.8	26	18.2	7	4.9	13	9.1	56	117	0.0
2	3	Assam	1014	571	56.3	766	75.5	47	4.6	332	...	12.0	53	5.2	191	18.8	634	62.5	482	1014	0.0
3	4	Bihar	1899	795	41.9	795	41.9	496	26.1	795	...	0.0	0	0.0	526	27.7	783	41.2	496	1783	NaN
4	5	Chhattisgarh	785	226	28.8	693	88.3	256	32.6	585	...	9.9	33	4.2	181	23.1	751	95.7	374	772	0.0
5 rows × 24 columns

........................................

📄 File: functioning-PHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Total PHCs functioning', 'Number of PHCs functioning - with 4+ - doctors', 'Number of PHCs functioning - with 3 - doctors', 'Number of PHCs functioning - with 2 - doctors', 'Number of PHCs functioning - with 1 - doctor', 'Number of PHCs functioning - without - doctor', 'Number of PHCs functioning - without - lab tech.', 'Number of PHCs functioning - without - pharma.', 'Number of PHCs functioning - with - lady - doctor', 'Note of State/ UT']
Preview:
S. No.	State/ UT	Total PHCs functioning	Number of PHCs functioning - with 4+ - doctors	Number of PHCs functioning - with 3 - doctors	Number of PHCs functioning - with 2 - doctors	Number of PHCs functioning - with 1 - doctor	Number of PHCs functioning - without - doctor	Number of PHCs functioning - without - lab tech.	Number of PHCs functioning - without - pharma.	Number of PHCs functioning - with - lady - doctor	Note of State/ UT
0	1	Andhra Pradesh	1147	11	31	476	629	0	364	329	518	NaN
1	2	Arunachal Pradesh	143	3	6	27	81	40	55	55	36	NaN
2	3	Assam	1014	67	63	182	626	76	87	110	183	NaN
3	4	Bihar	1899	439	41	56	1363	0	256	201	156	NaN
4	5	Chhattisgarh	785	0	6	71	318	390	303	185	66	NaN
........................................

📄 File: infant-mortality-rate_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Infant Mortality Rate [IMR] - Total', 'Infant Mortality Rate [IMR] - Rural', 'Infant Mortality Rate [IMR] - Urban']
Preview:
S. No.	State/ UT	Infant Mortality Rate [IMR] - Total	Infant Mortality Rate [IMR] - Rural	Infant Mortality Rate [IMR] - Urban
0	1	Andhra Pradesh	34	38	24
1	2	Arunachal Pradesh	36	38	23
2	3	Assam	44	46	22
3	4	Bihar	38	39	29
4	5	Chhattisgarh	39	41	31
........................................

📄 File: nursing-staff-PHCS-CHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]', 'Note of Shortfall - [R-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]	Note of Shortfall - [R-P]
0	1	Andhra Pradesh	2498	4307.0	3541	766.0	NaN	NaN	NaN	*
1	2	Arunachal Pradesh	584	NaN	498	NaN	86.0	NaN	NaN	NaN
2	3	Assam	2120	2798.0	2793	5.0	NaN	#	NaN	*
3	4	Bihar	2949	1662.0	1142	520.0	1807.0	##	NaN	NaN
4	5	Chhattisgarh	1968	2685.0	1918	767.0	50.0	NaN	NaN	NaN
........................................

📄 File: pharmacists-PHCS-CHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]', 'Note of Shortfall - [R-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]	Note of Shortfall - [R-P]
0	1	Andhra Pradesh	1340	1355.0	994	361.0	346.0	NaN	NaN	NaN
1	2	Arunachal Pradesh	206	NaN	89	NaN	117.0	NaN	NaN	NaN
2	3	Assam	1172	1284.0	1384	NaN	NaN	#	*	*
3	4	Bihar	2049	989.0	287	702.0	1762.0	##	NaN	NaN
4	5	Chhattisgarh	954	1086.0	887	199.0	67.0	NaN	NaN	NaN
........................................

📄 File: physician-CHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]
0	1	Andhra Pradesh	193	65.0	56	9.0	137	NaN	NaN
1	2	Arunachal Pradesh	63	NaN	1	NaN	62	NaN	NaN
2	3	Assam	158	NaN	31	NaN	127	###	NaN
3	4	Bihar	150	NaN	8	NaN	142	NaN	NaN
4	5	Chhattisgarh	169	155.0	9	146.0	160	NaN	NaN
........................................

📄 File: radiographers-CHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]', 'Note of Shortfall - [R-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]	Note of Shortfall - [R-P]
0	1	Andhra Pradesh	193	160.0	75	85.0	118	NaN	NaN	NaN
1	2	Arunachal Pradesh	63	NaN	7	NaN	56	NaN	NaN	NaN
2	3	Assam	158	145.0	60	85.0	98	#	NaN	NaN
3	4	Bihar	150	89.0	1	88.0	149	##	NaN	NaN
4	5	Chhattisgarh	169	162.0	130	32.0	39	NaN	NaN	NaN
........................................

📄 File: rural-area-covered-centre_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Average Rural Area [Sq. Km.] covered by a sub Centre', 'Average Rural Area [Sq. Km.] covered by a PHC', 'Average Rural Area [Sq. Km.] covered by a CHC', 'Average Radial Distance [Kms] covered by a sub Centre', 'Average Radial Distance [Kms] covered by a PHC', 'Average Radial Distance [Kms] covered by a CHC']
Preview:
S. No.	State/ UT	Average Rural Area [Sq. Km.] covered by a sub Centre	Average Rural Area [Sq. Km.] covered by a PHC	Average Rural Area [Sq. Km.] covered by a CHC	Average Radial Distance [Kms] covered by a sub Centre	Average Radial Distance [Kms] covered by a PHC	Average Radial Distance [Kms] covered by a CHC
0	1	Andhra Pradesh	21.30	138.50	823.09	2.60	6.64	16.18
1	2	Arunachal Pradesh	NaN	NaN	NaN	NaN	NaN	NaN
2	3	Assam	6.84	31.17	200.02	1.48	3.15	7.98
3	4	Bihar	9.23	48.36	612.26	1.71	3.92	13.96
4	5	Chhattisgarh	25.44	168.08	780.71	2.85	7.31	15.76
........................................

📄 File: rural-population-centre_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Average Rural Population [Census 2011] covered by a Sub Centre', 'Average Rural Population [Census 2011] covered by a PHC', 'Average Rural Population [Census 2011] covered by a CHC']
Preview:
S. No.	State/ UT	Average Rural Population [Census 2011] covered by a Sub Centre	Average Rural Population [Census 2011] covered by a PHC	Average Rural Population [Census 2011] covered by a CHC
0	1	Andhra Pradesh	4663	30319	180189
1	2	Arunachal Pradesh	3418	7457	16926
2	3	Assam	5801	26437	169665
3	4	Bihar	9281	48626	615610
4	5	Chhattisgarh	3781	24978	116023
........................................

📄 File: surgeons-CHCS_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]
0	1	Andhra Pradesh	193	31.0	38	NaN	155	NaN	*
1	2	Arunachal Pradesh	63	NaN	0	NaN	63	NaN	NaN
2	3	Assam	158	NaN	12	NaN	146	NaN	NaN
3	4	Bihar	150	NaN	13	NaN	137	NaN	NaN
4	5	Chhattisgarh	169	155.0	15	140.0	154	NaN	NaN
........................................

📄 File: villg-coveredby-centre_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Average Number of Villages covered by a sub Centre', 'Average Number of Villages covered by a PHC', 'Average Number of Villages covered by a CHC', 'Number of Sub Centres per PHC', 'Number of PHCs per CHC']
Preview:
S. No.	State/ UT	Average Number of Villages covered by a sub Centre	Average Number of Villages covered by a PHC	Average Number of Villages covered by a CHC	Number of Sub Centres per PHC	Number of PHCs per CHC
0	1	Andhra Pradesh	2	15	88	7	6
1	2	Arunachal Pradesh	18	39	89	2	2
2	3	Assam	6	26	167	5	6
3	4	Bihar	5	24	299	5	13
4	5	Chhattisgarh	4	26	119	7	5
........................................

📄 File: worker-female-subcen_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]', 'Shortfall - [R-P].1']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]	Shortfall - [R-P].1
0	1	Andhra Pradesh	7458	14317.0	12073	2244.0	NaN	NaN	NaN	*
1	2	Arunachal Pradesh	312	NaN	323	NaN	NaN	NaN	NaN	*
2	3	Assam	4621	NaN	7545	NaN	NaN	NaN	NaN	*
3	4	Bihar	9949	NaN	20151	NaN	NaN	NaN	NaN	*
4	5	Chhattisgarh	5186	5186.0	5913	NaN	NaN	NaN	*	*
........................................

📄 File: worker-male-subcen_2017.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Required - [R]', 'Sanctioned - [S]', 'In Position - [P]', 'Vacant - [S-P]', 'Shortfall - [R-P]', 'Note of State/ UT', 'Note of Vacant - [S-P]']
Preview:
S. No.	State/ UT	Required - [R]	Sanctioned - [S]	In Position - [P]	Vacant - [S-P]	Shortfall - [R-P]	Note of State/ UT	Note of Vacant - [S-P]
0	1	Andhra Pradesh	7458	5021.0	2964	2057.0	4494	NaN	NaN
1	2	Arunachal Pradesh	312	NaN	92	NaN	220	NaN	NaN
2	3	Assam	4621	3000.0	2783	217.0	1838	~	NaN
3	4	Bihar	9949	2135.0	1244	891.0	8705	#	NaN
4	5	Chhattisgarh	5186	5186.0	3856	1330.0	1330	NaN	NaN
........................................

📄 File: year-wise-CHCS.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Community Health Centres functioning at the end of - Sixth Plan - [1981-85]', 'Community Health Centres functioning at the end of - Seventh Plan - [1985-90]', 'Community Health Centres functioning at the end of - Eigth Plan - [1992-97]', 'Community Health Centres functioning at the end of - Ninth Plan - [1997-2002]', 'Community Health Centres functioning at the end of - Tenth Plan - [2002-07]', 'Community Health Centres functioning at the end of - Eleventh Plan - [2007-12]', 'Community Health Centres functioning at the end of - Twelth Plan (As on 31st March, 2017) - [2012-17]']
Preview:
S. No.	State/ UT	Community Health Centres functioning at the end of - Sixth Plan - [1981-85]	Community Health Centres functioning at the end of - Seventh Plan - [1985-90]	Community Health Centres functioning at the end of - Eigth Plan - [1992-97]	Community Health Centres functioning at the end of - Ninth Plan - [1997-2002]	Community Health Centres functioning at the end of - Tenth Plan - [2002-07]	Community Health Centres functioning at the end of - Eleventh Plan - [2007-12]	Community Health Centres functioning at the end of - Twelth Plan (As on 31st March, 2017) - [2012-17]
0	1	Andhra Pradesh	27.0	46.0	207.0	219.0	167	281	193
1	2	Arunachal Pradesh	0.0	6.0	9.0	20.0	31	48	63
2	3	Assam	12.0	60.0	100.0	100.0	100	109	158
3	4	Bihar	52.0	147.0	148.0	148.0	70	70	150
4	5	Chhattisgarh	NaN	NaN	NaN	NaN	118	149	169
........................................

📄 File: year-wise-PHCS.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Primary Health Centres functioning at the end of - Sixth Plan - [1981-85]', 'Primary Health Centres functioning at the end of - Seventh Plan - [1985-90]', 'Primary Health Centres functioning at the end of - Eigth Plan - [1992-97]', 'Primary Health Centres functioning at the end of - Ninth Plan - [1997-2002]', 'Primary Health Centres functioning at the end of - Tenth Plan - [2002-07]', 'Primary Health Centres functioning at the end of - Eleventh Plan - [2007-12]', 'Primary Health Centres functioning at the end of - Twelth Plan (As on 31st March, 2017) - [2012-17]']
Preview:
S. No.	State/ UT	Primary Health Centres functioning at the end of - Sixth Plan - [1981-85]	Primary Health Centres functioning at the end of - Seventh Plan - [1985-90]	Primary Health Centres functioning at the end of - Eigth Plan - [1992-97]	Primary Health Centres functioning at the end of - Ninth Plan - [1997-2002]	Primary Health Centres functioning at the end of - Tenth Plan - [2002-07]	Primary Health Centres functioning at the end of - Eleventh Plan - [2007-12]	Primary Health Centres functioning at the end of - Twelth Plan (As on 31st March, 2017) - [2012-17]
0	1	Andhra Pradesh	555.0	1283.0	1335.0	1386.0	1570	1624	1147
1	2	Arunachal Pradesh	0.0	24.0	45.0	65.0	85	97	143
2	3	Assam	237.0	449.0	610.0	610.0	610	975	1014
3	4	Bihar	796.0	2001.0	2209.0	2209.0	1648	1863	1899
4	5	Chhattisgarh	NaN	NaN	NaN	NaN	518	755	785
........................................

📄 File: year-wise-Subcentre.csv (0.00 MB)
Features: ['S. No.', 'State/ UT', 'Sub Centres functioning at the end of - Sixth Plan - [1981-85]', 'Sub Centres functioning at the end of - Seventh Plan - [1985-90]', 'Sub Centres functioning at the end of - Eigth Plan - [1992-97]', 'Sub Centres functioning at the end of - Ninth Plan - [1997-2002]', 'Sub Centres functioning at the end of - Tenth Plan - [2002-07]', 'Sub Centres functioning at the end of - Eleventh Plan - [2007-12]', 'Sub Centres functioning at the end of - Twelth Plan - [2012-17] (As on 31st March, 2017)']
Preview:
S. No.	State/ UT	Sub Centres functioning at the end of - Sixth Plan - [1981-85]	Sub Centres functioning at the end of - Seventh Plan - [1985-90]	Sub Centres functioning at the end of - Eigth Plan - [1992-97]	Sub Centres functioning at the end of - Ninth Plan - [1997-2002]	Sub Centres functioning at the end of - Tenth Plan - [2002-07]	Sub Centres functioning at the end of - Eleventh Plan - [2007-12]	Sub Centres functioning at the end of - Twelth Plan - [2012-17] (As on 31st March, 2017)
0	1	Andhra Pradesh	6129.0	7894.0	10568.0	10568.0	12522	12522	7458
1	2	Arunachal Pradesh	55.0	155.0	223.0	273.0	379	286	312
2	3	Assam	1711.0	5109.0	5109.0	5109.0	5109	4604	4621
3	4	Bihar	8299.0	14799.0	14799.0	14799.0	8909	9696	9949
4	5	Chhattisgarh	NaN	NaN	NaN	NaN	4692	5111	5186
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/population
---------------------------------------------------------------

📄 File: district wise centroids.csv (0.03 MB)
Features: ['State', 'District', 'Latitude', 'Longitude']
Preview:
State	District	Latitude	Longitude
0	Andaman and Nicobar	Andaman Islands	12.382571	92.822911
1	Andaman and Nicobar	Nicobar Islands	7.835291	93.511601
2	Andhra Pradesh	Adilabad	19.284514	78.813212
3	Andhra Pradesh	Anantapur	14.312066	77.460158
4	Andhra Pradesh	Chittoor	13.331093	78.927639
........................................

📄 File: district wise population and centroids.csv (0.03 MB)
Features: ['State', 'District', 'Latitude', 'Longitude', 'Population in 2001', 'Population in 2011']
Preview:
State	District	Latitude	Longitude	Population in 2001	Population in 2011
0	Andhra Pradesh	Anantapur	14.312066	77.460158	3640478	4081148
1	Andhra Pradesh	Chittoor	13.331093	78.927639	3745875	4174064
2	Andhra Pradesh	East Godavari	16.782718	82.243207	4901420	5154296
3	Andhra Pradesh	Guntur	15.884926	80.586576	4465144	4887813
4	Andhra Pradesh	Krishna	16.143873	81.148051	4187841	4517398
........................................

📄 File: district wise population for year 2001 and 2011.csv (0.02 MB)
Features: ['State', 'District', 'Population in 2001', 'Population in 2011']
Preview:
State	District	Population in 2001	Population in 2011
0	Andaman & Nicobar Islands	Nicobar	42068	36842
1	Andaman & Nicobar Islands	North & Middle Andaman	105613	105597
2	Andaman & Nicobar Islands	South Andaman	208471	238142
3	Andhra Pradesh	Anantapur	3640478	4081148
4	Andhra Pradesh	Chittoor	3745875	4174064
........................................

📄 File: state wise centroids_2001.csv (0.00 MB)
Features: ['State', 'Longitude', 'Latitude']
Preview:
State	Longitude	Latitude
0	Andaman and Nicobar	92.904257	11.845455
1	Andhra Pradesh	79.973851	16.557796
2	Arunachal Pradesh	94.662314	27.729050
3	Assam	92.685686	26.336086
4	Bihar	85.625341	25.766303
........................................

📄 File: state wise centroids_2011.csv (0.00 MB)
Features: ['State', 'Longitude', 'Latitude']
Preview:
State	Longitude	Latitude
0	Andaman and Nicobar	92.889579	11.942373
1	Andhra Pradesh	79.916203	16.554124
2	Arunachal Pradesh	94.545327	27.725765
3	Assam	92.657310	26.321341
4	Bihar	85.636774	25.771394
........................................

📄 File: elementary_2015_16.csv (1.78 MB)
Features: ['Unnamed: 0', 'YEAR', 'STATE NAME', 'DISTRICT NAME', 'TOTAL POULATION', 'PERCENTAGE URBAN POPULATION', '0-6 POPULATION', 'GROWTH RATE', 'SEX RATIO', 'PERCENTAGE SC POPULATION', 'PERCENTAGE ST POPULATION', 'OVERALL LITERACY', 'FEMALE LITERACY', 'MALE LITERACY', 'AREA (SQ. KM) (AREA SQKM)', 'AGE GROUP 6 TO 10 (TOT 6 10 15)', 'AGE GROUP 11 TO 13 (TOT 11 13 15)', 'PRIMARY ONLY (SCH1)', 'PRIMARY WITH UPPER PRIMARY (SCH2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCH3)', 'UPPER PRIMARY ONLY (SCH4)', 'UPPER PRIMARY WITH SEC./H.SEC (SCH5)', 'PRIMARY WITH UPPER PRIMARY SEC (SCH6)', 'UPPER PRIMARY WITH  SEC. (SCH7)', 'NO RESPONSE (SCH9)', 'TOTAL (SCHTOT)', 'PRIMARY ONLY (SCH1G)', 'PRIMARY WITH UPPER PRIMARY (SCH2G)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCH3G)', 'UPPER PRIMARY ONLY (SCH4G)', 'UPPER PRIMARY WITH SEC./H.SEC (SCH5G)', 'PRIMARY WITH UPPER PRIMARY SEC (SCH6G)', 'UPPER PRIMARY WITH  SEC. (SCH7G)', 'NO RESPONSE (SCH9G)', 'TOTAL (SCHTOTG)', 'PRIMARY ONLY (SCH1P)', 'PRIMARY WITH UPPER PRIMARY (SCH2P)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCH3P)', 'UPPER PRIMARY ONLY (SCH4P)', 'UPPER PRIMARY WITH SEC./H.SEC (SCH5P)', 'PRIMARY WITH UPPER PRIMARY SEC (SCH6P)', 'UPPER PRIMARY WITH  SEC. (SCH7P)', 'NO RESPONSE (SCH9P)', 'TOTAL (SCHTOTP)', 'PRIMARY ONLY (SCH1M)', 'PRIMARY WITH UPPER PRIMARY (SCH2M)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCH3M)', 'UPPER PRIMARY ONLY (SCH4M)', 'UPPER PRIMARY WITH SEC./H.SEC (SCH5M)', 'PRIMARY WITH UPPER PRIMARY SEC (SCH6M)', 'UPPER PRIMARY WITH  SEC. (SCH7M)', 'NO RESPONSE (SCH9M)', 'TOTAL (SCHTOTM)', 'PRIMARY ONLY (SCH1GR)', 'PRIMARY WITH UPPER PRIMARY (SCH2GR)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCH3GR)', 'UPPER PRIMARY ONLY (SCH4GR)', 'UPPER PRIMARY WITH SEC./H.SEC (SCH5GR)', 'PRIMARY WITH UPPER PRIMARY SEC (SCH6GR)', 'UPPER PRIMARY WITH  SEC. (SCH7GR)', 'NO RESPONSE (SCH9GR)', 'TOTAL (SCHTOTGR)', 'PRIMARY ONLY (SCH1GA)', 'PRIMARY WITH UPPER PRIMARY (SCH2GA)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCH3GA)', 'UPPER PRIMARY ONLY (SCH4GA)', 'UPPER PRIMARY WITH SEC./H.SEC (SCH5GA)', 'PRIMARY WITH UPPER PRIMARY SEC (SCH6GA)', 'UPPER PRIMARY WITH  SEC. (SCH7GA)', 'NO RESPONSE (SCH9GA)', 'TOTAL (SCHTOTGA)', 'PRIMARY ONLY (SCH1PR)', 'PRIMARY WITH UPPER PRIMARY (SCH2PR)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCH3PR)', 'UPPER PRIMARY ONLY (SCH4PR)', 'UPPER PRIMARY WITH SEC./H.SEC (SCH5PR)', 'PRIMARY WITH UPPER PRIMARY SEC (SCH6PR)', 'UPPER PRIMARY WITH  SEC. (SCH7PR)', 'NO RESPONSE (SCH9PR)', 'TOTAL (SCHTOTPR)', 'PRIMARY ONLY (SCHBOY1)', 'PRIMARY WITH UPPER PRIMARY (SCHBOY2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCHBOY3)', 'UPPER PRIMARY ONLY (SCHBOY4)', 'UPPER PRIMARY WITH SEC./H.SEC (SCHBOY5)', 'PRIMARY WITH UPPER PRIMARY SEC (SCHBOY6)', 'UPPER PRIMARY WITH  SEC. (SCHBOY7)', 'NO RESPONSE (SCHBOY9)', 'TOTAL (SCHBOYTOT)', 'PRIMARY ONLY (SCHGIR1)', 'PRIMARY WITH UPPER PRIMARY (SCHGIR2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCHGIR3)', 'UPPER PRIMARY ONLY (SCHGIR4)', 'UPPER PRIMARY WITH SEC./H.SEC (SCHGIR5)', 'PRIMARY WITH UPPER PRIMARY SEC (SCHGIR6)', 'UPPER PRIMARY WITH  SEC. (SCHGIR7)', 'NO RESPONSE (SCHGIR9)', 'TOTAL (SCHGIRTOT)', 'PRIMARY ONLY (ENR1)', 'PRIMARY WITH UPPER PRIMARY (ENR2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENR3)', 'UPPER PRIMARY ONLY (ENR4)', 'UPPER PRIMARY WITH SEC./H.SEC (ENR5)', 'PRIMARY WITH UPPER PRIMARY SEC (ENR6)', 'UPPER PRIMARY WITH  SEC. (ENR7)', 'NO RESPONSE (ENR9)', 'TOTAL (ENRTOT)', 'PRIMARY ONLY (ENR1G)', 'PRIMARY WITH UPPER PRIMARY (ENR2G)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENR3G)', 'UPPER PRIMARY ONLY (ENR4G)', 'UPPER PRIMARY WITH SEC./H.SEC (ENR5G)', 'PRIMARY WITH UPPER PRIMARY SEC (ENR6G)', 'UPPER PRIMARY WITH  SEC. (ENR7G)', 'NO RESPONSE (ENR9G)', 'TOTAL (ENRTOTG)', 'PRIMARY ONLY (ENR1P)', 'PRIMARY WITH UPPER PRIMARY (ENR2P)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENR3P)', 'UPPER PRIMARY ONLY (ENR4P)', 'UPPER PRIMARY WITH SEC./H.SEC (ENR5P)', 'PRIMARY WITH UPPER PRIMARY SEC (ENR6P)', 'UPPER PRIMARY WITH  SEC. (ENR7P)', 'NO RESPONSE (ENR9P)', 'TOTAL (ENRTOTP)', 'PRIMARY ONLY (ENR1M)', 'PRIMARY WITH UPPER PRIMARY (ENR2M)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENR3M)', 'UPPER PRIMARY ONLY (ENR4M)', 'UPPER PRIMARY WITH SEC./H.SEC (ENR5M)', 'PRIMARY WITH UPPER PRIMARY SEC (ENR6M)', 'UPPER PRIMARY WITH  SEC. (ENR7M)', 'NO RESPONSE (ENR9M)', 'TOTAL (ENRTOTM)', 'PRIMARY ONLY (ENR1GR)', 'PRIMARY WITH UPPER PRIMARY (ENR2GR)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENR3GR)', 'UPPER PRIMARY ONLY (ENR4GR)', 'UPPER PRIMARY WITH SEC./H.SEC (ENR5GR)', 'PRIMARY WITH UPPER PRIMARY SEC (ENR6GR)', 'UPPER PRIMARY WITH  SEC. (ENR7GR)', 'NO RESPONSE (ENR9GR)', 'TOTAL (ENRTOTGR)', 'PRIMARY ONLY (ENR1PR)', 'PRIMARY WITH UPPER PRIMARY (ENR2PR)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENR3PR)', 'UPPER PRIMARY ONLY (ENR4PR)', 'UPPER PRIMARY WITH SEC./H.SEC (ENR5PR)', 'PRIMARY WITH UPPER PRIMARY SEC (ENR6PR)', 'UPPER PRIMARY WITH  SEC. (ENR7PR)', 'NO RESPONSE (ENR9PR)', 'TOTAL (ENRTOTPR)', 'PRIMARY ONLY (TCH1G)', 'PRIMARY WITH UPPER PRIMARY (TCH2G)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCH3G)', 'UPPER PRIMARY ONLY (TCH4G)', 'UPPER PRIMARY WITH SEC./H.SEC (TCH5G)', 'PRIMARY WITH UPPER PRIMARY SEC (TCH6G)', 'UPPER PRIMARY WITH  SEC. (TCH7G)', 'NO RESPONSE (TCH9G)', 'TOTAL (TCHTOTG)', 'PRIMARY ONLY (TCH1P)', 'PRIMARY WITH UPPER PRIMARY (TCH2P)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCH3P)', 'UPPER PRIMARY ONLY (TCH4P)', 'UPPER PRIMARY WITH SEC./H.SEC (TCH5P)', 'PRIMARY WITH UPPER PRIMARY SEC (TCH6P)', 'UPPER PRIMARY WITH  SEC. (TCH7P)', 'NO RESPONSE (TCH9P)', 'TOTAL (TCHTOTP)', 'PRIMARY ONLY (TCH1M)', 'PRIMARY WITH UPPER PRIMARY (TCH2M)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCH3M)', 'UPPER PRIMARY ONLY (TCH4M)', 'UPPER PRIMARY WITH SEC./H.SEC (TCH5M)', 'PRIMARY WITH UPPER PRIMARY SEC (TCH6M)', 'UPPER PRIMARY WITH  SEC. (TCH7M)', 'NO RESPONSE (TCH9M)', 'TOTAL (TCHTOTM)', 'PRIMARY ONLY (SCLS1)', 'PRIMARY WITH UPPER PRIMARY (SCLS2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCLS3)', 'UPPER PRIMARY ONLY (SCLS4)', 'UPPER PRIMARY WITH SEC./H.SEC (SCLS5)', 'PRIMARY WITH UPPER PRIMARY SEC (SCLS6)', 'UPPER PRIMARY WITH  SEC. (SCLS7)', 'TOTAL (SCLSTOT)', 'PRIMARY ONLY (STCH1)', 'PRIMARY WITH UPPER PRIMARY (STCH2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (STCH3)', 'UPPER PRIMARY ONLY (STCH4)', 'UPPER PRIMARY WITH SEC./H.SEC (STCH5)', 'PRIMARY WITH UPPER PRIMARY SEC (STCH6)', 'UPPER PRIMARY WITH  SEC. (STCH7)', 'TOTAL (STCHTOT)', 'PRIMARY ONLY (ROAD1)', 'PRIMARY WITH UPPER PRIMARY (ROAD2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ROAD3)', 'UPPER PRIMARY ONLY (ROAD4)', 'UPPER PRIMARY WITH SEC./H.SEC (ROAD5)', 'PRIMARY WITH UPPER PRIMARY SEC (ROAD6)', 'UPPER PRIMARY WITH  SEC. (ROAD7)', 'TOTAL (ROADTOT)', 'PRIMARY ONLY (SPLAY1)', 'PRIMARY WITH UPPER PRIMARY (SPLAY2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SPLAY3)', 'UPPER PRIMARY ONLY (SPLAY4)', 'UPPER PRIMARY WITH SEC./H.SEC (SPLAY5)', 'PRIMARY WITH UPPER PRIMARY SEC (SPLAY6)', 'UPPER PRIMARY WITH  SEC. (SPLAY7)', 'TOTAL (SPLAYTOT)', 'PRIMARY ONLY (SBNDR1)', 'PRIMARY WITH UPPER PRIMARY (SBNDR2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SBNDR3)', 'UPPER PRIMARY ONLY (SBNDR4)', 'UPPER PRIMARY WITH SEC./H.SEC (SBNDR5)', 'PRIMARY WITH UPPER PRIMARY SEC (SBNDR6)', 'UPPER PRIMARY WITH  SEC. (SBNDR7)', 'TOTAL (SBNDRTOT)', 'PRIMARY ONLY (SGTOIL1)', 'PRIMARY WITH UPPER PRIMARY (SGTOIL2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SGTOIL3)', 'UPPER PRIMARY ONLY (SGTOIL4)', 'UPPER PRIMARY WITH SEC./H.SEC (SGTOIL5)', 'PRIMARY WITH UPPER PRIMARY SEC (SGTOIL6)', 'UPPER PRIMARY WITH  SEC. (SGTOIL7)', 'TOTAL (SGTOILTOT)', 'PRIMARY ONLY (SBTOIL1)', 'PRIMARY WITH UPPER PRIMARY (SBTOIL2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SBTOIL3)', 'UPPER PRIMARY ONLY (SBTOIL4)', 'UPPER PRIMARY WITH SEC./H.SEC (SBTOIL5)', 'PRIMARY WITH UPPER PRIMARY SEC (SBTOIL6)', 'UPPER PRIMARY WITH  SEC. (SBTOIL7)', 'TOTAL (SBTOILTOT)', 'PRIMARY ONLY (SWAT1)', 'PRIMARY WITH UPPER PRIMARY (SWAT2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SWAT3)', 'UPPER PRIMARY ONLY (SWAT4)', 'UPPER PRIMARY WITH SEC./H.SEC (SWAT5)', 'PRIMARY WITH UPPER PRIMARY SEC (SWAT6)', 'UPPER PRIMARY WITH  SEC. (SWAT7)', 'TOTAL (SWATTOT)', 'PRIMARY ONLY (SELE1)', 'PRIMARY WITH UPPER PRIMARY (SELE2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SELE3)', 'UPPER PRIMARY ONLY (SELE4)', 'UPPER PRIMARY WITH SEC./H.SEC (SELE5)', 'PRIMARY WITH UPPER PRIMARY SEC (SELE6)', 'UPPER PRIMARY WITH  SEC. (SELE7)', 'TOTAL (SELETOT)', 'PRIMARY ONLY (SCOMP1)', 'PRIMARY WITH UPPER PRIMARY (SCOMP2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SCOMP3)', 'UPPER PRIMARY ONLY (SCOMP4)', 'UPPER PRIMARY WITH SEC./H.SEC (SCOMP5)', 'PRIMARY WITH UPPER PRIMARY SEC (SCOMP6)', 'UPPER PRIMARY WITH  SEC. (SCOMP7)', 'TOTAL (SCOMPTOT)', 'PRIMARY ONLY (SRAM1)', 'PRIMARY WITH UPPER PRIMARY (SRAM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SRAM3)', 'UPPER PRIMARY ONLY (SRAM4)', 'UPPER PRIMARY WITH SEC./H.SEC (SRAM5)', 'PRIMARY WITH UPPER PRIMARY SEC (SRAM6)', 'UPPER PRIMARY WITH  SEC. (SRAM7)', 'TOTAL (SRAMTOT)', 'PRIMARY ONLY (SRAMN1)', 'PRIMARY WITH UPPER PRIMARY (SRAMN2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SRAMN3)', 'UPPER PRIMARY ONLY (SRAMN4)', 'UPPER PRIMARY WITH SEC./H.SEC (SRAMN5)', 'PRIMARY WITH UPPER PRIMARY SEC (SRAMN6)', 'UPPER PRIMARY WITH  SEC. (SRAMN7)', 'TOTAL (SRAMNTOT)', 'PRIMARY ONLY (ESTD1)', 'PRIMARY WITH UPPER PRIMARY (ESTD2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ESTD3)', 'UPPER PRIMARY ONLY (ESTD4)', 'UPPER PRIMARY WITH SEC./H.SEC (ESTD5)', 'PRIMARY WITH UPPER PRIMARY SEC (ESTD6)', 'UPPER PRIMARY WITH  SEC. (ESTD7)', 'TOTAL (ESTDTOT)', 'PRIMARY ONLY (MDM1)', 'PRIMARY WITH UPPER PRIMARY (MDM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (MDM3)', 'UPPER PRIMARY ONLY (MDM4)', 'UPPER PRIMARY WITH SEC./H.SEC (MDM5)', 'PRIMARY WITH UPPER PRIMARY SEC (MDM6)', 'UPPER PRIMARY WITH  SEC. (MDM7)', 'TOTAL (MDMTOT)', 'PRIMARY ONLY (KIT1)', 'PRIMARY WITH UPPER PRIMARY (KIT2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (KIT3)', 'UPPER PRIMARY ONLY (KIT4)', 'UPPER PRIMARY WITH SEC./H.SEC (KIT5)', 'PRIMARY WITH UPPER PRIMARY SEC (KIT6)', 'UPPER PRIMARY WITH  SEC. (KIT7)', 'TOTAL (KITTOT)', 'PRIMARY ONLY (KITS1)', 'PRIMARY WITH UPPER PRIMARY (KITS2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (KITS3)', 'UPPER PRIMARY ONLY (KITS4)', 'UPPER PRIMARY WITH SEC./H.SEC (KITS5)', 'PRIMARY WITH UPPER PRIMARY SEC (KITS6)', 'UPPER PRIMARY WITH  SEC. (KITS7)', 'TOTAL (KITSTOT)', 'PRIMARY ONLY (ENR501)', 'PRIMARY WITH UPPER PRIMARY (ENR502)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENR503)', 'UPPER PRIMARY ONLY (ENR504)', 'UPPER PRIMARY WITH SEC./H.SEC (ENR505)', 'PRIMARY WITH UPPER PRIMARY SEC (ENR506)', 'UPPER PRIMARY WITH  SEC. (ENR507)', 'NO RESPONSE (ENR509)', 'TOTAL (ENR50TOT)', 'PRIMARY ONLY (SMC1)', 'PRIMARY WITH UPPER PRIMARY (SMC2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (SMC3)', 'UPPER PRIMARY ONLY (SMC4)', 'UPPER PRIMARY WITH SEC./H.SEC (SMC5)', 'PRIMARY WITH UPPER PRIMARY SEC (SMC6)', 'UPPER PRIMARY WITH  SEC. (SMC7)', 'TOTAL (SMCTOT)', 'PRIMARY ONLY (CLS1)', 'PRIMARY WITH UPPER PRIMARY (CLS2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (CLS3)', 'UPPER PRIMARY ONLY (CLS4)', 'UPPER PRIMARY WITH SEC./H.SEC (CLS5)', 'PRIMARY WITH UPPER PRIMARY SEC (CLS6)', 'UPPER PRIMARY WITH  SEC. (CLS7)', 'TOTAL (CLSTOT)', 'PRIMARY ONLY (TCH1)', 'PRIMARY WITH UPPER PRIMARY (TCH2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCH3)', 'UPPER PRIMARY ONLY (TCH4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCH5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCH6)', 'UPPER PRIMARY WITH  SEC. (TCH7)', 'TOTAL (TCHTOT)', 'PRIMARY ONLY (TCHF1)', 'PRIMARY WITH UPPER PRIMARY (TCHF2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHF3)', 'UPPER PRIMARY ONLY (TCHF4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHF5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHF6)', 'UPPER PRIMARY WITH  SEC. (TCHF7)', 'TOTAL (TCHFTOT)', 'PRIMARY ONLY (TCHM1)', 'PRIMARY WITH UPPER PRIMARY (TCHM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHM3)', 'UPPER PRIMARY ONLY (TCHM4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHM5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHM6)', 'UPPER PRIMARY WITH  SEC. (TCHM7)', 'NO RESPONSE (TCHM9)', 'PRIMARY ONLY (ENRG1)', 'PRIMARY WITH UPPER PRIMARY (ENRG2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENRG3)', 'UPPER PRIMARY ONLY (ENRG4)', 'UPPER PRIMARY WITH SEC./H.SEC (ENRG5)', 'PRIMARY WITH UPPER PRIMARY SEC (ENRG6)', 'UPPER PRIMARY WITH  SEC. (ENRG7)', 'TOTAL (ENRGTOT)', 'TOTAL SCHOOLS (PREP)', 'TOTAL STUDENTS (PRESTD)', 'TEACHERS WITH PROFESSIONAL QUALIFICATION : FEMALE  (PPFTCH)', 'TEACHERS WITH PROFESSIONAL QUALIFICATION : MALE  (PPMTCH)', 'TOTAL  TEACHERS: MALE  (PMTCH)', 'TOTAL  TEACHERS: FEMALE  (PFTCH)', 'PRIMARY ONLY (TCHSCM1)', 'PRIMARY WITH UPPER PRIMARY (TCHSCM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHSCM3)', 'UPPER PRIMARY ONLY (TCHSCM4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHSCM5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHSCM6)', 'UPPER PRIMARY WITH  SEC. (TCHSCM7)', 'PRIMARY ONLY (TCHSCF1)', 'PRIMARY WITH UPPER PRIMARY (TCHSCF2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHSCF3)', 'UPPER PRIMARY ONLY (TCHSCF4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHSCF5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHSCF6)', 'UPPER PRIMARY WITH  SEC. (TCHSCF7)', 'PRIMARY ONLY (TCHSTM1)', 'PRIMARY WITH UPPER PRIMARY (TCHSTM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHSTM3)', 'UPPER PRIMARY ONLY (TCHSTM4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHSTM5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHSTM6)', 'UPPER PRIMARY WITH  SEC. (TCHSTM7)', 'PRIMARY ONLY (TCHSTF1)', 'PRIMARY WITH UPPER PRIMARY (TCHSTF2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHSTF3)', 'UPPER PRIMARY ONLY (TCHSTF4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHSTF5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHSTF6)', 'UPPER PRIMARY WITH  SEC. (TCHSTF7)', 'PRIMARY ONLY (TCHOBCM1)', 'PRIMARY WITH UPPER PRIMARY (TCHOBCM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHOBCM3)', 'UPPER PRIMARY ONLY (TCHOBCM4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHOBCM5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHOBCM6)', 'UPPER PRIMARY WITH  SEC. (TCHOBCM7)', 'PRIMARY ONLY (TCHOBCF1)', 'PRIMARY WITH UPPER PRIMARY (TCHOBCF2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHOBCF3)', 'UPPER PRIMARY ONLY (TCHOBCF4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHOBCF5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHOBCF6)', 'UPPER PRIMARY WITH  SEC. (TCHOBCF7)', 'PRIMARY ONLY (TCH TRNRM1)', 'PRIMARY WITH UPPER PRIMARY (TCH TRNRM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCH TRNRM3)', 'UPPER PRIMARY ONLY (TCH TRNRM4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCH TRNRM5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCH TRNRM6)', 'UPPER PRIMARY WITH  SEC. (TCH TRNRM7)', 'PRIMARY ONLY (TCH TRNRF1)', 'PRIMARY WITH UPPER PRIMARY (TCH TRNRF2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCH TRNRF3)', 'UPPER PRIMARY ONLY (TCH TRNRF4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCH TRNRF5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCH TRNRF6)', 'UPPER PRIMARY WITH  SEC. (TCH TRNRF7)', 'REGULAR TEACHERS WITH PROFESSIONAL QUALIFICATION : MALE  (PGRMTCH)', 'REGULAR TEACHERS WITH PROFESSIONAL QUALIFICATION : FEMALE  (PGRFTCH)', 'TOTAL REGULAR TEACHERS: MALE  (GRMTCH)', 'TOTAL REGULAR TEACHERS: FEMALE  (GRFTCH)', 'CONTRACTUAL TEACHERS WITH PROFESSIONAL QUALIFICATION : MALE  (PGCMTCH)', 'CONTRACTUAL  TEACHERS WITH PROFESSIONAL QUALIFICATION : FEMALE  (PGCFTCH)', 'TOTAL CONTRACTUAL  TEACHERS: MALE  (PCMTCH)', 'TOTAL CONTRACTUAL  TEACHERS: FEMALE  (PCFTCH)', 'GRADE 1 (C1 B)', 'GRADE 2 (C2 B)', 'GRADE 3 (C3 B)', 'GRADE 4 (C4 B)', 'GRADE 5 (C5 B)', 'GRADE 6 (C6 B)', 'GRADE 7 (C7 B)', 'GRADE 8 (C8 B)', 'GRADE 9 (C9 B)', 'GRADE 1 (C1 G)', 'GRADE 2 (C2 G)', 'GRADE 3 (C3 G)', 'GRADE 4 (C4 G)', 'GRADE 5 (C5 G)', 'GRADE 6 (C6 G)', 'GRADE 7 (C7 G)', 'GRADE 8 (C8 G)', 'GRADE 9 (C9 G)', '(C15A)', '(C68A)', 'GRADE 1 (C1 BD)', 'GRADE 2 (C2 BD)', 'GRADE 3 (C3 BD)', 'GRADE 4 (C4 BD)', 'GRADE 5 (C5 BD)', 'GRADE 6 (C6 BD)', 'GRADE 7 (C7 BD)', 'GRADE 8 (C8 BD)', 'GRADE 1 (C1 GD)', 'GRADE 2 (C2 GD)', 'GRADE 3 (C3 GD)', 'GRADE 4 (C4 GD)', 'GRADE 5 (C5 GD)', 'GRADE 6 (C6 GD)', 'GRADE 7 (C7 GD)', 'GRADE 8 (C8 GD)', 'GRADE 1 (C1 BR)', 'GRADE 2 (C2 BR)', 'GRADE 3 (C3 BR)', 'GRADE 4 (C4 BR)', 'GRADE 5 (C5 BR)', 'GRADE 6 (C6 BR)', 'GRADE 7 (C7 BR)', 'GRADE 8 (C8 BR)', 'GRADE 9 (C9 BR)', 'GRADE 1 (C1 GR)', 'GRADE 2 (C2 GR)', 'GRADE 3 (C3 GR)', 'GRADE 4 (C4 GR)', 'GRADE 5 (C5 GR)', 'GRADE 6 (C6 GR)', 'GRADE 7 (C7 GR)', 'GRADE 8 (C8 GR)', 'GRADE 9 (C9 GR)', 'TOTAL (SCPTOT)', 'GIRLS (SCPTOT G)', 'TOTAL (SCUTOT)', 'GIRLS (SCUTOT G)', 'TOTAL (STPTOT)', 'GIRLS (STPTOT G)', 'TOTAL (STUTOT)', 'GIRLS (STUTOT G)', 'TOTAL (OBPTOT)', 'GIRLS (OBUTOT)', 'TOTAL (OBPTOT G)', 'GIRLS (OBUTOT G)', 'TOTAL (MUPTOT)', 'GIRLS (MUUTOT)', 'TOTAL (MUPTOT G)', 'GIRLS (MUUTOT G)', 'BLIND (BLC1)', 'LOW VISION (LVC1)', 'HEARING IMPAIRMENT (HEC1)', 'SPEECH IMPAIRMENT (SPC1)', 'LOCOMOTOR IMPAIRMENT (LOC1)', 'MENTAL RETARDATION (MEC1)', 'LEARNING DISABILITY (LEC1)', 'CEREBRAL PALSY (CPC1)', 'AUTISM (AUC1)', 'MULTIPLE (MUC1)', 'BLIND (BLC2)', 'LOW VISION (LVC2)', 'HEARING IMPAIRMENT (HEC2)', 'SPEECH IMPAIRMENT (SPC2)', 'LOCOMOTOR IMPAIRMENT (LOC2)', 'MENTAL RETARDATION (MEC2)', 'LEARNING DISABILITY (LEC2)', 'CEREBRAL PALSY (CPC2)', 'AUTISM (AUC2)', 'MULTIPLE (MUC2)', 'BLIND (BLC3)', 'LOW VISION (LVC3)', 'HEARING IMPAIRMENT (HEC3)', 'SPEECH IMPAIRMENT (SPC3)', 'LOCOMOTOR IMPAIRMENT (LOC3)', 'MENTAL RETARDATION (MEC3)', 'LEARNING DISABILITY (LEC3)', 'CEREBRAL PALSY (CPC3)', 'AUTISM (AUC3)', 'MULTIPLE (MUC3)', 'BLIND (BLC4)', 'LOW VISION (LVC4)', 'HEARING IMPAIRMENT (HEC4)', 'SPEECH IMPAIRMENT (SPC4)', 'LOCOMOTOR IMPAIRMENT (LOC4)', 'MENTAL RETARDATION (MEC4)', 'LEARNING DISABILITY (LEC4)', 'CEREBRAL PALSY (CPC4)', 'AUTISM (AUC4)', 'MULTIPLE (MUC4)', 'BLIND (BLC5)', 'LOW VISION (LVC5)', 'HEARING IMPAIRMENT (HEC5)', 'SPEECH IMPAIRMENT (SPC5)', 'LOCOMOTOR IMPAIRMENT (LOC5)', 'MENTAL RETARDATION (MEC5)', 'LEARNING DISABILITY (LEC5)', 'CEREBRAL PALSY (CPC5)', 'AUTISM (AUC5)', 'MULTIPLE (MUC5)', 'BLIND (BLC6)', 'LOW VISION (LVC6)', 'HEARING IMPAIRMENT (HEC6)', 'SPEECH IMPAIRMENT (SPC6)', 'LOCOMOTOR IMPAIRMENT (LOC6)', 'MENTAL RETARDATION (MEC6)', 'LEARNING DISABILITY (LEC6)', 'CEREBRAL PALSY (CPC6)', 'AUTISM (AUC6)', 'MULTIPLE (MUC6)', 'BLIND (BLC7)', 'LOW VISION (LVC7)', 'HEARING IMPAIRMENT (HEC7)', 'SPEECH IMPAIRMENT (SPC7)', 'LOCOMOTOR IMPAIRMENT (LOC7)', 'MENTAL RETARDATION (MEC7)', 'LEARNING DISABILITY (LEC7)', 'CEREBRAL PALSY (CPC7)', 'AUTISM (AUC7)', 'MULTIPLE (MUC7)', 'BLIND (BLC8)', 'LOW VISION (LVC8)', 'HEARING IMPAIRMENT (HEC8)', 'SPEECH IMPAIRMENT (SPC8)', 'LOCOMOTOR IMPAIRMENT (LOC8)', 'MENTAL RETARDATION (MEC8)', 'LEARNING DISABILITY (LEC8)', 'CEREBRAL PALSY (CPC8)', 'AUTISM (AUC8)', 'MULTIPLE (MUC8)', 'PRIMARY ONLY (TOTCLGD1G)', 'PRIMARY WITH UPPER PRIMARY (TOTCLGD2G)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TOTCLGD3G)', 'UPPER PRIMARY ONLY (TOTCLGD4G)', 'UPPER PRIMARY WITH SEC./H.SEC (TOTCLGD5G)', 'PRIMARY WITH UPPER PRIMARY SEC (TOTCLGD6G)', 'UPPER PRIMARY WITH  SEC. (TOTCLGD7G)', 'PRIMARY ONLY (TOTCLMI1G)', 'PRIMARY WITH UPPER PRIMARY (TOTCLMI2G)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TOTCLMI3G)', 'UPPER PRIMARY ONLY (TOTCLMI4G)', 'UPPER PRIMARY WITH SEC./H.SEC (TOTCLMI5G)', 'PRIMARY WITH UPPER PRIMARY SEC (TOTCLMI6G)', 'UPPER PRIMARY WITH  SEC. (TOTCLMI7G)', 'PRIMARY ONLY (TOTCLMJ1G)', 'PRIMARY WITH UPPER PRIMARY (TOTCLMJ2G)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TOTCLMJ3G)', 'UPPER PRIMARY ONLY (TOTCLMJ4G)', 'UPPER PRIMARY WITH SEC./H.SEC (TOTCLMJ5G)', 'PRIMARY WITH UPPER PRIMARY SEC (TOTCLMJ6G)', 'UPPER PRIMARY WITH  SEC. (TOTCLMJ7G)', '(TOTCLOT1G)', '(TOTCLOT2G)', '(TOTCLOT3G)', '(TOTCLOT4G)', '(TOTCLOT5G)', '(TOTCLOT6G)', '(TOTCLOT7G)', 'PRIMARY ONLY (TCHBS1)', 'PRIMARY WITH UPPER PRIMARY (TCHBS2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHBS3)', 'UPPER PRIMARY ONLY (TCHBS4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHBS5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHBS6)', 'UPPER PRIMARY WITH  SEC. (TCHBS7)', 'PRIMARY ONLY (TCHSEC1)', 'PRIMARY WITH UPPER PRIMARY (TCHSEC2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHSEC3)', 'UPPER PRIMARY ONLY (TCHSEC4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHSEC5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHSEC6)', 'UPPER PRIMARY WITH  SEC. (TCHSEC7)', 'PRIMARY ONLY (TCHHS1)', 'PRIMARY WITH UPPER PRIMARY (TCHHS2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHHS3)', 'UPPER PRIMARY ONLY (TCHHS4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHHS5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHHS6)', 'UPPER PRIMARY WITH  SEC. (TCHHS7)', 'PRIMARY ONLY (TCHGD1)', 'PRIMARY WITH UPPER PRIMARY (TCHGD2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHGD3)', 'UPPER PRIMARY ONLY (TCHGD4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHGD5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHGD6)', 'UPPER PRIMARY WITH  SEC. (TCHGD7)', 'PRIMARY ONLY (TCHPG1)', 'PRIMARY WITH UPPER PRIMARY (TCHPG2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHPG3)', 'UPPER PRIMARY ONLY (TCHPG4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHPG5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHPG6)', 'UPPER PRIMARY WITH  SEC. (TCHPG7)', 'PRIMARY ONLY (TCHMD1)', 'PRIMARY WITH UPPER PRIMARY (TCHMD2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHMD3)', 'UPPER PRIMARY ONLY (TCHMD4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHMD5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHMD6)', 'UPPER PRIMARY WITH  SEC. (TCHMD7)', 'PRIMARY ONLY (TCHPD1)', 'PRIMARY WITH UPPER PRIMARY (TCHPD2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHPD3)', 'UPPER PRIMARY ONLY (TCHPD4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHPD5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHPD6)', 'UPPER PRIMARY WITH  SEC. (TCHPD7)', 'PRIMARY ONLY (TCHNR1)', 'PRIMARY WITH UPPER PRIMARY (TCHNR2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHNR3)', 'UPPER PRIMARY ONLY (TCHNR4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHNR5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHNR6)', 'UPPER PRIMARY WITH  SEC. (TCHNR7)', 'BELOW SECONDARY (TCHCON1)', 'SECONDARY (TCHCON2)', 'HIGHER SECONDARY (TCHCON3)', 'GRADUATE (TCHCON4)', 'POST GRADUATE (TCHCON5)', 'M PHIL./ PH.D. (TCHCON67)', 'POST DOCTORATE (TCHCON8)', 'NO RESPONSE (TCHCON9)', 'PRIMARY ONLY (TCHN1)', 'PRIMARY WITH UPPER PRIMARY (TCHN2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHN3)', 'UPPER PRIMARY ONLY (TCHN4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHN5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHN6)', 'UPPER PRIMARY WITH  SEC. (TCHN7)', 'PRIMARY ONLY (TCHCM1)', 'PRIMARY WITH UPPER PRIMARY (TCHCM2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHCM3)', 'UPPER PRIMARY ONLY (TCHCM4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHCM5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHCM6)', 'UPPER PRIMARY WITH  SEC. (TCHCM7)', 'PRIMARY ONLY (TCHCF1)', 'PRIMARY WITH UPPER PRIMARY (TCHCF2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHCF3)', 'UPPER PRIMARY ONLY (TCHCF4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHCF5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHCF6)', 'UPPER PRIMARY WITH  SEC. (TCHCF7)', 'PRIMARY ONLY (TCHCN1)', 'PRIMARY WITH UPPER PRIMARY (TCHCN2)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (TCHCN3)', 'UPPER PRIMARY ONLY (TCHCN4)', 'UPPER PRIMARY WITH SEC./H.SEC (TCHCN5)', 'PRIMARY WITH UPPER PRIMARY SEC (TCHCN6)', 'UPPER PRIMARY WITH  SEC. (TCHCN7)', '(TLM R1)', '(TLM R2)', '(TLM R3)', '(TLM R4)', '(TLM R5)', '(TLM R6)', '(TLM R7)', 'EXPENDED (TLME)', 'RECEIVED (TLMR)', 'EXPENDED (CONTIE)', 'RECEIVED (CONTIR)', '(CONTI R1)', '(CONTI R2)', '(CONTI R3)', '(CONTI R4)', '(CONTI R5)', '(CONTI R6)', '(CONTI R7)', 'SUM OF INSTRUCTIONAL DAYS (PIDAY30)', 'NUMBER OF SCHOOLS GIVEN INSTRUCTIONAL DAYS (PIDAYSCH)', 'SUM OF INSTRUCTIONAL DAYS (UIDAY35)', 'NUMBER OF SCHOOLS GIVEN INSTRUCTIONAL DAYS (UIDAYSCH)', 'MEDIUM 1 (M1)', 'MEDIUM 2 (M2)', 'MEDIUM 3 (M3)', 'MEDIUM 4 (M4)', 'MEDIUM 5 (M5)', 'PRIMARY ONLY (ENRE11)', 'PRIMARY WITH UPPER PRIMARY (ENRE12)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENRE13)', 'UPPER PRIMARY ONLY (ENRE14)', 'UPPER PRIMARY WITH SEC./H.SEC (ENRE15)', 'PRIMARY WITH UPPER PRIMARY SEC (ENRE16)', 'UPPER PRIMARY WITH  SEC. (ENRE17)', 'PRIMARY ONLY (ENRE21)', 'PRIMARY WITH UPPER PRIMARY (ENRE22)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENRE23)', 'UPPER PRIMARY ONLY (ENRE24)', 'UPPER PRIMARY WITH SEC./H.SEC (ENRE25)', 'PRIMARY WITH UPPER PRIMARY SEC (ENRE26)', 'UPPER PRIMARY WITH  SEC. (ENRE27)', 'PRIMARY ONLY (ENRE31)', 'PRIMARY WITH UPPER PRIMARY (ENRE32)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENRE33)', 'UPPER PRIMARY ONLY (ENRE34)', 'UPPER PRIMARY WITH SEC./H.SEC (ENRE35)', 'PRIMARY WITH UPPER PRIMARY SEC (ENRE36)', 'UPPER PRIMARY WITH  SEC. (ENRE37)', 'PRIMARY ONLY (ENRE41)', 'PRIMARY WITH UPPER PRIMARY (ENRE42)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENRE43)', 'UPPER PRIMARY ONLY (ENRE44)', 'UPPER PRIMARY WITH SEC./H.SEC (ENRE45)', 'PRIMARY WITH UPPER PRIMARY SEC (ENRE46)', 'UPPER PRIMARY WITH  SEC. (ENRE47)', 'PRIMARY ONLY (ENRE51)', 'PRIMARY WITH UPPER PRIMARY (ENRE52)', 'PRIMARY WITH UPPER PRIMARY SEC/H.SEC (ENRE53)', 'UPPER PRIMARY ONLY (ENRE54)', 'UPPER PRIMARY WITH SEC./H.SEC (ENRE55)', 'PRIMARY WITH UPPER PRIMARY SEC (ENRE56)', 'UPPER PRIMARY WITH  SEC. (ENRE57)', 'MALE (TCH 5556M)', 'FEMALE (TCH 5556F)', 'TOTAL (TCH 5556T)', 'MALE (TCH 5758M)', 'FEMALE (TCH 5758F)', 'TOTAL (TCH 5758T)', 'MALE (TCH 5960M)', 'FEMALE (TCH 5960F)', 'TOTAL (TCH 5960T)', 'PRIMARY LEVEL (PPTR30)', 'UPPER PRIMARY (UPTR35)', 'PRIMARY LEVEL (PSCR30)', 'UPPER PRIMARY (USCR35)', '(NOTCH ASS)', '(TCHINV)', 'ALL  (PTXT ALL)', 'SC (PTXT SC)', 'ST (PTXT ST)', 'ALL  (PUNI ALL)', 'SC (PUNI SC)', 'ST (PUNI ST)', 'ALL  (UTXT ALL)', 'SC (UTXT SC)', 'ST (UTXT ST)', 'ALL  (UUNI ALL)', 'SC (UUNI SC)', 'ST (UUNI ST)', '(TOTCLS1G)', '(TOTCLS2G)', '(TOTCLS3G)', '(TOTCLS4G)', '(TOTCLS5G)', '(TOTCLS6G)', '(TOTCLS7G)']
Preview:
Unnamed: 0	YEAR	STATE NAME	DISTRICT NAME	TOTAL POULATION	PERCENTAGE URBAN POPULATION	0-6 POPULATION	GROWTH RATE	SEX RATIO	PERCENTAGE SC POPULATION	...	ALL (UUNI ALL)	SC (UUNI SC)	ST (UUNI ST)	(TOTCLS1G)	(TOTCLS2G)	(TOTCLS3G)	(TOTCLS4G)	(TOTCLS5G)	(TOTCLS6G)	(TOTCLS7G)
0	0	2015-16	JAMMU AND KASHMIR	KUPWARA	875564	11.33	197001.90	34.62	843	0.12	...	21322	26	2594	3489	5315	27	62	23	852	239
1	1	2015-16	JAMMU AND KASHMIR	BARAMULA	1015503	17.19	161871.18	20.34	873	0.15	...	17307	0	1571	4127	5800	210	53	30	1665	360
2	2	2015-16	JAMMU AND KASHMIR	SRINAGAR	1269751	98.73	155798.45	23.56	879	0.09	...	5444	31	408	817	3284	886	11	0	2873	40
3	3	2015-16	JAMMU AND KASHMIR	BADGAM	735753	11.74	150755.79	21.18	883	0.05	...	12469	18	857	2290	3837	119	45	8	1035	325
4	4	2015-16	JAMMU AND KASHMIR	PULWAMA	570060	13.80	97651.28	29.18	913	0.07	...	7408	17	855	1688	2584	151	67	5	1101	209
5 rows × 800 columns

........................................

📄 File: gdp_AndhraPradesh1.csv (0.00 MB)
Features: ['Year', 'Description', ' Adilabad', ' Anantapur', ' Chittoor', 'Godavari East', 'Godavari West', ' Guntur', ' Hyderabad', ' Kadapa', ' Karimnagar', ' Khammam', ' Krishna', ' Kurnool', ' Mahabubnagar', ' Medak', ' Nalgonda', ' Nellore', ' Nizamabad', ' Prakasam', ' Rangareddy', ' Srikakulam', ' Visakapatnam', ' Vizianagaram', ' Warangal']
Preview:
Year	Description	Adilabad	Anantapur	Chittoor	Godavari East	Godavari West	Guntur	Hyderabad	Kadapa	...	Medak	Nalgonda	Nellore	Nizamabad	Prakasam	Rangareddy	Srikakulam	Visakapatnam	Vizianagaram	Warangal
0	1999-00	GDP (in Rs. Cr.)	3463.28	4728.59	5395.57	9507.67	7398.00	7905.62	9213.40	3822.76	...	6681.38	4907.01	4575.15	3176.41	4504.11	7466.97	2881.30	7917.36	2636.85	4237.43
1	2000-01	GDP (in Rs. Cr.)	3742.69	6497.70	6223.34	9664.92	7679.40	8440.46	9798.19	4242.48	...	6141.82	5184.13	4811.17	3590.01	5209.69	7576.74	3271.96	9349.90	2735.93	4985.86
2	2001-02	GDP (in Rs. Cr.)	4209.40	5726.90	6679.35	10293.74	7581.59	9093.67	10579.58	3947.37	...	6483.42	5334.46	5190.19	3566.05	5253.02	8277.61	3336.08	9773.66	3006.34	4948.11
3	2002-03	GDP (in Rs. Cr.)	4099.29	5728.86	6490.28	10774.68	8157.23	8308.96	11572.47	4043.10	...	6414.96	5193.16	5499.76	3621.97	5166.96	8807.38	3410.17	11227.50	2978.88	4757.17
4	2003-04	GDP (in Rs. Cr.)	4781.85	6083.64	7100.34	11955.33	9285.80	9317.54	12449.88	4450.84	...	7487.09	5703.24	5421.20	3614.71	5682.18	9502.03	3801.79	12770.07	3306.70	5550.04
5 rows × 25 columns

........................................

📄 File: gdp_AndhraPradesh2.csv (0.00 MB)
Features: ['Year', 'Description', 'Adilabad', 'Anantapur', 'Chittoor', 'Godavari East', 'Godavari West', 'Guntur', 'Hyderabad', 'Kadapa', 'Karimnagar', 'Khammam', 'Krishna', 'Kurnool', 'Mahabubnagar', 'Medak', 'Nalgonda', 'Nellore', ' Nizamabad', 'Prakasam', 'Rangareddy', 'Srikakulam', 'Visakapatnam', 'Vizianagaram', 'Warangal']
Preview:
Year	Description	Adilabad	Anantapur	Chittoor	Godavari East	Godavari West	Guntur	Hyderabad	Kadapa	...	Medak	Nalgonda	Nellore	Nizamabad	Prakasam	Rangareddy	Srikakulam	Visakapatnam	Vizianagaram	Warangal
0	2004-05	GDP (in Rs. Cr.)	6527.41	9286.21	9048.39	17289.90	12704.42	11878.60	16932.79	6287.94	...	8906.57	7658.54	7612.73	4869.16	8507.54	13310.46	5059.99	19371.01	4988.90	7349.51
1	2005-06	GDP (in Rs. Cr.)	6813.28	9603.80	10086.16	16223.80	12404.23	13742.78	19849.35	6831.37	...	10158.74	8665.24	8283.88	5744.88	9495.66	16656.56	5378.08	19575.24	5141.09	8217.91
2	2006-07	GDP (in Rs. Cr.)	7650.79	10080.87	10656.30	18446.62	13069.01	14654.84	23079.49	10844.26	...	12597.00	9357.15	9302.47	6048.56	10543.00	19180.36	5848.86	22279.55	5499.93	8579.70
3	2007-08	GDP (in Rs. Cr.)	8316.50	12799.58	12095.35	20421.44	15287.66	16133.66	25956.40	11536.84	...	12367.64	12109.19	10227.41	6761.78	11027.89	20969.65	6369.69	25519.26	6457.10	9438.14
4	2008-09	GDP (in Rs. Cr.)	9342.33	12759.93	12528.14	21859.90	14501.24	17406.21	28430.61	9062.99	...	14790.43	13982.38	11494.65	8599.06	12361.71	24905.95	6649.93	23532.83	6675.89	10161.06
5 rows × 25 columns

........................................

📄 File: gdp_ArunachalPradesh.csv (0.00 MB)
Features: ['Year', 'Description', ' Changlang', ' Dibang Valley', ' Kameng: East', ' Kameng: West', ' Lohit', ' Papumpare', ' Siang: East', ' Siang: Upper', ' Siang: West', ' Subansiri: Lower', ' Subansiri: Upper', ' Tawang', ' Tirap']
Preview:
Year	Description	Changlang	Dibang Valley	Kameng: East	Kameng: West	Lohit	Papumpare	Siang: East	Siang: Upper	Siang: West	Subansiri: Lower	Subansiri: Upper	Tawang	Tirap
0	1999-00	GDP (in Rs. Cr.)	176.09	86.85	71.64	150.66	191.85	228.39	120.00	50.91	139.65	120.14	65.45	82.30	127.81
1	2000-01	GDP (in Rs. Cr.)	182.02	92.86	77.02	162.39	206.86	243.34	128.13	54.93	150.44	129.66	70.41	88.38	139.36
2	2001-02	GDP (in Rs. Cr.)	194.24	113.45	91.34	198.81	240.96	285.93	142.91	67.32	172.28	142.76	82.22	110.10	154.22
3	2002-03	GDP (in Rs. Cr.)	190.13	104.78	85.49	186.23	228.39	278.77	139.01	62.63	165.14	140.47	78.35	102.36	149.40
4	2003-04	GDP (in Rs. Cr.)	204.19	117.24	95.76	203.74	250.06	312.51	154.21	71.72	183.87	161.18	88.36	112.71	164.70
........................................

📄 File: gdp_Assam1.csv (0.00 MB)
Features: ['Year', 'Description', ' Baksa', ' Barpeta', ' Bongaigaon', ' Cachar', ' Chirang', ' Darrang', ' Dhemaji', ' Dhubri', ' Dibrugarh', ' Goalpara', ' Golaghat', ' Hailakandi', ' Jorhat', ' Kamrup', ' Kamrup Metropolitan', ' Karbi Anglong', ' Karimganj', ' Kokrajhar', ' Lakhimpur', ' Morigaon', ' Nagaon', ' Nalbari', ' North Cachar Hills', ' Sivsagar', ' Sonitpur', ' Tinsukia', ' Udalguri']
Preview:
Year	Description	Baksa	Barpeta	Bongaigaon	Cachar	Chirang	Darrang	Dhemaji	Dhubri	...	Kokrajhar	Lakhimpur	Morigaon	Nagaon	Nalbari	North Cachar Hills	Sivsagar	Sonitpur	Tinsukia	Udalguri
0	1999-00	GDP (in Rs. Cr.)	NaN	2496.55	774.07	1795.82	NaN	1273.00	490.90	1233.33	...	1025.66	822.55	723.08	1933.73	1066.84	353.48	2523.90	1624.76	2061.17	NaN
1	2000-01	GDP (in Rs. Cr.)	NaN	2491.58	788.41	1842.90	NaN	1299.28	500.25	1258.65	...	1066.20	845.08	741.50	1965.36	1077.86	361.91	2589.01	1662.02	2140.23	NaN
2	2001-02	GDP (in Rs. Cr.)	NaN	2524.91	819.74	1900.02	NaN	1333.94	511.35	1298.91	...	1099.21	862.70	760.38	2028.57	1131.61	366.32	2594.77	1720.29	2179.84	NaN
3	2002-03	GDP (in Rs. Cr.)	NaN	2627.54	880.47	2043.83	NaN	1408.82	541.71	1383.24	...	1188.45	907.65	809.56	2180.40	1232.50	384.81	2738.68	1852.40	2325.98	NaN
4	2003-04	GDP (in Rs. Cr.)	NaN	2738.64	940.10	2165.76	NaN	1491.69	569.96	1475.12	...	1265.83	959.40	847.17	2317.54	1325.93	404.68	2860.79	1974.05	2476.53	NaN
5 rows × 29 columns

........................................

📄 File: gdp_Assam2.csv (0.00 MB)
Features: ['Year', 'Description', ' Baksa', ' Barpeta', ' Bongaigaon', ' Cachar', ' Chirang', ' Darrang', ' Dhemaji', ' Dhubri', ' Dibrugarh', ' Dima Hasao', ' Goalpara', ' Golaghat', ' Hailakandi', ' Jorhat', ' Kamrup (Metropolitan)', ' Kamrup Rural', ' Karbi-Anglong', ' Karimganj', ' Kokrajhar', ' Lakhimpur', ' Morigaon', ' Nagaon', ' Nalbari', ' Sivasagar', ' Sonitpur', ' Tinsukia', ' Udalguri']
Preview:
Year	Description	Baksa	Barpeta	Bongaigaon	Cachar	Chirang	Darrang	Dhemaji	Dhubri	...	Karimganj	Kokrajhar	Lakhimpur	Morigaon	Nagaon	Nalbari	Sivasagar	Sonitpur	Tinsukia	Udalguri
0	2009-10	GDP (in Rs. Cr.)	1480.1	2317.39	1950.52	3384.02	802.15	1791.69	1023.41	1983.62	...	2394.45	2272.06	1849.75	1571.16	3675.86	1663.11	5288.14	3168.47	4690.19	1548.3
1 rows × 29 columns

........................................

📄 File: gdp_Bihar1.csv (0.00 MB)
Features: ['Year', 'Description', ' Araria', ' Arwal', ' Aurangabad', ' Banka', ' Begusarai', ' Bhabhua', ' Bhagalpur', ' Bhojpur', ' Buxar', ' East Champaran', 'West Champaran', ' Darbhanga', ' Gaya', ' Gopalgang', ' Jahanabad', ' Jamui', ' Katihar', ' Khagaria', ' Kisangang', ' Lakhisarai', ' Madhepura', ' Madhubani', ' Munger', ' Muzaffarpur', ' Nalanda', ' Nawada', ' Patna', ' Purnia', ' Rohtas', ' Saharsa', ' Samstipur', ' Saran', ' Sekhpura', ' Sheohar', ' Sitamarhi', ' Siwan', ' Supaul', ' Vaishali']
Preview:
Year	Description	Araria	Arwal	Aurangabad	Banka	Begusarai	Bhabhua	Bhagalpur	Bhojpur	...	Rohtas	Saharsa	Samstipur	Saran	Sekhpura	Sheohar	Sitamarhi	Siwan	Supaul	Vaishali
0	1999-00	GDP (in Rs. Cr.)	886.89	263.82	1000.92	681.84	1747.91	681.95	1551.67	1239.83	...	1486.02	827.97	1666.73	1455.46	248.52	168.39	1118.78	1227.12	792.83	1382.59
1	2000-01	GDP (in Rs. Cr.)	997.93	285.24	1074.53	717.57	1946.86	896.47	1684.20	1529.77	...	1711.35	1023.20	2254.96	1646.46	262.24	226.68	1224.52	1257.94	829.90	1465.51
2	2001-02	GDP (in Rs. Cr.)	930.74	282.22	1114.16	703.34	1903.94	740.21	1757.42	1484.55	...	1691.03	904.59	1937.70	1568.33	246.83	202.00	1266.27	1287.65	854.29	1340.18
3	2002-03	GDP (in Rs. Cr.)	1005.23	286.60	1159.61	774.24	2204.41	776.55	1887.63	1393.22	...	1745.07	984.50	1904.18	1764.23	278.45	207.18	1358.46	1365.32	999.46	1723.93
4	2003-04	GDP (in Rs. Cr.)	996.64	306.42	1166.92	804.49	1870.70	806.52	2001.88	1395.24	...	1780.25	971.52	1756.84	1716.05	284.59	225.61	1210.44	1370.59	853.93	1401.90
5 rows × 40 columns

........................................

📄 File: gdp_Bihar2.csv (0.01 MB)
Features: ['Year', 'Description', ' Araria', ' Arwal', ' Aurangabad', ' Banka', ' Begusarai', ' Bhabhua', ' Bhagalpur', ' Bhojpur', ' Buxar', ' Darbhanga', 'East Champaran', ' Gaya', ' Gopalgang', ' Jamui', ' Jehanabad', ' Katihar', ' Khagaria', 'Kisangang', ' Lakhisarai', ' Madhepura', ' Madhubani', ' Munger', ' Muzaffarpur', ' Nalanda', ' Nawada', ' Patna', ' Purnia', ' Jahanabad', ' Saharsa', ' Samstipur', ' Saran', ' Sekhpura', ' Sheohar', ' Sitamarhi', ' Siwan', ' Supaul', ' Vaishali', 'West Champaran']
Preview:
Year	Description	Araria	Arwal	Aurangabad	Banka	Begusarai	Bhabhua	Bhagalpur	Bhojpur	...	Saharsa	Samstipur	Saran	Sekhpura	Sheohar	Sitamarhi	Siwan	Supaul	Vaishali	West Champaran
0	2004-05	GDP (in Rs. Cr.)	1369.800000	334.210000	1346.640000	1042.120000	2826.240000	905.220000	2586.080000	1619.350000	...	1247.580000	2369.580000	2142.280000	314.780000	249.520000	1586.090000	1737.060000	1176.520000	2066.000000	2506.850000
1	2005-06	GDP (in Rs. Cr.)	1436.277553	366.241980	1359.055026	1030.737488	2645.533884	957.029829	2743.768790	1786.839481	...	1243.879056	2392.043386	2316.545066	359.630065	245.638845	1650.643546	1780.065082	1134.505293	2068.568497	2544.604750
2	2006-07	GDP (in Rs. Cr.)	1543.766767	413.575399	1674.895319	1212.051793	2953.558813	1056.264313	3075.230581	2069.082253	...	1378.717600	3076.745586	2490.550369	400.430304	300.197417	1957.740125	2420.364217	1278.926005	2402.349226	3099.494825
3	2007-08	GDP (in Rs. Cr.)	1697.371703	436.986293	1778.026591	1251.509000	3323.209306	1144.262621	3294.701287	2211.294845	...	1443.937517	2880.114516	2751.002196	445.349618	345.114548	1934.824333	2249.356490	1281.750150	2370.035701	3003.857598
4	2008-09	GDP (in Rs. Cr.)	1819.038260	467.756707	1822.876972	1343.149064	4017.943944	1244.327438	3627.923904	2518.754376	...	1530.280995	3273.859438	2879.400349	495.167020	372.584239	2272.905353	2658.304270	1328.892778	2917.009319	3287.345183
5 rows × 40 columns

........................................

📄 File: gdp_Chattisgarh.csv (0.00 MB)
Features: ['Year', 'Description', ' Baster', ' Bilaspur', ' Damtari', ' Dantewara', ' Durg', ' Janjgir Champa', ' Jashpur', ' Kanker', ' Kawardha', ' Korba', ' Koriya', ' Mahasamund', ' Raigarh', ' Raipur', ' Rajnangaon', ' Surguja']
Preview:
Year	Description	Baster	Bilaspur	Damtari	Dantewara	Durg	Janjgir Champa	Jashpur	Kanker	Kawardha	Korba	Koriya	Mahasamund	Raigarh	Raipur	Rajnangaon	Surguja
0	1999-00	GDP (in Rs. Cr.)	1166.66	2379.56	748.12	851.55	3981.49	1151.22	740.52	605.55	501.78	4668.65	896.67	779.07	1264.57	4224.67	1456.61	1832.01
1	2000-01	GDP (in Rs. Cr.)	1010.89	2193.56	693.02	735.31	3689.41	1077.87	665.47	524.39	412.20	4674.30	900.50	708.79	1319.52	4122.75	1296.67	1813.11
2	2001-02	GDP (in Rs. Cr.)	1344.05	2557.56	837.18	890.47	4090.38	1299.02	775.22	658.50	529.68	4752.22	938.46	905.37	1501.50	4646.69	1570.57	1950.47
3	2002-03	GDP (in Rs. Cr.)	1252.98	2491.59	813.32	877.98	4157.56	1230.08	745.79	583.92	494.02	4961.98	996.42	786.65	1534.53	4795.55	1482.49	2025.75
4	2003-04	GDP (in Rs. Cr.)	1607.66	2902.65	998.94	1047.08	4937.40	1408.24	908.76	826.76	558.08	5229.77	1118.83	1044.92	1857.26	5623.57	1757.14	2241.49
........................................

📄 File: gdp_Haryana.csv (0.00 MB)
Features: ['Year', 'Description', ' Ambala', ' Bhiwani', ' Faridabad', ' Fatehabad', ' Gurgaon', ' Hisar', ' Jhajjar', ' Jind', ' Kaithal', ' Karnal', ' Kurukshetra', ' Mahindergarh', ' Panchkula', ' Panipat', ' Rewari', ' Rohtak', ' Sirsa', ' Sonipat', ' Yamuna Nagar']
Preview:
Year	Description	Ambala	Bhiwani	Faridabad	Fatehabad	Gurgaon	Hisar	Jhajjar	Jind	...	Karnal	Kurukshetra	Mahindergarh	Panchkula	Panipat	Rewari	Rohtak	Sirsa	Sonipat	Yamuna Nagar
0	1999-00	GDP (in Rs. Cr.)	2673.25	2496.47	6120.49	1942.31	7715.09	3646.78	1580.90	2383.20	...	2955.71	1660.63	1119.36	1243.42	2732.45	1912.48	1781.40	2555.44	2594.76	2359.80
1	2000-01	GDP (in Rs. Cr.)	2909.99	2546.75	7258.78	2049.04	8298.34	3963.15	1769.13	2500.61	...	3123.16	1761.15	1196.17	1310.92	3044.18	2077.29	2004.09	2734.64	2725.68	2404.13
2	2001-02	GDP (in Rs. Cr.)	3274.14	2802.60	8121.89	1988.52	9196.86	4049.91	1836.21	2668.88	...	3329.01	1866.88	1313.94	1400.49	3129.69	2452.58	2132.71	2622.98	3120.12	2582.62
3	2002-03	GDP (in Rs. Cr.)	3550.62	2788.91	7908.50	2133.55	10274.73	4321.36	1788.90	2645.69	...	3575.61	2049.72	1220.59	1501.11	3787.86	2690.25	2327.23	2870.19	3347.06	2724.54
4	2003-04	GDP (in Rs. Cr.)	3727.82	3211.96	8468.57	2335.86	12223.44	4846.20	2095.83	2900.74	...	3699.14	2156.98	1501.41	1666.16	3859.52	2662.73	2329.57	3186.53	3560.29	2845.69
5 rows × 21 columns

........................................

📄 File: gdp_HimachalPradesh.csv (0.00 MB)
Features: ['Year', 'Description', ' Bilaspur', ' Chamba', ' Hamirpur', ' Kangra', ' Kinnaur', ' Kullu', ' Lahaul and Spiti', ' Mandi', ' Shimla', ' Sirmaur', ' Solan', ' Una']
Preview:
Year	Description	Bilaspur	Chamba	Hamirpur	Kangra	Kinnaur	Kullu	Lahaul and Spiti	Mandi	Shimla	Sirmaur	Solan	Una
0	1999-00	GDP (in Rs. Cr.)	838.70	768.55	974.68	2686.46	264.16	746.83	229.43	1580.79	1852.85	1097.20	2056.52	1016.29
1	2000-01	GDP (in Rs. Cr.)	868.22	797.94	984.38	2783.17	279.78	853.76	205.66	1686.36	2145.69	1134.10	2238.28	1026.89
2	2001-02	GDP (in Rs. Cr.)	905.00	893.97	1052.15	3038.58	297.70	882.55	221.94	1826.84	2075.92	1170.13	2354.29	1067.02
3	2002-03	GDP (in Rs. Cr.)	953.40	883.14	1133.94	3062.37	326.09	982.03	214.61	1873.12	2284.74	1228.70	2479.69	1162.82
4	2003-04	GDP (in Rs. Cr.)	1030.97	957.21	1183.37	3291.50	365.09	1113.49	236.34	2035.78	2636.34	1235.46	2654.42	1185.02
........................................

📄 File: gdp_Jharkhand.csv (0.00 MB)
Features: ['Year', 'Description', ' Bokaro', ' Chatra', ' Deoghar', ' Dhanbad', ' Dumka', ' Garhwa', ' Giridih', ' Godda', ' Gumla', ' Hazaribagh', ' Jamtara', ' Koderma', ' Latehar', ' Lohardaga', ' Pakur', ' Palamu', ' Ranchi', ' Sahebganj', ' Saraykela Kharsawa', ' Simdega', ' Singhbhum: East', ' Singhbhum: West']
Preview:
Year	Description	Bokaro	Chatra	Deoghar	Dhanbad	Dumka	Garhwa	Giridih	Godda	...	Latehar	Lohardaga	Pakur	Palamu	Ranchi	Sahebganj	Saraykela Kharsawa	Simdega	Singhbhum: East	Singhbhum: West
0	1999-00	GDP (in Rs. Cr.)	2546.86	660.17	1476.11	4651.78	1763.49	737.14	1621.99	887.02	...	NaN	356.95	1166.74	1837.45	3930.95	1381.08	NaN	NaN	3370.58	2831.92
1	2000-01	GDP (in Rs. Cr.)	2244.83	584.92	1238.89	4432.27	1551.05	658.33	1457.06	775.58	...	NaN	319.83	951.84	1689.21	3730.97	1111.89	NaN	NaN	2920.88	2495.18
2	2001-02	GDP (in Rs. Cr.)	2268.10	648.80	1290.39	4446.98	1727.25	725.57	1549.98	850.18	...	NaN	360.43	968.89	1873.18	4286.26	1119.66	NaN	NaN	3033.10	2707.14
3	2002-03	GDP (in Rs. Cr.)	2440.12	667.74	1408.64	4574.89	1109.40	737.17	1599.86	864.27	...	551.15	352.98	1086.09	1313.71	4106.81	1286.14	1095.15	548.25	3293.64	1677.19
4	2003-04	GDP (in Rs. Cr.)	2640.51	727.23	1506.02	4869.53	1183.98	790.11	1715.42	913.82	...	593.67	373.28	1158.06	1426.64	4601.27	1388.23	1225.40	552.12	3577.17	1807.81
5 rows × 24 columns

........................................

📄 File: gdp_Karnataka1.csv (0.00 MB)
Features: ['Year', 'Description', 'Bagalkote', 'Bangalore Rural', 'Bangalore Urban', 'Belgaum', 'Bellary', 'Bidar', 'Bijapur', 'Chamarajanagar', 'Chickmagalur', 'Chitradurga', 'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Gulbarga', 'Hassan', 'Haveri', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysore', 'Raichur', 'Shimoga', 'Tumkur', 'Udupi', 'Uttara Kannada']
Preview:
Year	Description	Bagalkote	Bangalore Rural	Bangalore Urban	Belgaum	Bellary	Bidar	Bijapur	Chamarajanagar	...	Kodagu	Kolar	Koppal	Mandya	Mysore	Raichur	Shimoga	Tumkur	Udupi	Uttara Kannada
0	1999-00	GDP (in Rs. Cr.)	2574.91	3262.57	21876.93	6968.35	3517.42	1873.37	2706.97	1479.89	...	1605.85	3613.33	1639.93	2463.43	4782.99	2028.00	3084.60	3588.97	2244.65	2454.71
1	2000-01	GDP (in Rs. Cr.)	2845.02	5096.26	20490.12	7700.24	3837.59	1712.10	2469.33	1688.01	...	1526.44	3629.06	1787.90	2720.09	5683.37	2119.92	3237.17	4265.65	2641.89	2384.40
2	2001-02	GDP (in Rs. Cr.)	2867.81	5042.31	25285.10	7092.07	3839.33	1843.38	2510.05	1516.08	...	1550.30	3814.90	2056.07	2701.25	5383.35	1921.24	3071.17	3767.37	2645.78	2533.72
3	2002-03	GDP (in Rs. Cr.)	2813.99	4336.05	27768.66	7175.44	4351.53	1935.83	2645.68	1561.38	...	1566.18	3624.21	2143.74	2675.83	5630.74	2010.67	3204.56	3883.37	2791.71	2336.09
4	2003-04	GDP (in Rs. Cr.)	2554.12	4592.00	28290.70	7139.48	5722.39	1964.22	2501.62	1281.05	...	1298.27	3959.69	2449.14	2793.16	5594.83	2289.60	3325.94	3826.69	2933.25	2559.13
5 rows × 29 columns

........................................

📄 File: gdp_Karnataka2.csv (0.00 MB)
Features: ['Year', 'Description', ' Bagalkote', ' Bangalore Rural', ' Bangalore Urban', ' Belgaum', ' Bellary', ' Bidar', ' Bijapur', ' Chamarajanagar', ' Chickballapur', ' Chickmagalur', ' Chitradurga', ' Dakshina Kannada', ' Davangere', ' Dharwad', ' Gadag', ' Gulbarga', ' Hassan', ' Haveri', ' Kodagu', ' Kolar', ' Koppal', ' Mandya', ' Mysore', ' Raichur', ' Ramnagara', ' Shimoga', ' Tumkur', ' Udupi', 'Uttara Kannada', ' Yadagiri']
Preview:
Year	Description	Bagalkote	Bangalore Rural	Bangalore Urban	Belgaum	Bellary	Bidar	Bijapur	Chamarajanagar	...	Koppal	Mandya	Mysore	Raichur	Ramnagara	Shimoga	Tumkur	Udupi	Uttara Kannada	Yadagiri
0	2007-08	GDP (in Rs. Cr.)	4945.000000	4922.000000	78223.00000	12795.000000	8732.000000	3129.000000	4519.000000	2495.000000	...	3018.000000	4607.000000	9402.000000	4045.000000	3962.000000	6156.000000	7667.000000	5443.000000	4438.00000	NaN
1	2008-09	GDP (in Rs. Cr.)	5085.000000	5048.000000	81684.00000	13158.000000	8951.000000	3245.000000	4655.000000	2543.000000	...	3083.000000	4708.000000	9698.000000	4161.000000	4047.000000	6359.000000	7857.000000	5708.000000	4655.00000	NaN
2	2009-10	GDP (in Rs. Cr.)	5030.000000	6352.000000	89261.00000	14340.000000	9054.000000	3237.000000	4666.000000	2589.000000	...	3360.000000	4481.000000	11286.000000	4069.000000	3651.000000	6702.000000	8341.000000	5953.000000	4630.00000	2542.0
3	2010-11	GDP (in Rs. Cr.)	5433.000000	6906.000000	87206.00000	15476.000000	10602.000000	3855.000000	5620.000000	2599.000000	...	3993.000000	5173.000000	13257.000000	4535.000000	5101.000000	6896.000000	9353.000000	6533.000000	5371.00000	2119.0
4	2008-09	Growth Rate % (YoY)	2.831143	2.559935	4.42453	2.837046	2.508016	3.707255	3.009515	1.923848	...	2.153744	2.192316	3.148266	2.867738	2.145381	3.297596	2.478153	4.868639	4.88959	NaN
5 rows × 32 columns

........................................

📄 File: gdp_Kerala1.csv (0.00 MB)
Features: ['Year', 'Description', 'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasargode', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad']
Preview:
Year	Description	Alappuzha	Ernakulam	Idukki	Kannur	Kasargode	Kollam	Kottayam	Kozhikode	Malappuram	Palakkad	Pathanamthitta	Thiruvananthapuram	Thrissur	Wayanad
0	1999-00	GDP (in Rs. Cr.)	4533.90	9562.42	2958.33	4920.51	2254.34	5144.42	4430.62	6111.70	5610.17	5232.39	2716.95	7344.30	6664.93	1683.49
1	2000-01	GDP (in Rs. Cr.)	4600.27	9752.23	3268.71	4873.59	2146.18	5290.83	4653.32	5953.96	5451.82	5450.30	2824.31	7432.41	6716.13	1843.89
2	2001-02	GDP (in Rs. Cr.)	4893.73	10409.79	3568.79	5199.95	2345.28	5785.75	4972.13	6476.50	5811.98	5857.01	3092.20	8078.63	7251.98	1565.25
3	2002-03	GDP (in Rs. Cr.)	5247.72	11232.83	3631.02	5585.60	2501.07	6083.15	5498.65	6901.26	6589.30	6224.46	3330.46	8655.26	7714.87	1613.43
4	2003-04	GDP (in Rs. Cr.)	5510.77	12095.66	3365.32	6030.34	2850.65	6378.72	5840.11	7567.29	6910.92	6555.70	3510.18	9166.57	8318.39	1757.71
........................................

📄 File: gdp_Kerala2.csv (0.00 MB)
Features: ['Year', 'Description', ' Alappuzha', 'Ernakulam', ' Idukki', ' Kannur', 'Kasargode', ' Kollam', ' Kottayam', ' Kozhikode', ' Malappuram', ' Palakkad', ' Pathanamthitta', ' Thiruvananthapuram', ' Thrissur', ' Wayanad']
Preview:
Year	Description	Alappuzha	Ernakulam	Idukki	Kannur	Kasargode	Kollam	Kottayam	Kozhikode	Malappuram	Palakkad	Pathanamthitta	Thiruvananthapuram	Thrissur	Wayanad
0	2005-06	GDP (in Rs. Cr.)	8327.70	18440.27	4884.78	9571.46	4309.72	9876.25	9275.77	11282.13	10494.11	9935.95	5195.53	14162.23	12557.12	2980.91
1	2006-07	GDP (in Rs. Cr.)	9181.28	20314.54	5052.93	10121.39	4626.25	10546.14	9979.79	12298.56	11001.95	10917.11	5583.94	15417.65	13753.99	2871.17
2	2007-08	GDP (in Rs. Cr.)	10004.34	22343.96	5213.22	10989.00	5083.92	11410.63	10854.66	13360.66	11876.67	11923.71	6141.88	16938.91	15050.32	2900.80
3	2008-09	GDP (in Rs. Cr.)	10663.00	24020.03	5619.25	11570.35	5017.11	12546.41	11305.35	14041.07	12912.41	12109.62	6420.93	17740.42	15747.49	2945.76
4	2009-10	GDP (in Rs. Cr.)	11811.41	25698.16	6338.56	12643.40	5451.47	13141.79	12452.62	15197.79	13652.36	14010.36	7217.69	19188.02	17451.53	3316.20
........................................

📄 File: gdp_MadhyaPradesh.csv (0.01 MB)
Features: ['Year', 'Description', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Mandla', 'Mandsaur', 'Morena', 'Narsimhapur', 'Neemuch', 'Nimar: East', 'Nimar: West', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha']
Preview:
Year	Description	Balaghat	Barwani	Betul	Bhind	Bhopal	Chhatarpur	Chhindwara	Damoh	...	Seoni	Shahdol	Shajapur	Sheopur	Shivpuri	Sidhi	Tikamgarh	Ujjain	Umaria	Vidisha
0	1999-00	GDP (in Rs. Cr.)	1651.36	816.45	1702.27	1295.06	4335.97	1508.65	2616.88	1174.86	...	1163.76	2116.40	1635.65	528.66	1396.81	3244.75	1160.93	3250.93	487.22	1476.09
1	2000-01	GDP (in Rs. Cr.)	1574.46	781.95	1600.22	1152.80	4277.19	1454.65	2390.74	1178.10	...	1030.25	2028.57	1281.60	495.50	1316.36	3093.65	1111.91	2654.58	476.09	1381.78
2	2001-02	GDP (in Rs. Cr.)	1747.45	852.19	1808.62	1328.31	4462.23	1545.93	2458.56	1200.93	...	1209.94	2166.68	1335.92	533.67	1422.63	3278.48	1197.60	2759.85	513.23	1461.14
3	2002-03	GDP (in Rs. Cr.)	1600.56	842.54	1755.23	1222.71	4577.41	1492.82	2536.79	1076.63	...	1168.14	2125.40	1262.81	392.43	1112.77	3322.68	1083.12	2694.21	501.94	1348.27
4	2003-04	GDP (in Rs. Cr.)	1771.74	985.59	1879.29	1362.86	4972.00	1606.05	2830.22	1244.11	...	1266.61	2242.59	1547.90	574.55	1465.18	3566.34	1247.75	3147.52	538.80	1489.82
5 rows × 47 columns

........................................

📄 File: gdp_Maharashtra1.csv (0.01 MB)
Features: ['Year', 'Description', 'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalna', 'Jalgaon', 'Kolhapur', 'Latur', 'Mumbai', 'Nagpur', 'Nanded', 'Nandhurbar', 'Nashik', 'Osmanabad', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wahim', 'Wardha', 'Yavatnal']
Preview:
Year	Description	Ahmednagar	Akola	Amravati	Aurangabad	Beed	Bhandara	Buldhana	Chandrapur	...	Raigad	Ratnagiri	Sangli	Satara	Sindhudurg	Solapur	Thane	Wahim	Wardha	Yavatnal
0	1999-00	GDP (in Rs. Cr.)	7680.38	2970.06	4979.45	6908.85	3369.15	2038.28	2980.02	4801.13	...	8235.64	3332.47	5915.65	6223.76	1756.36	7064.47	28755.60	1154.33	2426.95	3986.69
1	2000-01	GDP (in Rs. Cr.)	7347.45	2909.31	4660.55	6476.55	3430.77	2033.86	2671.88	4626.22	...	8572.33	3186.65	6029.52	6164.62	1902.36	7241.52	29327.00	1146.85	2324.70	3739.42
2	2001-02	GDP (in Rs. Cr.)	7618.89	2934.96	4754.12	6309.84	3385.08	2112.86	3008.33	5087.04	...	7630.85	3502.39	6038.98	6307.05	1792.82	7613.71	29635.26	1473.00	2484.57	4041.89
3	2002-03	GDP (in Rs. Cr.)	8098.18	3320.53	4656.30	6798.67	3561.34	2429.98	3191.67	5164.89	...	8938.20	4048.77	6185.88	6555.98	2206.44	7675.12	32345.47	1318.22	2651.90	4169.32
4	2003-04	GDP (in Rs. Cr.)	8521.04	3384.98	4894.04	7180.48	3530.80	2596.25	3407.43	5655.56	...	9661.38	4277.55	6145.36	6983.42	2365.68	8130.02	35011.01	1387.91	2881.27	4400.86
5 rows × 36 columns

........................................

📄 File: gdp_Maharashtra2.csv (0.00 MB)
Features: ['Year', 'Description', ' Ahmednagar', ' Akola', ' Amravati', ' Aurangabad', ' Beed', ' Bhandara', ' Buldhana', ' Chandrapur', ' Dhule', ' Gadchiroli', ' Gondia', ' Hingoli', ' Jalgaon', ' Jalna', ' Kolhapur', ' Latur', ' Mumbai', ' Nagpur', ' Nanded', 'Nandhurbar', ' Nashik', ' Osmanabad', ' Parbhani', ' Pune', ' Raigad', ' Ratnagiri', ' Sangli', ' Satara', ' Sindhudurg', ' Solapur', ' Thane', ' Wahim', ' Wardha', 'Yavatnal']
Preview:
Year	Description	Ahmednagar	Akola	Amravati	Aurangabad	Beed	Bhandara	Buldhana	Chandrapur	...	Raigad	Ratnagiri	Sangli	Satara	Sindhudurg	Solapur	Thane	Wahim	Wardha	Yavatnal
0	2005-06	GDP (in Rs. Cr.)	10847	3698	5739	8877	4568	3040	3863	6576	...	9144	4826	7624	8630	2489	10856	41916	1690	3224	5270
1	2006-07	GDP (in Rs. Cr.)	12184	4449	6131	9756	5034	3276	4332	6974	...	10021	5217	8493	9472	2727	12412	46924	1886	3434	5845
2	2007-08	GDP (in Rs. Cr.)	13422	4919	7088	11015	5615	3667	5266	7585	...	11056	5651	9330	10352	3186	13374	53308	2218	3926	6964
3	2008-09	GDP (in Rs. Cr.)	18225	7030	10567	17985	7419	5056	7651	10768	...	17217	7958	12852	14232	4436	18205	83706	2745	5992	10151
4	2009-10	GDP (in Rs. Cr.)	17754	7234	11597	20022	7334	4576	7417	11085	...	17569	9086	13155	14525	4424	19305	89512	3188	5759	9132
5 rows × 36 columns

........................................

📄 File: gdp_Manipur.csv (0.00 MB)
Features: ['Year', 'Description', 'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Senapati', 'Tamenglong', 'Thoubal', 'Ukhrul']
Preview:
Year	Description	Bishnupur	Chandel	Churachandpur	Imphal East	Imphal West	Senapati	Tamenglong	Thoubal	Ukhrul
0	1999-00	GDP (in Rs. Cr.)	317.45	134.86	255.06	460.26	1067.46	264.63	146.68	433.16	180.60
1	2000-01	GDP (in Rs. Cr.)	308.55	137.07	240.73	428.83	963.60	256.54	117.38	425.05	175.48
2	2001-02	GDP (in Rs. Cr.)	324.15	148.34	255.27	455.51	1035.91	272.11	129.94	444.32	195.32
3	2002-03	GDP (in Rs. Cr.)	310.95	138.29	282.86	449.16	1038.32	279.19	127.76	441.06	178.00
4	2003-04	GDP (in Rs. Cr.)	317.23	152.10	295.64	497.68	1100.15	324.07	153.77	561.11	196.47
........................................

📄 File: gdp_Meghalaya.csv (0.00 MB)
Features: ['Year', 'Description', 'Garo Hills: East', 'Garo Hills: South', 'Garo Hills: West', 'Jaintia Hills', 'Khasi Hills: East', 'Khasi Hills: West', 'Ri Bhoi']
Preview:
Year	Description	Garo Hills: East	Garo Hills: South	Garo Hills: West	Jaintia Hills	Khasi Hills: East	Khasi Hills: West	Ri Bhoi
0	1999-00	GDP (in Rs. Cr.)	282.01	208.73	653.01	574.03	1345.18	277.57	237.61
1	2000-01	GDP (in Rs. Cr.)	282.00	230.07	669.99	592.07	1439.73	301.92	257.59
2	2001-02	GDP (in Rs. Cr.)	297.18	259.41	705.18	675.21	1504.92	314.11	277.14
3	2002-03	GDP (in Rs. Cr.)	315.57	255.33	743.51	642.81	1605.05	338.17	285.08
4	2003-04	GDP (in Rs. Cr.)	321.75	270.78	773.47	717.36	1754.12	324.68	307.49
........................................

📄 File: gdp_Mizoram.csv (0.00 MB)
Features: ['Year', 'Description', 'Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Serchhip']
Preview:
Year	Description	Aizawl	Champhai	Kolasib	Lawngtlai	Lunglei	Mamit	Saiha	Serchhip
0	1999-00	GDP (in Rs. Cr.)	658.01	147.63	110.46	108.86	212.73	115.57	103.32	93.32
1	2000-01	GDP (in Rs. Cr.)	692.72	153.82	110.65	117.35	225.59	120.36	111.44	97.61
2	2001-02	GDP (in Rs. Cr.)	757.73	162.02	117.16	124.82	237.96	129.86	118.44	105.08
3	2002-03	GDP (in Rs. Cr.)	833.93	175.08	127.52	136.97	260.58	139.22	129.06	110.64
4	2003-04	GDP (in Rs. Cr.)	868.74	181.71	129.68	141.67	268.33	141.86	131.72	110.34
........................................

📄 File: gdp_Odisha1.csv (0.00 MB)
Features: ['Year', 'Description', ' Angul', 'Balangir', ' Balasore', 'Bargarh', 'Baudh', 'Bhadrak', 'Cuttack', ' Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', ' Jagatsinghpur', ' Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', ' Nabarangpur', ' Nayargarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Sonapur', 'Sundargarh']
Preview:
Year	Description	Angul	Balangir	Balasore	Bargarh	Baudh	Bhadrak	Cuttack	Deogarh	...	Malkangiri	Mayurbhanj	Nabarangpur	Nayargarh	Nuapada	Puri	Rayagada	Sambalpur	Sonapur	Sundargarh
0	1999-00	GDP (in Rs. Cr.)	3360.52	1416.82	1814.50	1489.30	363.14	976.02	2962.05	352.01	...	532.64	2003.64	916.45	666.71	559.62	1435.63	940.57	1505.60	494.20	3123.19
1	2000-01	GDP (in Rs. Cr.)	3314.31	1263.15	1938.16	1265.10	342.24	973.61	3018.44	322.29	...	485.03	2007.55	867.94	672.22	543.31	1434.97	952.47	1389.54	480.27	2918.74
2	2001-02	GDP (in Rs. Cr.)	2997.57	1441.84	2019.01	1444.24	387.71	1124.04	3238.92	364.80	...	513.11	2142.58	894.07	748.46	613.76	1551.45	991.90	1491.24	532.94	2554.61
3	2002-03	GDP (in Rs. Cr.)	3515.41	1348.02	1928.33	1269.89	385.72	1097.06	3327.35	298.41	...	480.74	2001.75	861.96	718.72	529.96	1590.55	1001.15	1417.90	459.34	2948.41
4	2003-04	GDP (in Rs. Cr.)	4181.10	1622.46	2231.14	1510.95	449.37	1271.58	3631.50	343.43	...	527.04	2317.99	956.39	835.74	602.32	1806.42	1151.87	1606.64	511.79	3344.25
5 rows × 32 columns

........................................

📄 File: gdp_Odisha2.csv (0.00 MB)
Features: ['Year', 'Description', ' Angul', ' Balangir', ' Balasore', ' Bargarh', ' Bhadrak', 'Baudh', ' Cuttack', ' Deogarh', ' Dhenkanal', ' Gajapati', ' Ganjam', ' Jagatsinghpur', ' Jajpur', ' Jharsuguda', ' Kalahandi', ' Kandhamal', ' Kendrapara', ' Kendujhar', ' Khordha', ' Koraput', ' Malkangiri', ' Mayurbhanj', ' Nabarangpur', ' Nayargarh', ' Nuapada', ' Puri', ' Rayagada', ' Sambalpur', ' Subarnapur', ' Sundargarh']
Preview:
Year	Description	Angul	Balangir	Balasore	Bargarh	Bhadrak	Baudh	Cuttack	Deogarh	...	Malkangiri	Mayurbhanj	Nabarangpur	Nayargarh	Nuapada	Puri	Rayagada	Sambalpur	Subarnapur	Sundargarh
0	2004-05	GDP (in Rs. Cr.)	5690.79	2430.39	3251.17	2045.07	1855.46	642.51	5756.75	477.60	...	808.60	3378.09	1347.89	1142.44	829.21	2403.66	1547.34	2507.28	758.91	6014.81
1	2005-06	GDP (in Rs. Cr.)	5861.93	2581.53	3404.67	2165.61	1924.01	685.28	5863.45	514.38	...	827.01	3544.63	1400.41	1224.48	892.06	2563.96	1682.31	2721.44	814.43	6271.72
2	2006-07	GDP (in Rs. Cr.)	6684.83	2900.84	3898.33	2407.74	2105.80	751.88	6567.83	556.25	...	889.76	3925.02	1523.54	1327.53	980.10	2594.39	1899.09	3027.76	910.35	7678.16
3	2007-08	GDP (in Rs. Cr.)	7630.67	3215.50	4407.05	2716.69	2298.60	806.21	7303.06	583.92	...	953.62	4321.61	1639.11	1397.20	1114.02	2792.31	2103.41	3403.93	950.12	9041.56
4	2008-09	GDP (in Rs. Cr.)	8297.99	3408.07	4775.44	2906.12	2515.08	860.46	7790.92	625.45	...	989.51	4573.74	1726.70	1452.25	1160.03	2993.42	2263.61	3708.40	1022.81	10052.23
5 rows × 32 columns

........................................

📄 File: gdp_Punjab1.csv (0.00 MB)
Features: ['Year', 'Description', 'Amritsar', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Firozpur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mukatsar', 'Patiala', 'Roopnagar', 'Sangrur', ' Shahid Bhagat Singh Nagar']
Preview:
Year	Description	Amritsar	Bathinda	Faridkot	Fatehgarh Sahib	Firozpur	Gurdaspur	Hoshiarpur	Jalandhar	Kapurthala	Ludhiana	Mansa	Moga	Mukatsar	Patiala	Roopnagar	Sangrur	Shahid Bhagat Singh Nagar
0	1999-00	GDP (in Rs. Cr.)	7705.34	2995.47	1577.58	1880.52	4847.81	4701.19	3530.46	5998.73	2187.00	9529.69	1652.84	2405.26	1881.46	5425.62	3184.72	5800.01	1872.53
1	2000-01	GDP (in Rs. Cr.)	8112.76	3238.06	1633.15	1783.88	4783.22	4961.99	3530.85	5727.68	2388.60	10189.75	1694.06	2999.39	1939.70	5654.84	3175.94	6024.13	1998.16
2	2001-02	GDP (in Rs. Cr.)	8377.52	3012.85	1632.17	1866.76	4717.66	5067.39	3712.09	5947.38	2319.55	10582.77	1625.93	3139.47	1983.29	5809.21	3361.79	6068.97	1948.85
3	2002-03	GDP (in Rs. Cr.)	8621.10	3197.63	1647.02	1863.43	4754.13	5056.29	3796.03	6181.97	2394.54	10843.44	1721.91	3180.82	2042.61	5867.92	3431.72	6510.20	2061.62
4	2003-04	GDP (in Rs. Cr.)	8988.86	3425.79	1750.01	2004.67	5244.09	5429.78	4029.10	6468.56	2532.68	11627.96	1883.56	3403.55	2204.68	6044.96	3323.07	6662.35	2188.24
........................................

📄 File: gdp_Punjab2.csv (0.00 MB)
Features: ['Year', 'Description', ' Amritsar', ' Barnala', ' Bathinda', ' Faridkot', ' Fatehgarh Sahib', 'Firozpur', ' Gurdaspur', ' Hoshiarpur', ' Jalandhar', ' Kapurthala', ' Ludhiana', ' Mansa', ' Moga', 'Mukatsar', ' Patiala', ' Roopnagar', ' Sahibzada Ajit Singh Nagar', ' Sangrur', ' Shahid Bhagat Singh Nagar', ' Taran Tarn']
Preview:
Year	Description	Amritsar	Barnala	Bathinda	Faridkot	Fatehgarh Sahib	Firozpur	Gurdaspur	Hoshiarpur	...	Ludhiana	Mansa	Moga	Mukatsar	Patiala	Roopnagar	Sahibzada Ajit Singh Nagar	Sangrur	Shahid Bhagat Singh Nagar	Taran Tarn
0	2004-05	GDP (in Rs. Cr.)	11,364.41	NaN	4,271.16	2,161.56	2,467.97	6,248.08	6,662.55	5,317.82	...	14,740.80	2,303.84	4,081.23	2,744.52	7,462.19	4,280.63	0	8,192.58	3,003.19	0
1	2005-06	GDP (in Rs. Cr.)	11,839.91	NaN	4,548.44	2,311.44	2,601.17	6,700.30	7,194.78	5,492.93	...	15,902.82	2,463.32	4,167.25	2,985.20	8,107.48	4,476.77	0	8,529.11	2,933.31	0
2	2006-07	GDP (in Rs. Cr.)	8,981.87	NaN	5,022.93	2,518.82	2,833.05	7,139.20	7,746.25	6,128.27	...	17,821.23	2,699.76	4,753.32	3,230.78	8,153.59	2,932.69	2,987.57	9,443.17	3,363.81	3,808.25
3	2007-08	GDP (in Rs. Cr.)	9,180.55	2,556.90	5,382.30	2,635.99	3,134.46	7,475.28	8,309.82	6,668.07	...	19,834.30	2,825.13	5,442.48	3,458.68	8,444.64	3,224.63	3,838.86	7,700.74	3,807.95	4,489.02
4	2008-09	GDP (in Rs. Cr.)	9,852.47	2,672.95	5,652.00	2,872.69	3,238.95	8,018.61	8,881.57	7,214.77	...	20,983.13	2,950.38	5,749.60	3,681.45	8,885.14	3,445.99	4,144.49	7,925.18	3,972.64	4,635.21
5 rows × 22 columns

........................................

📄 File: gdp_Rajasthan1.csv (0.00 MB)
Features: ['Year', 'Description', 'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Ganga Nagar', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Tonk', 'Udaipur']
Preview:
Year	Description	Ajmer	Alwar	Banswara	Baran	Barmer	Bharatpur	Bhilwara	Bikaner	...	Karauli	Kota	Nagaur	Pali	Rajsamand	Sawai Madhopur	Sikar	Sirohi	Tonk	Udaipur
0	1999-00	GDP (in Rs. Cr.)	3603.13	5328.11	1545.24	1445.68	1838.21	2577.87	4078.49	2916.73	...	1367.76	3010.13	2922.00	2497.82	1367.03	1477.47	2645.43	1475.22	1831.24	3986.74
1	2000-01	GDP (in Rs. Cr.)	3557.59	5202.12	1426.43	1535.96	2148.01	2761.71	3730.08	2996.26	...	1242.75	2961.98	3181.28	2569.68	1353.55	1379.15	2649.38	1354.99	1506.36	4133.81
2	2001-02	GDP (in Rs. Cr.)	3773.30	5121.21	1612.06	1765.86	2537.06	2732.38	3602.57	3558.81	...	1401.00	3131.29	3579.13	2847.45	1593.35	1473.15	2883.10	1861.67	1656.07	4502.62
3	2002-03	GDP (in Rs. Cr.)	3610.96	5036.95	1590.35	1273.10	2089.29	2350.10	3677.47	2483.24	...	1315.13	2960.37	3028.29	2536.95	1557.38	1252.27	2689.88	1427.08	1441.80	4251.56
4	2003-04	GDP (in Rs. Cr.)	4025.96	6205.95	1900.79	2112.84	3276.78	3194.50	4830.38	4228.45	...	1771.38	3766.44	4328.91	3255.49	1680.87	1757.58	3332.60	1717.20	1913.59	4604.31
5 rows × 34 columns

........................................

📄 File: gdp_Rajasthan2.csv (0.00 MB)
Features: ['Year', 'Description', ' Ajmer', ' Alwar', ' Banswara', ' Baran', ' Barmer', ' Bharatpur', ' Bhilwara', ' Bikaner', ' Bundi', ' Chittorgarh', ' Churu', ' Dausa', ' Dholpur', ' Dungarpur', ' Ganga Nagar', ' Hanumangarh', ' Jaipur', ' Jaisalmer', ' Jalore', ' Jhalawar', ' Jhunjhunu', ' Jodhpur', ' Karauli', ' Kota', ' Nagaur', ' Pali', ' Pratapgarh', ' Rajsamand', ' Sawai Madhopur', ' Sikar', ' Sirohi', ' Tonk', ' Udaipur']
Preview:
Year	Description	Ajmer	Alwar	Banswara	Baran	Barmer	Bharatpur	Bhilwara	Bikaner	...	Kota	Nagaur	Pali	Pratapgarh	Rajsamand	Sawai Madhopur	Sikar	Sirohi	Tonk	Udaipur
0	2004-05	GDP (in Rs. Cr.)	5493.87	7742.03	2421.88	2729.69	3213.20	3643.34	6255.18	4160.15	...	4564.14	4836.34	4038.62	NaN	2217.31	2190.92	4363.38	2259.49	2447.85	6627.59
1	2005-06	GDP (in Rs. Cr.)	6592.13	7742.57	2313.26	2952.26	3336.64	3967.70	5692.89	4138.50	...	4857.33	5207.15	4659.98	NaN	2508.67	2355.29	4465.79	2419.54	2517.70	6625.06
2	2006-07	GDP (in Rs. Cr.)	7561.85	9045.13	2365.84	2842.88	3805.29	4350.16	7552.83	4467.51	...	5205.05	5381.59	5528.59	NaN	2918.57	2492.76	5116.44	2613.48	2525.46	7629.19
3	2007-08	GDP (in Rs. Cr.)	8010.04	9357.61	2666.99	3121.79	4039.90	4382.61	7625.84	4843.96	...	5751.70	5743.51	5750.38	NaN	3094.77	2574.80	5259.51	2755.18	2825.51	8013.37
4	2008-09	GDP (in Rs. Cr.)	8153.69	11010.98	2546.75	3159.01	4468.92	4668.91	8628.00	5592.95	...	6009.68	6220.29	5694.15	1869.7	3278.41	2811.15	5879.30	2905.93	3163.00	7777.08
5 rows × 35 columns

........................................

📄 File: gdp_Sikkim.csv (0.00 MB)
Features: ['Year', 'Description', 'East', 'North', 'South', 'West']
Preview:
Year	Description	East	North	South	West
0	1999-00	GDP (in Rs. Cr.)	458.22	61.56	207.05	168.98
1	2000-01	GDP (in Rs. Cr.)	470.61	63.54	252.83	176.90
2	2001-02	GDP (in Rs. Cr.)	512.23	67.43	272.83	187.80
3	2002-03	GDP (in Rs. Cr.)	561.30	70.41	286.49	198.09
4	2003-04	GDP (in Rs. Cr.)	607.36	75.83	308.22	212.42
........................................

📄 File: gdp_Tamilnadu.csv (0.00 MB)
Features: ['Year', 'Description', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Perambalur', 'Pudukkotai', 'Ramanathapuram', 'Salem', 'Sivagangai', 'Thanjavur', 'The Nilgris', 'Theni', 'Thiruchirappalli', 'Thirunelveli', 'Thiruvallur', 'Thiruvannamalai', 'Thiruvarur', 'Thoothukodi', 'Vellore', 'Villupuram', 'Virudhunagar']
Preview:
Year	Description	Chennai	Coimbatore	Cuddalore	Dharmapuri	Dindigul	Erode	Kancheepuram	Kanniyakumari	...	Theni	Thiruchirappalli	Thirunelveli	Thiruvallur	Thiruvannamalai	Thiruvarur	Thoothukodi	Vellore	Villupuram	Virudhunagar
0	1999-00	GDP (in Rs. Cr.)	13215.12	11543.99	4080.01	2316.50	4047.78	6230.11	6845.13	3959.06	...	2047.83	5286.93	5691.77	6577.75	2978.06	1881.35	4008.46	7175.18	3920.93	5155.11
1	2000-01	GDP (in Rs. Cr.)	12725.53	12716.50	4430.56	2432.43	4165.58	6668.52	7305.70	4290.86	...	2080.95	5682.42	5959.43	7411.31	3134.71	2088.30	4316.18	7451.88	3953.02	5956.64
2	2001-02	GDP (in Rs. Cr.)	12460.29	12452.86	4467.29	2406.62	4046.57	6455.33	7528.66	4306.33	...	2107.94	5673.50	5993.78	7274.82	3236.05	1844.91	4264.71	7485.41	4014.59	5593.98
3	2002-03	GDP (in Rs. Cr.)	12812.12	13171.42	4748.73	2496.92	4085.09	6453.43	7477.12	4410.60	...	2053.38	5849.16	6392.60	7729.52	3071.81	1774.79	4349.36	7571.26	3793.90	5615.62
4	2003-04	GDP (in Rs. Cr.)	13831.99	14013.89	5083.57	2522.78	4361.63	6588.51	8162.85	4679.26	...	1967.48	6269.35	6419.58	8327.06	3258.98	1892.60	4612.34	8122.46	4017.80	6087.24
5 rows × 32 columns

........................................

📄 File: gdp_UttarPradesh1.csv (0.01 MB)
Features: ['Year', 'Description', 'Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Auraiyya', 'Azamgarh', 'Badaun', 'Bagpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bijnor', 'BulandShahar', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawa', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautambudh Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hardoi', 'Hath Ras (Mahamaya Nagar)', 'Jalaun', 'Jaunpur', 'Jhansi', 'Jyotiba Phule Nagar', 'Kannauj', 'Kanpur: Rural', 'Kanpur: Urban', 'Kaushambi', 'Kheri', 'Kushi Nagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Rae Bareli', 'Rampur', 'Saharanpur', 'Sant Kabeer Nagar', 'Sant Ravidas Nagar', 'Shahjahanpur', 'Shravasti', 'Siddharth Nagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi']
Preview:
Year	Description	Agra	Aligarh	Allahabad	Ambedkar Nagar	Auraiyya	Azamgarh	Badaun	Bagpat	...	Sant Kabeer Nagar	Sant Ravidas Nagar	Shahjahanpur	Shravasti	Siddharth Nagar	Sitapur	Sonbhadra	Sultanpur	Unnao	Varanasi
0	1999-00	GDP (in Rs. Cr.)	4545.01	3774.32	5230.28	1276.49	1386.52	2667.54	3588.23	1833.61	...	920.60	1687.79	2790.60	664.08	1301.93	2903.55	3766.49	2457.90	2166.72	2753.30
1	2000-01	GDP (in Rs. Cr.)	4372.74	3912.89	5639.85	1364.63	1443.05	2652.50	3244.58	1962.24	...	893.29	1202.50	2586.08	753.78	1283.53	3652.60	3282.83	2572.86	2167.85	3187.34
2	2001-02	GDP (in Rs. Cr.)	4597.93	3719.35	5539.63	1465.87	1113.67	2779.15	3473.48	1923.65	...	952.19	1317.00	2801.91	638.31	1298.97	3465.20	3453.58	2628.82	2389.52	3043.34
3	2002-03	GDP (in Rs. Cr.)	5058.60	4096.34	5621.03	1427.04	1173.62	2622.80	3326.80	2023.61	...	943.93	1291.94	2637.07	557.66	1244.49	3413.50	3939.52	2547.09	3121.87	3249.38
4	2003-04	GDP (in Rs. Cr.)	5421.66	4296.58	6116.85	1605.11	1221.24	2955.54	3587.55	2132.58	...	1052.90	1399.99	2904.23	737.96	1487.36	3748.10	3974.29	2792.68	2747.74	3549.53
5 rows × 72 columns

........................................

📄 File: gdp_UttarPradesh2.csv (0.01 MB)
Features: ['Year', 'Description', ' Agra', ' Aligarh', ' Allahabad', ' Ambedkar Nagar', ' Amethi', ' Amorha', 'Auraiyya', 'Azamgarh', 'Badaun', 'Bagpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bijnor', 'BulandShahar', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawa', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautambudh Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur: Rural', 'Kanpur: Urban', 'Kanshiram Nagar', 'Kaushambi', 'Kheri', 'Kushi Nagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Rae Bareli', 'Rampur', 'Saharanpur', 'Sant Kabeer Nagar', 'Sant Ravidas Nagar', 'Shahjahanpur', 'Shravasti', 'Siddharth Nagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi']
Preview:
Year	Description	Agra	Aligarh	Allahabad	Ambedkar Nagar	Amethi	Amorha	Auraiyya	Azamgarh	...	Sant Kabeer Nagar	Sant Ravidas Nagar	Shahjahanpur	Shravasti	Siddharth Nagar	Sitapur	Sonbhadra	Sultanpur	Unnao	Varanasi
0	2004-05	GDP (in Rs. Cr.)	7,101.89	5,434.82	7,847.18	1,906.25	NaN	3,596.34	1,473.03	3,417.70	...	1,326.62	1,622.83	3,708.07	1,278.24	1,655.23	4,843.20	3,920.12	4,123.21	3,813.71	4,365.39
1	2005-06	GDP (in Rs. Cr.)	7,770.26	5,840.61	8,471.30	2,171.11	NaN	3,667.68	1,632.60	3,992.32	...	1,363.05	1,703.34	3,787.72	1,110.52	2,044.46	4,949.76	4,571.91	3,957.90	4,078.94	4,575.57
2	2006-07	GDP (in Rs. Cr.)	8,441.22	6,382.80	8,776.01	2,341.90	NaN	3,623.49	1,734.42	4,278.19	...	1,267.81	2,140.95	4,113.89	1,316.56	2,101.83	5,627.05	4,459.49	4,013.56	4,285.90	5,132.50
3	2007-08	GDP (in Rs. Cr.)	9,143.43	6,679.98	9,942.38	2,589.13	NaN	3,904.71	2,142.50	4,264.95	...	1,397.01	2,339.56	4,936.29	977.03	2,221.83	6,057.86	4,642.95	4,500.63	4,608.56	4,798.89
4	2008-09	GDP (in Rs. Cr.)	9,684.15	7,230.24	10,481.56	2,864.45	NaN	4,268.96	2,371.08	4,730.12	...	1,584.23	2,494.63	4,464.59	1,124.80	2,340.45	6,091.28	4,989.13	4,830.92	4,874.87	5,207.78
5 rows × 74 columns

........................................

📄 File: gdp_Uttarakhand.csv (0.00 MB)
Features: ['Year', 'Description', 'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradin', 'Garhwal', 'Hardwar', 'Nainital', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi']
Preview:
Year	Description	Almora	Bageshwar	Chamoli	Champawat	Dehradin	Garhwal	Hardwar	Nainital	Pithoragarh	Rudraprayag	Tehri Garhwal	Udham Singh Nagar	Uttarkashi
0	1999-00	GDP (in Rs. Cr.)	712.70	250.85	467.77	270.59	2208.44	818.39	2775.55	1308.70	595.09	233.59	695.92	1938.26	345.05
1	2000-01	GDP (in Rs. Cr.)	788.00	275.73	509.65	292.36	2423.88	918.45	3289.44	1433.44	644.50	258.68	780.11	2157.53	369.23
2	2001-02	GDP (in Rs. Cr.)	839.38	292.09	573.08	307.59	2658.68	983.18	3321.92	1520.77	690.79	277.09	856.60	2210.62	390.80
3	2002-03	GDP (in Rs. Cr.)	894.03	303.34	629.52	329.27	2880.12	1211.15	3800.42	1594.17	738.09	300.24	956.68	2349.22	417.31
4	2003-04	GDP (in Rs. Cr.)	960.21	327.26	669.12	399.52	3155.94	1188.26	4211.85	1729.21	787.95	318.71	1019.73	2423.29	461.98
........................................

📄 File: gdp_WestBengal1.csv (0.00 MB)
Features: ['Year', 'Description', '24-Parganas (North)', '24-Parganas (South)', 'Bankura', 'Birbhum', 'Burdwan', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Kolkata', 'Malda', 'Midnapore East', 'Midnapore West', 'Murshidabad', 'Nadia', 'Purulia', 'Uttar Dinajpur']
Preview:
Year	Description	24-Parganas (North)	24-Parganas (South)	Bankura	Birbhum	Burdwan	Cooch Behar	Dakshin Dinajpur	Darjeeling	...	Howrah	Jalpaiguri	Kolkata	Malda	Midnapore East	Midnapore West	Murshidabad	Nadia	Purulia	Uttar Dinajpur
0	1999-00	GDP (in Rs. Cr.)	15562.52	10832.00	4818.90	4202.33	13752.99	3314.49	2139.41	3161.08	...	7134.42	5678.25	12694.24	4962.28	NaN	NaN	8344.50	7717.23	3498.33	2775.15
1	2000-01	GDP (in Rs. Cr.)	15657.24	11642.44	5148.45	4321.78	13985.62	3493.40	2308.37	3345.29	...	7775.37	5752.21	13752.13	5102.18	NaN	NaN	8468.40	7528.34	3556.12	2933.66
2	2001-02	GDP (in Rs. Cr.)	17063.59	12368.28	5470.17	4793.78	15106.32	3605.88	2402.20	3619.14	...	8265.25	6034.82	14519.60	5661.32	NaN	NaN	9429.73	8290.85	3922.45	2956.28
3	2002-03	GDP (in Rs. Cr.)	18457.53	13134.97	5284.58	4901.46	15555.46	3655.37	2534.38	3811.61	...	8944.09	6375.21	15546.60	5366.47	9405.30	8049.12	9541.89	8715.07	3708.93	3182.76
4	2003-04	GDP (in Rs. Cr.)	19549.85	13068.04	5416.59	5090.41	16886.36	4038.88	2574.14	3961.31	...	8974.61	6594.77	16291.08	5707.38	11139.68	8387.97	10413.02	8885.56	3889.71	3427.25
5 rows × 21 columns

........................................

📄 File: gdp_WestBengal2.csv (0.00 MB)
Features: ['Year', 'Description', '24-Parganas (North)', '24-Parganas (South)', 'Bankura', 'Birbhum', 'Burdwan', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Kolkata', 'Malda', 'Midnapore East', 'Midnapore West', 'Murshidabad', 'Nadia', 'Purulia', 'Uttar Dinajpur']
Preview:
Year	Description	24-Parganas (North)	24-Parganas (South)	Bankura	Birbhum	Burdwan	Cooch Behar	Dakshin Dinajpur	Darjeeling	...	Howrah	Jalpaiguri	Kolkata	Malda	Midnapore East	Midnapore West	Murshidabad	Nadia	Purulia	Uttar Dinajpur
0	2004-05	GDP (in Rs. Cr.)	24416.69	16884.94	6625.78	5924.68	22357.47	5066.53	3048.61	4960.24	...	11614.02	7948.42	19725.04	7162.25	16728.73	10889.90	12332.96	10628.30	4833.75	3895.05
1	2005-06	GDP (in Rs. Cr.)	27157.76	17443.65	7253.88	6436.33	22946.58	5357.48	3208.83	5408.76	...	12286.07	8174.99	21809.83	7405.23	16672.62	11506.06	13377.28	11332.29	5051.76	4286.99
2	2006-07	GDP (in Rs. Cr.)	29049.04	19623.98	7677.04	7044.16	25482.48	5439.69	3301.60	5809.29	...	13591.92	9029.66	23642.98	7876.82	18089.79	12359.28	14250.25	11907.09	5508.84	4427.94
3	2007-08	GDP (in Rs. Cr.)	32131.75	21026.40	8279.19	7475.61	26731.47	5921.95	3543.92	6168.89	...	14575.03	9616.55	25456.57	8463.37	19169.64	13502.63	15418.77	12902.15	5832.06	4811.32
4	2008-09	GDP (in Rs. Cr.)	34747.10	21652.35	8501.46	7735.64	27463.67	6086.57	3667.88	6963.20	...	15255.97	10147.32	27157.46	8834.46	20441.05	13638.37	15673.97	13582.01	6107.54	5103.75
5 rows × 21 columns

........................................

📄 File: india-districts-census-2011.csv (0.43 MB)
Features: ['District code', 'State Name', 'District name', 'Population', 'Male', 'Female', 'Literate', 'Male_Literate', 'Female_Literate', 'SC', 'Male_SC', 'Female_SC', 'ST', 'Male_ST', 'Female_ST', 'Workers', 'Male_Workers', 'Female_Workers', 'Main_Workers', 'Marginal_Workers', 'Non_Workers', 'Cultivator_Workers', 'Agricultural_Workers', 'Household_Workers', 'Other_Workers', 'Hindus', 'Muslims', 'Christians', 'Sikhs', 'Buddhists', 'Jains', 'Others_Religions', 'Religion_Not_Stated', 'LPG_or_PNG_Households', 'Housholds_with_Electric_Lighting', 'Households_with_Internet', 'Households_with_Computer', 'Rural_Households', 'Urban_Households', 'Households', 'Below_Primary_Education', 'Primary_Education', 'Middle_Education', 'Secondary_Education', 'Higher_Education', 'Graduate_Education', 'Other_Education', 'Literate_Education', 'Illiterate_Education', 'Total_Education', 'Age_Group_0_29', 'Age_Group_30_49', 'Age_Group_50', 'Age not stated', 'Households_with_Bicycle', 'Households_with_Car_Jeep_Van', 'Households_with_Radio_Transistor', 'Households_with_Scooter_Motorcycle_Moped', 'Households_with_Telephone_Mobile_Phone_Landline_only', 'Households_with_Telephone_Mobile_Phone_Mobile_only', 'Households_with_TV_Computer_Laptop_Telephone_mobile_phone_and_Scooter_Car', 'Households_with_Television', 'Households_with_Telephone_Mobile_Phone', 'Households_with_Telephone_Mobile_Phone_Both', 'Condition_of_occupied_census_houses_Dilapidated_Households', 'Households_with_separate_kitchen_Cooking_inside_house', 'Having_bathing_facility_Total_Households', 'Having_latrine_facility_within_the_premises_Total_Households', 'Ownership_Owned_Households', 'Ownership_Rented_Households', 'Type_of_bathing_facility_Enclosure_without_roof_Households', 'Type_of_fuel_used_for_cooking_Any_other_Households', 'Type_of_latrine_facility_Pit_latrine_Households', 'Type_of_latrine_facility_Other_latrine_Households', 'Type_of_latrine_facility_Night_soil_disposed_into_open_drain_Households', 'Type_of_latrine_facility_Flush_pour_flush_latrine_connected_to_other_system_Households', 'Not_having_bathing_facility_within_the_premises_Total_Households', 'Not_having_latrine_facility_within_the_premises_Alternative_source_Open_Households', 'Main_source_of_drinking_water_Un_covered_well_Households', 'Main_source_of_drinking_water_Handpump_Tubewell_Borewell_Households', 'Main_source_of_drinking_water_Spring_Households', 'Main_source_of_drinking_water_River_Canal_Households', 'Main_source_of_drinking_water_Other_sources_Households', 'Main_source_of_drinking_water_Other_sources_Spring_River_Canal_Tank_Pond_Lake_Other_sources__Households', 'Location_of_drinking_water_source_Near_the_premises_Households', 'Location_of_drinking_water_source_Within_the_premises_Households', 'Main_source_of_drinking_water_Tank_Pond_Lake_Households', 'Main_source_of_drinking_water_Tapwater_Households', 'Main_source_of_drinking_water_Tubewell_Borehole_Households', 'Household_size_1_person_Households', 'Household_size_2_persons_Households', 'Household_size_1_to_2_persons', 'Household_size_3_persons_Households', 'Household_size_3_to_5_persons_Households', 'Household_size_4_persons_Households', 'Household_size_5_persons_Households', 'Household_size_6_8_persons_Households', 'Household_size_9_persons_and_above_Households', 'Location_of_drinking_water_source_Away_Households', 'Married_couples_1_Households', 'Married_couples_2_Households', 'Married_couples_3_Households', 'Married_couples_3_or_more_Households', 'Married_couples_4_Households', 'Married_couples_5__Households', 'Married_couples_None_Households', 'Power_Parity_Less_than_Rs_45000', 'Power_Parity_Rs_45000_90000', 'Power_Parity_Rs_90000_150000', 'Power_Parity_Rs_45000_150000', 'Power_Parity_Rs_150000_240000', 'Power_Parity_Rs_240000_330000', 'Power_Parity_Rs_150000_330000', 'Power_Parity_Rs_330000_425000', 'Power_Parity_Rs_425000_545000', 'Power_Parity_Rs_330000_545000', 'Power_Parity_Above_Rs_545000', 'Total_Power_Parity']
Preview:
District code	State Name	District name	Population	Male	Female	Literate	Male_Literate	Female_Literate	SC	...	Power_Parity_Rs_90000_150000	Power_Parity_Rs_45000_150000	Power_Parity_Rs_150000_240000	Power_Parity_Rs_240000_330000	Power_Parity_Rs_150000_330000	Power_Parity_Rs_330000_425000	Power_Parity_Rs_425000_545000	Power_Parity_Rs_330000_545000	Power_Parity_Above_Rs_545000	Total_Power_Parity
0	1	JAMMU AND KASHMIR	Kupwara	870354	474190	396164	439654	282823	156831	1048	...	94	588	71	101	172	74	10	84	15	1119
1	2	JAMMU AND KASHMIR	Badgam	753745	398041	355704	335649	207741	127908	368	...	126	562	72	89	161	96	28	124	18	1066
2	3	JAMMU AND KASHMIR	Leh(Ladakh)	133487	78971	54516	93770	62834	30936	488	...	46	122	15	22	37	20	14	34	17	242
3	4	JAMMU AND KASHMIR	Kargil	140802	77785	63017	86236	56301	29935	18	...	27	114	12	18	30	19	3	22	7	214
4	5	JAMMU AND KASHMIR	Punch	476835	251899	224936	261724	163333	98391	556	...	78	346	35	50	85	59	8	67	12	629
5 rows × 118 columns

........................................

📄 File: india_census_housing-hlpca-full.csv (1.24 MB)
Features: ['State Code', 'State Name', 'District code', 'District Name', 'Tehsil Code', 'Tehsil Name', 'Town Code/Village code', 'Ward No', 'Area Name', 'Rural/Urban', 'Total Number of households', 'Total Number of Good', 'Total Number of Livable', 'Total Number of Dilapidated', 'Total Number of Residence households', 'Total Number of Residence Good', 'Total Number of Residence Livable', 'Total Number of Residence Dilapidated', 'Total Number of Residence cum other', 'Number of Residence cum Good', 'Residence_cum_Livable', 'Residence_cum_Dilapidated', 'Material_Roof_GTBW', 'Material_Roof_PP', 'Material_Roof_HMT', 'Material_Roof_MMT', 'Material_Roof_BB', 'Material_Roof_SS', 'Material_Roof_GMAS', 'Material_Roof_Concrete', 'Material_Roof_AOM', 'Material_Roof_GTB', 'Material_Roof_PP1', 'Material_Roof_MUB', 'Material_Roof_Wood', 'Material_Wall_SNPWM', 'Material_Wall_SPWM', 'Material_Wall_GIMAS', 'Material_Wall_Bb', 'Material_Wall_Concrete', 'Material_Wall_AOM', 'Material_Floor_Mud', 'Material_Floor_WB', 'Material_Floor_BB', 'Material_Floor_Stone', 'Material_Floor_Cement', 'Material_Floor_MF', 'Material_Floor_AOM', 'Dwelling_R_NER', 'Dwelling_R_OR', 'Dwelling_R_TR', 'Dwelling_R_TH_R', 'Dwelling_R_FR', 'Dwelling_R_FI_R', 'Dwelling_R_SRA', 'H_size_1', 'H_size_2', 'H_size_3', 'H_size_4', 'H_size_5', 'H_size_6_8', 'H_size_9', 'O_status_O', 'O_status_R', 'O_status_AO', 'Married_C_N', 'Married_C_1', 'Married_C_2', 'Married_C_3', 'Married_C_4', 'Married_C_5', 'DW_TFTS', 'DW_TFUS', 'DW_CW', 'DW_UW', 'DW_Handpump', 'DW_TB', 'DW_Spring', 'DW_RC', 'DW_TPL', 'DW_OS', 'Within_premises', 'Near_premises', 'Away', 'MSL_Electricty', 'MSL_Kerosene', 'MSL_SE', 'MSL_OO', 'MSL_AO', 'MSL_NL', 'Latrine_premise', 'Latrine_PSS', 'Latrine_ST', 'Latrine_OS', 'Pit_latrine_SVI', 'Pit_latrine_SOP', 'disposed_drain', 'Service_Latrine_NRH', 'Service_Latrine_NSA', 'H_latrine_premoses', 'Alternative_Source', 'Alternative_Source_Open', 'Households_Bathroom', 'Households_EWR', 'Households_No', 'Waste_water_CD', 'Waste_water_OD', 'Waste_water_ND', 'Cooking_FW', 'Cooking_CR', 'Cooking_CC', 'Cooking_CLC', 'Cooking_kerosene', 'Cooking_LPG_PNG', 'Cooking_Electricity', 'Cooking_Biogas', 'Cooking_AO', 'Cooking_NC', 'Total', 'Cooking_IH', 'Has_kitchen', 'DNHK', 'Cooking_OH', 'has_kitchen1', 'DNH_Kitchen', 'No_Cooking', 'TNHAB', 'assets_RT', 'assets_Tel', 'assets_CL_WI', 'assets_CLWI', 'assets_TM_LO', 'assets_TM_MO', 'assets_TM_Both', 'assets_Bicycle', 'assets_SMM', 'assets_CJV', 'Household_TV_LP', 'None_AS', 'Permanents', 'Semi_Permanent', 'Total_Temporary', 'Serviceable', 'Non_Serviceable', 'Unclassifiable', 'TC_VC', 'Contition_T_Total', 'Contition_T_Good', 'Contition_T_Livable', 'Contition_T_Dilapidated', 'Contition_R_Total', 'Residence_Good', 'Residence_Livable', 'Residence_Dilapidated', 'Residence_cum_other', 'Residence_cum_Good']
Preview:
State Code	State Name	District code	District Name	Tehsil Code	Tehsil Name	Town Code/Village code	Ward No	Area Name	Rural/Urban	...	Contition_T_Total	Contition_T_Good	Contition_T_Livable	Contition_T_Dilapidated	Contition_R_Total	Residence_Good	Residence_Livable	Residence_Dilapidated	Residence_cum_other	Residence_cum_Good
0	1	JAMMU & KASHMIR	1	Kupwara	0	Kupwara	0	0	District - Kupwara	Rural	...	100	33.6	58.1	8.3	90.9	32.7	51.0	7.2	9.1	1.0
1	1	JAMMU & KASHMIR	1	Kupwara	0	Kupwara	0	0	District - Kupwara	Total	...	100	34.8	57.3	7.9	91.0	33.8	50.2	6.9	9.0	0.9
2	1	JAMMU & KASHMIR	1	Kupwara	0	Kupwara	0	0	District - Kupwara	Urban	...	100	45.7	49.5	4.8	91.8	45.0	42.2	4.5	8.2	0.7
3	1	JAMMU & KASHMIR	2	Badgam	0	Badgam	0	0	District - Badgam	Rural	...	100	49.7	46.3	3.9	97.2	49.0	44.5	3.7	2.8	0.7
4	1	JAMMU & KASHMIR	2	Badgam	0	Badgam	0	0	District - Badgam	Total	...	100	51.6	44.7	3.8	97.3	50.8	43.0	3.5	2.7	0.8
5 rows × 156 columns

........................................

📄 File: district_centroids.csv (0.03 MB)
Features: ['State', 'District', 'Latitude', 'Longitude']
Preview:
State	District	Latitude	Longitude
0	Andaman and Nicobar	Andaman Islands	12.382571	92.822911
1	Andaman and Nicobar	Nicobar Islands	7.835291	93.511601
2	Andhra Pradesh	Adilabad	19.284514	78.813212
3	Andhra Pradesh	Anantapur	14.312066	77.460158
4	Andhra Pradesh	Chittoor	13.331093	78.927639
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/tourism
------------------------------------------------------------

📄 File: Expanded_Indian_Travel_Dataset.csv (0.01 MB)
Features: ['Destination Name', 'State', 'Region', 'Category', 'Popular Attraction', 'Accessibility', 'Nearest Airport', 'Nearest Railway Station']
Preview:
Destination Name	State	Region	Category	Popular Attraction	Accessibility	Nearest Airport	Nearest Railway Station
0	Taj Mahal	Uttar Pradesh	North	Heritage	Taj Mahal	Easy	Agra Civil Enclave	Agra Cantt
1	Jaipur	Rajasthan	West	Heritage	Amber Fort	Easy	Jaipur International	Jaipur Junction
2	Goa	Goa	West	Beach	Calangute Beach	Easy	Dabolim Airport	Madgaon Railway Station
3	Kerala Backwaters	Kerala	South	Nature	Vembanad Lake	Moderate	Cochin International	Alleppey
4	Varanasi	Uttar Pradesh	North	Religious	Ghats of Varanasi	Moderate	Lal Bahadur Shastri	Varanasi Junction
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/fire
---------------------------------------------------------

📄 File: fire_archive_M6_107977.csv (47.12 MB)
Features: ['latitude', 'longitude', 'brightness', 'scan', 'track', 'acq_date', 'acq_time', 'satellite', 'instrument', 'confidence', 'version', 'bright_t31', 'frp', 'daynight', 'type']
Preview:
latitude	longitude	brightness	scan	track	acq_date	acq_time	satellite	instrument	confidence	version	bright_t31	frp	daynight	type
0	28.9809	95.8007	302.0	1.1	1.1	2012-02-01	415	Terra	MODIS	36	6.2	287.5	7.0	D	0
1	28.7101	96.1729	300.6	1.1	1.0	2012-02-01	415	Terra	MODIS	33	6.2	290.3	6.6	D	0
2	27.6070	95.4095	303.8	1.1	1.1	2012-02-01	415	Terra	MODIS	53	6.2	293.5	4.3	D	2
3	25.2385	92.6665	307.0	1.5	1.2	2012-02-01	416	Terra	MODIS	65	6.2	291.2	12.8	D	0
4	26.5743	94.9541	300.6	1.1	1.1	2012-02-01	416	Terra	MODIS	24	6.2	290.5	4.0	D	0
........................................

📄 File: fire_archive_V1_107978.csv (307.92 MB)
Features: ['latitude', 'longitude', 'bright_ti4', 'scan', 'track', 'acq_date', 'acq_time', 'satellite', 'instrument', 'confidence', 'version', 'bright_ti5', 'frp', 'type']
Preview:
latitude	longitude	bright_ti4	scan	track	acq_date	acq_time	satellite	instrument	confidence	version	bright_ti5	frp	type
0	14.39203	79.42780	348.9	0.79	0.78	2012-02-01	700	N	VIIRS	n	1	293.0	11.3	0
1	20.95687	85.14624	336.0	0.51	0.49	2012-02-01	701	N	VIIRS	n	1	296.2	6.6	2
2	18.63880	82.57373	341.1	0.41	0.61	2012-02-01	701	N	VIIRS	n	1	293.4	5.9	0
3	18.44791	80.55879	367.0	0.55	0.68	2012-02-01	701	N	VIIRS	h	1	292.2	15.1	0
4	18.45420	80.55756	347.7	0.55	0.68	2012-02-01	701	N	VIIRS	n	1	292.7	14.3	0
........................................

📄 File: fire_nrt_M6_107977.csv (0.21 MB)
Features: ['latitude', 'longitude', 'brightness', 'scan', 'track', 'acq_date', 'acq_time', 'satellite', 'instrument', 'confidence', 'version', 'bright_t31', 'frp', 'daynight']
Preview:
latitude	longitude	brightness	scan	track	acq_date	acq_time	satellite	instrument	confidence	version	bright_t31	frp	daynight
0	28.128	96.994	301.4	1.7	1.3	2020-01-01	355	Terra	MODIS	40	6.0NRT	278.8	15.3	D
1	33.183	74.077	301.5	1.5	1.2	2020-01-01	530	Terra	MODIS	48	6.0NRT	280.6	12.3	D
2	25.267	75.696	305.9	1.0	1.0	2020-01-01	535	Terra	MODIS	57	6.0NRT	289.3	6.2	D
3	30.153	80.239	301.9	1.1	1.0	2020-01-01	535	Terra	MODIS	41	6.0NRT	274.5	7.3	D
4	25.266	75.706	315.3	1.0	1.0	2020-01-01	535	Terra	MODIS	76	6.0NRT	289.3	13.4	D
........................................

📄 File: fire_nrt_V1_107978.csv (9.15 MB)
Features: ['latitude', 'longitude', 'bright_ti4', 'scan', 'track', 'acq_date', 'acq_time', 'satellite', 'instrument', 'confidence', 'version', 'bright_ti5', 'frp', 'daynight']
Preview:
latitude	longitude	bright_ti4	scan	track	acq_date	acq_time	satellite	instrument	confidence	version	bright_ti5	frp	daynight
0	15.37417	79.30948	336.8	0.37	0.58	2019-10-01	718	N	VIIRS	n	1.0NRT	296.8	1.8	D
1	20.88638	84.98295	329.9	0.43	0.38	2019-10-01	718	N	VIIRS	n	1.0NRT	292.5	3.9	D
2	23.78236	86.39207	351.3	0.39	0.36	2019-10-01	718	N	VIIRS	n	1.0NRT	300.6	6.6	D
3	22.79004	86.19753	330.7	0.39	0.36	2019-10-01	718	N	VIIRS	n	1.0NRT	299.1	3.1	D
4	15.51254	79.84681	334.4	0.34	0.56	2019-10-01	718	N	VIIRS	n	1.0NRT	296.7	2.1	D
........................................

Directory: /content/drive/MyDrive/yatrax-ml/data/raw/noise
----------------------------------------------------------

📄 File: station_month.csv (0.13 MB)
Features: ['Station', 'Year', 'Month', 'Day', 'Night', 'DayLimit', 'NightLimit']
Preview:
Station	Year	Month	Day	Night	DayLimit	NightLimit
0	BEN01	2011	2	66	56	55	45
1	BEN01	2011	3	66	58	55	45
2	BEN01	2011	4	66	57	55	45
3	BEN01	2011	5	66	56	55	45
4	BEN01	2011	6	67	57	55	45
........................................

📄 File: stations.csv (0.00 MB)
Features: ['Station', 'Name', 'City', 'State', 'Type']
Preview:
Station	Name	City	State	Type
0	DEL01	Dilshad Garden	Delhi	Delhi	Silence
1	DEL02	CPCB, HQ	Delhi	Delhi	Commercial
2	DEL03	DCE, Bawana	Delhi	Delhi	Silence
3	DEL04	ITO	Delhi	Delhi	Commercial
4	DEL05	NSIT, Dwarka	Delhi	Delhi	Silence
........................................
