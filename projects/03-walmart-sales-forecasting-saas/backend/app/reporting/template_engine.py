"""
Report Template Engine
Jinja2-based template system for confidence-level reports
"""

import logging
from typing import Dict, Optional, List
from jinja2 import Environment, FileSystemLoader, select_autoescape
from datetime import datetime
import uuid
import os

from app.reporting.design_tokens import ReportDesignTokens

logger = logging.getLogger(__name__)


class ReportTemplateEngine:
    """
    Template engine for generating HTML reports from analysis results
    
    Supports 3 confidence-level templates:
    - High Confidence: Complete data, strong statistical power
    - Medium Confidence: Minor gaps, proxy usage
    - Exploratory: Limited data, pattern discovery
    """
    
    def __init__(self):
        # Setup Jinja2 environment
        template_dir = os.path.join(
            os.path.dirname(__file__),
            'templates'
        )
        
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
        
        # Register custom filters
        self.env.filters['format_number'] = self._format_number
        self.env.filters['format_percent'] = self._format_percent
        self.env.filters['format_currency'] = self._format_currency
        self.env.filters['format_date'] = self._format_date
        
        # Design tokens
        self.design = ReportDesignTokens()
    
    def render_report(
        self,
        template_type: str,  # 'high_confidence', 'medium_confidence', 'exploratory'
        data: Dict,
        customization: Optional[Dict] = None
    ) -> str:
        """
        Render HTML report from template
        
        Args:
            template_type: Template to use
            data: Report data dictionary
            customization: Optional customization settings
            
        Returns:
            Rendered HTML string
        """
        logger.info(f"Rendering {template_type} report")
        
        # Load template
        template_file = f"{template_type}.html"
        template = self.env.get_template(template_file)
        
        # Prepare context
        context = self._prepare_context(data, customization)
        
        # Render
        html = template.render(**context)
        
        logger.info(f"Report rendered successfully ({len(html)} chars)")
        return html
    
    def _prepare_context(
        self,
        data: Dict,
        customization: Optional[Dict] = None
    ) -> Dict:
        """Prepare template context with all required variables"""
        
        # Base context
        context = {
            'report_id': str(uuid.uuid4()),
            'timestamp': datetime.now(),
            'css': self.design.get_css(),
            'design': self.design,
            
            # Analysis data
            'domain': data.get('domain', 'Unknown'),
            'domain_name': self._get_domain_name(data.get('domain', '')),
            'confidence': data.get('confidence', {}),
            'matched_columns': data.get('matched_columns', {}),
            'gaps': data.get('gaps', []),
            'forecast': data.get('forecast', {}),
            'insights': data.get('insights', []),
            'recommendations': data.get('recommendations', []),
            'limitations': data.get('limitations', []),
            'strengths': data.get('strengths', []),
            
            # Business translations
            'business_narrative': data.get('business_narrative', {}),
            'gap_translations': data.get('gap_translations', []),
            
            # Charts (as base64 or paths)
            'charts': data.get('charts', {}),
            
            # KPIs
            'kpis': data.get('kpis', []),
            
            # Customization
            'show_technical_details': customization.get('show_technical_details', True) if customization else True,
            'include_raw_data': customization.get('include_raw_data', False) if customization else False,
            'company_logo': customization.get('company_logo') if customization else None,
            'company_name': customization.get('company_name', 'ForecastAI') if customization else 'ForecastAI',
        }
        
        return context
    
    def _get_domain_name(self, domain: str) -> str:
        """Get human-friendly domain name"""
        domain_names = {
            'sales_forecast': 'Sales Forecasting',
            'hr_analytics': 'HR Analytics',
            'financial_metrics': 'Financial Metrics',
            'inventory_management': 'Inventory Management',
            'marketing_analytics': 'Marketing Analytics',
            'generic': 'Generic Time Series'
        }
        return domain_names.get(domain, domain.replace('_', ' ').title())
    
    @staticmethod
    def _format_number(value: float, decimals: int = 2) -> str:
        """Format number with thousands separator"""
        try:
            if value >= 1_000_000:
                return f"{value / 1_000_000:.{decimals}f}M"
            elif value >= 1_000:
                return f"{value / 1_000:.{decimals}f}K"
            else:
                return f"{value:.{decimals}f}"
        except:
            return str(value)
    
    @staticmethod
    def _format_percent(value: float, decimals: int = 1) -> str:
        """Format as percentage"""
        try:
            return f"{value:.{decimals}f}%"
        except:
            return str(value)
    
    @staticmethod
    def _format_currency(value: float, currency: str = '$', decimals: int = 2) -> str:
        """Format as currency"""
        try:
            if value >= 1_000_000:
                return f"{currency}{value / 1_000_000:.{decimals}f}M"
            elif value >= 1_000:
                return f"{currency}{value / 1_000:.{decimals}f}K"
            else:
                return f"{currency}{value:,.{decimals}f}"
        except:
            return f"{currency}{value}"
    
    @staticmethod
    def _format_date(value, format: str = '%B %d, %Y') -> str:
        """Format datetime"""
        try:
            if isinstance(value, str):
                value = datetime.fromisoformat(value)
            return value.strftime(format)
        except:
            return str(value)
