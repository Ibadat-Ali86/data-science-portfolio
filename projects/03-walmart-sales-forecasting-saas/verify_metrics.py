import requests
import pandas as pd
import io
import time
import sys

API_URL = "http://127.0.0.1:8000/api/analysis"

def main():
    print("1. Creating dummy CSV...")
    # Create valid time series data (60 days)
    dates = pd.date_range(start="2023-01-01", periods=60, freq="D")
    values = [100 + i + (i%7)*10 for i in range(60)] # Trend + Seasonality
    df = pd.DataFrame({"date": dates, "sales": values})
    
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_buf.seek(0)
    
    print("2. Uploading data...")
    files = {"file": ("test_data.csv", csv_buf.getvalue(), "text/csv")}
    try:
        res = requests.post(f"{API_URL}/upload", files=files)
        res.raise_for_status()
        session_id = res.json()["session_id"]
        print(f"   Session ID: {session_id}")
    except Exception as e:
        print(f"   Upload failed: {e}")
        sys.exit(1)

    print("3. Profiling data...")
    try:
        res = requests.post(f"{API_URL}/profile/{session_id}", json={"target_col": "sales", "date_col": "date"})
        res.raise_for_status()
        print("   Profiled successfully.")
    except Exception as e:
        print(f"   Profile failed: {e}")
        sys.exit(1)

    print("4. Training model (Prophet)...")
    try:
        payload = {
            "model_type": "prophet",
            "target_col": "sales",
            "date_col": "date",
            "forecast_periods": 30
        }
        res = requests.post(f"{API_URL}/train/{session_id}", json=payload)
        res.raise_for_status()
        job_id = res.json()["job_id"]
        print(f"   Job ID: {job_id}")
    except Exception as e:
        print(f"   Training start failed: {e}")
        sys.exit(1)

    print("5. Polling for completion...")
    for _ in range(30): # Wait up to 30s
        res = requests.get(f"{API_URL}/status/{job_id}")
        status = res.json()
        print(f"   Status: {status['status']} ({status.get('progress')}%)")
        if status["status"] in ["completed", "failed"]:
            break
        time.sleep(1)
    
    if status["status"] != "completed":
        print("   Training failed or timed out.")
        sys.exit(1)

    print("6. Checking results...")
    res = requests.get(f"{API_URL}/results/{job_id}")
    data = res.json()
    metrics = data.get("metrics", {})
    
    print("\n--- METRICS ---")
    print(metrics)
    
    if metrics.get("mape") is None:
        print("\nFAIL: MAPE is None")
        sys.exit(1)
    
    print("\nSUCCESS: Metrics received.")

if __name__ == "__main__":
    main()
