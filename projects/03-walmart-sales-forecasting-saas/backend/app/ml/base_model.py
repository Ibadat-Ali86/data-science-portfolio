"""
Base Forecaster - Abstract base class for all ML models
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import pandas as pd
import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class ForecastResult:
    """Standardized forecast result structure"""
    dates: List[str]
    predictions: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    model_type: str
    confidence_level: float
    metrics: Dict[str, float]
    training_time: float
    feature_importance: Optional[Dict[str, float]] = None


@dataclass
class TrainingMetrics:
    """Model training metrics"""
    mape: float  # Mean Absolute Percentage Error
    rmse: float  # Root Mean Square Error
    mae: float   # Mean Absolute Error
    r2: float    # R-squared
    training_samples: int
    validation_samples: int
    training_time_seconds: float


class BaseForecaster(ABC):
    """Abstract base class for all forecasting models"""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.model = None
        self.is_trained = False
        self.training_metrics: Optional[TrainingMetrics] = None
        self.feature_columns: List[str] = []
        
    @abstractmethod
    def train(
        self, 
        df: pd.DataFrame, 
        target_col: str = 'sales',
        date_col: str = 'date',
        **kwargs
    ) -> TrainingMetrics:
        """Train the model on historical data"""
        pass
    
    @abstractmethod
    def predict(
        self, 
        periods: int = 30,
        confidence_level: float = 0.95
    ) -> ForecastResult:
        """Generate predictions for future periods"""
        pass
    
    def prepare_data(
        self, 
        df: pd.DataFrame, 
        target_col: str = 'sales',
        date_col: str = 'date'
    ) -> pd.DataFrame:
        """Prepare and clean data for training"""
        df = df.copy()
        
        # Ensure date column is datetime
        if date_col in df.columns:
            df[date_col] = pd.to_datetime(df[date_col])
            df = df.sort_values(date_col)
        
        # Handle missing values
        if target_col in df.columns:
            # Use forward fill to prevent data leakage (respects time order)
            df[target_col] = df[target_col].ffill()
            # If any remaining NaNs at the start, fill with 0 or the first valid value
            df[target_col] = df[target_col].fillna(0)
        
        # Remove duplicates
        if date_col in df.columns:
            df = df.drop_duplicates(subset=[date_col], keep='last')
        
        return df
    
    def create_features(self, df: pd.DataFrame, date_col: str = 'date') -> pd.DataFrame:
        """Create time-based features for modeling"""
        df = df.copy()
        
        if date_col not in df.columns:
            return df
            
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Time-based features
        df['day_of_week'] = df[date_col].dt.dayofweek
        df['day_of_month'] = df[date_col].dt.day
        df['month'] = df[date_col].dt.month
        df['quarter'] = df[date_col].dt.quarter
        df['year'] = df[date_col].dt.year
        df['week_of_year'] = df[date_col].dt.isocalendar().week.astype(int)
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_month_start'] = df[date_col].dt.is_month_start.astype(int)
        df['is_month_end'] = df[date_col].dt.is_month_end.astype(int)
        
        return df
    
    def create_lag_features(
        self, 
        df: pd.DataFrame, 
        target_col: str = 'sales',
        lags: List[int] = [1, 7, 14, 30]
    ) -> pd.DataFrame:
        """Create lag features for time series modeling"""
        df = df.copy()
        
        for lag in lags:
            df[f'lag_{lag}'] = df[target_col].shift(lag)
        
        # Rolling statistics
        for window in [7, 14, 30]:
            df[f'rolling_mean_{window}'] = df[target_col].rolling(window=window).mean()
            df[f'rolling_std_{window}'] = df[target_col].rolling(window=window).std()
        
        return df
    
    def calculate_metrics(
        self, 
        actual: np.ndarray, 
        predicted: np.ndarray
    ) -> Dict[str, float]:
        """Calculate forecast accuracy metrics"""
        actual = np.array(actual)
        predicted = np.array(predicted)
        
        # Filter out zeros to avoid division errors
        mask = actual != 0
        
        # MAPE
        if mask.sum() > 0:
            mape = np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100
        else:
            mape = 0.0
        
        # RMSE
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))
        
        # MAE
        mae = np.mean(np.abs(actual - predicted))
        
        # R²
        ss_res = np.sum((actual - predicted) ** 2)
        ss_tot = np.sum((actual - np.mean(actual)) ** 2)
        r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            'mape': float(round(mape, 2)),
            'rmse': float(round(rmse, 2)),
            'mae': float(round(mae, 2)),
            'r2': float(round(max(0, min(1, r2)), 4))  # Clamp between 0 and 1
        }
    
    def get_accuracy_rating(self, mape: float) -> str:
        """Get human-readable accuracy rating based on MAPE"""
        if mape < 5:
            return "Excellent"
        elif mape < 10:
            return "Very Good"
        elif mape < 20:
            return "Good"
        elif mape < 30:
            return "Fair"
        else:
            return "Poor"
