import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFlow } from '../context/FlowContext';
import {
    FileText, Download, Calendar, Check, Loader2, FileSpreadsheet,
    FileCode, Brain, AlertCircle, ChevronRight, Clock, BarChart3,
    Sparkles, Star, TrendingUp, Shield
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
    const [recentReports, setRecentReports] = useState([]);

    useEffect(() => {
        if (flowAnalysisResults) { setAnalysisData(flowAnalysisResults); return; }
        const savedResults = localStorage.getItem('analysisResults');
        if (savedResults) setAnalysisData(JSON.parse(savedResults));
    }, [flowAnalysisResults]);

    useEffect(() => {
        const saved = localStorage.getItem('recentReports');
        if (saved) setRecentReports(JSON.parse(saved));
    }, [exportSuccess]);

    const handleGenerateReport = async () => {
        if (!analysisData) return;
        setGenerating(true); setExportSuccess(false);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            if (format === 'pdf') generatePDFReport(displayData, reportType);
            else if (format === 'excel') generateExcelReport(displayData);
            else if (format === 'csv') generateForecastCSV(displayData);

            setExportSuccess(true);
            const recentReports = JSON.parse(localStorage.getItem('recentReports') || '[]');
            recentReports.unshift({
                id: Date.now(), name: getReportName(reportType), type: reportType, format: format.toUpperCase(),
                date: new Date().toISOString(), size: format === 'pdf' ? '~500 KB' : format === 'excel' ? '~150 KB' : '~50 KB'
            });
            localStorage.setItem('recentReports', JSON.stringify(recentReports.slice(0, 10)));
        } catch (error) { console.error('Export failed:', error); }
        finally { setGenerating(false); }
    };

    const getReportName = (type) => ({ comprehensive: 'Comprehensive Analysis Report', forecast: 'Forecast Summary Report', metrics: 'Model Performance Report', insights: 'Business Insights Report' }[type] || 'Analysis Report');

    const formatTypes = [
        { id: 'pdf', label: 'PDF Report', icon: FileText, desc: 'Professional document with charts', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', active: 'border-red-400 bg-red-50/80' },
        { id: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet, desc: 'Multi-sheet data workbook', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', active: 'border-emerald-400 bg-emerald-50/80' },
        { id: 'csv', label: 'CSV Data', icon: FileCode, desc: 'Raw forecast data export', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', active: 'border-blue-400 bg-blue-50/80' },
    ];

    const reportTypes = [
        { id: 'comprehensive', label: 'Comprehensive Report', desc: 'All sections: summary, metrics, forecasts, insights', icon: Star },
        { id: 'forecast', label: 'Forecast Only', desc: 'Focus on predictions and future outlook', icon: TrendingUp },
        { id: 'metrics', label: 'Performance Metrics', desc: 'Model accuracy and training details', icon: BarChart3 },
        { id: 'insights', label: 'Business Insights', desc: 'Trends, risks, and recommendations', icon: Shield },
    ];

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
    const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    // Realistic engaging demo data
    const DEMO_DATA = {
        forecast: {
            predictions: [4500, 4800, 5100, 5050, 5300, 5600, 5900],
            dates: ['2023-11-01', '2023-11-02', '2023-11-03', '2023-11-04', '2023-11-05', '2023-11-06', '2023-11-07']
        },
        metrics: { mape: 6.8, rmse: 142.5, r2: 0.93, modelType: 'XGBoost Ensemble', accuracyRating: 'Excellent' },
        insights: { opportunity_analysis: [], risk_assessment: {} },
        profile: { dimensions: { rows: 25000, cols: 15 } },
        isDemo: true
    };

    const displayData = analysisData || DEMO_DATA;

    const mape = displayData.metrics?.mape || 4.5;
    const accuracy = (100 - mape).toFixed(1);
    const modelName = displayData.metrics?.modelType || 'Prophet + XGBoost Ensemble';

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

            {/* Hero Banner */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-6 text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)' }}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Analysis Ready</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{modelName}</h2>
                        <div className="flex items-center gap-4 text-sm text-white/75 flex-wrap">
                            <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" />MAPE: {mape.toFixed ? mape.toFixed(2) : mape}%</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{displayData.profile?.dimensions?.rows || 25000} records</span>
                            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />Accuracy: {accuracy}%</span>
                            {displayData.isDemo && (
                                <span className="px-2 py-0.5 ml-2 rounded bg-amber-500/20 text-amber-200 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                                    Demo Mode
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                        <div className="text-xs text-white/70 mb-1">Accuracy Rating</div>
                        <div className="text-2xl font-bold text-white">{displayData.metrics?.accuracyRating || 'Excellent'}</div>
                    </div>
                </div>
            </motion.div>

            {/* Report Config Card */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Generate Professional Report</h3>
                        <p className="text-xs text-slate-400">Choose type and format, then download</p>
                    </div>
                </div>

                {/* Report Type */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Report Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {reportTypes.map((type) => {
                            const Icon = type.icon;
                            const isActive = reportType === type.id;
                            return (
                                <motion.button key={type.id} onClick={() => setReportType(type.id)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${isActive ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                                        <span className={`font-semibold text-sm ${isActive ? 'text-brand-700' : 'text-slate-700'}`}>{type.label}</span>
                                        {isActive && <Check className="w-3.5 h-3.5 text-brand-500 ml-auto" />}
                                    </div>
                                    <p className="text-xs text-slate-400 pl-6">{type.desc}</p>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Format */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Export Format</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {formatTypes.map((f) => {
                            const Icon = f.icon;
                            const isActive = format === f.id;
                            return (
                                <motion.button key={f.id} onClick={() => setFormat(f.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${isActive ? f.active : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                                    <Icon className={`w-6 h-6 mb-2 ${isActive ? f.color : 'text-slate-400'}`} />
                                    <div className={`font-semibold text-sm ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>{f.label}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{f.desc}</div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Includes checklist */}
                <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Report Will Include</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {['Executive Summary', 'Dataset Profile', 'Model Metrics', 'Forecast Data', 'Confidence Intervals', 'Business Insights', 'Risk Analysis', 'Recommendations'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <div className="flex items-center gap-4 flex-wrap">
                    <motion.button onClick={handleGenerateReport} disabled={generating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                        {generating ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <><Download className="w-5 h-5" />Generate &amp; Download</>}
                    </motion.button>
                    <AnimatePresence>
                        {exportSuccess && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                                <Check className="w-4 h-4" /> Downloaded successfully!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Recent Reports */}
            {recentReports.length > 0 && (
                <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Recent Reports
                    </h3>
                    <div className="space-y-2">
                        {recentReports.slice(0, 5).map((report, index) => {
                            const iconColor = report.format === 'PDF' ? 'text-red-500 bg-red-50' : report.format === 'EXCEL' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-500 bg-blue-50';
                            const Icon = report.format === 'PDF' ? FileText : report.format === 'EXCEL' ? FileSpreadsheet : FileCode;
                            return (
                                <motion.div key={report.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-default">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-700 text-sm truncate">{report.name}</p>
                                        <p className="text-xs text-slate-400">{new Date(report.date).toLocaleDateString()} • {report.format} • {report.size}</p>
                                    </div>
                                    <span className="text-xs text-slate-400 flex-shrink-0">{getTimeAgo(report.date)}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </motion.div>
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
