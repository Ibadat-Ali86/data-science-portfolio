# Import all models for easier access
from app.models.user import User
from app.models.product import Product
from app.models.sales import Sales
from app.models.forecast import Forecast, Model, Scenario, Report, AuditLog

__all__ = [
    "User",
    "Product",
    "Sales",
    "Forecast",
    "Model",
    "Scenario",
    "Report",
    "AuditLog",
]
