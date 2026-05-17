"""
End-to-end pipeline orchestrator (registry-driven version).

This now uses the PipelineRegistry system instead of hardcoded lists.
New models/data sources can be added via decorators without touching this file.

Run: python pipeline.py

This runs everything in order:
1. Download data (optional)
2. Ingest all data sources (via registry)
3. Merge into unified grid
4. Generate training labels
5. Train all models (via registry)
6. Evaluate
"""

from __future__ import annotations

import sys
import time
import argparse
import importlib
from pathlib import Path

from lib.pipeline_registry import (
    PipelineStage,
    PipelineRegistry,
    register_standard_components,
    get_registry,
    execute_stage,
    execute_component,
)


def step(name: str):
    print(f"\n{'━'*60}")
    print(f"  STEP: {name}")
    print(f"{'━'*60}\n")


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
    print("  YatraX ML Training Pipeline (Registry-Driven)")
    print("=" * 60)

    # Initialize registry (one-time setup)
    register_standard_components()
    registry = get_registry()

    # ─── 1. DOWNLOAD ───
    if not skip_download:
        step("1/6 — Download Kaggle Datasets")
        from ingestion.download_all import download_all
        download_all()
    else:
        print("\n⏭️  Skipping download (use --download to enable)")

    # ─── 2. INGEST (registry-driven) ───
    if not skip_ingest:
        step("2/6 — Ingest Raw Data (via Registry)")
        
        results = execute_stage(PipelineStage.INGEST)
        
        n_completed = sum(1 for r in results.values() if r is not None)
        n_failed = len(results) - n_completed
        print(f"\n✅ Completed {n_completed} ingestion tasks")
        if n_failed > 0:
            print(f"⚠️  Skipped {n_failed} (missing source files)")
    else:
        print("\n⏭️  Skipping ingestion")

    # ─── 3. MERGE ───
    if not skip_merge:
        step("3/6 — Merge All Sources into Unified Grid")

        # Clean stale training artifacts so old cached data doesn't pollute
        from config.settings import TRAINING_DIR
        for stale_file in [
            TRAINING_DIR / "training_samples.parquet",
            TRAINING_DIR / "safety_score_train.parquet",
            TRAINING_DIR / "safety_score_val.parquet",
            TRAINING_DIR / "safety_score_test.parquet",
            TRAINING_DIR / "incident_classification.parquet",
        ]:
            if stale_file.exists():
                stale_file.unlink()
                print(f"  🗑️ Cleaned stale: {stale_file.name}")

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

    # ─── 5. TRAIN (registry-driven) ───
    if not skip_training:
        step("5/6 — Train Models (via Registry)")
        
        results = execute_stage(PipelineStage.TRAIN)
        
        n_completed = sum(1 for r in results.values() if r is not None)
        n_failed = len(results) - n_completed
        print(f"\n✅ Completed {n_completed} training tasks")
        if n_failed > 0:
            print(f"⚠️  Skipped {n_failed} (missing training data)")
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
    parser = argparse.ArgumentParser(
        description="YatraX ML Training Pipeline (Registry-Driven)"
    )
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