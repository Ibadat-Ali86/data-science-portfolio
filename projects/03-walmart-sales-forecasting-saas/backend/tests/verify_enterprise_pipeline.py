
import pytest
from fastapi.testclient import TestClient
from app.main import app
import pandas as pd
import io

client = TestClient(app)

def test_enterprise_pipeline_flow():
    # 1. Create realistic CSV data (needs >30 rows for enterprise validation)
    dates = pd.date_range(start='2023-01-01', periods=50, freq='D')
    sales = [100 + i + (i%7)*10 for i in range(50)] # Some trend + seasonality
    df = pd.DataFrame({'date': dates, 'sales': sales})
    
    csv_content = df.to_csv(index=False)
    files = {"file": ("enterprise_test.csv", csv_content, "text/csv")}
    
    # 2. Upload
    print("\n🚀 Testing Upload...")
    response = client.post("/api/analysis/upload", files=files)
    assert response.status_code == 200, f"Upload failed: {response.text}"
    data = response.json()
    assert "session_id" in data
    session_id = data["session_id"]
    print(f"✅ Upload successful. Session ID: {session_id}")
    
    # 3. Profile (Testing the fixed import)
    print("\n🔍 Testing Profile...")
    payload = {"target_col": "sales", "date_col": "date"}
    response = client.post(f"/api/analysis/profile/{session_id}", json=payload)
    assert response.status_code == 200, f"Profile failed: {response.text}"
    profile = response.json()
    assert profile["dimensions"]["rows"] == 50
    print("✅ Profile successful")
    
    # 4. Train (Testing real ML models)
    print("\n🧠 Testing Training (Real Models)...")
    train_payload = {
        "model_type": "ensemble",
        "target_col": "sales",
        "date_col": "date",
        "forecast_periods": 7
    }
    response = client.post(f"/api/analysis/train/{session_id}", json=train_payload)
    assert response.status_code == 200, f"Training start failed: {response.text}"
    job_id = response.json()["job_id"]
    print(f"✅ Training started. Job ID: {job_id}")
    
    # 5. Check Status (Poll until complete)
    import time
    max_retries = 30
    for i in range(max_retries):
        response = client.get(f"/api/analysis/status/{job_id}")
        assert response.status_code == 200
        status_data = response.json()
        status = status_data["status"]
        print(f"   Status: {status} (Progress: {status_data.get('progress', 0)}%)")
        
        if status == "completed":
            break
        if status == "failed":
            pytest.fail(f"Training failed: {status_data.get('error')}")
            
        time.sleep(1)
    else:
        pytest.fail("Training timed out")
    
    print("✅ Training completed successfully")
    
    # 6. Get Results
    print("\n📊 Testing Results...")
    response = client.get(f"/api/analysis/results/{job_id}")
    assert response.status_code == 200
    results = response.json()
    
    # Verify ensemble results structure
    assert "forecast" in results
    assert "predictions" in results["forecast"]
    assert len(results["forecast"]["predictions"]) > 0
    assert "metrics" in results
    
    print("✅ Results verification successful!")
    print(f"   Model Metrics: {results['metrics']}")

if __name__ == "__main__":
    test_enterprise_pipeline_flow()
