"""
Enterprise Pipeline Orchestrator
Main controller for the analysis pipeline with robust error handling and session management
"""

import time
import traceback
from datetime import datetime
from enum import Enum
from typing import Dict, List, Any, Optional, Callable, Tuple
from dataclasses import dataclass, field, asdict
from functools import wraps

import pandas as pd

from ..utils.structured_logger import pipeline_logger
from ..services.enterprise_validator import EnterpriseDataValidator, ValidationError


class PipelineStage(Enum):
    """Enumeration of pipeline stages for tracking"""
    INGESTION = "ingestion"
    VALIDATION = "validation"
    SANITIZATION = "sanitization"
    PROFILING = "profiling"
    PREPROCESSING = "preprocessing"
    FEATURE_ENGINEERING = "feature_engineering"
    MODEL_TRAINING = "model_training"
    ENSEMBLE = "ensemble"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class PipelineContext:
    """Context object passed through pipeline stages"""
    session_id: str
    user_id: str
    file_path: str
    original_filename: str
    file_size_bytes: int
    upload_timestamp: datetime
    column_mapping: Dict[str, str]
    current_stage: PipelineStage = PipelineStage.INGESTION
    stage_history: List[Dict] = field(default_factory=list)
    data_quality_score: float = 0.0
    errors: List[Dict] = field(default_factory=list)
    warnings: List[Dict] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Convert context to dictionary"""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "file_path": self.file_path,
            "original_filename": self.original_filename,
            "file_size_bytes": self.file_size_bytes,
            "upload_timestamp": self.upload_timestamp.isoformat(),
            "column_mapping": self.column_mapping,
            "current_stage": self.current_stage.value,
            "stage_history": self.stage_history,
            "data_quality_score": self.data_quality_score,
            "errors": self.errors,
            "warnings": self.warnings,
            "metadata": self.metadata
        }


class PipelineError(Exception):
    """Base exception for pipeline errors with context"""
    def __init__(self, message: str, stage: PipelineStage, context: Dict, recoverable: bool = False):
        self.message = message
        self.stage = stage
        self.context = context
        self.recoverable = recoverable
        super().__init__(self.message)


def stage_wrapper(stage_name: PipelineStage):
    """Decorator for pipeline stage execution with error handling"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, context: PipelineContext, *args, **kwargs):
            start_time = time.time()
            stage_entry = {
                "stage": stage_name.value,
                "started_at": datetime.utcnow().isoformat(),
                "status": "running"
            }
            context.stage_history.append(stage_entry)
            context.current_stage = stage_name
            
            pipeline_logger.log_event("stage_started", {
                "session_id": context.session_id,
                "stage": stage_name.value,
                "timestamp": start_time
            })
            
            try:
                # Execute the stage
                result = func(self, context, *args, **kwargs)
                
                # Record success
                duration = time.time() - start_time
                stage_entry.update({
                    "completed_at": datetime.utcnow().isoformat(),
                    "status": "completed",
                    "duration_seconds": duration
                })
                
                pipeline_logger.log_event("stage_completed", {
                    "session_id": context.session_id,
                    "stage": stage_name.value,
                    "duration_seconds": duration
                })
                
                return result
                
            except Exception as e:
                # Record failure
                duration = time.time() - start_time
                stage_entry.update({
                    "failed_at": datetime.utcnow().isoformat(),
                    "status": "failed",
                    "duration_seconds": duration,
                    "error": str(e)
                })
                
                pipeline_logger.log_error(e, {
                    "session_id": context.session_id,
                    "stage": stage_name.value,
                    "duration_seconds": duration
                }, f"pipeline_stage_{stage_name.value}")
                
                # Create detailed error context
                error_context = {
                    "session_id": context.session_id,
                    "stage": stage_name.value,
                    "operation": func.__name__,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                raise PipelineError(
                    message=f"Stage {stage_name.value} failed: {str(e)}",
                    stage=stage_name,
                    context=error_context,
                    recoverable=isinstance(e, ValidationError)
                ) from e
        
        return wrapper
    return decorator


class EnterprisePipelineOrchestrator:
    """Main orchestrator for the enterprise analysis pipeline"""
    
    def __init__(self):
        self.logger = pipeline_logger
        self.active_sessions: Dict[str, PipelineContext] = {}
    
    def create_session(self, user_id: str, file_path: str, 
                      original_filename: str, file_size: int,
                      column_mapping: Dict) -> PipelineContext:
        """
        Initialize new pipeline session
        
        Args:
            user_id: User identifier
            file_path: Path to uploaded file
            original_filename: Original filename
            file_size: File size in bytes
            column_mapping: Column mapping dictionary
            
        Returns:
            PipelineContext object
        """
        session_id = f"ses_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{user_id[:8]}"
        
        context = PipelineContext(
            session_id=session_id,
            user_id=user_id,
            file_path=file_path,
            original_filename=original_filename,
            file_size_bytes=file_size,
            upload_timestamp=datetime.utcnow(),
            column_mapping=column_mapping
        )
        
        self.active_sessions[session_id] = context
        
        self.logger.log_event("session_created", {
            "session_id": session_id,
            "user_id": user_id,
            "filename": original_filename,
            "file_size_bytes": file_size
        })
        
        return context
    
    def get_session(self, session_id: str) -> Optional[PipelineContext]:
        """Get active session by ID"""
        return self.active_sessions.get(session_id)
    
    @stage_wrapper(PipelineStage.VALIDATION)
    def validate_data(self, context: PipelineContext, df: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Validate data using enterprise validator
        
        Args:
            context: Pipeline context
            df: DataFrame to validate
            
        Returns:
            Tuple of (is_valid, validation_results)
        """
        validator = EnterpriseDataValidator(
            file_path=context.file_path,
            file_size_bytes=context.file_size_bytes,
            column_mapping=context.column_mapping
        )
        
        is_valid, results = validator.validate(df)
        
        # Update context with validation results
        context.data_quality_score = results.get("quality_score", 0.0)
        
        if not is_valid:
            # Add validation errors to context
            for failure in results.get("failed", []):
                context.errors.append({
                    "stage": "validation",
                    "check": failure["check"],
                    "message": failure["error"]
                })
        
        # Add warnings to context
        for warning in results.get("warnings", []):
            context.warnings.append({
                "stage": "validation",
                "check": warning["check"],
                "message": warning["message"]
            })
        
        return is_valid, results
    
    def handle_validation_failure(self, context: PipelineContext, results: Dict) -> Dict:
        """
        Handle validation failures with user-friendly messages
        
        Args:
            context: Pipeline context
            results: Validation results
            
        Returns:
            Error response dictionary
        """
        self.logger.log_event("validation_failed", {
            "session_id": context.session_id,
            "failed_checks": results.get("failed", []),
            "quality_score": context.data_quality_score
        })
        
        # Generate actionable error messages
        user_messages = []
        for failure in results.get("failed", []):
            msg = EnterpriseDataValidator.translate_error_to_user_message(failure)
            user_messages.append(msg)
        
        suggestions = EnterpriseDataValidator.suggest_validation_fixes(results)
        
        return {
            "success": False,
            "session_id": context.session_id,
            "error_type": "validation_failed",
            "error_stage": "validation",
            "user_messages": user_messages,
            "technical_details": results,
            "suggested_actions": suggestions,
            "quality_score": context.data_quality_score
        }
    
    def handle_pipeline_error(self, context: PipelineContext, error: PipelineError) -> Dict:
        """
        Handle known pipeline errors
        
        Args:
            context: Pipeline context
            error: Pipeline error
            
        Returns:
            Error response dictionary
        """
        self.logger.log_error(error, context.to_dict(), "pipeline_execution")
        
        return {
            "success": False,
            "session_id": context.session_id,
            "error_type": "pipeline_error",
            "error_stage": error.stage.value,
            "message": error.message,
            "recoverable": error.recoverable,
            "context": error.context
        }
    
    def handle_unexpected_error(self, context: PipelineContext, error: Exception) -> Dict:
        """
        Handle unexpected errors gracefully
        
        Args:
            context: Pipeline context
            error: Exception
            
        Returns:
            Error response dictionary
        """
        self.logger.log_error(error, context.to_dict(), "unexpected_error")
        
        return {
            "success": False,
            "session_id": context.session_id,
            "error_type": "unexpected_error",
            "error_stage": context.current_stage.value,
            "message": "An unexpected error occurred. Our team has been notified.",
            "recoverable": False,
            "error_id": f"ERR_{context.session_id}"  # For support reference
        }
    
    @stage_wrapper(PipelineStage.INGESTION)
    def _ingest_data(self, context: PipelineContext) -> pd.DataFrame:
        """Ingest data from file"""
        import io
        
        ext = context.file_path.split('.')[-1].lower()
        
        try:
            if ext in ['csv', 'tsv']:
                sep = '\t' if ext == 'tsv' else ','
                for encoding in ['utf-8', 'latin-1', 'cp1252', 'ISO-8859-1']:
                    try:
                        df = pd.read_csv(context.file_path, sep=sep, encoding=encoding)
                        self.logger.log_event("data_ingested", {
                            "session_id": context.session_id,
                            "encoding": encoding,
                            "rows": len(df),
                            "columns": len(df.columns)
                        })
                        return df
                    except UnicodeDecodeError:
                        continue
                raise ValueError("Could not decode file")
            elif ext in ['xlsx', 'xls']:
                df = pd.read_excel(context.file_path)
                return df
            else:
                raise ValueError(f"Unsupported format: {ext}")
        except Exception as e:
            raise PipelineError(
                f"Failed to ingest data: {str(e)}",
                PipelineStage.INGESTION,
                {"file_path": context.file_path},
                recoverable=False
            ) from e
    
    @stage_wrapper(PipelineStage.SANITIZATION)
    def _sanitize_data(self, context: PipelineContext, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and sanitize data"""
        df_clean = df.copy()
        df_clean = df_clean.dropna(how='all')
        duplicates = df_clean.duplicated().sum()
        if duplicates > 0:
            df_clean = df_clean.drop_duplicates()
        return df_clean
    
    @stage_wrapper(PipelineStage.PROFILING)
    def _profile_data(self, context: PipelineContext, df: pd.DataFrame) -> Dict:
        """Generate data profile"""
        profile = {
            "dimensions": {"rows": len(df), "columns": len(df.columns)},
            "columns": [],
            "data_quality": {}
        }
        for col in df.columns:
            col_info = {
                "name": col,
                "dtype": str(df[col].dtype),
                "missing": int(df[col].isna().sum()),
                "missing_pct": round(df[col].isna().sum() / len(df) * 100, 2)
            }
            if pd.api.types.is_numeric_dtype(df[col]):
                col_info.update({
                    "mean": round(float(df[col].mean()), 2),
                    "std": round(float(df[col].std()), 2)
                })
            profile["columns"].append(col_info)
        return profile
    
    @stage_wrapper(PipelineStage.PREPROCESSING)
    def _preprocess_data(self, context: PipelineContext, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess data for modeling"""
        from ..services.data_adapter import DataAdapter
        adapter = DataAdapter()
        df_processed, _ = adapter.normalize_dataset(df)
        return df_processed
    
    @stage_wrapper(PipelineStage.FEATURE_ENGINEERING)
    def _engineer_features(self, context: PipelineContext, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer features for ML models"""
        df_features = df.copy()
        target_col = context.column_mapping.get('target')
        if target_col and target_col in df_features.columns:
            for lag in [1, 7, 14]:
                df_features[f'lag_{lag}'] = df_features[target_col].shift(lag)
            # Use bfill() instead of deprecated fillna(method='bfill')
            df_features = df_features.bfill().fillna(0)
        return df_features
    
    @stage_wrapper(PipelineStage.MODEL_TRAINING)
    def _train_models(self, context: PipelineContext, features: pd.DataFrame,
                     progress_callback=None) -> Dict:
        """Train ML models using EnsembleForecaster (Prophet + XGBoost + SARIMA)"""
        from ..ml.ensemble_model import EnsembleForecaster
        
        target_col = context.column_mapping.get('target', 'target')
        date_col = context.column_mapping.get('date', 'date')
        
        # Ensure columns exist in features
        if target_col not in features.columns:
            # Try to find a numeric column as fallback
            numeric_cols = features.select_dtypes(include='number').columns.tolist()
            if numeric_cols:
                target_col = numeric_cols[0]
                self.logger.log_event("column_fallback", {
                    "session_id": context.session_id,
                    "fallback_target": target_col
                })
            else:
                raise PipelineError(
                    "No numeric target column found for model training",
                    PipelineStage.MODEL_TRAINING,
                    {"available_columns": list(features.columns)},
                    recoverable=False
                )
        
        if date_col not in features.columns:
            # Try to find a datetime column as fallback
            date_cols = features.select_dtypes(include=['datetime64']).columns.tolist()
            if date_cols:
                date_col = date_cols[0]
            else:
                raise PipelineError(
                    "No date column found for model training",
                    PipelineStage.MODEL_TRAINING,
                    {"available_columns": list(features.columns)},
                    recoverable=False
                )
        
        self.logger.log_event("training_started", {
            "session_id": context.session_id,
            "target_col": target_col,
            "date_col": date_col,
            "rows": len(features)
        })
        
        # Train ensemble (Prophet + XGBoost + SARIMA)
        ensemble = EnsembleForecaster()
        try:
            training_result = ensemble.train(
                df=features,
                target_col=target_col,
                date_col=date_col,
                include_models=['prophet', 'xgboost', 'sarima'],
                parallel=True
            )
        except Exception as e:
            # Fallback: try sequential training with fewer models
            self.logger.log_error(e, {
                "session_id": context.session_id,
                "note": "Parallel training failed, falling back to sequential"
            }, "ensemble_parallel_train")
            training_result = ensemble.train(
                df=features,
                target_col=target_col,
                date_col=date_col,
                include_models=['prophet', 'xgboost'],
                parallel=False
            )
        
        # Extract metrics from trained models
        models_used = list(ensemble.models.keys())
        metrics = {}
        for model_name, model in ensemble.models.items():
            if hasattr(model, 'metrics') and model.metrics:
                m = model.metrics
                metrics[model_name] = {
                    "mape": round(getattr(m, 'mape', 0) or 0, 4),
                    "rmse": round(getattr(m, 'rmse', 0) or 0, 2),
                    "mae": round(getattr(m, 'mae', 0) or 0, 2),
                    "r2": round(getattr(m, 'r2_score', 0) or 0, 4)
                }
        
        # Store ensemble reference in context for use in _create_ensemble
        context.metadata['_ensemble_model'] = ensemble
        context.metadata['target_col'] = target_col
        context.metadata['date_col'] = date_col
        
        self.logger.log_event("training_completed", {
            "session_id": context.session_id,
            "models_trained": models_used,
            "metrics": metrics
        })
        
        return {
            "status": "trained",
            "models_used": models_used,
            "metrics": metrics,
            "ensemble": ensemble
        }
    
    @stage_wrapper(PipelineStage.ENSEMBLE)
    def _create_ensemble(self, context: PipelineContext, models: Dict) -> Dict:
        """Generate ensemble predictions using trained EnsembleForecaster"""
        ensemble = models.get('ensemble') or context.metadata.get('_ensemble_model')
        
        if ensemble is None:
            # Fallback: return empty forecast structure
            self.logger.log_event("ensemble_fallback", {
                "session_id": context.session_id,
                "reason": "No ensemble model found in context"
            })
            return {
                "forecast": {"dates": [], "predictions": [], "lower_bound": [], "upper_bound": []},
                "metrics": models.get("metrics", {}),
                "ensemble_method": "weighted_average",
                "models_used": models.get("models_used", [])
            }
        
        # Generate predictions for 30 days ahead
        try:
            forecast_result = ensemble.predict(periods=30, confidence_level=0.95)
            
            # Extract forecast data
            dates = []
            predictions = []
            lower_bound = []
            upper_bound = []
            
            if hasattr(forecast_result, 'forecast_df') and forecast_result.forecast_df is not None:
                fdf = forecast_result.forecast_df
                dates = fdf['ds'].dt.strftime('%Y-%m-%d').tolist() if 'ds' in fdf.columns else []
                predictions = fdf['yhat'].round(2).tolist() if 'yhat' in fdf.columns else []
                lower_bound = fdf['yhat_lower'].round(2).tolist() if 'yhat_lower' in fdf.columns else []
                upper_bound = fdf['yhat_upper'].round(2).tolist() if 'yhat_upper' in fdf.columns else []
            elif isinstance(forecast_result, dict):
                dates = forecast_result.get('dates', [])
                predictions = forecast_result.get('predictions', [])
                lower_bound = forecast_result.get('lower_bound', [])
                upper_bound = forecast_result.get('upper_bound', [])
            
            # Get model comparison
            model_comparison = {}
            try:
                model_comparison = ensemble.get_model_comparison()
            except Exception:
                pass
            
            self.logger.log_event("ensemble_completed", {
                "session_id": context.session_id,
                "forecast_periods": len(predictions),
                "models_in_ensemble": models.get("models_used", [])
            })
            
            return {
                "forecast": {
                    "dates": dates,
                    "predictions": predictions,
                    "lower_bound": lower_bound,
                    "upper_bound": upper_bound
                },
                "metrics": models.get("metrics", {}),
                "ensemble_method": "weighted_average",
                "models_used": models.get("models_used", []),
                "model_comparison": model_comparison
            }
            
        except Exception as e:
            self.logger.log_error(e, {
                "session_id": context.session_id
            }, "ensemble_predict")
            # Return partial result rather than failing completely
            return {
                "forecast": {"dates": [], "predictions": [], "lower_bound": [], "upper_bound": []},
                "metrics": models.get("metrics", {}),
                "ensemble_method": "weighted_average",
                "models_used": models.get("models_used", []),
                "error": f"Prediction generation failed: {str(e)}"
            }
    
    def execute_pipeline(self, context: PipelineContext, 
                        progress_callback=None) -> Dict:
        """Execute full pipeline with comprehensive error handling"""
        try:
            df = self._ingest_data(context)
            is_valid, validation_results = self.validate_data(context, df)
            if not is_valid:
                return self.handle_validation_failure(context, validation_results)
            df_clean = self._sanitize_data(context, df)
            profile = self._profile_data(context, df_clean)
            df_processed = self._preprocess_data(context, df_clean)
            features = self._engineer_features(context, df_processed)
            models = self._train_models(context, features, progress_callback)
            ensemble_results = self._create_ensemble(context, models)
            context.current_stage = PipelineStage.COMPLETED
            return {
                "success": True,
                "session_id": context.session_id,
                "results": ensemble_results,
                "profile": profile,
                "quality_score": context.data_quality_score,
                "warnings": context.warnings
            }
        except PipelineError as e:
            return self.handle_pipeline_error(context, e)
        except Exception as e:
            return self.handle_unexpected_error(context, e)


# Global orchestrator instance
orchestrator = EnterprisePipelineOrchestrator()


def get_orchestrator() -> EnterprisePipelineOrchestrator:
    """Get global orchestrator instance"""
    return orchestrator
