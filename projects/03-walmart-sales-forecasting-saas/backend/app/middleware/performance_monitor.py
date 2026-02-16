"""
Performance Monitoring Middleware
Tracks request duration, memory usage, and error rates
"""

import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.utils.memory_optimizer import memory_optimizer

logger = logging.getLogger(__name__)


class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """
    Monitor API performance and resource usage
    """
    
    async def dispatch(self, request: Request, call_next):
        # Start timing
        start_time = time.time()
        
        # Get initial memory
        initial_memory = memory_optimizer.get_memory_usage()
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Get final memory
            final_memory = memory_optimizer.get_memory_usage()
            memory_delta = final_memory['rss_mb'] - initial_memory['rss_mb']
            
            # Log performance metrics
            logger.info(
                f"Request: {request.method} {request.url.path} | "
                f"Duration: {duration:.2f}s | "
                f"Memory: {final_memory['rss_gb']:.2f}GB (Δ {memory_delta:+.1f}MB) | "
                f"Status: {response.status_code}"
            )
            
            # Check memory limits
            memory_optimizer.check_memory_limit()
            
            # Add performance headers
            response.headers["X-Response-Time"] = f"{duration:.3f}s"
            response.headers["X-Memory-Usage"] = f"{final_memory['rss_gb']:.2f}GB"
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Request FAILED: {request.method} {request.url.path} | "
                f"Duration: {duration:.2f}s | "
                f"Error: {str(e)}"
            )
            raise
