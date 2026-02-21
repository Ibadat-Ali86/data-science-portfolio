from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class SalesBase(BaseModel):
    product_id: int
    date: date
    quantity: float
    revenue: Optional[float] = None
    region: Optional[str] = None

class SalesCreate(SalesBase):
    pass

class SalesResponse(SalesBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ForecastBase(BaseModel):
    product_id: int
    model_type: str
    forecast_date: date
    predicted_quantity: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    confidence_level: Optional[float] = 95.0

class ForecastCreate(ForecastBase):
    pass

class ForecastResponse(ForecastBase):
    id: int
    generated_at: datetime
    
    class Config:
        from_attributes = True
