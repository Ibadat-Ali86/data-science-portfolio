"""
Report Confidence Scorer
Calculates overall report confidence based on multiple quality factors
"""

import logging
from typing import Dict, Optional
from dataclasses import dataclass
from enum import Enum
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


class ConfidenceTier(Enum):
    """Report confidence tiers"""
    HIGH = "high"              # 90-100: Complete data, strong statistical significance
    GOOD = "good"              # 75-89: Minor gaps, adequate statistical power
    MEDIUM = "medium"          # 60-74: 1-2 proxies, directional insights
    EXPLORATORY = "exploratory"  # <60: Limited data, pattern discovery only


@dataclass
class ConfidenceBreakdown:
    """Detailed confidence score breakdown"""
    overall: float
    tier: ConfidenceTier
    data_completeness: float
    schema_confidence: float
    statistical_power: float
    business_relevance: float
    limitations: list
    strengths: list


class ReportConfidenceScorer:
    """
    Calculates comprehensive confidence scores for generated reports
    
    Scoring Components:
    - Data Completeness (35%): % of expected columns present, missing value ratio
    - Schema Confidence (25%): Domain detection quality, column mapping accuracy
    - Statistical Power (20%): Sample size, variance, temporal coverage
    - Business Relevance (20%): KPI availability, domain-specific requirements met
    """
    
    def __init__(self):
        # Minimum thresholds for statistical validity
        self.MIN_ROWS_FORECAST = 30      # Minimum for time-series forecasting
        self.MIN_ROWS_ANALYSIS = 10      # Minimum for basic analysis
        self.IDEAL_MONTHS = 24           # Ideal historical coverage (months)
        self.MIN_MONTHS = 6              # Minimum acceptable coverage
        
    def calculate_confidence(
        self,
        df: pd.DataFrame,
        domain_match: Dict,
        gap_analysis: Dict,
        analysis_type: str = 'forecast'
    ) -> ConfidenceBreakdown:
        """
        Calculate overall report confidence
        
        Args:
            df: Input dataframe
            domain_match: Domain detection results from UniversalSchemaDetector
            gap_analysis: Gap analysis results from GapAnalysisEngine
            analysis_type: Type of analysis ('forecast', 'kpi_dashboard', 'exploratory')
            
        Returns:
            ConfidenceBreakdown with detailed scores
        """
        logger.info(f"Calculating report confidence for {domain_match.get('domain', 'unknown')} analysis")
        
        # Component 1: Data Completeness (35%)
        completeness = self._calculate_data_completeness(
            df, 
            domain_match.get('matched_columns', {}),
            domain_match.get('missing_critical', []),
            domain_match.get('missing_optional', [])
        )
        
        # Component 2: Schema Confidence (25%)
        schema_conf = domain_match.get('domain_confidence', 0.0)
        
        # Component 3: Statistical Power (20%)
        stat_power = self._calculate_statistical_power(
            df,
            analysis_type,
            domain_match.get('domain', 'generic')
        )
        
        # Component 4: Business Relevance (20%)
        business_rel = self._calculate_business_relevance(
            domain_match.get('matched_columns', {}),
            gap_analysis.get('gaps', []),
            domain_match.get('domain', 'generic')
        )
        
        # Weighted overall score
        overall = (
            completeness * 0.35 +
            schema_conf * 0.25 +
            stat_power * 0.20 +
            business_rel * 0.20
        )
        
        # Determine tier
        tier = self._get_confidence_tier(overall)
        
        # Identify strengths and limitations
        strengths = self._identify_strengths(
            completeness, schema_conf, stat_power, business_rel
        )
        limitations = self._identify_limitations(
            completeness, schema_conf, stat_power, business_rel,
            gap_analysis.get('limitations', [])
        )
        
        logger.info(f"Report confidence: {overall:.1f}% ({tier.value})")
        
        return ConfidenceBreakdown(
            overall=overall,
            tier=tier,
            data_completeness=completeness,
            schema_confidence=schema_conf,
            statistical_power=stat_power,
            business_relevance=business_rel,
            limitations=limitations,
            strengths=strengths
        )
    
    def _calculate_data_completeness(
        self,
        df: pd.DataFrame,
        matched_columns: Dict,
        missing_critical: list,
        missing_optional: list
    ) -> float:
        """
        Calculate data completeness score
        
        Factors:
        - % of critical columns present
        - Missing value ratio in available columns
        - Optional column coverage
        """
        score = 100.0
        
        # Critical columns penalty (heavy impact)
        if missing_critical:
            critical_penalty = len(missing_critical) * 15
            score -= min(critical_penalty, 50)  # Cap at 50% penalty
        
        # Missing values in matched columns (moderate impact)
        if matched_columns:
            missing_value_ratios = []
            for schema_col, (actual_col, _) in matched_columns.items():
                if actual_col in df.columns:
                    missing_ratio = df[actual_col].isna().sum() / len(df)
                    missing_value_ratios.append(missing_ratio)
            
            if missing_value_ratios:
                avg_missing = np.mean(missing_value_ratios)
                score -= avg_missing * 30  # Up to 30% penalty
        
        # Optional columns bonus (light impact)
        total_optional = len(missing_optional) + sum(
            1 for col in matched_columns.keys() 
            if col not in ['date', 'target', 'value']
        )
        if total_optional > 0:
            optional_present = total_optional - len(missing_optional)
            optional_bonus = (optional_present / total_optional) * 10
            score += optional_bonus
        
        return max(0, min(100, score))
    
    def _calculate_statistical_power(
        self,
        df: pd.DataFrame,
        analysis_type: str,
        domain: str
    ) -> float:
        """
        Calculate statistical power score
        
        Factors:
        - Sample size adequacy
        - Temporal coverage (for time-series)
        - Data variance quality
        """
        score = 100.0
        
        # Sample size adequacy
        n_rows = len(df)
        if analysis_type == 'forecast':
            min_required = self.MIN_ROWS_FORECAST
        else:
            min_required = self.MIN_ROWS_ANALYSIS
        
        if n_rows < min_required:
            score -= 40  # Major penalty for insufficient data
        elif n_rows < min_required * 2:
            score -= 20  # Moderate penalty for marginal sample size
        else:
            score += 10  # Bonus for ample data
        
        # Temporal coverage (if time-series)
        if 'date' in df.columns or any('date' in str(col).lower() for col in df.columns):
            date_col = 'date' if 'date' in df.columns else [
                col for col in df.columns if 'date' in str(col).lower()
            ][0]
            
            try:
                df_temp = df.copy()
                df_temp[date_col] = pd.to_datetime(df_temp[date_col], errors='coerce')
                date_range = (df_temp[date_col].max() - df_temp[date_col].min()).days
                
                months_covered = date_range / 30
                
                if months_covered < self.MIN_MONTHS:
                    score -= 30  # Insufficient history
                elif months_covered < self.IDEAL_MONTHS:
                    penalty = (self.IDEAL_MONTHS - months_covered) / self.IDEAL_MONTHS * 20
                    score -= penalty
                else:
                    score += 10  # Bonus for excellent history
            except:
                score -= 10  # Penalty if can't assess temporal coverage
        
        # Data variance quality
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            # Check for sufficient variance (not all zeros/constants)
            variances = df[numeric_cols].var()
            low_variance_ratio = (variances < 1e-6).sum() / len(variances)
            
            if low_variance_ratio > 0.5:
                score -= 25  # Too many constant columns
            elif low_variance_ratio > 0.2:
                score -= 10  # Some constant columns
        
        return max(0, min(100, score))
    
    def _calculate_business_relevance(
        self,
        matched_columns: Dict,
        gaps: list,
        domain: str
    ) -> float:
        """
        Calculate business relevance score
        
        Factors:
        - KPI column availability
        - Domain-specific requirements
        - Actionability of available data
        """
        score = 100.0
        
        # KPI column availability
        kpi_columns = ['revenue', 'sales', 'profit', 'cost', 'quantity', 'price', 
                      'customers', 'employees', 'turnover', 'conversions']
        
        matched_kpis = sum(
            1 for schema_col in matched_columns.keys()
            if any(kpi in schema_col.lower() for kpi in kpi_columns)
        )
        
        if matched_kpis == 0:
            score -= 40  # No KPIs matched
        elif matched_kpis < 3:
            score -= 20  # Limited KPIs
        else:
            score += 10  # Good KPI coverage
        
        # Proxy usage penalty
        proxy_gaps = [g for g in gaps if g.get('action_type') == 'user_confirm']
        if len(proxy_gaps) > 2:
            score -= 30  # Too many proxies
        elif len(proxy_gaps) > 0:
            score -= 15 * len(proxy_gaps)  # Moderate penalty per proxy
        
        # Essential columns check (domain-specific)
        essential_missing = [
            g for g in gaps 
            if g.get('gap_type') == 'missing_critical'
        ]
        score -= len(essential_missing) * 12
        
        return max(0, min(100, score))
    
    def _get_confidence_tier(self, overall: float) -> ConfidenceTier:
        """Determine confidence tier from overall score"""
        if overall >= 90:
            return ConfidenceTier.HIGH
        elif overall >= 75:
            return ConfidenceTier.GOOD
        elif overall >= 60:
            return ConfidenceTier.MEDIUM
        else:
            return ConfidenceTier.EXPLORATORY
    
    def _identify_strengths(
        self,
        completeness: float,
        schema_conf: float,
        stat_power: float,
        business_rel: float
    ) -> list:
        """Identify key strengths of the analysis"""
        strengths = []
        
        if completeness >= 85:
            strengths.append("Complete dataset with all critical columns")
        if schema_conf >= 90:
            strengths.append("High domain match confidence")
        if stat_power >= 80:
            strengths.append("Strong statistical power for forecasting")
        if business_rel >= 85:
            strengths.append("Excellent KPI coverage for business insights")
        
        if not strengths:
            # Always provide at least one positive
            if completeness >= 70:
                strengths.append("Adequate data coverage for analysis")
            elif schema_conf >= 70:
                strengths.append("Clear domain identification")
            else:
                strengths.append("Dataset structure detected successfully")
        
        return strengths
    
    def _identify_limitations(
        self,
        completeness: float,
        schema_conf: float,
        stat_power: float,
        business_rel: float,
        gap_limitations: list
    ) -> list:
        """Identify key limitations of the analysis"""
        limitations = []
        
        if completeness < 70:
            limitations.append("Incomplete dataset - some critical columns missing")
        if schema_conf < 70:
            limitations.append("Uncertain domain classification - manual verification recommended")
        if stat_power < 60:
            limitations.append("Limited statistical power - collect more historical data for better forecasts")
        if business_rel < 70:
            limitations.append("Limited KPI coverage - some business metrics unavailable")
        
        # Add gap-specific limitations
        limitations.extend(gap_limitations[:3])  # Top 3 most important
        
        return limitations[:5]  # Cap at 5 to avoid overwhelming
    
    def get_report_template_type(self, tier: ConfidenceTier) -> str:
        """Get the appropriate report template based on confidence tier"""
        template_mapping = {
            ConfidenceTier.HIGH: 'high_confidence',
            ConfidenceTier.GOOD: 'high_confidence',  # Use same as HIGH
            ConfidenceTier.MEDIUM: 'medium_confidence',
            ConfidenceTier.EXPLORATORY: 'exploratory'
        }
        return template_mapping[tier]
