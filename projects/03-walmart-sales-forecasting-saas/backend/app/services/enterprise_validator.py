"""
Enterprise Data Validator
Comprehensive validation with 10+ checks and user-friendly error messages
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple, Any
from ..utils.structured_logger import validation_logger


class EnterpriseDataValidator:
    """
    Comprehensive data validation with enterprise constraints
    
    Implements 10 validation checks:
    1. File size constraints
    2. Row count (min/max)
    3. Required columns
    4. Data types
    5. Date validity
    6. Missing values
    7. Date range
    8. Target validity
    9. Duplicates
    10. Outliers
    """
    
    # Enterprise constraints
    MAX_FILE_SIZE_MB = 50
    MAX_ROWS = 1_000_000
    MIN_ROWS = 30  # Minimum for meaningful forecasting
    REQUIRED_COLUMNS = ['date', 'target']  # After mapping
    ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls', '.tsv', '.parquet'}
    MAX_MISSING_PERCENT = 0.30  # 30% max missing values
    MIN_DATE_RANGE_DAYS = 14  # Minimum 2 weeks of data
    
    def __init__(self, file_path: str, file_size_bytes: int, column_mapping: Dict[str, str]):
        """
        Initialize validator
        
        Args:
            file_path: Path to uploaded file
            file_size_bytes: Size of file in bytes
            column_mapping: Dict mapping actual columns to required columns
        """
        self.file_path = file_path
        self.file_size_bytes = file_size_bytes
        self.column_mapping = column_mapping
        
        self.validation_results = {
            "passed": [],
            "failed": [],
            "warnings": []
        }
        
        validation_logger.info(
            f"Initialized validator for file: {file_path}",
            file_size_bytes=file_size_bytes
        )
    
    def validate(self, df: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Run comprehensive validation
        
        Args:
            df: DataFrame to validate
            
        Returns:
            Tuple of (is_valid, detailed_results)
        """
        validation_logger.info(f"Starting validation for {len(df)} rows, {len(df.columns)} columns")
        
        checks = [
            self._check_file_size,
            self._check_row_count,
            self._check_required_columns,
            self._check_data_types,
            self._check_date_validity,
            self._check_missing_values,
            self._check_date_range,
            self._check_target_validity,
            self._check_duplicates,
            self._check_outliers
        ]
        
        for check in checks:
            try:
                check(df)
            except ValidationError as e:
                self.validation_results["failed"].append({
                    "check": check.__name__.replace("_check_", ""),
                    "error": e.message,
                    "severity": "ERROR",
                    "context": e.context
                })
                validation_logger.error(
                    f"Validation check failed: {check.__name__}",
                    error=e.message,
                    context=e.context
                )
        
        is_valid = len(self.validation_results["failed"]) == 0
        
        # Calculate quality score
        total_checks = len(checks)
        passed_checks = len(self.validation_results["passed"])
        quality_score = (passed_checks / total_checks) * 100
        
        validation_logger.info(
            "Validation completed",
            is_valid=is_valid,
            quality_score=quality_score,
            passed=passed_checks,
            failed=len(self.validation_results["failed"]),
            warnings=len(self.validation_results["warnings"])
        )
        
        return is_valid, {
            **self.validation_results,
            "quality_score": quality_score,
            "total_checks": total_checks
        }
    
    def _check_file_size(self, df: pd.DataFrame):
        """Validate file size constraints"""
        size_mb = self.file_size_bytes / (1024 * 1024)
        if size_mb > self.MAX_FILE_SIZE_MB:
            raise ValidationError(
                f"File size ({size_mb:.1f}MB) exceeds maximum allowed ({self.MAX_FILE_SIZE_MB}MB)",
                {"file_size_mb": size_mb, "max_allowed": self.MAX_FILE_SIZE_MB}
            )
        self.validation_results["passed"].append("file_size")
    
    def _check_row_count(self, df: pd.DataFrame):
        """Validate row count constraints"""
        row_count = len(df)
        if row_count < self.MIN_ROWS:
            raise ValidationError(
                f"Dataset has only {row_count} rows. Minimum required: {self.MIN_ROWS} rows for meaningful forecasting",
                {"row_count": row_count, "min_required": self.MIN_ROWS}
            )
        if row_count > self.MAX_ROWS:
            raise ValidationError(
                f"Dataset has {row_count:,} rows. Maximum allowed: {self.MAX_ROWS:,} rows",
                {"row_count": row_count, "max_allowed": self.MAX_ROWS}
            )
        self.validation_results["passed"].append("row_count")
    
    def _check_required_columns(self, df: pd.DataFrame):
        """Validate required columns exist after mapping"""
        mapped_columns = set(self.column_mapping.values())
        missing = set(self.REQUIRED_COLUMNS) - mapped_columns
        
        if missing:
            raise ValidationError(
                f"Missing required columns after mapping: {missing}",
                {"missing_columns": list(missing), "available": list(mapped_columns)}
            )
        self.validation_results["passed"].append("required_columns")
    
    def _check_data_types(self, df: pd.DataFrame):
        """Validate data types of key columns"""
        date_col = self.column_mapping.get('date')
        target_col = self.column_mapping.get('target')
        
        if date_col and date_col in df.columns:
            try:
                pd.to_datetime(df[date_col])
            except Exception as e:
                raise ValidationError(
                    f"Date column '{date_col}' contains invalid date values",
                    {"column": date_col, "error": str(e)}
                )
        
        if target_col and target_col in df.columns:
            if not pd.api.types.is_numeric_dtype(df[target_col]):
                raise ValidationError(
                    f"Target column '{target_col}' must be numeric",
                    {"column": target_col, "current_type": str(df[target_col].dtype)}
                )
        
        self.validation_results["passed"].append("data_types")
    
    def _check_date_validity(self, df: pd.DataFrame):
        """Check for valid date ranges and sequences"""
        date_col = self.column_mapping.get('date')
        if not date_col or date_col not in df.columns:
            return
        
        dates = pd.to_datetime(df[date_col])
        
        # Check for future dates
        future_dates = dates > datetime.now()
        if future_dates.any():
            future_count = future_dates.sum()
            self.validation_results["warnings"].append({
                "check": "future_dates",
                "message": f"Found {future_count} future dates in dataset",
                "severity": "WARNING"
            })
        
        # Check for date sequence gaps
        sorted_dates = dates.sort_values()
        date_diffs = sorted_dates.diff().dropna()
        
        if len(date_diffs) > 0:
            # Check for gaps > 30 days
            large_gaps = date_diffs[date_diffs > pd.Timedelta(days=30)]
            if len(large_gaps) > 0:
                self.validation_results["warnings"].append({
                    "check": "date_gaps",
                    "message": f"Found {len(large_gaps)} gaps > 30 days in date sequence",
                    "severity": "WARNING"
                })
        
        self.validation_results["passed"].append("date_validity")
    
    def _check_missing_values(self, df: pd.DataFrame):
        """Check missing value percentages"""
        missing_percent = df.isnull().sum() / len(df)
        high_missing = missing_percent[missing_percent > self.MAX_MISSING_PERCENT]
        
        if not high_missing.empty:
            columns_info = {col: f"{pct:.1%}" for col, pct in high_missing.items()}
            raise ValidationError(
                f"Columns with >{self.MAX_MISSING_PERCENT*100}% missing values: {list(columns_info.keys())}",
                {"columns": columns_info, "threshold": self.MAX_MISSING_PERCENT}
            )
        
        self.validation_results["passed"].append("missing_values")
    
    def _check_date_range(self, df: pd.DataFrame):
        """Validate minimum date range"""
        date_col = self.column_mapping.get('date')
        if not date_col or date_col not in df.columns:
            return
        
        dates = pd.to_datetime(df[date_col])
        date_range = (dates.max() - dates.min()).days
        
        if date_range < self.MIN_DATE_RANGE_DAYS:
            raise ValidationError(
                f"Date range ({date_range} days) is too short. Minimum: {self.MIN_DATE_RANGE_DAYS} days",
                {"date_range_days": date_range, "min_required": self.MIN_DATE_RANGE_DAYS}
            )
        
        self.validation_results["passed"].append("date_range")
    
    def _check_target_validity(self, df: pd.DataFrame):
        """Validate target column has valid values"""
        target_col = self.column_mapping.get('target')
        if not target_col or target_col not in df.columns:
            return
        
        target_series = df[target_col]
        
        # Check for all zeros
        if (target_series == 0).all():
            raise ValidationError(
                f"Target column '{target_col}' contains all zeros",
                {"column": target_col}
            )
        
        # Check for negative values (warning)
        negative_count = (target_series < 0).sum()
        if negative_count > 0:
            self.validation_results["warnings"].append({
                "check": "negative_values",
                "message": f"Target has {negative_count} negative values",
                "severity": "WARNING"
            })
        
        # Check for variance
        if target_series.std() == 0:
            raise ValidationError(
                f"Target column '{target_col}' has zero variance (constant values)",
                {"column": target_col, "unique_values": target_series.nunique()}
            )
        
        self.validation_results["passed"].append("target_validity")
    
    def _check_duplicates(self, df: pd.DataFrame):
        """Check for duplicate rows"""
        duplicates = df.duplicated().sum()
        if duplicates > 0:
            self.validation_results["warnings"].append({
                "check": "duplicates",
                "message": f"Found {duplicates} duplicate rows",
                "severity": "WARNING"
            })
        
        self.validation_results["passed"].append("duplicates")
    
    def _check_outliers(self, df: pd.DataFrame):
        """Check for extreme outliers using IQR method"""
        target_col = self.column_mapping.get('target')
        if not target_col or target_col not in df.columns:
            return
        
        Q1 = df[target_col].quantile(0.25)
        Q3 = df[target_col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 3 * IQR  # 3x IQR for extreme outliers
        upper_bound = Q3 + 3 * IQR
        
        outliers = df[(df[target_col] < lower_bound) | (df[target_col] > upper_bound)]
        
        if len(outliers) > 0:
            outlier_percent = (len(outliers) / len(df)) * 100
            if outlier_percent > 5:  # More than 5% outliers
                self.validation_results["warnings"].append({
                    "check": "outliers",
                    "message": f"Found {len(outliers)} extreme outliers ({outlier_percent:.1f}%)",
                    "severity": "WARNING"
                })
        
        self.validation_results["passed"].append("outliers")
    
    @staticmethod
    def translate_error_to_user_message(failure: Dict) -> str:
        """Translate technical errors to user-friendly messages"""
        error_translations = {
            "file_size": "Your file is too large. Please upload a file smaller than 50MB.",
            "row_count": "Your dataset doesn't have enough rows. We need at least 30 records for meaningful forecasting.",
            "required_columns": "Some required columns are missing. Please check your column mapping.",
            "data_types": "Some columns have incorrect data types. Dates should be valid dates, and your target should be numeric.",
            "date_validity": "There are issues with your date column. Please ensure all dates are valid.",
            "missing_values": "Too many missing values detected. Please clean your data or choose columns with more complete data.",
            "date_range": "Your date range is too short. We need at least 2 weeks of data.",
            "target_validity": "Your target column has issues (all zeros or no variation). Please check your data.",
            "duplicates": "Duplicate rows detected in your data.",
            "outliers": "Extreme outliers detected in your target values."
        }
        
        check_name = failure.get("check", "")
        return error_translations.get(check_name, failure.get("error", "Unknown error"))
    
    @staticmethod
    def suggest_validation_fixes(results: Dict) -> List[str]:
        """Suggest specific actions to fix validation issues"""
        suggestions = []
        
        for failure in results.get("failed", []):
            check = failure.get("check", "")
            
            if "file_size" in check:
                suggestions.append("Compress your file or split it into smaller chunks")
            elif "row_count" in check:
                suggestions.append("Add more historical data or use a different dataset")
            elif "missing_values" in check:
                suggestions.append("Fill missing values in your source data or select columns with better data quality")
            elif "date_range" in check:
                suggestions.append("Include more historical data spanning at least 2 weeks")
            elif "target_validity" in check:
                suggestions.append("Check that your target column contains actual sales/demand values, not zeros")
        
        return list(set(suggestions))  # Remove duplicates


class ValidationError(Exception):
    """Custom exception for validation errors"""
    def __init__(self, message: str, context: Dict[str, Any]):
        self.message = message
        self.context = context
        super().__init__(self.message)
