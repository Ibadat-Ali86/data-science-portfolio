
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

from starlette.middleware.sessions import SessionMiddleware
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

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
from app.api import auth, dashboard, sales, forecasts, analysis, monitoring, data_pipeline, oauth, error_handler
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(oauth.router, prefix="/api/auth", tags=["OAuth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales Data"])
app.include_router(forecasts.router, prefix="/api/forecasts", tags=["Forecasts"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["ML Monitoring"])
app.include_router(data_pipeline.router, tags=["Data Pipeline"])

# WebSocket Endpoint
from fastapi import WebSocket, WebSocketDisconnect
from app.services.websocket_manager import manager

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    # Parse client_id to determine subscription type
    # Format: "session:uuid" or "user:uuid"
    session_id = None
    user_id = None
    
    if client_id.startswith("session:"):
        session_id = client_id.split(":")[1]
    elif client_id.startswith("user:"):
        user_id = client_id.split(":")[1]
        
    await manager.connect(websocket, session_id, user_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages (e.g. pings)
            data = await websocket.receive_text()
            # Optional: handle client messages
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id, user_id)
app.include_router(error_handler.router, tags=["Error Handling"])

# Reports API
from app.api import reports
app.include_router(reports.router, prefix="/api/reports", tags=["Reporting"])

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

@app.get("/api/health")
async def health_check_alias():
    return await health_check()

@app.get("/api/health/detailed")
async def detailed_health_check():
    """Detailed health check with circuit breaker states and pipeline info"""
    import psutil
    import os
    
    health_data = {
        "status": "operational",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        "system": {}
    }
    
    # System metrics
    try:
        health_data["system"] = {
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        }
    except Exception:
        health_data["system"] = {"error": "psutil not available"}
    
    # Circuit breaker states
    try:
        from app.utils.circuit_breaker import ml_training_breaker, data_profiling_breaker, database_breaker
        health_data["circuit_breakers"] = {
            "ml_training": ml_training_breaker.get_status(),
            "data_profiling": data_profiling_breaker.get_status(),
            "database": database_breaker.get_status()
        }
    except Exception as e:
        health_data["circuit_breakers"] = {"error": str(e)}
    
    # Active sessions count
    try:
        from app.api.analysis import training_jobs
        health_data["active_sessions"] = len(training_jobs)
    except Exception:
        health_data["active_sessions"] = "unknown"
    
    return health_data



if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
