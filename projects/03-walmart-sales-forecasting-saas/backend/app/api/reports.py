from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from app.services.report_generator import ReportGenerator
from app.services.storage import storage
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

report_service = ReportGenerator()

@router.post("/generate/{session_id}")
async def generate_report(session_id: str):
    """
    Generates a professional PDF report for the given session.
    """
    try:
        session_data = storage.load_session(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Add basic metrics if missing (robustness)
        if 'metrics' not in session_data:
            session_data['metrics'] = {"mape": 0.0, "rmse": 0.0, "modelType": "N/A"}
            
        pdf_bytes = report_service.generate_pdf(session_data)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=forecast_report_{session_id[:8]}.pdf"
            }
        )
    except RuntimeError as e:
        # WeasyPrint missing
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.get("/download/{session_id}")
async def download_report(session_id: str):
    """
    Download PDF report via GET request.
    """
    return await generate_report(session_id)

from pydantic import BaseModel

class ScenarioReportRequest(BaseModel):
    baseline: dict
    results: dict
    scenarios: dict

from datetime import datetime

@router.post("/generate_scenario")
async def generate_scenario_report(request: ScenarioReportRequest):
    """
    Generates a PDF report comparing baseline vs. simulated scenario.
    """
    try:
        # Convert Pydantic model to dict
        scenario_data = request.dict()
        
        pdf_bytes = report_service.generate_scenario_pdf(scenario_data)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=scenario_report_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
            }
        )
    except RuntimeError as e:
        logger.error(f"Scenario report failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in scenario report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate scenario report")
