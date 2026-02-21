"""
Universal Schema Detector
Multi-domain data detection system with intelligent fallback

Supports 6 domains:
- sales_forecast
- hr_analytics  
- financial_metrics
- inventory_management
- marketing_analytics
- generic (fallback)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from fuzzywuzzy import fuzz
import re
import logging

logger = logging.getLogger(__name__)


@dataclass
class DomainMatch:
    """Result of domain detection"""
    domain: str
    confidence: float  # 0-100
    matched_columns: Dict[str, Tuple[str, float]]  # {'required_name': ('actual_col', confidence)}
    missing_critical: List[str]
    missing_optional: List[str]
    intent: str  # 'forecast', 'kpi_dashboard', 'anomaly_detection', 'generic'


# Domain definitions with patterns and KPIs
DOMAIN_SCHEMAS = {
    'sales_forecast': {
        'name': 'Sales Forecasting',
        'description': 'Demand forecasting and revenue prediction',
        'required_patterns': {
            'date': ['date', 'datetime', 'timestamp', 'order_date', 'transaction_date', 'sales_date', 'time'],
            'target': ['sales', 'revenue', 'quantity', 'demand', 'units', 'amount', 'value', 'sold']
        },
        'optional_patterns': {
            'product': ['product', 'item', 'sku', 'category', 'dept', 'department'],
            'price': ['price', 'unit_price', 'cost', 'rate'],
            'store': ['store', 'location', 'branch', 'outlet', 'shop'],
            'promotion': ['promotion', 'promo', 'discount', 'campaign', 'offer']
        },
        'time_dependent': True,
        'min_rows': 30,
        'kpis': ['revenue', 'units_sold', 'growth_rate', 'seasonality_index', 'avg_order_value']
    },
    
    'hr_analytics': {
        'name': 'HR Analytics',
        'description': 'Workforce planning and talent management',
        'required_patterns': {
            'employee': ['employee', 'staff', 'worker', 'emp_id', 'employee_id', 'name', 'emp_name'],
            'date': ['date', 'hire_date', 'start_date', 'join_date', 'employment_date']
        },
        'optional_patterns': {
            'department': ['department', 'dept', 'division', 'team', 'unit'],
            'salary': ['salary', 'compensation', 'pay', 'wage', 'income'],
            'performance': ['performance', 'rating', 'score', 'review', 'evaluation'],
            'tenure': ['tenure', 'years', 'experience', 'seniority'],
            'termination': ['termination_date', 'exit_date', 'end_date', 'resignation_date', 'left_date']
        },
        'time_dependent': True,
        'min_rows': 20,
        'kpis': ['headcount', 'turnover_rate', 'avg_tenure', 'time_to_fill', 'diversity_index']
    },
    
    'financial_metrics': {
        'name': 'Financial Metrics',
        'description': 'Cash flow and budget analysis',
        'required_patterns': {
            'date': ['date', 'month', 'period', 'fiscal_date', 'transaction_date'],
            'amount': ['amount', 'value', 'balance', 'total', 'sum']
        },
        'optional_patterns': {
            'category': ['category', 'type', 'classification', 'account_type'],
            'account': ['account', 'account_name', 'gl_account', 'ledger'],
            'department': ['department', 'cost_center', 'division', 'unit'],
            'project': ['project', 'project_id', 'initiative', 'program']
        },
        'time_dependent': True,
        'min_rows': 12,
        'kpis': ['burn_rate', 'runway_months', 'budget_variance', 'cash_flow_trend', 'liquidity_ratio']
    },
    
    'inventory_management': {
        'name': 'Inventory Management',
        'description': 'Stock levels and supply chain optimization',
        'required_patterns': {
            'date': ['date', 'timestamp', 'inventory_date', 'stock_date'],
            'quantity': ['quantity', 'stock', 'inventory', 'units', 'on_hand', 'available'],
            'product': ['product', 'item', 'sku', 'part', 'material']
        },
        'optional_patterns': {
            'warehouse': ['warehouse', 'location', 'facility', 'depot'],
            'reorder_point': ['reorder', 'min_stock', 'threshold', 'safety_stock'],
            'lead_time': ['lead_time', 'delivery_time', 'replenishment_time']
        },
        'time_dependent': True,
        'min_rows': 30,
        'kpis': ['stock_turnover', 'stockout_rate', 'carrying_cost', 'days_on_hand', 'fill_rate']
    },
    
    'marketing_analytics': {
        'name': 'Marketing Analytics',
        'description': 'Campaign performance and customer acquisition',
        'required_patterns': {
            'date': ['date', 'campaign_date', 'start_date', 'run_date'],
            'metric': ['impressions', 'clicks', 'conversions', 'leads', 'signups', 'customers']
        },
        'optional_patterns': {
            'campaign': ['campaign', 'campaign_name', 'ad_group', 'initiative'],
            'channel': ['channel', 'source', 'medium', 'platform'],
            'spend': ['spend', 'cost', 'budget', 'investment'],
            'revenue': ['revenue', 'sales', 'value', 'income']
        },
        'time_dependent': True,
        'min_rows': 20,
        'kpis': ['cac', 'roas', 'ctr', 'conversion_rate', 'cpl']
    },
    
    'generic': {
        'name': 'Generic Time Series',
        'description': 'General-purpose exploratory analysis',
        'required_patterns': {
            'date': ['date', 'datetime', 'timestamp', 'time', 'period'],
            'metric': ['value', 'amount', 'count', 'total', 'metric']
        },
        'optional_patterns': {},
        'time_dependent': True,
        'min_rows': 10,
        'kpis': ['trend', 'volatility', 'anomalies', 'correlations']
    }
}


class UniversalSchemaDetector:
    """
    Detects data domain and maps columns to standard schema
    """
    
    def __init__(self, min_confidence: float = 70.0):
        """
        Args:
            min_confidence: Minimum confidence (0-100) to accept domain match
        """
        self.min_confidence = min_confidence
        self.domains = DOMAIN_SCHEMAS
        
    def detect_domain(self, df: pd.DataFrame) -> DomainMatch:
        """
        Detect which domain best matches the dataset
        
        Args:
            df: Input dataframe
            
        Returns:
            DomainMatch with best domain and column mappings
        """
        logger.info(f"Detecting domain for dataset with {len(df)} rows, {len(df.columns)} columns")
        
        # Score each domain
        domain_scores = {}
        for domain_id, schema in self.domains.items():
            score = self._score_domain(df, domain_id, schema)
            domain_scores[domain_id] = score
            logger.debug(f"Domain {domain_id}: {score['confidence']:.1f}% confidence")
        
        # Get best match
        best_domain_id = max(domain_scores, key=lambda k: domain_scores[k]['confidence'])
        best_match = domain_scores[best_domain_id]
        
        # Detect intent
        intent = self._detect_intent(df, best_domain_id, best_match)
        
        return DomainMatch(
            domain=best_domain_id,
            confidence=best_match['confidence'],
            matched_columns=best_match['matched_columns'],
            missing_critical=best_match['missing_critical'],
            missing_optional=best_match['missing_optional'],
            intent=intent
        )
    
    def _score_domain(self, df: pd.DataFrame, domain_id: str, schema: Dict) -> Dict:
        """Score how well dataset matches a domain"""
        matched_columns = {}
        missing_critical = []
        missing_optional = []
        
        # Try to match required patterns
        for required_field, patterns in schema['required_patterns'].items():
            best_match, best_confidence = self._find_best_column_match(df.columns, patterns)
            
            if best_match:
                matched_columns[required_field] = (best_match, best_confidence)
            else:
                missing_critical.append(required_field)
        
        # Try to match optional patterns
        for optional_field, patterns in schema['optional_patterns'].items():
            best_match, best_confidence = self._find_best_column_match(df.columns, patterns)
            
            if best_match:
                matched_columns[optional_field] = (best_match, best_confidence)
            else:
                missing_optional.append(optional_field)
        
        # Calculate overall confidence
        required_count = len(schema['required_patterns'])
        matched_required = sum(1 for field in schema['required_patterns'] if field in matched_columns)
        
        if required_count == 0:
            confidence = 0
        else:
            # Base confidence from required matches
            confidence = (matched_required / required_count) * 80.0
            
            # Bonus from matched columns quality
            if matched_columns:
                avg_column_confidence = np.mean([conf for _, conf in matched_columns.values()])
                confidence += (avg_column_confidence / 100) * 20.0
            
            # Penalty for missing critical
            if missing_critical:
                confidence *= (1 - len(missing_critical) / (required_count * 2))
        
        return {
            'confidence': min(100.0, max(0.0, confidence)),
            'matched_columns': matched_columns,
            'missing_critical': missing_critical,
            'missing_optional': missing_optional
        }
    
    def _find_best_column_match(
        self, 
        columns: List[str], 
        patterns: List[str]
    ) -> Tuple[Optional[str], float]:
        """
        Find best matching column for given patterns using fuzzy matching
        
        Returns:
            (column_name, confidence) or (None, 0.0)
        """
        best_match = None
        best_score = 0
        
        for pattern in patterns:
            for col in columns:
                # Exact match (case-insensitive)
                if pattern.lower() == col.lower():
                    return (col, 100.0)
                
                # Fuzzy match
                score = fuzz.ratio(pattern.lower(), col.lower())
                
                # Also check if pattern is contained in column name
                if pattern.lower() in col.lower():
                    score = max(score, 85)
                
                if score > best_score:
                    best_score = score
                    best_match = col
        
        # Return match if above threshold
        if best_score >= 70:
            return (best_match, float(best_score))
        else:
            return (None, 0.0)
    
    def _detect_intent(
        self, 
        df: pd.DataFrame, 
        domain: str, 
        match_result: Dict
    ) -> str:
        """
        Detect user's analytical intent based on data characteristics
        
        Returns:
            'forecast', 'kpi_dashboard', 'anomaly_detection', or 'exploratory'
        """
        # Check if time-series forecasting is viable
        if match_result['matched_columns'].get('date'):
            date_col = match_result['matched_columns']['date'][0]
            
            try:
                dates = pd.to_datetime(df[date_col], errors='coerce')
                valid_dates = dates.dropna()
                
                if len(valid_dates) >= self.domains[domain]['min_rows']:
                    # Check for regular time intervals
                    date_diffs = valid_dates.diff().dropna()
                    if len(date_diffs.unique()) <= 5:  # Relatively uniform intervals
                        return 'forecast'
                    else:
                        return 'kpi_dashboard'  # Irregular intervals, better for KPIs
            except:
                pass
        
        # If multiple numeric columns, suggest KPI dashboard
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) >= 3:
            return 'kpi_dashboard'
        
        # Anomaly detection if single metric with high variance
        if len(numeric_cols) == 1:
            metric_col = numeric_cols[0]
            if df[metric_col].std() / (df[metric_col].mean() + 1e-6) > 0.3:
                return 'anomaly_detection'
        
        return 'exploratory'
    
    def get_all_domain_scores(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Get confidence scores for all domains (for domain override UI)
        
        Returns:
            {domain_id: confidence_score}
        """
        scores = {}
        for domain_id, schema in self.domains.items():
            result = self._score_domain(df, domain_id, schema)
            scores[domain_id] = result['confidence']
        
        return scores
