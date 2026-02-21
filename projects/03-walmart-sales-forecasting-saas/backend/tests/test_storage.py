import os
import json
import pytest
from app.services.storage import StorageService

TEST_DIR = "backend/data/test_sessions"

@pytest.fixture
def storage():
    # Setup
    if not os.path.exists(TEST_DIR):
        os.makedirs(TEST_DIR)
    
    s = StorageService(data_dir=TEST_DIR)
    yield s
    
    # Teardown
    import shutil
    if os.path.exists(TEST_DIR):
        shutil.rmtree(TEST_DIR)

def test_save_and_load_session(storage):
    session_id = "test-session-123"
    data = {"status": "ok", "value": 42}
    
    # Save
    assert storage.save_session(session_id, data) is True
    
    # Load
    loaded = storage.load_session(session_id)
    assert loaded is not None
    assert loaded["status"] == "ok"
    assert loaded["value"] == 42

def test_load_nonexistent_session(storage):
    loaded = storage.load_session("fake-session")
    assert loaded is None

def test_delete_session(storage):
    session_id = "to-be-deleted"
    storage.save_session(session_id, {"data": "temp"})
    
    assert storage.delete_session(session_id) is True
    assert storage.load_session(session_id) is None

def test_list_sessions(storage):
    storage.save_session("s1", {})
    storage.save_session("s2", {})
    
    sessions = storage.list_sessions()
    assert "s1" in sessions
    assert "s2" in sessions
    assert len(sessions) == 2
