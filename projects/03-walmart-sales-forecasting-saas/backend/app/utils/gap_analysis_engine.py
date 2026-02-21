"""
Gap Analysis Engine
Analyzes missing/mismatched columns and suggests solutions
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class GapType(Enum):
    """Types of data gaps"""
    SYNONYM_MISMATCH = "synonym_mismatch"  # Column exists but different name
    MISSING_CRITICAL = "missing_critical"   # Required column completely missing
    WRONG_GRANULARITY = "wrong_granularity"  # E.g., daily data when monthly needed
    WRONG_FORMAT = "wrong_format"            # E.g., date as string
    COMPLETELY_UNKNOWN = "completely_unknown"  # Can't determine domain


@dataclass
class GapSuggestion:
    """A suggestion for handling a data gap"""
    gap_type: GapType
    missing_column: str
    suggestion: str
    confidence: float  # 0-100
    action_type: str  # 'auto_fix', 'user_confirm', 'user_input', 'skip'
    options: List[Dict]  # List of available options


@dataclass
class GapAnalysisResult:
    """Complete gap analysis result"""
    domain: str
    domain_confidence: float
    matched_columns: Dict[str, Tuple[str, float]]
    gaps: List[GapSuggestion]
    can_proceed: bool
    proceed_with_limitations: bool
    limitations: List[str]


class GapAnalysisEngine:
    """
    Analyzes data gaps and suggests solutions
    """
    
    def __init__(self):
        # Proxy calculation formulas by domain
        self.proxy_formulas = {
            'sales_forecast': {
                'revenue': {
                    'formula': 'quantity * price',
                    'requires': ['quantity', 'price'],
                    'confidence': 90
                },
                'avg_order_value': {
                    'formula': 'revenue / num_orders',
                    'requires': ['revenue', 'num_orders'],
                    'confidence': 85
                }
            },
            'marketing_analytics': {
                'cac': {
                    'formula': 'marketing_spend / new_customers',
                    'requires': ['marketing_spend', 'new_customers'],
                    'confidence': 85,
                    'description': 'Customer Acquisition Cost'
                },
                'roas': {
                    'formula': 'revenue / ad_spend',
                    'requires': ['revenue', 'ad_spend'],
                    'confidence': 90,
                    'description': 'Return on Ad Spend'
                }
            },
            'hr_analytics': {
                'turnover_rate': {
                    'formula': 'terminations / headcount',
                    'requires': ['termination_date', 'employee_id'],
                    'confidence': 90
                },
                'avg_tenure': {
                    'formula': 'avg(current_date - hire_date)',
                    'requires': ['hire_date'],
                    'confidence': 85
                }
            },
            'financial_metrics': {
                'gross_margin': {
                    'formula': '(revenue - cogs) / revenue',
                    'requires': ['revenue', 'cogs'],
                    'confidence': 95
                },
                'burn_rate': {
                    'formula': 'monthly_expenses',
                    'requires': ['expenses', 'date'],
                    'confidence': 80
                }
            }
        }
        
    def analyze_gaps(
        self,
        df: pd.DataFrame,
        domain_match: 'DomainMatch',  # From universal_schema_detector
        schema: Dict
    ) -> GapAnalysisResult:
        """
        Analyze all gaps and generate suggestions
        
        Args:
            df: Input dataframe
            domain_match: Result from UniversalSchemaDetector
            schema: Domain schema definition
            
        Returns:
            GapAnalysisResult with all gaps and suggestions
        """
        gaps = []
        limitations = []
        
        # Analyze missing critical columns
        for missing_col in domain_match.missing_critical:
            gap = self._analyze_missing_column(
                df,
                missing_col,
                domain_match.domain,
                domain_match.matched_columns,
                schema
            )
            gaps.append(gap)
            
            if gap.action_type == 'skip':
                limitations.append(f"Cannot calculate {missing_col}-based KPIs")
        
        # Analyze wrong format columns
        for col_name, (actual_col, confidence) in domain_match.matched_columns.items():
            format_gaps = self._check_column_format(df, col_name, actual_col, schema)
            gaps.extend(format_gaps)
        
        # Analyze granularity issues
        if 'date' in domain_match.matched_columns:
            date_col = domain_match.matched_columns['date'][0]
            granularity_gap = self._check_granularity(df, date_col, schema)
            if granularity_gap:
                gaps.append(granularity_gap)
        
        # Determine if can proceed
        critical_gaps = [g for g in gaps if g.gap_type == GapType.MISSING_CRITICAL]
        can_proceed = len(critical_gaps) == 0
        
        # Can proceed with limitations if we have proxy options
        proceed_with_limitations = any(
            len(g.options) > 0 for g in critical_gaps
        )
        
        return GapAnalysisResult(
            domain=domain_match.domain,
            domain_confidence=domain_match.confidence,
            matched_columns=domain_match.matched_columns,
            gaps=gaps,
            can_proceed=can_proceed,
            proceed_with_limitations=proceed_with_limitations,
            limitations=limitations
        )
    
    def _analyze_missing_column(
        self,
        df: pd.DataFrame,
        missing_col: str,
        domain: str,
        matched_columns: Dict,
        schema: Dict
    ) -> GapSuggestion:
        """Analyze a single missing column"""
        
        # Check if we can calculate it as a proxy
        proxy_options = self._find_proxy_options(
            missing_col,
            domain,
            matched_columns,
            df.columns
        )
        
        if proxy_options:
            return GapSuggestion(
                gap_type=GapType.MISSING_CRITICAL,
                missing_column=missing_col,
                suggestion=f"Calculate {missing_col} using proxy formula",
                confidence=proxy_options[0]['confidence'],
                action_type='user_confirm',
                options=proxy_options
            )
        
        # Suggest alternative column names to look for
        alternative_names = self.suggest_alternative_names(missing_col, domain)
        
        return GapSuggestion(
            gap_type=GapType.MISSING_CRITICAL,
            missing_column=missing_col,
            suggestion=f"Required for {self._get_kpi_impact(missing_col, domain)}. Do you have: {', '.join(alternative_names)}?",
            confidence=0,
            action_type='user_input',
            options=[
                {'type': 'upload_supplementary', 'label': 'Upload additional data'},
                {'type': 'skip_kpi', 'label': f'Skip {missing_col}-based analysis'},
                {'type': 'manual_entry', 'label': 'Enter manually'}
            ]
        )
    
    def _find_proxy_options(
        self,
        missing_col: str,
        domain: str,
        matched_columns: Dict,
        available_columns: List[str]
    ) -> List[Dict]:
        """Find proxy calculation options for missing column"""
        
        if domain not in self.proxy_formulas:
            return []
        
        domain_proxies = self.proxy_formulas[domain]
        
        if missing_col not in domain_proxies:
            return []
        
        proxy_def = domain_proxies[missing_col]
        
        # Check if we have all required columns for the proxy
        has_required = all(
            req in matched_columns or req in available_columns
            for req in proxy_def['requires']
        )
        
        if has_required:
            return [{
                'type': 'proxy_calculation',
                'formula': proxy_def['formula'],
                'requires': proxy_def['requires'],
                'confidence': proxy_def['confidence'],
                'description': proxy_def.get('description', f'Calculated {missing_col}'),
                'label': f"Calculate as: {proxy_def['formula']}"
            }]
        
        return []
    
    def _check_column_format(
        self,
        df: pd.DataFrame,
        col_name: str,
        actual_col: str,
        schema: Dict
    ) -> List[GapSuggestion]:
        """Check if column has correct format"""
        gaps = []
        
        # Check date column format
        if col_name == 'date':
            if not pd.api.types.is_datetime64_any_dtype(df[actual_col]):
                gaps.append(GapSuggestion(
                    gap_type=GapType.WRONG_FORMAT,
                    missing_column=actual_col,
                    suggestion=f"Convert '{actual_col}' to date format",
                    confidence=95,
                    action_type='auto_fix',
                    options=[{
                        'type': 'date_conversion',
                        'label': 'Auto-convert to datetime',
                        'preview': True
                    }]
                ))
        
        # Check numeric columns
        elif col_name in ['target', 'quantity', 'amount', 'metric']:
            if not pd.api.types.is_numeric_dtype(df[actual_col]):
                # Try to detect if it's convertible
                try:
                    pd.to_numeric(df[actual_col], errors='coerce')
                    convertible = True
                except:
                    convertible = False
                
                if convertible:
                    gaps.append(GapSuggestion(
                        gap_type=GapType.WRONG_FORMAT,
                        missing_column=actual_col,
                        suggestion=f"Convert '{actual_col}' to numeric",
                        confidence=90,
                        action_type='auto_fix',
                        options=[{
                            'type': 'numeric_conversion',
                            'label': 'Auto-convert to number',
                            'preview': True
                        }]
                    ))
                else:
                    gaps.append(GapSuggestion(
                        gap_type=GapType.WRONG_FORMAT,
                        missing_column=actual_col,
                        suggestion=f"'{actual_col}' contains non-numeric values",
                        confidence=0,
                        action_type='user_input',
                        options=[{
                            'type': 'manual_fix',
                            'label': 'Clean data manually'
                        }]
                    ))
        
        return gaps
    
    def _check_granularity(
        self,
        df: pd.DataFrame,
        date_col: str,
        schema: Dict
    ) -> Optional[GapSuggestion]:
        """Check if date granularity matches needs"""
        
        try:
            dates = pd.to_datetime(df[date_col], errors='coerce').dropna()
            
            if len(dates) < 2:
                return None
            
            # Detect current granularity
            date_diffs = dates.diff().dropna()
            median_diff = date_diffs.median()
            
            current_granularity = None
            if median_diff <= pd.Timedelta(days=1):
                current_granularity = 'daily'
            elif median_diff <= pd.Timedelta(days=7):
                current_granularity = 'weekly'
            elif median_diff <= pd.Timedelta(days=31):
                current_granularity = 'monthly'
            else:
                current_granularity = 'yearly'
            
            # For forecasting, daily data is often too granular
            if current_granularity == 'daily' and len(df) > 365:
                return GapSuggestion(
                    gap_type=GapType.WRONG_GRANULARITY,
                    missing_column=date_col,
                    suggestion="Daily data detected. Consider aggregating to weekly/monthly for better forecasts",
                    confidence=75,
                    action_type='user_confirm',
                    options=[
                        {'type': 'aggregate', 'granularity': 'weekly', 'label': 'Aggregate to weekly'},
                        {'type': 'aggregate', 'granularity': 'monthly', 'label': 'Aggregate to monthly'},
                        {'type': 'keep', 'label': 'Keep daily granularity'}
                    ]
                )
            
        except Exception as e:
            logger.warning(f"Could not check granularity: {e}")
        
        return None
    
    def suggest_alternative_names(self, column: str, domain: str) -> List[str]:
        """Suggest alternative column names user might have"""
        
        alternatives = {
            'sales_forecast': {
                'date': ['order_date', 'transaction_date', 'sales_date', 'timestamp'],
                'target': ['sales_amount', 'revenue', 'total_sales', 'units_sold'],
                'product': ['item', 'product_name', 'sku', 'product_id'],
                'price': ['unit_price', 'selling_price', 'retail_price']
            },
            'hr_analytics': {
                'employee': ['emp_id', 'staff_id', 'employee_name', 'worker_id'],
                'department': ['dept', 'division', 'team', 'business_unit'],
                'termination': ['exit_date', 'resignation_date', 'end_date', 'left_date'],
                'salary': ['compensation', 'pay', 'annual_salary', 'wage']
            },
            'financial_metrics': {
                'amount': ['value', 'transaction_amount', 'total', 'balance'],
                'category': ['type', 'account_type', 'classification'],
                'account': ['account_number', 'gl_account', 'ledger']
            }
        }
        
        domain_alternatives = alternatives.get(domain, {})
        return domain_alternatives.get(column, [column + '_2', column + '_alt'])
    
    def _get_kpi_impact(self, column: str, domain: str) -> str:
        """Get description of what KPIs depend on this column"""
        
        kpi_impacts = {
            'sales_forecast': {
                'date': 'time-series forecasting',
                'target': 'demand prediction and revenue forecasting',
                'product': 'product-level analysis and SKU forecasting',
                'price': 'revenue calculation and price elasticity'
            },
            'hr_analytics': {
                'employee': 'headcount analysis',
                'termination': 'turnover rate and retention analysis',
                'department': 'department-level insights',
                'salary': 'compensation analysis and cost planning'
            },
            'marketing_analytics': {
                'spend': 'CAC and ROAS calculations',
                'revenue': 'ROI and campaign effectiveness',
                'channel': 'channel attribution and optimization'
            }
        }
        
        domain_impacts = kpi_impacts.get(domain, {})
        return domain_impacts.get(column, f'{column}-based metrics')
