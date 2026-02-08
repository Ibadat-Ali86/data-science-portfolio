from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    product_code: str
    product_name: str
    category: Optional[str] = None
    unit_price: Optional[float] = None
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    description: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
