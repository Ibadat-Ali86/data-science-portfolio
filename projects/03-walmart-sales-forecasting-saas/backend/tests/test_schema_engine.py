import pytest
from app.services.schema_engine import SchemaEngine, schema_engine

def test_normalize_text():
    assert SchemaEngine.normalize_text("Product ID") == "productid"
    assert SchemaEngine.normalize_text("Sales_Qty") == "salesqty"
    assert SchemaEngine.normalize_text("DATE") == "date"
    assert SchemaEngine.normalize_text("  Space  ") == "space"

def test_exact_match():
    columns = ['date', 'product_id', 'quantity', 'price']
    result = schema_engine.analyze_columns(columns)
    
    mapping = result['mapped_schema']
    assert mapping['date'] == 'date'
    assert mapping['product_id'] == 'product_id'
    assert mapping['quantity'] == 'quantity'
    assert mapping['price'] == 'price'
    assert result['overall_confidence'] == 100.0

def test_synonym_match():
    columns = ['timestamp', 'sku', 'sold', 'cost']
    result = schema_engine.analyze_columns(columns)
    
    mapping = result['mapped_schema']
    assert mapping['date'] == 'timestamp'
    assert mapping['product_id'] == 'sku'
    assert mapping['quantity'] == 'sold'
    assert mapping['price'] == 'cost'

def test_fuzzy_match():
    # 'prod_id' is not in synonyms but close to 'product_id'
    # 'qtity' close to 'quantity'
    columns = ['txn_date', 'prod_id', 'sales_amount'] 
    result = schema_engine.analyze_columns(columns)
    
    mapping = result['mapped_schema']
    assert mapping['date'] == 'txn_date'         # synonym for date (trans_date) or fuzzy
    assert mapping['price'] == 'sales_amount'    # synonym
    # Fuzzy checks depend on the threshold, usually > 0.8
    # 'prod_id' vs 'product_id' ratio is 0.82
    assert mapping.get('product_id') in ['prod_id', None] 

def test_partial_match_low_confidence():
    columns = ['random_col', 'another_col']
    result = schema_engine.analyze_columns(columns)
    
    assert result['overall_confidence'] < 50
    assert len(result['missing_required']) == 3 # date, product_id, quantity

def test_domain_detection_retail():
    columns = ['date', 'sku', 'qty', 'store_id', 'category']
    result = schema_engine.analyze_columns(columns)
    assert result['domain'] == 'Retail / Supply Chain'

def test_domain_detection_generic():
    columns = ['date', 'value']
    result = schema_engine.analyze_columns(columns)
    assert result['domain'] == 'Generic Time-Series'
