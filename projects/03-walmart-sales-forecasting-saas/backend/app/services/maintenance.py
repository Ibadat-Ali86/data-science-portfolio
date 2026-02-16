
import os
import time
import shutil
import logging
from datetime import datetime, timedelta
from app.config import settings

logger = logging.getLogger(__name__)

class MaintenanceService:
    """
    System maintenance and cleanup routines.
    Task 5.1: Optimization & Cleanup
    """
    
    def __init__(self):
        self.upload_dir = "uploads" # Adjust as needed
        self.jobs_file = "training_jobs.json"
        
    def cleanup_old_files(self, max_age_hours: int = 24):
        """Remove temporary files older than X hours"""
        try:
            now = time.time()
            cutoff = now - (max_age_hours * 3600)
            
            # 1. Clean upload directory
            if os.path.exists(self.upload_dir):
                for filename in os.listdir(self.upload_dir):
                    filepath = os.path.join(self.upload_dir, filename)
                    if os.path.getmtime(filepath) < cutoff:
                        if os.path.isfile(filepath):
                            os.remove(filepath)
                        elif os.path.isdir(filepath):
                            shutil.rmtree(filepath)
            
            logger.info("System cleanup completed successfully")
            return True
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
            return False

    def check_system_health(self):
        """Task 5.2: Health Monitoring Logic"""
        import psutil
        
        disk = psutil.disk_usage('/')
        memory = psutil.virtual_memory()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_percent": psutil.cpu_percent(),
                "memory_percent": memory.percent,
                "disk_usage_percent": disk.percent
            },
            "services": {
                "api": "online",
                "database": "n/a" # Add DB check if applicable
            }
        }

maintenance_service = MaintenanceService()
