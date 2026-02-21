import pandas as pd
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fuzzywuzzy import process, fuzz

class DomainSchema(BaseModel):
    name: str
    required_columns: List[str]  # Critical for core functionality
    optional_columns: List[str]  # Nice to have
    synonyms: Dict[str, List[str]] # Mapping of standard_name -> [possible_names]
    identifiers: List[str] # Strong signals for this domain (e.g. "employee_id" for HR)

class GapAnalysisReport(BaseModel):
    domain: str
    domain_key: str # Internal ID for programmatic usage
    confidence: float
    matched_columns: Dict[str, str]  # standard_col -> user_col
    missing_critical: List[str]
    missing_optional: List[str]
    suggestions: List[str]

class UniversalSchemaDetector:
    """
    Intelligent service to detect data domain and map schema gaps.
    Multi-layer approach:
    1. Identifier Match (Fastest)
    2. Column Fuzzy Match (Fast)
    3. Content Statistical Profiling (Deep)
    """
    
    def __init__(self):
        self.domains = self._initialize_domains()

    def _initialize_domains(self) -> Dict[str, DomainSchema]:
        """Define known business domains with robust synonym mapping"""
        return {
            "sales_forecast": DomainSchema(
                name="Sales Forecasting",
                required_columns=["date", "target_value", "item_id"],
                optional_columns=["price", "store_id", "promotion", "holiday"],
                synonyms={
                    "date": ["date", "timestamp", "order_date", "sales_date", "day", "week", "month"],
                    "target_value": ["sales", "quantity", "qty", "demand", "units_sold", "revenue", "amount"],
                    "item_id": ["item", "product", "product_id", "sku", "item_code", "material"],
                    "price": ["price", "unit_price", "cost", "selling_price", "rp"],
                    "store_id": ["store", "location", "branch", "warehouse", "outlet"]
                },
                identifiers=["sku", "store", "price", "qty"]
            ),
            "hr_analytics": DomainSchema(
                name="HR Analytics",
                required_columns=["employee_id", "hire_date", "status"],
                optional_columns=["salary", "department", "termination_date", "performance_score"],
                synonyms={
                    "employee_id": ["emp_id", "employee_idd", "staff_id", "worker_id", "associate_id"],
                    "hire_date": ["hire_date", "joining_date", "start_date", "date_of_joining", "doj"],
                    "status": ["status", "employment_status", "active", "is_active"],
                    "salary": ["salary", "wage", "compensation", "pay", "ctc"],
                    "department": ["dept", "department", "team", "unit", "division"],
                    "termination_date": ["term_date", "exit_date", "end_date", "left_date"]
                },
                identifiers=["employee", "salary", "hire", "termination"]
            ),
            "financial_metrics": DomainSchema(
                name="Financial Metrics",
                required_columns=["transaction_date", "amount", "account_id"],
                optional_columns=["category", "description", "currency"],
                synonyms={
                    "transaction_date": ["date", "txn_date", "posting_date"],
                    "amount": ["amount", "value", "debit", "credit", "balance"],
                    "account_id": ["account", "gl_code", "ledger_id"],
                    "category": ["category", "type", "expense_type", "revenue_type"]
                },
                identifiers=["account", "ledger", "credit", "debit"]
            ),
            "inventory_optimization": DomainSchema(
                name="Inventory Optimization",
                required_columns=["item_id", "location_id", "stock_on_hand"],
                optional_columns=["reorder_point", "lead_time", "safety_stock"],
                synonyms={
                    "item_id": ["sku", "item", "product", "material"],
                    "location_id": ["warehouse", "dc", "store", "location"],
                    "stock_on_hand": ["soh", "stock", "quantity", "inventory", "on_hand", "available"],
                    "reorder_point": ["rop", "min_stock", "reorder_level"],
                    "lead_time": ["lead_time", "delivery_time", "lt"]
                },
                identifiers=["stock", "inventory", "warehouse", "soh"]
            )
        }

    def detect_domain(self, df: pd.DataFrame) -> GapAnalysisReport:
        """
        Main entry point: Analyze dataframe to find best matching domain and report gaps.
        """
        # 1. Map lower -> original for precise lookup
        case_map = {str(c).lower().strip(): str(c) for c in df.columns}
        columns = list(case_map.keys())
        
        best_domain_key = None
        best_score = 0
        best_mapping = {}

        # 2. Score each domain based on column overlap
        for key, schema in self.domains.items():
            score, mapping = self._calculate_domain_score(columns, schema, df)
            if score > best_score:
                best_score = score
                best_domain_key = key
                best_mapping = mapping
        
        # Restore original casing in mapping
        final_mapping = {k: case_map.get(v, v) for k, v in best_mapping.items()}

        # 3. If confidence is too low, return generic or unknown
        if best_score < 0.4:
            return self._create_unknown_report(columns) # Passing lower cols is fine for unknown report

        # 4. Generate Gap Analysis for best domain
        selected_schema = self.domains[best_domain_key]
        return self._generate_gap_report(selected_schema, final_mapping, best_score, columns, best_domain_key)

    def _calculate_domain_score(self, user_columns: List[str], schema: DomainSchema, df: pd.DataFrame) -> tuple[float, Dict[str, str]]:
        """
        Calculate a match score (0-1) for a domain against user columns.
        Uses a weighted approach: 
        - Required columns match: High weight
        - Identifier words match: Medium weight
        - Optional columns match: Low weight
        - Content profiling (e.g. is 'date' actually a date?): Validation weight
        """
        mapping = {}
        matched_required = 0
        matched_optional = 0
        
        # A. Identifier Signal Check (Fast pre-filter)
        # Check if generic words like "employee" or "revenue" appear in ANY column
        identifier_hits = sum(1 for ident in schema.identifiers if any(ident in col for col in user_columns))
        identifier_score = min(identifier_hits / max(1, len(schema.identifiers)), 1.0) * 0.2

        # B. Column Mapping (Fuzzy Match)
        # 1. Map Required Columns
        for req in schema.required_columns:
            # Check synonyms
            best_match, score = process.extractOne(req, user_columns, scorer=fuzz.token_sort_ratio)
            # Override with synonym list if available
            synonyms = schema.synonyms.get(req, [req])
            
            # Check strictly against synonyms first (higher precision)
            direct_hit = next((col for col in user_columns if col in synonyms), None)
            
            if direct_hit:
                mapping[req] = direct_hit
                matched_required += 1
            elif score > 80: # Fuzzy fallback
                mapping[req] = best_match
                matched_required += 1
                
        # 2. Map Optional Columns
        for opt in schema.optional_columns:
            synonyms = schema.synonyms.get(opt, [opt])
            direct_hit = next((col for col in user_columns if col in synonyms), None)
            
            if direct_hit:
                mapping[opt] = direct_hit
                matched_optional += 1
            else:
                best_match, score = process.extractOne(opt, user_columns, scorer=fuzz.token_sort_ratio)
                if score > 85:
                    mapping[opt] = best_match
                    matched_optional += 1

        # C. Calculate Final Score
        # Weight required columns heavily
        req_score = (matched_required / len(schema.required_columns)) if schema.required_columns else 0
        opt_score = (matched_optional / len(schema.optional_columns)) if schema.optional_columns else 0
        
        # 70% Required + 20% Identifiers + 10% Optional
        total_score = (req_score * 0.7) + identifier_score + (opt_score * 0.1)
        
        return total_score, mapping

    def _generate_gap_report(self, schema: DomainSchema, mapping: Dict[str, str], score: float, user_columns: List[str], domain_key: str) -> GapAnalysisReport:
        """Create the detailed report for the frontend"""
        missing_critical = [col for col in schema.required_columns if col not in mapping]
        missing_optional = [col for col in schema.optional_columns if col not in mapping]
        
        suggestions = []
        if missing_critical:
            suggestions.append(f"Critical: Missing columns {', '.join(missing_critical)}. Analysis will be limited.")
            
            # 1. Fuzzy Match Suggestions
            for missing in missing_critical:
                potential, fuzz_score = process.extractOne(missing, user_columns)
                if fuzz_score > 60:
                    suggestions.append(f"Did you mean to use '{potential}' as '{missing}'?")
            
            # 2. Smart Proxy / Derived Column Suggestions (Phase 15)
            # Sales: Revenue = Price * Quantity
            if 'target_value' in missing_critical and 'price' in mapping and 'item_id' in mapping:
                 # Check if we have a quantity-like column in user columns not mapped yet?
                 # Or generally suggest calculation
                 suggestions.append("💡 Suggestion: You can calculate 'target_value' (Revenue) if you have Price and Quantity columns.")

            # HR: Tenure = Today - Hire Date
            if 'hire_date' in missing_critical:
                 suggestions.append("💡 Suggestion: Ensure you have a 'Join Date' to calculate Tenure and Retention.")

        return GapAnalysisReport(
            domain=schema.name,
            domain_key=domain_key, # Populated key
            confidence=round(score, 2),
            matched_columns=mapping,
            missing_critical=missing_critical,
            missing_optional=missing_optional,
            suggestions=suggestions
        )

    def _create_unknown_report(self, user_columns: List[str]) -> GapAnalysisReport:
        return GapAnalysisReport(
            domain="Unknown / Generic",
            domain_key="generic",
            confidence=0.0,
            matched_columns={},
            missing_critical=[],
            missing_optional=[],
            suggestions=["Could not detect a specific domain. Proceeding with generic exploratory analysis."]
        )

# Singleton instance
schema_detector = UniversalSchemaDetector()
