"""
Report Generation API
Endpoints for generating, previewing, and retrieving professional reports
"""

import logging
from typing import Dict, Optional, List, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Response
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
import json
import io

from app.reporting.pdf_generator import PDFGenerator
from app.reporting.narrative_generator import BusinessNarrativeGenerator
from app.ml.report_confidence_scorer import ReportConfidenceScorer
from app.utils.universal_schema_detector import UniversalSchemaDetector
from app.utils.gap_analysis_engine import GapAnalysisEngine

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
pdf_generator = PDFGenerator()
narrative_generator = BusinessNarrativeGenerator()
confidence_scorer = ReportConfidenceScorer()


class ReportRequest(BaseModel):
    """Request model for report generation"""
    analysis_data: Dict[str, Any]
    domain_match: Dict[str, Any]
    gap_analysis: Dict[str, Any]
    template_type: str = "auto"  # 'auto', 'high_confidence', 'medium_confidence', 'exploratory'
    format: str = "pdf"          # 'pdf', 'html', 'json'
    customization: Optional[Dict[str, Any]] = None


class PreviewRequest(BaseModel):
    """Request model for report preview"""
    analysis_data: Dict[str, Any]
    domain_match: Dict[str, Any]
    gap_analysis: Dict[str, Any]
    template_type: str = "auto"
    customization: Optional[Dict[str, Any]] = None


@router.post("/preview", response_class=HTMLResponse)
async def preview_report(request: PreviewRequest):
    """
    Generate HTML preview of the report
    """
    try:
        # 1. Prepare report data
        report_data = _prepare_report_data(
            request.analysis_data,
            request.domain_match,
            request.gap_analysis
        )
        
        # 2. Determine template type
        template_type = request.template_type
        if template_type == "auto":
            template_type = confidence_scorer.get_report_template_type(
                report_data['confidence']['tier']
            )
        
        # 3. Generate HTML
        html_content = pdf_generator.generate_preview_html(
            template_type=template_type,
            data=report_data,
            customization=request.customization
        )
        
        return html_content
        
    except Exception as e:
        logger.error(f"Error generating preview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate")
async def generate_report(request: ReportRequest):
    """
    Generate final report in requested format
    """
    try:
        # 1. Prepare report data
        report_data = _prepare_report_data(
            request.analysis_data,
            request.domain_match,
            request.gap_analysis
        )
        
        # 2. Determine template type
        template_type = request.template_type
        if template_type == "auto":
            template_type = confidence_scorer.get_report_template_type(
                report_data['confidence']['tier']
            )
        
        # 3. Generate Output
        if request.format.lower() == "pdf":
            pdf_bytes = pdf_generator.generate_pdf(
                template_type=template_type,
                data=report_data,
                customization=request.customization
            )
            
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename=forecast_ai_report_{report_data['domain']}.pdf"
                }
            )
            
        elif request.format.lower() == "html":
            html_content = pdf_generator.generate_preview_html(
                template_type=template_type,
                data=report_data,
                customization=request.customization
            )
            return HTMLResponse(content=html_content)
            
        elif request.format.lower() == "json":
            # For JSON export, we want the structured data, not the rendered HTML
            # Convert non-serializable objects if necessary
            return report_data
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")
            
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config")
async def get_report_config():
    """
    Get available reporting configuration options
    """
    return {
        "templates": [
            {"id": "auto", "name": "Auto-detect (Recommended)", "description": "Automatically selection based on confidence score"},
            {"id": "high_confidence", "name": "Executive Report (High Confidence)", "description": "Detailed insights and forecasts for robust data"},
            {"id": "medium_confidence", "name": "Standard Report", "description": "Balanced view with proxy indicators"},
            {"id": "exploratory", "name": "Exploratory Analysis", "description": "Focus on data quality and initial patterns"}
        ],
        "formats": [
            {"id": "pdf", "name": "PDF Document", "extension": ".pdf"},
            {"id": "html", "name": "Interactive HTML", "extension": ".html"},
            {"id": "json", "name": "Raw Data (JSON)", "extension": ".json"}
        ],
        "customization_options": [
            {"id": "show_technical_details", "type": "boolean", "default": True, "label": "Include Technical Appendix"},
            {"id": "company_name", "type": "text", "default": "ForecastAI", "label": "Company Name"},
            {"id": "include_raw_data", "type": "boolean", "default": False, "label": "Append Raw Data CSV"}
        ]
    }


def _prepare_report_data(
    analysis_data: Dict,
    domain_match: Dict,
    gap_analysis: Dict
) -> Dict:
    """
    Orchestrate the preparation of all report component data.
    This acts as the 'Director' in the builder pattern.
    """
    
    domain = domain_match.get('domain', 'generic')
    
    # 1. Calculate Confidence
    # We need to reconstruct the dataframe-like inputs expected by the scorer
    # Since we are receiving JSON, we might need to approximate or assume 
    # analysis_data contains pre-calculated metrics.
    # ideally, scorer expects a DF, but here we might work with metadata if DF is too large to pass around.
    # For now, let's assume analysis data contains enough summary stats.
    
    # NOTE: In a real flow, we might fetch the DF from a cache/store using an ID.
    # Here we assume the client sends essential summary stats or we calculate simplistic confidence
    # if full DF isn't available.
    
    # Let's use the provided structured data
    import pandas as pd
    confidence = confidence_scorer.calculate_confidence(
        df=pd.DataFrame(), # Mock empty DF if actual data not passed, relies on metadata
        domain_match=domain_match,
        gap_analysis=gap_analysis,
        analysis_type='forecast'
    )
    
    # 2. Generate Business Narratives
    insights = narrative_generator.generate_insights(
        domain=domain,
        analysis_results=analysis_data,
        confidence=confidence.__dict__ # Convert dataclass to dict
    )
    
    recommendations = narrative_generator.generate_recommendations(
        domain=domain,
        analysis_results=analysis_data,
        gaps=gap_analysis.get('gaps', []),
        confidence=confidence.__dict__
    )
    
    # 3. Assemble Complete Data Context
    return {
        'domain': domain,
        'domain_match': domain_match,
        'confidence': confidence.__dict__, # JSON serializable
        'gaps': gap_analysis.get('gaps', []),
        'limitations': confidence.limitations,
        'strengths': confidence.strengths,
        
        # Analysis Results
        'forecast': analysis_data.get('forecast'),
        'historical': analysis_data.get('historical'),
        'kpis': analysis_data.get('kpis', []),
        
        # Generated Narratives
        'insights': insights,
        'recommendations': recommendations,
        
        # Placeholders for Chart Generator (will be filled by PDFGenerator if missing)
        'charts': analysis_data.get('charts', {})
    }
