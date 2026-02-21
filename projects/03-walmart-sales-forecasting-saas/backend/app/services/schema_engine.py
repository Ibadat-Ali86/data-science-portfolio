import re
from typing import List, Dict, Any, Tuple
from difflib import SequenceMatcher

class SchemaEngine:
    """
    Intelligent Schema Detection Engine
    Uses fuzzy matching, pattern recognition, and heuristics to map raw columns 
    to the system's required schema (Date, Product, Quantity, etc.).
    """

    # known variations for standard columns
    # This dictionary maps our internal standard keys to a list of potential raw CSV headers
    COLUMN_SYNONYMS = {
        'date': [
            'date', 'timestamp', 'year', 'month', 'day', 'time', 'period', 'week', 
            'dt', 'forecast_date', 'trans_date', 'transaction_date'
        ],
        'product_id': [
            'product_id', 'product', 'sku', 'item', 'item_id', 'material', 
            'part_number', 'supplier', 'stock_code', 'model'
        ],
        'quantity': [
            'quantity', 'qty', 'units', 'volume', 'sales_qty', 'sold', 
            'demand', 'consumption', 'retail_sales', 'sales_units'
        ],
        'price': [
            'price', 'cost', 'amount', 'value', 'revenue', 'sales', 
            'sales_amount', 'retail_transfer', 'msp', 'total_sales'
        ],
        'category': [
            'category', 'group', 'family', 'segment', 'class', 'department', 
            'type', 'line'
        ],
        'store': [
            'store', 'location', 'warehouse', 'branch', 'site', 'region', 
            'depot', 'outlet'
        ]
    }

    REQUIRED_FIELDS = ['date', 'product_id', 'quantity']

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text for comparison: lower case, remove special chars."""
        if not isinstance(text, str):
            return str(text)
        return re.sub(r'[^a-z0-9]', '', text.lower())

    @staticmethod
    def calculate_similarity(a: str, b: str) -> float:
        """Return similarity ratio between two strings (0.0 to 1.0)."""
        return SequenceMatcher(None, a, b).ratio()

    def analyze_columns(self, raw_columns: List[str]) -> Dict[str, Any]:
        """
        Analyze raw columns and return a suggested mapping with confidence scores.
        """
        normalized_raw = {col: self.normalize_text(col) for col in raw_columns}
        
        mapping = {}
        confidence_scores = {}
        used_columns = set()

        # Pass 1: Exact Matches (High Priority)
        for standard_field, synonyms in self.COLUMN_SYNONYMS.items():
            for raw_col, norm_col in normalized_raw.items():
                if raw_col in used_columns:
                    continue
                
                # Check for exact match against normalized synonyms
                for synonym in synonyms:
                    if norm_col == self.normalize_text(synonym):
                        mapping[standard_field] = raw_col
                        confidence_scores[standard_field] = 100.0
                        used_columns.add(raw_col)
                        break # Move to next standard field
                
                if standard_field in mapping:
                    break # Found a match for this field, move to next standard field

        # Pass 2: Fuzzy Matches (Lower Priority)
        for standard_field, synonyms in self.COLUMN_SYNONYMS.items():
            if standard_field in mapping:
                continue # Already mapped in Pass 1

            best_match = None
            best_score = 0.0

            for raw_col, norm_col in normalized_raw.items():
                if raw_col in used_columns:
                    continue
                
                for synonym in synonyms:
                    similarity = self.calculate_similarity(norm_col, self.normalize_text(synonym))
                    # Boost score if substring match (e.g. 'sales_qty' contains 'qty')
                    if self.normalize_text(synonym) in norm_col:
                        similarity = max(similarity, 0.85)
                    
                    score = similarity * 100
                    if score > best_score:
                        best_score = score
                        best_match = raw_col

            # Assign if confidence is high enough (Raised threshold to 60)
            if best_match and best_score > 60: 
                mapping[standard_field] = best_match
                confidence_scores[standard_field] = round(best_score, 1)
                used_columns.add(best_match)

        # Calculate Overall Confidence
        required_found = sum(1 for f in self.REQUIRED_FIELDS if f in mapping)
        total_required = len(self.REQUIRED_FIELDS)
        
        # Base confidence on how many required fields were found
        completeness_score = (required_found / total_required) * 100
        
        # Adjust by average confidence of the mapped fields
        if mapping:
            avg_match_quality = sum(confidence_scores.values()) / len(confidence_scores)
        else:
            avg_match_quality = 0
            
        overall_confidence = (completeness_score * 0.7) + (avg_match_quality * 0.3)

        detected_domain = self._detect_domain(mapping)

        return {
            "mapped_schema": mapping,
            "confidence_scores": confidence_scores,
            "overall_confidence": round(overall_confidence, 1),
            "missing_required": [f for f in self.REQUIRED_FIELDS if f not in mapping],
            "domain": detected_domain
        }

    def _detect_domain(self, mapping: Dict[str, str]) -> str:
        """Heuristic to detect data domain based on found columns."""
        keys = mapping.keys()
        
        if 'store' in keys or 'category' in keys:
            return "Retail / Supply Chain"
        if 'price' in keys and 'quantity' in keys:
            return "Sales Transaction"
        
        return "Generic Time-Series"

schema_engine = SchemaEngine()
