"""
External Enrichment Service - Identifies opportunities to enhance data with external factors.

Part of Phase 3: Missing Data Handling & Enrichment.
detects: Potential for Holiday, Weather, or Economic data integration.
"""

from typing import Dict, List, Any
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class ExternalEnricher:
    """
    Analyzes dataset to suggest external data enrichments.
    """
    
    ENRICHMENTS = {
        'US Holidays': {
            'required_cols': ['date|timestamp'],
            'description': 'US Federal Holidays (New Year, Christmas, etc.)',
            'benefit': 'Explains demand spikes/drops around major holidays.'
        },
        'Weather Data': {
            'required_cols': ['date|timestamp', 'zip|city|state|store_id|location'],
            'description': 'Temperature, Precipitation, and Wind',
            'benefit': 'Crucial for seasonal products (ice cream, umbrellas).'
        },
         'Macroeconomic Indicators': {
            'required_cols': ['date|timestamp'],
            'description': 'CPI, Inflation, Unemployment Rate',
            'benefit': 'Helps adjust for long-term economic trends.'
        }
    }

    def detect_opportunities(self, df: pd.DataFrame) -> List[Dict[str, str]]:
        """
        Scan dataframe columns to see which enrichments are possible.
        """
        columns = [str(c).lower().strip() for c in df.columns]
        logger.info(f"ExternalEnricher scanning columns: {columns}")
        opportunities = []

        for name, info in self.ENRICHMENTS.items():
            if self._has_required_columns(columns, info['required_cols']):
                logger.info(f"Enrichment opportunity found: {name}")
                opportunities.append({
                    'title': name,
                    'description': info['description'],
                    'benefit': info['benefit']
                })
            else:
                logger.info(f"Enrichment {name} missing requirements: {info['required_cols']}")
        
        return opportunities

    def _has_required_columns(self, columns: List[str], required_patterns: List[str]) -> bool:
        """
        Check if all required column patterns for an enrichment are present.
        """
        import re
        for pattern in required_patterns:
            regex = re.compile(pattern, re.IGNORECASE)
            if not any(regex.search(col) for col in columns):
                return False
        return True
