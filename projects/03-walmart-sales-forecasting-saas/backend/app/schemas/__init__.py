# Import all schemas for easier access
from app.schemas.user import UserCreate, UserResponse, UserUpdate, Token, TokenData
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.schemas.forecast import SalesCreate, SalesResponse, ForecastCreate, ForecastResponse

__all__ = [
    "UserCreate",
    "UserResponse",
    "UserUpdate",
    "Token",
    "TokenData",
    "ProductCreate",
    "ProductResponse",
    "ProductUpdate",
    "SalesCreate",
    "SalesResponse",
    "ForecastCreate",
    "ForecastResponse",
]
