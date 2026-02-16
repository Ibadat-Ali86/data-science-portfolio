from typing import Dict, List, Any
import pandas as pd

class AdaptiveReportGenerator:
    """
    Generates domain-specific narrative reports.
    Uses template-based generation based on the detected domain and calculated KPIs.
    """
    
    def generate_narrative(self, domain_key: str, kpis: List[Dict], profile: Dict) -> Dict[str, Any]:
        """
        Generate a structured narrative report.
        """
        report_structure = {
            "title": "Executive Summary",
            "sections": []
        }
        
        # 1. Executive Summary Section
        summary_section = self._generate_executive_summary(domain_key, kpis)
        report_structure["sections"].append(summary_section)
        
        # 2. Key Observations (from profile)
        observations_section = self._generate_observations(profile)
        report_structure["sections"].append(observations_section)
        
        # 3. Domain Specific Recommendations
        recommendations_section = self._generate_recommendations(domain_key, kpis, profile)
        report_structure["sections"].append(recommendations_section)
        
        return report_structure

    def _generate_executive_summary(self, domain: str, kpis: List[Dict]) -> Dict:
        """Constructs a high-level summary paragraph"""
        
        # Find key metrics
        primary_kpi = kpis[0] if kpis else None
        
        text = "Analysis complete."
        if domain == 'sales_forecast':
            text = f"The sales performance analysis highlights key trends in revenue and volume."
            if primary_kpi:
                text += f" The {primary_kpi['name']} stands at {primary_kpi['value']}."
                
        elif domain == 'hr_analytics':
            text = "HR workforce analysis indicates current staffing levels and turnover risks."
            
        elif domain == 'financial_metrics':
            text = "Financial health assessment based on transaction data."
            
        return {
            "heading": "Executive Overview",
            "content": text,
            "type": "text"
        }

    def _generate_observations(self, profile: Dict) -> Dict:
        """Extracts data quality and statistical insights"""
        insights = profile.get('businessInsights', [])
        
        return {
            "heading": "Key Observations",
            "content": insights,
            "type": "list"
        }

    def _generate_recommendations(self, domain: str, kpis: List[Dict], profile: Dict) -> Dict:
        recs = []
        
        if domain == 'sales_forecast':
            recs = [
                "Focus on seasonal inventory planning for upcoming peak periods.",
                "Review underperforming product categories identified in the breakdown.",
                "Consider promotional strategies to boost average transaction value."
            ]
        elif domain == 'hr_analytics':
            recs = [
                "Investigate causes for turnover in high-risk departments.",
                "Review compensation competitiveness relative to market benchmarks.",
                "Implement engagement surveys to track employee sentiment."
            ]
        else:
             recs = [
                 "Ensure data quality by addressing missing values.",
                 "Establish regular monitoring of these key metrics.",
                 "Drill down into outliers for detailed root cause analysis."
             ]
             
        return {
            "heading": "Strategic Recommendations",
            "content": recs,
            "type": "list"
        }

report_generator = AdaptiveReportGenerator()
