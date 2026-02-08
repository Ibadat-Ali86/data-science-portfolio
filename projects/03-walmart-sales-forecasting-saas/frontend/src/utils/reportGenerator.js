import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Generate a comprehensive PDF report
 */
export const generatePDFReport = (data, type = 'comprehensive') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Helper for centering text
    const centerText = (text, y) => {
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
    };

    // Header Color
    const primaryColor = [74, 158, 255]; // Blue
    const secondaryColor = [41, 41, 61]; // Dark

    // --- Title Page ---
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ForecastAI Analysis Report', 20, 20); // Logo/Brand

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    let yPos = 60;

    // --- Executive Summary ---
    if (['comprehensive', 'insights'].includes(type)) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', 20, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const summaryText = data.insights?.summary || 'Analysis complete. Positive trends detected.';
        const splitText = doc.splitTextToSize(summaryText, pageWidth - 40);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 7 + 10;
    }

    // --- Model Metrics ---
    if (['comprehensive', 'metrics'].includes(type) && data.metrics) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Model Performance Metrics', 20, yPos);
        yPos += 10;

        const metricsData = [
            ['Metric', 'Value', 'Score'],
            ['MAPE (Error Rate)', `${(data.metrics.mape || 0).toFixed(2)}%`, (data.metrics.mape < 5 ? 'Excellent' : 'Good')],
            ['RMSE', (data.metrics.rmse || 0).toFixed(2), 'Normal'],
            ['R² Score', (data.metrics.r2Score || 0).toFixed(3), 'High Correlation'],
            ['Accuracy Rating', data.metrics.accuracyRating || 'Excellent', '-']
        ];

        autoTable(doc, {
            startY: yPos,
            head: [metricsData[0]],
            body: metricsData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: primaryColor },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        yPos = doc.lastAutoTable.finalY + 20;
    }

    // --- Forecast Data (Table) ---
    if (['comprehensive', 'forecast'].includes(type) && data.forecast) {
        // Check for page break
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Demand Forecast (Next 30 Days)', 20, yPos);
        yPos += 10;

        const forecastRows = data.forecast.dates.slice(0, 14).map((date, i) => [
            date,
            Math.round(data.forecast.predictions[i]),
            Math.round(data.forecast.lowerBound ? data.forecast.lowerBound[i] : data.forecast.predictions[i] * 0.9),
            Math.round(data.forecast.upperBound ? data.forecast.upperBound[i] : data.forecast.predictions[i] * 1.1)
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Predicted Sales', 'Lower Bound', 'Upper Bound']],
            body: forecastRows,
            theme: 'grid',
            headStyles: { fillColor: primaryColor },
        });

        yPos = doc.lastAutoTable.finalY + 20;
    }

    // --- Business Insights ---
    if (['comprehensive', 'insights'].includes(type) && data.insights) {
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Strategic Insights', 20, yPos);
        yPos += 10;

        // Trends
        if (data.insights.trends) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Key Trends:', 20, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            data.insights.trends.forEach(trend => {
                doc.text(`• ${trend}`, 25, yPos);
                yPos += 7;
            });
            yPos += 5;
        }

        // Recommendations
        if (data.insights.opportunities) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Recommendations:', 20, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            data.insights.opportunities.forEach(opp => {
                doc.text(`• ${opp}`, 25, yPos);
                yPos += 7;
            });
        }
    }

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('ForecastAI - Confidential', 20, pageHeight - 10);
    }

    doc.save(`ForecastAI_Report_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generate Scenario CSV Report
 */
export const generateScenarioCSV = (results, baseline, scenarios) => {
    const rows = [
        ['Scenario Planning Report'],
        ['Generated', new Date().toISOString()],
        [],
        ['Parameters'],
        ['Markdown %', `${scenarios.markdownPercent}%`],
        ['Promo Weeks', scenarios.promotionalWeeks],
        ['Holiday Boost', `${scenarios.holidayBoost}%`],
        [],
        ['Results Comparison', 'Baseline', 'Scenario', 'Difference', '% Change'],
        ['Revenue', baseline.revenue, results.revenue, results.revenue - baseline.revenue, `${((results.revenue - baseline.revenue) / baseline.revenue * 100).toFixed(2)}%`],
        ['Gross Margin', baseline.margin, results.margin, results.margin - baseline.margin, `${((results.margin - baseline.margin) / baseline.margin * 100).toFixed(2)}%`],
        ['Units Sold', baseline.unitsSold, results.unitsSold, results.unitsSold - baseline.unitsSold, `${((results.unitsSold - baseline.unitsSold) / baseline.unitsSold * 100).toFixed(2)}%`],
        ['Inventory Needed', baseline.inventoryNeeded, results.inventoryNeeded, results.inventoryNeeded - baseline.inventoryNeeded, `${((results.inventoryNeeded - baseline.inventoryNeeded) / baseline.inventoryNeeded * 100).toFixed(2)}%`]
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scenario Results");
    XLSX.writeFile(wb, `Scenario_Report_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Generate Forecast CSV with Metrics
 */
export const generateForecastCSV = (data) => {
    // Metrics section
    const metricsRows = [
        ['Model Performance Metrics'],
        ['Metric', 'Value'],
        ['MAPE', data.metrics?.mape],
        ['RMSE', data.metrics?.rmse],
        ['MAE', data.metrics?.mae],
        ['R2 Score', data.metrics?.r2Score],
        []
    ];

    // Data section
    const dataHeaders = ['Date', 'Forecast', 'Lower Bound', 'Upper Bound'];
    const dataRows = data.forecast.dates.map((date, i) => [
        date,
        data.forecast.predictions[i],
        data.forecast.lowerBound ? data.forecast.lowerBound[i] : data.forecast.predictions[i] * 0.9,
        data.forecast.upperBound ? data.forecast.upperBound[i] : data.forecast.predictions[i] * 1.1,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...metricsRows, dataHeaders, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Forecast Data");
    XLSX.writeFile(wb, `Forecast_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Generate Excel Report (Ported from exportReport.js)
 */
export const generateExcelReport = (analysisData) => {
    const { metrics, profile, forecast, insights } = analysisData;
    const wb = XLSX.utils.book_new();

    // 1. Executive Summary
    const summaryData = [
        ['ForecastAI Analysis Report'],
        ['Generated', new Date().toLocaleString()],
        [],
        ['EXECUTIVE SUMMARY'],
        ['Analysis Date', new Date().toLocaleDateString()],
        ['Model Type', metrics?.modelType || 'Prophet + XGBoost Ensemble'],
        ['Accuracy Rating', metrics?.accuracyRating || 'Excellent'],
        [],
        ['KEY METRICS'],
        ['MAPE (%)', (metrics?.mape || 0).toFixed(2)],
        ['RMSE', (metrics?.rmse || 0).toFixed(2)],
        ['R² Score', (metrics?.r2Score || 0).toFixed(3)]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Executive Summary');

    // 2. Forecast Data
    if (forecast) {
        const forecastHeaders = ['Date', 'Predicted Value', 'Lower Bound', 'Upper Bound'];
        const forecastRows = forecast.dates.map((date, i) => [
            date,
            forecast.predictions[i],
            forecast.lowerBound ? forecast.lowerBound[i] : 0,
            forecast.upperBound ? forecast.upperBound[i] : 0
        ]);
        const forecastSheet = XLSX.utils.aoa_to_sheet([forecastHeaders, ...forecastRows]);
        XLSX.utils.book_append_sheet(wb, forecastSheet, 'Forecast Data');
    }

    // 3. Business Insights
    if (insights) {
        const insightsData = [['Category', 'Insight']];
        (insights.trends || []).forEach(t => insightsData.push(['Trend', t]));
        (insights.risks || []).forEach(r => insightsData.push(['Risk', r]));
        (insights.opportunities || []).forEach(o => insightsData.push(['Opportunity', o]));

        const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData);
        XLSX.utils.book_append_sheet(wb, insightsSheet, 'Business Insights');
    }

    XLSX.writeFile(wb, `ForecastAI_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
