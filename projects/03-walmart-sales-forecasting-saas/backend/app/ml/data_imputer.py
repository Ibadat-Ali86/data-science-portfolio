"""
Data Imputation Module - Business-Aware Missing Data Handling

This module implements intelligent imputation strategies for:
- Markdown columns (59-73% missing in Walmart data)
- Other missing values with business-aware logic

Author: ML Team
Date: 2026-02-08
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class MarkdownImputer:
    """
    Business-aware markdown imputation strategy.
    
    Rationale for missing markdowns:
    1. No markdown occurred (intentional pricing)
    2. Data not recorded (system issue)
    3. Department doesn't use markdowns
    
    Strategy:
    - Departments with <10% markdown usage → fill with 0
    - Departments with >10% usage → forward-fill then zero-fill
    - Create binary indicator features for active markdowns
    """
    
    def __init__(self, markdown_cols: List[str] = None):
        """
        Initialize the imputer.
        
        Args:
            markdown_cols: List of markdown column names
        """
        self.markdown_cols = markdown_cols or [
            'MarkDown1', 'MarkDown2', 'MarkDown3', 'MarkDown4', 'MarkDown5'
        ]
        self.dept_markdown_patterns = {}
        self.fitted = False
        
    def fit(self, df: pd.DataFrame, dept_col: str = 'Dept') -> 'MarkdownImputer':
        """
        Learn department-specific markdown patterns.
        
        Args:
            df: Training dataframe
            dept_col: Name of department column
            
        Returns:
            self (fitted imputer)
        """
        # Filter to existing markdown columns
        existing_cols = [c for c in self.markdown_cols if c in df.columns]
        if not existing_cols:
            logger.warning("No markdown columns found in data")
            self.fitted = True
            return self
        
        self.markdown_cols = existing_cols
        
        for dept in df[dept_col].unique():
            dept_data = df[df[dept_col] == dept]
            
            # Calculate markdown usage rate per column
            usage_rate = dept_data[self.markdown_cols].notna().mean()
            
            # Calculate median values when markdown is present
            median_values = dept_data[self.markdown_cols].median()
            
            # Detect seasonal markdown pattern
            seasonal_pattern = self._detect_seasonal_pattern(dept_data, 'Date')
            
            self.dept_markdown_patterns[dept] = {
                'usage_rate': usage_rate.to_dict(),
                'median_values': median_values.to_dict(),
                'seasonal_pattern': seasonal_pattern,
                'avg_usage': usage_rate.mean(),  # Overall usage rate
                'is_markdown_heavy': usage_rate.mean() > 0.1  # >10% usage
            }
        
        self.fitted = True
        logger.info(f"Fitted MarkdownImputer on {len(self.dept_markdown_patterns)} departments")
        
        return self
    
    def transform(self, df: pd.DataFrame, dept_col: str = 'Dept') -> pd.DataFrame:
        """
        Impute markdowns using business logic.
        
        Args:
            df: DataFrame to transform
            dept_col: Name of department column
            
        Returns:
            DataFrame with imputed markdowns and indicator features
        """
        if not self.fitted:
            raise ValueError("Imputer must be fitted before transform")
        
        df = df.copy()
        
        # Ensure markdown columns exist
        existing_cols = [c for c in self.markdown_cols if c in df.columns]
        if not existing_cols:
            return df
        
        for dept in df[dept_col].unique():
            dept_mask = df[dept_col] == dept
            patterns = self.dept_markdown_patterns.get(dept, {'is_markdown_heavy': False})
            
            if not patterns.get('is_markdown_heavy', False):
                # Department rarely uses markdowns (<10%) → impute with 0
                for col in existing_cols:
                    df.loc[dept_mask, col] = df.loc[dept_mask, col].fillna(0)
            else:
                # Department frequently uses markdowns → forward-fill then zero-fill
                for col in existing_cols:
                    # Forward-fill (carry forward 2 weeks max)
                    df.loc[dept_mask, col] = (
                        df.loc[dept_mask, col]
                        .fillna(method='ffill', limit=2)
                    )
                    # Then fill remaining with 0
                    df.loc[dept_mask, col] = df.loc[dept_mask, col].fillna(0)
        
        # Create markdown indicator features
        for col in existing_cols:
            df[f'{col}_active'] = (df[col] > 0).astype(int)
        
        # Create aggregate markdown features
        df['total_markdown'] = df[existing_cols].sum(axis=1)
        df['n_active_markdowns'] = sum(df[f'{col}_active'] for col in existing_cols)
        df['has_any_markdown'] = (df['n_active_markdowns'] > 0).astype(int)
        
        logger.info(f"Transformed markdowns, created {len(existing_cols)} indicator features")
        
        return df
    
    def fit_transform(self, df: pd.DataFrame, dept_col: str = 'Dept') -> pd.DataFrame:
        """Fit and transform in one step."""
        return self.fit(df, dept_col).transform(df, dept_col)
    
    def _detect_seasonal_pattern(
        self, 
        dept_data: pd.DataFrame, 
        date_col: str
    ) -> Dict[int, float]:
        """
        Detect if markdowns follow seasonal patterns (Q4 holidays).
        
        Returns dict of month -> markdown presence rate
        """
        if date_col not in dept_data.columns or not len(self.markdown_cols):
            return {}
        
        try:
            dept_data = dept_data.copy()
            dept_data['_month'] = pd.to_datetime(dept_data[date_col]).dt.month
            
            # Calculate markdown presence rate by month
            markdown_by_month = (
                dept_data.groupby('_month')[self.markdown_cols[0]]
                .apply(lambda x: x.notna().mean())
                .to_dict()
            )
            return markdown_by_month
        except Exception as e:
            logger.warning(f"Could not detect seasonal pattern: {e}")
            return {}
    
    def get_dept_insights(self) -> pd.DataFrame:
        """
        Get insights about markdown patterns by department.
        
        Returns:
            DataFrame with department markdown insights
        """
        if not self.fitted:
            raise ValueError("Imputer must be fitted first")
        
        insights = []
        for dept, patterns in self.dept_markdown_patterns.items():
            insights.append({
                'dept': dept,
                'avg_usage_rate': patterns['avg_usage'],
                'is_markdown_heavy': patterns['is_markdown_heavy'],
                **{f'{k}_usage': v for k, v in patterns['usage_rate'].items()}
            })
        
        return pd.DataFrame(insights).sort_values('avg_usage_rate', ascending=False)


class GeneralImputer:
    """
    General-purpose imputer for non-markdown columns.
    
    Strategies by column type:
    - Temperature: Linear interpolation
    - CPI: Forward-fill (slowly changing)
    - Unemployment: Forward-fill (monthly metric)
    - Fuel_Price: Forward-fill then median
    """
    
    def __init__(self):
        self.column_strategies = {}
        self.column_medians = {}
        self.fitted = False
    
    def fit(self, df: pd.DataFrame) -> 'GeneralImputer':
        """Learn imputation strategies and values from training data."""
        
        # Define strategies for known columns
        strategies = {
            'Temperature': 'interpolate',
            'Fuel_Price': 'ffill_median',
            'CPI': 'ffill',
            'Unemployment': 'ffill',
            'Size': 'median',
            'Type': 'mode',
        }
        
        for col in df.columns:
            if col in strategies:
                self.column_strategies[col] = strategies[col]
            elif df[col].dtype in ['float64', 'int64']:
                self.column_strategies[col] = 'median'
            
            # Store median/mode for each column
            if df[col].dtype in ['float64', 'int64']:
                self.column_medians[col] = df[col].median()
            elif df[col].dtype == 'object':
                self.column_medians[col] = df[col].mode()[0] if len(df[col].mode()) > 0 else 'Unknown'
        
        self.fitted = True
        logger.info(f"Fitted GeneralImputer on {len(self.column_strategies)} columns")
        
        return self
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply imputation strategies."""
        if not self.fitted:
            raise ValueError("Imputer must be fitted before transform")
        
        df = df.copy()
        
        for col, strategy in self.column_strategies.items():
            if col not in df.columns:
                continue
            
            if strategy == 'interpolate':
                df[col] = df[col].interpolate(method='linear', limit_direction='both')
                df[col] = df[col].fillna(self.column_medians.get(col, df[col].mean()))
                
            elif strategy == 'ffill':
                df[col] = df[col].fillna(method='ffill')
                df[col] = df[col].fillna(method='bfill')
                
            elif strategy == 'ffill_median':
                df[col] = df[col].fillna(method='ffill', limit=4)
                df[col] = df[col].fillna(self.column_medians.get(col, df[col].median()))
                
            elif strategy == 'median':
                df[col] = df[col].fillna(self.column_medians.get(col, df[col].median()))
                
            elif strategy == 'mode':
                df[col] = df[col].fillna(self.column_medians.get(col, 'Unknown'))
        
        return df
    
    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fit and transform in one step."""
        return self.fit(df).transform(df)


class DataPreprocessor:
    """
    Complete data preprocessing pipeline combining all imputers.
    
    Usage:
        preprocessor = DataPreprocessor()
        train_df = preprocessor.fit_transform(train_data)
        test_df = preprocessor.transform(test_data)
    """
    
    def __init__(self):
        self.markdown_imputer = MarkdownImputer()
        self.general_imputer = GeneralImputer()
        self.fitted = False
    
    def fit(self, df: pd.DataFrame) -> 'DataPreprocessor':
        """Fit all imputers on training data."""
        self.markdown_imputer.fit(df)
        self.general_imputer.fit(df)
        self.fitted = True
        return self
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply all preprocessing transformations."""
        if not self.fitted:
            raise ValueError("Preprocessor must be fitted before transform")
        
        df = self.markdown_imputer.transform(df)
        df = self.general_imputer.transform(df)
        
        return df
    
    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fit and transform in one step."""
        return self.fit(df).transform(df)
    
    def get_missing_report(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate report of missing values before/after preprocessing."""
        before = df.isnull().sum()
        after = self.transform(df.copy()).isnull().sum()
        
        report = pd.DataFrame({
            'column': before.index,
            'missing_before': before.values,
            'missing_after': after.values,
            'pct_before': (before / len(df) * 100).values,
            'pct_after': (after / len(df) * 100).values
        })
        
        return report[report['missing_before'] > 0].sort_values('missing_before', ascending=False)
