"""
Confidence API Endpoints
New endpoints for domain detection and confidence scoring
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import logging

from app.utils.universal_schema_detector import UniversalSchemaDetector, DomainMatch
from app.utils.gap_analysis_engine import GapAnalysisEngine, GapAnalysisResult
from app.utils.universal_schema_detector import DOMAIN_SCHEMAS

logger = logging.getLogger(__name__)

router = APIRouter()


class DomainDetectionRequest(BaseModel):
    """Request for domain detection"""
    session_id: str


class DomainDetectionResponse(BaseModel):
    """Response with domain detection results"""
    domain: str
    domain_confidence: float
    matched_columns: Dict[str, tuple]  # {schema_col: (actual_col, confidence)}
    missing_critical: List[str]
    missing_optional: List[str]
    intent: str
    all_domain_scores: Dict[str, float]  # For domain override UI


class GapAnalysisResponse(BaseModel):
    """Complete gap analysis response"""
    domain: str
    domain_confidence: float
    matched_columns: Dict
    gaps: List[Dict]
    can_proceed: bool
    proceed_with_limitations: bool
    limitations: List[str]


@router.post("/api/detect-domain", response_model=DomainDetectionResponse)
async def detect_domain(request: DomainDetectionRequest):
    """
    Detect domain for uploaded dataset
    
    This endpoint analyzes the dataset structure and returns:
    - Best matching domain
    - Confidence score
    - Matched columns
    - Missing columns
    - All domain scores (for override UI)
    """
    try:
        session_id = request.session_id
        
        # Load session data
        session_file = f"sessions/{session_id}_data.pkl"
        if not os.path.exists(session_file):
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = pd.read_pickle(session_file)
        
        # Run domain detection
        detector = UniversalSchemaDetector(min_confidence=70.0)
        domain_match = detector.detect_domain(df)
        all_scores = detector.get_all_domain_scores(df)
        
        logger.info(f"Domain detected: {domain_match.domain} ({domain_match.confidence:.1f}% confidence)")
        
        return DomainDetectionResponse(
            domain=domain_match.domain,
            domain_confidence=domain_match.confidence,
            matched_columns=domain_match.matched_columns,
            missing_critical=domain_match.missing_critical,
            missing_optional=domain_match.missing_optional,
            intent=domain_match.intent,
            all_domain_scores=all_scores
        )
        
    except Exception as e:
        logger.error(f"Domain detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Domain detection failed: {str(e)}")


@router.post("/api/gap-analysis", response_model=GapAnalysisResponse)
async def analyze_gaps(request: DomainDetectionRequest):
    """
    Perform comprehensive gap analysis
    
    Returns:
    - Domain and confidence
    - Matched columns
    - Detailed gaps with suggestions
    - Can proceed flags
    - Limitations list
    """
    try:
        session_id = request.session_id
        
        # Load session data
        session_file = f"sessions/{session_id}_data.pkl"
        if not os.path.exists(session_file):
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = pd.read_pickle(session_file)
        
        # Detect domain
        detector = UniversalSchemaDetector(min_confidence=70.0)
        domain_match = detector.detect_domain(df)
        
        # Get schema for detected domain
        schema = DOMAIN_SCHEMAS[domain_match.domain]
        
        # Run gap analysis
        gap_engine = GapAnalysisEngine()
        gap_result = gap_engine.analyze_gaps(df, domain_match, schema)
        
        # Convert gaps to serializable format
        gaps_list = []
        for gap in gap_result.gaps:
            gaps_list.append({
                'gap_type': gap.gap_type.value,
                'missing_column': gap.missing_column,
                'suggestion': gap.suggestion,
                'confidence': gap.confidence,
                'action_type': gap.action_type,
                'options': gap.options
            })
        
        logger.info(f"Gap analysis complete: {len(gaps_list)} gaps found")
        
        return GapAnalysisResponse(
            domain=gap_result.domain,
            domain_confidence=gap_result.domain_confidence,
            matched_columns=gap_result.matched_columns,
            gaps=gaps_list,
            can_proceed=gap_result.can_proceed,
            proceed_with_limitations=gap_result.proceed_with_limitations,
            limitations=gap_result.limitations
        )
        
    except Exception as e:
        logger.error(f"Gap analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gap analysis failed: {str(e)}")


@router.get("/api/domains")
async def get_all_domains():
    """
    Get list of all supported domains
    
    Returns domain metadata for UI display
    """
    try:
        domains_info = {}
        
        for domain_id, schema in DOMAIN_SCHEMAS.items():
            domains_info[domain_id] = {
                'id': domain_id,
                'name': schema['name'],
                'description': schema['description'],
                'required_patterns': list(schema['required_patterns'].keys()),
                'optional_patterns': list(schema['optional_patterns'].keys()),
                'time_dependent': schema['time_dependent'],
                'kpis': schema['kpis']
            }
        
        return {"domains": domains_info}
        
    except Exception as e:
        logger.error(f"Failed to get domains: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/confidence/thresholds")
async def get_confidence_thresholds():
    """
    Get system confidence thresholds
    
    Returns thresholds for different confidence levels
    """
    return {
        "thresholds": {
            "domain_detection": {
                "high": 80,
                "medium": 60,
                "low": 40
            },
            "column_mapping": {
                "high": 85,
                "medium": 70,
                "low": 50
            },
            "analysis_confidence": {
                "high": 90,
                "medium": 70,
                "exploratory": 50
            }
        }
    }


import os
