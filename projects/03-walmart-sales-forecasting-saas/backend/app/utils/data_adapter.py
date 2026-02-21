"""
Universal Data Adapter - Intelligent CSV handling with fuzzy column matching
Handles 80% of common data formats without user intervention
"""

from typing import Dict, List, Tuple, Optional
import pandas as pd
import numpy as np
from fuzzywuzzy import fuzz, process
from dateutil import parser as date_parser
import re
from datetime import datetime


class DataAdapter:
    """
    Universal adapter for handling diverse CSV formats with intelligent column detection
    """
    
    # Comprehensive synonym dictionary for common column names
    COLUMN_SYNONYMS = {
        'date': [
            'date', 'datetime', 'timestamp', 'time', 'day', 'dt', 'fecha',
            'order_date', 'orderdate', 'transaction_date', 'txn_date',
            'sales_date', 'purchase_date', 'created_at', 'updated_at',
            'period', 'week', 'month', 'year', 'quarter', 'ymd', 'dmy',
            'date_time', 'event_date', 'record_date', 'data_date'
        ],
       'sales': [
            'sales', 'revenue', 'amount', 'value', 'total', 'sum', 'price',
            'sales_amount', 'sales_value', 'total_sales', 'gross_sales',
            'net_sales', 'revenue_amount', 'sales_qty', 'quantity_sold',
            'units_sold', 'items_sold', 'qty', 'quantity', 'count',
            'demand', 'volume', 'turnover', 'proceeds', 'income',
            'receipts', 'earnings', 'takings', 'ventas', 'vendas'
        ],
        'store': [
            'store', 'store_id', 'storeid', 'shop', 'outlet', 'branch',
            'location', 'store_number', 'store_code', 'shop_id',
            'branch_id', 'outlet_id', 'tienda', 'loja', 'magasin'
        ],
        'product': [
            'product', 'product_id', 'productid', 'item', 'item_id',
            'sku', 'article', 'product_code', 'item_code', 'product_name',
            'item_name', 'description', 'producto', 'produit'
        ],
        'category': [
            'category', 'cat', 'type', 'class', 'group', 'segment',
            'category_id', 'product_category', 'item_category',
            'dept', 'department', 'division', 'familia', 'categoria'
        ],
        'price': [
            'price', 'unit_price', 'unitprice', 'cost', 'rate',
            'selling_price', 'sale_price', 'list_price', 'msrp',
            'retail_price', 'precio', 'preco', 'prix'
        ],
        'customer': [
            'customer', 'customer_id', 'customerid', 'client', 'client_id',
            'user', 'user_id', 'buyer', 'shopper', 'cliente'
        ]
    }
    
    # Common date formats to try
    DATE_FORMATS = [
        '%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y',
        '%m/%d/%Y', '%m-%d-%Y', '%Y%m%d', '%d.%m.%Y',
        '%Y-%m-%d %H:%M:%S', '%Y/%m/%d %H:%M:%S',
        '%d-%m-%Y %H:%M:%S', '%d/%m/%Y %H:%M:%S',
        '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f',
        '%b %d, %Y', '%B %d, %Y', '%d %b %Y', '%d %B %Y'
    ]
    
    def __init__(self, confidence_threshold: float = 0.70):
        """
        Initialize data adapter
        
        Args:
            confidence_threshold: Minimum confidence score for column matching (0-1)
        """
        self.confidence_threshold = confidence_threshold
        self.detected_mapping = {}
        self.confidence_scores = {}
        
    def detect_columns(self, df: pd.DataFrame) -> Dict[str, Tuple[str, float]]:
        """
        Auto-detect column mappings using fuzzy matching
        
        Args:
            df: Input dataframe
            
        Returns:
            Dict mapping standard names to (detected_column, confidence_score)
        """
        detected = {}
        
        for standard_name, synonyms in self.COLUMN_SYNONYMS.items():
            best_match, confidence = self._find_best_column_match(
                df.columns.tolist(),
                synonyms
            )
            
            if best_match and confidence >= self.confidence_threshold:
                detected[standard_name] = (best_match, confidence / 100.0)
        
        self.detected_mapping = detected
        return detected
    
    def _find_best_column_match(
        self, 
        columns: List[str], 
        synonyms: List[str]
    ) -> Tuple[Optional[str], float]:
        """
        Find best matching column using fuzzy string matching
        
        Args:
            columns: Available column names
            synonyms: List of possible synonyms
            
        Returns:
            (best_match_column, confidence_score)
        """
        best_match = None
        best_score = 0
        
        for col in columns:
            col_lower = col.lower().strip()
            
            # Try exact match first
            if col_lower in [s.lower() for s in synonyms]:
                return (col, 100.0)
            
            # Fuzzy match against all synonyms
            for synonym in synonyms:
                score = fuzz.ratio(col_lower, synonym.lower())
                partial_score = fuzz.partial_ratio(col_lower, synonym.lower())
                token_score = fuzz.token_sort_ratio(col_lower, synonym.lower())
                
                # Use highest score
                max_score = max(score, partial_score, token_score)
                
                if max_score > best_score:
                    best_score = max_score
                    best_match = col
        
        return (best_match, best_score)
    
    def detect_date_column(self, df: pd.DataFrame) -> Optional[str]:
        """
        Auto-detect the date column using multiple strategies
        
        Args:
            df: Input dataframe
            
        Returns:
            Name of detected date column or None
        """
        # First try fuzzy matching
        detected = self.detect_columns(df)
        if 'date' in detected:
            return detected['date'][0]
        
        # Try each column and see if it parses as dates
        for col in df.columns:
            if self._is_date_column(df[col]):
                return col
        
        return None
    
    def _is_date_column(self, series: pd.Series, sample_size: int = 100) -> bool:
        """
        Check if a series contains date values
        
        Args:
            series: Pandas series to check
            sample_size: Number of non-null values to test
            
        Returns:
            True if series appears to be dates
        """
        # Sample non-null values
        non_null = series.dropna().head(sample_size)
        if len(non_null) == 0:
            return False
        
        # Check if already datetime
        if pd.api.types.is_datetime64_any_dtype(series):
            return True
        
        # Try parsing as dates
        parse_success = 0
        for val in non_null:
            if self._try_parse_date(str(val)):
                parse_success += 1
        
        # If >80% parse successfully, it's likely a date column
        return (parse_success / len(non_null)) > 0.8
    
    def _try_parse_date(self, date_string: str) -> bool:
        """
        Try parsing a string as a date
        
        Args:
            date_string: String to parse
            
        Returns:
            True if successfully parsed
        """
        # Try common formats first
        for fmt in self.DATE_FORMATS:
            try:
                datetime.strptime(date_string, fmt)
                return True
            except (ValueError, TypeError):
                continue
        
        # Try dateutil parser as fallback
        try:
            date_parser.parse(date_string)
            return True
        except (ValueError, TypeError, date_parser.ParserError):
            return False
    
    def parse_dates(self, df: pd.DataFrame, date_column: str) -> pd.DataFrame:
        """
        Parse date column to datetime
        
        Args:
            df: Input dataframe
            date_column: Name of date column
            
        Returns:
            DataFrame with parsed dates
        """
        if date_column not in df.columns:
            raise ValueError(f"Date column '{date_column}' not found")
        
        # Try pd.to_datetime first
        try:
            df[date_column] = pd.to_datetime(df[date_column], errors='coerce')
            return df
        except Exception:
            pass
        
        # Try each format manually
        for fmt in self.DATE_FORMATS:
            try:
                df[date_column] = pd.to_datetime(df[date_column], format=fmt)
                return df
            except (ValueError, TypeError):
                continue
        
        # Fallback to dateutil
        try:
            df[date_column] = df[date_column].apply(
                lambda x: date_parser.parse(str(x)) if pd.notna(x) else pd.NaT
            )
        except Exception as e:
            raise ValueError(f"Could not parse dates in column '{date_column}': {str(e)}")
        
        return df
    
    def detect_data_shape(self, df: pd.DataFrame) -> str:
        """
        Detect if data is in wide or long format
        
        Args:
            df: Input dataframe
            
        Returns:
            'wide' or 'long'
        """
        # Heuristic: If more columns than rows/10, likely wide format
        if len(df.columns) > len(df) / 10:
            return 'wide'
        return 'long'
    
    def transform_wide_to_long(
        self, 
        df: pd.DataFrame, 
        id_vars: List[str],
        value_name: str = 'value',
        var_name: str = 'variable'
    ) -> pd.DataFrame:
        """
        Transform wide format to long format
        
        Args:
            df: Wide format dataframe
            id_vars: Columns to keep as identifiers
            value_name: Name for value column
            var_name: Name for variable column
            
        Returns:
            Long format dataframe
        """
        return pd.melt(
            df,
            id_vars=id_vars,
            value_name=value_name,
            var_name=var_name
        )
    
    def adapt_dataframe(
        self, 
        df: pd.DataFrame,
        target_col: Optional[str] = None,
        date_col: Optional[str] = None
    ) -> Tuple[pd.DataFrame, Dict[str, any]]:
        """
        Main adaptation method - intelligently process CSV data
        
        Args:
            df: Input dataframe
            target_col: Optional target column name (if known)
            date_col: Optional date column name (if known)
            
        Returns:
            (adapted_dataframe, metadata_dict)
        """
        metadata = {
            'original_shape': df.shape,
            'detected_columns': {},
            'data_shape': 'long',
            'date_format': None,
            'issues': []
        }
        
        # Detect all significant columns
        detected = self.detect_columns(df)
        metadata['detected_columns'] = {
            k: {'column': v[0], 'confidence': v[1]}
            for k, v in detected.items()
        }
        
        # Auto-detect date column if not provided
        if not date_col:
            date_col = self.detect_date_column(df)
            if not date_col:
                metadata['issues'].append("No date column detected")
        
        # Parse dates
        if date_col:
            try:
                df = self.parse_dates(df, date_col)
                metadata['date_column'] = date_col
            except Exception as e:
                metadata['issues'].append(f"Date parsing failed: {str(e)}")
        
        # Detect data shape
        shape = self.detect_data_shape(df)
        metadata['data_shape'] = shape
        
        # Auto-detect target column if not provided
        if not target_col and 'sales' in detected:
            target_col = detected['sales'][0]
            metadata['target_column'] = target_col
        
        metadata['final_shape'] = df.shape
        metadata['column_mapping'] = detected
        
        # Calculate quality score
        from app.utils.pipeline_validator import get_data_quality_score
        metadata['quality_score'] = get_data_quality_score(df)
        
        return df, metadata

    def normalize_dataset(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
        """
        Normalize dataset for ML processing:
        - Detects and renames columns
        - Standardizes dates
        - Imputes missing values
        - Returns cleaned dataframe and transformation report
        """
        report = {'transformations': []}
        
        # 1. Column Detection & Renaming
        detected = self.detect_columns(df)
        
        # Sort detected by confidence descending to avoid collisions (best match wins)
        # detected structure: {standard_name: (original_col, confidence)}
        sorted_detected = sorted(
            detected.items(), 
            key=lambda item: item[1][1], 
            reverse=True
        )
        
        rename_map = {}
        mapped_columns = set()
        
        for standard_name, (original_col, confidence) in sorted_detected:
            # Map if original col not already mapped to a better standard name
            # And standard name not already taken (though detected keys are unique standard names)
            if original_col not in mapped_columns:
                if original_col != standard_name:
                    rename_map[original_col] = standard_name
                mapped_columns.add(original_col)
        
        if rename_map:
            df = df.rename(columns=rename_map)
            report['transformations'].append(f"Renamed {len(rename_map)} columns to standard names")
            
        # 2. Date Parsing
        date_col = 'date' if 'date' in df.columns else self.detect_date_column(df)
        if date_col:
            try:
                # Rename detected date column to 'date' if not already
                if date_col != 'date':
                    df = df.rename(columns={date_col: 'date'})
                    date_col = 'date'
                    report['transformations'].append(f"Renamed date column '{date_col}' to 'date'")
                
                df = self.parse_dates(df, date_col)
                report['transformations'].append("Standardized 'date' column format")
            except Exception as e:
                report['transformations'].append(f"Date parsing warning: {str(e)}")

        # 3. Numeric conversions for target (sales)
        # Check if 'sales' exists (either naturally or renamed)
        if 'sales' in df.columns:
            # Force numeric, coerce errors to NaN
            df['sales'] = pd.to_numeric(df['sales'], errors='coerce')
            report['transformations'].append("Ensured 'sales' column is numeric")
            
        # 4. Fill Missing Values (Simple imputation)
        initial_missing = df.isnull().sum().sum()
        if initial_missing > 0:
            # Forward fill then backward fill for time series compatibility
            df = df.ffill().bfill()
            # If still missing (e.g. empty columns), fill with 0
            df = df.fillna(0)
            
            final_missing = df.isnull().sum().sum()
            filled_count = initial_missing - final_missing
            if filled_count > 0:
                report['transformations'].append(f"Imputed {filled_count} missing values")
            
        return df, report



def validate_adapted_data(df: pd.DataFrame, metadata: Dict) -> List[str]:
    """
    Validate adapted data and return list of issues
    
    Args:
        df: Adapted dataframe
        metadata: Adaptation metadata
        
    Returns:
        List of validation issues
    """
    issues = []
    
    # Check minimum requirements
    if len(df) < 10:
        issues.append(f"Insufficient data: only {len(df)} rows (minimum 10 required)")
    
    if len(df.columns) < 2:
        issues.append(f"Insufficient columns: only {len(df.columns)} (minimum 2 required)")
    
    # Check for date column
    if 'date_column' not in metadata:
        issues.append("No date column detected - forecasting requires temporal data")
    
    # Check for numeric target
    if 'target_column' in metadata:
        target_col = metadata['target_column']
        if not pd.api.types.is_numeric_dtype(df[target_col]):
            issues.append(f"Target column '{target_col}' is not numeric")
    else:
        issues.append("No numeric target column detected")
    
    # Check missing values
    missing_pct = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100
    if missing_pct > 50:
        issues.append(f"Excessive missing values: {missing_pct:.1f}%")
    
    return issues
