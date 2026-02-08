import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from app.config import settings
import os

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
    except Exception as e:
        logger.warning(f"⚠️ Database initialization: {e}")
    
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from app.api import auth, dashboard, sales, forecasts, analysis, monitoring
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales Data"])
app.include_router(forecasts.router, prefix="/api/forecasts", tags=["Forecasts"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["ML Monitoring"])

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
    """Health check endpoint for Render and monitoring"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

