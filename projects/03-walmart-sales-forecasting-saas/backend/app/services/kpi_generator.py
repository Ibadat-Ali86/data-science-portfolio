import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class KPIConfig(BaseModel):
    name: str
    key: str
    description: str
    calculation_method: str # 'sum', 'avg', 'count', 'ratio', 'trend'
    visualization_type: str # 'big_number', 'sparkline', 'gauge', 'progress'
    required_columns: List[str]
    value: Optional[float] = None
    trend_value: Optional[float] = None # % change
    suffix: Optional[str] = None # '%', '$', etc.
    

class DynamicKPIGenerator:
    """
    Generates domain-specific KPIs based on available data columns.
    No hardcoded field names! Uses the standardized schema mapping.
    """
    
    def generate_kpis(self, df: pd.DataFrame, domain: str, column_mapping: Dict[str, str]) -> List[Dict]:
        """
        Main entry point.
        df: The standardized dataframe (or raw but we trust column_mapping)
        domain: 'sales_forecast', 'hr_analytics', etc.
        column_mapping: internal_standard_name -> user_column_name 
                        e.g. {'target_value': 'Weekly_Sales', 'date': 'Date'}
        """
        # Invert mapping for easier lookup: user_col -> standard_name
        # Actually we need to check if we have the standard column names available
        # But usually we work on the normalized dataframe where columns MIGHT already be renamed?
        # Let's assume we operate on the original DF and use the mapping to find columns.
        
        available_kpis = []
        
        # 1. Dispatch to domain handler
        if domain == 'sales_forecast':
            available_kpis = self._get_sales_kpis(df, column_mapping)
        elif domain == 'hr_analytics':
            available_kpis = self._get_hr_kpis(df, column_mapping)
        elif domain == 'financial_metrics':
            available_kpis = self._get_financial_kpis(df, column_mapping)
        else:
             available_kpis = self._get_generic_kpis(df, column_mapping)
             
        # 2. Add Generic Stats always
        # available_kpis.extend(self._get_generic_kpis(df, column_mapping, exclude_existing=True))
        
        return [kpi.dict() for kpi in available_kpis]

    def _get_col(self, mapping: Dict[str, str], key: str) -> Optional[str]:
        return mapping.get(key)

    def _calculate_trend(self, series: pd.Series) -> float:
        """Calculate simple period-over-period trend (last vs avg or last vs first in window)"""
        if len(series) < 2:
            return 0.0
        # Simple specific: Last value vs Avg of previous
        current = series.iloc[-1]
        previous = series.iloc[-2]
        if previous == 0:
            return 0.0
        return ((current - previous) / previous) * 100

    def _get_sales_kpis(self, df: pd.DataFrame, mapping: Dict) -> List[KPIConfig]:
        kpis = []
        
        target_col = self._get_col(mapping, 'target_value') # Sales/Revenue
        date_col = self._get_col(mapping, 'date')
        
        if target_col and target_col in df.columns:
            # Total Revenue / Sales
            total_val = df[target_col].sum()
            kpis.append(KPIConfig(
                name="Total Sales",
                key="total_sales",
                description="Total aggregated sales volume",
                calculation_method="sum",
                visualization_type="big_number",
                required_columns=['target_value'],
                value=float(total_val),
                suffix="$" # Heuristic, maybe check currency
            ))
            
            # Average Transaction
            avg_val = df[target_col].mean()
            kpis.append(KPIConfig(
                name="Avg. Sales",
                key="avg_sales",
                description="Average value per record",
                calculation_method="avg",
                visualization_type="big_number",
                required_columns=['target_value'],
                value=float(avg_val),
                suffix="$"
            ))

        return kpis

    def _get_hr_kpis(self, df: pd.DataFrame, mapping: Dict) -> List[KPIConfig]:
        kpis = []
        
        emp_id_col = self._get_col(mapping, 'employee_id')
        status_col = self._get_col(mapping, 'status')
        term_col = self._get_col(mapping, 'termination_date')
        
        # Headcount
        if emp_id_col and emp_id_col in df.columns:
            # If status exists, count active only
            if status_col and status_col in df.columns:
                active_count = df[df[status_col].astype(str).str.lower().isin(['active', 'employed', '1', 'true'])][emp_id_col].nunique()
            else:
                active_count = df[emp_id_col].nunique()
                
            kpis.append(KPIConfig(
                name="Current Headcount",
                key="headcount",
                description="Total active employees",
                calculation_method="count",
                visualization_type="big_number",
                required_columns=['employee_id'],
                value=float(active_count)
            ))
            
        # Turnover Rate
        if term_col and term_col in df.columns and emp_id_col:
             # Rudimentary turnover: Terminated / Total
             terminated = df[df[term_col].notna()].shape[0]
             total = df[emp_id_col].nunique()
             rate = (terminated / total) * 100 if total > 0 else 0
             
             kpis.append(KPIConfig(
                name="Turnover Rate",
                key="turnover_rate",
                description="Percentage of terminations",
                calculation_method="ratio",
                visualization_type="gauge",
                required_columns=['termination_date', 'employee_id'],
                value=float(rate),
                suffix="%"
            ))
            
        return kpis
        
    def _get_financial_kpis(self, df: pd.DataFrame, mapping: Dict) -> List[KPIConfig]:
        kpis = []
        amount_col = self._get_col(mapping, 'amount')
        
        if amount_col and amount_col in df.columns:
            total_vol = df[amount_col].sum()
            avg_txn = df[amount_col].mean()
            
            kpis.append(KPIConfig(
                name="Total Volume",
                key="total_volume",
                description="Total transaction volume",
                calculation_method="sum",
                visualization_type="big_number",
                required_columns=['amount'],
                value=float(total_vol),
                suffix="$"
            ))
            
            kpis.append(KPIConfig(
                name="Avg. Transaction",
                key="avg_transaction",
                description="Average transaction value",
                calculation_method="avg",
                visualization_type="big_number",
                required_columns=['amount'],
                value=float(avg_txn),
                suffix="$"
            ))
            
        return kpis

    def _get_generic_kpis(self, df: pd.DataFrame, mapping: Dict, exclude_existing=False) -> List[KPIConfig]:
        if exclude_existing:
            return [] # Don't duplicate for now
            
        kpis = []
        kpis.append(KPIConfig(
            name="Total Records",
            key="total_records",
            description="Number of rows in dataset",
            calculation_method="count",
            visualization_type="big_number",
            required_columns=[],
            value=float(len(df))
        ))
        return kpis

# Singleton
kpi_generator = DynamicKPIGenerator()
