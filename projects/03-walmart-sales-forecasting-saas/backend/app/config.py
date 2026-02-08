from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "ML Forecast SaaS"
    DEBUG: bool = False
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    
    # Database (legacy - now using Supabase)
    DATABASE_URL: str = "sqlite:///./data/forecast.db"
    
    # Supabase Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None  # Server-side key (not anon)
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Allow Vercel frontend and local development
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://*.vercel.app",
    ]
    
    # ML Models
    MODEL_DIR: str = "./app/ml/models"
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    
    # Render-specific settings
    PORT: int = int(os.getenv("PORT", "8080"))
    
    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra env vars

settings = Settings()

# Parse ALLOWED_ORIGINS from environment if set as comma-separated string
if os.getenv("ALLOWED_ORIGINS"):
    settings.ALLOWED_ORIGINS = [
        origin.strip() 
        for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    ]

