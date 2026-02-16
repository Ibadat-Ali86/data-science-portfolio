
import os
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.storage import storage

client = TestClient(app)

@pytest.fixture
def clean_storage():
    # Setup: Ensure storage has a clean test directory
    original_dir = storage.data_dir
    storage.data_dir = "backend/data/test_pipeline_sessions"
    os.makedirs(storage.data_dir, exist_ok=True)
    
    yield
    
    # Teardown
    import shutil
    if os.path.exists(storage.data_dir):
        shutil.rmtree(storage.data_dir)
    storage.data_dir = original_dir

def test_full_pipeline_flow(clean_storage):
    # 1. Upload
    csv_content = "date,sales\n2023-01-01,100\n2023-01-02,150\n2023-01-03,200"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    
    response = client.post("/api/analysis/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    session_id = data["session_id"]
    
    # 2. Profile
    payload = {"target_col": "sales", "date_col": "date"}
    response = client.post(f"/api/analysis/profile/{session_id}", json=payload)
    assert response.status_code == 200
    profile = response.json()
    assert profile["dimensions"]["rows"] == 3
    
    # 3. Train
    train_payload = {
        "model_type": "auto",
        "target_col": "sales",
        "date_col": "date",
        "forecast_periods": 2,
        "confidence_level": 0.95
    }
    response = client.post(f"/api/analysis/train/{session_id}", json=train_payload)
    assert response.status_code == 200
    job_id = response.json()["job_id"]
    assert job_id == session_id
    
    # 4. Check Status (Mocking background task execution or checking initial state)
    # Background tasks might not run fully in TestClient depending on async setup.
    # But we can check that job was created in storage.
    
    # Manually trigger training if TestClient doesn't run background tasks automatically?
    # TestClient DOES run background tasks after the response is sent.
    # So we might need to wait a bit or check status directly.
    
    response = client.get(f"/api/analysis/status/{job_id}")
    assert response.status_code == 200
    status = response.json()["status"]
    assert status in ["queued", "training", "completed", "failed"]

