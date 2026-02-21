
import pandas as pd
import sys
import os

# Add backend to path so we can import app
sys.path.append(os.getcwd())

from app.services.kpi_generator import KPIGenerator

def test_marketing():
    df = pd.DataFrame({
        'campaign_date': ['2024-01-01', '2024-01-02'],
        'clicks': [100, 120],
        'spend': [50, 60],
        'conversions': [10, 12],
        'revenue': [500, 600],
        'impressions': [1000, 1200]
    })
    
    print("Testing Marketing KPIs...")
    kpis = KPIGenerator.generate_kpis(df, "Marketing Analytics", {'target': 'conversions', 'date': 'campaign_date'})
    
    print(f"KPIs Found: {len(kpis)}")
    for kpi in kpis:
        print(f" - {kpi['label']}: {kpi['value']}")

if __name__ == "__main__":
    test_marketing()
