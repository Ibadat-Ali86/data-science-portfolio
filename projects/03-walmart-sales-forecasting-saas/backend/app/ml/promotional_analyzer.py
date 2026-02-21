"""
Promotional ROI Analyzer

This module measures and optimizes promotional effectiveness:
- Calculate price elasticity by department
- Simulate promotion ROI before spending
- Rank promotion opportunities by ROI
- Generate promotional calendars

Author: ML Team
Date: 2026-02-08
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class PromotionROI:
    """Container for promotion ROI analysis results."""
    dept: int
    markdown_pct: float
    baseline_sales: float
    expected_sales: float
    incremental_sales: float
    markdown_cost: float
    net_profit: float
    roi: float
    recommendation: str  # 'PROCEED', 'RECONSIDER', 'DO_NOT_PROCEED'


class PromotionalROIAnalyzer:
    """
    Measure incremental sales lift from promotions.
    
    Business Questions Answered:
    1. Which departments are most markdown-sensitive?
    2. What's the optimal markdown level (5%, 10%, 20%)?
    3. Should we promote Department A or Department B this week?
    4. What's the expected ROI of a promotion campaign?
    
    Key Concepts:
    - Price Elasticity: % change in quantity / % change in price
      - Elasticity > 1: Elastic (sales very responsive to markdowns)
      - Elasticity < 1: Inelastic (sales less responsive)
    
    Usage:
        analyzer = PromotionalROIAnalyzer(historical_data)
        elasticities = analyzer.calculate_elasticity()
        roi = analyzer.simulate_promotion(dept=72, markdown_pct=15)
        opportunities = analyzer.rank_opportunities(budget=100000)
    """
    
    def __init__(
        self,
        historical_data: pd.DataFrame,
        markdown_cols: List[str] = None,
        sales_col: str = 'Weekly_Sales',
        dept_col: str = 'Dept',
        store_type_col: str = 'Type'
    ):
        """
        Initialize the analyzer.
        
        Args:
            historical_data: DataFrame with sales and markdown data
            markdown_cols: List of markdown column names
            sales_col: Name of sales column
            dept_col: Name of department column
            store_type_col: Name of store type column
        """
        self.data = historical_data.copy()
        self.markdown_cols = markdown_cols or ['MarkDown1', 'MarkDown2', 'MarkDown3', 'MarkDown4', 'MarkDown5']
        self.sales_col = sales_col
        self.dept_col = dept_col
        self.store_type_col = store_type_col
        
        self.elasticities = None
        self.fitted = False
        
    def calculate_elasticity(self, min_samples: int = 20) -> pd.DataFrame:
        """
        Calculate price elasticity by department.
        
        Elasticity = % change in quantity / % change in price
        
        Args:
            min_samples: Minimum markdown weeks required for calculation
            
        Returns:
            DataFrame with elasticity estimates by department
        """
        # Filter to markdown columns that exist
        existing_cols = [c for c in self.markdown_cols if c in self.data.columns]
        if not existing_cols:
            logger.warning("No markdown columns found")
            return pd.DataFrame()
        
        # Calculate total markdown amount
        self.data['_total_markdown'] = self.data[existing_cols].fillna(0).sum(axis=1)
        
        # Calculate effective discount rate
        self.data['_effective_discount'] = (
            self.data['_total_markdown'] / 
            (self.data[self.sales_col].clip(lower=1) + self.data['_total_markdown'])
        ).clip(0, 0.5)  # Cap at 50% discount
        
        elasticities = {}
        
        for dept in self.data[self.dept_col].unique():
            dept_data = self.data[self.data[self.dept_col] == dept]
            
            # Separate markdown vs no-markdown weeks
            markdown_weeks = dept_data[dept_data['_effective_discount'] > 0.01]
            normal_weeks = dept_data[dept_data['_effective_discount'] <= 0.01]
            
            if len(markdown_weeks) < min_samples or len(normal_weeks) < min_samples:
                continue
            
            # Calculate average sales
            avg_markdown_sales = markdown_weeks[self.sales_col].mean()
            avg_normal_sales = normal_weeks[self.sales_col].mean()
            
            # Calculate average discount
            avg_discount = markdown_weeks['_effective_discount'].mean()
            
            # Avoid division by zero
            if avg_normal_sales == 0 or avg_discount == 0:
                continue
            
            # Calculate elasticity
            pct_change_sales = (avg_markdown_sales - avg_normal_sales) / avg_normal_sales
            pct_change_price = -avg_discount  # Price decreased by avg_discount
            
            elasticity = abs(pct_change_sales / pct_change_price) if pct_change_price != 0 else 0
            
            # Incremental lift
            incremental_lift = avg_markdown_sales - avg_normal_sales
            
            elasticities[dept] = {
                'elasticity': round(elasticity, 3),
                'avg_lift': round(incremental_lift, 2),
                'avg_discount_pct': round(avg_discount * 100, 2),
                'markdown_weeks': len(markdown_weeks),
                'normal_weeks': len(normal_weeks),
                'avg_markdown_sales': round(avg_markdown_sales, 2),
                'avg_normal_sales': round(avg_normal_sales, 2),
                'is_elastic': elasticity > 1,
                'recommendation': 'Promote' if elasticity > 1.2 else 'Avoid' if elasticity < 0.5 else 'Neutral'
            }
        
        self.elasticities = pd.DataFrame(elasticities).T
        self.elasticities.index.name = 'Dept'
        self.elasticities = self.elasticities.reset_index()
        self.fitted = True
        
        logger.info(f"Calculated elasticity for {len(self.elasticities)} departments")
        
        return self.elasticities.sort_values('elasticity', ascending=False)
    
    def simulate_promotion(
        self, 
        dept: int, 
        markdown_pct: float,
        store_type: str = 'A'
    ) -> PromotionROI:
        """
        Simulate ROI of a promotional campaign.
        
        Args:
            dept: Department ID
            markdown_pct: Markdown percentage (e.g., 15 for 15%)
            store_type: Store type filter ('A', 'B', 'C')
            
        Returns:
            PromotionROI with analysis results
        """
        if not self.fitted or self.elasticities is None:
            self.calculate_elasticity()
        
        # Check if department has elasticity data
        dept_elasticity = self.elasticities[self.elasticities['Dept'] == dept]
        
        if len(dept_elasticity) == 0:
            return PromotionROI(
                dept=dept,
                markdown_pct=markdown_pct,
                baseline_sales=0,
                expected_sales=0,
                incremental_sales=0,
                markdown_cost=0,
                net_profit=0,
                roi=0,
                recommendation='INSUFFICIENT_DATA'
            )
        
        elasticity = dept_elasticity['elasticity'].values[0]
        
        # Get baseline sales (no promotion)
        baseline_mask = (
            (self.data[self.dept_col] == dept) &
            (self.data['_effective_discount'] <= 0.01)
        )
        
        if self.store_type_col in self.data.columns:
            baseline_mask &= (self.data[self.store_type_col] == store_type)
        
        baseline_sales = self.data[baseline_mask][self.sales_col].mean()
        
        if pd.isna(baseline_sales):
            baseline_sales = dept_elasticity['avg_normal_sales'].values[0]
        
        # Calculate expected lift from elasticity
        expected_lift_pct = elasticity * (markdown_pct / 100)
        expected_sales = baseline_sales * (1 + expected_lift_pct)
        incremental_sales = expected_sales - baseline_sales
        
        # Calculate costs and profit
        markdown_cost = expected_sales * (markdown_pct / 100)
        net_profit = incremental_sales - markdown_cost
        roi = (net_profit / markdown_cost) * 100 if markdown_cost > 0 else 0
        
        # Recommendation
        if roi > 20:
            recommendation = 'PROCEED'
        elif roi > 0:
            recommendation = 'RECONSIDER'
        else:
            recommendation = 'DO_NOT_PROCEED'
        
        return PromotionROI(
            dept=dept,
            markdown_pct=markdown_pct,
            baseline_sales=round(baseline_sales, 2),
            expected_sales=round(expected_sales, 2),
            incremental_sales=round(incremental_sales, 2),
            markdown_cost=round(markdown_cost, 2),
            net_profit=round(net_profit, 2),
            roi=round(roi, 2),
            recommendation=recommendation
        )
    
    def rank_opportunities(
        self, 
        budget: float,
        markdown_pct: float = 15,
        min_roi: float = 20
    ) -> Tuple[pd.DataFrame, float]:
        """
        Given a fixed budget, rank departments by ROI.
        
        Args:
            budget: Total promotion budget
            markdown_pct: Standard markdown percentage
            min_roi: Minimum ROI threshold
            
        Returns:
            Tuple of (selected departments DataFrame, remaining budget)
        """
        if not self.fitted:
            self.calculate_elasticity()
        
        opportunities = []
        
        for dept in self.elasticities['Dept'].unique():
            roi_analysis = self.simulate_promotion(dept, markdown_pct)
            
            if roi_analysis.recommendation != 'INSUFFICIENT_DATA':
                opportunities.append({
                    'dept': dept,
                    'roi': roi_analysis.roi,
                    'net_profit': roi_analysis.net_profit,
                    'required_budget': roi_analysis.markdown_cost,
                    'expected_incremental': roi_analysis.incremental_sales,
                    'elasticity': self.elasticities[self.elasticities['Dept'] == dept]['elasticity'].values[0]
                })
        
        if not opportunities:
            return pd.DataFrame(), budget
        
        opportunities_df = pd.DataFrame(opportunities).sort_values('roi', ascending=False)
        
        # Select departments within budget
        selected = []
        remaining_budget = budget
        
        for _, row in opportunities_df.iterrows():
            if row['required_budget'] <= remaining_budget and row['roi'] >= min_roi:
                selected.append(row)
                remaining_budget -= row['required_budget']
        
        selected_df = pd.DataFrame(selected) if selected else pd.DataFrame()
        
        logger.info(f"Selected {len(selected_df)} departments, ${remaining_budget:.0f} remaining")
        
        return selected_df, remaining_budget
    
    def generate_promotion_calendar(
        self, 
        weeks: int = 4,
        weekly_budget: float = 25000,
        markdown_pct: float = 15
    ) -> pd.DataFrame:
        """
        Create N-week promotional calendar optimizing revenue.
        
        Rules:
        1. Don't promote same department 2 weeks in a row (fatigue)
        2. Maximize total incremental profit
        3. Stay within weekly budget
        
        Args:
            weeks: Number of weeks to plan
            weekly_budget: Budget per week
            markdown_pct: Standard markdown percentage
            
        Returns:
            DataFrame with promotional calendar
        """
        if not self.fitted:
            self.calculate_elasticity()
        
        calendar = []
        promoted_last_week = set()
        
        for week in range(1, weeks + 1):
            opportunities, _ = self.rank_opportunities(
                budget=weekly_budget,
                markdown_pct=markdown_pct
            )
            
            if len(opportunities) == 0:
                continue
            
            # Filter out departments promoted last week
            available = opportunities[~opportunities['dept'].isin(promoted_last_week)]
            
            if len(available) == 0:
                available = opportunities  # Reset if no options
            
            # Select top 3-5 departments
            top_promos = available.head(5)
            promoted_this_week = set()
            
            for _, promo in top_promos.iterrows():
                calendar.append({
                    'week': week,
                    'dept': promo['dept'],
                    'markdown_pct': markdown_pct,
                    'expected_roi': promo['roi'],
                    'expected_profit': promo['net_profit'],
                    'budget_allocated': promo['required_budget']
                })
                promoted_this_week.add(promo['dept'])
            
            promoted_last_week = promoted_this_week
        
        return pd.DataFrame(calendar)
    
    def get_top_elastic_departments(self, top_n: int = 10) -> pd.DataFrame:
        """Get top N most elastic (promotion-responsive) departments."""
        if not self.fitted:
            self.calculate_elasticity()
        
        return self.elasticities.nlargest(top_n, 'elasticity')
    
    def get_inelastic_departments(self, threshold: float = 0.5) -> pd.DataFrame:
        """Get departments that should avoid promotions (low elasticity)."""
        if not self.fitted:
            self.calculate_elasticity()
        
        return self.elasticities[self.elasticities['elasticity'] < threshold]
    
    def get_summary_stats(self) -> Dict:
        """Get summary statistics for promotional analysis."""
        if not self.fitted:
            self.calculate_elasticity()
        
        return {
            'total_departments_analyzed': len(self.elasticities),
            'avg_elasticity': float(self.elasticities['elasticity'].mean()),
            'median_elasticity': float(self.elasticities['elasticity'].median()),
            'n_elastic_depts': int((self.elasticities['elasticity'] > 1).sum()),
            'n_inelastic_depts': int((self.elasticities['elasticity'] < 1).sum()),
            'recommended_for_promotion': int((self.elasticities['recommendation'] == 'Promote').sum()),
            'avoid_promotion': int((self.elasticities['recommendation'] == 'Avoid').sum())
        }
