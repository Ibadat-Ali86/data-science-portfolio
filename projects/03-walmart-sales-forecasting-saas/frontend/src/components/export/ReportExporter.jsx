/**
 * ReportExporter Component
 * Generates business reports in multiple formats (PDF, Excel, PowerPoint)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Table, Presentation, Loader, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const ReportExporter = ({ forecastData, businessInsights, metrics }) => {
    const [exporting, setExporting] = useState(false);
    const [exportType, setExportType] = useState(null);
    const [complete, setComplete] = useState(false);

    const generatePDF = async () => {
        setExporting(true);
        setExportType('PDF');

        try {
            const doc = new jsPDF();
            let yPos = 20;

            // Title
            doc.setFontSize(20);
            doc.text('Forecast Analysis Report', 20, yPos);
            yPos += 15;

            // Executive Summary
            doc.setFontSize(14);
            doc.text('Executive Summary', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            const summary = businessInsights?.executive_summary;
            if (summary) {
                doc.text(`Forecast Headline: ${summary.headline}`, 20, yPos);
                yPos += 7;
                doc.text(`Growth Rate: ${summary.growth_rate?.toFixed(1)}%`, 20, yPos);
                yPos += 7;
                doc.text(`Accuracy: ${summary.accuracy_rating?.toFixed(1)}%`, 20, yPos);
                yPos += 7;
                doc.text(`Confidence: ${summary.confidence}`, 20, yPos);
                yPos += 15;
            }

            // Revenue Impact
            doc.setFontSize(14);
            doc.text('Revenue Impact', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            const revenue = businessInsights?.revenue_impact;
            if (revenue) {
                doc.text(`Projected Revenue: $${revenue.projected_revenue?.toLocaleString()}`, 20, yPos);
                yPos += 7;
                doc.text(`Best Case: $${revenue.best_case_scenario?.toLocaleString()}`, 20, yPos);
                yPos += 7;
                doc.text(`Worst Case: $${revenue.worst_case_scenario?.toLocaleString()}`, 20, yPos);
                yPos += 7;
                doc.text(`Revenue Delta: ${revenue.revenue_delta_pct?.toFixed(1)}%`, 20, yPos);
                yPos += 15;
            }

            // Strategic Recommendations
            if (businessInsights?.strategic_recommendations) {
                doc.setFontSize(14);
                doc.text('Strategic Recommendations', 20, yPos);
                yPos += 10;

                doc.setFontSize(10);
                businessInsights.strategic_recommendations.slice(0, 5).forEach((rec, idx) => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    doc.text(`${idx + 1}. ${rec.title} (${rec.priority})`, 20, yPos);
                    yPos += 5;
                    const lines = doc.splitTextToSize(rec.description, 170);
                    doc.text(lines, 25, yPos);
                    yPos += lines.length * 5 + 5;
                });
            }

            // Model Metrics
            doc.addPage();
            yPos = 20;
            doc.setFontSize(14);
            doc.text('Forecast Accuracy Metrics', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            if (metrics) {
                doc.text(`MAPE: ${metrics.mape?.toFixed(2)}%`, 20, yPos);
                yPos += 7;
                doc.text(`RMSE: ${metrics.rmse?.toFixed(2)}`, 20, yPos);
                yPos += 7;
                doc.text(`MAE: ${metrics.mae?.toFixed(2)}`, 20, yPos);
                yPos += 7;
                doc.text(`R²: ${metrics.r2?.toFixed(3)}`, 20, yPos);
            }

            // Save PDF
            doc.save('forecast_report.pdf');

            setComplete(true);
            setTimeout(() => {
                setComplete(false);
                setExporting(false);
            }, 2000);

        } catch (error) {
            console.error('PDF generation failed:', error);
            setExporting(false);
        }
    };

    const generateExcel = async () => {
        setExporting(true);
        setExportType('Excel');

        try {
            const workbook = XLSX.utils.book_new();

            // Executive Summary Sheet
            const summaryData = [];
            if (businessInsights?.executive_summary) {
                const summary = businessInsights.executive_summary;
                summaryData.push(['Executive Summary', '']);
                summaryData.push(['Headline', summary.headline]);
                summaryData.push(['Growth Rate', `${summary.growth_rate?.toFixed(1)}%`]);
                summaryData.push(['Accuracy', `${summary.accuracy_rating?.toFixed(1)}%`]);
                summaryData.push(['Confidence', summary.confidence]);
                summaryData.push([]);

                summary.key_insights?.forEach(insight => {
                    summaryData.push(['•', insight]);
                });
            }
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

            // Revenue Impact Sheet
            const revenueData = [];
            if (businessInsights?.revenue_impact) {
                const revenue = businessInsights.revenue_impact;
                revenueData.push(['Revenue Impact Analysis', '']);
                revenueData.push(['Projected Revenue', revenue.projected_revenue]);
                revenueData.push(['Best Case', revenue.best_case_scenario]);
                revenueData.push(['Worst Case', revenue.worst_case_scenario]);
                revenueData.push(['Revenue Delta', revenue.revenue_delta]);
                revenueData.push(['Revenue Delta %', `${revenue.revenue_delta_pct?.toFixed(1)}%`]);
                revenueData.push([]);
                revenueData.push(['Business Impact', revenue.business_impact]);
            }
            const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
            XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Impact');

            // Forecast Data Sheet
            if (forecastData) {
                const forecastSheet = XLSX.utils.json_to_sheet(
                    forecastData.dates?.map((date, idx) => ({
                        Date: date,
                        Prediction: forecastData.predictions?.[idx],
                        'Lower Bound': forecastData.lower_bound?.[idx],
                        'Upper Bound': forecastData.upper_bound?.[idx]
                    })) || []
                );
                XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Forecast Data');
            }

            // Recommendations Sheet
            if (businessInsights?.strategic_recommendations) {
                const recData = businessInsights.strategic_recommendations.map(rec => ({
                    Priority: rec.priority,
                    Category: rec.category,
                    Title: rec.title,
                    Description: rec.description,
                    'Expected Impact': rec.expected_impact
                }));
                const recSheet = XLSX.utils.json_to_sheet(recData);
                XLSX.utils.book_append_sheet(workbook, recSheet, 'Recommendations');
            }

            // Model Metrics Sheet
            if (metrics) {
                const metricsData = [
                    ['Metric', 'Value'],
                    ['MAPE', `${metrics.mape?.toFixed(2)}%`],
                    ['RMSE', metrics.rmse?.toFixed(2)],
                    ['MAE', metrics.mae?.toFixed(2)],
                    ['R²', metrics.r2?.toFixed(3)],
                    ['Training Samples', metrics.training_samples],
                    ['Validation Samples', metrics.validation_samples]
                ];
                const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
                XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');
            }

            // Write file
            XLSX.writeFile(workbook, 'forecast_report.xlsx');

            setComplete(true);
            setTimeout(() => {
                setComplete(false);
                setExporting(false);
            }, 2000);

        } catch (error) {
            console.error('Excel generation failed:', error);
            setExporting(false);
        }
    };

    const generatePowerPoint = async () => {
        setExporting(true);
        setExportType('PowerPoint');

        // Note: pptxgenjs is a large dependency, so for now we'll create a simple export
        // In production, you would use pptxgenjs library
        try {
            // For now, generate a detailed text export
            const data = {
                executive_summary: businessInsights?.executive_summary,
                revenue_impact: businessInsights?.revenue_impact,
                recommendations: businessInsights?.strategic_recommendations,
                metrics: metrics
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'forecast_data.json';
            a.click();
            URL.revokeObjectURL(url);

            setComplete(true);
            setTimeout(() => {
                setComplete(false);
                setExporting(false);
            }, 2000);

        } catch (error) {
            console.error('Export failed:', error);
            setExporting(false);
        }
    };

    const exportOptions = [
        {
            type: 'PDF',
            icon: FileText,
            description: 'Executive summary with charts and insights',
            action: generatePDF,
            color: 'bg-red-100 text-red-600'
        },
        {
            type: 'Excel',
            icon: Table,
            description: 'Detailed data tables and metrics',
            action: generateExcel,
            color: 'bg-green-100 text-green-600'
        },
        {
            type: 'JSON',
            icon: Presentation,
            description: 'Raw data export for further processing',
            action: generatePowerPoint,
            color: 'bg-orange-100 text-orange-600'
        }
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>

            <div className="grid grid-cols-3 gap-4">
                {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <motion.button
                            key={option.type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={option.action}
                            disabled={exporting}
                            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                        >
                            <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{option.type}</h4>
                            <p className="text-sm text-gray-600">{option.description}</p>
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence>
                {exporting && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3"
                    >
                        {complete ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-success-600" />
                                <span className="text-sm font-medium text-success-700">
                                    {exportType} exported successfully!
                                </span>
                            </>
                        ) : (
                            <>
                                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                                <span className="text-sm font-medium text-blue-700">
                                    Generating {exportType} report...
                                </span>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportExporter;
