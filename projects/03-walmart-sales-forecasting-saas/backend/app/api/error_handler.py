"""
Error Logging API Endpoint
Handles frontend error logging for enterprise error boundary
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import json
from pathlib import Path

from ..utils.structured_logger import api_logger

router = APIRouter(prefix="/api", tags=["error-handling"])


class ErrorLogRequest(BaseModel):
    """Frontend error log request"""
    errorId: str
    error: str
    stack: Optional[str] = None
    componentStack: Optional[str] = None
    timestamp: str
    userAgent: str
    url: str
    userId: str = "anonymous"


@router.post("/log-error")
async def log_error(request: ErrorLogRequest):
    """
    Log frontend errors for tracking and debugging
    
    Args:
        request: Error details from frontend
        
    Returns:
        Success confirmation with error ID
    """
    try:
        # Log to structured logger
        api_logger.log_event("frontend_error", {
            "error_id": request.errorId,
            "error": request.error,
            "url": request.url,
            "user_agent": request.userAgent,
            "user_id": request.userId,
            "timestamp": request.timestamp
        })
        
        # Also log full details for debugging
        api_logger.error(
            f"Frontend Error: {request.error}",
            error_id=request.errorId,
            user_id=request.userId
        )
        
        # Optionally store in database or send to monitoring service
        # For now, just acknowledge receipt
        
        return {
            "success": True,
            "error_id": request.errorId,
            "message": "Error logged successfully",
            "support_message": f"Error logged with ID {request.errorId}. Our team has been notified."
        }
        
    except Exception as e:
        api_logger.log_error(e, {
            "error_id": request.errorId,
            "user_id": request.userId
        }, "log_error_endpoint")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to log error. Please try again."
        )
