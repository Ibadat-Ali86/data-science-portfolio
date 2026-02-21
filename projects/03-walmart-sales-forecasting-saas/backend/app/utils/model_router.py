"""
Model Router - Intelligent model selection based on data characteristics
Auto-selects best forecasting model with hierarchical fallbacks
"""

from typing import Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
from enum import Enum


class ModelType(Enum):
    """Available forecasting models"""
    PROPHET = "prophet"
    XGBOOST = "xgboost"
    NAIVE = "naive"
    MOVING_AVERAGE = "moving_average"
    ETS = "ets"


class ModelRouter:
    """
    Intelligently selects the best forecasting model based on data characteristics
    with hierarchical fallbacks for robustness
    """
    
    def __init__(self):
        self.selection_log = []
        
    def analyze_data_characteristics(self, df: pd.DataFrame, date_col: str, target_col: str) -> Dict[str, Any]:
        """
        Analyze data characteristics to determine best model
        
        Args:
            df: Input dataframe
            date_col: Name of date column
            target_col: Name of target column
            
        Returns:
            Dict of data characteristics
        """
        chars = {
            'row_count': len(df),
            'has_datetime': False,
            'is_regular_frequency': False,
            'strong_seasonality': False,
            'strong_trend': False,
            'feature_count': 0,
            'missing_percentage': 0.0,
            'variance': 0.0
        }
        
        # Check datetime
        if date_col in df.columns:
            try:
                df[date_col] = pd.to_datetime(df[date_col])
                chars['has_datetime'] = True
                
                # Check frequency regularity
                if len(df) > 2:
                    time_diffs = df[date_col].diff().dropna()
                    mode_diff = time_diffs.mode()
                    if len(mode_diff) > 0:
                        # If >80% of differences match the mode, it's regular
                        regular_count = (time_diffs == mode_diff[0]).sum()
                        chars['is_regular_frequency'] = (regular_count / len(time_diffs)) > 0.8
            except Exception:
                pass
        
        # Check target column characteristics
        if target_col in df.columns:
            target = df[target_col].dropna()
            if len(target) > 0:
                chars['variance'] = float(target.var())
                chars['missing_percentage'] = (df[target_col].isnull().sum() / len(df)) * 100
                
                # Detect seasonality using autocorrelation
                if len(target) > 14:  # Need minimum data for seasonality check
                    try:
                        # Check weekly seasonality (lag 7)
                        autocorr_7 = target.autocorr(lag=min(7, len(target) // 2))
                        # Check monthly seasonality (lag 30)
                        autocorr_30 = target.autocorr(lag=min(30, len(target) // 2))
                        
                        if autocorr_7 is not None and autocorr_7 > 0.3:
                            chars['strong_seasonality'] = True
                        elif autocorr_30 is not None and autocorr_30 > 0.3:
                            chars['strong_seasonality'] = True
                    except Exception:
                        pass
                
                # Detect trend
                if len(target) > 10:
                    try:
                        x = np.arange(len(target))
                        correlation = np.corrcoef(x, target)[0, 1]
                        if abs(correlation) > 0.7:
                            chars['strong_trend'] = True
                    except Exception:
                        pass
        
        # Count feature columns (excluding date and target)
        feature_cols = [col for col in df.columns if col not in [date_col, target_col]]
        numeric_features = df[feature_cols].select_dtypes(include=[np.number]).columns
        chars['feature_count'] = len(numeric_features)
        
        return chars
    
    def select_model(
        self, 
        df: pd.DataFrame,
        date_col: Optional[str] = None,
        target_col: Optional[str] = None
    ) -> Tuple[ModelType, Dict[str, Any]]:
        """
        Select the best model based on data characteristics
        
        Args:
            df: Input dataframe
            date_col: Date column name
            target_col: Target column name
            
        Returns:
            (selected_model_type, selection_metadata)
        """
        # Analyze data characteristics
        if date_col and target_col:
            chars = self.analyze_data_characteristics(df, date_col, target_col)
        else:
            # Minimal characteristics if columns not specified
            chars = {
                'row_count': len(df),
                'has_datetime': False,
                'feature_count': 0
            }
        
        selected_model = None
        reason = ""
        
        # Decision tree for model selection
        
        # PRIORITY 1: Prophet (best for time series with seasonality)
        if (chars.get('has_datetime', False) and 
            chars.get('row_count', 0) >= 30 and
            (chars.get('strong_seasonality', False) or chars.get('strong_trend', False))):
            selected_model = ModelType.PROPHET
            reason = "Prophet selected: datetime data with seasonality/trend detected"
        
        # PRIORITY 2: XGBoost (good for feature-rich data)
        elif (chars.get('row_count', 0) >= 50 and 
              chars.get('feature_count', 0) >= 2):
            selected_model = ModelType.XGBOOST
            reason = "XGBoost selected: sufficient data with multiple features"
        
        # PRIORITY 3: ETS (Exponential Smoothing for moderate data)
        elif (chars.get('has_datetime', False) and 
              30 <= chars.get('row_count', 0) < 60):
            selected_model = ModelType.ETS
            reason = "ETS selected: moderate-sized time series data"
        
        # PRIORITY 4: Moving Average (short series with trend)
        elif 10 <= chars.get('row_count', 0) < 30:
            selected_model = ModelType.MOVING_AVERAGE
            reason = "Moving Average selected: short time series (10-30 points)"
        
        # FALLBACK: Naive (last resort)
        else:
            selected_model = ModelType.NAIVE
            reason = "Naive model selected: minimal data available (emergency fallback)"
        
        selection_metadata = {
            'model': selected_model.value,
            'reason': reason,
            'characteristics': chars,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        self.selection_log.append(selection_metadata)
        return selected_model, selection_metadata
    
    def get_model_config(self, model_type: ModelType, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Get recommended configuration for selected model
        
        Args:
            model_type: Selected model type
            df: Input dataframe
            
        Returns:
            Model configuration dict
        """
        config = {}
        
        if model_type == ModelType.PROPHET:
            config = {
                'daily_seasonality': len(df) > 60,
                'weekly_seasonality': len(df) > 14,
                'yearly_seasonality': len(df) > 365,
                'changepoint_prior_scale': 0.05,  # Conservative for student data
                'seasonality_prior_scale': 10.0,
                'interval_width': 0.95  # 95% confidence intervals
            }
        
        elif model_type == ModelType.XGBOOST:
            config = {
                'n_estimators': 100,
                'max_depth': 5,
                'learning_rate': 0.1,
                'objective': 'reg:squarederror',
                'random_state': 42
            }
        
        elif model_type == ModelType.ETS:
            config = {
                'seasonal': 'add',  # Additive seasonality
                'seasonal_periods': 7,  # Assume weekly for most business data
                'damped_trend': True
            }
        
        elif model_type == ModelType.MOVING_AVERAGE:
            # Window size = min(7, len(df)//3)
            window_size = min(7, max(len(df) // 3, 3))
            config = {
                'window_size': window_size,
                'center': False
            }
        
        elif model_type == ModelType.NAIVE:
            config = {
                'method': 'last_value'  # Simply repeat last observed value
            }
        
        return config
    
    def get_fallback_model(self, failed_model: ModelType) -> Optional[ModelType]:
        """
        Get fallback model if primary selection fails
        
        Args:
            failed_model: Model that failed to train
            
        Returns:
            Fallback model type or None
        """
        fallback_chain = {
            ModelType.PROPHET: ModelType.ETS,
            ModelType.XGBOOST: ModelType.MOVING_AVERAGE,
            ModelType.ETS: ModelType.MOVING_AVERAGE,
            ModelType.MOVING_AVERAGE: ModelType.NAIVE,
            ModelType.NAIVE: None  # No fallback for naive
        }
        
        return fallback_chain.get(failed_model)
    
    def get_selection_history(self) -> list:
        """
        Get history of model selections
        
        Returns:
            List of selection metadata dicts
        """
        return self.selection_log


# Utility functions for model compatibility checks
def can_use_prophet(df: pd.DataFrame, date_col: str) -> bool:
    """Check if Prophet can be used with this data"""
    try:
        pd.to_datetime(df[date_col])
        return len(df) >= 30
    except Exception:
        return False


def can_use_xgboost(df: pd.DataFrame) -> bool:
    """Check if XGBoost can be used with this data"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    return len(df) >= 50 and len(numeric_cols) >= 2


def estimate_training_time(model_type: ModelType, row_count: int) -> float:
    """
    Estimate training time in seconds
    
    Args:
        model_type: Model type
        row_count: Number of data rows
        
    Returns:
        Estimated seconds
    """
    # Rough estimates for HF Spaces CPU
    estimates = {
        ModelType.PROPHET: 0.01 * row_count + 5,  # ~5s base + 0.01s per row
        ModelType.XGBOOST: 0.005 * row_count + 3,  # ~3s base
        ModelType.ETS: 0.005 * row_count + 2,
        ModelType.MOVING_AVERAGE: 0.001 * row_count + 0.5,
        ModelType.NAIVE: 0.1  # Nearly instant
    }
    
    return min(estimates.get(model_type, 10.0), 60.0)  # Cap at 60s
