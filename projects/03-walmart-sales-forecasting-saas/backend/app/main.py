
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"📦 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🌐 CORS Origins: {settings.ALLOWED_ORIGINS}")
    
    # Initialize database connection (if not using Supabase exclusively)
    try:
        if settings.SUPABASE_URL:
            logger.info(f"✅ Supabase configured: {settings.SUPABASE_URL[:30]}...")
        else:
            # Fallback to local SQLite for development
            from app.database import engine, Base
            Base.metadata.create_all(bind=engine)
            logger.info("✅ Local SQLite database initialized")
            
            # Initialize default data
            from app.utils.init_db import init_default_user
            init_default_user()
    except Exception as e:
        logger.warning(f"⚠️ Database initialization: {e}")
    
    # Run Maintenance Cleanup (Task 5.1)
    try:
        from app.services.maintenance import maintenance_service
        maintenance_service.cleanup_old_files(max_age_hours=24)
        logger.info("🧹 System cleanup completed on startup")
    except Exception as e:
        logger.warning(f"⚠️ Maintenance cleanup failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Demand Forecasting System API - Powered by XGBoost",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = settings.ALLOWED_ORIGINS + [
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173", 
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"👉 Request: {request.method} {request.url} | Origin: {request.headers.get('origin')}")
    try:
        response = await call_next(request)
        logger.info(f"👈 Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"❌ Request failed: {str(e)}")
        raise e

# Include routers
from app.api import auth, dashboard, sales, forecasts, analysis, monitoring, data_pipeline, oauth
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(oauth.router, prefix="/api/auth", tags=["OAuth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales Data"])
app.include_router(forecasts.router, prefix="/api/forecasts", tags=["Forecasts"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
# app.include_router(monitoring.router, prefix="/api/monitoring", tags=["ML Monitoring"]) - Uncomment when module exists
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["ML Monitoring"])
app.include_router(data_pipeline.router, tags=["Data Pipeline"])

# Mount static files (Frontend)
# Try to find the static directory relative to the current file or working directory
static_dir = os.path.join(os.getcwd(), "app/static")
if os.path.exists(static_dir):
    # Mount assets specifically (Vite build output)
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    
    # Catch-all route for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API routes to pass through (though they should be matched above)
        if full_path.startswith("api"):
             return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        # Serve index.html for all other routes
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r") as f:
                return HTMLResponse(content=f.read())
        return JSONResponse(status_code=404, content={"detail": "Frontend not found"})
else:
    logger.warning(f"Static directory not found at {static_dir}. Frontend will not be served.")

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint with system metrics (Task 5.2)"""
    try:
        from app.services.maintenance import maintenance_service
        return maintenance_service.check_system_health()
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "degraded", 
            "error": str(e),
            "version": settings.VERSION
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
