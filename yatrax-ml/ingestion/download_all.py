"""
Downloads all Kaggle datasets defined in the registry.
Run once: python -m ingestion.download_all
"""

import subprocess
import sys
from pathlib import Path

from config.kaggle_sources import KAGGLE_DATASETS
from config.settings import RAW_DIR


def download_dataset(slug: str, target_dir: Path) -> bool:
    """Download a single Kaggle dataset."""
    target_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "kaggle", "datasets", "download",
        "-d", slug,
        "-p", str(target_dir),
        "--unzip",
    ]

    print(f"Downloading: {slug} → {target_dir}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"  ERROR: {result.stderr.strip()}")
            return False
        print(f"  OK")
        return True
    except subprocess.TimeoutExpired:
        print(f"  TIMEOUT")
        return False
    except FileNotFoundError:
        print("  ERROR: kaggle CLI not found. Run: pip install kaggle")
        print("  Then set up ~/.kaggle/kaggle.json with your API token.")
        return False


def download_all() -> None:
    """Download all registered datasets."""
    print(f"Downloading {len(KAGGLE_DATASETS)} datasets...\n")

    success = 0
    failed = 0

    for ds in KAGGLE_DATASETS:
        target = RAW_DIR / ds.target_dir
        ok = download_dataset(ds.slug, target)
        if ok:
            success += 1
        else:
            failed += 1

    print(f"\nDone: {success} downloaded, {failed} failed")


if __name__ == "__main__":
    download_all()