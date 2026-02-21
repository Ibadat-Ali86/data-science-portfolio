"""
Pipeline Validation Gates - Stops the pipeline with clear errors if checks fail.

Each stage (upload, profile, preprocess, train) has a validator that returns
a pass/fail with a human-readable message. This prevents silent failures
and misleading outputs.

Author: ForecastAI Team
Date: 2026-02-13
"""
import logging
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from enum import Enum

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


class PipelineStage(str, Enum):
    UPLOAD = "upload"
    PROFILE = "profile"
    PREPROCESS = "preprocess"
    TRAIN = "train"


class GateSeverity(str, Enum):
    PASS = "pass"
    WARNING = "warning"
    FAIL = "fail"


@dataclass
class GateResult:
    """Outcome of a single validation gate."""
    stage: PipelineStage
    check_name: str
    severity: GateSeverity
    message: str  # Human-readable, plain English
    details: Optional[Dict[str, Any]] = None


@dataclass
class StageValidation:
    """Aggregated result for an entire stage."""
    stage: PipelineStage
    passed: bool
    results: List[GateResult] = field(default_factory=list)
    summary: str = ""

    @property
    def warnings(self) -> List[GateResult]:
        return [r for r in self.results if r.severity == GateSeverity.WARNING]

    @property
    def failures(self) -> List[GateResult]:
        return [r for r in self.results if r.severity == GateSeverity.FAIL]

    def to_log_lines(self) -> List[str]:
        """Plain-English lines for streaming to the frontend."""
        lines = []
        for r in self.results:
            icon = {"pass": "✓", "warning": "⚠", "fail": "✗"}[r.severity.value]
            lines.append(f"{icon} {r.message}")
        return lines


# ---------------------------------------------------------------------------
# Individual gate checks
# ---------------------------------------------------------------------------

def _check_row_count(df: pd.DataFrame, min_rows: int = 10) -> GateResult:
    """Ensure minimum row count."""
    n = len(df)
    if n < min_rows:
        return GateResult(
            stage=PipelineStage.UPLOAD,
            check_name="row_count",
            severity=GateSeverity.FAIL,
            message=f"Dataset has only {n} rows. Need at least {min_rows} for analysis.",
            details={"row_count": n, "minimum": min_rows},
        )
    elif n < 30:
        return GateResult(
            stage=PipelineStage.UPLOAD,
            check_name="row_count",
            severity=GateSeverity.WARNING,
            message=f"Dataset has {n} rows. 30+ recommended for robust forecasting.",
            details={"row_count": n},
        )
    return GateResult(
        stage=PipelineStage.UPLOAD,
        check_name="row_count",
        severity=GateSeverity.PASS,
        message=f"Parsed {n:,} rows successfully.",
        details={"row_count": n},
    )


def _check_column_count(df: pd.DataFrame, min_cols: int = 2) -> GateResult:
    """Ensure at least date + target columns."""
    n = len(df.columns)
    if n < min_cols:
        return GateResult(
            stage=PipelineStage.UPLOAD,
            check_name="column_count",
            severity=GateSeverity.FAIL,
            message=f"Only {n} column(s) found. Need at least {min_cols} (date + target).",
            details={"column_count": n, "minimum": min_cols},
        )
    return GateResult(
        stage=PipelineStage.UPLOAD,
        check_name="column_count",
        severity=GateSeverity.PASS,
        message=f"Found {n} columns.",
        details={"column_count": n, "columns": list(df.columns)},
    )


def _check_missing_data(df: pd.DataFrame, max_pct: float = 0.50) -> GateResult:
    """Profile stage: ensure <50% missing data."""
    total = df.size
    missing = int(df.isna().sum().sum())
    pct = missing / total if total > 0 else 0.0

    if pct >= max_pct:
        return GateResult(
            stage=PipelineStage.PROFILE,
            check_name="missing_data",
            severity=GateSeverity.FAIL,
            message=f"{pct:.0%} of data is missing. Maximum acceptable is {max_pct:.0%}.",
            details={"missing_pct": round(pct * 100, 1), "max_pct": max_pct * 100},
        )
    elif pct > 0.2:
        return GateResult(
            stage=PipelineStage.PROFILE,
            check_name="missing_data",
            severity=GateSeverity.WARNING,
            message=f"{pct:.0%} missing data detected. Will attempt to fill automatically.",
            details={"missing_pct": round(pct * 100, 1)},
        )
    return GateResult(
        stage=PipelineStage.PROFILE,
        check_name="missing_data",
        severity=GateSeverity.PASS,
        message=f"Data completeness: {(1 - pct) * 100:.1f}%.",
        details={"missing_pct": round(pct * 100, 1)},
    )


def _check_numeric_columns(df: pd.DataFrame) -> GateResult:
    """Preprocess stage: need at least one numeric column after cleaning."""
    numeric_count = df.select_dtypes(include=["number"]).shape[1]
    if numeric_count == 0:
        return GateResult(
            stage=PipelineStage.PREPROCESS,
            check_name="numeric_columns",
            severity=GateSeverity.FAIL,
            message="No numeric columns remain after preprocessing. Cannot train models.",
            details={"numeric_columns": 0},
        )
    return GateResult(
        stage=PipelineStage.PREPROCESS,
        check_name="numeric_columns",
        severity=GateSeverity.PASS,
        message=f"Found {numeric_count} numeric column(s) for modeling.",
        details={"numeric_columns": numeric_count},
    )


def _check_date_column(df: pd.DataFrame, date_col: Optional[str]) -> GateResult:
    """Profile stage: verify date column exists and is parseable."""
    if not date_col or date_col not in df.columns:
        return GateResult(
            stage=PipelineStage.PROFILE,
            check_name="date_column",
            severity=GateSeverity.WARNING,
            message="No date column detected. Forecasting capability limited.",
            details={"date_col": date_col},
        )
    try:
        parsed = pd.to_datetime(df[date_col], errors="coerce")
        valid_pct = parsed.notna().sum() / len(df) if len(df) > 0 else 0
        if valid_pct < 0.5:
            return GateResult(
                stage=PipelineStage.PROFILE,
                check_name="date_column",
                severity=GateSeverity.WARNING,
                message=f"Only {valid_pct:.0%} of date values could be parsed.",
                details={"valid_pct": round(valid_pct * 100, 1)},
            )
        freq = "daily"
        if valid_pct > 0.7:
            diffs = parsed.dropna().diff().dropna()
            if len(diffs) > 0:
                median_days = diffs.median().days
                if median_days <= 1:
                    freq = "daily"
                elif median_days <= 7:
                    freq = "weekly"
                elif median_days <= 31:
                    freq = "monthly"
                else:
                    freq = "irregular"
        return GateResult(
            stage=PipelineStage.PROFILE,
            check_name="date_column",
            severity=GateSeverity.PASS,
            message=f"Found date column '{date_col}' ({freq} frequency).",
            details={"date_col": date_col, "frequency": freq, "valid_pct": round(valid_pct * 100, 1)},
        )
    except Exception as exc:
        return GateResult(
            stage=PipelineStage.PROFILE,
            check_name="date_column",
            severity=GateSeverity.WARNING,
            message=f"Date column '{date_col}' could not be fully validated: {exc}",
            details={"date_col": date_col, "error": str(exc)},
        )


def _check_target_column(df: pd.DataFrame, target_col: Optional[str]) -> GateResult:
    """Profile stage: verify target column exists and is numeric."""
    if not target_col or target_col not in df.columns:
        return GateResult(
            stage=PipelineStage.PROFILE,
            check_name="target_column",
            severity=GateSeverity.FAIL,
            message=f"Target column '{target_col}' not found in dataset.",
            details={"target_col": target_col, "available_columns": list(df.columns)},
        )
    numeric_vals = pd.to_numeric(df[target_col], errors="coerce")
    valid_count = numeric_vals.notna().sum()
    if valid_count == 0:
        return GateResult(
            stage=PipelineStage.PROFILE,
            check_name="target_column",
            severity=GateSeverity.FAIL,
            message=f"Target column '{target_col}' has no valid numeric values.",
            details={"target_col": target_col, "valid_count": 0},
        )
    return GateResult(
        stage=PipelineStage.PROFILE,
        check_name="target_column",
        severity=GateSeverity.PASS,
        message=f"Target column '{target_col}': {valid_count:,} valid values.",
        details={"target_col": target_col, "valid_count": int(valid_count)},
    )


def _check_cv_stability(cv_scores: Optional[List[float]]) -> GateResult:
    """Train stage: ensure CV scores are stable (std < 0.2 of mean)."""
    if cv_scores is None or len(cv_scores) == 0:
        return GateResult(
            stage=PipelineStage.TRAIN,
            check_name="cv_stability",
            severity=GateSeverity.WARNING,
            message="No cross-validation scores available.",
        )
    arr = np.array(cv_scores)
    mean_cv = arr.mean()
    std_cv = arr.std()
    cv_ratio = std_cv / mean_cv if mean_cv != 0 else 0

    if cv_ratio > 0.3:
        return GateResult(
            stage=PipelineStage.TRAIN,
            check_name="cv_stability",
            severity=GateSeverity.WARNING,
            message=f"CV scores are unstable (CV ratio: {cv_ratio:.2f}). Results may vary.",
            details={"mean": round(mean_cv, 4), "std": round(std_cv, 4), "cv_ratio": round(cv_ratio, 4)},
        )
    return GateResult(
        stage=PipelineStage.TRAIN,
        check_name="cv_stability",
        severity=GateSeverity.PASS,
        message=f"Model training is stable (CV std: {std_cv:.4f}).",
        details={"mean": round(mean_cv, 4), "std": round(std_cv, 4)},
    )


def _check_prediction_sanity(
    predictions: List[float],
    historical_values: Optional[pd.Series] = None,
) -> GateResult:
    """Train stage: predictions should be within reasonable range."""
    if not predictions:
        return GateResult(
            stage=PipelineStage.TRAIN,
            check_name="prediction_sanity",
            severity=GateSeverity.WARNING,
            message="No predictions to validate.",
        )

    preds = np.array(predictions)
    issues = []

    # Check for negative predictions (sales should be >= 0)
    neg_count = int((preds < 0).sum())
    if neg_count > 0:
        issues.append(f"{neg_count} negative predictions (floored to 0)")
        preds = np.maximum(preds, 0)

    # Check against historical range
    if historical_values is not None and len(historical_values) > 0:
        hist_mean = historical_values.mean()
        hist_std = historical_values.std()
        if hist_std > 0:
            outlier_count = int(
                ((preds < hist_mean - 3 * hist_std) | (preds > hist_mean + 3 * hist_std)).sum()
            )
            if outlier_count > 0:
                issues.append(f"{outlier_count} predictions outside 3σ of historical range")

    if issues:
        return GateResult(
            stage=PipelineStage.TRAIN,
            check_name="prediction_sanity",
            severity=GateSeverity.WARNING,
            message="Forecast produced with notes: " + "; ".join(issues),
            details={"issues": issues},
        )
    return GateResult(
        stage=PipelineStage.TRAIN,
        check_name="prediction_sanity",
        severity=GateSeverity.PASS,
        message="Predictions are within expected historical range.",
    )


def _check_mape_threshold(mape: Optional[float], threshold: float = 50.0) -> GateResult:
    """Train stage: flag low-confidence models."""
    if mape is None:
        return GateResult(
            stage=PipelineStage.TRAIN,
            check_name="mape_threshold",
            severity=GateSeverity.WARNING,
            message="MAPE not available for validation.",
        )
    if mape > threshold:
        return GateResult(
            stage=PipelineStage.TRAIN,
            check_name="mape_threshold",
            severity=GateSeverity.WARNING,
            message=f"MAPE is {mape:.1f}% (>{threshold}%). Forecast has low confidence.",
            details={"mape": mape, "threshold": threshold},
        )
    return GateResult(
        stage=PipelineStage.TRAIN,
        check_name="mape_threshold",
        severity=GateSeverity.PASS,
        message=f"MAPE {mape:.1f}% – forecast quality is acceptable.",
        details={"mape": mape},
    )


# ---------------------------------------------------------------------------
# PipelineValidator – orchestrates all checks
# ---------------------------------------------------------------------------
class PipelineValidator:
    """
    Run validation gates for each pipeline stage.

    Usage:
        validator = PipelineValidator()

        # After upload
        result = validator.validate_upload(df)
        if not result.passed:
            raise HTTPException(status_code=400, detail=result.summary)

        # After profiling
        result = validator.validate_profile(df, date_col="Date", target_col="sales")

        # After preprocessing
        result = validator.validate_preprocess(df)

        # After training
        result = validator.validate_train(mape=5.2, predictions=[...], historical=series)
    """

    def validate_upload(self, df: pd.DataFrame) -> StageValidation:
        """Run upload-stage gates."""
        results = [
            _check_row_count(df),
            _check_column_count(df),
        ]
        passed = all(r.severity != GateSeverity.FAIL for r in results)
        summary = " | ".join(r.message for r in results)
        sv = StageValidation(
            stage=PipelineStage.UPLOAD,
            passed=passed,
            results=results,
            summary=summary if passed else f"Upload validation failed: {summary}",
        )
        if not passed:
            logger.error(f"Upload gate FAILED: {summary}")
        else:
            logger.info(f"Upload gate passed: {summary}")
        return sv

    def validate_profile(
        self,
        df: pd.DataFrame,
        date_col: Optional[str] = None,
        target_col: Optional[str] = None,
    ) -> StageValidation:
        """Run profile-stage gates."""
        results = [
            _check_missing_data(df),
            _check_date_column(df, date_col),
            _check_target_column(df, target_col),
        ]
        passed = all(r.severity != GateSeverity.FAIL for r in results)
        summary = " | ".join(r.message for r in results)
        sv = StageValidation(
            stage=PipelineStage.PROFILE,
            passed=passed,
            results=results,
            summary=summary,
        )
        if not passed:
            logger.error(f"Profile gate FAILED: {summary}")
        else:
            logger.info(f"Profile gate passed: {summary}")
        return sv

    def validate_preprocess(self, df: pd.DataFrame) -> StageValidation:
        """Run preprocess-stage gates."""
        results = [
            _check_numeric_columns(df),
        ]
        passed = all(r.severity != GateSeverity.FAIL for r in results)
        summary = " | ".join(r.message for r in results)
        return StageValidation(
            stage=PipelineStage.PREPROCESS,
            passed=passed,
            results=results,
            summary=summary,
        )

    def validate_train(
        self,
        mape: Optional[float] = None,
        predictions: Optional[List[float]] = None,
        historical_values: Optional[pd.Series] = None,
        cv_scores: Optional[List[float]] = None,
    ) -> StageValidation:
        """Run training-stage gates."""
        results = [
            _check_mape_threshold(mape),
            _check_prediction_sanity(predictions or [], historical_values),
        ]
        if cv_scores is not None:
            results.append(_check_cv_stability(cv_scores))

        passed = all(r.severity != GateSeverity.FAIL for r in results)
        summary = " | ".join(r.message for r in results)
        return StageValidation(
            stage=PipelineStage.TRAIN,
            passed=passed,
            results=results,
            summary=summary,
        )
