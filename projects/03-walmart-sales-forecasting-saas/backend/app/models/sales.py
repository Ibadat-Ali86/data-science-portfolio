from sqlalchemy import Column, Integer, Float, Date, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Sales(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    revenue = Column(Float)
    region = Column(String(100))
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
