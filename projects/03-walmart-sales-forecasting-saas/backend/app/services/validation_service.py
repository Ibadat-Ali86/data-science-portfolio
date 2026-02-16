from typing import Dict, List, Any, Optional
import pandas as pd
import io
import re

class ValidationService:
    """
    Robust 4-stage validation pipeline for data uploads.
    Stages:
    1. Structure (Corruption, Encoding, Headers)
    2. Schema (Required Columns, Types)
    3. Quality (Nulls, Outliers, Formats)
    4. Business Logic (Domain specific rules)
    """

    REQUIRED_PATTERNS = {
        'date': [r'date', r'time', r'timestamp', r'year', r'day', r'period'],
        'identifier': [r'id', r'sku', r'product', r'item', r'code', r'store', r'region'],
        'value': [r'sales', r'revenue', r'quantity', r'units', r'amount', r'stock', r'demand']
    }

    def validate_upload(self, contents: bytes, filename: str) -> Dict[str, Any]:
        """Orchestrates the validation pipeline."""
        
        if not contents or len(contents) == 0:
             return {'success': False, 'error': {'code': 'EMPTY_FILE', 'message': 'The uploaded file is empty.'}, 'stage': 'structure'}

        # Stage 1: Structure
        df, error = self._validate_structure(contents, filename)
        if error:
            return {'success': False, 'error': error, 'stage': 'structure'}

        # Stage 2: Schema
        schema_result = self._validate_schema(df)
        if not schema_result['valid_critical']:
             missing_str = ", ".join(schema_result['missing'])
             return {
                'success': False, 
                'error': {
                    'code': 'INSUFFICIENT_COLUMNS',
                    'message': 'We need more information to analyze your data',
                    'details': f"Missing required columns: {missing_str}. Your file has: {', '.join(df.columns[:5])}...",
                    'suggestion': 'Check our requirements or download a template.'
                },
                'schema': schema_result,
                'stage': 'schema'
             }

        # Stage 3: Quality
        quality_result = self._validate_quality(df, schema_result['mappings'])

        return {
            'success': True,
            'dataframe': df,
            'schema': schema_result,
            'quality': quality_result
        }

    def _validate_structure(self, contents: bytes, filename: str) -> tuple[Optional[pd.DataFrame], Optional[Dict]]:
        """Checks file integrity, encoding, and parseability."""
        try:
            if filename.endswith(('.xlsx', '.xls')):
                try:
                    df = pd.read_excel(io.BytesIO(contents), engine='openpyxl')
                    if len(df) > 0 and not isinstance(df.columns[0], str): # Heuristic for missing headers
                         return None, {'code': 'MISSING_HEADERS', 'message': "We can't find your column headers", 'suggestion': 'Ensure the first row contains column names.'}
                    return df, None
                except Exception as e:
                    return None, {'code': 'CORRUPTED_FILE', 'message': 'Unable to read file - may be corrupted', 'details': str(e)}
            
            else: # CSV
                # Try common encodings
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        decoded = contents.decode(encoding)
                        df = pd.read_csv(io.StringIO(decoded))
                        
                        if len(df.columns) < 2:
                             # Try detecting delimiter
                             try:
                                 df = pd.read_csv(io.StringIO(decoded), sep=None, engine='python')
                             except:
                                 pass
                        
                        if len(df.columns) < 2:
                            return None, {'code': 'DELIMITER_ERROR', 'message': 'Could not detect column structure.'}
                            
                        # Check for Missing Headers (data instead of strings in first row)
                        # Heuristic: if all columns are numbers, likely missing header
                        if all(pd.api.types.is_numeric_dtype(df[col]) for col in df.columns):
                             return None, {'code': 'MISSING_HEADERS', 'message': "We can't find your column headers", 'suggestion': 'Ensure the first row contains column names.'}

                        return df, None
                    except UnicodeDecodeError:
                        continue
                    except Exception as e:
                        return None, {'code': 'CSV_PARSE_ERROR', 'message': f'CSV Parse Error: {str(e)}'}
                
                return None, {'code': 'ENCODING_ERROR', 'message': 'Could not decode file. Please ensure it is UTF-8 encoded.'}

        except Exception as e:
            return None, {'code': 'UNKNOWN_STRUCTURE_ERROR', 'message': str(e)}

    def _validate_schema(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detects column roles and missing critical fields."""
        columns = [str(c).lower().strip() for c in df.columns]
        mappings = {}
        missing = []
        scores = []
        
        # Check for required column types
        for role, patterns in self.REQUIRED_PATTERNS.items():
            found = False
            for col_idx, col_name in enumerate(columns):
                if any(re.search(p, col_name) for p in patterns):
                    mappings[role] = df.columns[col_idx]
                    found = True
                    scores.append(1.0) # Exact/Regex match
                    break
            if not found:
                missing.append(role)
                scores.append(0.0)
        
        valid_critical = 'date' not in missing and 'value' not in missing
        confidence = sum(scores) / len(scores) if scores else 0.0

        return {
            'valid_critical': valid_critical,
            'mappings': mappings,
            'missing': missing,
            'confidence': round(confidence * 100, 1),
            'all_columns': list(df.columns)
        }

    def _validate_quality(self, df: pd.DataFrame, mappings: Dict) -> Dict[str, Any]:
        """Checks for nulls, types, and typical data issues."""
        issues = []
        
        # Null checks
        null_counts = df.isnull().sum()
        for col, count in null_counts.items():
            pct = (count / len(df)) * 100
            if pct > 0:
                # User Spec: <30% warning, >50% critical/reject
                severity = 'critical' if pct > 50 else 'warning' if pct > 30 else 'info'
                
                msg = f"{int(pct)}% of {col} values are missing."
                if severity == 'critical':
                    msg = "Your data has too many empty values."
                
                issues.append({
                    'code': 'HIGH_MISSING_RATE' if severity == 'critical' else 'MISSING_VALUES',
                    'type': 'missing_values',
                    'column': col,
                    'count': int(count),
                    'percentage': round(pct, 1),
                    'severity': severity,
                    'message': msg
                })

        # Date Parsing Check
        if 'date' in mappings:
            date_col = mappings['date']
            try:
                pd.to_datetime(df[date_col], errors='raise')
            except:
                 coerced = pd.to_datetime(df[date_col], errors='coerce')
                 failed = coerced.isnull().sum()
                 if failed > 0:
                     issues.append({
                         'code': 'INVALID_DATE_FORMAT',
                         'type': 'date_parsing',
                         'column': date_col,
                         'failed_rows': int(failed),
                         'message': 'Date format not recognized.',
                         'suggestion': 'Use YYYY-MM-DD format.',
                         'severity': 'critical'
                     })

        # Numeric Check
        if 'value' in mappings:
            val_col = mappings['value']
            if not pd.api.types.is_numeric_dtype(df[val_col]):
                 # Try converting
                 converted = pd.to_numeric(df[val_col], errors='coerce')
                 failed = converted.isnull().sum()
                 if failed > 0:
                     issues.append({
                         'type': 'numeric_parsing',
                         'column': val_col,
                         'message': f'Column {val_col} contains non-numeric values.',
                         'severity': 'critical'
                     })

        # Global Quality Metrics
        total_cells = df.size
        missing_cells = int(df.isnull().sum().sum())
        completeness = round(((total_cells - missing_cells) / total_cells) * 100, 2) if total_cells > 0 else 0.0
        duplicate_rows = int(df.duplicated().sum())

        return {
            'issues': issues,
            'row_count': len(df),
            'completeness': completeness,
            'missing_cells': missing_cells,
            'duplicate_rows': duplicate_rows,
            'preview': df.head(5).astype(str).to_dict('records') # Safe serialization
        }
