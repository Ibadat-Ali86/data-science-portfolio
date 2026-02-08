"""
Time Series Feature Engineering - Prevents Data Leakage

This module implements safe feature engineering for time series forecasting
that prevents data leakage by using:
- Expanding windows during training (only past data)
- Proper lag feature creation with shift(1) to prevent current-period leakage
- Safe rolling window calculations

Author: ML Team
Date: 2026-02-08
"""
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class TimeSeriesFeatureEngineer:
    """
    Create features ensuring no future data leakage.
    
    Key Principles:
    - All lag features are shifted by at least 1 period
    - Rolling windows use expanding windows during training
    - Features are created separately for train vs inference
    
    Usage:
        engineer = TimeSeriesFeatureEngineer()
        train_df = engineer.create_features(df, split_date='2012-07-01', is_training=True)
        test_df = engineer.create_features(df, split_date='2012-07-01', is_training=False)
    """
    
    def __init__(
        self,
        lag_periods: List[int] = None,
        rolling_windows: List[int] = None,
        date_col: str = 'Date',
        target_col: str = 'Weekly_Sales',
        group_cols: List[str] = None
    ):
        """
        Initialize the feature engineer.
        
        Args:
            lag_periods: List of lag periods to create (default: [1, 2, 4, 8])
            rolling_windows: List of rolling window sizes (default: [4, 8, 12])
            date_col: Name of date column
            target_col: Name of target variable column
            group_cols: Columns to group by (default: ['Store', 'Dept'])
        """
        self.lag_periods = lag_periods or [1, 2, 4, 8]
        self.rolling_windows = rolling_windows or [4, 8, 12]
        self.date_col = date_col
        self.target_col = target_col
        self.group_cols = group_cols or ['Store', 'Dept']
        self.fitted = False
        self.training_end_date = None
        
    def create_features(
        self, 
        df: pd.DataFrame, 
        split_date: Optional[str] = None,
        is_training: bool = True
    ) -> pd.DataFrame:
        """
        Create features ensuring no future data leakage.
        
        Args:
            df: Input dataframe with Date column sorted
            split_date: Cutoff date for train/test split (format: 'YYYY-MM-DD')
            is_training: Boolean flag for training vs inference
            
        Returns:
            Feature-engineered dataframe with no leakage
        """
        # Sort by date to ensure chronological order
        df = df.sort_values(self.group_cols + [self.date_col]).reset_index(drop=True)
        
        # Parse split date
        if split_date:
            split_dt = pd.to_datetime(split_date)
        else:
            # Default: use 80% for training
            split_dt = df[self.date_col].quantile(0.8)
        
        # For training: use only data before split_date
        if is_training:
            mask = df[self.date_col] < split_dt
            df_features = df[mask].copy()
            self.training_end_date = split_dt
            self.fitted = True
            logger.info(f"Training features: {len(df_features)} rows (before {split_dt})")
        else:
            df_features = df.copy()
            logger.info(f"Inference features: {len(df_features)} rows")
        
        # Create time-based features
        df_features = self._create_time_features(df_features)
        
        # Create safe lag features
        df_features = self._create_lag_features(df_features, is_training)
        
        # Create safe rolling features
        df_features = self._create_rolling_features(df_features, is_training)
        
        # Create holiday/seasonal features
        df_features = self._create_holiday_features(df_features)
        
        # Create interaction features
        df_features = self._create_interaction_features(df_features)
        
        return df_features
    
    def _create_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create calendar-based features (no leakage risk)."""
        df = df.copy()
        date_col = pd.to_datetime(df[self.date_col])
        
        df['day_of_week'] = date_col.dt.dayofweek
        df['day_of_month'] = date_col.dt.day
        df['week_of_year'] = date_col.dt.isocalendar().week.astype(int)
        df['month'] = date_col.dt.month
        df['quarter'] = date_col.dt.quarter
        df['year'] = date_col.dt.year
        df['is_weekend'] = (date_col.dt.dayofweek >= 5).astype(int)
        df['is_month_start'] = date_col.dt.is_month_start.astype(int)
        df['is_month_end'] = date_col.dt.is_month_end.astype(int)
        df['days_in_month'] = date_col.dt.days_in_month
        
        # Cyclical encoding for month and week (to capture circular patterns)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        df['week_sin'] = np.sin(2 * np.pi * df['week_of_year'] / 52)
        df['week_cos'] = np.cos(2 * np.pi * df['week_of_year'] / 52)
        
        return df
    
    def _create_lag_features(
        self, 
        df: pd.DataFrame, 
        is_training: bool
    ) -> pd.DataFrame:
        """
        Create safe lag features with proper shifting.
        
        Critical: shift(1) prevents using current period's value
        """
        df = df.copy()
        
        for lag in self.lag_periods:
            # Shift by lag periods WITHIN each group
            df[f'lag_{lag}'] = df.groupby(self.group_cols)[self.target_col].shift(lag)
            
            # Also create lagged differences
            if lag > 1:
                df[f'lag_diff_{lag}'] = df[f'lag_{lag}'] - df[f'lag_{lag - 1}']
        
        # Week-over-week growth (safe: uses lag_1 and lag_8, both shifted)
        df['wow_growth'] = (
            (df['lag_1'] - df['lag_8']) / (df['lag_8'] + 1e-6)
        ).clip(-10, 10)  # Clip extreme values
        
        logger.info(f"Created {len(self.lag_periods)} lag features")
        return df
    
    def _create_rolling_features(
        self, 
        df: pd.DataFrame, 
        is_training: bool
    ) -> pd.DataFrame:
        """
        Create safe rolling window features.
        
        For training: use expanding window to only include past data
        For inference: use fixed rolling window with shift(1)
        """
        df = df.copy()
        
        for window in self.rolling_windows:
            if is_training:
                # Expanding window for training - safer approach
                # shift(1) ensures we don't use current period
                df[f'rolling_mean_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.expanding(min_periods=window).mean().shift(1)
                )
                df[f'rolling_std_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.expanding(min_periods=window).std().shift(1)
                )
                df[f'rolling_min_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.expanding(min_periods=window).min().shift(1)
                )
                df[f'rolling_max_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.expanding(min_periods=window).max().shift(1)
                )
            else:
                # Fixed window for inference (past data only)
                df[f'rolling_mean_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.rolling(window=window, min_periods=window).mean().shift(1)
                )
                df[f'rolling_std_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.rolling(window=window, min_periods=window).std().shift(1)
                )
                df[f'rolling_min_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.rolling(window=window, min_periods=window).min().shift(1)
                )
                df[f'rolling_max_{window}'] = df.groupby(self.group_cols)[self.target_col].transform(
                    lambda x: x.rolling(window=window, min_periods=window).max().shift(1)
                )
            
            # Coefficient of variation (normalized volatility)
            df[f'rolling_cv_{window}'] = (
                df[f'rolling_std_{window}'] / (df[f'rolling_mean_{window}'] + 1e-6)
            )
        
        logger.info(f"Created rolling features for windows: {self.rolling_windows}")
        return df
    
    def _create_holiday_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create holiday and event features."""
        df = df.copy()
        
        # If IsHoliday column exists, use it
        if 'IsHoliday' in df.columns:
            df['is_holiday'] = df['IsHoliday'].astype(int)
        else:
            df['is_holiday'] = 0
        
        # Major US holidays approximation (by week of year)
        # Super Bowl: ~Week 6
        # Valentine's Day: ~Week 7
        # Easter: ~Week 14-16
        # Memorial Day: ~Week 22
        # Independence Day: ~Week 27
        # Labor Day: ~Week 36
        # Thanksgiving: ~Week 47
        # Christmas: ~Week 52
        
        holiday_weeks = [6, 7, 14, 15, 16, 22, 27, 36, 47, 51, 52]
        df['is_major_holiday_week'] = df['week_of_year'].isin(holiday_weeks).astype(int)
        
        # Pre-holiday indicator (week before major holidays)
        pre_holiday_weeks = [w - 1 for w in holiday_weeks if w > 1]
        df['is_pre_holiday'] = df['week_of_year'].isin(pre_holiday_weeks).astype(int)
        
        # Post-holiday indicator (often has returns/clearance)
        post_holiday_weeks = [(w + 1) % 53 for w in holiday_weeks]
        df['is_post_holiday'] = df['week_of_year'].isin(post_holiday_weeks).astype(int)
        
        # Q4 holiday season (Black Friday through New Year)
        df['is_q4_holiday_season'] = (
            (df['month'] >= 11) | (df['month'] == 1)
        ).astype(int)
        
        return df
    
    def _create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between key variables."""
        df = df.copy()
        
        # Store-Department interactions
        if 'Store' in df.columns and 'Dept' in df.columns:
            df['store_dept'] = df['Store'].astype(str) + '_' + df['Dept'].astype(str)
        
        # Temperature interactions (if available)
        if 'Temperature' in df.columns:
            df['temp_weekend_interaction'] = df['Temperature'] * df['is_weekend']
            df['temp_holiday_interaction'] = df['Temperature'] * df.get('is_holiday', 0)
        
        # Fuel price interactions (if available)
        if 'Fuel_Price' in df.columns:
            df['fuel_month_interaction'] = df['Fuel_Price'] * df['month']
        
        # Unemployment interactions (if available)
        if 'Unemployment' in df.columns:
            df['unemployment_q4_interaction'] = df['Unemployment'] * df['is_q4_holiday_season']
        
        return df
    
    def get_feature_columns(self, df: pd.DataFrame) -> List[str]:
        """Get list of feature columns (excluding target and metadata)."""
        exclude_cols = [
            self.date_col, 
            self.target_col, 
            'store_dept',  # Categorical, needs encoding
        ] + self.group_cols
        
        feature_cols = [
            col for col in df.columns 
            if col not in exclude_cols and df[col].dtype in ['int64', 'float64', 'int32', 'float32']
        ]
        
        return feature_cols
    
    def validate_no_leakage(
        self, 
        train_df: pd.DataFrame, 
        test_df: pd.DataFrame
    ) -> Dict[str, bool]:
        """
        Validate that no data leakage exists between train and test sets.
        
        Returns dict with validation results.
        """
        results = {}
        
        # Check 1: No test dates in training data
        train_dates = set(train_df[self.date_col].unique())
        test_dates = set(test_df[self.date_col].unique())
        results['no_date_overlap'] = len(train_dates & test_dates) == 0
        
        # Check 2: All train dates before test dates
        max_train_date = train_df[self.date_col].max()
        min_test_date = test_df[self.date_col].min()
        results['train_before_test'] = max_train_date < min_test_date
        
        # Check 3: Lag features have NaN for first few periods (as expected)
        lag_cols = [c for c in train_df.columns if c.startswith('lag_')]
        for col in lag_cols:
            first_period_nan = train_df.groupby(self.group_cols)[col].first().isna().all()
            results[f'{col}_proper_shift'] = first_period_nan
        
        logger.info(f"Leakage validation results: {results}")
        return results
