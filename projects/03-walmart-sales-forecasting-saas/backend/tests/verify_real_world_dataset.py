
import sys
import os
import pandas as pd

# Add backend directory to path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.validation_service import ValidationService

DATASET_PATH = "/media/ibadat/NewVolume/DATA SCIENCE/ML/DATASCIENCE PROJECTS/Demand Sales Walmart Forecasting/ml-forecast-saas/data/external/market_sales.csv"

def verify_dataset():
    print(f"🔍 Starting Verification for: {DATASET_PATH}")
    
    if not os.path.exists(DATASET_PATH):
        print("❌ Error: File not found at provided path.")
        return

    try:
        # Read file content as bytes (simulating upload)
        with open(DATASET_PATH, "rb") as f:
            content = f.read()
            
        print(f"📦 File read successfully. Size: {len(content)} bytes")
        
        # Initialize Service
        validator = ValidationService()
        
        # Run Validation
        print("🚀 Running ValidationService.validate_upload()...")
        result = validator.validate_upload(content, "market_sales.csv")
        
        if result['success']:
            print("\n✅ VALIDATION SUCCESSFUL!")
            print("-" * 30)
            print("📊 DataFrame Shape:", result['dataframe'].shape)
            print("📋 Detected Schema:")
            for key, val in result['schema']['mappings'].items():
                print(f"   - {key}: {val}")
                
            print("\n🛡️ Quality Report:")
            quality = result['quality']
            print(f"   - Completeness: {quality.get('completeness', 0)}%")
            print(f"   - Missing Values: {quality.get('missing_cells', 0)}")
            print(f"   - Duplicate Rows: {quality.get('duplicate_rows', 0)}")
            
            if 'columns' in quality:
                 print("\n   Column Details:")
                 for col, info in quality['columns'].items():
                     print(f"     * {col}: {info.get('type')} ({info.get('missing')} missing)")
                     
        else:
            print("\n❌ VALIDATION FAILED")
            print("-" * 30)
            print("⚠️ Error Code:", result['error']['code'])
            print("📝 Message:", result['error']['message'])
            if 'details' in result['error']:
                print("ℹ️ Details:", result['error']['details'])
            if 'suggestion' in result['error']:
                print("💡 Suggestion:", result['error']['suggestion'])

    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_dataset()
