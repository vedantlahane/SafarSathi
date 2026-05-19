# src/step_01a_ingest_macro.py
import pandas as pd
import numpy as np
from config import RAW_DIR, INTERMEDIATE_DIR

print("🚀 RUNNING MACRO INGESTION (Accidents & Infrastructure)...\n")

# ==========================================
# 1. Process Road Accidents (Wide to Long)
# ==========================================
print("🚗 Processing District Accident History...")
acc_df = pd.read_csv(RAW_DIR / 'Roadaccident.csv')

# Rename the messy first column
acc_df = acc_df.rename(columns={acc_df.columns[0]: 'district_name'})

# Clean district names (lowercase, strip whitespace) for perfect merging later
acc_df['district_name'] = acc_df['district_name'].str.lower().str.strip()

# Melt the dataframe: Turn all the year columns (2022, 2021...) into rows
year_cols = [col for col in acc_df.columns if col.isdigit()]
acc_long = pd.melt(
    acc_df, 
    id_vars=['district_name'], 
    value_vars=year_cols, 
    var_name='year', 
    value_name='total_accidents'
)

# Clean up data types
acc_long['year'] = acc_long['year'].astype(int)
acc_long['total_accidents'] = pd.to_numeric(acc_long['total_accidents'], errors='coerce')
acc_long = acc_long.dropna(subset=['total_accidents'])

print(f"   ↳ Extracted {len(acc_long)} historical accident records across {acc_long['district_name'].nunique()} districts.")

# ==========================================
# 2. Process NFHS Infrastructure (Transpose)
# ==========================================
print("\n🏥 Processing NFHS Resilience Infrastructure...")
nfhs_df = pd.read_csv(RAW_DIR / 'NFHS4_PB_District_All_1_1.csv')

# The metrics are in the 'Residence' column. We want specific rows.
# And we only want the columns that end in ' - Total' to get the district average.
total_cols = [col for col in nfhs_df.columns if ' - Total' in col]
keep_cols = ['Residence'] + total_cols

nfhs_sub = nfhs_df[keep_cols].copy()

# Rename columns to just be the district name (e.g., 'Gurdaspur - Total' -> 'gurdaspur')
rename_dict = {col: col.split(' - ')[0].lower().strip() for col in total_cols}
nfhs_sub = nfhs_sub.rename(columns=rename_dict)

# Transpose the dataframe so districts become rows and metrics become columns
nfhs_t = nfhs_sub.set_index('Residence').T.reset_index()
nfhs_t = nfhs_t.rename(columns={'index': 'district_name'})

# Extract only the specific resilience pillars we care about using string matching
def find_col(keyword):
    for col in nfhs_t.columns:
        if keyword.lower() in str(col).lower():
            return col
    return None

elec_col = find_col('electricity')
water_col = find_col('drinking-water')
sanitation_col = find_col('sanitation')

# Keep only the cleaned data
infra_df = nfhs_t[['district_name', elec_col, water_col, sanitation_col]].copy()
infra_df.columns = ['district_name', 'electricity_pct', 'water_pct', 'sanitation_pct']

# Convert to numeric
for col in ['electricity_pct', 'water_pct', 'sanitation_pct']:
    infra_df[col] = pd.to_numeric(infra_df[col], errors='coerce')

print(f"   ↳ Extracted infrastructure data for {len(infra_df)} districts.")

# ==========================================
# 3. Merge and Save
# ==========================================
print("\n🔗 Merging Macro Baselines...")

# Note: Accidents have a 'year', NFHS is static. 
# We merge NFHS onto every year of the accident data for that district.
macro_master = pd.merge(acc_long, infra_df, on='district_name', how='left')

out_path = INTERMEDIATE_DIR / 'macro_baseline.parquet'
macro_master.to_parquet(out_path, index=False)

print(f"✅ Saved clean macro baseline to: {out_path.name}")
print(f"   ↳ Columns: {list(macro_master.columns)}")