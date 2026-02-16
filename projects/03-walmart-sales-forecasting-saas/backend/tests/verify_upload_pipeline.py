
import requests
import pandas as pd
import io
import os

BASE_URL = "http://localhost:8000/api/analysis"

def test_template_download():
    print("Testing Template Download...")
    response = requests.get(f"{BASE_URL}/templates/sales")
    if response.status_code == 200:
        print("✅ Template download successful")
        # Try finding the file size/type
        print(f"   Size: {len(response.content)} bytes")
        print(f"   Type: {response.headers.get('content-type')}")
        return True
    else:
        print(f"❌ Template download failed: {response.status_code} - {response.text}")
        return False

def test_invalid_upload():
    print("\nTesting Invalid Upload (Text File)...")
    files = {'file': ('test.txt', 'This is a text file', 'text/plain')}
    response = requests.post(f"{BASE_URL}/upload", files=files)
    
    # We expect 400 or 422
    if response.status_code in [400, 422]:
        print("✅ Correctly rejected invalid file type")
        print(f"   Response: {response.content.decode()}")
        return True
    elif response.status_code == 200:
        print("❌ Unexpectedly accepted invalid file")
        return False
    else:
        print(f"❌ Failed with unexpected status: {response.status_code}")
        return False

def test_valid_upload():
    print("\nTesting Valid Upload (CSV)...")
    # Create a small valid CSV
    df = pd.DataFrame({
        'Date': pd.date_range(start='2024-01-01', periods=5),
        'Sales': [100, 120, 110, 130, 140]
    })
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_content = csv_buffer.getvalue()
    
    files = {'file': ('test_data.csv', csv_content, 'text/csv')}
    response = requests.post(f"{BASE_URL}/upload", files=files)
    
    if response.status_code == 200:
        data = response.json()
        if 'session_id' in data and 'quality_report' in data:
            print("✅ Upload successful and returned session/quality report")
            print(f"   Session ID: {data['session_id']}")
            return True
        else:
            print("❌ Upload succeeded but missing key fields")
            print(data)
            return False
    else:
        print(f"❌ Upload failed: {response.status_code} - {response.text}")
        return False

if __name__ == "__main__":
    # Ensure backend is running before testing, or just try
    try:
        t1 = test_template_download()
        t2 = test_invalid_upload()
        t3 = test_valid_upload()
        
        if t1 and t2 and t3:
            print("\n✅✅✅ ALL BACKEND TESTS PASSED ✅✅✅")
        else:
            print("\n❌ SOME TESTS FAILED")
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        print("Is the backend running on localhost:8000?")
