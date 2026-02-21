"""
PDF Generator Service
Converts HTML templates to professional PDF reports using WeasyPrint
"""

import logging
from typing import Dict, Optional
import os
from datetime import datetime

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    logging.warning("WeasyPrint not installed. PDF generation will be unavailable.")

from app.reporting.template_engine import ReportTemplateEngine
from app.reporting.chart_generator import ChartGenerator
from app.reporting.design_tokens import ReportDesignTokens

logger = logging.getLogger(__name__)


class PDFGenerator:
    """
    Generates PDF reports from HTML templates
    
    Uses WeasyPrint for HTML → PDF conversion with:
    - Professional styling
    - Page headers/footers
    - Page numbering
    - Print-optimized layout
    """
    
    def __init__(self):
        if not WEASYPRINT_AVAILABLE:
            raise ImportError(
                "WeasyPrint is required for PDF generation. "
                "Install it with: pip install weasyprint"
            )
        
        self.template_engine = ReportTemplateEngine()
        self.chart_generator = ChartGenerator()
        self.design = ReportDesignTokens()
    
    def generate_pdf(
        self,
        template_type: str,
        data: Dict,
        customization: Optional[Dict] = None,
        output_path: Optional[str] = None
    ) -> bytes:
        """
        Generate PDF report
        
        Args:
            template_type: Template to use ('high_confidence', 'medium_confidence', 'exploratory')
            data: Report data
            customization: Optional customization settings
            output_path: Optional path to save PDF (if None, returns bytes)
            
        Returns:
            PDF as bytes
        """
        logger.info(f"Generating PDF report: {template_type}")
        
        try:
            # Generate charts if not provided
            if 'charts' not in data or not data['charts']:
                logger.info("Generating charts for report")
                data['charts'] = self.chart_generator.generate_all_report_charts(data)
            
            # Render HTML
            html_content = self.template_engine.render_report(
                template_type=template_type,
                data=data,
                customization=customization
            )
            
            # Convert to PDF
            pdf_bytes = self._html_to_pdf(html_content)
            
            # Save if output path provided
            if output_path:
                with open(output_path, 'wb') as f:
                    f.write(pdf_bytes)
                logger.info(f"PDF saved to: {output_path}")
            
            logger.info(f"PDF generated successfully ({len(pdf_bytes)} bytes)")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"PDF generation failed: {str(e)}")
            raise
    
    def _html_to_pdf(self, html_content: str) -> bytes:
        """Convert HTML string to PDF bytes using WeasyPrint"""
        
        # Create HTML object
        html = HTML(string=html_content)
        
        # Additional CSS for print optimization
        print_css = CSS(string="""
            @page {
                margin: 20mm;
                size: A4 portrait;
                
                @top-right {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 9pt;
                    color: #94a3b8;
                }
            }
            
            /* Prevent page breaks inside elements */
            .card, .kpi-grid, .section, table {
                page-break-inside: avoid;
            }
            
            /* Force page breaks */
            .page-break {
                page-break-after: always;
            }
            
            /* Print-specific adjustments */
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        """)
        
        # Render to PDF
        pdf_bytes = html.write_pdf(stylesheets=[print_css])
        
        return pdf_bytes
    
    def generate_preview_html(
        self,
        template_type: str,
        data: Dict,
        customization: Optional[Dict] = None
    ) -> str:
        """
        Generate HTML preview (for browser viewing before PDF generation)
        
        Returns HTML string
        """
        logger.info(f"Generating HTML preview: {template_type}")
        
        # Generate charts if not provided
        if 'charts' not in data or not data['charts']:
            data['charts'] = self.chart_generator.generate_all_report_charts(data)
        
        # Render HTML
        html_content = self.template_engine.render_report(
            template_type=template_type,
            data=data,
            customization=customization
        )
        
        return html_content
