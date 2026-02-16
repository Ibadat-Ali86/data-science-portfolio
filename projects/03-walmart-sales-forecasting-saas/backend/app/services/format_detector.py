import pandas as pd
import chardet
from typing import Dict, List, Tuple
import io
import os

class FormatDetector:
    """
    Intelligent data format detection and conversion system
    """
    
    REQUIRED_COLUMNS = ['date', 'product', 'quantity', 'price']
    
    COMMON_COLUMN_MAPPINGS = {
        'date': ['date', 'Date', 'DATE', 'order_date', 'OrderDate', 'transaction_date', 'TransactionDate', 'timestamp', 'Timestamp'],
        'year': ['year', 'Year', 'YEAR', 'yr', 'Yr'],
        'month': ['month', 'Month', 'MONTH', 'mo', 'Mo'],
        'product': ['product', 'Product', 'PRODUCT', 'item', 'Item', 'product_name', 'ProductName', 'sku', 'SKU', 'product_code'],
        'quantity': ['quantity', 'Quantity', 'QUANTITY', 'qty', 'Qty', 'amount', 'Amount', 'units', 'Units', 'sold'],
        'price': ['price', 'Price', 'PRICE', 'unit_price', 'UnitPrice', 'cost', 'Cost', 'revenue', 'Revenue', 'sales']
    }
    
    def detect_format(self, file_path: str = None, file_content: bytes = None) -> Dict:
        """
        Detect file format and structure
        """
        # Determine content source
        if file_path:
            with open(file_path, 'rb') as f:
                raw_data = f.read()
        elif file_content:
            raw_data = file_content
        else:
            raise ValueError("Either file_path or file_content must be provided")

        # Detect encoding
        encoding_result = chardet.detect(raw_data)
        encoding = encoding_result['encoding'] or 'utf-8'
        
        # Try to read appropriately based on extension if file_path provided, else assume CSV/Excel
        df = None
        best_separator = ','
        
        try:
            # Try reading as CSV with different separators
            separators = [',', ';', '\t', '|']
            best_separator = self._detect_separator(raw_data, encoding, separators)
            
            df = pd.read_csv(io.BytesIO(raw_data), sep=best_separator, encoding=encoding)
        except Exception:
            try:
                # Try reading as Excel
                df = pd.read_excel(io.BytesIO(raw_data))
                best_separator = 'excel'
            except Exception as e:
                raise ValueError(f"Could not read file: {str(e)}")
        
        if df is None:
             raise ValueError("Could not parse file data")

        # Analyze structure
        format_info = {
            'encoding': encoding,
            'separator': best_separator,
            'num_rows': len(df),
            'num_columns': len(df.columns),
            'columns': list(df.columns),
            # Convert numpy types to native python types for JSON serialization
            'data_types': {k: str(v) for k, v in df.dtypes.to_dict().items()},
            'sample_data': df.head(5).astype(str).to_dict('records'),
            'missing_values': {k: int(v) for k, v in df.isnull().sum().to_dict().items()},
            'suggested_mapping': self.suggest_column_mapping(df)
        }
        
        return format_info
    
    def _detect_separator(self, raw_data: bytes, encoding: str, separators: List[str]) -> str:
        """
        Detect the most likely separator
        """
        scores = {}
        
        for sep in separators:
            try:
                # Read first few lines
                df = pd.read_csv(io.BytesIO(raw_data), sep=sep, encoding=encoding, nrows=10)
                # Score based on number of columns and consistency
                # More columns is usually better (avoiding parsing everything into 1 column)
                # Less NaN is better
                if len(df.columns) > 1:
                    scores[sep] = len(df.columns) * (1 - df.isnull().sum().sum() / (len(df) * len(df.columns)))
                else:
                    scores[sep] = 0
            except:
                scores[sep] = 0
        
        return max(scores, key=scores.get) if scores else ','
    
    def suggest_column_mapping(self, df: pd.DataFrame) -> Dict:
        """
        AI-powered column mapping suggestion using fuzzy matching and semantic analysis
        """
        # try to import fuzzywuzzy, handle if not installed
        try:
            from fuzzywuzzy import fuzz
        except ImportError:
            # Fallback simple matching if library missing
            fuzz = None
            
        mapping = {}
        available_columns = list(df.columns)
        
        # Check all possible known columns including year/month
        check_columns = self.REQUIRED_COLUMNS + ['year', 'month']

        for required_col in check_columns:
            # Get possible matches
            possible_matches = self.COMMON_COLUMN_MAPPINGS.get(required_col, [])
            
            # Find best match
            best_match = None
            best_score = 0
            
            for col in available_columns:
                # Try exact match first
                if col in possible_matches:
                    best_match = col
                    best_score = 100
                    break
                
                # Try fuzzy match if available
                if fuzz:
                    score = max([fuzz.ratio(col.lower(), match.lower()) for match in possible_matches] + [0])
                    if score > best_score and score > 70:  # Threshold for confidence
                        best_score = score
                        best_match = col
                else:
                     # Simple substring match fallback
                     if any(m.lower() in col.lower() for m in possible_matches):
                         if best_score < 80:
                             best_score = 80
                             best_match = col

            if best_match:
                mapping[required_col] = {
                    'source_column': best_match,
                    'confidence': int(best_score),
                    'requires_confirmation': best_score < 90
                }
        
        # Identify unmapped required columns
        missing_columns = []
        for required_col in self.REQUIRED_COLUMNS:
            # Date is not missing IF year and month are mapped
            if required_col == 'date':
                has_date = 'date' in mapping and mapping['date']['confidence'] >= 50
                has_year_month = ('year' in mapping and mapping['year']['confidence'] >= 50 and 
                                  'month' in mapping and mapping['month']['confidence'] >= 50)
                if not has_date and not has_year_month:
                    missing_columns.append(required_col)
            elif required_col not in mapping or mapping[required_col]['confidence'] < 50:
                missing_columns.append(required_col)
        
        return {
            'mapping': mapping,
            'missing_columns': missing_columns,
            'confidence_score': sum([m['confidence'] for m in mapping.values()]) / len(mapping) if mapping else 0
        }
    
    def convert_to_standard_format(self, df: pd.DataFrame, mapping: Dict) -> pd.DataFrame:
        """
        Convert user's dataframe to standard format
        """
        standard_df = pd.DataFrame()
        
        # Process known columns
        for key in self.REQUIRED_COLUMNS + ['year', 'month']:
            if key in mapping:
                map_info = mapping[key]
                source_col = map_info['source_column'] if isinstance(map_info, dict) else map_info
                
                if source_col and source_col in df.columns:
                    standard_df[key] = df[source_col]

        # Synthesize Date if needed
        if 'date' not in standard_df.columns or standard_df['date'].isnull().all():
            if 'year' in standard_df.columns and 'month' in standard_df.columns:
                try:
                    # Create date from year and month (default to 1st of month)
                    standard_df['date'] = pd.to_datetime(
                        standard_df['year'].astype(str) + '-' + standard_df['month'].astype(str) + '-01',
                        errors='coerce'
                    )
                except Exception as e:
                    print(f"Date synthesis failed: {e}")
        
        # Apply standard transformations
        if 'date' in standard_df.columns:
             standard_df['date'] = pd.to_datetime(standard_df['date'], errors='coerce')
             
        for col in ['quantity', 'price']:
            if col in standard_df.columns:
                standard_df[col] = pd.to_numeric(standard_df[col], errors='coerce')
        
        # Clean up
        cols_to_check = ['quantity']
        if 'date' in standard_df.columns:
            cols_to_check.append('date')
            
        standard_df = standard_df.dropna(subset=cols_to_check)
        
        # Ensure we only return required columns (plus potentially useful extras if mapped?)
        # For now, let's keep what we have but ensure date is there
        return standard_df
    
    def validate_converted_data(self, df: pd.DataFrame) -> Dict:
        """
        Validate the converted data
        """
        validation_results = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'stats': {}
        }
        
        # Check required columns (Strict check for date now)
        for col in self.REQUIRED_COLUMNS:
            if col not in df.columns:
                validation_results['is_valid'] = False
                validation_results['errors'].append(f"Missing required column: {col}")
        
        # Check data quality
        if len(df) < 30:
            validation_results['warnings'].append("Dataset has fewer than 30 records - forecasts may be less reliable")
        
        if 'date' in df.columns and df['date'].isnull().sum() > 0:
            validation_results['errors'].append(f"{df['date'].isnull().sum()} invalid dates found")
            validation_results['is_valid'] = False
        
        # Calculate statistics
        if validation_results['is_valid']:
            validation_results['stats'] = {
                'total_records': len(df),
                'date_range': f"{df['date'].min()} to {df['date'].max()}",
                'unique_products': df['product'].nunique() if 'product' in df.columns else 0,
                'total_quantity': float(df['quantity'].sum()) if 'quantity' in df.columns else 0,
                'avg_quantity': float(df['quantity'].mean()) if 'quantity' in df.columns else 0,
                'missing_values': {k: int(v) for k, v in df.isnull().sum().to_dict().items()}
            }
        
        return validation_results
