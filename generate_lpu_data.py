"""
Generate dense synthetic training data focused on LPU, Haveli, Khajurla, Kajrula,
Phagwara, and Jalandhar. Run once — appends to SafarSathi_Punjab_Data.csv.
"""
import csv
import random
from datetime import datetime, timedelta

random.seed(99)

INCIDENT_TYPES = [
    "Robbery", "Theft", "Road Accident", "Assault", "Harassment",
    "Vandalism", "Chain Snatching", "Vehicle Theft", "Eve Teasing",
    "Suspicious Activity", "Trespassing", "Drunk Driving",
]

# Each zone: lat_range, lon_range, base_danger (day), night_boost, samples
ZONES = [
    # ── LPU immediate ──────────────────────────────────────────────────────
    {"name": "lpu_front_gate",     "lat": (31.2548, 31.2562), "lon": (75.7040, 75.7056),
     "day": 0.55, "night": 0.20, "n": 160},
    {"name": "lpu_main_gate_crossing", "lat": (31.2516, 31.2528), "lon": (75.7053, 75.7065),
     "day": 0.58, "night": 0.22, "n": 120},
    {"name": "lpu_campus_interior","lat": (31.2530, 31.2600), "lon": (75.7055, 75.7125),
     "day": 0.10, "night": 0.06, "n": 140},
    {"name": "lpu_back_gate",      "lat": (31.2595, 31.2615), "lon": (75.7120, 75.7150),
     "day": 0.42, "night": 0.28, "n": 130},
    {"name": "lpu_west_boundary",  "lat": (31.2580, 31.2605), "lon": (75.6960, 75.7010),
     "day": 0.35, "night": 0.28, "n": 120},
    {"name": "lpu_side_road_haveli","lat": (31.2555, 31.2575), "lon": (75.6885, 75.6915),
     "day": 0.38, "night": 0.30, "n": 130},

    # ── Law Gate ────────────────────────────────────────────────────────────
    {"name": "law_gate_market",    "lat": (31.2570, 31.2592), "lon": (75.6998, 75.7025),
     "day": 0.48, "night": 0.28, "n": 180},
    {"name": "law_gate_road",      "lat": (31.2555, 31.2580), "lon": (75.6975, 75.7000),
     "day": 0.40, "night": 0.25, "n": 140},

    # ── Haveli area ─────────────────────────────────────────────────────────
    {"name": "haveli_khajurla_cross","lat": (31.2618, 31.2645), "lon": (75.6795, 75.6825),
     "day": 0.38, "night": 0.42, "n": 180},
    {"name": "haveli_village_roads","lat": (31.2600, 31.2632), "lon": (75.6730, 75.6790),
     "day": 0.30, "night": 0.38, "n": 160},
    {"name": "haveli_inner_lanes",  "lat": (31.2585, 31.2620), "lon": (75.6700, 75.6760),
     "day": 0.25, "night": 0.35, "n": 140},

    # ── Khajurla area ───────────────────────────────────────────────────────
    {"name": "khajurla_village_road","lat": (31.2640, 31.2675), "lon": (75.6835, 75.6880),
     "day": 0.40, "night": 0.42, "n": 180},
    {"name": "khajurla_fields_road","lat": (31.2655, 31.2690), "lon": (75.6850, 75.6900),
     "day": 0.38, "night": 0.40, "n": 160},
    {"name": "khajurla_outer",      "lat": (31.2680, 31.2710), "lon": (75.6820, 75.6870),
     "day": 0.28, "night": 0.35, "n": 130},

    # ── Kajrula area ────────────────────────────────────────────────────────
    {"name": "kajrula_road",        "lat": (31.2605, 31.2640), "lon": (75.6900, 75.6960),
     "day": 0.32, "night": 0.35, "n": 150},
    {"name": "kajrula_village",     "lat": (31.2625, 31.2660), "lon": (75.6960, 75.7010),
     "day": 0.28, "night": 0.30, "n": 130},

    # ── GT Road / NH44 ──────────────────────────────────────────────────────
    {"name": "gt_road_lpu_phagwara","lat": (31.2390, 31.2560), "lon": (75.7050, 75.7400),
     "day": 0.50, "night": 0.30, "n": 200},
    {"name": "rurka_kalan_stretch", "lat": (31.2060, 31.2200), "lon": (75.7860, 75.8050),
     "day": 0.45, "night": 0.30, "n": 150},

    # ── Chaheru / Phagwara ──────────────────────────────────────────────────
    {"name": "chaheru_crossing",    "lat": (31.2445, 31.2478), "lon": (75.7215, 75.7255),
     "day": 0.33, "night": 0.28, "n": 140},
    {"name": "phagwara_station",    "lat": (31.2200, 31.2248), "lon": (75.7655, 75.7700),
     "day": 0.40, "night": 0.22, "n": 140},
    {"name": "phagwara_market",     "lat": (31.2210, 31.2360), "lon": (75.7470, 75.7630),
     "day": 0.38, "night": 0.20, "n": 160},
    {"name": "phagwara_industrial", "lat": (31.2100, 31.2200), "lon": (75.7860, 75.8010),
     "day": 0.48, "night": 0.32, "n": 130},

    # ── Jalandhar ───────────────────────────────────────────────────────────
    {"name": "jalandhar_bus_stand", "lat": (31.3110, 31.3180), "lon": (75.5910, 75.5985),
     "day": 0.58, "night": 0.22, "n": 160},
    {"name": "rama_mandi",          "lat": (31.2860, 31.2912), "lon": (75.6108, 75.6163),
     "day": 0.52, "night": 0.24, "n": 150},
    {"name": "jyoti_chowk",         "lat": (31.3225, 31.3295), "lon": (75.5728, 75.5800),
     "day": 0.45, "night": 0.20, "n": 140},
    {"name": "model_town_jld",      "lat": (31.3055, 31.3125), "lon": (75.5605, 75.5685),
     "day": 0.40, "night": 0.22, "n": 130},
    {"name": "jalandhar_cantt_stn", "lat": (31.2908, 31.2965), "lon": (75.6288, 75.6358),
     "day": 0.35, "night": 0.28, "n": 130},
    {"name": "focal_point_jld",     "lat": (31.2930, 31.3002), "lon": (75.6158, 75.6250),
     "day": 0.42, "night": 0.22, "n": 120},
    {"name": "kapurthala_road_iso", "lat": (31.3490, 31.3610), "lon": (75.4590, 75.4710),
     "day": 0.35, "night": 0.35, "n": 120},
]

# Realistic hour distribution (students more active 8-22)
HOUR_WEIGHTS = [2,2,2,2,2,3, 5,7,9,8,7,7, 7,7,7,7,8,9, 9,9,8,7,5,3]


def hour_multiplier(hour: int) -> float:
    if 22 <= hour or hour <= 4:  return 1.55
    if 5  <= hour <= 6:          return 1.20
    if 7  <= hour <= 9:          return 0.90
    if 10 <= hour <= 16:         return 0.75
    if 17 <= hour <= 19:         return 1.10
    if 20 <= hour <= 21:         return 1.30
    return 1.0


def compute_danger(base: float, night_boost: float, hour: int) -> float:
    is_night = (hour >= 21 or hour <= 5)
    mult = hour_multiplier(hour)
    if is_night:
        score = base + night_boost * random.uniform(0.75, 1.25)
    else:
        score = base * mult
    score += random.gauss(0, 0.05)
    return round(max(0.0, min(1.0, score)), 4)


def random_date() -> str:
    start = datetime(2024, 1, 1)
    delta = timedelta(
        days=random.randint(0, 730),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )
    return str(start + delta)


# Determine which district a zone belongs to based on lat
def guess_district(lat: float, name: str) -> str:
    if "jld" in name or "jalandhar" in name or "rama_mandi" in name or "focal" in name:
        return "Jalandhar"
    if "kapurthala" in name:
        return "Kapurthala"
    return "Kapurthala"   # LPU, Phagwara, Haveli, Khajurla all Kapurthala district


rows = []
for zone in ZONES:
    district = guess_district(zone["lat"][0], zone["name"])
    for _ in range(zone["n"]):
        lat  = random.uniform(*zone["lat"])
        lon  = random.uniform(*zone["lon"])
        hour = random.choices(range(24), weights=HOUR_WEIGHTS, k=1)[0]
        danger = compute_danger(zone["day"], zone["night"], hour)
        rows.append({
            "Timestamp":    random_date(),
            "District":     district,
            "Latitude":     round(lat, 8),
            "Longitude":    round(lon, 8),
            "Incident_Type": random.choice(INCIDENT_TYPES),
            "Hour":         hour,
            "Danger_Score": danger,
        })

csv_path = "E:/GitHub/SafarSathi/SafarSathi_Punjab_Data.csv"
with open(csv_path, "a", newline="") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=["Timestamp","District","Latitude","Longitude","Incident_Type","Hour","Danger_Score"],
    )
    writer.writerows(rows)

print(f"Appended {len(rows)} rows.")

# Coverage check
checks = {
    "LPU front gate":     lambda r: 31.2548 <= r["Latitude"] <= 31.2562 and 75.7040 <= r["Longitude"] <= 75.7056,
    "Law Gate market":    lambda r: 31.2570 <= r["Latitude"] <= 31.2592 and 75.6998 <= r["Longitude"] <= 75.7025,
    "Haveli area":        lambda r: 31.2585 <= r["Latitude"] <= 31.2645 and 75.6700 <= r["Longitude"] <= 75.6825,
    "Khajurla area":      lambda r: 31.2640 <= r["Latitude"] <= 31.2710 and 75.6820 <= r["Longitude"] <= 75.6900,
    "Kajrula road":       lambda r: 31.2605 <= r["Latitude"] <= 31.2660 and 75.6900 <= r["Longitude"] <= 75.7010,
    "Phagwara station":   lambda r: 31.2200 <= r["Latitude"] <= 31.2248 and 75.7655 <= r["Longitude"] <= 75.7700,
    "Jalandhar bus stand":lambda r: 31.3110 <= r["Latitude"] <= 31.3180 and 75.5910 <= r["Longitude"] <= 75.5985,
}
for label, fn in checks.items():
    count = sum(1 for r in rows if fn(r))
    print(f"  {label:28s} {count:4d} rows")
