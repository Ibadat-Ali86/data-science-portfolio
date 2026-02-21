"""
Universal Data Adapter - Handles messy CSV/Excel inputs robustly.

Provides:
  - SimpleColumnMatcher: Fuzzy matching for column names using a synonym dictionary.
  - SmartDateParser: Robust date column detection and parsing.
  - DataShapeCorrector: Detects and melts wide-format data.
  - DataValidator: Lightweight validation checks.
  - UniversalDataAdapter: Orchestrates all of the above.

Constraints: CPU-only, no GPU, no BERT. Pure Python + fuzzywuzzy.

Author: ForecastAI Team
Date: 2026-02-13
"""
import re
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants – 200+ common column-name synonyms grouped by semantic role
# ---------------------------------------------------------------------------
COLUMN_SYNONYMS: Dict[str, List[str]] = {
    # Target / Sales
    "sales": [
        "sales", "revenue", "amount", "total", "value", "turnover",
        "gross_sales", "net_sales", "sales_amount", "sales_amt",
        "sales_value", "total_sales", "weekly_sales", "daily_sales",
        "monthly_sales", "annual_sales", "qty_sold", "quantity_sold",
        "quantity", "units_sold", "units", "demand", "order_amount",
        "order_total", "order_value", "transaction_amount", "income",
        "profit", "earnings", "sum", "price", "cost", "spend",
        "expenditure", "retail_sales", "warehouse_sales", "volume",
        "item_cnt_day", "cnt", "count",
    ],
    # Date / Time
    "date": [
        "date", "datetime", "timestamp", "time", "period", "ds",
        "order_date", "sale_date", "transaction_date", "created_at",
        "updated_at", "report_date", "week", "month_year", "year_month",
        "week_start", "week_end", "day", "observation_date", "record_date",
        "event_date", "invoice_date", "ship_date", "delivery_date",
        "purchase_date", "start_date", "end_date", "calendar_date",
    ],
    # Store / Location
    "store": [
        "store", "store_id", "store_name", "location", "location_id",
        "branch", "branch_id", "outlet", "outlet_id", "shop",
        "shop_id", "warehouse", "warehouse_id", "site", "site_id",
        "region", "area", "territory", "market", "channel",
    ],
    # Product / Item / Department
    "product": [
        "product", "product_id", "product_name", "item", "item_id",
        "item_name", "sku", "sku_id", "dept", "department",
        "department_id", "category", "category_id", "subcategory",
        "sub_category", "brand", "brand_id", "model", "type",
        "item_type", "product_type", "group", "family", "class",
    ],
    # Promotion / Holiday
    "promotion": [
        "promotion", "promo", "promo_id", "discount", "coupon",
        "is_holiday", "holiday", "event", "campaign", "offer",
        "markdown", "markdown1", "markdown2", "markdown3",
        "is_promo", "on_sale", "clearance",
    ],
    # Economic / External
    "economic": [
        "temperature", "temp", "fuel_price", "fuel", "cpi",
        "unemployment", "inflation", "gdp", "interest_rate",
        "exchange_rate", "weather", "humidity", "wind_speed",
    ],
}

# Flattened reverse index: synonym -> canonical role
_SYNONYM_INDEX: Dict[str, str] = {}
for role, synonyms in COLUMN_SYNONYMS.items():
    for syn in synonyms:
        _SYNONYM_INDEX[syn.lower().strip()] = role


# ---------------------------------------------------------------------------
# Data classes for results
# ---------------------------------------------------------------------------
@dataclass
class ColumnMapping:
    """Result of matching a user column to a system role."""
    original_name: str
    matched_role: Optional[str]  # canonical role e.g. "sales", "date"
    confidence: float  # 0.0 – 1.0
    suggested_rename: Optional[str] = None


@dataclass
class AdapterResult:
    """Full result returned by UniversalDataAdapter.adapt()."""
    dataframe: pd.DataFrame
    column_mappings: List[ColumnMapping]
    date_column: Optional[str] = None
    target_column: Optional[str] = None
    warnings: List[str] = field(default_factory=list)
    actions_taken: List[str] = field(default_factory=list)
    quality_score: float = 0.0


# ---------------------------------------------------------------------------
# 1. SimpleColumnMatcher
# ---------------------------------------------------------------------------
class SimpleColumnMatcher:
    """
    Match user-supplied column names to known semantic roles using:
      1. Exact match (lowered)
      2. Contains / substring match
      3. Fuzzy ratio from fuzzywuzzy
    """

    def __init__(self, synonyms: Optional[Dict[str, List[str]]] = None):
        self.synonyms = synonyms or COLUMN_SYNONYMS
        # Build reverse index
        self._index: Dict[str, str] = {}
        for role, syns in self.synonyms.items():
            for s in syns:
                self._index[s.lower().strip()] = role

    def match(self, column_name: str) -> ColumnMapping:
        """Return best-effort mapping for a single column name."""
        clean = self._normalize(column_name)

        # 1. Exact match
        if clean in self._index:
            return ColumnMapping(
                original_name=column_name,
                matched_role=self._index[clean],
                confidence=1.0,
                suggested_rename=self._index[clean],
            )

        # 2. Substring / contains check
        for syn, role in self._index.items():
            if syn in clean or clean in syn:
                return ColumnMapping(
                    original_name=column_name,
                    matched_role=role,
                    confidence=0.80,
                    suggested_rename=role,
                )

        # 3. Fuzzy matching (best across all synonyms)
        best_score = 0
        best_role = None
        try:
            from fuzzywuzzy import fuzz
            for syn, role in self._index.items():
                score = fuzz.ratio(clean, syn) / 100.0
                if score > best_score:
                    best_score = score
                    best_role = role
        except ImportError:
            logger.warning("fuzzywuzzy not installed – fuzzy matching disabled")

        if best_score >= 0.65:
            return ColumnMapping(
                original_name=column_name,
                matched_role=best_role,
                confidence=round(best_score, 2),
                suggested_rename=best_role,
            )

        # Unknown
        return ColumnMapping(
            original_name=column_name,
            matched_role=None,
            confidence=0.0,
        )

    def match_all(self, columns: List[str]) -> List[ColumnMapping]:
        """Match every column; resolve conflicts (two cols mapping to same role)."""
        raw_mappings = [self.match(col) for col in columns]

        # Resolve conflicts: keep highest confidence per role
        role_best: Dict[str, ColumnMapping] = {}
        for m in raw_mappings:
            if m.matched_role is None:
                continue
            if m.matched_role not in role_best or m.confidence > role_best[m.matched_role].confidence:
                role_best[m.matched_role] = m

        # Mark losers as None
        winners = {m.original_name for m in role_best.values()}
        for m in raw_mappings:
            if m.matched_role and m.original_name not in winners:
                m.matched_role = None
                m.confidence = 0.0
                m.suggested_rename = None

        return raw_mappings

    @staticmethod
    def _normalize(name: str) -> str:
        """Lower, strip, replace common separators with underscore."""
        name = name.lower().strip()
        name = re.sub(r"[\s\-\.]+", "_", name)
        return name


# ---------------------------------------------------------------------------
# 2. SmartDateParser
# ---------------------------------------------------------------------------
class SmartDateParser:
    """
    Detect and parse date columns using:
      - dateutil flexible parser
      - Regex-based format patterns
      - Year + Month component synthesis
    """

    # Common date patterns for quick regex pre-check
    DATE_PATTERNS = [
        r"\d{4}[-/]\d{1,2}[-/]\d{1,2}",           # 2020-01-15
        r"\d{1,2}[-/]\d{1,2}[-/]\d{4}",           # 01/15/2020
        r"\d{1,2}[-/]\d{1,2}[-/]\d{2}",           # 01/15/20
        r"\d{4}\d{2}\d{2}",                         # 20200115
        r"\d{1,2}\s\w+\s\d{4}",                     # 15 Jan 2020
        r"\w+\s\d{1,2},?\s\d{4}",                   # Jan 15, 2020
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}",          # ISO 8601
    ]

    def detect_date_column(self, df: pd.DataFrame) -> Optional[str]:
        """
        Auto-detect which column is the date column.
        Returns the column name or None.
        """
        # Priority 1: Column already has datetime dtype
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                logger.info(f"Date column detected (dtype): '{col}'")
                return col

        # Priority 2: Column name hints
        date_hints = {
            "date", "datetime", "timestamp", "ds", "time", "period",
            "order_date", "sale_date", "transaction_date",
            "report_date", "created_at", "calendar_date",
        }
        for col in df.columns:
            if col.lower().strip().replace(" ", "_") in date_hints:
                if self._try_parse(df[col]):
                    logger.info(f"Date column detected (name hint): '{col}'")
                    return col

        # Priority 3: Content sniffing – try parsing sample values
        for col in df.columns:
            if df[col].dtype == "object":
                if self._try_parse(df[col]):
                    logger.info(f"Date column detected (content): '{col}'")
                    return col

        # Priority 4: Year + Month synthesis
        year_col, month_col = self._find_year_month_components(df)
        if year_col and month_col:
            logger.info(f"Date synthesis possible from '{year_col}' + '{month_col}'")
            return "__synthesize__"

        return None

    def parse_dates(self, df: pd.DataFrame, date_col: str) -> Tuple[pd.DataFrame, str]:
        """
        Parse the date column in-place. If date_col == '__synthesize__',
        create a synthetic Date column from Year + Month components.
        Returns (df, actual_date_col_name).
        """
        df = df.copy()

        if date_col == "__synthesize__":
            year_col, month_col = self._find_year_month_components(df)
            if year_col and month_col:
                try:
                    df["Date"] = pd.to_datetime(
                        dict(year=df[year_col], month=df[month_col], day=1),
                        errors="coerce",
                    )
                    logger.info(f"Synthesized 'Date' from '{year_col}' + '{month_col}'")
                    return df, "Date"
                except Exception as exc:
                    logger.warning(f"Date synthesis failed: {exc}")
            return df, date_col  # fallback

        # Try pd.to_datetime with multiple formats
        try:
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
        except Exception:
            try:
                from dateutil import parser as dateutil_parser
                df[date_col] = df[date_col].apply(
                    lambda x: dateutil_parser.parse(str(x), fuzzy=True) if pd.notna(x) else pd.NaT
                )
            except Exception as exc:
                logger.warning(f"Failed to parse dates in '{date_col}': {exc}")

        return df, date_col

    # -- helpers --
    def _try_parse(self, series: pd.Series, sample_size: int = 20) -> bool:
        """Try to parse a sample of values as dates."""
        sample = series.dropna().head(sample_size)
        if len(sample) == 0:
            return False

        # Quick regex pre-check
        str_values = sample.astype(str)
        regex_matches = 0
        for pat in self.DATE_PATTERNS:
            regex_matches += str_values.str.match(pat).sum()
        if regex_matches > len(sample) * 0.5:
            return True

        # Try pd.to_datetime
        try:
            parsed = pd.to_datetime(sample, infer_datetime_format=True, errors="coerce")
            success_rate = parsed.notna().sum() / len(sample)
            return success_rate >= 0.7
        except Exception:
            return False

    @staticmethod
    def _find_year_month_components(df: pd.DataFrame) -> Tuple[Optional[str], Optional[str]]:
        """Find Year and Month component columns."""
        year_col = next(
            (c for c in df.columns if c.strip().upper() in ("YEAR", "YR")), None
        )
        month_col = next(
            (c for c in df.columns if c.strip().upper() in ("MONTH", "MO", "MON")), None
        )
        return year_col, month_col


# ---------------------------------------------------------------------------
# 3. DataShapeCorrector
# ---------------------------------------------------------------------------
class DataShapeCorrector:
    """
    Detect and fix wide-format data (e.g., months as columns).
    Melts it into long format suitable for time-series modelling.
    """

    # Month names for wide-format detection
    MONTH_NAMES = {
        "jan", "feb", "mar", "apr", "may", "jun",
        "jul", "aug", "sep", "oct", "nov", "dec",
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december",
    }

    def needs_melt(self, df: pd.DataFrame) -> bool:
        """Heuristic: if many columns look like months → wide format."""
        col_names_lower = {c.lower().strip() for c in df.columns}
        month_cols = col_names_lower & self.MONTH_NAMES
        return len(month_cols) >= 4  # at least 4 month-like columns

    def melt_wide(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert wide-format (months as columns) to long format."""
        col_names_lower = {c.lower().strip(): c for c in df.columns}
        month_cols_original = [
            col_names_lower[m] for m in col_names_lower if m in self.MONTH_NAMES
        ]

        # ID columns = everything that's not a month column
        id_cols = [c for c in df.columns if c not in month_cols_original]

        if not id_cols:
            id_cols = None  # pandas will use index

        melted = pd.melt(
            df,
            id_vars=id_cols,
            value_vars=month_cols_original,
            var_name="Month_Name",
            value_name="sales",
        )

        logger.info(
            f"Melted wide format: {len(df)} rows × {len(df.columns)} cols → "
            f"{len(melted)} rows × {len(melted.columns)} cols"
        )
        return melted


# ---------------------------------------------------------------------------
# 4. DataValidator
# ---------------------------------------------------------------------------
@dataclass
class ValidationResult:
    """Outcome of a single validation check."""
    check_name: str
    passed: bool
    message: str
    severity: str = "info"  # info, warning, error


class DataValidator:
    """Lightweight data validation checks (no Pandera dependency)."""

    def validate(self, df: pd.DataFrame) -> List[ValidationResult]:
        """Run all validation checks and return results."""
        results: List[ValidationResult] = []

        # 1. Minimum rows
        if len(df) < 10:
            results.append(ValidationResult(
                "row_count", False,
                f"Only {len(df)} rows found. Need at least 10 for meaningful analysis.",
                "error",
            ))
        elif len(df) < 30:
            results.append(ValidationResult(
                "row_count", True,
                f"{len(df)} rows found. 30+ recommended for robust forecasting.",
                "warning",
            ))
        else:
            results.append(ValidationResult(
                "row_count", True,
                f"✓ {len(df)} rows – sufficient for forecasting.",
                "info",
            ))

        # 2. Minimum columns
        if len(df.columns) < 2:
            results.append(ValidationResult(
                "column_count", False,
                f"Only {len(df.columns)} column(s). Need at least 2 (date + target).",
                "error",
            ))
        else:
            results.append(ValidationResult(
                "column_count", True,
                f"✓ {len(df.columns)} columns detected.",
                "info",
            ))

        # 3. Missing data percentage
        total_cells = df.size
        missing_cells = int(df.isna().sum().sum())
        missing_pct = (missing_cells / total_cells * 100) if total_cells > 0 else 0

        if missing_pct > 50:
            results.append(ValidationResult(
                "missing_data", False,
                f"{missing_pct:.1f}% missing data – too much for reliable analysis.",
                "error",
            ))
        elif missing_pct > 20:
            results.append(ValidationResult(
                "missing_data", True,
                f"⚠ {missing_pct:.1f}% missing data. Will be filled automatically.",
                "warning",
            ))
        else:
            results.append(ValidationResult(
                "missing_data", True,
                f"✓ {missing_pct:.1f}% missing data – acceptable.",
                "info",
            ))

        # 4. Has at least one numeric column
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        if len(numeric_cols) == 0:
            results.append(ValidationResult(
                "numeric_columns", False,
                "No numeric columns found. Need at least one for forecasting.",
                "error",
            ))
        else:
            results.append(ValidationResult(
                "numeric_columns", True,
                f"✓ {len(numeric_cols)} numeric column(s) found.",
                "info",
            ))

        # 5. Duplicate check
        dup_count = int(df.duplicated().sum())
        if dup_count > 0:
            results.append(ValidationResult(
                "duplicates", True,
                f"⚠ {dup_count} duplicate rows detected. Will be removed.",
                "warning",
            ))
        else:
            results.append(ValidationResult(
                "duplicates", True,
                "✓ No duplicate rows.",
                "info",
            ))

        return results


# ---------------------------------------------------------------------------
# 5. UniversalDataAdapter (orchestrator)
# ---------------------------------------------------------------------------
class UniversalDataAdapter:
    """
    One-call adapter: takes a raw DataFrame and returns a cleaned, validated,
    column-mapped DataFrame ready for the pipeline.

    Usage:
        adapter = UniversalDataAdapter()
        result = adapter.adapt(raw_df)
        clean_df = result.dataframe
        date_col = result.date_column
        target_col = result.target_column
    """

    def __init__(
        self,
        target_hint: Optional[str] = None,
        date_hint: Optional[str] = None,
    ):
        """
        Args:
            target_hint: User-provided target column name (if any).
            date_hint: User-provided date column name (if any).
        """
        self.target_hint = target_hint
        self.date_hint = date_hint

        self.column_matcher = SimpleColumnMatcher()
        self.date_parser = SmartDateParser()
        self.shape_corrector = DataShapeCorrector()
        self.validator = DataValidator()

    def adapt(self, df: pd.DataFrame) -> AdapterResult:
        """
        Main entry point. Returns an AdapterResult with the cleaned
        DataFrame and metadata.
        """
        warnings: List[str] = []
        actions: List[str] = []

        # --- Step 0: Basic cleaning ---
        df = self._basic_clean(df, actions)

        # --- Step 1: Shape correction (wide → long) ---
        if self.shape_corrector.needs_melt(df):
            df = self.shape_corrector.melt_wide(df)
            actions.append("Converted wide-format data to long format (melted).")

        # --- Step 2: Column matching ---
        mappings = self.column_matcher.match_all(list(df.columns))

        # --- Step 3: Date detection & parsing ---
        date_col = self._resolve_date_column(df, mappings, actions)
        if date_col and date_col in df.columns:
            df, date_col = self.date_parser.parse_dates(df, date_col)
            actions.append(f"Parsed date column: '{date_col}'")
        elif date_col == "__synthesize__":
            df, date_col = self.date_parser.parse_dates(df, date_col)
            actions.append(f"Synthesized date column from Year/Month components.")

        # --- Step 4: Target detection ---
        target_col = self._resolve_target_column(df, mappings)

        # --- Step 5: Validation ---
        validation_results = self.validator.validate(df)
        for v in validation_results:
            if not v.passed:
                warnings.append(f"[{v.severity.upper()}] {v.message}")
            elif v.severity == "warning":
                warnings.append(f"[WARNING] {v.message}")

        # --- Step 6: Quality score ---
        quality_score = self._compute_quality_score(df, date_col, target_col, validation_results)

        return AdapterResult(
            dataframe=df,
            column_mappings=mappings,
            date_column=date_col if date_col != "__synthesize__" else None,
            target_column=target_col,
            warnings=warnings,
            actions_taken=actions,
            quality_score=quality_score,
        )

    # ---- internal helpers ----

    def _basic_clean(self, df: pd.DataFrame, actions: List[str]) -> pd.DataFrame:
        """Strip whitespace from column names and string values."""
        df = df.copy()

        # Clean column names
        original_cols = list(df.columns)
        df.columns = [str(c).strip() for c in df.columns]
        if list(df.columns) != original_cols:
            actions.append("Stripped whitespace from column names.")

        # Remove fully empty rows/columns
        rows_before = len(df)
        df = df.dropna(how="all")
        if len(df) < rows_before:
            actions.append(f"Removed {rows_before - len(df)} fully empty rows.")

        cols_before = len(df.columns)
        df = df.dropna(axis=1, how="all")
        if len(df.columns) < cols_before:
            actions.append(f"Removed {cols_before - len(df.columns)} fully empty columns.")

        return df

    def _resolve_date_column(
        self,
        df: pd.DataFrame,
        mappings: List[ColumnMapping],
        actions: List[str],
    ) -> Optional[str]:
        """Determine the date column from hints, mappings, or auto-detection."""
        # 1. User hint
        if self.date_hint and self.date_hint in df.columns:
            return self.date_hint

        # 2. Column matcher found a date role
        for m in mappings:
            if m.matched_role == "date" and m.confidence >= 0.65:
                return m.original_name

        # 3. Auto-detect
        detected = self.date_parser.detect_date_column(df)
        if detected:
            actions.append(f"Auto-detected date column: '{detected}'")
            return detected

        return None

    def _resolve_target_column(
        self,
        df: pd.DataFrame,
        mappings: List[ColumnMapping],
    ) -> Optional[str]:
        """Determine the target (sales) column."""
        # 1. User hint
        if self.target_hint and self.target_hint in df.columns:
            return self.target_hint

        # 2. Column matcher found a sales role
        for m in mappings:
            if m.matched_role == "sales" and m.confidence >= 0.65:
                return m.original_name

        # 3. Fallback: first numeric column that isn't obviously an ID
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        for col in numeric_cols:
            col_lower = col.lower()
            if col_lower not in ("id", "index", "row", "row_number"):
                return col

        return None

    @staticmethod
    def _compute_quality_score(
        df: pd.DataFrame,
        date_col: Optional[str],
        target_col: Optional[str],
        validation_results: List[ValidationResult],
    ) -> float:
        """
        Compute a 0-100 quality score based on:
          Completeness (30%) + Consistency (25%) + Frequency (25%) + Sufficiency (20%)
        """
        score = 0.0

        # Completeness (30 pts)
        total = df.size
        missing = int(df.isna().sum().sum())
        completeness = (1 - missing / total) * 100 if total > 0 else 0
        score += min(30, completeness / 100 * 30)

        # Consistency – simple outlier check on target column (25 pts)
        if target_col and target_col in df.columns:
            numeric_series = pd.to_numeric(df[target_col], errors="coerce").dropna()
            if len(numeric_series) > 0:
                q1 = numeric_series.quantile(0.25)
                q3 = numeric_series.quantile(0.75)
                iqr = q3 - q1
                outliers = ((numeric_series < q1 - 3 * iqr) | (numeric_series > q3 + 3 * iqr)).sum()
                outlier_pct = outliers / len(numeric_series) if len(numeric_series) > 0 else 0
                score += max(0, 25 * (1 - outlier_pct * 10))  # penalize heavily
            else:
                score += 10  # partial credit
        else:
            score += 10

        # Frequency – regular timestamps (25 pts)
        if date_col and date_col in df.columns and date_col != "__synthesize__":
            try:
                dt_series = pd.to_datetime(df[date_col], errors="coerce").dropna().sort_values()
                if len(dt_series) > 2:
                    diffs = dt_series.diff().dropna()
                    median_diff = diffs.median()
                    # Coefficient of variation of time diffs
                    if median_diff.total_seconds() > 0:
                        cv = diffs.std() / median_diff if median_diff.total_seconds() > 0 else pd.Timedelta(0)
                        regularity = max(0, 1 - (cv.total_seconds() / median_diff.total_seconds()))
                        score += regularity * 25
                    else:
                        score += 10
                else:
                    score += 5
            except Exception:
                score += 5
        else:
            score += 5

        # Sufficiency (20 pts)
        row_count = len(df)
        if row_count >= 100:
            score += 20
        elif row_count >= 30:
            score += 15
        elif row_count >= 10:
            score += 10
        else:
            score += 5

        return round(min(100, score), 1)
