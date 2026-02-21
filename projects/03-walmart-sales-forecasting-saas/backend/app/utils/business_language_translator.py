"""
Business Language Translator
Converts technical gaps and limitations into executive-friendly business language
"""

import logging
from typing import Dict, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class BusinessTranslation:
    """Business-friendly translation of a technical gap/limitation"""
    technical: str           # Technical description
    business: str           # Business-friendly explanation
    strategic_action: str   # Recommended action
    expected_impact: str    # Expected business impact
    investment_level: str   # Low/Medium/High
    timeline: str          # Implementation timeline
    roi_category: str      # High/Medium/Low ROI


class BusinessLanguageTranslator:
    """
    Translates technical data gaps and limitations into business opportunities
    and strategic recommendations
    
    Key Principles:
    - Never apologize for data gaps - frame as opportunities
    - Quantify impact when possible (industry benchmarks)
    - Provide specific, actionable recommendations
    - Use active voice and executive language
    """
    
    def __init__(self):
        # Domain-agnostic gap translations
        self.gap_translations = {
            'missing_pricing_data': {
                'technical': 'Price column not found in dataset',
                'business': 'Opportunity to implement dynamic pricing analytics. Current analysis focuses on volume trends; price elasticity modeling will be available upon integration of pricing data.',
                'action': 'Integrate pricing data from billing systems to unlock revenue optimization insights',
                'impact': 'Potential 10-15% revenue uplift through optimized pricing strategies (industry benchmark)',
                'investment': 'Low',
                'timeline': '30-60 days',
                'roi': 'High'
            },
            'missing_customer_segment': {
                'technical': 'Customer segment/category column not detected',
                'business': 'Customer segmentation strategy recommended. Personalized targeting analysis currently unavailable; segmentation could improve conversion rates by 15-25% based on industry benchmarks.',
                'action': 'Develop customer taxonomy and integrate segmentation data',
                'impact': 'Improved targeting accuracy, estimated 20% increase in campaign ROI',
                'investment': 'Medium',
                'timeline': '60-90 days',
                'roi': 'High'
            },
            'short_time_series': {
                'technical': 'Insufficient historical data points (<24 months for optimal forecasting)',
                'business': 'Early-stage growth pattern detected. Current analysis identifies immediate trends and patterns; mature forecasting capabilities will develop as data history extends beyond 24 months.',
                'action': 'Continue systematic data collection to enable long-term strategic forecasting',
                'impact': 'Enhanced strategic planning accuracy, reduced risk in long-term decisions',
                'investment': 'Low',
                'timeline': 'Ongoing (passive)',
                'roi': 'High'
            },
            'low_data_quality': {
                'technical': 'High missing value ratio (>30% incomplete records)',
                'business': 'Data governance initiative recommended. Current insights are directional; establishing data quality standards will improve decision-making confidence from {current}% to 90%+.',
                'action': 'Implement data validation protocols at point of entry',
                'impact': 'Improved analytical accuracy, reduced decision-making risk',
                'investment': 'Medium',
                'timeline': '90 days',
                'roi': 'Medium'
            },
            'using_proxy_column': {
                'technical': 'Original column replaced with statistical proxy calculation',
                'business': 'Analysis utilizes industry-standard approximation methods for {column}. Results are directional with ±{accuracy}% variance; validation against actuals recommended before major strategic decisions.',
                'action': 'Collect primary {column} data to replace proxy estimates',
                'impact': 'Increased forecast accuracy by {improvement}%, enhanced confidence in decisions',
                'investment': 'Low',
                'timeline': '30 days',
                'roi': 'Medium'
            },
            'missing_date_column': {
                'technical': 'Date/timestamp column not detected',
                'business': 'Temporal analysis currently unavailable. Adding date information will unlock trend forecasting, seasonality detection, and predictive capabilities.',
                'action': 'Include transaction date or event timestamp in future data exports',
                'impact': 'Unlock predictive analytics, proactive planning capabilities',
                'investment': 'Low',
                'timeline': '14 days',
                'roi': 'High'
            },
            'insufficient_variance': {
                'technical': 'Low variance in key metrics indicates limited pattern diversity',
                'business': 'Stable operational environment detected. While current metrics show consistency, expanding data collection to capture more variables will reveal optimization opportunities.',
                'action': 'Expand data collection to include additional operational metrics',
                'impact': 'Uncover hidden optimization opportunities, identify inefficiencies',
                'investment': 'Low',
                'timeline': '30 days',
                'roi': 'Medium'
            },
            'missing_geographic_data': {
                'technical': 'Location/region column not found',
                'business': 'Geographic analysis and regional optimization currently unavailable. Market expansion analysis could reveal high-ROI territories.',
                'action': 'Integrate location data for regional performance analysis',
                'impact': 'Identify high-performing regions, optimize market allocation',
                'investment': 'Low',
                'timeline': '30 days',
                'roi': 'High'
            }
        }
        
        # Domain-specific translations
        self.domain_translations = self._build_domain_translations()
    
    def _build_domain_translations(self) -> Dict:
        """Build domain-specific translation libraries"""
        return {
            'sales_forecast': {
                'missing_product_hierarchy': {
                    'technical': 'Product category/hierarchy not detected',
                    'business': 'Product portfolio optimization analysis currently limited. Category-level insights could identify 20-30% revenue concentration in top performers.',
                    'action': 'Implement product taxonomy for SKU-level and category-level forecasting',
                    'impact': 'Optimized inventory allocation, reduced stockouts by 15-25%',
                    'investment': 'Low',
                    'timeline': '30 days',
                    'roi': 'High'
                },
                'missing_promotion_flag': {
                    'technical': 'Promotion/discount indicator not found',
                    'business': 'Promotional effectiveness analysis unavailable. Quantifying promotion ROI could optimize marketing spend by 10-20%.',
                    'action': 'Tag promotional periods in sales data',
                    'impact': 'Data-driven promotion planning, improved ROI',
                    'investment': 'Low',
                    'timeline': '14 days',
                    'roi': 'High'
                }
            },
            'hr_analytics': {
                'missing_termination_reason': {
                    'technical': 'Employee exit reason not tracked',
                    'business': 'Retention strategy currently reactive. Understanding attrition drivers could reduce turnover costs by 20-35%.',
                    'action': 'Implement structured exit interview process with categorization',
                    'impact': 'Reduced replacement costs ($50K-150K per role), improved retention',
                    'investment': 'Low',
                    'timeline': '30 days',
                    'roi': 'High'
                },
                'missing_performance_ratings': {
                    'technical': 'Performance score/rating column not found',
                    'business': 'Talent optimization analysis unavailable. Performance tracking enables data-driven succession planning and identifies high-potential employees.',
                    'action': 'Implement consistent performance evaluation framework',
                    'impact': 'Improved talent development, reduced mis-hires',
                    'investment': 'Medium',
                    'timeline': '90 days',
                    'roi': 'High'
                }
            },
            'marketing_analytics': {
                'missing_channel_data': {
                    'technical': 'Marketing channel/source not tracked',
                    'business': 'Channel attribution analysis unavailable. Multi-touch attribution could optimize marketing budget allocation and improve CAC by 15-30%.',
                    'action': 'Implement UTM tracking and channel tagging across all campaigns',
                    'impact': 'Optimized budget allocation, 20-30% improvement in ROAS',
                    'investment': 'Low',
                    'timeline': '14 days',
                    'roi': 'Very High'
                },
                'missing_conversion_funnel': {
                    'technical': 'Funnel stage data (awareness → conversion) not captured',
                    'business': 'Conversion optimization currently limited. Funnel analysis identifies bottlenecks that typically improve conversion by 25-50%.',
                    'action': 'Implement event tracking across customer journey',
                    'impact': 'Identify and fix conversion leaks, substantial revenue uplift',
                    'investment': 'Medium',
                    'timeline': '30-60 days',
                    'roi': 'Very High'
                }
            },
            'financial_metrics': {
                'missing_cost_breakdown': {
                    'technical': 'Cost category breakdown not available',
                    'business': 'Cost optimization analysis limited. Detailed cost taxonomy typically reveals 10-15% savings opportunities.',
                    'action': 'Implement chart of accounts with granular cost categorization',
                    'impact': 'Identified cost reduction opportunities, improved EBITDA margins',
                    'investment': 'Low',
                    'timeline': '30 days',
                    'roi': 'High'
                }
            },
            'inventory_management': {
                'missing_supplier_lead_time': {
                    'technical': 'Supplier lead time data not tracked',
                    'business': 'Supply chain optimization currently reactive. Lead time analysis reduces stockouts by 20-40% and inventory holding costs by 15%.',
                    'action': 'Track supplier performance metrics including lead times',
                    'impact': 'Reduced stockouts, optimized safety stock levels',
                    'investment': 'Low',
                    'timeline': '30 days',
                    'roi': 'High'
                }
            }
        }
    
    def translate_gap(
        self,
        gap_type: str,
        domain: str = 'generic',
        context: Optional[Dict] = None
    ) -> BusinessTranslation:
        """
        Translate a technical gap into business language
        
        Args:
            gap_type: Type of gap (e.g., 'missing_pricing_data')
            domain: Business domain (e.g., 'sales_forecast')
            context: Additional context for customization
            
        Returns:
            BusinessTranslation with business-friendly messaging
        """
        # Check domain-specific translations first
        if domain in self.domain_translations:
            if gap_type in self.domain_translations[domain]:
                translation = self.domain_translations[domain][gap_type]
                return self._create_translation(translation, context)
        
        # Fall back to generic translations
        if gap_type in self.gap_translations:
            translation = self.gap_translations[gap_type]
            return self._create_translation(translation, context)
        
        # Default generic translation
        return self._create_generic_translation(gap_type, context)
    
    def _create_translation(
        self,
        translation_dict: Dict,
        context: Optional[Dict] = None
    ) -> BusinessTranslation:
        """Create BusinessTranslation from dictionary with context substitution"""
        
        # Substitute context variables
        if context:
            for key in ['business', 'action', 'impact']:
                if key in translation_dict:
                    for ctx_key, ctx_val in context.items():
                        translation_dict[key] = translation_dict[key].replace(
                            f'{{{ctx_key}}}',
                            str(ctx_val)
                        )
        
        return BusinessTranslation(
            technical=translation_dict['technical'],
            business=translation_dict['business'],
            strategic_action=translation_dict['action'],
            expected_impact=translation_dict['impact'],
            investment_level=translation_dict['investment'],
            timeline=translation_dict['timeline'],
            roi_category=translation_dict['roi']
        )
    
    def _create_generic_translation(
        self,
        gap_type: str,
        context: Optional[Dict] = None
    ) -> BusinessTranslation:
        """Create a generic translation for unknown gap types"""
        
        column_name = context.get('column_name', 'data element') if context else 'data element'
        
        return BusinessTranslation(
            technical=f'{column_name} not available in dataset',
            business=f'Analysis scope currently limited without {column_name}. Expanding data collection will enhance analytical depth and decision-making confidence.',
            strategic_action=f'Include {column_name} in future data exports for comprehensive analysis',
            expected_impact='Improved analytical completeness, enhanced insight quality',
            investment_level='Low',
            timeline='30 days',
            roi_category='Medium'
        )
    
    def translate_multiple_gaps(
        self,
        gaps: List[Dict],
        domain: str = 'generic'
    ) -> List[BusinessTranslation]:
        """
        Translate multiple gaps into business language
        
        Args:
            gaps: List of gap dictionaries from GapAnalysisEngine
            domain: Business domain
            
        Returns:
            List of BusinessTranslation objects
        """
        translations = []
        
        for gap in gaps:
            gap_type = self._infer_gap_type(gap)
            context = {
                'column': gap.get('missing_column', 'unknown'),
                'current': gap.get('confidence', 50),
                'accuracy': gap.get('proxy_accuracy', 85),
                'improvement': 100 - gap.get('confidence', 50)
            }
            
            translation = self.translate_gap(gap_type, domain, context)
            translations.append(translation)
        
        return translations
    
    def _infer_gap_type(self, gap: Dict) -> str:
        """Infer gap type from gap dictionary"""
        missing_col = gap.get('missing_column', '').lower()
        
        # Pattern matching to identify common gap types
        if 'price' in missing_col or 'cost' in missing_col:
            return 'missing_pricing_data'
        elif 'segment' in missing_col or 'category' in missing_col or 'class' in missing_col:
            return 'missing_customer_segment'
        elif 'date' in missing_col or 'time' in missing_col:
            return 'missing_date_column'
        elif 'location' in missing_col or 'region' in missing_col or 'geo' in missing_col:
            return 'missing_geographic_data'
        elif gap.get('action_type') == 'user_confirm':
            return 'using_proxy_column'
        elif gap.get('gap_type') == 'wrong_granularity':
            return 'short_time_series'
        elif 'quality' in str(gap.get('suggestion', '')).lower():
            return 'low_data_quality'
        else:
            return 'generic_gap'
