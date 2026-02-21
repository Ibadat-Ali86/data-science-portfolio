"""
Chart Generator for PDF Reports
Creates professional, print-optimized charts with confidence intervals
"""

import logging
import io
import base64
from typing import Dict, Optional, List, Tuple
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

from app.reporting.design_tokens import ReportDesignTokens

logger = logging.getLogger(__name__)


class ChartGenerator:
    """
    Generates professional charts for PDF reports
    
    Chart Types:
    - Forecast with confidence intervals
    - Segmentation bar charts
    - Correlation heatmaps
    - KPI gauges
    - Data quality scorecards
    """
    
    def __init__(self):
        self.design = ReportDesignTokens()
        
        # Apply matplotlib style
        plt.style.use('seaborn-v0_8-whitegrid')
        self._configure_matplotlib()
    
    def _configure_matplotlib(self):
        """Configure matplotlib with design tokens"""
        plt.rcParams.update({
            'figure.figsize': self.design.CHART_STYLE['figure_size'],
            'figure.dpi': self.design.CHART_STYLE['dpi'],
            'figure.facecolor': self.design.CHART_STYLE['background'],
            'axes.facecolor': self.design.CHART_STYLE['background'],
            'axes.grid': True,
            'grid.color': self.design.CHART_STYLE['grid_color'],
            'grid.alpha': self.design.CHART_STYLE['grid_alpha'],
            'xtick.labelsize': self.design.CHART_STYLE['tick_labelsize'],
            'ytick.labelsize': self.design.CHART_STYLE['tick_labelsize'],
            'axes.labelsize': self.design.CHART_STYLE['axis_labelsize'],
            'axes.titlesize': self.design.CHART_STYLE['title_size'],
            'legend.fontsize': self.design.CHART_STYLE['legend_fontsize'],
            'lines.linewidth': self.design.CHART_STYLE['line_width'],
            'font.family': ['sans-serif'],
            'font.sans-serif': ['Inter', 'DejaVu Sans'],
        })
    
    def generate_forecast_chart(
        self,
        historical_data: pd.DataFrame,
        forecast_data: pd.DataFrame,
        confidence_lower: pd.Series,
        confidence_upper: pd.Series,
        date_col: str = 'date',
        value_col: str = 'value',
        title: str = 'Forecast with Confidence Intervals'
    ) -> str:
        """
        Generate forecast chart with confidence intervals
        
        Returns base64-encoded PNG
        """
        logger.info(f"Generating forecast chart: {title}")
        
        fig, ax = plt.subplots(figsize=self.design.CHART_STYLE['figure_size'])
        
        # Plot historical data
        ax.plot(
            historical_data[date_col],
            historical_data[value_col],
            color=self.design.CHART_PALETTE['primary'],
            linewidth=2.5,
            label='Historical',
            marker='o',
            markersize=4
        )
        
        # Plot forecast
        ax.plot(
            forecast_data[date_col],
            forecast_data[value_col],
            color=self.design.CHART_PALETTE['secondary'],
            linewidth=2.5,
            linestyle='--',
            label='Forecast',
            marker='s',
            markersize=4
        )
        
        # Plot confidence interval
        ax.fill_between(
            forecast_data[date_col],
            confidence_lower,
            confidence_upper,
            color=self.design.CHART_PALETTE['secondary'],
            alpha=self.design.CHART_STYLE['confidence_band_alpha'],
            label='95% Confidence Interval'
        )
        
        # Styling
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel('Date', fontsize=11)
        ax.set_ylabel('Value', fontsize=11)
        ax.legend(loc='best', frameon=True, shadow=True)
        ax.grid(True, alpha=0.3)
        
        # Rotate x-axis labels
        plt.xticks(rotation=45, ha='right')
        
        # Tight layout
        plt.tight_layout()
        
        # Convert to base64
        return self._fig_to_base64(fig)
    
    def generate_segmentation_chart(
        self,
        data: pd.DataFrame,
        category_col: str,
        value_col: str,
        title: str = 'Performance by Segment',
        top_n: int = 10
    ) -> str:
        """
        Generate horizontal bar chart for segmentation analysis
        
        Returns base64-encoded PNG
        """
        logger.info(f"Generating segmentation chart: {title}")
        
        # Sort and get top N
        data_sorted = data.nlargest(top_n, value_col)
        
        fig, ax = plt.subplots(figsize=(10, max(6, top_n * 0.5)))
        
        # Horizontal bar chart
        bars = ax.barh(
            data_sorted[category_col],
            data_sorted[value_col],
            color=self.design.CHART_CATEGORICAL[:len(data_sorted)]
        )
        
        # Add value labels
        for bar in bars:
            width = bar.get_width()
            ax.text(
                width,
                bar.get_y() + bar.get_height() / 2,
                f'{width:,.0f}',
                ha='left',
                va='center',
                fontsize=9,
                fontweight='bold'
            )
        
        # Styling
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel(value_col.replace('_', ' ').title(), fontsize=11)
        ax.grid(axis='x', alpha=0.3)
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def generate_correlation_heatmap(
        self,
        correlation_matrix: pd.DataFrame,
        title: str = 'Feature Correlation Matrix'
    ) -> str:
        """
        Generate correlation heatmap
        
        Returns base64-encoded PNG
        """
        logger.info(f"Generating correlation heatmap: {title}")
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Create heatmap
        sns.heatmap(
            correlation_matrix,
            annot=True,
            fmt='.2f',
            cmap='RdYlGn',
            center=0,
            vmin=-1,
            vmax=1,
            square=True,
            linewidths=0.5,
            cbar_kws={'label': 'Correlation Coefficient'},
            ax=ax
        )
        
        # Styling
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def generate_kpi_gauge(
        self,
        current_value: float,
        target_value: float,
        min_value: float = 0,
        max_value: Optional[float] = None,
        title: str = 'KPI Performance'
    ) -> str:
        """
        Generate KPI gauge chart
        
        Returns base64-encoded PNG
        """
        logger.info(f"Generating KPI gauge: {title}")
        
        if max_value is None:
            max_value = target_value * 1.5
        
        fig, ax = plt.subplots(figsize=(8, 5), subplot_kw={'projection': 'polar'})
        
        # Calculate angles
        theta = np.linspace(0, np.pi, 100)
        
        # Background arc
        ax.fill_between(
            theta,
            min_value,
            max_value,
            color=self.design.BG_COLORS['slate_100'],
            alpha=0.3
        )
        
        # Current value arc
        current_theta = np.linspace(0, (current_value - min_value) / (max_value - min_value) * np.pi, 50)
        
        if current_value >= target_value:
            color = self.design.CONFIDENCE_COLORS['high']
        elif current_value >= target_value * 0.8:
            color = self.design.CONFIDENCE_COLORS['medium']
        else:
            color = self.design.CONFIDENCE_COLORS['exploratory']
        
        ax.fill_between(
            current_theta,
            min_value,
            current_value,
            color=color,
            alpha=0.7
        )
        
        # Target line
        target_angle = (target_value - min_value) / (max_value - min_value) * np.pi
        ax.plot([target_angle, target_angle], [min_value, max_value], 
                color=self.design.CHART_PALETTE['primary'], 
                linewidth=3, 
                linestyle='--',
                label=f'Target: {target_value:,.0f}')
        
        # Text annotations
        ax.text(0, 0, f'{current_value:,.0f}', 
                ha='center', va='center', 
                fontsize=24, fontweight='bold',
                color=color)
        
        ax.set_ylim(min_value, max_value)
        ax.set_yticks([])
        ax.set_xticks([])
        ax.spines['polar'].set_visible(False)
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        ax.legend(loc='upper left')
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def generate_data_quality_scorecard(
        self,
        scores: Dict[str, float],
        title: str = 'Data Quality Scorecard'
    ) -> str:
        """
        Generate data quality scorecard visualization
        
        Args:
            scores: Dict of metric names to scores (0-100)
        
        Returns base64-encoded PNG
        """
        logger.info(f"Generating data quality scorecard: {title}")
        
        fig, ax = plt.subplots(figsize=(10, len(scores) * 0.7))
        
        metrics = list(scores.keys())
        values = list(scores.values())
        
        # Color coding based on score
        colors = []
        for v in values:
            if v >= 80:
                colors.append(self.design.CONFIDENCE_COLORS['high'])
            elif v >= 60:
                colors.append(self.design.CONFIDENCE_COLORS['medium'])
            else:
                colors.append(self.design.CONFIDENCE_COLORS['exploratory'])
        
        # Horizontal bars
        y_pos = np.arange(len(metrics))
        bars = ax.barh(y_pos, values, color=colors, alpha=0.7)
        
        # Add percentage labels
        for i, (bar, value) in enumerate(zip(bars, values)):
            ax.text(
                value + 2,
                bar.get_y() + bar.get_height() / 2,
                f'{value:.0f}%',
                ha='left',
                va='center',
                fontsize=10,
                fontweight='bold'
            )
        
        # Styling
        ax.set_yticks(y_pos)
        ax.set_yticklabels([m.replace('_', ' ').title() for m in metrics])
        ax.set_xlim(0, 110)
        ax.set_xlabel('Score (%)', fontsize=11)
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.grid(axis='x', alpha=0.3)
        
        # Reference lines
        ax.axvline(80, color='green', linestyle='--', alpha=0.3, linewidth=1)
        ax.axvline(60, color='orange', linestyle='--', alpha=0.3, linewidth=1)
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64-encoded PNG"""
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', bbox_inches='tight', dpi=self.design.CHART_STYLE['dpi'])
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        
        return f"data:image/png;base64,{image_base64}"
    
    def generate_all_report_charts(
        self,
        analysis_data: Dict
    ) -> Dict[str, str]:
        """
        Generate all charts for a report
        
        Returns dict of chart names to base64-encoded images
        """
        charts = {}
        
        try:
            # Forecast chart (if time-series data available)
            if 'forecast' in analysis_data and 'historical' in analysis_data:
                charts['forecast'] = self.generate_forecast_chart(
                    historical_data=analysis_data['historical'],
                    forecast_data=analysis_data['forecast'],
                    confidence_lower=analysis_data.get('confidence_lower', analysis_data['forecast'].iloc[:, 1] * 0.9),
                    confidence_upper=analysis_data.get('confidence_upper', analysis_data['forecast'].iloc[:, 1] * 1.1)
                )
            
            # Segmentation chart (if categorical data available)
            if 'segmentation' in analysis_data:
                charts['segmentation'] = self.generate_segmentation_chart(
                    data=analysis_data['segmentation'],
                    category_col=analysis_data.get('category_col', 'category'),
                    value_col=analysis_data.get('value_col', 'value')
                )
            
            # Correlation heatmap (if correlation matrix available)
            if 'correlation_matrix' in analysis_data:
                charts['correlation'] = self.generate_correlation_heatmap(
                    correlation_matrix=analysis_data['correlation_matrix']
                )
            
            # Data quality scorecard
            if 'quality_scores' in analysis_data:
                charts['quality'] = self.generate_data_quality_scorecard(
                    scores=analysis_data['quality_scores']
                )
            
            logger.info(f"Generated {len(charts)} charts for report")
            
        except Exception as e:
            logger.error(f"Chart generation error: {str(e)}")
        
        return charts
