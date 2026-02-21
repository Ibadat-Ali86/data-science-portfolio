from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(current_user: User = Depends(get_current_active_user)):
    """Get dashboard KPI metrics"""
    # Mock data for now - will implement real calculations later
    return {
        "kpis": {
            "mape": {
                "value": "1.23%",
                "change": "-0.15%",
                "trend": "down"
            },
            "savings": {
                "value": "$2.5M",
                "change": "+12.3%",
                "trend": "up"
            },
            "products": {
                "value": "1,234",
                "change": "+45",
                "trend": "up"
            },
            "stockouts": {
                "value": "23",
                "change": "-8",
                "trend": "down"
            }
        }
    }

@router.get("/chart-data")
async def get_chart_data(
    days: int = 30,
    current_user: User = Depends(get_current_active_user)
):
    """Get chart data for dashboard"""
    # Mock data - will implement real data fetching later
    return {
        "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
        "actual": [15000, 18000, 16500, 19200, 17800, 20500, 19000, 21000],
        "forecast": [16000, 17500, 17000, 19000, 18500, 20000, 19500, 20800]
    }
