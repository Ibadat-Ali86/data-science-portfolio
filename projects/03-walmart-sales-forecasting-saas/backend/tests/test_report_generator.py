import pytest
from unittest.mock import MagicMock, patch
from app.services.report_generator import ReportGenerator

@pytest.fixture
def mock_session_data():
    return {
        "profile": {
            "row_count": 1000,
            "missing_cols": [],
            "domain": "Retail"
        },
        "metrics": {
            "mape": 12.5,
            "rmse": 100.2,
            "modelType": "Prophet"
        },
        "filename": "test_data.csv"
    }

def test_report_context_building(mock_session_data):
    generator = ReportGenerator()
    context = generator._build_context(mock_session_data)
    
    assert context['filename'] == "test_data.csv"
    assert context['confidence_score'] == 90 # Base 90 for good data
    assert context['model_metrics']['mape'] == "12.50"
    assert len(context['key_metrics']) == 3

@patch('app.services.report_generator.WEASYPRINT_AVAILABLE', False)
def test_pdf_generation_fails_gracefully(mock_session_data):
    generator = ReportGenerator()
    with pytest.raises(RuntimeError) as excinfo:
        generator.generate_pdf(mock_session_data)
    assert "WeasyPrint not available" in str(excinfo.value)

@patch('app.services.report_generator.WEASYPRINT_AVAILABLE', True)
@patch('app.services.report_generator.HTML')
def test_pdf_generation_calls_weasyprint(mock_html, mock_session_data):
    generator = ReportGenerator()
    
    # Mock the template rendering to avoid file system lookups
    generator.env = MagicMock()
    mock_template = MagicMock()
    mock_template.render.return_value = "<html></html>"
    generator.env.get_template.return_value = mock_template
    
    generator.generate_pdf(mock_session_data)
    
    mock_html.assert_called_once()
    mock_html.return_value.write_pdf.assert_called_once()
