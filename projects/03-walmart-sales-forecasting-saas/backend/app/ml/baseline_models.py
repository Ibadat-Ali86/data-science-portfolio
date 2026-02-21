
import pandas as pd
import numpy as np
import time
import logging
from typing import Dict, List, Optional
from datetime import timedelta

from app.ml.base_model import BaseForecaster, ForecastResult, TrainingMetrics

logger = logging.getLogger(__name__)

class NaiveForecaster(BaseForecaster):
    """
    Naive Forecaster - Predicts the last observed value.
    Best for: Very small datasets, random walks, or as a baseline.
    """
    def __init__(self):
        super().__init__("Naive")
        self.last_value = None
        self.std_dev = None
        self.last_date = None

    def train(self, df: pd.DataFrame, target_col: str = 'sales', date_col: str = 'date', **kwargs) -> TrainingMetrics:
        start_time = time.time()
        
        # Sort by date
        df = df.sort_values(date_col)
        
        # Simple training: just store the last value and stats
        self.last_value = df[target_col].iloc[-1]
        self.last_date = df[date_col].iloc[-1]
        self.std_dev = df[target_col].std()
        
        # Calculate in-sample metrics (naive forecast usually has high error on volatile data)
        # Shift target by 1 to simulate "naive" prediction on historical data
        y_true = df[target_col].iloc[1:].values
        y_pred = df[target_col].iloc[:-1].values
        
        # Metrics
        mape = np.mean(np.abs((y_true - y_pred) / (y_true + 1e-6))) * 100
        rmse = np.sqrt(np.mean((y_true - y_pred)**2))
        mae = np.mean(np.abs(y_true - y_pred))
        
        # R2 score
        ss_res = np.sum((y_true - y_pred)**2)
        ss_tot = np.sum((y_true - np.mean(y_true))**2)
        r2 = 1 - (ss_res / (ss_tot + 1e-6))
        
        self.is_trained = True
        training_time = time.time() - start_time
        
        self.training_metrics = TrainingMetrics(
            mape=round(float(mape), 2),
            rmse=round(float(rmse), 2),
            mae=round(float(mae), 2),
            r2=round(float(r2), 4),
            training_samples=len(df),
            validation_samples=0, # No validation set for naive
            training_time_seconds=round(training_time, 4)
        )
        return self.training_metrics

    def predict(self, periods: int = 30, confidence_level: float = 0.95) -> ForecastResult:
        if not self.is_trained:
             raise ValueError("Model must be trained before prediction")

        start_time = time.time()
        dates = []
        preds = []
        
        # Constant prediction
        current_date = pd.to_datetime(self.last_date)
        for i in range(periods):
            current_date += timedelta(days=1)
            dates.append(current_date.strftime('%Y-%m-%d'))
            preds.append(self.last_value)
            
        # Confidence intervals based on historical volatility
        z_score = 1.96 # Approx for 95%
        margin = z_score * self.std_dev
        
        lower_bound = [max(0, p - margin) for p in preds] # Assuming non-negative sales
        upper_bound = [p + margin for p in preds]
        
        return ForecastResult(
            dates=dates,
            predictions=preds,
            lower_bound=lower_bound,
            upper_bound=upper_bound,
            model_type=self.model_name,
            confidence_level=confidence_level * 100,
            metrics=self.training_metrics.__dict__,
            training_time=time.time() - start_time
        )


class MovingAverageForecaster(BaseForecaster):
    """
    Moving Average Forecaster - Predicts the average of the last N periods.
    Best for: Stable trends, smoothing noise.
    """
    def __init__(self, window: int = 7):
        super().__init__(f"MovingAverage({window})")
        self.window = window
        self.last_window_mean = None
        self.std_dev = None
        self.last_date = None

    def train(self, df: pd.DataFrame, target_col: str = 'sales', date_col: str = 'date', window: int = 7, **kwargs) -> TrainingMetrics:
        start_time = time.time()
        self.window = window
        self.model_name = f"MovingAverage({window})"
        
        df = df.sort_values(date_col)
        
        # "Train" = Calculate stats
        series = df[target_col]
        self.last_window_mean = series.iloc[-self.window:].mean()
        self.last_date = df[date_col].iloc[-1]
        self.std_dev = series.std()
        
        # Calculate historical performance (Rolling Mean Shifted)
        y_true = series.iloc[window:].values
        y_pred = series.rolling(window=window).mean().shift(1).iloc[window:].values
        
        # Clean NaNs from shift
        valid_idx = ~np.isnan(y_pred)
        y_true = y_true[valid_idx]
        y_pred = y_pred[valid_idx]
        
        if len(y_true) == 0:
             # Fallback if data too short
             mape, rmse, mae, r2 = 0, 0, 0, 0
        else:
            mape = np.mean(np.abs((y_true - y_pred) / (y_true + 1e-6))) * 100
            rmse = np.sqrt(np.mean((y_true - y_pred)**2))
            mae = np.mean(np.abs(y_true - y_pred))
            
            ss_res = np.sum((y_true - y_pred)**2)
            ss_tot = np.sum((y_true - np.mean(y_true))**2)
            r2 = 1 - (ss_res / (ss_tot + 1e-6))

        self.is_trained = True
        training_time = time.time() - start_time
        
        self.training_metrics = TrainingMetrics(
            mape=round(float(mape), 2),
            rmse=round(float(rmse), 2),
            mae=round(float(mae), 2),
            r2=round(float(r2), 4),
            training_samples=len(df),
            validation_samples=0,
            training_time_seconds=round(training_time, 4)
        )
        return self.training_metrics

    def predict(self, periods: int = 30, confidence_level: float = 0.95) -> ForecastResult:
        if not self.is_trained:
             raise ValueError("Model must be trained before prediction")

        start_time = time.time()
        dates = []
        preds = []
        
        # For simple Moving Average, we project the LAST calculated mean forward
        # (Recursive MA would converge to mean, but simple MA just projects the window)
        current_date = pd.to_datetime(self.last_date)
        for i in range(periods):
            current_date += timedelta(days=1)
            dates.append(current_date.strftime('%Y-%m-%d'))
            preds.append(self.last_window_mean)
            
        # Confidence
        z_score = 1.96
        margin = z_score * self.std_dev
        
        lower_bound = [max(0, p - margin) for p in preds]
        upper_bound = [p + margin for p in preds]
        
        return ForecastResult(
            dates=dates,
            predictions=preds,
            lower_bound=lower_bound,
            upper_bound=upper_bound,
            model_type=self.model_name,
            confidence_level=confidence_level * 100,
            metrics=self.training_metrics.__dict__,
            training_time=time.time() - start_time
        )
