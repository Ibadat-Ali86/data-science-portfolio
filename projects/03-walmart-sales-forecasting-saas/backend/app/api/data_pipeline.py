"""
Data Pipeline API Endpoints
Handles format detection, column mapping, and data conversion
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import logging
import os
import tempfile
import shutil

from ..services.format_detector import FormatDetector
from ..services.large_dataset_processor import LargeDatasetProcessor

router = APIRouter(prefix="/api/data-pipeline", tags=["data-pipeline"])
logger = logging.getLogger(__name__)

# Pydantic models
class ColumnMappingRequest(BaseModel):
    file_path: str
    mapping: Dict
    encoding: str = 'utf-8'
    separator: str = ','

class ConversionResponse(BaseModel):
    success: bool
    message: str
    converted_file_path: Optional[str] = None
    stats: Optional[Dict] = None
    validation: Optional[Dict] = None


@router.post("/detect-format")
async def detect_file_format(file: UploadFile = File(...)):
    """
    Analyze uploaded file and detect format, encoding, and column structure
    
    Returns:
        - File encoding and confidence
        - Detected separator
        - Column names and types
        - Sample data (first 5 rows)
        - Suggested column mappings with confidence scores
    """
    try:
        logger.info(f"Detecting format for file: {file.filename}")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            # Universal Data Adapter
            from ..services.data_adapter import DataAdapter
            adapter = DataAdapter()
            
            # Read and Normalize
            df_raw = adapter.read_file(tmp_path)
            
            # GATE 1: Upload Validation
            from ..services.pipeline_validator import PipelineValidator
            upload_validation = PipelineValidator.validate_upload(df_raw)
            if not upload_validation['valid']:
                raise HTTPException(status_code=400, detail=f"Data Quality Gate Failed (Upload): {'; '.join(upload_validation['issues'])}")

            df_normalized, report = adapter.normalize_dataset(df_raw)
            
            # INTELLIGENT SCHEMA DETECTION (Universal Data Adapter)
            from ..services.schema_detector import schema_detector
            gap_report = schema_detector.detect_domain(df_raw)
            
            # Construct response to match what frontend expects (partially)
            # Frontend expects: encoding, separator, columns, suggested_mapping
            # We map our robust report to that structure
            
            format_info = {
                'filename': file.filename,
                'file_path': tmp_path,
                'file_size': len(content),
                'encoding': 'utf-8', # Assumed/Handled by pandas
                'separator': 'auto',
                'num_rows': len(df_raw),
                'num_columns': len(df_raw.columns),
                'columns': list(df_raw.columns),
                'sample_data': df_raw.head(5).astype(str).to_dict('records'),
                'schema_analysis': gap_report.dict(), # New Universal Adapter field
                'suggested_mapping': {
                    'mapping': {
                        'date': {'source_column': report['column_mapping'].get('date'), 'confidence': 100 if report['column_mapping'].get('date') else 0},
                        'target': {'source_column': report['column_mapping'].get('target'), 'confidence': 100 if report['column_mapping'].get('target') else 0},
                        'item': {'source_column': report['column_mapping'].get('item'), 'confidence': 100 if report['column_mapping'].get('item') else 0},
                        'location': {'source_column': report['column_mapping'].get('location'), 'confidence': 100 if report['column_mapping'].get('location') else 0},
                    },
                    'confidence_score': 90, # Adapter is confident
                    'missing_columns': [k for k,v in report['column_mapping'].items() if v is None]
                }
            }
            
            # Log adapter report
            logger.info(f"Adapter Transformations: {report['transformations']}")
            logger.info(f"Adapter Warnings: {report['warnings']}")
            logger.info(f"Detected Domain: {gap_report.domain} (Confidence: {gap_report.confidence})")
            
            return JSONResponse(content=format_info)
            
        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            raise
            
    except Exception as e:
        logger.error(f"Format detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Format detection failed: {str(e)}")


@router.post("/convert-format", response_model=ConversionResponse)
async def convert_data_format(request: ColumnMappingRequest):
    """
    Convert uploaded data to standard format using confirmed column mappings
    
    Args:
        request: Contains file_path, mapping dict, encoding, and separator
        
    Returns:
        - Success status
        - Path to converted file
        - Validation results
        - Statistics
    """
    try:
        logger.info(f"Converting file: {request.file_path}")
        
        # Check if file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Load the file
        import pandas as pd
        df = pd.read_csv(
            request.file_path,
            sep=request.separator,
            encoding=request.encoding
        )
        
        logger.info(f"Loaded file: {len(df)} rows, {len(df.columns)} columns")
        
        # Convert to standard format using DataAdapter
        from ..services.data_adapter import DataAdapter
        adapter = DataAdapter()
        
        # 1. Read
        df_raw = adapter.read_file(request.file_path)
        
        # 2. Preprocess (must match detect-format step)
        df_preprocessed, _ = adapter.preprocess_data(df_raw)
        
        # 3. Apply Mapping
        standard_df, conversion_report = adapter.apply_mapping(df_preprocessed, request.mapping)
        
        # GATE 2: Preprocessing Validation
        from ..services.pipeline_validator import PipelineValidator
        preprocess_validation = PipelineValidator.validate_preprocessing(standard_df)
        if not preprocess_validation['valid']:
             # We return success=False here to let frontend handle it gracefully instead of 400
             return ConversionResponse(
                success=False,
                message="Data Quality Gate Failed (Preprocess): " + "; ".join(preprocess_validation['issues']),
                validation=preprocess_validation
            )

        # 4. Adapter Validation (Legacy/Detailed)
        validation = adapter.validate_dataset(standard_df)
        
        if not validation['is_valid']:
            logger.warning(f"Validation errors: {validation['errors']}")
            return ConversionResponse(
                success=False,
                message="Validation failed: " + "; ".join(validation['errors']),
                validation=validation
            )
        
        # Save converted file
        converted_dir = os.path.join(tempfile.gettempdir(), 'converted_datasets')
        os.makedirs(converted_dir, exist_ok=True)
        
        converted_filename = f"converted_{os.path.basename(request.file_path)}"
        converted_path = os.path.join(converted_dir, converted_filename)
        
        standard_df.to_csv(converted_path, index=False)
        
        logger.info(f"Conversion successful: {converted_path}")
        
        return ConversionResponse(
            success=True,
            message="Conversion successful",
            converted_file_path=converted_path,
            stats=validation['stats'],
            validation=validation
        )
        
    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@router.get("/conversion-progress/{session_id}")
async def get_conversion_progress(session_id: str):
    """
    Get progress of large file conversion
    
    Note: This is a placeholder for future session-based progress tracking
    Currently returns immediate response since conversion is synchronous
    """
    # TODO: Implement session-based progress tracking for large files
    # For now, return a simple response
    return {
        "session_id": session_id,
        "progress": 100,
        "status": "completed",
        "message": "Conversion completed"
    }


@router.delete("/cleanup/{file_path:path}")
async def cleanup_temporary_file(file_path: str):
    """
    Clean up temporary uploaded files
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up temporary file: {file_path}")
            return {"success": True, "message": "File cleaned up"}
        else:
            return {"success": False, "message": "File not found"}
    except Exception as e:
        logger.error(f"Cleanup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")
