"""
Model Router - Smart model selection with hierarchical fallbacks.

Analyses the input data to determine the best forecasting strategy,
then runs training with automatic fallback if the primary model fails.

Priority chain:
  1. Prophet   – has datetime column, >30 rows, seasonal data
  2. XGBoost   – has features, >50 rows
  3. Ensemble  – enough data for multiple models
  4. Naive     – everything else (last-value repeat)
  5. MovingAvg – <10 rows emergency fallback

Constraints: CPU-only, free Hugging Face tier, 60 s training timeout.

Author: ForecastAI Team
Date: 2026-02-13
"""
import time
import signal
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum

import pandas as pd
import numpy as np

from app.ml.base_model import BaseForecaster, ForecastResult, TrainingMetrics

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Training timeout (seconds) – prevents HF resource exhaustion
# ---------------------------------------------------------------------------
TRAINING_TIMEOUT_SECONDS = 60


class ModelTier(str, Enum):
    PROPHET = "prophet"
    XGBOOST = "xgboost"
    SARIMA = "sarima"
    ENSEMBLE = "ensemble"
    NAIVE = "naive"
    MOVING_AVERAGE = "moving_average"


@dataclass
class DataProfile:
    """Quick profile of the dataset to drive model selection."""
    row_count: int = 0
    numeric_column_count: int = 0
    has_datetime: bool = False
    has_features: bool = False  # >3 numeric columns (beyond target)
    has_seasonality: bool = False
    date_frequency: Optional[str] = None  # daily, weekly, monthly, irregular
    target_variance_cv: float = 0.0  # coefficient of variation
    has_negative_values: bool = False
    estimated_complexity: str = "simple"  # simple, moderate, complex


@dataclass
class RoutingDecision:
    """The output of the ModelRouter."""
    primary_model: ModelTier
    fallback_chain: List[ModelTier]
    reason: str
    data_profile: DataProfile
    warnings: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Lightweight fallback models (no external deps)
# ---------------------------------------------------------------------------
class NaiveForecaster(BaseForecaster):
    """
    Naive forecaster: repeats the last observed value.
    Always works, minimal resources.
    """

    def __init__(self):
        super().__init__("Naive (Last Value)")
        self._last_value: float = 0.0
        self._history_mean: float = 0.0
        self._history_std: float = 0.0
        self._last_date = None
        self._freq_days: int = 1

    def train(
        self,
        df: pd.DataFrame,
        target_col: str = "sales",
        date_col: str = "date",
        **kwargs,
    ) -> TrainingMetrics:
        start = time.time()
        df = self.prepare_data(df, target_col, date_col)

        numeric_vals = pd.to_numeric(df[target_col], errors="coerce").dropna()
        if len(numeric_vals) == 0:
            numeric_vals = pd.Series([0.0])

        self._last_value = float(numeric_vals.iloc[-1])
        self._history_mean = float(numeric_vals.mean())
        self._history_std = float(numeric_vals.std()) if len(numeric_vals) > 1 else 0.0

        if date_col in df.columns:
            try:
                dates = pd.to_datetime(df[date_col], errors="coerce").dropna().sort_values()
                if len(dates) >= 2:
                    self._last_date = dates.iloc[-1]
                    self._freq_days = max(1, int(dates.diff().median().days))
            except Exception:
                pass

        # Simple hold-out: last 20 % vs naive prediction
        n = len(numeric_vals)
        split = max(1, int(n * 0.8))
        train_vals = numeric_vals.iloc[:split]
        val_vals = numeric_vals.iloc[split:]

        if len(val_vals) > 0:
            naive_pred = np.full(len(val_vals), float(train_vals.iloc[-1]))
            metrics = self.calculate_metrics(val_vals.values, naive_pred)
        else:
            metrics = {"mape": 15.0, "rmse": self._history_std, "mae": self._history_std * 0.8, "r2": 0.0}

        self.is_trained = True
        elapsed = time.time() - start

        self.training_metrics = TrainingMetrics(
            mape=metrics["mape"],
            rmse=metrics["rmse"],
            mae=metrics["mae"],
            r2=max(0, metrics["r2"]),
            training_samples=split,
            validation_samples=n - split,
            training_time_seconds=round(elapsed, 2),
        )
        return self.training_metrics

    def predict(self, periods: int = 30, confidence_level: float = 0.95) -> ForecastResult:
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")

        from datetime import timedelta

        base = self._last_date or pd.Timestamp.now()
        dates = [
            (base + timedelta(days=self._freq_days * (i + 1))).strftime("%Y-%m-%d")
            for i in range(periods)
        ]
        preds = [self._last_value] * periods
        z = 1.96 if confidence_level >= 0.95 else 1.645
        band = max(self._history_std * z, abs(self._last_value) * 0.1)
        lower = [self._last_value - band] * periods
        upper = [self._last_value + band] * periods

        return ForecastResult(
            dates=dates,
            predictions=preds,
            lower_bound=lower,
            upper_bound=upper,
            model_type=self.model_name,
            confidence_level=confidence_level * 100,
            metrics=self.training_metrics.__dict__ if self.training_metrics else {},
            training_time=0.0,
        )


class MovingAverageForecaster(BaseForecaster):
    """
    Moving-average forecaster: uses the mean of the last *window* values.
    Emergency fallback for very small datasets (<10 rows).
    """

    def __init__(self, window: int = 5):
        super().__init__("Moving Average")
        self._window = window
        self._avg_value: float = 0.0
        self._history_std: float = 0.0
        self._last_date = None
        self._freq_days: int = 1

    def train(
        self,
        df: pd.DataFrame,
        target_col: str = "sales",
        date_col: str = "date",
        **kwargs,
    ) -> TrainingMetrics:
        start = time.time()
        df = self.prepare_data(df, target_col, date_col)

        numeric_vals = pd.to_numeric(df[target_col], errors="coerce").dropna()
        if len(numeric_vals) == 0:
            numeric_vals = pd.Series([0.0])

        window = min(self._window, len(numeric_vals))
        self._avg_value = float(numeric_vals.iloc[-window:].mean())
        self._history_std = float(numeric_vals.std()) if len(numeric_vals) > 1 else 0.0

        if date_col in df.columns:
            try:
                dates = pd.to_datetime(df[date_col], errors="coerce").dropna().sort_values()
                if len(dates) >= 2:
                    self._last_date = dates.iloc[-1]
                    self._freq_days = max(1, int(dates.diff().median().days))
            except Exception:
                pass

        self.is_trained = True
        elapsed = time.time() - start

        self.training_metrics = TrainingMetrics(
            mape=20.0,
            rmse=round(self._history_std, 2),
            mae=round(self._history_std * 0.8, 2),
            r2=0.0,
            training_samples=len(numeric_vals),
            validation_samples=0,
            training_time_seconds=round(elapsed, 2),
        )
        return self.training_metrics

    def predict(self, periods: int = 30, confidence_level: float = 0.95) -> ForecastResult:
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")

        from datetime import timedelta

        base = self._last_date or pd.Timestamp.now()
        dates = [
            (base + timedelta(days=self._freq_days * (i + 1))).strftime("%Y-%m-%d")
            for i in range(periods)
        ]
        preds = [self._avg_value] * periods
        z = 1.96 if confidence_level >= 0.95 else 1.645
        band = max(self._history_std * z, abs(self._avg_value) * 0.15)
        lower = [self._avg_value - band] * periods
        upper = [self._avg_value + band] * periods

        return ForecastResult(
            dates=dates,
            predictions=preds,
            lower_bound=lower,
            upper_bound=upper,
            model_type=self.model_name,
            confidence_level=confidence_level * 100,
            metrics=self.training_metrics.__dict__ if self.training_metrics else {},
            training_time=0.0,
        )


# ---------------------------------------------------------------------------
# ModelRouter
# ---------------------------------------------------------------------------
class ModelRouter:
    """
    Analyses data characteristics and returns a RoutingDecision with the
    primary model and ordered fallback chain.

    Usage:
        router = ModelRouter()
        decision = router.analyse(df, target_col="sales", date_col="date")
        model, metrics = router.train_with_fallback(
            df, decision, target_col="sales", date_col="date"
        )
    """

    def analyse(
        self,
        df: pd.DataFrame,
        target_col: str = "sales",
        date_col: str = "date",
    ) -> RoutingDecision:
        """Profile data and decide on model strategy."""
        profile = self._profile_data(df, target_col, date_col)
        warnings: List[str] = []

        # ---- Decision tree ----
        if profile.row_count < 10:
            return RoutingDecision(
                primary_model=ModelTier.MOVING_AVERAGE,
                fallback_chain=[ModelTier.NAIVE],
                reason=f"Very small dataset ({profile.row_count} rows). Using Moving Average.",
                data_profile=profile,
                warnings=["Dataset too small for advanced models."],
            )

        if not profile.has_datetime and profile.row_count < 30:
            return RoutingDecision(
                primary_model=ModelTier.NAIVE,
                fallback_chain=[ModelTier.MOVING_AVERAGE],
                reason="No datetime column and <30 rows. Using Naive forecast.",
                data_profile=profile,
                warnings=["No date column detected – limited forecasting capability."],
            )

        # Enough data for advanced models
        if profile.has_datetime and profile.row_count >= 30:
            if profile.has_features and profile.row_count >= 50:
                # Rich dataset → try ensemble, fallback to individual models
                return RoutingDecision(
                    primary_model=ModelTier.ENSEMBLE,
                    fallback_chain=[
                        ModelTier.XGBOOST,
                        ModelTier.PROPHET,
                        ModelTier.NAIVE,
                    ],
                    reason=(
                        f"Rich dataset ({profile.row_count} rows, "
                        f"{profile.numeric_column_count} features). "
                        f"Using Ensemble (Prophet+XGBoost+SARIMA)."
                    ),
                    data_profile=profile,
                )
            else:
                # Date + target only → Prophet is best
                return RoutingDecision(
                    primary_model=ModelTier.PROPHET,
                    fallback_chain=[
                        ModelTier.XGBOOST,
                        ModelTier.NAIVE,
                        ModelTier.MOVING_AVERAGE,
                    ],
                    reason=(
                        f"Time-series dataset ({profile.row_count} rows) with "
                        f"{'seasonal patterns' if profile.has_seasonality else 'trend'}. "
                        f"Using Prophet."
                    ),
                    data_profile=profile,
                )

        # Has features but no clear datetime
        if profile.has_features and profile.row_count >= 50:
            return RoutingDecision(
                primary_model=ModelTier.XGBOOST,
                fallback_chain=[ModelTier.NAIVE, ModelTier.MOVING_AVERAGE],
                reason=f"Feature-rich dataset ({profile.numeric_column_count} features, no clear datetime). Using XGBoost.",
                data_profile=profile,
                warnings=["No clear date column – forecasting will be limited."],
            )

        # Default fallback
        return RoutingDecision(
            primary_model=ModelTier.NAIVE,
            fallback_chain=[ModelTier.MOVING_AVERAGE],
            reason="Data does not meet advanced model requirements. Using Naive.",
            data_profile=profile,
            warnings=warnings,
        )

    def train_with_fallback(
        self,
        df: pd.DataFrame,
        decision: RoutingDecision,
        target_col: str = "sales",
        date_col: str = "date",
        forecast_periods: int = 30,
        confidence_level: float = 0.95,
        requested_model: Optional[str] = None,
    ) -> Tuple[BaseForecaster, TrainingMetrics]:
        """
        Train the primary model from the decision. If it fails, walk the
        fallback chain until one succeeds.

        Args:
            df: Input DataFrame.
            decision: RoutingDecision from analyse().
            target_col: Target column name.
            date_col: Date column name.
            forecast_periods: Not used for training but logged.
            confidence_level: Not used for training but logged.
            requested_model: If user explicitly requested a model, try it first.

        Returns:
            (trained_model, training_metrics)

        Raises:
            RuntimeError: If ALL models (including emergency fallback) fail.
        """
        chain: List[ModelTier] = []

        # If user explicitly asked for a model, put it first
        if requested_model:
            try:
                requested_tier = ModelTier(requested_model.lower())
                chain.append(requested_tier)
            except ValueError:
                logger.warning(f"Unknown requested model '{requested_model}', ignoring.")

        # Then the router's primary + fallback chain
        if decision.primary_model not in chain:
            chain.append(decision.primary_model)
        for fb in decision.fallback_chain:
            if fb not in chain:
                chain.append(fb)

        # Ensure Naive + MovingAverage are always at the end as last resort
        for emergency in [ModelTier.NAIVE, ModelTier.MOVING_AVERAGE]:
            if emergency not in chain:
                chain.append(emergency)

        last_error: Optional[Exception] = None
        for tier in chain:
            try:
                logger.info(f"🚀 Attempting model: {tier.value}")
                model = self._instantiate_model(tier)
                metrics = self._train_with_timeout(model, df, target_col, date_col)
                logger.info(
                    f"✅ Model '{tier.value}' trained successfully. "
                    f"MAPE={metrics.mape:.2f}%, R²={metrics.r2:.4f}"
                )
                return model, metrics
            except Exception as exc:
                last_error = exc
                logger.warning(f"⚠️ Model '{tier.value}' failed: {exc}")
                continue

        # Absolute last resort – should never reach here because Naive/MA are simple
        raise RuntimeError(
            f"All models failed. Last error: {last_error}. "
            f"Attempted chain: {[t.value for t in chain]}"
        )

    # ---- internal helpers ----

    def _profile_data(
        self,
        df: pd.DataFrame,
        target_col: str,
        date_col: str,
    ) -> DataProfile:
        """Quick data profiling for routing decisions."""
        profile = DataProfile()
        profile.row_count = len(df)
        profile.numeric_column_count = len(df.select_dtypes(include=["number"]).columns)

        # Has datetime?
        if date_col in df.columns:
            try:
                pd.to_datetime(df[date_col].head(10), errors="raise")
                profile.has_datetime = True
            except Exception:
                profile.has_datetime = False
        else:
            # Check for Year/Month columns
            has_year = any(c.upper() in ("YEAR", "YR") for c in df.columns)
            has_month = any(c.upper() in ("MONTH", "MO", "MON") for c in df.columns)
            profile.has_datetime = has_year and has_month

        # Has features (more than just target + date)?
        profile.has_features = profile.numeric_column_count >= 3

        # Target statistics
        if target_col in df.columns:
            numeric_vals = pd.to_numeric(df[target_col], errors="coerce").dropna()
            if len(numeric_vals) > 0:
                mean_val = numeric_vals.mean()
                profile.target_variance_cv = float(
                    numeric_vals.std() / mean_val if mean_val != 0 else 0
                )
                profile.has_negative_values = bool((numeric_vals < 0).any())

        # Seasonality quick check (autocorrelation at lag 7)
        if target_col in df.columns:
            try:
                numeric_vals = pd.to_numeric(df[target_col], errors="coerce").dropna()
                if len(numeric_vals) > 14:
                    autocorr = numeric_vals.autocorr(lag=7)
                    profile.has_seasonality = bool(abs(autocorr) > 0.3) if not np.isnan(autocorr) else False
            except Exception:
                pass

        # Complexity estimate
        if profile.row_count >= 1000 and profile.has_features:
            profile.estimated_complexity = "complex"
        elif profile.row_count >= 100:
            profile.estimated_complexity = "moderate"
        else:
            profile.estimated_complexity = "simple"

        return profile

    @staticmethod
    def _instantiate_model(tier: ModelTier) -> BaseForecaster:
        """Lazy import and instantiate the model class."""
        if tier == ModelTier.PROPHET:
            from app.ml.prophet_model import ProphetForecaster
            return ProphetForecaster()
        elif tier == ModelTier.XGBOOST:
            from app.ml.xgboost_model import XGBoostForecaster
            return XGBoostForecaster()
        elif tier == ModelTier.SARIMA:
            from app.ml.sarima_model import SARIMAForecaster
            return SARIMAForecaster()
        elif tier == ModelTier.ENSEMBLE:
            from app.ml.ensemble_model import EnsembleForecaster
            return EnsembleForecaster()
        elif tier == ModelTier.NAIVE:
            return NaiveForecaster()
        elif tier == ModelTier.MOVING_AVERAGE:
            return MovingAverageForecaster()
        else:
            raise ValueError(f"Unknown model tier: {tier}")

    @staticmethod
    def _train_with_timeout(
        model: BaseForecaster,
        df: pd.DataFrame,
        target_col: str,
        date_col: str,
        timeout: int = TRAINING_TIMEOUT_SECONDS,
    ) -> TrainingMetrics:
        """
        Train model with a timeout guard.
        On Linux uses SIGALRM; on other platforms just trains without timeout.
        """

        def _timeout_handler(signum, frame):
            raise TimeoutError(f"Training exceeded {timeout}s timeout")

        # Try to set alarm (Linux only)
        use_alarm = hasattr(signal, "SIGALRM")
        if use_alarm:
            old_handler = signal.signal(signal.SIGALRM, _timeout_handler)
            signal.alarm(timeout)

        try:
            metrics = model.train(df, target_col, date_col)
            return metrics
        finally:
            if use_alarm:
                signal.alarm(0)  # cancel alarm
                signal.signal(signal.SIGALRM, old_handler)
