"""
Model Monitoring API Endpoints

Provides endpoints for:
- Model health status
- Drift detection results
- Performance tracking
- Alert management

Author: ML Team
Date: 2026-02-08
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import numpy as np

from app.services.auth_service import get_current_active_user
from app.models.user import User

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


# In-memory storage for demo (replace with database in production)
monitoring_state = {
    "reference_mape": 1.23,
    "current_mape": 1.35,
    "last_training": "2026-02-01T00:00:00",
    "model_version": "v2.0_ensemble",
    "n_predictions_today": 0,
    "start_time": datetime.now(),
    "alerts": [],
    "drift_history": []
}


@router.get("/health", response_model=HealthStatus)
async def get_model_health(current_user: User = Depends(get_current_active_user)):
    """
    Get current model health status.
    
    Returns key metrics about model performance and drift status.
    """
    uptime = (datetime.now() - monitoring_state["start_time"]).total_seconds() / 3600
    
    return HealthStatus(
        status="healthy" if monitoring_state["current_mape"] < 2.0 else "degraded",
        model_version=monitoring_state["model_version"],
        last_training=monitoring_state["last_training"],
        reference_mape=monitoring_state["reference_mape"],
        current_mape=monitoring_state["current_mape"],
        n_predictions_today=monitoring_state["n_predictions_today"],
        uptime_hours=round(uptime, 2)
    )


@router.post("/check-drift", response_model=DriftResponse)
async def check_drift(
    request: DriftCheckRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Check for data and model drift.
    
    Uses Kolmogorov-Smirnov test for feature distribution drift
    and tracks performance degradation.
    """
    try:
        from scipy.stats import ks_2samp
    except ImportError:
        # Mock response if scipy not available
        return DriftResponse(
            status="ok",
            severity="none",
            drifted_features=[],
            prediction_drift_pvalue=0.95,
            performance_drift=None,
            alert_triggered=False,
            timestamp=datetime.now().isoformat(),
            recommendations=["Scipy not installed for drift detection"]
        )
    
    drifted_features = []
    
    # Check each feature for drift (comparing to reference distribution)
    # In production, this would compare against stored reference data
    for feature_name, values in request.feature_data.items():
        # Generate synthetic reference data for demo
        reference = np.random.normal(np.mean(values), np.std(values) * 0.9, len(values))
        
        try:
            _, p_value = ks_2samp(reference, values)
            if p_value < 0.05:
                drifted_features.append(feature_name)
        except Exception:
            continue
    
    # Check prediction drift
    reference_preds = np.random.normal(np.mean(request.predictions), np.std(request.predictions), len(request.predictions))
    _, pred_p_value = ks_2samp(reference_preds, request.predictions)
    
    # Calculate performance drift if actuals provided
    performance_drift = None
    if request.actuals:
        current_mape = np.mean(np.abs((np.array(request.actuals) - np.array(request.predictions)) / (np.array(request.actuals) + 1e-6))) * 100
        performance_drift = current_mape - monitoring_state["reference_mape"]
        monitoring_state["current_mape"] = current_mape
    
    # Determine severity
    n_drifted = len(drifted_features)
    if performance_drift and performance_drift > 1.0 or n_drifted > 5:
        severity = "critical"
        alert_triggered = True
    elif performance_drift and performance_drift > 0.5 or n_drifted > 2:
        severity = "high"
        alert_triggered = True
    elif n_drifted > 0 or pred_p_value < 0.05:
        severity = "medium"
        alert_triggered = True
    else:
        severity = "none"
        alert_triggered = False
    
    # Generate recommendations
    recommendations = []
    if alert_triggered:
        recommendations.append("Review drifted features for data quality issues")
        if performance_drift and performance_drift > 0.5:
            recommendations.append("Consider model retraining")
        if n_drifted > 3:
            recommendations.append("Check data pipeline for changes")
    else:
        recommendations.append("Model performing within acceptable parameters")
    
    # Store in history
    monitoring_state["drift_history"].append({
        "timestamp": datetime.now().isoformat(),
        "severity": severity,
        "n_drifted": n_drifted
    })
    
    return DriftResponse(
        status="ok",
        severity=severity,
        drifted_features=drifted_features,
        prediction_drift_pvalue=round(pred_p_value, 4),
        performance_drift=round(performance_drift, 2) if performance_drift else None,
        alert_triggered=alert_triggered,
        timestamp=datetime.now().isoformat(),
        recommendations=recommendations
    )


@router.get("/alerts")
async def get_alerts(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user)
):
    """Get recent monitoring alerts."""
    # In production, fetch from database
    alerts = [
        {
            "id": 1,
            "severity": "medium",
            "title": "Feature drift detected",
            "description": "Temperature feature showing distribution shift",
            "timestamp": "2026-02-07T14:30:00",
            "acknowledged": False
        },
        {
            "id": 2,
            "severity": "low",
            "title": "Performance stable",
            "description": "Model MAPE within target range",
            "timestamp": "2026-02-07T10:00:00",
            "acknowledged": True
        }
    ]
    
    return {
        "alerts": alerts[:limit],
        "total": len(alerts),
        "unacknowledged": sum(1 for a in alerts if not a["acknowledged"])
    }


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Acknowledge a monitoring alert."""
    return {
        "status": "acknowledged",
        "alert_id": alert_id,
        "acknowledged_by": current_user.email,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/metrics")
async def get_metrics(current_user: User = Depends(get_current_active_user)):
    """Get model performance metrics for monitoring dashboard."""
    return {
        "current_metrics": {
            "mape": monitoring_state["current_mape"],
            "rmse": 145.32,
            "mae": 98.45,
            "r2": 0.967
        },
        "reference_metrics": {
            "mape": monitoring_state["reference_mape"],
            "rmse": 120.45,
            "mae": 85.23,
            "r2": 0.982
        },
        "trend": {
            "mape_7d": [1.20, 1.22, 1.25, 1.28, 1.30, 1.33, 1.35],
            "predictions_per_day": [1250, 1340, 1180, 1420, 1380, 1290, 1350]
        },
        "model_version": monitoring_state["model_version"],
        "last_updated": datetime.now().isoformat()
    }


@router.get("/drift-history")
async def get_drift_history(
    days: int = 7,
    current_user: User = Depends(get_current_active_user)
):
    """Get drift detection history for trend analysis."""
    # Mock historical data
    history = []
    for i in range(days):
        history.append({
            "date": f"2026-02-0{i+1}",
            "feature_drift_count": np.random.randint(0, 3),
            "prediction_drift_pvalue": round(np.random.uniform(0.05, 0.95), 3),
            "mape": round(1.2 + np.random.uniform(-0.1, 0.2), 2)
        })
    
    return {
        "history": history,
        "avg_drift_count": round(np.mean([h["feature_drift_count"] for h in history]), 2),
        "trend": "stable" if history[-1]["mape"] < 1.5 else "degrading"
    }
