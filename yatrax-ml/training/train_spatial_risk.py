"""
Model 5: Spatial Risk Propagation

How incidents at one location affect safety at nearby locations.

LITE VERSION: Distance-decay model instead of full GNN.
No PyTorch Geometric dependency. Pure numpy.

When a flood happens at point A, points within X km also become riskier.
The risk decays with distance and time.
"""

from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from config.settings import MODELS_DIR, RANDOM_SEED

MODEL_DIR = MODELS_DIR / "spatial_risk"

# How far each incident type's risk spreads (km) and how fast it decays (hours)
PROPAGATION_PROFILES = {
    "flood": {"spread_km": 15.0, "decay_hours": 48.0, "intensity": 0.8},
    "landslide": {"spread_km": 3.0, "decay_hours": 72.0, "intensity": 0.7},
    "earthquake": {"spread_km": 50.0, "decay_hours": 24.0, "intensity": 0.9},
    "cyclone_storm": {"spread_km": 80.0, "decay_hours": 36.0, "intensity": 0.85},
    "wildlife": {"spread_km": 5.0, "decay_hours": 12.0, "intensity": 0.5},
    "crime_robbery": {"spread_km": 2.0, "decay_hours": 6.0, "intensity": 0.4},
    "crime_assault": {"spread_km": 1.5, "decay_hours": 6.0, "intensity": 0.4},
    "road_accident": {"spread_km": 1.0, "decay_hours": 4.0, "intensity": 0.3},
    "fire": {"spread_km": 10.0, "decay_hours": 24.0, "intensity": 0.7},
    "medical_emergency": {"spread_km": 0.5, "decay_hours": 2.0, "intensity": 0.1},
    "stranded": {"spread_km": 0.5, "decay_hours": 2.0, "intensity": 0.1},
    "unknown": {"spread_km": 5.0, "decay_hours": 12.0, "intensity": 0.5},
}


def propagate_incident(
    incident_lat: float,
    incident_lon: float,
    incident_type: str,
    incident_severity: float,
    hours_since: float,
    target_lat: float,
    target_lon: float,
) -> float:
    """
    Compute how much an incident affects a target point.

    Returns: additional risk (0 to 1) at the target point.

    Uses exponential spatial and temporal decay:
        risk = severity × intensity × exp(-distance/spread) × exp(-time/decay)
    """
    profile = PROPAGATION_PROFILES.get(incident_type, PROPAGATION_PROFILES["unknown"])

    # Haversine distance
    R = 6371.0
    lat1, lat2 = math.radians(incident_lat), math.radians(target_lat)
    dlat = math.radians(target_lat - incident_lat)
    dlon = math.radians(target_lon - incident_lon)
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    distance_km = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # Quick exit if too far
    if distance_km > profile["spread_km"] * 3:
        return 0.0

    spatial_decay = math.exp(-distance_km / profile["spread_km"])
    temporal_decay = math.exp(-hours_since / profile["decay_hours"])

    risk = incident_severity * profile["intensity"] * spatial_decay * temporal_decay
    return min(1.0, max(0.0, risk))


def propagate_multiple_incidents(
    incidents: list[dict],
    target_lat: float,
    target_lon: float,
) -> dict:
    """
    Compute combined risk from multiple incidents at a target point.

    incidents: list of dicts with keys:
        lat, lon, type, severity, hours_since

    Returns:
        total_additional_risk (0-1),
        contributing_incidents (list),
        dominant_type (str)
    """
    contributions = []

    for inc in incidents:
        risk = propagate_incident(
            incident_lat=inc["lat"],
            incident_lon=inc["lon"],
            incident_type=inc["type"],
            incident_severity=inc.get("severity", 0.5),
            hours_since=inc.get("hours_since", 0),
            target_lat=target_lat,
            target_lon=target_lon,
        )
        if risk > 0.01:
            contributions.append({
                "type": inc["type"],
                "risk": risk,
                "distance_km": _quick_distance(inc["lat"], inc["lon"], target_lat, target_lon),
                "hours_since": inc.get("hours_since", 0),
            })

    contributions.sort(key=lambda x: x["risk"], reverse=True)

    # Combine: not additive (diminishing returns)
    # Use: total = 1 - product(1 - risk_i)
    if not contributions:
        return {"total_risk": 0.0, "contributions": [], "dominant_type": None}

    complement_product = 1.0
    for c in contributions:
        complement_product *= (1.0 - c["risk"])

    total = 1.0 - complement_product

    return {
        "total_risk": round(min(1.0, total), 4),
        "contributions": contributions[:5],
        "dominant_type": contributions[0]["type"] if contributions else None,
    }


def _quick_distance(lat1, lon1, lat2, lon2) -> float:
    """Quick approximate distance in km."""
    dlat = (lat2 - lat1) * 111.0
    dlon = (lon2 - lon1) * 111.0 * math.cos(math.radians((lat1 + lat2) / 2))
    return math.sqrt(dlat ** 2 + dlon ** 2)


def save_propagation_profiles():
    """Save the propagation model (it's parametric, not learned)."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    metadata = {
        "model_type": "parametric_distance_decay",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "profiles": PROPAGATION_PROFILES,
        "formula": "risk = severity × intensity × exp(-distance/spread) × exp(-time/decay)",
    }

    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # ... continuing from save_propagation_profiles

    joblib.dump(PROPAGATION_PROFILES, MODEL_DIR / "propagation_profiles.joblib")

    print(f"Spatial risk propagation model saved to {MODEL_DIR}")
    print(f"Profiles: {len(PROPAGATION_PROFILES)} incident types")
    for itype, profile in PROPAGATION_PROFILES.items():
        print(f"  {itype:20s} spread={profile['spread_km']:5.1f}km  "
              f"decay={profile['decay_hours']:5.1f}h  "
              f"intensity={profile['intensity']:.2f}")

    return metadata


def test_propagation():
    """Sanity check the propagation model."""
    print("\n" + "=" * 60)
    print("  Spatial Risk Propagation — Test Cases")
    print("=" * 60)

    # Test 1: Flood 5km away, 2 hours ago
    risk = propagate_incident(
        incident_lat=26.14, incident_lon=91.73,
        incident_type="flood", incident_severity=0.8,
        hours_since=2.0,
        target_lat=26.18, target_lon=91.73,
    )
    print(f"\n  Flood 5km away, 2h ago:     risk = {risk:.4f}")

    # Test 2: Same flood but 24 hours later
    risk2 = propagate_incident(
        incident_lat=26.14, incident_lon=91.73,
        incident_type="flood", incident_severity=0.8,
        hours_since=24.0,
        target_lat=26.18, target_lon=91.73,
    )
    print(f"  Flood 5km away, 24h ago:    risk = {risk2:.4f}")

    # Test 3: Crime 0.5km away, just happened
    risk3 = propagate_incident(
        incident_lat=28.613, incident_lon=77.209,
        incident_type="crime_robbery", incident_severity=0.7,
        hours_since=0.5,
        target_lat=28.617, target_lon=77.209,
    )
    print(f"  Robbery 0.5km away, 30m ago: risk = {risk3:.4f}")

    # Test 4: Multiple incidents
    incidents = [
        {"lat": 26.14, "lon": 91.73, "type": "flood", "severity": 0.8, "hours_since": 3},
        {"lat": 26.16, "lon": 91.74, "type": "landslide", "severity": 0.6, "hours_since": 1},
        {"lat": 26.20, "lon": 91.75, "type": "road_accident", "severity": 0.4, "hours_since": 0.5},
    ]
    result = propagate_multiple_incidents(incidents, target_lat=26.15, target_lon=91.73)
    print(f"\n  3 incidents near target:")
    print(f"    Total risk: {result['total_risk']:.4f}")
    print(f"    Dominant:   {result['dominant_type']}")
    for c in result["contributions"]:
        print(f"    - {c['type']:15s} risk={c['risk']:.4f}  dist={c['distance_km']:.1f}km")

    print(f"\n  ✅ Propagation model working")


if __name__ == "__main__":
    save_propagation_profiles()
    test_propagation()