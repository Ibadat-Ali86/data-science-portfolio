"""
Business Narrative Generator
Template-based generation of executive insights and recommendations
"""

import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class BusinessInsight:
    """Structured business insight"""
    title: str
    description: str
    confidence: float
    impact_level: str  # 'high', 'medium', 'low'


@dataclass
class Recommendation:
    """Structured recommendation"""
    action: str
    outcome: str
    priority: str  # 'immediate', 'short_term', 'strategic'
    confidence: float


class BusinessNarrativeGenerator:
    """
    Generates executive-friendly business narratives from analysis results
    
    Uses rule-based templates (no LLM required for HuggingFace compatibility)
    """
    
    def __init__(self):
        self.insight_templates = self._build_insight_templates()
        self.recommendation_templates = self._build_recommendation_templates()
    
    def _build_insight_templates(self) -> Dict:
        """Build insight generation templates by domain"""
        return {
            'sales_forecast': {
                'growth': {
                    'positive': "{metric} shows {change_pct}% growth trend, indicating strong market demand and effective sales strategies.",
                    'negative': "{metric} declined by {change_pct}%, suggesting need for market repositioning or product refresh.",
                    'stable': "{metric} maintains steady performance at {current_value}, indicating mature market position."
                },
                'seasonality': "Strong seasonality detected with {peak_months} as peak periods, enabling optimized inventory planning and marketing campaigns.",
                'volatility': "High variance in {metric} (CV: {cv_value}%) suggests external factors or operational inconsistencies requiring investigation."
            },
            'hr_analytics': {
                'turnover': {
                    'high': "Turnover rate of {turnover_rate}% exceeds industry benchmark ({benchmark}%), representing significant replacement costs.",
                    'low': "Turnover rate of {turnover_rate}% below industry average indicates strong retention practices."
                },
                'growth': "Workforce expanding at {growth_rate}% annually, requiring proactive talent acquisition and onboarding scale-up.",
                'concentration': "{concentration_pct}% of workforce in {department} department suggests potential succession planning risk."
            },
            'marketing_analytics': {
                'efficiency': {
                    'good': "CAC of {cac} vs LTV of {ltv} yields healthy {ratio}x ratio, indicating sustainable customer acquisition.",
                    'poor': "CAC ({cac}) approaching LTV ({ltv}) suggests need for channel optimization or pricing adjustment."
                },
                'channel': "Top-performing channel ({channel}) generates {contribution_pct}% of conversions at {cac} CAC.",
                'trend': "Conversion rate {trend_direction} by {change_pct}% over {period}, indicating {interpretation}."
            },
            'financial_metrics': {
                'profitability': "{metric} margins at {margin_pct}%, {comparison} industry benchmark of {benchmark_pct}%.",
                'cash_flow': "Operating cash flow {trend} with {months_runway} months runway at current burn rate.",
                'variance': "Budget variance of {variance_pct}% in {category} requires cost control measures."
            },
            'inventory_management': {
                'turnover': "Inventory turnover of {turnover_ratio}x indicates {interpretation} relative to {benchmark}x industry standard.",
                'stockout': "Stockout rate of {stockout_pct}% in {category} impacting {revenue_impact} in potential revenue.",
                'excess': "Excess inventory of {excess_value} tied up in slow-moving SKUs, representing carrying cost optimization opportunity."
            },
            'generic': {
                'trend': "Primary metric shows {trend_direction} trend of {change_pct}% over analyzed period.",
                'pattern': "Analysis reveals {pattern_type} pattern with {confidence_pct}% confidence.",
                'outlier': "Significant anomalies detected in {period}, warranting detailed investigation."
            }
        }
    
    def _build_recommendation_templates(self) -> Dict:
        """Build recommendation templates by domain"""
        return {
            'sales_forecast': [
                {
                    'trigger': 'high_growth',
                    'action': 'Scale inventory capacity and distribution channels',
                    'outcome': 'Meet projected {growth_pct}% demand increase, prevent stockouts',
                    'priority': 'immediate'
                },
                {
                    'trigger': 'seasonality',
                    'action': 'Implement dynamic pricing for peak periods ({peak_months})',
                    'outcome': 'Capture additional {revenue_potential} in revenue',
                    'priority': 'short_term'
                },
                {
                    'trigger': 'declining_trend',
                    'action': 'Conduct market research and competitive analysis',
                    'outcome': 'Identify repositioning opportunities, target {recovery_pct}% recovery',
                    'priority': 'immediate'
                }
            ],
            'hr_analytics': [
                {
                    'trigger': 'high_turnover',
                    'action': 'Implement retention program targeting high-risk segments',
                    'outcome': 'Reduce turnover by {target_reduction}%, save {cost_savings} in replacement costs',
                    'priority': 'immediate'
                },
                {
                    'trigger': 'skill_gap',
                    'action': 'Launch upskilling program in {skill_area}',
                    'outcome': 'Build internal capabilities, reduce external hiring costs',
                    'priority': 'strategic'
                }
            ],
            'marketing_analytics': [
                {
                    'trigger': 'high_cac',
                    'action': 'Optimize underperforming channels, reallocate to top performers',
                    'outcome': 'Reduce CAC by {target_reduction}%, improve ROAS to {target_roas}x',
                    'priority': 'immediate'
                },
                {
                    'trigger': 'low_conversion',
                    'action': 'A/B test landing pages and implement funnel optimization',
                    'outcome': 'Target {target_improvement}% conversion increase',
                    'priority': 'short_term'
                }
            ],
            'generic': [
                {
                    'trigger': 'data_quality',
                    'action': 'Implement data governance framework',
                    'outcome': 'Improve analytical confidence from {current}% to 90%+',
                    'priority': 'strategic'
                }
            ]
        }
    
    def generate_insights(
        self,
        domain: str,
        analysis_results: Dict,
        confidence: Dict
    ) -> List[BusinessInsight]:
        """
        Generate business insights from analysis results
        
        Args:
            domain: Business domain
            analysis_results: Analysis output (trends, patterns, statistics)
            confidence: Confidence scores
            
        Returns:
            List of BusinessInsight objects
        """
        logger.info(f"Generating insights for {domain}")
        
        insights = []
        
        # Get domain templates (fall back to generic)
        templates = self.insight_templates.get(domain, self.insight_templates['generic'])
        
        # Generate insights based on analysis results
        if 'trend_direction' in analysis_results:
            insight = self._generate_trend_insight(templates, analysis_results, confidence)
            if insight:
                insights.append(insight)
        
        if 'seasonality' in analysis_results and analysis_results['seasonality']:
            insight = self._generate_seasonality_insight(templates, analysis_results, confidence)
            if insight:
                insights.append(insight)
        
        if 'volatility' in analysis_results:
            insight = self._generate_volatility_insight(templates, analysis_results, confidence)
            if insight:
                insights.append(insight)
        
        # If no specific insights, generate generic
        if not insights:
            insights.append(BusinessInsight(
                title="PERFORMANCE ANALYSIS",
                description=f"Analysis completed for {domain.replace('_', ' ').title()} data with {confidence.get('overall', 0):.0f}% confidence.",
                confidence=confidence.get('overall', 0),
                impact_level='medium'
            ))
        
        logger.info(f"Generated {len(insights)} insights")
        return insights[:5]  # Top 5 insights
    
    def generate_recommendations(
        self,
        domain: str,
        analysis_results: Dict,
        gaps: List[Dict],
        confidence: Dict
    ) -> List[Recommendation]:
        """
        Generate actionable recommendations
        
        Args:
            domain: Business domain
            analysis_results: Analysis output
            gaps: Data gaps from gap analysis
            confidence: Confidence scores
            
        Returns:
            List of Recommendation objects
        """
        logger.info(f"Generating recommendations for {domain}")
        
        recommendations = []
        
        # Get domain templates (fall back to generic)
        templates = self.recommendation_templates.get(domain, self.recommendation_templates['generic'])
        
        # Determine triggers from analysis results
        triggers = self._identify_triggers(analysis_results, confidence)
        
        # Generate recommendations based on triggers
        for template in templates:
            if template['trigger'] in triggers:
                rec = self._create_recommendation(template, analysis_results, confidence)
                recommendations.append(rec)
        
        # Add gap-based recommendations
        if gaps:
            gap_rec = self._generate_gap_recommendation(gaps[0], confidence)
            recommendations.append(gap_rec)
        
        # Sort by priority
        priority_order = {'immediate': 0, 'short_term': 1, 'strategic': 2}
        recommendations.sort(key=lambda r: priority_order.get(r.priority, 3))
        
        logger.info(f"Generated {len(recommendations)} recommendations")
        return recommendations[:5]  # Top 5 recommendations
    
    def _generate_trend_insight(self, templates: Dict, results: Dict, confidence: Dict) -> Optional[BusinessInsight]:
        """Generate insight about trend direction"""
        if 'growth' not in templates:
            return None
        
        trend = results['trend_direction']
        change_pct = abs(results.get('change_pct', 0))
        
        if change_pct > 10:
            template_key = 'positive' if trend == 'up' else 'negative'
        else:
            template_key = 'stable'
        
        description = templates['growth'][template_key].format(
            metric=results.get('metric_name', 'Primary metric'),
            change_pct=f"{change_pct:.1f}",
            current_value=results.get('current_value', 'N/A')
        )
        
        return BusinessInsight(
            title="PERFORMANCE TRAJECTORY",
            description=description,
            confidence=confidence.get('overall', 0),
            impact_level='high' if change_pct > 20 else 'medium'
        )
    
    def _generate_seasonality_insight(self, templates: Dict, results: Dict, confidence: Dict) -> Optional[BusinessInsight]:
        """Generate insight about seasonality"""
        if 'seasonality' not in templates:
            return None
        
        description = templates['seasonality'].format(
            peak_months=", ".join(results.get('peak_months', ['Q4'])),
        )
        
        return BusinessInsight(
            title="SEASONAL PATTERNS",
            description=description,
            confidence=confidence.get('statistical_power', 0),
            impact_level='medium'
        )
    
    def _generate_volatility_insight(self, templates: Dict, results: Dict, confidence: Dict) -> Optional[BusinessInsight]:
        """Generate insight about volatility"""
        if 'volatility' not in templates:
            return None
        
        cv_value = results.get('coefficient_variation', 0)
        
        if cv_value > 30:  # High volatility
            description = templates['volatility'].format(
                metric=results.get('metric_name', 'Primary metric'),
                cv_value=f"{cv_value:.1f}"
            )
            
            return BusinessInsight(
                title="VARIANCE ANALYSIS",
                description=description,
                confidence=confidence.get('statistical_power', 0),
                impact_level='high' if cv_value > 50 else 'medium'
            )
        
        return None
    
    def _identify_triggers(self, results: Dict, confidence: Dict) -> List[str]:
        """Identify recommendation triggers from analysis results"""
        triggers = []
        
        # High growth
        if results.get('change_pct', 0) > 15:
            triggers.append('high_growth')
        
        # Declining trend
        if results.get('trend_direction') == 'down' and abs(results.get('change_pct', 0)) > 10:
            triggers.append('declining_trend')
        
        # Seasonality
        if results.get('seasonality', False):
            triggers.append('seasonality')
        
        # Data quality
        if confidence.get('data_completeness', 100) < 80:
            triggers.append('data_quality')
        
        return triggers
    
    def _create_recommendation(self, template: Dict, results: Dict, confidence: Dict) -> Recommendation:
        """Create recommendation from template"""
        
        # Format template with results
        action = template['action'].format(**results) if '{' in template['action'] else template['action']
        outcome = template['outcome'].format(**results) if '{' in template['outcome'] else template['outcome']
        
        return Recommendation(
            action=action,
            outcome=outcome,
            priority=template['priority'],
            confidence=confidence.get('overall', 0)
        )
    
    def _generate_gap_recommendation(self, gap: Dict, confidence: Dict) -> Recommendation:
        """Generate recommendation from data gap"""
        
        return Recommendation(
            action=f"Address data gap: {gap.get('missing_column', 'unknown')}",
            outcome=gap.get('suggestion', 'Improve analytical completeness'),
            priority='strategic',
            confidence=confidence.get('overall', 0)
        )
