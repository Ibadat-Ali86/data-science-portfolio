
import pandas as pd
import os

# Source path
source_path = "/media/ibadat/NewVolume/DATA SCIENCE/ML/DATASCIENCE PROJECTS/Demand Sales Walmart Forecasting/data/train.csv"
output_path = "/media/ibadat/NewVolume/DATA SCIENCE/ML/DATASCIENCE PROJECTS/Demand Sales Walmart Forecasting/ml-forecast-saas/backend/test_upload_walmart.csv"

try:
    if os.path.exists(source_path):
        df = pd.read_csv(source_path)
        # Select relevant columns and a small subset of rows (e.g., one store)
        # Ensure we have enough data points for forecasting (>= 10)
        clean_df = df[df['Store'] == 1][['Date', 'Weekly_Sales', 'Store', 'Dept', 'IsHoliday']].head(100)
        
        # Renaissance the columns to match what the pipeline might expect or just keep them standard
        # The pipeline 'smartly' detects, but let's be clear.
        clean_df.rename(columns={'Date': 'date', 'Weekly_Sales': 'sales', 'IsHoliday': 'is_holiday'}, inplace=True)
        
        clean_df.to_csv(output_path, index=False)
        print(f"Successfully created test dataset at {output_path}")
        print(clean_df.head())
    else:
        print(f"Source file not found at {source_path}")
except Exception as e:
    print(f"Error creating test dataset: {e}")
