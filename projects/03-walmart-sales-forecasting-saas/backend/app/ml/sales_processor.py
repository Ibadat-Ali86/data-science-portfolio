"""
Sales and Returns Processor - Separate Gross Sales from Returns

This module handles the negative sales (returns) in the Walmart data:
- Min value: -$4,988.94 (returns/refunds)
- Prevents impossible negative predictions
- Enables separate modeling of sales vs returns

Author: ML Team
Date: 2026-02-08
"""
import pandas as pd
import numpy as np
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class SalesPrediction:
    """Container for sales prediction with breakdown."""
    net_sales: float
    gross_sales: float
    expected_returns: float
    return_rate: float
    confidence_low: Optional[float] = None
    confidence_high: Optional[float] = None


class SalesReturnsSeparator:
    """
    Separate sales and returns for independent modeling.
    
    Business Logic:
    - Positive sales = customer purchases (gross sales)
    - Negative sales = returns/refunds
    - Different drivers and patterns for each
    
    Benefits:
    - Prevents impossible negative predictions
    - Accurate inventory planning (gross vs net)
    - Identify high-return departments (quality issues)
    - Return policy optimization
    """
    
    def __init__(self, sales_col: str = 'Weekly_Sales'):
        """
        Initialize the separator.
        
        Args:
            sales_col: Name of the sales column
        """
        self.sales_col = sales_col
        self.return_rate_by_store_dept = {}
        self.global_return_rate = 0.03  # Default 3% return rate
        self.fitted = False
    
    def fit(self, df: pd.DataFrame, store_col: str = 'Store', dept_col: str = 'Dept') -> 'SalesReturnsSeparator':
        """
        Learn return patterns from historical data.
        
        Args:
            df: Training dataframe
            store_col: Store column name
            dept_col: Department column name
        """
        df = df.copy()
        
        # Separate gross sales and returns
        df['_gross_sales'] = df[self.sales_col].clip(lower=0)
        df['_returns'] = df[self.sales_col].clip(upper=0).abs()
        
        # Calculate return rate
        df['_total_volume'] = df['_gross_sales'] + df['_returns']
        df['_return_rate'] = df['_returns'] / (df['_total_volume'] + 1e-6)
        
        # Store return rate patterns by store-department
        for (store, dept), group in df.groupby([store_col, dept_col]):
            self.return_rate_by_store_dept[(store, dept)] = {
                'avg_return_rate': group['_return_rate'].mean(),
                'std_return_rate': group['_return_rate'].std(),
                'max_return_rate': group['_return_rate'].max(),
                'min_return_rate': group['_return_rate'].min(),
                'median_gross_sales': group['_gross_sales'].median(),
                'median_returns': group['_returns'].median(),
                'n_samples': len(group),
                'high_return_dept': group['_return_rate'].mean() > 0.05  # >5% returns
            }
        
        # Calculate global return rate
        total_gross = df['_gross_sales'].sum()
        total_returns = df['_returns'].sum()
        self.global_return_rate = total_returns / (total_gross + total_returns + 1e-6)
        
        self.fitted = True
        logger.info(f"Fitted SalesReturnsSeparator: global return rate = {self.global_return_rate:.2%}")
        
        return self
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Split sales into gross sales and returns columns.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            DataFrame with Gross_Sales, Returns, Return_Rate columns
        """
        df = df.copy()
        
        # Separate gross sales and returns
        df['Gross_Sales'] = df[self.sales_col].clip(lower=0)
        df['Returns'] = df[self.sales_col].clip(upper=0).abs()
        
        # Calculate return rate
        df['Return_Rate'] = df['Returns'] / (df['Gross_Sales'] + df['Returns'] + 1e-6)
        
        # Flag high-return weeks
        df['High_Return_Week'] = (df['Return_Rate'] > 0.05).astype(int)
        
        # Create is_return indicator
        df['Has_Returns'] = (df['Returns'] > 0).astype(int)
        
        return df
    
    def fit_transform(self, df: pd.DataFrame, store_col: str = 'Store', dept_col: str = 'Dept') -> pd.DataFrame:
        """Fit and transform in one step."""
        return self.fit(df, store_col, dept_col).transform(df)
    
    def predict_net_sales(
        self, 
        gross_sales_pred: float, 
        store: int, 
        dept: int
    ) -> SalesPrediction:
        """
        Convert gross sales prediction to net sales.
        
        Args:
            gross_sales_pred: Predicted gross sales
            store: Store ID
            dept: Department ID
            
        Returns:
            SalesPrediction with net, gross, returns, and rate
        """
        if not self.fitted:
            raise ValueError("Separator must be fitted first")
        
        # Get return rate for this store-dept
        return_info = self.return_rate_by_store_dept.get(
            (store, dept), 
            {'avg_return_rate': self.global_return_rate, 'std_return_rate': 0.01}
        )
        
        avg_rate = return_info['avg_return_rate']
        std_rate = return_info.get('std_return_rate', 0.01)
        
        # Apply expected return rate
        expected_returns = gross_sales_pred * avg_rate
        net_sales = gross_sales_pred - expected_returns
        
        # Confidence interval for returns
        returns_low = gross_sales_pred * max(0, avg_rate - 1.96 * std_rate)
        returns_high = gross_sales_pred * min(1, avg_rate + 1.96 * std_rate)
        
        return SalesPrediction(
            net_sales=net_sales,
            gross_sales=gross_sales_pred,
            expected_returns=expected_returns,
            return_rate=avg_rate,
            confidence_low=gross_sales_pred - returns_high,
            confidence_high=gross_sales_pred - returns_low
        )
    
    def get_high_return_departments(self, threshold: float = 0.05) -> pd.DataFrame:
        """
        Identify departments with high return rates.
        
        Args:
            threshold: Return rate threshold (default 5%)
            
        Returns:
            DataFrame of high-return departments for investigation
        """
        if not self.fitted:
            raise ValueError("Separator must be fitted first")
        
        high_return = []
        for (store, dept), info in self.return_rate_by_store_dept.items():
            if info['avg_return_rate'] > threshold:
                high_return.append({
                    'store': store,
                    'dept': dept,
                    'avg_return_rate': info['avg_return_rate'],
                    'median_returns': info['median_returns'],
                    'n_samples': info['n_samples']
                })
        
        if not high_return:
            return pd.DataFrame()
        
        return (
            pd.DataFrame(high_return)
            .sort_values('avg_return_rate', ascending=False)
        )
    
    def get_training_mask(self, df: pd.DataFrame, exclude_negative: bool = True) -> pd.Series:
        """
        Get mask for training data.
        
        Args:
            df: DataFrame
            exclude_negative: If True, exclude negative sales for gross sales model
            
        Returns:
            Boolean mask for training samples
        """
        if exclude_negative:
            return df[self.sales_col] > 0
        return pd.Series([True] * len(df))
    
    def clip_predictions(self, predictions: np.ndarray, min_value: float = 0) -> np.ndarray:
        """
        Clip predictions to prevent impossible negative values.
        
        Args:
            predictions: Array of predictions
            min_value: Minimum allowed value (default 0)
            
        Returns:
            Clipped predictions
        """
        return np.maximum(predictions, min_value)


class ReturnsPredictionModel:
    """
    Simple model for predicting returns based on gross sales.
    
    Uses learned return rates per store-department.
    """
    
    def __init__(self, separator: SalesReturnsSeparator):
        self.separator = separator
    
    def predict(
        self, 
        gross_sales_preds: np.ndarray,
        stores: np.ndarray,
        depts: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict returns and net sales from gross sales predictions.
        
        Args:
            gross_sales_preds: Predicted gross sales
            stores: Store IDs
            depts: Department IDs
            
        Returns:
            Tuple of (net_sales, expected_returns)
        """
        net_sales = np.zeros_like(gross_sales_preds)
        expected_returns = np.zeros_like(gross_sales_preds)
        
        for i, (gross, store, dept) in enumerate(zip(gross_sales_preds, stores, depts)):
            prediction = self.separator.predict_net_sales(gross, store, dept)
            net_sales[i] = prediction.net_sales
            expected_returns[i] = prediction.expected_returns
        
        return net_sales, expected_returns
