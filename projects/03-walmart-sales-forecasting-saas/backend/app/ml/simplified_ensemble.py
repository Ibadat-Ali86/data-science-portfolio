/**
 * Phase 3: Enhanced Model Ensemble with Confidence Intervals
 * Simplified 2-model approach with detailed prediction intervals
 */

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class EnsembleResult:
    """Ensemble forecast result with confidence intervals"""
    dates: List[str]
    predictions: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    confidence_level: float
    model_weights: Dict[str, float]
    model_predictions: Dict[str, List[float]]


class SimplifiedEnsemble:
    """
    Simplified 2-model ensemble (Prophet + XGBoost or Prophet + Naive)
    More maintainable and interpretable than multi-model ensembles
    """
    
    def __init__(self, primary_model=None, fallback_model=None):
        """
        Initialize ensemble with two models
        
        Args:
            primary_model: Primary forecaster (Prophet/XGBoost)
            fallback_model: Fallback forecaster (Moving Average/Naive)
        """
        self.primary = primary_model
        self.fallback = fallback_model
        self.weights = {}
        self.model_metrics = {}
        
    def train(self, df: pd.DataFrame, target_col: str, date_col: str):
        """
        Train both models and calculate performance-based weights
        
        Args:
            df: Training dataframe
            target_col: Target column name
            date_col: Date column name
        """
        logger.info("Training simplified 2-model ensemble...")
        
        # Train primary model
        try:
            primary_metrics = self.primary.train(df, target_col, date_col)
            self.model_metrics['primary'] = primary_metrics
            logger.info(f"Primary model trained: MAPE={primary_metrics.mape}%")
        except Exception as e:
            logger.error(f"Primary model training failed: {e}")
            raise
        
        # Train fallback model
        try:
            fallback_metrics = self.fallback.train(df, target_col, date_col)
            self.model_metrics['fallback'] = fallback_metrics
            logger.info(f"Fallback model trained: MAPE={fallback_metrics.mape}%")
        except Exception as e:
            logger.warning(f"Fallback model training failed: {e}")
            # Can proceed with just primary model
            self.weights = {'primary': 1.0, 'fallback': 0.0}
            return
        
        # Calculate weights based on inverse MAPE (lower error = higher weight)
        primary_score = 1 / (primary_metrics.mape + 0.1)  # Add small constant to avoid div by zero
        fallback_score = 1 / (fallback_metrics.mape + 0.1)
        total_score = primary_score + fallback_score
        
        self.weights = {
            'primary': primary_score / total_score,
            'fallback': fallback_score / total_score
        }
        
        logger.info(f"Ensemble weights: Primary={self.weights['primary']:.2f}, Fallback={self.weights['fallback']:.2f}")
        
    def predict(self, periods: int, confidence_level: float = 0.95) -> EnsembleResult:
        """
        Generate ensemble forecast with confidence intervals
        
        Args:
            periods: Number of periods to forecast
            confidence_level: Confidence level (0-1)
            
        Returns:
            EnsembleResult with predictions and intervals
        """
        logger.info(f"Generating ensemble forecast for {periods} periods...")
        
        # Get predictions from both models
        primary_forecast = self.primary.predict(periods, confidence_level)
        
        if self.weights.get('fallback', 0) > 0:
            fallback_forecast = self.fallback.predict(periods, confidence_level)
        else:
            # No fallback, use primary only
            return EnsembleResult(
                dates=primary_forecast.dates,
                predictions=primary_forecast.predictions,
                lower_bound=primary_forecast.lower_bound,
                upper_bound=primary_forecast.upper_bound,
                confidence_level=confidence_level,
                model_weights=self.weights,
                model_predictions={'primary': primary_forecast.predictions}
            )
        
        # Weighted ensemble predictions
        ensemble_preds = []
        for i in range(periods):
            weighted_pred = (
                primary_forecast.predictions[i] * self.weights['primary'] +
                fallback_forecast.predictions[i] * self.weights['fallback']
            )
            ensemble_preds.append(weighted_pred)
        
        # Enhanced confidence intervals using prediction variance
        # Wider intervals when models disagree
        lower_bounds = []
        upper_bounds = []
        
        for i in range(periods):
            # Calculate prediction disagreement
            pred_variance = np.var([
                primary_forecast.predictions[i],
                fallback_forecast.predictions[i]
            ])
            
            # Base interval from weighted average of model intervals
            base_lower = (
                primary_forecast.lower_bound[i] * self.weights['primary'] +
                fallback_forecast.lower_bound[i] * self.weights['fallback']
            )
            base_upper = (
                primary_forecast.upper_bound[i] * self.weights['primary'] +
                fallback_forecast.upper_bound[i] * self.weights['fallback']
            )
            
            # Widen interval if models disagree significantly
            disagreement_factor = 1 + np.sqrt(pred_variance) / (ensemble_preds[i] + 1e-6)
            disagreement_factor = min(disagreement_factor, 1.5)  # Cap at 50% widening
            
            interval_width = base_upper - base_lower
            widened_width = interval_width * disagreement_factor
            
            lower_bounds.append(ensemble_preds[i] - widened_width / 2)
            upper_bounds.append(ensemble_preds[i] + widened_width / 2)
        
        return EnsembleResult(
            dates=primary_forecast.dates,
            predictions=ensemble_preds,
            lower_bound=lower_bounds,
            upper_bound=upper_bounds,
            confidence_level=confidence_level,
            model_weights=self.weights,
            model_predictions={
                'primary': primary_forecast.predictions,
                'fallback': fallback_forecast.predictions
            }
        )
    
    def get_model_comparison(self) -> Dict:
        """Get detailed comparison of the two models"""
        return {
            'primary': {
                'name': getattr(self.primary, 'model_name', 'Primary Model'),
                'mape': self.model_metrics.get('primary', {}).mape if 'primary' in self.model_metrics else None,
                'weight': self.weights.get('primary', 0)
            },
            'fallback': {
                'name': getattr(self.fallback, 'model_name', 'Fallback Model'),
                'mape': self.model_metrics.get('fallback', {}).mape if 'fallback' in self.model_metrics else None,
                'weight': self.weights.get('fallback', 0)
            }
        }


def calculate_prediction_intervals(
    predictions: List[float],
    historical_residuals: np.ndarray,
    confidence_level: float = 0.95,
    horizon_widening: bool = True
) -> Tuple[List[float], List[float]]:
    """
    Calculate prediction intervals from historical forecast residuals
    
    Args:
        predictions: Point forecasts
        historical_residuals: Residuals from validation/test set
        confidence_level: Confidence level (0-1)
        horizon_widening: If True, widen intervals with forecast horizon
        
    Returns:
        Tuple of (lower_bounds, upper_bounds)
    """
    # Z-score for confidence level
    z_scores = {0.80: 1.282, 0.90: 1.645, 0.95: 1.96, 0.99: 2.576}
    z = z_scores.get(confidence_level, 1.96)
    
    # Calculate residual standard deviation
    residual_std = np.std(historical_residuals)
    
    lower_bounds = []
    upper_bounds = []
    
    for h, pred in enumerate(predictions, 1):
        # Base margin of error
        margin = z * residual_std
        
        # Widen intervals with forecast horizon (uncertainty grows)
        if horizon_widening:
            # Sqrt growth (common in time series)
            horizon_factor = np.sqrt(h)
            margin *= horizon_factor
        
        lower_bounds.append(max(0, pred - margin))  # Floor at 0 for demand forecasting
        upper_bounds.append(pred + margin)
    
    return lower_bounds, upper_bounds
