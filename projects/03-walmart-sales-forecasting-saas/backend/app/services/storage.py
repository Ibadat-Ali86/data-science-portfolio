import os
import json
import logging
from typing import Dict, Optional, List
import fcntl
import glob
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

class StorageService:
    """
    Scalable file-based storage service for session data.
    Stores each session in a separate JSON file.
    """
    
    def __init__(self, data_dir: str = "data/sessions"):
        self.data_dir = data_dir
        self._ensure_data_dir()

    def _ensure_data_dir(self):
        """Ensure the data directory exists."""
        os.makedirs(self.data_dir, exist_ok=True)

    def _get_file_path(self, session_id: str) -> str:
        """Get the file path for a session ID."""
        # Sanitize session_id to prevent path traversal
        safe_id = os.path.basename(session_id)
        return os.path.join(self.data_dir, f"{safe_id}.json")

    def save_session(self, session_id: str, data: Dict) -> bool:
        """
        Save session data to a specific file with locking.
        """
        file_path = self._get_file_path(session_id)
        try:
            with open(file_path, "w") as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                try:
                    json.dump(data, f, indent=2, default=str)
                    f.flush()
                    os.fsync(f.fileno())
                    return True
                finally:
                    fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        except Exception as e:
            logger.error(f"Failed to save session {session_id}: {e}")
            return False

    def load_session(self, session_id: str) -> Optional[Dict]:
        """
        Load session data from file with shared lock.
        """
        file_path = self._get_file_path(session_id)
        if not os.path.exists(file_path):
            return None
            
        try:
            with open(file_path, "r") as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_SH)
                try:
                    return json.load(f)
                finally:
                    fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {e}")
            return None

    def list_sessions(self) -> List[str]:
        """List all available session IDs."""
        try:
            files = glob.glob(os.path.join(self.data_dir, "*.json"))
            return [os.path.basename(f).replace(".json", "") for f in files]
        except Exception as e:
            logger.error(f"Failed to list sessions: {e}")
            return []

    def delete_session(self, session_id: str) -> bool:
        """Delete a session file."""
        file_path = self._get_file_path(session_id)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                return True
            except Exception as e:
                logger.error(f"Failed to delete session {session_id}: {e}")
                return False
        return False

# Singleton instance
storage = StorageService(data_dir=os.path.join(os.getcwd(), "backend/data/sessions"))
