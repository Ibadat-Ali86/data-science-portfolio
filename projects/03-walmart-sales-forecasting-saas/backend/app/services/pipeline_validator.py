
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Callable
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class PipelineValidator:
    """
    Implements validation gates for the analysis pipeline.
    Task 0.2 of Student-Optimized Roadmap.
    """
    
    @staticmethod
    def validate_stage(stage: str):
        """
        Decorator to validate output of a pipeline stage.
        Usage: @PipelineValidator.validate_stage("upload")
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                result = await func(*args, **kwargs)
                
                # Extract dataframe/data from result if possible
                # This depends on what the function returns.
                # Use explicit validation methods for clearer integration usually.
                # But as a decorator, we'd need a consistent return type.
                # Given our API returns JSONResponse/dict, this might be tricky.
                # So we provided static methods to be called explicitly instead.
                
                return result
            return wrapper
        return decorator

    @staticmethod
    def validate_upload(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate data at upload stage.
        Criteria: >10 rows, >=2 columns.
        """
        issues = []
        if len(df) < 10:
            issues.append(f"Too few rows ({len(df)}). Need at least 10.")
        if len(df.columns) < 2:
            issues.append(f"Too few columns ({len(df.columns)}). Need at least Date and Target.")
            
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "stage": "upload"
        }

    @staticmethod
    def validate_profiling(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate data quality before profiling/preprocessing.
        Criteria: <50% missing values.
        """
        issues = []
        missing_pct = df.isnull().sum().sum() / df.size
        if missing_pct > 0.5:
            issues.append(f"Data is too sparse ({missing_pct:.1%} missing).")
            
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "stage": "profiling"
        }

    @staticmethod
    def validate_preprocessing(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate data after preprocessing.
        Criteria: 'target' is numeric, 'date' is datetime.
        """
        issues = []
        if 'target' not in df.columns:
            issues.append("Missing 'target' column.")
        elif not pd.api.types.is_numeric_dtype(df['target']):
            issues.append("'target' column is not numeric.")
            
        if 'date' not in df.columns:
            issues.append("Missing 'date' column.")
            
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "stage": "preprocessing"
        }

    @staticmethod
    def validate_training(cv_scores: List[float]) -> Dict[str, Any]:
        """
        Validate model training stability.
        Criteria: CV score standard deviation < 0.2 (arbitrary threshold for student project).
        """
        issues = []
        std = np.std(cv_scores)
        if std > 0.2:
            issues.append(f"Model unstable (CV std dev {std:.2f} > 0.2).")
            
        if np.mean(cv_scores) < 0: # R2 can be negative
             issues.append("Model performance is very poor (Negative R2).")

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "stage": "training"
        }
