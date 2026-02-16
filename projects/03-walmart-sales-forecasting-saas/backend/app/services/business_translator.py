"""
Business Language Framework
Translates technical ML outputs into business-ready insights for C-suite executives
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class BusinessTranslator:
    """
    Translates ML forecasts and metrics into business language
    """
    
    # Translation mappings for ML metrics to business KPIs
    METRIC_TRANSLATIONS = {
        'mape': {
            'name': 'Forecast Accuracy',
            'format': 'percentage',
            'invert': True,  # Lower is better, so accuracy = 100 - MAPE
            'description': 'How accurately our model predicts future sales'
        },
        'rmse': {
            'name': 'Prediction Error Range',
            'format': 'currency',
            'description': 'Average difference between predicted and actual sales'
        },
        'r2': {
            'name': 'Model Reliability Score',
            'format': 'percentage',
            'description': 'How well our model explains sales patterns'
        }
    }
    
    def translate_forecast_results(
        self,
        forecasts: pd.DataFrame,
        historical_data: pd.DataFrame,
        metrics: Dict,
        product_info: Optional[Dict] = None
    ) -> Dict:
        """
        Generate comprehensive business report from ML outputs
        
        Args:
            forecasts: Forecasted sales data
            historical_data: Historical sales data
            metrics: ML model performance metrics
            product_info: Optional product/pricing information
            
        Returns:
            Business-ready insights report
        """
        report = {
            'executive_summary': self._generate_executive_summary(forecasts, historical_data, metrics),
            'revenue_impact': self._calculate_revenue_impact(forecasts, historical_data, product_info),
            'strategic_recommendations': self._generate_strategic_recommendations(forecasts, product_info),
            'risk_assessment': self._assess_risks(forecasts, historical_data),
            'opportunity_analysis': self._identify_opportunities(forecasts, historical_data),
            'action_plan': self._create_action_plan(forecasts, historical_data),
            'kpi_summary': self._translate_metrics_to_kpis(metrics)
        }
        
        return report
    
    def _generate_executive_summary(
        self,
        forecasts: pd.DataFrame,
        historical_data: pd.DataFrame,
        metrics: Dict
    ) -> Dict:
        """
        Generate C-suite friendly executive summary
        """
        # Calculate key business metrics
        if isinstance(forecasts, dict):
            predictions = np.array(forecasts.get('predictions', []))
        else:
            predictions = forecasts['predictions'].values if 'predictions' in forecasts.columns else forecasts.values
        
        forecast_total = float(np.sum(predictions))
        historical_avg = float(historical_data[self._get_target_column(historical_data)].mean())
        growth_rate = ((forecast_total / len(predictions) - historical_avg) / historical_avg) * 100
        
        # Accuracy assessment
        accuracy = 100 - metrics.get('mape', 0)
        
        # Confidence level
        confidence_level = self._determine_confidence_level(metrics)
        
        summary = {
            'headline': self._create_headline(growth_rate, forecast_total, accuracy),
            'forecast_period': len(predictions),
            'expected_total': forecast_total,
            'growth_rate': growth_rate,
            'accuracy_rating': accuracy,
            'confidence': confidence_level,
            'key_insights': [
                f"Model predicts {abs(growth_rate):.1f}% {'growth' if growth_rate > 0 else 'decline'} in average sales",
                f"Forecast accuracy rated at {accuracy:.1f}%, considered '{self._get_accuracy_rating(accuracy)}'",
                f"Based on {len(historical_data)} historical data points"
            ]
        }
        
        return summary
    
    def _calculate_revenue_impact(
        self,
        forecasts: pd.DataFrame,
        historical_data: pd.DataFrame,
        product_info: Optional[Dict] = None
    ) -> Dict:
        """
        Calculate projected revenue impact
        """
        if isinstance(forecasts, dict):
            predictions = np.array(forecasts.get('predictions', []))
            lower_bound = np.array(forecasts.get('lower_bound', predictions * 0.9))
            upper_bound = np.array(forecasts.get('upper_bound', predictions * 1.1))
        else:
            predictions = forecasts['predictions'].values
            lower_bound = forecasts.get('lower_bound', predictions * 0.9)
            upper_bound = forecasts.get('upper_bound', predictions * 1.1)
        
        # Calculate revenue (assumes quantity * price if price available)
        avg_price = product_info.get('avg_price', 1) if product_info else 1
        
        revenue_forecast = float(np.sum(predictions) * avg_price)
        revenue_best_case = float(np.sum(upper_bound) * avg_price)
        revenue_worst_case = float(np.sum(lower_bound) * avg_price)
        
        # Historical comparison
        target_col = self._get_target_column(historical_data)
        historical_revenue = float(historical_data[target_col].sum() * avg_price)
        historical_period_avg = historical_revenue / len(historical_data) * len(predictions)
        
        delta = revenue_forecast - historical_period_avg
        delta_pct = (delta / historical_period_avg) * 100 if historical_period_avg > 0 else 0
        
        return {
            'projected_revenue': revenue_forecast,
            'best_case_scenario': revenue_best_case,
            'worst_case_scenario': revenue_worst_case,
            'revenue_delta': delta,
            'revenue_delta_pct': delta_pct,
            'confidence_interval': {
                'lower': revenue_worst_case,
                'upper': revenue_best_case,
                'range_pct': ((revenue_best_case - revenue_worst_case) / revenue_forecast) * 100
            },
            'business_impact': self._describe_revenue_impact(delta_pct)
        }
    
    def _generate_strategic_recommendations(
        self,
        forecasts: pd.DataFrame,
        product_info: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Generate actionable strategic recommendations
        """
        if isinstance(forecasts, dict):
            predictions = np.array(forecasts.get('predictions', []))
        else:
            predictions = forecasts['predictions'].values
        
        recommendations = []
        
        # Trend analysis
        trend = self._analyze_trend(predictions)
        
        if trend == 'increasing':
            recommendations.append({
                'priority': 'high',
                'category': 'inventory',
                'title': 'Increase Inventory Levels',
                'description': 'Forecasts show upward trend. Recommend increasing stock by 15-20% to meet projected demand.',
                'expected_impact': 'Prevent stockouts and capture full revenue potential'
            })
            recommendations.append({
                'priority': 'medium',
                'category': 'staffing',
                'title': 'Prepare for Higher Volume',
                'description': 'Consider hiring temporary staff or scheduling overtime to handle increased demand.',
                'expected_impact': 'Maintain service levels during peak periods'
            })
        elif trend == 'decreasing':
            recommendations.append({
                'priority': 'high',
                'category': 'inventory',
                'title': 'Optimize Inventory',
                'description': 'Forecasts show declining trend. Recommend reducing new orders by 10-15% and focusing on liquidating existing stock.',
                'expected_impact': 'Avoid excess inventory and reduce carrying costs'
            })
            recommendations.append({
                'priority': 'high',
                'category': 'marketing',
                'title': 'Launch Promotional Campaign',
                'description': 'Implement targeted promotions to stimulate demand and reverse declining trend.',
                'expected_impact': 'Boost sales and market share'
            })
        else:  # stable
            recommendations.append({
                'priority': 'medium',
                'category': 'optimization',
                'title': 'Maintain Current Strategy',
                'description': 'Sales are stable. Focus on operational efficiency and process optimization.',
                'expected_impact': 'Improve profit margins through cost reduction'
            })
        
        # Seasonal recommendations
        if self._detect_seasonality(predictions):
            recommendations.append({
                'priority': 'medium',
                'category': 'planning',
                'title': 'Prepare for Seasonal Variations',
                'description': 'Data shows seasonal patterns. Implement flexible inventory and staffing strategies.',
                'expected_impact': 'Better resource allocation during peak and slow periods'
            })
        
        return recommendations
    
    def _assess_risks(
        self,
        forecasts: pd.DataFrame,
        historical_data: pd.DataFrame
    ) -> Dict:
        """
        Assess business risks based on forecast variability and uncertainty
        """
        if isinstance(forecasts, dict):
            predictions = np.array(forecasts.get('predictions', []))
            lower_bound = np.array(forecasts.get('lower_bound', predictions * 0.9))
            upper_bound = np.array(forecasts.get('upper_bound', predictions * 1.1))
        else:
            predictions = forecasts['predictions'].values
            lower_bound = forecasts.get('lower_bound', predictions * 0.9)
            upper_bound = forecasts.get('upper_bound', predictions * 1.1)
        
        # Calculate uncertainty
        uncertainty = np.mean(upper_bound - lower_bound) / np.mean(predictions) * 100
        
        # Volatility
        volatility = np.std(predictions) / np.mean(predictions) * 100
        
        risks = []
        risk_score = 0
        
        if uncertainty > 30:
            risks.append({
                'level': 'high',
                'type': 'forecast_uncertainty',
                'description': f'High forecast uncertainty ({uncertainty:.1f}%) may impact planning accuracy',
                'mitigation': 'Implement buffer stocks and flexible purchasing agreements'
            })
            risk_score += 30
        
        if volatility > 25:
            risks.append({
                'level': 'medium',
                'type': 'demand_volatility',
                'description': f'Volatile demand pattern  detected (CV: {volatility:.1f}%)',
                'mitigation': 'Use just-in-time inventory and dynamic pricing strategies'
            })
            risk_score += 20
        
        # Historical data quality
        target_col = self._get_target_column(historical_data)
        missing_pct = historical_data[target_col].isna().sum() / len(historical_data) * 100
        if missing_pct > 5:
            risks.append({
                'level': 'medium',
                'type': 'data_quality',
                'description': f'{missing_pct:.1f}% of historical data is missing',
                'mitigation': 'Improve data collection processes for better future forecasts'
            })
            risk_score += 15
        
        return {
            'overall_risk_score': min(risk_score, 100),
            'risk_level': 'High' if risk_score > 60 else 'Medium' if risk_score > 30 else 'Low',
            'identified_risks': risks,
            'uncertainty_range': uncertainty,
            'volatility': volatility
        }
    
    def _identify_opportunities(
        self,
        forecasts: pd.DataFrame,
        historical_data: pd.DataFrame
    ) -> List[Dict]:
        """
        Identify business opportunities from forecast patterns
        """
        if isinstance(forecasts, dict):
            predictions = np.array(forecasts.get('predictions', []))
        else:
            predictions = forecasts['predictions'].values
        
        opportunities = []
        
        # High growth opportunity
        growth_periods = np.where(predictions > predictions.mean() * 1.2)[0]
        if len(growth_periods) > 0:
            opportunities.append({
                'type': 'revenue_growth',
                'priority': 'high',
                'title': 'Capitalize on Peak Demand Periods',
                'description': f'Forecast shows {len(growth_periods)} periods with above-average demand',
                'action': 'Increase marketing spend and ensure inventory availability during these periods',
                'potential_impact': 'Up to 20% revenue increase'
            })
        
        # Efficiency opportunity
        stable_periods = np.where(np.abs(predictions - predictions.mean()) < predictions.std() * 0.5)[0]
        if len(stable_periods) > len(predictions) * 0.6:
            opportunities.append({
                'type': 'efficiency',
                'priority': 'medium',
                'title': 'Optimize Operations During Stable Periods',
                'description': 'Demand is relatively stable for majority of forecast period',
                'action': 'Implement process improvements and automation initiatives',
                'potential_impact': '10-15% cost reduction'
            })
        
        return opportunities
    
    def _create_action_plan(
        self,
        forecasts: pd.DataFrame,
        historical_data: pd.DataFrame
    ) -> List[Dict]:
        """
        Create time-based action plan
        """
        if isinstance(forecasts, dict):
            predictions = np.array(forecasts.get('predictions', []))
        else:
            predictions = forecasts['predictions'].values
        
        action_plan = []
        
        # Immediate actions (next 7 days)
        action_plan.append({
            'timeframe': 'Immediate (Next 7 Days)',
            'actions': [
                'Review current inventory levels against forecast',
                'Brief sales team on demand expectations',
                'Adjust short-term purchasing plans'
            ]
        })
        
        # Short-term actions (next 30 days)
        avg_next_month = np.mean(predictions[:30]) if len(predictions) >= 30 else np.mean(predictions)
        historical_avg = historical_data[self._get_target_column(historical_data)].mean()
        
        if avg_next_month > historical_avg * 1.1:
            action_plan.append({
                'timeframe': 'Short-term (Next 30 Days)',
                'actions': [
                    'Increase inventory orders by 10-15%',
                    'Prepare additional storage capacity',
                    'Brief customer service on expected volume increase'
                ]
            })
        else:
            action_plan.append({
                'timeframe': 'Short-term (Next 30 Days)',
                'actions': [
                    'Maintain current inventory levels',
                    'Focus on inventory turnover optimization',
                    'Review pricing strategy'
                ]
            })
        
        # Long-term actions
        action_plan.append({
            'timeframe': 'Long-term (Next Quarter)',
            'actions': [
                'Implement continuous forecast monitoring',
                'Develop contingency plans for forecast deviations',
                'Invest in data quality improvements for better future forecasts'
            ]
        })
        
        return action_plan
    
    def _translate_metrics_to_kpis(self, metrics: Dict) -> Dict:
        """
        Translate technical metrics to business KPIs
        """
        kpis = {}
        
        for metric_key, metric_value in metrics.items():
            if metric_key in self.METRIC_TRANSLATIONS:
                translation = self.METRIC_TRANSLATIONS[metric_key]
                
                # Calculate KPI value
                if translation.get('invert'):
                    kpi_value = 100 - float(metric_value)
                else:
                    kpi_value = float(metric_value)
                
                if translation['format'] == 'percentage':
                    kpi_value = min(100, max(0, kpi_value))  # Clamp to 0-100
                
                kpis[translation['name']] = {
                    'value': kpi_value,
                    'format': translation['format'],
                    'description': translation['description'],
                    'rating': self._get_kpi_rating(metric_key, kpi_value)
                }
        
        return kpis
    
    # Helper methods
    
    def _get_target_column(self, df: pd.DataFrame) -> str:
        """Identify the target column (sales/quantity)"""
        for col in ['quantity', 'sales', 'units', 'amount']:
            if col in df.columns:
                return col
        return df.columns[-1] if len(df.columns) > 0 else 'value'
    
    def _create_headline(self, growth_rate: float, total: float, accuracy: float) -> str:
        """Create executive headline"""
        direction = "growth" if growth_rate > 0 else "decline"
        return f"Forecast predicts {abs(growth_rate):.1f}% {direction} with {accuracy:.0f}% confidence"
    
    def _determine_confidence_level(self, metrics: Dict) -> str:
        """Determine confidence level from metrics"""
        accuracy = 100 - metrics.get('mape', 100)
        if accuracy >= 95:
            return "Very High"
        elif accuracy >= 90:
            return "High"
        elif accuracy >= 85:
            return "Medium"
        else:
            return "Low"
    
    def _get_accuracy_rating(self, accuracy: float) -> str:
        """Convert accuracy to rating"""
        if accuracy >= 95:
            return "Excellent"
        elif accuracy >= 90:
            return "Very Good"
        elif accuracy >= 85:
            return "Good"
        elif accuracy >= 80:
            return "Fair"
        else:
            return "Needs Improvement"
    
    def _describe_revenue_impact(self, delta_pct: float) -> str:
        """Describe revenue impact in business terms"""
        if abs(delta_pct) < 5:
            return "Minimal change expected - maintain current strategy"
        elif delta_pct > 0:
            if delta_pct > 20:
                return "Significant growth opportunity - scale operations accordingly"
            else:
                return "Moderate growth expected - prepare for increased demand"
        else:
            if delta_pct < -20:
                return "Substantial decline projected - implement corrective measures immediately"
            else:
                return "Slight decline expected - optimize costs and explore new opportunities"
    
    def _analyze_trend(self, predictions: np.ndarray) -> str:
        """Analyze overall trend direction"""
        # Simple linear regression slope
        x = np.arange(len(predictions))
        slope = np.polyfit(x, predictions, 1)[0]
        
        if slope > predictions.mean() * 0.01:
            return "increasing"
        elif slope < -predictions.mean() * 0.01:
            return "decreasing"
        else:
            return "stable"
    
    def _detect_seasonality(self, predictions: np.ndarray) -> bool:
        """Simple seasonality detection"""
        if len(predictions) < 14:
            return False
        
        # Check for weekly pattern (assuming daily data)
        weekly_variance = np.var([predictions[i::7].mean() for i in range(min(7, len(predictions)))])
        overall_variance = np.var(predictions)
        
        return weekly_variance > overall_variance * 0.3
    
    def _get_kpi_rating(self, metric_key: str, value: float) -> str:
        """Get rating for KPI value"""
        if metric_key == 'mape':
            accuracy = 100 - value
            return self._get_accuracy_rating(accuracy)
        elif metric_key == 'r2':
            if value >= 0.9:
                return "Excellent"
            elif value >= 0.8:
                return "Very Good"
            elif value >= 0.7:
                return "Good"
            else:
                return "Fair"
        return "N/A"
