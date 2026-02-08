from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    model_type = Column(String(50), nullable=False)  # ARIMA, Prophet, LSTM, etc.
    forecast_date = Column(Date, nullable=False, index=True)
    predicted_quantity = Column(Float, nullable=False)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    confidence_level = Column(Float, default=95.0)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    generated_by = Column(Integer, ForeignKey("users.id"))

class Model(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)
    model_path = Column(String(255), nullable=False)
    accuracy_metrics = Column(JSON)  # Store MAPE, RMSE, etc.
    training_date = Column(DateTime(timezone=True))
    is_active = Column(Integer, default=1)
    created_by = Column(Integer, ForeignKey("users.id"))

class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String(255), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    base_forecast_id = Column(Integer, ForeignKey("forecasts.id"))
    parameters = Column(JSON)  # Scenario parameters
    results = Column(JSON)  # Scenario results
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_name = Column(String(255), nullable=False)
    report_type = Column(String(50))  # pdf, excel, csv
    file_path = Column(String(255))
    parameters = Column(JSON)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    generated_by = Column(Integer, ForeignKey("users.id"))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    table_name = Column(String(100))
    record_id = Column(Integer)
    details = Column(JSON)
    ip_address = Column(String(45))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
