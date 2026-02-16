import requests
import time
import os
import json

BASE_URL = "http://localhost:8000"

def create_dummy_csv():
    content = "date,sales,is_holiday,is_weekend,promotion_active,temperature,fuel_price\n"
    # Generate 50 rows
    for i in range(50):
        content += f"2023-01-{i+1:02d},1000,0,0,0,25.0,3.5\n" if i < 30 else f"2023-02-{i-29:02d},1200,0,0,1,22.0,3.6\n"
    
    with open("test_upload.csv", "w") as f:
        f.write(content)
    return "test_upload.csv"

def test_backend_flow():
    print("🚀 Starting Backend Logic Verification (Bypassing Frontend)...")
    
    # 1. Health Check
    try:
        resp = requests.get(f"{BASE_URL}/")
        print(f"✅ Backend Request successful: {resp.status_code}")
    except Exception as e:
        print(f"❌ Backend not reachable: {e}")
        return

    # 2. Upload
    filename = create_dummy_csv()
    session_id = None
    try:
        print(f"Uploading {filename}...")
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "text/csv")}
            resp = requests.post(f"{BASE_URL}/api/analysis/upload", files=files)
            
        if resp.status_code == 200:
            data = resp.json()
            session_id = data.get("session_id")
            print(f"✅ Upload successful. Session ID: {session_id}")
        else:
            print(f"❌ Upload failed: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return

    if not session_id:
        print("❌ No session ID. Aborting.")
        return

    # 3. Trigger Analysis (Profile & Train)
    print("⏳ Triggering Processing...")
    
    # Header for JSON
    headers = {"Content-Type": "application/json"}
    
    # 3a. Profile (Required for schema resolution)
    profile_req = {
        "target_col": "sales", 
        "date_col": "date"
    }
    print("   - Profiling...")
    profile_resp = requests.post(
        f"{BASE_URL}/api/analysis/profile/{session_id}", 
        json=profile_req,
        headers=headers
    )
    if profile_resp.status_code != 200:
        print(f"❌ Profiling failed: {profile_resp.status_code} - {profile_resp.text}")
        return

    # 3b. Train (to generate results/insights)
    train_req = {
        "model_type": "auto",
        "forecast_periods": 30
    }
    print("   - Training (Auto)...")
    train_resp = requests.post(
        f"{BASE_URL}/api/analysis/train/{session_id}", 
        json=train_req,
        headers=headers
    )
    if train_resp.status_code != 200:
        print(f"❌ Training start failed: {train_resp.status_code} - {train_resp.text}")
        return
        
    # Wait for training to complete
    print("   - Waiting for Training Completion (Polling)...")
    max_retries = 20
    for i in range(max_retries):
        status_resp = requests.get(f"{BASE_URL}/api/analysis/status/{session_id}")
        if status_resp.status_code == 200:
            status_data = status_resp.json()
            status = status_data.get("status")
            print(f"     Status: {status} ({status_data.get('progress')}%)")
            
            if status == "completed":
                break
            if status == "failed":
                print(f"❌ Training Failed: {status_data.get('error')}")
                return
        time.sleep(2)
    else:
        print("❌ Training timed out.")
        return

    # 4. Get Forecast/Results
    print("🔍 Fetching Analysis Results...")
    results_resp = requests.get(f"{BASE_URL}/api/analysis/results/{session_id}")
    
    if results_resp.status_code == 200:
        results = results_resp.json()
        print("✅ Results retrieved.")
        
        # Verify New Features
        insights = results.get("insights", {})
        if insights and "financial_analysis" in insights: # Check key name! Reference report_generator
             print("   ✅ Financial Metrics present")
        elif insights:
             print(f"   ⚠️ Insights keys: {insights.keys()}")
        else:
             print("   ❌ Insights object missing")

    else:
         print(f"❌ Could not retrieve results: {results_resp.status_code}")

    # 5. Generate Report
    print("📄 Generating PDF Report...")
    # Using the download endpoint
    report_resp = requests.get(f"{BASE_URL}/api/reports/download/{session_id}")
    if report_resp.status_code == 200:
        if len(report_resp.content) > 1000: # Check if substantive
            print(f"✅ PDF Report generated ({len(report_resp.content)} bytes).")
            with open("verified_report.pdf", "wb") as f:
                f.write(report_resp.content)
        else:
            print("⚠️ PDF generated but seems empty.")
    else:
        print(f"❌ Report generation failed: {report_resp.status_code} - {report_resp.text}")

    # Cleanup
    if os.path.exists(filename): os.remove(filename)
    # Keeping PDF for user to see


if __name__ == "__main__":
    test_backend_flow()
