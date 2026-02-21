"""
Memory Optimization Utilities for HuggingFace Spaces Deployment
Ensures app stays under 16GB memory limit
"""

import gc
import psutil
import logging
from typing import Dict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class MemoryOptimizer:
    """
    Memory management for constrained environments
    """
    
    MAX_MEMORY_GB = 14  # Stay below 16GB limit with buffer
    MEMORY_WARNING_THRESHOLD = 0.85  # 85% of max
    
    def __init__(self):
        self.session_cache = {}
        self.last_cleanup = datetime.now()
        self.cleanup_interval = timedelta(minutes=30)
    
    def get_memory_usage(self) -> Dict:
        """
        Get current memory usage stats
        """
        process = psutil.Process()
        memory_info = process.memory_info()
        
        return {
            'rss_mb': memory_info.rss / 1024 / 1024,  # MB
            'rss_gb': memory_info.rss / 1024 / 1024 / 1024,  # GB
            'percent': process.memory_percent(),
            'available_gb': psutil.virtual_memory().available / 1024 / 1024 / 1024
        }
    
    def check_memory_limit(self) -> bool:
        """
        Check if memory usage is within safe limits
        
        Returns:
            True if memory is safe, False if approaching limit
        """
        usage = self.get_memory_usage()
        
        if usage['rss_gb'] > self.MAX_MEMORY_GB:
            logger.error(f"Memory limit exceeded: {usage['rss_gb']:.2f}GB / {self.MAX_MEMORY_GB}GB")
            self.force_cleanup()
            return False
        
        if usage['rss_gb'] > self.MAX_MEMORY_GB * self.MEMORY_WARNING_THRESHOLD:
            logger.warning(f"Memory usage high: {usage['rss_gb']:.2f}GB / {self.MAX_MEMORY_GB}GB")
            self.cleanup_old_sessions()
            return True
        
        return True
    
    def cleanup_old_sessions(self):
        """
        Remove old session data from memory
        """
        now = datetime.now()
        
        # Skip if cleaned recently
        if now - self.last_cleanup < self.cleanup_interval:
            return
        
        logger.info("Running session cleanup...")
        
        # Clear session cache (placeholder - integrate with actual session storage)
        sessions_removed = 0
        cutoff_time = now - timedelta(hours=24)  # Remove sessions older than 24h
        
        # This would integrate with your actual session storage
        # For now, just run garbage collection
        gc.collect()
        
        self.last_cleanup = now
        logger.info(f"Cleanup complete. Removed {sessions_removed} old sessions")
    
    def force_cleanup(self):
        """
        Aggressive cleanup when hitting memory limits
        """
        logger.warning("Forcing aggressive memory cleanup")
        
        # Clear all caches
        self.session_cache.clear()
        
        # Run garbage collection multiple times
        for _ in range(3):
            gc.collect()
        
        usage = self.get_memory_usage()
        logger.info(f"After cleanup: {usage['rss_gb']:.2f}GB")
    
    def optimize_dataframe_memory(self, df):
        """
        Optimize pandas DataFrame memory usage
        
        Convert dtypes to the most memory-efficient types
        """
        import pandas as pd
        import numpy as np
        
        for col in df.columns:
            col_type = df[col].dtype
            
            if col_type != object:
                c_min = df[col].min()
                c_max = df[col].max()
                
                if str(col_type)[:3] == 'int':
                    if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                        df[col] = df[col].astype(np.int8)
                    elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                        df[col] = df[col].astype(np.int16)
                    elif c_min > np.iinfo(np.int32).min and c_max < np.iinfo(np.int32).max:
                        df[col] = df[col].astype(np.int32)
                    elif c_min > np.iinfo(np.int64).min and c_max < np.iinfo(np.int64).max:
                        df[col] = df[col].astype(np.int64)
                
                elif str(col_type)[:5] == 'float':
                    if c_min > np.finfo(np.float32).min and c_max < np.finfo(np.float32).max:
                        df[col] = df[col].astype(np.float32)
                    else:
                        df[col] = df[col].astype(np.float64)
        
        return df


# Global instance
memory_optimizer = MemoryOptimizer()
