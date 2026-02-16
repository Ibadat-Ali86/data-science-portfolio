
import pandas as pd
import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.data_adapter import DataAdapter

def test_synonym_matching():
    print("\n--- Testing Synonym Matching ---")
    data = {
        'Trans_Date': ['2023-01-01', '2023-01-02'],
        'Qty_Sold': [100, 200],
        'Product_ID': ['A1', 'B2'],
        'Shop_Loc': ['NY', 'CA']
    }
    df = pd.DataFrame(data)
    
    adapter = DataAdapter()
    df_norm, report = adapter.normalize_dataset(df)
    
    print("Original Columns:", data.keys())
    print("Mapped Columns:", df_norm.columns.tolist())
    print("Report Mapping:", report['column_mapping'])
    
    expected = ['date', 'target', 'item', 'location']
    assert all(col in df_norm.columns for col in expected), f"Missing columns. Got {df_norm.columns}"
    print("✅ Synonym matching passed")

def test_wide_format_unpivot():
    print("\n--- Testing Wide Format Unpivoting ---")
    data = {
        'Product': ['A1', 'B2'],
        '2023-01-01': [10, 20],
        '2023-01-02': [15, 25],
        '2023-01-03': [12, 22]
    }
    df = pd.DataFrame(data)
    
    adapter = DataAdapter()
    df_norm, report = adapter.normalize_dataset(df)
    
    print("Original Shape:", df.shape)
    print("Normalized Shape:", df_norm.columns)
    print("Transformations:", report['transformations'])
    
    assert 'date' in df_norm.columns and 'target' in df_norm.columns, "Failed to unpivot"
    assert len(df_norm) == 6, f"Expected 6 rows (2 products * 3 dates), got {len(df_norm)}"
    print("✅ Wide format unpivoting passed")

def test_date_parsing():
    print("\n--- Testing Date Parsing ---")
    data = {
        'Date': ['01/02/2023', '2023.01.03', 'Jan 4, 2023'],
        'Sales': [100, 200, 300]
    }
    df = pd.DataFrame(data)
    
    adapter = DataAdapter()
    df_norm, report = adapter.normalize_dataset(df)
    
    print("Parsed Dates:", df_norm['date'].tolist())
    assert pd.api.types.is_datetime64_any_dtype(df_norm['date']), "Date column not datetime type"
    print("✅ Date parsing passed")

if __name__ == "__main__":
    try:
        test_synonym_matching()
        test_wide_format_unpivot()
        test_date_parsing()
        print("\n🎉 ALL TESTS PASSED")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
