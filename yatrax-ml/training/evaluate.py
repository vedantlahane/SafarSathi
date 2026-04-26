"""
Unified evaluation — run all models and generate a combined report.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import TRAINING_DIR, MODELS_DIR


def evaluate_all() -> dict:
    print("=" * 70)
    print("  YatraX ML Pipeline — Evaluation Report")
    print(f"  {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print("=" * 70)

    report = {}

    # ─── Model 1: Safety Scorer ───
    scorer_meta = _load_metadata("safety_scorer")
    if scorer_meta:
        m = scorer_meta["metrics"]
        print(f"\n📊 SAFETY SCORER (LightGBM)")
        print(f"   MAE:       {m['mae']:.2f} / 100")
        print(f"   RMSE:      {m['rmse']:.2f}")
        print(f"   R²:        {m['r2']:.4f}")
        print(f"   Within ±5: {m['within_5_pct']*100:.1f}%")
        print(f"   Within ±10:{m['within_10_pct']*100:.1f}%")
        print(f"   Features:  {scorer_meta['n_features']}")
        print(f"   Samples:   {scorer_meta['n_train_samples']}")
        report["safety_scorer"] = m
    else:
        print(f"\n⚠️  Safety scorer not trained yet")

    # ─── Model 2: Trajectory Forecaster ───
    traj_meta = _load_metadata("trajectory")
    if traj_meta:
        print(f"\n📊 TRAJECTORY FORECASTER (GBM)")
        print(f"   MAE:       {traj_meta['mae']:.2f} points")
        print(f"   Within ±5: {traj_meta['within_5']*100:.1f}%")
        print(f"   Within ±10:{traj_meta['within_10']*100:.1f}%")
        print(f"   Samples:   {traj_meta['n_samples']}")
        report["trajectory"] = {
            "mae": traj_meta["mae"],
            "within_5": traj_meta["within_5"],
            "within_10": traj_meta["within_10"],
        }
    else:
        print(f"\n⚠️  Trajectory forecaster not trained yet")

    # ─── Model 3: Anomaly Detector ───
    anomaly_meta = _load_metadata("anomaly")
    if anomaly_meta:
        print(f"\n📊 ANOMALY DETECTOR (Isolation Forest)")
        print(f"   Training cells:    {anomaly_meta['n_training_cells']}")
        print(f"   Anomalies found:   {anomaly_meta['n_anomalies_found']} ({anomaly_meta['anomaly_pct']:.1f}%)")
        print(f"   Features:          {anomaly_meta['n_features']}")
        s = anomaly_meta["score_stats"]
        print(f"   Score range:       [{s['min']:.4f}, {s['max']:.4f}]")
        print(f"   Score mean±std:    {s['mean']:.4f} ± {s['std']:.4f}")
        report["anomaly_detector"] = anomaly_meta["score_stats"]
    else:
        print(f"\n⚠️  Anomaly detector not trained yet")

    # ─── Model 4: Incident Classifier ───
    incident_meta = _load_metadata("incident_classifier")
    if incident_meta:
        print(f"\n📊 INCIDENT CLASSIFIER (LightGBM)")
        print(f"   Accuracy:  {incident_meta['accuracy']:.2%}")
        print(f"   Classes:   {incident_meta['n_classes']}")
        print(f"   Samples:   {incident_meta['n_samples']}")
        print(f"   Per-class F1:")
        for cls, f1 in sorted(incident_meta["per_class_f1"].items(), key=lambda x: -x[1]):
            bar = "█" * int(f1 * 20) + "░" * (20 - int(f1 * 20))
            print(f"     {cls:20s} {bar} {f1:.2f}")
        report["incident_classifier"] = {
            "accuracy": incident_meta["accuracy"],
            "per_class_f1": incident_meta["per_class_f1"],
        }
    else:
        print(f"\n⚠️  Incident classifier not trained yet")

    # ─── Model 5: Spatial Risk ───
    spatial_meta = _load_metadata("spatial_risk")
    if spatial_meta:
        print(f"\n📊 SPATIAL RISK PROPAGATION ({spatial_meta['model_type']})")
        print(f"   Incident profiles: {len(spatial_meta['profiles'])}")
        for itype, prof in list(spatial_meta["profiles"].items())[:5]:
            print(f"     {itype:20s} spread={prof['spread_km']:.0f}km decay={prof['decay_hours']:.0f}h")
        if len(spatial_meta["profiles"]) > 5:
            print(f"     ... and {len(spatial_meta['profiles'])-5} more")
        report["spatial_risk"] = {"profiles": len(spatial_meta["profiles"])}
    else:
        print(f"\n⚠️  Spatial risk model not saved yet")

    # ─── Model 6: Alert Timing ───
    alert_meta = _load_metadata("alert_timing")
    if alert_meta:
        print(f"\n📊 ALERT TIMING ({alert_meta['model_type']})")
        print(f"   Actions:   {alert_meta['action_space']}")
        thresholds = alert_meta["heuristic_thresholds"]
        print(f"   Danger zone: score < {thresholds['danger_zone_score']}")
        print(f"   Caution zone: score < {thresholds['caution_zone_score']}")
        print(f"   Min alert gap: {thresholds['min_alert_interval_minutes']}min")
        print(f"   RL status: {alert_meta['future_rl']['status']}")
        report["alert_timing"] = {"model_type": alert_meta["model_type"]}
    else:
        print(f"\n⚠️  Alert timing model not saved yet")

    # ─── Edge case validation ───
    if scorer_meta:
        print(f"\n📊 EDGE CASE VALIDATION")
        _evaluate_edge_cases()

    # ─── Alert timing validation ───
    print(f"\n📊 ALERT TIMING VALIDATION")
    _evaluate_alert_timing()

    # ─── Spatial risk validation ───
    print(f"\n📊 SPATIAL RISK VALIDATION")
    _evaluate_spatial_risk()

    print(f"\n{'='*70}")

    report_path = MODELS_DIR / "evaluation_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Report saved: {report_path}")

    return report


def _load_metadata(model_name: str) -> dict | None:
    meta_path = MODELS_DIR / model_name / "metadata.json"
    if not meta_path.exists():
        return None
    with open(meta_path) as f:
        return json.load(f)


def _evaluate_edge_cases():
    try:
        from training.train_safety_scorer import load_safety_scorer, predict_safety
        model, feature_cols = load_safety_scorer()
    except (ImportError, FileNotFoundError):
        print("   Cannot load safety scorer")
        return

    test_cases = [
        {
            "name": "Safe urban daytime",
            "expected_range": (60, 100),
            "features": {
                "crime_rate_per_100k": 150, "aqi": 80, "weather_severity": 10,
                "hospital_level_score": 80, "nearest_hospital_proxy_km": 2,
                "road_accident_hotspot_risk": 0.1, "hour": 14, "month": 3,
            },
        },
        {
            "name": "Monsoon flood zone night",
            "expected_range": (0, 55),
            "features": {
                "crime_rate_per_100k": 200, "aqi": 100, "weather_severity": 75,
                "rainfall_mmph": 40, "visibility_km": 2, "flood_risk": 0.8,
                "nearest_hospital_proxy_km": 15, "hour": 2, "month": 7,
            },
        },
        {
            "name": "High crime area late night",
            "expected_range": (15, 45),
            "features": {
                "crime_rate_per_100k": 600, "aqi": 90, "weather_severity": 15,
                "nearest_hospital_proxy_km": 8, "emergency_availability_score": 30,
                "hour": 1, "month": 10,
            },
        },
        {
            "name": "Remote area poor infrastructure",
            "expected_range": (20, 50),
            "features": {
                "nearest_hospital_proxy_km": 40, "emergency_availability_score": 10,
                "ambulance_response_score": 5, "population_density_per_km2": 20,
                "hour": 18, "month": 8, "weather_severity": 30,
            },
        },
    ]

    passed = 0
    for tc in test_cases:
        result = predict_safety(model, feature_cols, tc["features"])
        score = result["safety_score"]
        lo, hi = tc["expected_range"]
        ok = lo <= score <= hi
        status = "✅" if ok else "❌"
        passed += int(ok)
        print(f"   {status} {tc['name']:35s} → {score:5.1f}  (expected {lo}-{hi})")

    print(f"   Passed: {passed}/{len(test_cases)}")


def _evaluate_alert_timing():
    """Quick validation of alert timing engine."""
    try:
        from training.train_alert_timing import AlertTimingEngine, AlertContext, AlertAction
    except ImportError:
        print("   Cannot import alert timing")
        return

    engine = AlertTimingEngine()

    cases = [
        ("Critical", AlertContext(
            safety_score=10, score_change_rate_per_hour=-25, score_variance=15,
            predicted_score_1h=3, predicted_score_3h=0, incident_type="flood",
            incident_confidence=0.9, is_night=True, hour=2, battery_pct=10,
            network_quality=2, nearest_hospital_km=20,
            time_since_last_alert_minutes=5, alerts_last_24h=3,
            anomaly_detected=True, anomaly_severity="high",
        ), AlertAction.EMERGENCY),
        ("Safe", AlertContext(
            safety_score=82, score_change_rate_per_hour=2, score_variance=3,
            predicted_score_1h=80, predicted_score_3h=78, incident_type=None,
            incident_confidence=0, is_night=False, hour=14, battery_pct=85,
            network_quality=4, nearest_hospital_km=2,
            time_since_last_alert_minutes=999, alerts_last_24h=0,
            anomaly_detected=False, anomaly_severity="none",
        ), AlertAction.WAIT),
    ]

    passed = 0
    for name, ctx, expected in cases:
        decision = engine.decide(ctx)
        ok = decision.action == expected
        status = "✅" if ok else "❌"
        passed += int(ok)
        print(f"   {status} {name:20s} → {decision.action.value} (expected {expected.value})")

    print(f"   Passed: {passed}/{len(cases)}")


def _evaluate_spatial_risk():
    """Quick validation of spatial risk propagation."""
    try:
        from training.train_spatial_risk import propagate_incident, propagate_multiple_incidents
    except ImportError:
        print("   Cannot import spatial risk")
        return

    # Flood nearby should have high risk
    r1 = propagate_incident(26.14, 91.73, "flood", 0.8, 2.0, 26.18, 91.73)
    # Same flood far away should have low risk
    r2 = propagate_incident(26.14, 91.73, "flood", 0.8, 2.0, 28.00, 91.73)
    # Same flood long ago should have decayed
    r3 = propagate_incident(26.14, 91.73, "flood", 0.8, 100.0, 26.18, 91.73)

    print(f"   Flood 5km/2h:   {r1:.4f} (should be >0.1)   {'✅' if r1 > 0.1 else '❌'}")
    print(f"   Flood 200km/2h: {r2:.4f} (should be ~0)     {'✅' if r2 < 0.01 else '❌'}")
    print(f"   Flood 5km/100h: {r3:.4f} (should be <0.1)   {'✅' if r3 < 0.10 else '❌'}")


if __name__ == "__main__":
    evaluate_all()