"""
End-to-end pipeline orchestrator.

Run: python pipeline.py

This runs everything in order:
1. Download data (optional)
2. Ingest all data sources
3. Merge into unified grid
4. Generate training labels
5. Train all models
6. Evaluate
"""

from __future__ import annotations

import sys
import time
import argparse
import importlib
from pathlib import Path


def step(name: str):
    print(f"\n{'━'*60}")
    print(f"  STEP: {name}")
    print(f"{'━'*60}\n")


def _run_module(display_name: str, module_path: str, func_name: str):
    """Import and run a function, handling errors gracefully."""
    print(f"\n── {display_name} ──")
    try:
        module = importlib.import_module(module_path)
        func = getattr(module, func_name)
        func()
    except FileNotFoundError:
        print(f"  ⚠️  No raw data for {display_name} — skipping")
    except Exception as e:
        print(f"  ❌ Error in {display_name}: {e}")


def run_pipeline(
    skip_download: bool = True,
    skip_ingest: bool = False,
    skip_merge: bool = False,
    skip_labels: bool = False,
    skip_training: bool = False,
    skip_eval: bool = False,
):
    start_time = time.time()

    print("=" * 60)
    print("  YatraX ML Training Pipeline")
    print("=" * 60)

    # ─── 1. DOWNLOAD ───
    if not skip_download:
        step("1/6 — Download Kaggle Datasets")
        from ingestion.download_all import download_all
        download_all()
    else:
        print("\n⏭️  Skipping download (use --download to enable)")

    # ─── 2. INGEST ───
    if not skip_ingest:
        step("2/6 — Ingest Raw Data")

        ingestors = [
            ("Crime",        "ingestion.ingest_crime",      "ingest_all_crime"),
            ("Weather",      "ingestion.ingest_weather",    "ingest_all_weather"),
            ("AQI",          "ingestion.ingest_aqi",        "ingest_all_aqi"),
            ("Water Quality","ingestion.ingest_water",      "ingest_all_water"),
            ("Disasters",    "ingestion.ingest_disasters",  "ingest_all_disasters"),
            ("Accidents",    "ingestion.ingest_accidents",  "ingest_all_accidents"),
            ("Health",       "ingestion.ingest_health",     "ingest_all_health"),
            ("Terrain",      "ingestion.ingest_terrain",    "ingest_all_terrain"),
            ("Population",   "ingestion.ingest_population", "ingest_all_population"),
            ("Tourism",      "ingestion.ingest_tourism",    "ingest_all_tourism"),
            ("Fire",         "ingestion.ingest_fire",       "ingest_all_fire"),
            ("Noise",        "ingestion.ingest_noise",      "ingest_all_noise"),
        ]

        for name, module_path, func_name in ingestors:
            _run_module(name, module_path, func_name)
    else:
        print("\n⏭️  Skipping ingestion")

    # ─── 3. MERGE ───
    if not skip_merge:
        step("3/6 — Merge All Sources into Unified Grid")
        from processing.merge_sources import merge_all_sources
        merge_all_sources()
    else:
        print("\n⏭️  Skipping merge")

    # ─── 4. GENERATE LABELS ───
    if not skip_labels:
        step("4/6 — Generate Training Labels")
        from processing.label_generator import generate_safety_labels
        generate_safety_labels(samples_per_cell=24)
    else:
        print("\n⏭️  Skipping label generation")

    # ─── 5. TRAIN ───
    if not skip_training:
        step("5/6 — Train Models")

        trainers = [
            ("Safety Scorer",        "training.train_safety_scorer",        "train_safety_scorer"),
            ("Incident Classifier",  "training.train_incident_classifier",  "train_incident_classifier"),
            ("Anomaly Detector",     "training.train_anomaly",              "train_anomaly_detector"),
            ("Trajectory Forecaster","training.train_trajectory",           "train_trajectory_model"),
            ("Spatial Risk",         "training.train_spatial_risk",         "save_propagation_profiles"),
            ("Alert Timing",         "training.train_alert_timing",        "save_alert_model"),
        ]

        for name, module_path, func_name in trainers:
            _run_module(name, module_path, func_name)
    else:
        print("\n⏭️  Skipping training")

    # ─── 6. EVALUATE ───
    if not skip_eval:
        step("6/6 — Evaluate All Models")
        from training.evaluate import evaluate_all
        evaluate_all()
    else:
        print("\n⏭️  Skipping evaluation")

    # ─── DONE ───
    elapsed = time.time() - start_time
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)

    print(f"\n{'='*60}")
    print(f"  Pipeline complete in {minutes}m {seconds}s")
    print(f"{'='*60}")

    from config.settings import MODELS_DIR, PROCESSED_DIR, TRAINING_DIR

    print(f"\n📁 Outputs:")
    for d, label in [
        (PROCESSED_DIR, "Processed data"),
        (TRAINING_DIR, "Training data"),
        (MODELS_DIR, "Trained models"),
    ]:
        files = [f for f in d.rglob("*") if f.is_file()]
        total_mb = sum(f.stat().st_size for f in files) / (1024 * 1024)
        print(f"  {label:20s} → {len(files):3d} files, {total_mb:.1f} MB")


def main():
    parser = argparse.ArgumentParser(description="YatraX ML Training Pipeline")
    parser.add_argument("--download", action="store_true", help="Download Kaggle datasets")
    parser.add_argument("--skip-ingest", action="store_true")
    parser.add_argument("--skip-merge", action="store_true")
    parser.add_argument("--skip-labels", action="store_true")
    parser.add_argument("--skip-training", action="store_true")
    parser.add_argument("--skip-eval", action="store_true")
    parser.add_argument("--train-only", action="store_true", help="Only run training + eval")
    parser.add_argument("--ingest-only", action="store_true", help="Only run ingestion")
    parser.add_argument("--eval-only", action="store_true", help="Only run evaluation")

    args = parser.parse_args()

    if args.train_only:
        run_pipeline(skip_download=True, skip_ingest=True, skip_merge=True,
                     skip_labels=True, skip_training=False, skip_eval=False)
    elif args.ingest_only:
        run_pipeline(skip_download=not args.download, skip_ingest=False, skip_merge=True,
                     skip_labels=True, skip_training=True, skip_eval=True)
    elif args.eval_only:
        run_pipeline(skip_download=True, skip_ingest=True, skip_merge=True,
                     skip_labels=True, skip_training=True, skip_eval=False)
    else:
        run_pipeline(
            skip_download=not args.download,
            skip_ingest=args.skip_ingest,
            skip_merge=args.skip_merge,
            skip_labels=args.skip_labels,
            skip_training=args.skip_training,
            skip_eval=args.skip_eval,
        )


if __name__ == "__main__":
    main()