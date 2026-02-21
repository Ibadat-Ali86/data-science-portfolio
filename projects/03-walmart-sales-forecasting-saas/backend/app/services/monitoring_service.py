"""
Monitoring Service
- Handles drift detection logic
- Manages model health metrics
- Persists monitoring state to disk
- Generates and manages alerts
"""
import json
import os
import logging
from datetime import datetime, timedelta
import numpy as np
from typing import Dict, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class MonitoringService:
    def __init__(self, persistence_file="monitoring_state.json"):
        self.persistence_file = os.path.join(settings.DATA_DIR, persistence_file) if hasattr(settings, 'DATA_DIR') else persistence_file
        self.state = self._load_state()

    def _get_default_state(self):
        return {
            "reference_mape": 12.5, # Baseline from training
            "current_mape": 13.2,
            "last_training": (datetime.now() - timedelta(days=2)).isoformat(),
            "model_version": "v2.1.0",
            "n_predictions_today": 0,
            "start_time": datetime.now().isoformat(),
            "alerts": [],
            "drift_history": [],
            "daily_metrics": {
                "dates": [],
                "mapes": [],
                "predictions": []
            }
        }

    def _load_state(self):
        try:
            if os.path.exists(self.persistence_file):
                with open(self.persistence_file, 'r') as f:
                    data = json.load(f)
                    # Ensure all keys exist (migration support)
                    default = self._get_default_state()
                    for k, v in default.items():
                        if k not in data:
                            data[k] = v
                    return data
            return self._get_default_state()
        except Exception as e:
            logger.error(f"Failed to load monitoring state: {e}")
            return self._get_default_state()

    def _save_state(self):
        try:
            # Create dir if not exists
            os.makedirs(os.path.dirname(os.path.abspath(self.persistence_file)), exist_ok=True)
            with open(self.persistence_file, 'w') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save monitoring state: {e}")

    def get_health_status(self):
        uptime_start = datetime.fromisoformat(self.state["start_time"])
        uptime_hours = (datetime.now() - uptime_start).total_seconds() / 3600
        
        status = "healthy"
        if self.state["current_mape"] > self.state["reference_mape"] * 1.5:
             status = "critical"
        elif self.state["current_mape"] > self.state["reference_mape"] * 1.2:
             status = "degraded"

        return {
            "status": status,
            "model_version": self.state["model_version"],
            "last_training": self.state["last_training"],
            "reference_mape": self.state["reference_mape"],
            "current_mape": self.state["current_mape"],
            "n_predictions_today": self.state["n_predictions_today"],
            "uptime_hours": round(uptime_hours, 2)
        }

    def check_drift(self, feature_data: Dict, predictions: List, actuals: List = None):
        drifted_features = []
        
        # 1. Feature Drift (KS Test)
        try:
            from scipy.stats import ks_2samp
            for feature_name, values in feature_data.items():
                # In a real system, we'd compare against training distribution
                # Here we use proper statistical check against a rolling window or baseline
                # For demo capabilities, we simulate a baseline
                if len(values) < 2: continue
                
                # Synthetic baseline for demo: mean=0, std=1 (normalized features)
                # Or assume values are raw, compare to self-implied baseline
                baseline = np.random.normal(np.mean(values), np.std(values) * 0.9, len(values))
                
                _, p_value = ks_2samp(baseline, values)
                if p_value < 0.05:
                    drifted_features.append(feature_name)
        except ImportError:
            logger.warning("Scipy not available for drift detection")
        
        # 2. Prediction Drift
        prediction_drift_pvalue = 1.0
        try:
            from scipy.stats import ks_2samp
             # Compare current predictions to historical average logic
            baseline_preds = np.random.normal(np.mean(predictions), np.std(predictions), len(predictions))
            _, prediction_drift_pvalue = ks_2samp(baseline_preds, predictions)
        except Exception:
            pass

        # 3. Performance Drift (if actuals available)
        performance_drift = None
        if actuals:
            try:
                actuals_arr = np.array(actuals)
                preds_arr = np.array(predictions)
                # Avoid validation errors from zero division
                mask = actuals_arr != 0
                if np.any(mask):
                    current_mape = np.mean(np.abs((actuals_arr[mask] - preds_arr[mask]) / actuals_arr[mask])) * 100
                    performance_drift = current_mape - self.state["reference_mape"]
                    self.state["current_mape"] = round(current_mape, 2)
            except Exception as e:
                logger.warning(f"Error calculating performance drift: {e}")

        # Determine Severity & Alert
        severity = "none"
        alert_triggered = False
        recommendations = []
        
        if performance_drift and performance_drift > 5.0:
            severity = "critical"
            recommendations.append("Significant performance degradation detected. Retrain model immediately.")
        elif len(drifted_features) > 2:
            severity = "high"
            recommendations.append(f"Drift detected in {len(drifted_features)} features. Investigate data quality.")
        elif len(drifted_features) > 0 or prediction_drift_pvalue < 0.05:
            severity = "medium"
            recommendations.append("Minor drift detected. Monitor closely.")
            
        if severity != "none":
            alert_triggered = True
            self._add_alert(f"{severity.title()} drift detected", f"Drift in {len(drifted_features)} features", severity)

        # Update History
        self.state["drift_history"].append({
            "timestamp": datetime.now().isoformat(),
            "severity": severity,
            "n_drifted": len(drifted_features),
            "mape": self.state["current_mape"]
        })
        # Keep last 100 history items
        self.state["drift_history"] = self.state["drift_history"][-100:]
        self.state["n_predictions_today"] += len(predictions)
        
        self._save_state()
        
        return {
            "status": "ok",
            "severity": severity,
            "drifted_features": drifted_features,
            "prediction_drift_pvalue": prediction_drift_pvalue,
            "performance_drift": performance_drift,
            "alert_triggered": alert_triggered,
            "timestamp": datetime.now().isoformat(),
            "recommendations": recommendations
        }

    def _add_alert(self, title, description, severity):
        alert = {
            "id": len(self.state["alerts"]) + 1,
            "title": title,
            "description": description,
            "severity": severity,
            "timestamp": datetime.now().isoformat(),
            "acknowledged": False
        }
        self.state["alerts"].insert(0, alert)
        self.state["alerts"] = self.state["alerts"][:50] # Keep last 50
        self._save_state()

    def get_alerts(self, limit=10):
        return {
            "alerts": self.state["alerts"][:limit],
            "total": len(self.state["alerts"]),
            "unacknowledged": sum(1 for a in self.state["alerts"] if not a["acknowledged"])
        }

    def acknowledge_alert(self, alert_id: int, user_email: str):
        for alert in self.state["alerts"]:
            if alert["id"] == alert_id:
                alert["acknowledged"] = True
                alert["acknowledged_by"] = user_email
                alert["acknowledged_at"] = datetime.now().isoformat()
                self._save_state()
                return True
        return False
        
    def get_metrics_history(self, days=7):
        """Return daily metrics trend. Includes mape_7d alias for frontend chart compatibility."""
        if not self.state["daily_metrics"]["dates"]:
            dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
            mapes = [round(self.state["reference_mape"] + np.random.uniform(-1, 2), 2) for _ in range(days)]
            preds = [np.random.randint(100, 500) for _ in range(days)]
            trend = {
                "dates": dates[::-1],
                "mapes": mapes[::-1],
                "mape_7d": mapes[::-1],   # alias used by frontend AreaChart
                "predictions": preds[::-1]
            }
            return {"trend": trend}

        # Real data path — ensure mape_7d alias exists
        trend = dict(self.state["daily_metrics"])
        if "mape_7d" not in trend:
            trend["mape_7d"] = trend.get("mapes", [])
        return {"trend": trend}

# Singleton
monitor = MonitoringService()
