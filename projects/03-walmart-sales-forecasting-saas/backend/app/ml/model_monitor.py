"""
Model Monitoring and Drift Detection

This module implements production-grade model monitoring with:
- Feature distribution drift detection (using KS-test)
- Prediction distribution drift detection
- Performance degradation monitoring
- Alert generation and logging

Author: ML Team
Date: 2026-02-08
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from scipy.stats import ks_2samp
import json
import logging

logger = logging.getLogger(__name__)


@dataclass
class DriftMetrics:
    """Container for drift detection metrics."""
    feature_drift: Dict[str, float]  # p-values from KS test
    prediction_drift: float
    performance_drift: float  # Change in MAPE
    alert_triggered: bool
    timestamp: str
    drifted_features: List[str]
    severity: str  # 'low', 'medium', 'high', 'critical'


class ModelMonitor:
    """
    Production model monitoring with drift detection.
    
    Monitors:
    1. Feature distribution drift (input drift)
    2. Prediction distribution drift (output drift) 
    3. Performance degradation (MAPE increase)
    
    Uses Kolmogorov-Smirnov test for distribution comparison.
    KS-test is non-parametric and works well for detecting shifts
    in continuous distributions.
    
    Usage:
        # Initialize with reference (training) data
        monitor = ModelMonitor(
            reference_data=X_train,
            reference_predictions=train_preds,
            reference_actuals=y_train
        )
        
        # Weekly monitoring
        drift_metrics = monitor.detect_drift(
            production_data=X_prod,
            production_predictions=prod_preds,
            production_actuals=y_prod  # if available
        )
        
        # Generate report
        report = monitor.generate_report(drift_metrics)
    """
    
    def __init__(
        self,
        reference_data: pd.DataFrame,
        reference_predictions: np.ndarray,
        reference_actuals: np.ndarray,
        drift_threshold: float = 0.05,
        performance_threshold: float = 0.5
    ):
        """
        Initialize the monitor with reference data.
        
        Args:
            reference_data: Training feature data
            reference_predictions: Model predictions on training data
            reference_actuals: Actual values for training data
            drift_threshold: p-value threshold for drift detection (default 0.05)
            performance_threshold: MAPE increase tolerance in percentage points
        """
        self.reference_data = reference_data
        self.reference_predictions = reference_predictions
        self.reference_actuals = reference_actuals
        self.drift_threshold = drift_threshold
        self.performance_threshold = performance_threshold
        
        # Calculate reference metrics
        self.reference_mape = self._calculate_mape(reference_actuals, reference_predictions)
        self.reference_feature_stats = self._calculate_feature_stats(reference_data)
        
        # Monitoring history
        self.monitoring_history = []
        
        logger.info(f"ModelMonitor initialized with reference MAPE: {self.reference_mape:.2f}%")
    
    def _calculate_mape(self, actuals: np.ndarray, predictions: np.ndarray) -> float:
        """Calculate Mean Absolute Percentage Error."""
        return np.mean(np.abs((actuals - predictions) / (actuals + 1e-6))) * 100
    
    def _calculate_feature_stats(self, data: pd.DataFrame) -> Dict[str, Dict]:
        """Calculate feature statistics for drift detection."""
        stats = {}
        for col in data.select_dtypes(include=[np.number]).columns:
            stats[col] = {
                'mean': float(data[col].mean()),
                'std': float(data[col].std()),
                'min': float(data[col].min()),
                'max': float(data[col].max()),
                'q25': float(data[col].quantile(0.25)),
                'median': float(data[col].quantile(0.5)),
                'q75': float(data[col].quantile(0.75))
            }
        return stats
    
    def detect_drift(
        self,
        production_data: pd.DataFrame,
        production_predictions: np.ndarray,
        production_actuals: Optional[np.ndarray] = None
    ) -> DriftMetrics:
        """
        Detect drift in production data.
        
        Uses Kolmogorov-Smirnov test for distribution comparison.
        Lower p-value indicates more significant drift.
        
        Args:
            production_data: Current production feature data
            production_predictions: Current model predictions
            production_actuals: Actual values (if available with lag)
            
        Returns:
            DriftMetrics object with detection results
        """
        # 1. Feature Distribution Drift
        feature_drift = {}
        drifted_features = []
        
        for col in production_data.select_dtypes(include=[np.number]).columns:
            if col in self.reference_data.columns:
                try:
                    statistic, p_value = ks_2samp(
                        self.reference_data[col].dropna(),
                        production_data[col].dropna()
                    )
                    feature_drift[col] = float(p_value)
                    
                    if p_value < self.drift_threshold:
                        drifted_features.append(col)
                except Exception as e:
                    logger.warning(f"Could not compute KS test for {col}: {e}")
                    feature_drift[col] = 1.0  # Assume no drift if test fails
        
        # 2. Prediction Distribution Drift
        try:
            pred_statistic, pred_p_value = ks_2samp(
                self.reference_predictions.flatten(),
                production_predictions.flatten()
            )
        except Exception as e:
            logger.warning(f"Prediction drift test failed: {e}")
            pred_p_value = 1.0
        
        # 3. Performance Drift (if actuals available)
        performance_drift = 0.0
        if production_actuals is not None:
            current_mape = self._calculate_mape(production_actuals, production_predictions)
            performance_drift = current_mape - self.reference_mape
        
        # 4. Determine Alert Level
        n_drifted = len(drifted_features)
        
        if performance_drift > self.performance_threshold * 2 or n_drifted > 10:
            severity = 'critical'
            alert_triggered = True
        elif performance_drift > self.performance_threshold or n_drifted > 5:
            severity = 'high'
            alert_triggered = True
        elif pred_p_value < self.drift_threshold or n_drifted > 2:
            severity = 'medium'
            alert_triggered = True
        elif n_drifted > 0:
            severity = 'low'
            alert_triggered = False
        else:
            severity = 'none'
            alert_triggered = False
        
        drift_metrics = DriftMetrics(
            feature_drift=feature_drift,
            prediction_drift=float(pred_p_value),
            performance_drift=float(performance_drift),
            alert_triggered=alert_triggered,
            timestamp=datetime.now().isoformat(),
            drifted_features=drifted_features,
            severity=severity
        )
        
        # Store in history
        self.monitoring_history.append(asdict(drift_metrics))
        
        return drift_metrics
    
    def generate_report(self, drift_metrics: DriftMetrics) -> str:
        """
        Generate human-readable monitoring report.
        
        Args:
            drift_metrics: Output from detect_drift()
            
        Returns:
            Formatted report string
        """
        lines = []
        lines.append("=" * 60)
        lines.append("MODEL MONITORING REPORT")
        lines.append(f"Timestamp: {drift_metrics.timestamp}")
        lines.append(f"Severity: {drift_metrics.severity.upper()}")
        lines.append("=" * 60)
        
        # Feature Drift Section
        lines.append("\nFEATURE DRIFT ANALYSIS:")
        if drift_metrics.drifted_features:
            lines.append(f"⚠️  {len(drift_metrics.drifted_features)} features showing significant drift:")
            for feat in drift_metrics.drifted_features[:10]:  # Top 10
                p_val = drift_metrics.feature_drift.get(feat, 0)
                lines.append(f"  - {feat}: p-value = {p_val:.4f}")
        else:
            lines.append("✅ No significant feature drift detected")
        
        # Prediction Drift Section
        lines.append(f"\nPREDICTION DRIFT:")
        if drift_metrics.prediction_drift < self.drift_threshold:
            lines.append(f"⚠️  Significant prediction drift (p-value = {drift_metrics.prediction_drift:.4f})")
        else:
            lines.append("✅ Predictions distribution stable")
        
        # Performance Drift Section
        lines.append(f"\nPERFORMANCE MONITORING:")
        if drift_metrics.performance_drift > 0:
            lines.append(f"⚠️  MAPE increased by {drift_metrics.performance_drift:.2f}%")
            lines.append(f"   Reference MAPE: {self.reference_mape:.2f}%")
            lines.append(f"   Current MAPE: {self.reference_mape + drift_metrics.performance_drift:.2f}%")
        elif drift_metrics.performance_drift < 0:
            lines.append(f"✅ Performance improved by {abs(drift_metrics.performance_drift):.2f}%")
        else:
            lines.append("✅ Performance stable")
        
        # Overall Status
        lines.append(f"\nOVERALL STATUS:")
        if drift_metrics.alert_triggered:
            lines.append("🚨 ALERT: Model retraining recommended")
            lines.append("\nRecommended Actions:")
            lines.append("  1. Investigate drifted features")
            lines.append("  2. Check for data quality issues")
            lines.append("  3. Consider model retraining")
        else:
            lines.append("✅ Model performing within acceptable parameters")
        
        lines.append("=" * 60)
        
        return "\n".join(lines)
    
    def save_logs(self, filepath: str):
        """
        Save monitoring logs for historical tracking.
        
        Args:
            filepath: Path to JSONL log file
        """
        with open(filepath, 'a') as f:
            for entry in self.monitoring_history:
                f.write(json.dumps(entry) + '\n')
        
        logger.info(f"Saved {len(self.monitoring_history)} monitoring entries to {filepath}")
    
    def load_logs(self, filepath: str) -> List[Dict]:
        """Load historical monitoring logs."""
        logs = []
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    logs.append(json.loads(line.strip()))
        except FileNotFoundError:
            logger.warning(f"Log file not found: {filepath}")
        return logs
    
    def get_health_status(self) -> Dict:
        """
        Get current model health status for API endpoint.
        
        Returns:
            Dict with health status information
        """
        if not self.monitoring_history:
            return {
                'status': 'unknown',
                'message': 'No monitoring data available',
                'last_check': None
            }
        
        latest = self.monitoring_history[-1]
        
        return {
            'status': 'degraded' if latest['alert_triggered'] else 'healthy',
            'severity': latest['severity'],
            'last_check': latest['timestamp'],
            'reference_mape': self.reference_mape,
            'n_drifted_features': len(latest['drifted_features']),
            'performance_drift': latest['performance_drift']
        }
    
    def should_retrain(self) -> bool:
        """
        Determine if model should be retrained based on monitoring history.
        
        Uses heuristic: retrain if 3+ consecutive high-severity alerts
        """
        if len(self.monitoring_history) < 3:
            return False
        
        recent = self.monitoring_history[-3:]
        high_severity_count = sum(
            1 for m in recent 
            if m['severity'] in ['high', 'critical']
        )
        
        return high_severity_count >= 2


class PerformanceTracker:
    """
    Track model performance over time for trend analysis.
    """
    
    def __init__(self):
        self.performance_history = []
    
    def log_performance(
        self,
        mape: float,
        rmse: float,
        n_predictions: int,
        timestamp: Optional[str] = None
    ):
        """Log a performance measurement."""
        self.performance_history.append({
            'timestamp': timestamp or datetime.now().isoformat(),
            'mape': mape,
            'rmse': rmse,
            'n_predictions': n_predictions
        })
    
    def get_trend(self, window: int = 7) -> Dict:
        """Get performance trend over last N measurements."""
        if len(self.performance_history) < 2:
            return {'trend': 'insufficient_data'}
        
        recent = self.performance_history[-window:]
        mapes = [m['mape'] for m in recent]
        
        # Simple trend detection
        if len(mapes) >= 2:
            diff = mapes[-1] - mapes[0]
            if diff > 0.5:
                trend = 'degrading'
            elif diff < -0.5:
                trend = 'improving'
            else:
                trend = 'stable'
        else:
            trend = 'insufficient_data'
        
        return {
            'trend': trend,
            'current_mape': mapes[-1] if mapes else None,
            'avg_mape': np.mean(mapes),
            'std_mape': np.std(mapes),
            'n_measurements': len(recent)
        }
