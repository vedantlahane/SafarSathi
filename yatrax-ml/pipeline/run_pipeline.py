# ============================================================
# run_pipeline.py
# Punjab Tourist Safety Intelligence Platform
#
# Executes all steps in sequence.
# Run this file end-to-end on a fresh Colab session.
#
# Usage:
#   python run_pipeline.py
#
# Or in Colab:
#   !python run_pipeline.py
#
# Steps:
#   01  Road accident intelligence
#   02  District crime intelligence
#   03  Social health (NFHS) layer
#   04  Environment + ecological layer
#   05  Governance + prosecution layer
#   06  Broad crime ecosystem (state-level)
#   07  Transport + mobility layer
#   08  Contextual intelligence (prison + climate)
#   09  Final master merge + tourist safety scoring
# ============================================================

import sys
import traceback
from pathlib import Path

# ── Make pipeline folder importable ──────────────────────────
sys.path.insert(0, str(Path(__file__).parent))

from utils import ensure_dirs

import step_01_accidents   as s01
import step_02_crime       as s02
import step_03_social_health as s03
import step_04_environment as s04
import step_05_governance  as s05
import step_06_broad_crime as s06
import step_07_transport   as s07
import step_08_contextual  as s08
import step_09_master_merge as s09


STEPS = [
    ("01 - Road Accidents",      s01.run),
    ("02 - District Crime",      s02.run),
    ("03 - Social Health",       s03.run),
    ("04 - Environment",         s04.run),
    ("05 - Governance",          s05.run),   # depends on step 02 output
    ("06 - Broad Crime",         s06.run),
    ("07 - Transport",           s07.run),
    ("08 - Contextual",          s08.run),
    ("09 - Master Merge",        s09.run),   # depends on all previous outputs
]


def run_all(stop_on_error: bool = True) -> None:
    ensure_dirs()

    results = {}
    total = len(STEPS)

    for i, (name, fn) in enumerate(STEPS, 1):
        sep = "=" * 60
        print(f"\n{sep}")
        print(f"  STEP {i}/{total}  {name}")
        print(sep)

        try:
            results[name] = fn()
            print(f"  ✓ {name} completed.\n")

        except Exception as exc:
            print(f"  ✗ {name} FAILED: {exc}")
            traceback.print_exc()

            if stop_on_error:
                print("\nPipeline aborted. Fix the error above and re-run.")
                sys.exit(1)
            else:
                results[name] = None

    print("\n" + "=" * 60)
    print("  PIPELINE COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    run_all(stop_on_error=True)
