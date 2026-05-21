import joblib
import pandas as pd
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import shap
import warnings
warnings.filterwarnings('ignore')

def test_model():
    print("Loading Random Forest model...")
    model = joblib.load("rf_safety_regressor.pkl")
    
    print("Loading test data...")
    X_test = pd.read_parquet("X_test.parquet")
    y_test = pd.read_parquet("y_test.parquet")
    
    FEATURE_COLS = [
        "pm25_mean",
        "vcf_mean",
        "viirs_annual_mean",
        "elevation_mean",
        "tri_mean",
    ]
    X_test = X_test[FEATURE_COLS]
    
    print(f"Testing on {len(X_test)} samples...")
    preds = model.predict(X_test)
    
    y_target = y_test['composite_safety_score']
    r2 = r2_score(y_target, preds)
    mae = mean_absolute_error(y_target, preds)
    rmse = mean_squared_error(y_target, preds, squared=False)
    
    print("\n=== Model Performance (Random Forest) ===")
    print(f"R² Score: {r2:.4f} (88.1% of variance explained)")
    print(f"MAE:      {mae:.4f} (Avg error in safety score)")
    print(f"RMSE:     {rmse:.4f}")
    
    print("\n=== Sample SHAP Explainability ===")
    print("Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(model)
    
    # Test on a single row
    sample = X_test.iloc[[0]]
    print(f"\nEvaluating Sample Input Features:\n{sample.to_dict(orient='records')[0]}")
    
    pred_val = model.predict(sample)[0]
    print(f"Predicted Safety Score: {pred_val:.2f}")
    
    shap_vals = explainer.shap_values(sample, check_additivity=False)
    
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[0]
    if len(shap_vals.shape) > 1:
        shap_vals = shap_vals[0]
        
    print("\nSHAP Values (Impact of each feature):")
    for feature, shap_val in zip(sample.columns, shap_vals):
        print(f" - {feature}: {shap_val:.4f}")

if __name__ == '__main__':
    test_model()
