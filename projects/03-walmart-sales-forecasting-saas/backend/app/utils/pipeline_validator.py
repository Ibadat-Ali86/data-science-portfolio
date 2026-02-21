"""
Pipeline Validator - Validation gates for each pipeline stage
Stops pipeline with clear error messages when data quality fails thresholds
"""

from typing import Dict, List, Optional, Callable, Any
import pandas as pd
import numpy as np
from datetime import datetime


class ValidationError(Exception):
    """Custom exception for validation failures"""
    def __init__(self, stage: str, message: str, suggestion: Optional[str] = None):
        self.stage = stage
        self.message = message
        self.suggestion = suggestion
        super().__init__(f"[{stage}] {message}")


class PipelineValidator:
    """
    Validates data at each pipeline stage with clear, user-friendly error messages
    """
    
    def __init__(self):
        self.validation_history = []
        
    def validate_upload(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate uploaded data meets minimum requirements
        
        Args:
            df: Uploaded dataframe
            
        Returns:
            Validation result dict
            
        Raises:
            ValidationError: If validation fails
        """
        result = {
            'stage': 'upload',
            'passed': True,
            'warnings': [],
            'info': {}
        }
        
        # Check 1: Minimum rows (Blueprint spec: 50)
        if len(df) < 50:
            raise ValidationError(
                stage='upload',
                message=f"Your dataset has only {len(df)} rows. Minimum 50 required for reliable forecasting.",
                suggestion="Minimum 50 required for reliable forecasting. Please upload more historical data."
            )
        
        result['info']['row_count'] = len(df)
        
        # Check 2: Minimum columns
        if len(df.columns) < 2:
            raise ValidationError(
                stage='upload',
                message=f"Insufficient columns: only {len(df.columns)} column(s) found",
                suggestion="Need at least 2 columns (date + value). Please check your CSV format."
            )
        
        result['info']['column_count'] = len(df.columns)

        # Check 3: Check for Date column (if adapted)
        if 'date' in df.columns:
            try:
                # Test parsing head
                pd.to_datetime(df['date'].head(10))
            except Exception:
                raise ValidationError(
                    stage='upload',
                    message="Date column could not be parsed. Supported formats: YYYY-MM-DD, MM/DD/YYYY, DD-Mon-YYYY.",
                    suggestion="Ensure dates are in a consistent format."
                )

        # Check 4: Check for Target column (if adapted)
        if 'target' in df.columns:
            if not pd.api.types.is_numeric_dtype(df['target']):
                raise ValidationError(
                    stage='upload',
                    message="Sales/Target column contains non-numeric data.",
                    suggestion="Please review your target column for text or invalid characters."
                )
            if (df['target'].dropna() < 0).any():
                raise ValidationError(
                    stage='upload',
                    message="Sales/Target column contains negative values.",
                    suggestion="Please review target data. Demand cannot be negative."
                )
        
        # Warning for small dataset
        if len(df) < 30:
            result['warnings'].append(
                f"Small dataset ({len(df)} rows). Results may be less accurate. Recommended: 30+ rows."
            )
        
        # Warning for many columns
        if len(df.columns) > 50:
            result['warnings'].append(
                f"Many columns detected ({len(df.columns)}). Ensure your data is in the correct format (long format recommended)."
            )
        
        self.validation_history.append(result)
        return result
    
    def validate_profile(self, df: pd.DataFrame, profile_data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Validate profiled data quality
        
        Args:
            df: Profiled dataframe
            profile_data: Optional profile metadata
            
        Returns:
            Validation result dict
            
        Raises:
            ValidationError: If validation fails critically
        """
        result = {
            'stage': 'profile',
            'passed': True,
            'warnings': [],
            'info': {}
        }
        
        # Check 1: Missing data percentage
        total_cells = df.shape[0] * df.shape[1]
        missing_cells = df.isnull().sum().sum()
        missing_pct = (missing_cells / total_cells) * 100
        
        result['info']['missing_percentage'] = missing_pct
        
        if missing_pct > 90:
            raise ValidationError(
                stage='profile',
                message=f"Dataset is {missing_pct:.1f}% missing values",
                suggestion="Too many missing values. Please provide a more complete dataset."
            )
        elif missing_pct > 50:
            result['warnings'].append(
                f"High missing values ({missing_pct:.1f}%). Will attempt to fill, but forecast quality may be affected."
            )
        
        # Check 2: At least one numeric column
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            raise ValidationError(
                stage='profile',
                message="No numeric columns found in dataset",
                suggestion="Forecasting requires at least one numeric column (e.g., sales, revenue, demand)."
            )
        
        result['info']['numeric_columns'] = len(numeric_cols)
        
        # Check 3: Date column existence (if profile data provided)
        if profile_data and 'date_column' not in profile_data:
            result['warnings'].append(
                "No date column auto-detected. You may need to manually specify the date column."
            )
        
        self.validation_history.append(result)
        return result
    
    def validate_preprocess(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate preprocessed data is ready for training
        
        Args:
            df: Preprocessed dataframe
            
        Returns:
            Validation result dict
            
        Raises:
            ValidationError: If validation fails
        """
        result = {
            'stage': 'preprocess',
            'passed': True,
            'warnings': [],
            'info': {}
        }
        
        # Check 1: Must have numeric data
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            raise ValidationError(
                stage='preprocess',
                message="No numeric columns after preprocessing",
                suggestion="Preprocessing failed to create usable numeric features. Please check your data format."
            )
        
        result['info']['numeric_features'] = len(numeric_cols)
        
        # Check 2: No infinite values
        if np.isinf(df.select_dtypes(include=[np.number])).any().any():
            raise ValidationError(
                stage='preprocess',
                message="Infinite values detected after preprocessing",
                suggestion="Data contains infinite values (possibly from division by zero). Please check your calculations."
            )
        
        # Check 3: Check for NaN after preprocessing
        missing_pct = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100
        if missing_pct > 5:
            result['warnings'].append(
                f"Still {missing_pct:.1f}% missing values after preprocessing. May affect model quality."
            )
        
        result['info']['final_missing_pct'] = missing_pct
        
        # Check 4: Sufficient variance
        for col in numeric_cols:
            variance = df[col].var()
            if variance == 0 or pd.isna(variance):
                result['warnings'].append(
                    f"Column '{col}' has zero variance (all values are the same). May not be useful for forecasting."
                )
        
        self.validation_history.append(result)
        return result
    
    def validate_train(
        self, 
        model: Any,
        cv_scores: Optional[np.ndarray] = None,
        metrics: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Validate trained model quality
        
        Args:
            model: Trained model object
            cv_scores: Cross-validation scores
            metrics: Training metrics dict
            
        Returns:
            Validation result dict
            
        Raises:
            ValidationError: If validation fails
        """
        result = {
            'stage': 'train',
            'passed': True,
            'warnings': [],
            'info': {}
        }
        
        # Check 1: Model exists
        if model is None:
            raise ValidationError(
                stage='train',
                message="Model training failed - no model produced",
                suggestion="Training process failed. Please check your data and try again."
            )
        
        # Check 2: CV stability (if provided)
        if cv_scores is not None and len(cv_scores) > 1:
            cv_std = np.std(cv_scores)
            cv_mean = np.mean(cv_scores)
            
            result['info']['cv_mean'] = float(cv_mean)
            result['info']['cv_std'] = float(cv_std)
            
            # High variance in CV scores indicates instability
            if cv_std > 0.3:
                result['warnings'].append(
                    f"Model shows unstable cross-validation scores (std: {cv_std:.3f}). Predictions may be unreliable."
                )
            elif cv_std > 0.2:
                result['warnings'].append(
                    f"Moderate variance in model performance (std: {cv_std:.3f}). Use predictions with caution."
                )
        
        # Check 3: MAPE threshold (if provided)
        if metrics and 'mape' in metrics:
            mape = metrics['mape']
            result['info']['mape'] = mape
            
            if mape > 100:
                result['warnings'].append(
                    f"Very high error rate (MAPE: {mape:.1f}%). Model predictions may not be reliable."
                )
            elif mape > 50:
                result['warnings'].append(
                    f"High error rate (MAPE: {mape:.1f}%). Use for directional guidance only."
                )
        
        self.validation_history.append(result)
        return result
    
    def get_validation_summary(self) -> Dict[str, Any]:
        """
        Get summary of all validations performed
        
        Returns:
            Summary dict with all validation results
        """
        return {
            'total_validations': len(self.validation_history),
            'all_passed': all(v['passed'] for v in self.validation_history),
            'total_warnings': sum(len(v['warnings']) for v in self.validation_history),
            'stages': self.validation_history
        }


# Standalone validation functions for common checks
def check_data_size(df: pd.DataFrame, min_rows: int = 50) -> bool:
    """Quick check if dataframe has minimum rows"""
    return len(df) >= min_rows


def check_has_numeric(df: pd.DataFrame) -> bool:
    """Quick check if dataframe has numeric columns"""
    return len(df.select_dtypes(include=[np.number]).columns) > 0


def check_missing_threshold(df: pd.DataFrame, max_missing_pct: float = 50.0) -> bool:
    """Quick check if missing data is below threshold"""
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = df.isnull().sum().sum()
    missing_pct = (missing_cells / total_cells) * 100
    return missing_pct <= max_missing_pct


def get_data_quality_score(df: pd.DataFrame) -> float:
    """
    Calculate overall data quality score (0-100)
    
    Args:
        df: Input dataframe
        
    Returns:
        Quality score from 0-100
    """
    score = 100.0
    
    # Deduct for missing values
    missing_pct = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100
    score -= min(missing_pct, 30)  # Max 30 point deduction
    
    # Deduct for small size
    if len(df) < 30:
        score -= 20
    elif len(df) < 50:
        score -= 10
    
    # Deduct if no numeric columns
    if not check_has_numeric(df):
        score -= 40
    
    # Deduct for low variance
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        low_variance_count = 0
        for col in numeric_cols:
            if df[col].var() == 0:
                low_variance_count += 1
        
        if low_variance_count > 0:
            score -= min(low_variance_count * 5, 20)  # Max 20 point deduction
    
    return max(score, 0.0)  # Floor at 0
