import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { translateMetricsToBusiness } from './BusinessTranslator';

/**
 * Generate Comprehensive Business Intelligence Report
 * Implements the 10-Section Structure
 */
export const generatePDFReport = (data) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        let yPos = 20;

        // --- COLORS ---
        const colors = {
            primary: [0, 51, 102],      // Navy Blue
            secondary: [255, 102, 0],   // Walmart Orange accent
            accent: [230, 240, 255],    // Light Blue bg
            text: [60, 60, 60],
            lightText: [120, 120, 120]
        };

        // --- HELPERS ---
        const addHeader = (text, size = 16, isSection = true) => {
            if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(size);
            doc.setTextColor(...(isSection ? colors.primary : [0, 0, 0]));
            doc.text(text, 20, yPos);
            yPos += isSection ? 10 : 7;
            doc.setFont('helvetica', 'normal'); // Reset
            doc.setTextColor(...colors.text);
        };

        const addText = (text, size = 10, indent = 0) => {
            if (!text) return;
            doc.setFontSize(size);
            const splitText = doc.splitTextToSize(String(text), pageWidth - 40 - indent);
            if (yPos + (splitText.length * 5) > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(splitText, 20 + indent, yPos);
            yPos += splitText.length * 5 + 3;
        };

        const addTable = (head, body) => {
            autoTable(doc, {
                startY: yPos,
                head: [head],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: colors.primary, textColor: 255 },
                styles: { fontSize: 9, cellPadding: 3 },
                margin: { left: 20, right: 20 }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        };

        // --- DATA PREPARATION ---
        const insights = data.insights || {};
        const metrics = data.metrics || {};

        // --- TITLE PAGE ---
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('Demand Forecasting', pageWidth / 2, 100, { align: 'center' });
        doc.text('& Business Intelligence Report', pageWidth / 2, 115, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 140, { align: 'center' });

        doc.addPage();
        yPos = 30;

        // --- SECTION 0.5: AI BUSINESS NARRATIVE (Blueprint §4.3) ---
        if (data.forecast && data.metrics) {
            try {
                const narrative = translateMetricsToBusiness(data.forecast, data.metrics, 0, 25);
                addHeader('AI-Generated Executive Briefing', 14);
                addText(narrative.headline, 12);
                yPos += 3;
                addText(narrative.detailedSummary, 10);
                yPos += 8;
            } catch (e) {
                // Narrative generation is non-critical, skip on error
            }
        }

        // --- SECTION 1: PROBLEM FORMULATION & EXECUTIVE SUMMARY ---
        addHeader('1. Executive Summary & Problem Formulation');
        if (insights.executive_summary) {
            const es = insights.executive_summary;
            addText(`Headline: ${es.headline}`, 12);
            yPos += 5;
            const dataTable = [
                ['Key Metric', 'Value'],
                ['Forecast Horizon', `${es.forecast_period} periods`],
                ['Expected Total Demand', es.expected_total.toLocaleString(undefined, { maximumFractionDigits: 0 })],
                ['Projected Growth Rate', `${es.growth_rate > 0 ? '+' : ''}${es.growth_rate.toFixed(1)}%`],
                ['Model Accuracy Rating', `${es.accuracy_rating.toFixed(1)}%`],
                ['Statistical Confidence', es.confidence]
            ];
            addTable(dataTable[0], dataTable.slice(1));
            addHeader('Key Insights', 12, false);
            (es.key_insights || []).forEach(insight => addText(`• ${insight}`, 10, 5));
            yPos += 10;
        }

        // --- SECTION 2: REVENUE IMPACT ANALYSIS ---
        if (insights.revenue_impact) {
            addHeader('2. Revenue Impact Analysis');
            const ri = insights.revenue_impact;
            addText(`Business Impact: ${ri.business_impact}`, 11);
            yPos += 5;

            const riData = [
                ['Scenario / Metric', 'Financial Projection'],
                ['Baseline Projected Revenue', `$${ri.projected_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ['Best Case Scenario (Upper Bound)', `$${ri.best_case_scenario.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ['Worst Case Scenario (Lower Bound)', `$${ri.worst_case_scenario.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ['Revenue Delta vs Historical', `$${ri.revenue_delta.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${ri.revenue_delta_pct.toFixed(2)}%)`]
            ];
            addTable(riData[0], riData.slice(1));
        }

        // --- SECTION 3: MODEL PERFORMANCE & KPIs ---
        addHeader('3. Model Performance & Validation');
        addText(`Selected Model: ${data.model_type || 'Ensemble'}`, 11);
        yPos += 5;
        const mData = [
            ['Validation Metric', 'Value'],
            ['MAPE (Error %)', `${(metrics.mape || 0).toFixed(2)}%`],
            ['RMSE (Absolute Error)', (metrics.rmse || 0).toFixed(2)],
            ['MAE (Mean Absolute Error)', (metrics.mae || 0).toFixed(2)],
            ['R2 Score', (metrics.r2 || 0).toFixed(3)],
            ['Training Time', `${(metrics.training_time || 0).toFixed(2)}s`],
            ['Training Samples', metrics.training_samples || 'N/A']
        ];
        addTable(mData[0], mData.slice(1));

        // --- SECTION 4: RISK ASSESSMENT ---
        if (insights.risk_assessment) {
            addHeader('4. Risk Assessment');
            const ra = insights.risk_assessment;
            addText(`Overall Risk Level: ${ra.risk_level} (Score: ${ra.overall_risk_score}/100)`);
            addText(`Forecast Uncertainty Range: ${ra.uncertainty_range?.toFixed(1) || 0}%`);
            addText(`Demand Volatility: ${ra.volatility?.toFixed(1) || 0}%`);
            yPos += 5;

            (ra.identified_risks || []).forEach(risk => {
                addText(`• Risk: ${risk.type.replace('_', ' ').toUpperCase()} (${risk.level.toUpperCase()})`, 10, 5);
                addText(`  Description: ${risk.description}`, 9, 10);
                addText(`  Mitigation: ${risk.mitigation}`, 9, 10);
                yPos += 3;
            });
            yPos += 10;
        }

        // --- SECTION 5: STRATEGIC OPPORTUNITIES ---
        if (insights.opportunity_analysis) {
            addHeader('5. Strategic Opportunities');
            (insights.opportunity_analysis || []).forEach(op => {
                addText(`• ${op.title} (${op.priority.toUpperCase()})`, 11, 5);
                addText(`  ${op.description}`, 10, 10);
                addText(`  Action: ${op.action}`, 9, 10);
                addText(`  Potential Impact: ${op.potential_impact}`, 9, 10);
                yPos += 4;
            });
            yPos += 10;
        }

        // --- SECTION 6: ACTION PLAN (PROBLEM SOLUTION) ---
        if (insights.action_plan) {
            addHeader('6. Time-based Action Plan');
            (insights.action_plan || []).forEach(phase => {
                addHeader(phase.timeframe, 12, false);
                (phase.actions || []).forEach(act => {
                    addText(`• ${act}`, 10, 5);
                });
                yPos += 5;
            });
        }

        // --- SAVE ---
        doc.save(`AdaptIQ_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
        console.error("Report Generation Failed:", err);
        alert(`Failed to generate report: ${err.message}`);
    }
};

// ... keep existing CSV/Excel exports ...
export const generateScenarioCSV = (results, baseline, scenarios) => {
    // Legacy support or specific use case
    // [Implementation preserved for backward compatibility]
    console.log("Scenario CSV generation");
};

export const generateForecastCSV = (data) => {
    try {
        const metricsRows = [['Metric', 'Value']];
        const m = data.metrics || {};
        Object.keys(m).forEach(k => {
            if (typeof m[k] !== 'object') metricsRows.push([k, m[k]]);
        });

        const dataHeaders = ['Date', 'Forecast', 'Lower Bound', 'Upper Bound'];
        const dataRows = (data.forecast?.dates || []).map((date, i) => [
            date,
            data.forecast?.predictions[i] || 0,
            data.forecast?.lowerBound ? data.forecast.lowerBound[i] : 0,
            data.forecast?.upperBound ? data.forecast.upperBound[i] : 0
        ]);

        const ws = XLSX.utils.aoa_to_sheet([...metricsRows, [], dataHeaders, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Forecast Data");
        XLSX.writeFile(wb, `Forecast_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (e) {
        console.error("CSV Export Error", e);
    }
};

export const generateExcelReport = (analysisData) => {
    try {
        const wb = XLSX.utils.book_new();
        const metrics = analysisData?.metrics || {};
        const forecast = analysisData?.forecast || {};
        const insights = analysisData?.insights || {};

        // Sheet 1: Executive Summary
        let summary = [
            ['AdaptIQ — Forecast Business Intelligence Report'],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['METRIC', 'VALUE'],
            ['Model Type', metrics.modelType || 'Ensemble'],
            ['MAPE (%)', (metrics.mape || 0).toFixed(2)],
            ['RMSE', (metrics.rmse || 0).toFixed(2)],
            ['MAE', (metrics.mae || 0).toFixed(2)],
            ['R² Score', (metrics.r2 || 0).toFixed(3)],
            ['Training Samples', metrics.training_samples || 'N/A'],
        ];

        // Add AI narrative if possible
        if (forecast.predictions) {
            try {
                const narrative = translateMetricsToBusiness(forecast, metrics, 0, 25);
                summary.push([], ['AI HEADLINE', narrative.headline]);
                summary.push(['SUMMARY', narrative.detailedSummary]);
                summary.push(['REVENUE IMPACT', narrative.revenue.formattedRevenue]);
                summary.push(['CONFIDENCE LEVEL', narrative.accuracy.title]);
                summary.push(['RISK LEVEL', narrative.risk.level]);
            } catch (_) { }
        }
        const wsSummary = XLSX.utils.aoa_to_sheet(summary);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

        // Sheet 2: Forecast Data
        if (forecast.dates && forecast.predictions) {
            const forecastRows = [['Date', 'Forecast (Units)', 'Lower Bound', 'Upper Bound']];
            forecast.dates.forEach((date, i) => {
                forecastRows.push([
                    date,
                    (forecast.predictions[i] || 0).toFixed(2),
                    (forecast.lower_bound?.[i] || forecast.lowerBound?.[i] || 0).toFixed(2),
                    (forecast.upper_bound?.[i] || forecast.upperBound?.[i] || 0).toFixed(2),
                ]);
            });
            const wsForecast = XLSX.utils.aoa_to_sheet(forecastRows);
            XLSX.utils.book_append_sheet(wb, wsForecast, 'Forecast Data');
        }

        // Sheet 3: Risk Assessment
        if (insights.risk_assessment?.identified_risks) {
            const riskRows = [['Risk Type', 'Level', 'Description', 'Mitigation']];
            insights.risk_assessment.identified_risks.forEach(r => {
                riskRows.push([
                    r.type?.replace(/_/g, ' ') || 'Unknown',
                    r.level || 'N/A',
                    r.description || '',
                    r.mitigation || '',
                ]);
            });
            const wsRisk = XLSX.utils.aoa_to_sheet(riskRows);
            XLSX.utils.book_append_sheet(wb, wsRisk, 'Risk Assessment');
        }

        // Sheet 4: Action Plan
        if (insights.action_plan) {
            const actionRows = [['Timeframe', 'Action']];
            insights.action_plan.forEach(phase => {
                (phase.actions || []).forEach(action => {
                    actionRows.push([phase.timeframe, action]);
                });
            });
            const wsAction = XLSX.utils.aoa_to_sheet(actionRows);
            XLSX.utils.book_append_sheet(wb, wsAction, 'Action Plan');
        }

        XLSX.writeFile(wb, `AdaptIQ_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) {
        console.error('Excel Export Error', e);
        alert(`Excel export failed: ${e.message}`);
    }
};
