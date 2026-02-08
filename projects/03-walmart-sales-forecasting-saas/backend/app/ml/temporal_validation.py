"""
Temporal Validation Utilities for Time Series Models
Prevents data leakage by enforcing temporal constraints
"""
import pandas as pd
import numpy as np
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


def temporal_train_test_split(
    df: pd.DataFrame,
    date_col: str,
    test_size: float = 0.2,
    shuffle: bool = False
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Perform temporal train/test split ensuring NO DATA LEAKAGE
    
    Args:
        df: DataFrame with date column
        date_col: Name of date column
        test_size: Fraction for test set (default 0.2 = 20%)
        shuffle: Should always be False for time series!
    
    Returns:
        train_df, test_df with temporal ordering guaranteed
        
    Raises:
        ValueError: If data is not sorted or test comes before train
    """
    if shuffle:
        logger.error("CRITICAL: Attempting to shuffle time series data!")
        raise ValueError("shuffle=True is INVALID for time series - causes data leakage!")
    
    # Ensure data is sorted by date
    df = df.sort_values(date_col).reset_index(drop=True)
    
    # Temporal split point
    split_idx = int(len(df) * (1 - test_size))
    
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()
    
    # CRITICAL VALIDATION: Ensure no temporal overlap
    train_max_date = train_df[date_col].max()
    test_min_date = test_df[date_col].min()
    
    if train_max_date >= test_min_date:
        logger.warning(
            f"⚠️ POTENTIAL DATA LEAKAGE DETECTED!\n"
            f"Train max date: {train_max_date}\n"
            f"Test min date: {test_min_date}\n"
            f"These should NOT overlap!"
        )
        # Try to fix by removing overlapping dates from train
        train_df = train_df[train_df[date_col] < test_min_date]
        logger.info(f"✅ Removed overlapping dates. New train size: {len(train_df)}")
    
    logger.info(
        f"✅ Temporal Split Complete:\n"
        f"  Train: {len(train_df)} samples ({train_df[date_col].min()} to {train_df[date_col].max()})\n"
        f"  Test:  {len(test_df)} samples ({test_df[date_col].min()} to {test_df[date_col].max()})"
    )
    
    # Final validation
    assert train_df[date_col].max() < test_df[date_col].min(), \
        "CRITICAL: Train and test periods overlap - DATA LEAKAGE!"
    
    return train_df, test_df


def validate_temporal_ordering(df: pd.DataFrame, date_col: str) -> bool:
    """
    Validate that data is properly sorted by date
    
    Returns:
        True if sorted, False otherwise
    """
    dates = pd.to_datetime(df[date_col])
    is_sorted = dates.is_monotonic_increasing
    
    if not is_sorted:
        logger.warning(f"⚠️ Data is NOT sorted by {date_col}. This can cause data leakage!")
        # Find where ordering is broken
        diff = dates.diff()
        negative_indices = diff[diff < pd.Timedelta(0)].index.tolist()
        if negative_indices:
            logger.warning(f"Date ordering broken at indices: {negative_indices[:10]}")
    
    return is_sorted


def detect_future_leakage(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    date_col: str
) -> bool:
    """
    Detect if training data contains any dates from the test period
    
    Returns:
        True if leakage detected, False if clean
    """
    train_dates = pd.to_datetime(train_df[date_col])
    test_dates = pd.to_datetime(test_df[date_col])
    
    test_min = test_dates.min()
    leakage_count = (train_dates >= test_min).sum()
    
    if leakage_count > 0:
        logger.error(
            f"🚨 DATA LEAKAGE DETECTED!\n"
            f"Training set contains {leakage_count} samples from the test period!\n"
            f"This will invalidate all evaluation metrics."
        )
        return True
    
    logger.info("✅ No future data leakage detected")
    return False


def create_walk_forward_folds(
    df: pd.DataFrame,
    date_col: str,
    n_splits: int = 5,
    test_size: int = None
) -> list:
    """
    Create walk-forward validation folds for time series
    
    Args:
        df: DataFrame sorted by date
        date_col: Date column name
        n_splits: Number of validation splits
        test_size: Size of test set (if None, uses expanding window)
    
    Returns:
        List of (train_indices, test_indices) tuples
    """
    df = df.sort_values(date_col).reset_index(drop=True)
    n_samples = len(df)
    
    folds = []
    
    if test_size is None:
        # Expanding window
        test_size = n_samples // (n_splits + 1)
    
    for i in range(n_splits):
        test_end = n_samples - (n_splits - i - 1) * test_size
        test_start = test_end - test_size
        train_end = test_start
        
        train_indices = list(range(0, train_end))
        test_indices = list(range(test_start, test_end))
        
        if len(train_indices) > 0 and len(test_indices) > 0:
            folds.append((train_indices, test_indices))
            
            # Log fold details
            train_dates = df.iloc[train_indices][date_col]
            test_dates = df.iloc[test_indices][date_col]
            logger.debug(
                f"Fold {i+1}: Train ({train_dates.min()} to {train_dates.max()}), "
                f"Test ({test_dates.min()} to {test_dates.max()})"
            )
    
    logger.info(f"✅ Created {len(folds)} walk-forward validation folds")
    return folds
