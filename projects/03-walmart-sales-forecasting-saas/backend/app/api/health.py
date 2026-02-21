"""
Health Monitoring API — Phase 5

Endpoints:
  GET /health         — Quick liveness probe
  GET /health/ready   — Readiness probe (checks dependencies)
  GET /health/metrics — Detailed system metrics (memory, CPU, jobs)
"""
import os
import time
import psutil
import logging
from datetime import datetime
from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])

_start_time = time.time()


@router.get("")
@router.get("/")
async def health_liveness():
    """Quick liveness check — returns 200 if process is alive."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime_seconds": round(time.time() - _start_time, 1),
    }


@router.get("/ready")
async def health_readiness():
    """
    Readiness probe — checks that critical dependencies are available.
    Suitable for container orchestrator readiness gates.
    """
    checks = {}

    # 1. Check ML imports
    try:
        from app.ml import data_adapter, model_router, pipeline_validator  # noqa: F401
        checks["ml_modules"] = {"status": "ok"}
    except Exception as e:
        checks["ml_modules"] = {"status": "fail", "error": str(e)}

    # 2. Check data directory is writable
    data_dir = os.path.join(os.getcwd(), "data")
    try:
        os.makedirs(data_dir, exist_ok=True)
        test_path = os.path.join(data_dir, ".healthcheck")
        with open(test_path, "w") as f:
            f.write("ok")
        os.remove(test_path)
        checks["data_dir"] = {"status": "ok", "path": data_dir}
    except Exception as e:
        checks["data_dir"] = {"status": "fail", "error": str(e)}

    # 3. Check pandas/numpy
    try:
        import pandas  # noqa: F401
        import numpy   # noqa: F401
        checks["core_deps"] = {"status": "ok"}
    except Exception as e:
        checks["core_deps"] = {"status": "fail", "error": str(e)}

    all_ok = all(c["status"] == "ok" for c in checks.values())

    return {
        "ready": all_ok,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/metrics")
async def health_metrics():
    """
    Detailed system metrics — memory, CPU, disk, active training jobs.
    Use for monitoring dashboards and alerting.
    """
    process = psutil.Process(os.getpid())
    mem = process.memory_info()

    # Disk usage for data directory
    data_dir = os.path.join(os.getcwd(), "data")
    disk = {}
    try:
        usage = psutil.disk_usage(data_dir if os.path.exists(data_dir) else "/")
        disk = {
            "total_gb": round(usage.total / (1024**3), 2),
            "used_gb": round(usage.used / (1024**3), 2),
            "free_gb": round(usage.free / (1024**3), 2),
            "percent": usage.percent,
        }
    except Exception:
        disk = {"error": "unavailable"}

    # Active training jobs
    active_jobs = 0
    try:
        import json
        jobs_path = os.path.join(data_dir, "training_jobs.json")
        if os.path.exists(jobs_path):
            with open(jobs_path, "r") as f:
                jobs = json.load(f)
            active_jobs = sum(1 for j in jobs.values() if j.get("status") == "running")
    except Exception:
        pass

    return {
        "uptime_seconds": round(time.time() - _start_time, 1),
        "memory": {
            "rss_mb": round(mem.rss / (1024**2), 2),
            "vms_mb": round(mem.vms / (1024**2), 2),
            "percent": round(process.memory_percent(), 2),
        },
        "cpu": {
            "percent": process.cpu_percent(interval=0.1),
            "num_threads": process.num_threads(),
        },
        "disk": disk,
        "training": {
            "active_jobs": active_jobs,
        },
        "python_version": os.popen("python3 --version").read().strip(),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
