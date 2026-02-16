import pytest
import numpy as np
from app.services.business_intelligence import generate_business_insights

def test_generate_business_insights_structure():
    # Mock data
    forecast = {
        'predictions': [100, 110, 105, 115, 120] * 6, # 30 days
        'lower_bound': [90, 100, 95, 105, 110] * 6,
        'upper_bound': [110, 120, 115, 125, 130] * 6,
        'dates': [f"2023-01-{i:02d}" for i in range(1, 31)]
    }
    
    metrics = {
        'mape': 5.5,
        'rmse': 10.2,
        'mae': 8.1,
        'r2': 0.92,
        'accuracy_rating': 'Very Good'
    }
    
    # Call function
    insights = generate_business_insights(forecast, metrics)
    
    # Assert top-level keys
    assert 'executive_summary' in insights
    assert 'financial_metrics' in insights
    assert 'risks' in insights
    assert 'opportunities' in insights
    assert 'action_plan' in insights
    assert 'inventory_recommendations' in insights
    
    # Assert specific values/logic -> Executive Summary
    assert 'headline' in insights['executive_summary']
    assert 'confidence_level' in insights['executive_summary']
    
    # Check Financials
    assert 'projected_revenue' in insights['financial_metrics']
    assert 'gross_margin' in insights['financial_metrics']
    
    # Check Risks
    assert isinstance(insights['risks'], list)
    # With this data, we expect low volatility risk maybe?
    # volatility = std/mean. std([100..120]) is small compared to mean 110. 
    # But let's just check the structure is correct
    if len(insights['risks']) > 0:
        assert 'title' in insights['risks'][0]
        assert 'severity' in insights['risks'][0]
    
    # Check Opportunities
    assert isinstance(insights['opportunities'], list)
    
    # Check Action Plan
    assert 'immediate' in insights['action_plan']
    assert 'short_term' in insights['action_plan']
    assert 'strategic' in insights['action_plan']

def test_generate_business_insights_backward_compatibility():
    # Test that we still have keys for old dashboard if needed
    forecast = {
        'predictions': [100] * 30,
        'lower_bound': [90] * 30,
        'upper_bound': [110] * 30,
        'dates': []
    }
    metrics = {}
    
    insights = generate_business_insights(forecast, metrics)
    
    assert 'summary' in insights # Old key
    assert 'trends' in insights # Old key

