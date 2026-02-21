"""
Model Monitoring API Endpoints
Provided by MonitoringService with persistent state
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

from app.services.auth_service import get_current_active_user
from app.models.user import User
from app.services.monitoring_service import monitor

router = APIRouter()

# Pydantic Models
class DriftCheckRequest(BaseModel):
    feature_data: Dict[str, List[float]]
    predictions: List[float]
    actuals: Optional[List[float]] = None

class DriftResponse(BaseModel):
    status: str
    severity: str
    drifted_features: List[str]
    prediction_drift_pvalue: float
    performance_drift: Optional[float]
    alert_triggered: bool
    timestamp: str
    recommendations: List[str]

class HealthStatus(BaseModel):
    status: str
    model_version: str
    last_training: str
    reference_mape: float
    current_mape: Optional[float]
    n_predictions_today: int
    uptime_hours: float

@router.get("/health", response_model=HealthStatus)
async def get_model_health(current_user: User = Depends(get_current_active_user)):
    """Get current model health status from monitoring service."""
    try:
        status = monitor.get_health_status()
        return HealthStatus(**status)
    except Exception as e:
        # Fallback for empty state or error
        return HealthStatus(
            status="unknown",
            model_version="v2.0.0",
            last_training=datetime.now().isoformat(),
            reference_mape=0.0,
            current_mape=0.0,
            n_predictions_today=0,
            uptime_hours=0.0
        )

@router.post("/check-drift", response_model=DriftResponse)
async def check_drift(
    request: DriftCheckRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Check for data and model drift using monitoring service."""
    result = monitor.check_drift(
        request.feature_data, 
        request.predictions, 
        request.actuals
    )
    return DriftResponse(**result)

@router.get("/alerts")
async def get_alerts(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user)
):
    """Get recent monitoring alerts."""
    return monitor.get_alerts(limit)

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Acknowledge a monitoring alert."""
    success = monitor.acknowledge_alert(alert_id, current_user.email)
    return {
        "status": "acknowledged" if success else "failed",
        "alert_id": alert_id,
        "acknowledged_by": current_user.email,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/metrics")
async def get_metrics(current_user: User = Depends(get_current_active_user)):
    """Get model performance metrics for monitoring dashboard."""
    # Combine health and historical trend
    health = monitor.get_health_status()
    history = monitor.get_metrics_history()
    
    return {
        "current_metrics": {
            "mape": health["current_mape"],
            "reference_mape": health["reference_mape"],
        },
        "trend": history["trend"],
        "model_version": health["model_version"],
        "last_updated": datetime.now().isoformat()
    }

@router.get("/drift-history")
async def get_drift_history(
    days: int = 7,
    current_user: User = Depends(get_current_active_user)
):
    """Get drift detection history."""
    # Return last N history items from state
    # Simplified view
    history = monitor.state.get("drift_history", [])[-days:]
    return {
        "history": history,
        "count": len(history)
    }
