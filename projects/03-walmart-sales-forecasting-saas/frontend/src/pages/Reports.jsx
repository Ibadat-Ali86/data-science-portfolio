import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useFlow } from '../context/FlowContext';
import {
    FileText,
    Download,
    Calendar,
    Check,
    Loader2,
    FileSpreadsheet,
    FileCode,
    Brain,
    AlertCircle,
    ChevronRight,
    Clock,
    BarChart3
} from 'lucide-react';
import { generatePDFReport, generateExcelReport, generateForecastCSV } from '../utils/reportGenerator';


const Reports = () => {
    const navigate = useNavigate();
    const { analysisResults: flowAnalysisResults } = useFlow();
    const [reportType, setReportType] = useState('comprehensive');
    const [format, setFormat] = useState('pdf');
    const [generating, setGenerating] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Load analysis data from FlowContext first, then fallback to localStorage
    useEffect(() => {
        // Priority 1: FlowContext data
        if (flowAnalysisResults) {
            setAnalysisData(flowAnalysisResults);
            return;
        }

        // Priority 2: localStorage fallback
        const savedResults = localStorage.getItem('analysisResults');
        if (savedResults) {
            setAnalysisData(JSON.parse(savedResults));
        }
    }, [flowAnalysisResults]);

    const handleGenerateReport = async () => {
        if (!analysisData) return;

        setGenerating(true);
        setExportSuccess(false);

        try {
            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (format === 'pdf') {
                // Determine report type based on selection
                let type = 'comprehensive';
                if (reportType === 'forecast') type = 'forecast';
                else if (reportType === 'metrics') type = 'metrics';
                else if (reportType === 'insights') type = 'insights';

                generatePDFReport(analysisData, type);
            } else if (format === 'excel') {
                generateExcelReport(analysisData);
            } else if (format === 'csv') {
                generateForecastCSV(analysisData);
            }

            setExportSuccess(true);

            // Save to recent reports
            const recentReports = JSON.parse(localStorage.getItem('recentReports') || '[]');
            recentReports.unshift({
                id: Date.now(),
                name: getReportName(reportType),
                type: reportType,
                format: format.toUpperCase(),
                date: new Date().toISOString(),
                size: format === 'pdf' ? '~500 KB' : format === 'excel' ? '~150 KB' : '~50 KB'
            });
            localStorage.setItem('recentReports', JSON.stringify(recentReports.slice(0, 10)));

        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message}`);
        } finally {
            setGenerating(false);
        }
    };

    const getReportName = (type) => {
        const names = {
            comprehensive: 'Comprehensive Analysis Report',
            forecast: 'Forecast Summary Report',
            metrics: 'Model Performance Report',
            insights: 'Business Insights Report'
        };
        return names[type] || 'Analysis Report';
    };

    const [recentReports, setRecentReports] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('recentReports');
        if (saved) {
            setRecentReports(JSON.parse(saved));
        }
    }, [exportSuccess]);

    const formatTypes = [
        { id: 'pdf', label: 'PDF Report', icon: FileText, desc: 'Professional formatted document with charts and tables' },
        { id: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet, desc: 'Multi-sheet workbook with all data and analysis' },
        { id: 'csv', label: 'CSV Data', icon: FileCode, desc: 'Raw forecast data for further analysis' },
    ];

    const reportTypes = [
        { id: 'comprehensive', label: 'Comprehensive Report', desc: 'All sections: summary, profile, metrics, forecasts, insights, recommendations' },
        { id: 'forecast', label: 'Forecast Only', desc: 'Focus on forecast data and predictions' },
        { id: 'metrics', label: 'Performance Metrics', desc: 'Model accuracy and training details' },
        { id: 'insights', label: 'Business Insights', desc: 'Trends, risks, and recommendations' },
    ];

    // No analysis data - prompt to run analysis first
    if (!analysisData) {
        return (
            <Layout title="Reports">
                <div className="max-w-3xl mx-auto mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-8 text-center border shadow-xl"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                    >
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                            <AlertCircle className="w-10 h-10" style={{ color: 'var(--accent-orange)' }} />
                        </div>

                        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            No Analysis Data Available
                        </h2>
                        <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            To generate professional reports, you first need to complete an analysis.
                            Run the ML pipeline to analyze your data and generate forecasts.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/analysis')}
                            className="btn-primary"
                        >
                            <Brain className="w-5 h-5" />
                            Go to Analysis Pipeline
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Reports">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Analysis Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold opacity-90 text-white">Analysis Data Available</h3>
                            <p className="text-2xl font-bold mt-1 text-white">
                                {analysisData.metrics?.modelType || 'Prophet + XGBoost Ensemble'}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm opacity-80 text-white/80">
                                <span className="flex items-center gap-1">
                                    <BarChart3 className="w-4 h-4" />
                                    MAPE: {(analysisData.metrics?.mape || 4.5).toFixed(2)}%
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {analysisData.profile?.dimensions?.rows || 360} records
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-80 text-white/80">Accuracy Rating</div>
                            <div className="text-3xl font-bold text-white">
                                {analysisData.metrics?.accuracyRating || 'Excellent'}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                </motion.div>

                {/* Generate Report Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <FileText className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                        Generate Professional Report
                    </h3>

                    {/* Report Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Report Type
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reportTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className={`p-4 rounded-lg border text-left transition-all ${reportType === type.id
                                        ? 'border-[var(--accent-blue)] bg-[rgba(74,158,255,0.1)]'
                                        : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                                        }`}
                                    style={{ background: reportType === type.id ? 'rgba(74,158,255,0.05)' : 'var(--bg-tertiary)' }}
                                >
                                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{type.label}</div>
                                    <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Export Format Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Export Format
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {formatTypes.map((formatOption) => (
                                <button
                                    key={formatOption.id}
                                    onClick={() => setFormat(formatOption.id)}
                                    className={`p-4 rounded-lg border text-left transition-all ${format === formatOption.id
                                        ? 'border-[var(--accent-purple)]'
                                        : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                                        }`}
                                    style={{ background: format === formatOption.id ? 'rgba(183,148,246,0.05)' : 'var(--bg-tertiary)' }}
                                >
                                    <formatOption.icon className="w-6 h-6 mb-2" style={{ color: format === formatOption.id ? 'var(--accent-purple)' : 'var(--text-tertiary)' }} />
                                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatOption.label}</div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{formatOption.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Report Contents Preview */}
                    <div className="mb-6 p-4 rounded-lg border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                        <h4 className="font-medium mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>Report Will Include:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {[
                                'Executive Summary',
                                'Dataset Profile',
                                'Model Metrics',
                                'Forecast Data',
                                'Confidence Intervals',
                                'Business Insights',
                                'Risk Analysis',
                                'Recommendations'
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className="btn-primary"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Generate & Download
                                </>
                            )}
                        </motion.button>

                        {exportSuccess && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                                style={{ color: 'var(--accent-green)' }}
                            >
                                <Check className="w-5 h-5" />
                                <span className="font-medium">Report downloaded successfully!</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Reports */}
                {recentReports.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Recent Reports
                        </h3>

                        <div className="space-y-3">
                            {recentReports.slice(0, 5).map((report, index) => (
                                <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-[var(--bg-tertiary)] transition-all"
                                    style={{ borderColor: 'var(--border-primary)' }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                                            style={{ background: 'rgba(74, 158, 255, 0.1)' }}>
                                            {report.format === 'PDF' ? (
                                                <FileText className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
                                            ) : report.format === 'EXCEL' ? (
                                                <FileSpreadsheet className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
                                            ) : (
                                                <FileCode className="w-6 h-6" style={{ color: 'var(--accent-purple)' }} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{report.name}</h4>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                {new Date(report.date).toLocaleDateString()} • {report.format} • {report.size}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                        <Clock className="w-4 h-4" />
                                        {getTimeAgo(report.date)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

export default Reports;
