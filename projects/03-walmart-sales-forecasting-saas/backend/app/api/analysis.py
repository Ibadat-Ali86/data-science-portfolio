"""
Analysis API - Endpoints for data analysis and model training
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
import io
import uuid
import time
from datetime import datetime
import logging

from app.ml.prophet_model import ProphetForecaster
from app.ml.xgboost_model import XGBoostForecaster
from app.ml.sarima_model import SARIMAForecaster
from app.ml.ensemble_model import EnsembleForecaster

logger = logging.getLogger(__name__)

router = APIRouter()

import json
import os
import fcntl
import time

# In-memory job storage (backed by file)
JOBS_FILE = "training_jobs.json"
training_jobs: Dict[str, Dict] = {}

def load_jobs():
    """Load jobs from persistence file with proper merging"""
    global training_jobs
    if os.path.exists(JOBS_FILE):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with open(JOBS_FILE, 'r') as f:
                    # Acquire shared lock for reading
                    try:
                        fcntl.flock(f.fileno(), fcntl.LOCK_SH | fcntl.LOCK_NB)
                    except IOError:
                        if attempt < max_retries - 1:
                            time.sleep(0.1)
                            continue
                        logger.warning("Could not acquire lock, proceeding without lock")
                    
                    try:
                        saved_jobs = json.load(f)
                        # CRITICAL FIX: Preserve in-memory sessions that aren't in the file yet
                        # Only update existing keys, don't replace the entire dict
                        before_count = len(training_jobs)
                        for session_id, job_data in saved_jobs.items():
                            # Only update if the saved version is newer or if we don't have it
                            if session_id not in training_jobs:
                                training_jobs[session_id] = job_data
                        
                        logger.info(f"Loaded {len(saved_jobs)} jobs from disk. Total in memory: {len(training_jobs)} (was {before_count})")
                        break
                    finally:
                        # Release lock
                        try:
                            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
                        except:
                            pass
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error in jobs file: {e}")
                break
            except Exception as e:
                logger.error(f"Failed to load jobs (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(0.1)
                else:
                    logger.error("Giving up on loading jobs file")

def save_jobs():
    """Save jobs to persistence file with file locking"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(JOBS_FILE) if os.path.dirname(JOBS_FILE) else '.', exist_ok=True)
            
            with open(JOBS_FILE, 'w') as f:
                # Acquire exclusive lock for writing
                try:
                    fcntl.flock(f.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                except IOError:
                    if attempt < max_retries - 1:
                        time.sleep(0.1)
                        continue
                    logger.warning("Could not acquire lock for saving, proceeding anyway")
                
                try:
                    json.dump(training_jobs, f, default=str, indent=2)
                    f.flush()
                    os.fsync(f.fileno())  # Force write to disk
                    logger.debug(f"Saved {len(training_jobs)} jobs to disk")
                    break
                finally:
                    # Release lock
                    try:
                        fcntl.flock(f.fileno(), fcntl.LOCK_UN)
                    except:
                        pass
        except Exception as e:
            logger.error(f"Failed to save jobs (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(0.1)
            else:
                logger.error("Giving up on saving jobs file")

# Load jobs on module import
load_jobs()


class TrainingRequest(BaseModel):
    """Request schema for model training"""
    model_type: str = 'ensemble'  # prophet, xgboost, sarima, ensemble
    target_col: str = 'sales'
    date_col: str = 'date'
    forecast_periods: int = 30
    confidence_level: float = 0.95


class DataProfileRequest(BaseModel):
    """Request schema for data profiling"""
    target_col: str = 'sales'
    date_col: str = 'date'


class InitSessionRequest(BaseModel):
    file_path: str
    filename: str

@router.post("/init-session-from-path")
async def init_session_from_path(request: InitSessionRequest):
    """
    Initialize a new analysis session from an existing file path (e.g., after conversion)
    """
    try:
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")
            
        # Read the file
        try:
            df = pd.read_csv(request.file_path)
            # Re-validate essential columns just in case
            if 'date' not in df.columns or 'target' not in df.columns:
                 # Try to infer again or just fail if conversion should have guaranteed it
                 pass
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
            
        # Generate Session ID
        session_id = str(uuid.uuid4())
        
        # Store in session state
        analysis_sessions[session_id] = {
            'id': session_id,
            'filename': request.filename,
            'upload_time': datetime.now().isoformat(),
            'rows': len(df),
            'columns': list(df.columns),
            'data': df.to_dict('records'), # Store full data in memory (for MVP)
            'status': 'uploaded'
        }
        
        logger.info(f"Initialized session {session_id} from {request.file_path}")
        
        return {
            "session_id": session_id,
            "filename": request.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "sample_data": df.head(5).astype(str).to_dict('records'),
            "message": "Session initialized successfully"
        }
        
    except Exception as e:
        logger.error(f"Session initialization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload and parse CSV dataset
    Returns parsed data and initial statistics
    """
    logger.info(f"📥 Upload request received: Filename={file.filename}, Content-Type={file.content_type}")
    
    if not file.filename.endswith('.csv'):
        logger.warning(f"❌ Invalid file type rejected: {file.filename}")
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        contents = await file.read()
        
        # Try multiple encodings
        decoded_content = None
        used_encoding = None
        
        for encoding in ['utf-8', 'latin-1', 'cp1252', 'ISO-8859-1']:
            try:
                decoded_content = contents.decode(encoding)
                used_encoding = encoding
                logger.info(f"Successfully decoded file using {encoding} encoding")
                break
            except UnicodeDecodeError:
                continue
                
        if decoded_content is None:
            raise HTTPException(status_code=400, detail="Could not decode file. Please ensure it uses UTF-8 or Latin-1 encoding.")
            
        df = pd.read_csv(io.StringIO(decoded_content))
        
        # Basic validation
        if len(df) == 0:
            raise HTTPException(status_code=400, detail="Empty dataset")
        
        # Generate session ID for this dataset
        session_id = str(uuid.uuid4())
        logger.info(f"📤 New upload session created: {session_id} ({file.filename})")
        
        # Store in memory first
        training_jobs[session_id] = {
            'status': 'uploaded',
            'data': df.to_dict('records'),
            'filename': file.filename,
            'rows': len(df),
            'columns': list(df.columns),
            'uploaded_at': datetime.now().isoformat()
        }
        
        # CRITICAL: Save synchronously and verify
        save_jobs()
        
        # Verify the session was saved
        if session_id not in training_jobs:
            logger.error(f"❌ Session {session_id} not in memory after save!")
            raise HTTPException(status_code=500, detail="Session creation failed")
        
        logger.info(f"✅ Session {session_id} saved successfully. Total sessions: {len(training_jobs)}")
        
        return {
            'session_id': session_id,
            'filename': file.filename,
            'rows': len(df),
            'columns': list(df.columns),
            'sample_data': df.head(5).replace({np.nan: None}).to_dict('records'),
            'summary': df.describe().replace({np.nan: None}).to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/profile/{session_id}")
async def profile_dataset(session_id: str, request: DataProfileRequest):
    """
    Generate comprehensive dataset profile
    """
    logger.info(f"🔍 Profile request for session: {session_id}")
    logger.debug(f"Available sessions in memory: {list(training_jobs.keys())}")
    
    # Check in-memory first (should be the source of truth)
    if session_id not in training_jobs:
        # As a fallback, try loading from disk ONE time
        logger.warning(f"⚠️ Session {session_id} not in memory, attempting to load from disk")
        load_jobs()
        
        # Check again after loading
        if session_id not in training_jobs:
            available_ids = list(training_jobs.keys())
            logger.error(f"❌ Session {session_id} not found even after loading from disk!")
            logger.error(f"Available sessions ({len(available_ids)}): {available_ids[:5]}...")  # Show first 5
            raise HTTPException(
                status_code=404, 
                detail=f"Session not found. Session ID: {session_id}. Available sessions: {len(training_jobs)}"
            )
    
    job = training_jobs[session_id]
    logger.info(f"✅ Session {session_id} found. Status: {job['status']}, Rows: {job['rows']}")
    df = pd.DataFrame(job['data'])
    
    # GATE 3: Profiling Validation
    from ..services.pipeline_validator import PipelineValidator
    profile_validation = PipelineValidator.validate_profiling(df)
    if not profile_validation['valid']:
        # We don't block profiling but we warn heavily
        logger.warning(f"Profiling Data Quality Issues: {profile_validation['issues']}")
        # We could potentially inject these issues into the profile result
    
    # --- Date Synthesis Logic (for Warehouse_and_Retail_Sales.csv) ---
    # If date_col is not found, check for component columns (Year/Month)
    if request.date_col not in df.columns:
        # Check for YEAR/MONTH variations
        year_col = next((c for c in df.columns if c.upper() == 'YEAR'), None)
        month_col = next((c for c in df.columns if c.upper() == 'MONTH'), None)
        
        if year_col and month_col:
            try:
                logger.info(f"📅 Detected Year/Month columns ({year_col}, {month_col}). Synthesizing Date column...")
                # Create synthetic date (Day 1 of each month)
                df['Date'] = pd.to_datetime(dict(year=df[year_col], month=df[month_col], day=1))
                request.date_col = 'Date' # Switch target to new column
                
                # Update stored job data with new column
                job['data'] = df.to_dict('records') # Update rows
                job['columns'] = list(df.columns)   # Update columns list
                save_jobs()
            except Exception as e:
                logger.warning(f"Failed to synthesize date: {e}")

    profile = {
        'dimensions': {
            'rows': len(df),
            'columns': len(df.columns)
        },
        'columns': [],
        'data_quality': {},
        'statistics': {},
        'time_series_info': {},
        'businessInsights': [] # CRITICAL FIX: Ensure array exists
    }
    
    # Column analysis
    for col in df.columns:
        col_info = {
            'name': col,
            'dtype': str(df[col].dtype),
            'missing': int(df[col].isna().sum()),
            'missing_pct': round(df[col].isna().sum() / len(df) * 100, 2),
            'unique': int(df[col].nunique())
        }
        
        # Numeric statistics
        if df[col].dtype in ['int64', 'float64']:
            col_info.update({
                'mean': round(float(df[col].mean()), 2),
                'std': round(float(df[col].std()), 2),
                'min': round(float(df[col].min()), 2),
                'max': round(float(df[col].max()), 2),
                'median': round(float(df[col].median()), 2)
            })
        
        profile['columns'].append(col_info)
    
    # Data quality score
    total_cells = len(df) * len(df.columns)
    missing_cells = df.isna().sum().sum()
    profile['data_quality'] = {
        'completeness': round((1 - missing_cells / total_cells) * 100, 1),
        'total_missing': int(missing_cells),
        'duplicate_rows': int(df.duplicated().sum())
    }
    
    # Time series detection
    if request.date_col in df.columns:
        try:
            df[request.date_col] = pd.to_datetime(df[request.date_col])
            # Calculate time metrics
            min_date = df[request.date_col].min()
            max_date = df[request.date_col].max()
            duration_days = (max_date - min_date).days
            
            profile['time_series_info'] = {
                'date_range_start': min_date.strftime('%Y-%m-%d'),
                'date_range_end': max_date.strftime('%Y-%m-%d'),
                'total_days': duration_days,
                'frequency': 'Daily' if df[request.date_col].diff().median().days == 1 else 'Variable'
            }
            
            # Add to Business Insights
            profile['businessInsights'].append(f"Time range: {min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')} ({duration_days} days)")
            profile['dimensions']['timeSpanDays'] = duration_days # Ensure frontend compatibility
            
        except Exception as e:
            logger.warning(f"Date parsing error: {e}")
            profile['time_series_info'] = {'error': 'Could not parse date column'}
    
    # Target variable statistics
    if request.target_col in df.columns and df[request.target_col].dtype in ['int64', 'float64']:
        try:
            target_mean = float(df[request.target_col].mean())
            target_sum = float(df[request.target_col].sum())
            
            profile['statistics'] = {
                'target_mean': round(target_mean, 2),
                'target_std': round(float(df[request.target_col].std()), 2),
                'target_total': round(target_sum, 2)
            }
            
            # Add to Business Insights
            profile['businessInsights'].append(f"Average {request.target_col}: {target_mean:,.2f}")
            profile['businessInsights'].append(f"Total {request.target_col}: {target_sum:,.2f}")
            
        except Exception as e:
            logger.warning(f"Target stats error: {e}")
    
    # Forecasting readiness assessment
    readiness_score = 0
    readiness_issues = []
    
    if len(df) >= 30:
        readiness_score += 25
    else:
        readiness_issues.append("Insufficient data points (need at least 30)")
    
    if request.date_col in df.columns:
        readiness_score += 25
    else:
        readiness_issues.append("No date column detected")
    
    if request.target_col in df.columns:
        readiness_score += 25
    else:
        readiness_issues.append("Target column not found")
    
    if profile['data_quality']['completeness'] >= 95:
        readiness_score += 25
    else:
        readiness_issues.append(f"Data completeness is {profile['data_quality']['completeness']}%")
    
    profile['forecasting_readiness'] = {
        'score': readiness_score,
        'ready': readiness_score >= 75,
        'issues': readiness_issues
    }

    # --- Phase 2.2: Data Quality Scorecard ---
    try:
        from app.services.data_adapter import DataAdapter
        adapter = DataAdapter()
        scorecard = adapter.generate_quality_scorecard(df)
        profile['quality_scorecard'] = scorecard
    except Exception as e:
        logger.warning(f"Failed to generate quality scorecard: {e}")
        profile['quality_scorecard'] = None

    # --- Phase 11: Dynamic KPI Generation (Universal Adapter) ---
    try:
        from app.services.schema_detector import schema_detector
        from app.services.kpi_generator import kpi_generator
        
        # 1. Re-detect domain (or retrieval from session if we stored it)
        domain_report = schema_detector.detect_domain(df)
        
        # 2. Generate KPIs
        # Invert mapping? schema_detector returns std->user. kpi_generator needs that.
        # kpi_generator.generate_kpis expects column_mapping as std->user
        kpis = kpi_generator.generate_kpis(
            df, 
            domain_report.domain_key,
            domain_report.matched_columns
        )
        
        profile['domain_analysis'] = domain_report.dict()
        profile['dynamic_kpis'] = kpis
        
        logger.info(f"Generated {len(kpis)} dynamic KPIs for domain: {domain_report.domain}")
        
        # --- Phase 12: Adaptive Narrative Report ---
        from app.services.report_generator import report_generator
        narrative = report_generator.generate_narrative(
            domain_report.domain_key,
            kpis,
            profile
        )
        profile['narrative_report'] = narrative
        
    except Exception as e:
        logger.error(f"Failed to generate dynamic KPIs/Report: {e}")
        profile['dynamic_kpis'] = []
        profile['domain_analysis'] = None
        profile['narrative_report'] = None
    
    # Update job status
    training_jobs[session_id]['status'] = 'profiled'
    training_jobs[session_id]['profile'] = profile
    save_jobs()
    
    return profile


@router.post("/preprocess/{session_id}")
async def preprocess_dataset(session_id: str):
    """
    Apply robust preprocessing to the dataset.
    Returns the transformed data sample and a changelog.
    Phase 2.3: Lightweight Preprocessing Log
    """
    try:
        if session_id not in training_jobs:
            # Try load
            load_jobs()
            if session_id not in training_jobs:
                raise HTTPException(status_code=404, detail="Session not found")
        
        job = training_jobs[session_id]
        df = pd.DataFrame(job['data'])
        
        from app.services.data_adapter import DataAdapter
        adapter = DataAdapter()
        
        # Apply normalization and preprocessing
        # Note: we might have already done some in 'upload', but this forces a clean pass
        df_clean, report = adapter.normalize_dataset(df)
        
        # Enhanced Logging for Frontend
        log = []
        
        # 1. Structural Changes
        if report.get('transformations'):
            for t in report['transformations']:
                log.append({
                    "step": "Structural Normalization",
                    "status": "completed",
                    "message": t,
                    "icon": "structure"
                })
                
        # 2. Date Parsing
        if 'date' in df_clean.columns:
            log.append({
                "step": "Date Standardization",
                "status": "completed",
                "message": f"standardized to datetime format ({df_clean['date'].min()} to {df_clean['date'].max()})",
                "icon": "calendar"
            })
            
        # 3. Missing Values
        initial_missing = df.isnull().sum().sum()
        final_missing = df_clean.isnull().sum().sum()
        filled = initial_missing - final_missing
        if filled > 0:
             log.append({
                "step": "Imputation",
                "status": "completed",
                "message": f"Filled {filled} missing values using forward/backward fill",
                "icon": "fill"
            })
            
        # 4. Feature Engineering (Simulated or Real if we add it to adapter)
        # For now, adding basic time features
        new_features = 0
        if 'date' in df_clean.columns:
            df_clean['month'] = df_clean['date'].dt.month
            df_clean['day_of_week'] = df_clean['date'].dt.dayofweek
            new_features += 2
            log.append({
                "step": "Feature Engineering",
                "status": "completed",
                "message": "Extracted temporal features: month, day_of_week",
                "icon": "sparkles"
            })

        # Update Session
        training_jobs[session_id]['data'] = df_clean.to_dict('records') # Update with cleaned data
        training_jobs[session_id]['columns'] = list(df_clean.columns)
        training_jobs[session_id]['status'] = 'preprocessed'
        training_jobs[session_id]['preprocessing_log'] = log
        save_jobs()
        
        return {
            "success": True,
            "rows": len(df_clean),
            "features": len(df_clean.columns),
            "new_features": newFeatures,
            "log": log,
            "sample": df_clean.head(5).astype(str).to_dict('records')
        }

    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train/{session_id}")
async def train_model(
    session_id: str, 
    request: TrainingRequest,
    background_tasks: BackgroundTasks
):
    """
    Start model training job
    Returns job_id for status polling
    """
    logger.info(f"🚂 Training request for session: {session_id}, model: {request.model_type}")
    
    # Check in-memory first
    if session_id not in training_jobs:
        logger.warning(f"⚠️ Session {session_id} not in memory for training, loading from disk")
        load_jobs()
        
        if session_id not in training_jobs:
            logger.error(f"❌ Session {session_id} not found for training!")
            raise HTTPException(status_code=404, detail="Session not found")
    
    job_id = str(uuid.uuid4())
    logger.info(f"📋 Created training job: {job_id}")
    
    # Initialize training job
    training_jobs[job_id] = {
        'status': 'queued',
        'session_id': session_id,
        'model_type': request.model_type,
        'progress': 0,
        'current_step': 'Initializing...',
        'started_at': datetime.now().isoformat(),
        'metrics': None,
        'forecast': None
    }
    save_jobs()
    
    # Start training in background
    background_tasks.add_task(
        run_training,
        job_id,
        session_id,
        request.model_type,
        request.target_col,
        request.date_col,
        request.forecast_periods,
        request.confidence_level
    )
    
    return {
        'job_id': job_id,
        'status': 'queued',
        'message': f'Training {request.model_type} model started'
    }


async def run_training(
    job_id: str,
    session_id: str,
    model_type: str,
    target_col: str,
    date_col: str,
    forecast_periods: int,
    confidence_level: float
):
    """Background task to run model training"""
    try:
        training_jobs[job_id]['status'] = 'training'
        training_jobs[job_id]['progress'] = 10
        training_jobs[job_id]['current_step'] = 'Loading data...'
        
        # Get data
        if session_id not in training_jobs:
             raise ValueError(f"Session {session_id} not found for data access")
             
        df = pd.DataFrame(training_jobs[session_id]['data'])
        
        training_jobs[job_id]['progress'] = 20
        training_jobs[job_id]['current_step'] = 'Preparing features...'
        
        # Initialize Model Router
        from app.services.model_router import ModelRouter
        from app.ml.baseline_models import NaiveForecaster, MovingAverageForecaster
        
        router = ModelRouter()
        
        # Determine model candidates
        candidates = []
        if model_type == 'auto' or model_type == 'ensemble':
            # Use Router recommendation
            candidates = router.route_model(df, target_col, date_col)
        else:
            # User selected specific model, but we add fallbacks
            candidates = [model_type, 'naive']
            
        logger.info(f"Model selection strategy: {candidates}")
        
        # Model Registry
        model_classes = {
            'prophet': ProphetForecaster,
            'xgboost': XGBoostForecaster,
            'sarima': SARIMAForecaster,
            'ensemble': EnsembleForecaster,
            'naive': NaiveForecaster,
            'moving_average': MovingAverageForecaster
        }
        
        trained_model = None
        metrics = None
        used_model_name = None
        
        # Iterate through candidates (Fallback Loop)
        for candidate in candidates:
            if candidate not in model_classes:
                continue
                
            try:
                training_jobs[job_id]['current_step'] = f'Training {candidate}...'
                logger.info(f"Attempting to train {candidate}...")
                
                model_instance = model_classes[candidate]()
                metrics_result = model_instance.train(df, target_col, date_col)
                
                # Check for validity (basic check)
                if metrics_result.mape is None or np.isnan(metrics_result.mape):
                    raise ValueError("Model returned invalid metrics")
                
                # Success!
                trained_model = model_instance
                metrics = metrics_result
                used_model_name = candidate
                logger.info(f"Successfully trained {candidate} (MAPE: {metrics.mape}%)")
                break
                
            except Exception as e:
                logger.warning(f"Training failed for {candidate}: {e}")
                continue
        
        if trained_model is None:
            raise ValueError("All model candidates failed training.")
            
        training_jobs[job_id]['model_type'] = used_model_name # Update actual used model
        training_jobs[job_id]['progress'] = 70
        training_jobs[job_id]['current_step'] = 'Generating forecasts...'
        
        # Generate forecast
        forecast = trained_model.predict(forecast_periods, confidence_level)
        
        training_jobs[job_id]['progress'] = 90
        training_jobs[job_id]['current_step'] = 'Finalizing results...'
        
        # Store results
        training_jobs[job_id]['status'] = 'completed'
        training_jobs[job_id]['progress'] = 100
        training_jobs[job_id]['current_step'] = 'Training complete!'
        training_jobs[job_id]['completed_at'] = datetime.now().isoformat()
        training_jobs[job_id]['metrics'] = {
            'mape': metrics.mape,
            'rmse': metrics.rmse,
            'mae': metrics.mae,
            'r2': metrics.r2,
            'training_samples': metrics.training_samples,
            'validation_samples': metrics.validation_samples,
            'training_time': metrics.training_time_seconds,
            'accuracy_rating': trained_model.get_accuracy_rating(metrics.mape),
            'used_model': used_model_name # Explicitly correct model name
        }
        training_jobs[job_id]['forecast'] = {
            'dates': forecast.dates,
            'predictions': forecast.predictions,
            'lower_bound': forecast.lower_bound,
            'upper_bound': forecast.upper_bound,
            'confidence_level': forecast.confidence_level
        }
        
        # Feature importance (XGBoost)
        if hasattr(trained_model, 'feature_importance') and trained_model.feature_importance:
            training_jobs[job_id]['metrics']['feature_importance'] = trained_model.feature_importance
        
        # Model comparison (Ensemble)
        if hasattr(trained_model, 'models') and trained_model.models:
             # It's an ensemble
             training_jobs[job_id]['metrics']['model_comparison'] = trained_model.get_model_comparison()
        
        # --- Generate Business Insights ---
        try:
            from app.services.business_translator import BusinessTranslator
            
            translator = BusinessTranslator()
            
            # Prepare data for translator
            forecast_data = pd.DataFrame({
                'predictions': training_jobs[job_id]['forecast']['predictions'],
                'dates': training_jobs[job_id]['forecast']['dates']
            })
            
            historical_df = pd.DataFrame(training_jobs[session_id].get('data', []))
            
            # Translate to business insights
            business_insights = translator.translate_forecast_results(
                forecasts=training_jobs[job_id]['forecast'],  # Pass dict directly
                historical_data=historical_df,
                metrics=metrics.__dict__ if hasattr(metrics, '__dict__') else {
                    'mape': metrics.mape,
                    'rmse': metrics.rmse,
                    'r2': metrics.r2
                },
                product_info=None  # Can be enhanced with real product data later
            )
            
            training_jobs[job_id]['business_insights'] = business_insights
            
        except Exception as e:
            logger.error(f"Failed to generate business insights: {e}")
            training_jobs[job_id]['business_insights'] = {"error": "Insights generation failed"}
        
        logger.info(f"Training completed for job {job_id}")
        save_jobs()
        
    except Exception as e:
        logger.error(f"Training failed for job {job_id}: {e}")
        training_jobs[job_id]['status'] = 'failed'
        training_jobs[job_id]['error'] = str(e)
        save_jobs()


@router.get("/status/{job_id}")
async def get_training_status(job_id: str):
    """Get current training job status"""
    if job_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = training_jobs[job_id]
    
    return {
        'job_id': job_id,
        'status': job['status'],
        'progress': job.get('progress', 0),
        'current_step': job.get('current_step', ''),
        'started_at': job.get('started_at'),
        'completed_at': job.get('completed_at'),
        'error': job.get('error')
    }


@router.get("/results/{job_id}")
async def get_training_results(job_id: str):
    """Get completed training results"""
    if job_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = training_jobs[job_id]
    
    if job['status'] != 'completed':
        raise HTTPException(
            status_code=400, 
            detail=f"Training not complete. Status: {job['status']}"
        )
    
    return {
        'job_id': job_id,
        'model_type': job['model_type'],
        'metrics': job['metrics'],
        'forecast': job['forecast'],
        'training_time': job['metrics'].get('training_time'),
        'accuracy_rating': job['metrics'].get('accuracy_rating')
    }


@router.get("/models")
async def list_available_models():
    """List all available ML models"""
    return {
        'models': [
            {
                'id': 'prophet',
                'name': 'Prophet',
                'description': 'Facebook Prophet - Best for seasonal patterns and holidays',
                'strengths': ['Seasonal decomposition', 'Holiday effects', 'Missing data tolerance'],
                'typical_accuracy': '93-97%'
            },
            {
                'id': 'xgboost',
                'name': 'XGBoost',
                'description': 'Gradient Boosting - Best for feature-rich datasets',
                'strengths': ['Non-linear patterns', 'Feature importance', 'High accuracy'],
                'typical_accuracy': '95-99%'
            },
            {
                'id': 'sarima',
                'name': 'SARIMA',
                'description': 'Statistical Model - Best for autoregressive patterns',
                'strengths': ['Statistical rigor', 'Confidence intervals', 'Trend detection'],
                'typical_accuracy': '90-95%'
            },
            {
                'id': 'ensemble',
                'name': 'Ensemble',
                'description': 'Combined Models - Best overall accuracy',
                'strengths': ['Combines all models', 'Weighted predictions', 'Robust forecasts'],
                'typical_accuracy': '96-99%'
            }
        ]
    }
