# src/config.py
import platform
from pathlib import Path

# ==========================================
# 1. Detect Environment & Set Base Path
# ==========================================
if platform.system() == "Windows":
    # Local PC Environment
    BASE_DIR = Path(r"C:\Users\Admin\Desktop\YatraX\punjab")
    print("🖥️ Running in Local PC Environment (Windows)")
else:
    # Google Colab / Kaggle Environment (Linux)
    BASE_DIR = Path("/content/drive/MyDrive/yatrax-ml/punjab")
    print("☁️ Running in Cloud Environment (Colab/Kaggle)")

# ==========================================
# 2. Define Standardized Sub-directories
# ==========================================
# Data Directories
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "01_raw"
INTERMEDIATE_DIR = DATA_DIR / "02_intermediate"
FINAL_DIR = DATA_DIR / "03_final"

# Model & API Directories
MODELS_DIR = BASE_DIR / "models"
SRC_DIR = BASE_DIR / "src"

# ==========================================
# 3. Safety Check: Ensure Directories Exist
# ==========================================
def setup_directories():
    """Creates the necessary directory structure if it doesn't exist."""
    directories = [RAW_DIR, INTERMEDIATE_DIR, FINAL_DIR, MODELS_DIR, SRC_DIR]
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
    print("✅ Directory structure verified.")

# Run the setup check immediately when config is imported
setup_directories()