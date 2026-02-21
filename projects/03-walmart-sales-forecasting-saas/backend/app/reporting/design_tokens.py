"""
Report Design Tokens
Professional visual design system for PDF reports
"""

from typing import Dict


class ReportDesignTokens:
    """
    Design system tokens for PDF reports
    Ensures consistent, professional visual identity across all reports
    """
    
    # Color Palette - Confidence Levels
    CONFIDENCE_COLORS = {
        'high': '#22c55e',         # Green - Excellent confidence
        'good': '#22c55e',         # Green - Good confidence
        'medium': '#f59e0b',       # Amber - Medium confidence
        'exploratory': '#ef4444',  # Red - Exploratory mode
        'low': '#ef4444'           # Red - Low confidence
    }
    
    # Chart Color Palette - Professional, Color-blind Friendly
    CHART_PALETTE = {
        'primary': '#8b5cf6',      # Purple (brand primary)
        'secondary': '#3b82f6',    # Blue
        'accent': '#ec4899',       # Pink
        'neutral': '#64748b',      # Slate
        'success': '#22c55e',      # Green
        'warning': '#f59e0b',      # Amber
        'error': '#ef4444',        # Red
        'info': '#0ea5e9'          # Cyan
    }
    
    # Sequential palette for charts (light to dark)
    CHART_SEQUENTIAL = [
        '#ede9fe',  # Purple 100
        '#ddd6fe',  # Purple 200
        '#c4b5fd',  # Purple 300
        '#a78bfa',  # Purple 400
        '#8b5cf6',  # Purple 500
        '#7c3aed',  # Purple 600
        '#6d28d9',  # Purple 700
    ]
    
    # Categorical palette (distinct colors for categories)
    CHART_CATEGORICAL = [
        '#8b5cf6',  # Purple
        '#3b82f6',  # Blue
        '#22c55e',  # Green
        '#f59e0b',  # Amber
        '#ec4899',  # Pink
        '#14b8a6',  # Teal
        '#f97316',  # Orange
        '#a855f7',  # Violet
    ]
    
    # Typography
    FONTS = {
        'primary': 'Inter',
        'monospace': 'JetBrains Mono'
    }
    
    FONT_SIZES = {
        'h1': '24pt',
        'h2': '18pt',
        'h3': '14pt',
        'h4': '12pt',
        'body': '11pt',
        'caption': '9pt',
        'small': '8pt'
    }
    
    FONT_WEIGHTS = {
        'bold': 700,
        'semibold': 600,
        'medium': 500,
        'regular': 400,
        'light': 300
    }
    
    # Text Colors
    TEXT_COLORS = {
        'primary': '#1e293b',      # Slate 900
        'secondary': '#334155',    # Slate 700
        'tertiary': '#475569',     # Slate 600
        'muted': '#64748b',        # Slate 500
        'light': '#94a3b8'         # Slate 400
    }
    
    # Background Colors
    BG_COLORS = {
        'white': '#ffffff',
        'slate_50': '#f8fafc',
        'slate_100': '#f1f5f9',
        'slate_200': '#e2e8f0',
        'primary_50': '#faf5ff',   # Purple tint
        'success_50': '#f0fdf4',   # Green tint
        'warning_50': '#fffbeb',   # Amber tint
        'error_50': '#fef2f2'      # Red tint
    }
    
    # Border Colors
    BORDER_COLORS = {
        'default': '#e2e8f0',      # Slate 200
        'strong': '#cbd5e1',       # Slate 300
        'primary': '#ddd6fe',      # Purple 200
        'success': '#bbf7d0',      # Green 200
        'warning': '#fed7aa',      # Amber 200
        'error': '#fecaca'         # Red 200
    }
    
    # Spacing (in pixels/points)
    SPACING = {
        'xs': 4,
        'sm': 8,
        'md': 12,
        'lg': 16,
        'xl': 24,
        'xxl': 32,
        '3xl': 48
    }
    
    # Layout
    PAGE = {
        'width': '210mm',          # A4 width
        'height': '297mm',         # A4 height
        'margin_top': '20mm',
        'margin_bottom': '20mm',
        'margin_left': '20mm',
        'margin_right': '20mm',
        'gutter': '5mm'
    }
    
    # Sections
    SECTION_SPACING = {
        'between_sections': 24,
        'paragraph': 12,
        'line_height': 1.6
    }
    
    # Confidence Visual Indicators
    CONFIDENCE_STYLES = {
        'high': {
            'color': CONFIDENCE_COLORS['high'],
            'bg': BG_COLORS['success_50'],
            'border': BORDER_COLORS['success'],
            'icon': '✓',
            'label': 'HIGH CONFIDENCE'
        },
        'good': {
            'color': CONFIDENCE_COLORS['good'],
            'bg': BG_COLORS['success_50'],
            'border': BORDER_COLORS['success'],
            'icon': '✓',
            'label': 'GOOD CONFIDENCE'
        },
        'medium': {
            'color': CONFIDENCE_COLORS['medium'],
            'bg': BG_COLORS['warning_50'],
            'border': BORDER_COLORS['warning'],
            'icon': '⚠',
            'label': 'MEDIUM CONFIDENCE'
        },
        'exploratory': {
            'color': CONFIDENCE_COLORS['exploratory'],
            'bg': BG_COLORS['error_50'],
            'border': BORDER_COLORS['error'],
            'icon': 'ℹ',
            'label': 'EXPLORATORY'
        }
    }
    
    # Chart Styling
    CHART_STYLE = {
        'figure_size': (10, 6),      # inches
        'dpi': 150,                   # High quality for PDF
        'background': '#ffffff',
        'grid_color': '#e2e8f0',
        'grid_alpha': 0.5,
        'tick_labelsize': 10,
        'axis_labelsize': 11,
        'title_size': 14,
        'legend_fontsize': 10,
        'line_width': 2.5,
        'confidence_band_alpha': 0.15
    }
    
    @classmethod
    def get_css(cls) -> str:
        """Generate CSS stylesheet for HTML templates"""
        return f"""
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: '{cls.FONTS["primary"]}', sans-serif;
            font-size: {cls.FONT_SIZES['body']};
            color: {cls.TEXT_COLORS['primary']};
            line-height: {cls.SECTION_SPACING['line_height']};
            background: {cls.BG_COLORS['white']};
        }}
        
        @page {{
            size: {cls.PAGE['width']} {cls.PAGE['height']};
            margin: {cls.PAGE['margin_top']} {cls.PAGE['margin_right']} {cls.PAGE['margin_bottom']} {cls.PAGE['margin_left']};
        }}
        
        h1 {{
            font-size: {cls.FONT_SIZES['h1']};
            font-weight: {cls.FONT_WEIGHTS['bold']};
            color: {cls.TEXT_COLORS['primary']};
            margin-bottom: {cls.SPACING['lg']}px;
        }}
        
        h2 {{
            font-size: {cls.FONT_SIZES['h2']};
            font-weight: {cls.FONT_WEIGHTS['semibold']};
            color: {cls.TEXT_COLORS['secondary']};
            margin-top: {cls.SPACING['xl']}px;
            margin-bottom: {cls.SPACING['md']}px;
        }}
        
        h3 {{
            font-size: {cls.FONT_SIZES['h3']};
            font-weight: {cls.FONT_WEIGHTS['medium']};
            color: {cls.TEXT_COLORS['tertiary']};
            margin-top: {cls.SPACING['lg']}px;
            margin-bottom: {cls.SPACING['sm']}px;
        }}
        
        p {{
            margin-bottom: {cls.SPACING['md']}px;
            color: {cls.TEXT_COLORS['muted']};
        }}
        
        .page-break {{
            page-break-after: always;
        }}
        
        .confidence-badge {{
            display: inline-block;
            padding: {cls.SPACING['sm']}px {cls.SPACING['md']}px;
            border-radius: 999px;
            font-weight: {cls.FONT_WEIGHTS['semibold']};
            font-size: {cls.FONT_SIZES['caption']};
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        .confidence-high {{
            background: {cls.BG_COLORS['success_50']};
            color: {cls.CONFIDENCE_COLORS['high']};
            border: 2px solid {cls.BORDER_COLORS['success']};
        }}
        
        .confidence-medium {{
            background: {cls.BG_COLORS['warning_50']};
            color: {cls.CONFIDENCE_COLORS['medium']};
            border: 2px solid {cls.BORDER_COLORS['warning']};
        }}
        
        .confidence-low {{
            background: {cls.BG_COLORS['error_50']};
            color: {cls.CONFIDENCE_COLORS['exploratory']};
            border: 2px solid {cls.BORDER_COLORS['error']};
        }}
        
        .section {{
            margin-bottom: {cls.SECTION_SPACING['between_sections']}px;
        }}
        
        .card {{
            background: {cls.BG_COLORS['slate_50']};
            border: 1px solid {cls.BORDER_COLORS['default']};
            border-radius: 8px;
            padding: {cls.SPACING['lg']}px;
            margin-bottom: {cls.SPACING['md']}px;
        }}
        
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: {cls.SPACING['md']}px;
            margin: {cls.SPACING['lg']}px 0;
        }}
        
        .kpi-card {{
            background: {cls.BG_COLORS['white']};
            border: 2px solid {cls.BORDER_COLORS['default']};
            border-radius: 8px;
            padding: {cls.SPACING['md']}px;
            text-align: center;
        }}
        
        .kpi-value {{
            font-size: {cls.FONT_SIZES['h2']};
            font-weight: {cls.FONT_WEIGHTS['bold']};
            color: {cls.CHART_PALETTE['primary']};
        }}
        
        .kpi-label {{
            font-size: {cls.FONT_SIZES['caption']};
            color: {cls.TEXT_COLORS['muted']};
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: {cls.SPACING['lg']}px 0;
        }}
        
        th {{
            background: {cls.BG_COLORS['slate_100']};
            padding: {cls.SPACING['md']}px;
            text-align: left;
            font-weight: {cls.FONT_WEIGHTS['semibold']};
            border-bottom: 2px solid {cls.BORDER_COLORS['strong']};
        }}
        
        td {{
            padding: {cls.SPACING['sm']}px {cls.SPACING['md']}px;
            border-bottom: 1px solid {cls.BORDER_COLORS['default']};
        }}
        
        .header {{
            border-bottom: 3px solid {cls.CHART_PALETTE['primary']};
            padding-bottom: {cls.SPACING['lg']}px;
            margin-bottom: {cls.SPACING['xl']}px;
        }}
        
        .footer {{
            border-top: 1px solid {cls.BORDER_COLORS['default']};
            padding-top: {cls.SPACING['md']}px;
            margin-top: {cls.SPACING['xl']}px;
            font-size: {cls.FONT_SIZES['caption']};
            color: {cls.TEXT_COLORS['light']};
            text-align: center;
        }}
        
        .limitation-box {{
            background: {cls.BG_COLORS['warning_50']};
            border-left: 4px solid {cls.CONFIDENCE_COLORS['medium']};
            padding: {cls.SPACING['md']}px;
            margin: {cls.SPACING['lg']}px 0;
        }}
        
        .strength-box {{
            background: {cls.BG_COLORS['success_50']};
            border-left: 4px solid {cls.CONFIDENCE_COLORS['high']};
            padding: {cls.SPACING['md']}px;
            margin: {cls.SPACING['lg']}px 0;
        }}
        
        ul {{
            margin-left: {cls.SPACING['xl']}px;
            margin-bottom: {cls.SPACING['md']}px;
        }}
        
        li {{
            margin-bottom: {cls.SPACING['sm']}px;
        }}
        """
    
    @classmethod
    def get_matplotlib_style(cls) -> Dict:
        """Get matplotlib rcParams style dictionary"""
        return {
            'figure.figsize': cls.CHART_STYLE['figure_size'],
            'figure.dpi': cls.CHART_STYLE['dpi'],
            'figure.facecolor': cls.CHART_STYLE['background'],
            'axes.facecolor': cls.CHART_STYLE['background'],
            'axes.grid': True,
            'grid.color': cls.CHART_STYLE['grid_color'],
            'grid.alpha': cls.CHART_STYLE['grid_alpha'],
            'xtick.labelsize': cls.CHART_STYLE['tick_labelsize'],
            'ytick.labelsize': cls.CHART_STYLE['tick_labelsize'],
            'axes.labelsize': cls.CHART_STYLE['axis_labelsize'],
            'axes.titlesize': cls.CHART_STYLE['title_size'],
            'legend.fontsize': cls.CHART_STYLE['legend_fontsize'],
            'lines.linewidth': cls.CHART_STYLE['line_width'],
            'axes.prop_cycle': f"cycler('color', {cls.CHART_CATEGORICAL})",
            'font.family': ['sans-serif'],
            'font.sans-serif': [cls.FONTS['primary']],
        }
