from pathlib import Path
import sys

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor


REQUIRED_COLUMNS = ["Latitude", "Longitude", "Hour", "Danger_Score"]


def main() -> None:
    root_dir = Path(__file__).resolve().parent
    csv_path = root_dir / "SafarSathi_Punjab_Data.csv"
    model_path = root_dir / "danger_model.pkl"

    try:
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV file not found: {csv_path}")

        df = pd.read_csv(csv_path)

        missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")

        X = df[["Latitude", "Longitude", "Hour"]]
        y = df["Danger_Score"]

        model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
        model.fit(X, y)

        joblib.dump(model, model_path)

        if model_path.exists():
            print(f"Model trained and saved successfully to: {model_path}")
        else:
            raise IOError(f"Model file was not created at: {model_path}")

    except Exception as exc:
        print(f"Error training model: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
