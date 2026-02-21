import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    Database,
    BarChart3,
    Calendar,
    ArrowRight,
    CheckCircle,
    Info,
    LayoutGrid,
    Search
} from 'lucide-react';
import AnalysisStatCard from './AnalysisStatCard';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

/**
 * ProfessionalDatasetProfiler - High-fidelity analysis dashboard
 * AUTO-PROCEEDS to preprocessing after 4 seconds of showing the profile.
 */
const ProfessionalDatasetProfiler = ({ data, onProfileComplete, externalProfile }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(4);
    const [autoProceed, setAutoProceed] = useState(false);

    // Use external profile or generate one
    const profile = externalProfile || generateProfile(data);

    // Auto-proceed countdown
    useEffect(() => {
        let interval;
        let timeout;
        if (profile && onProfileComplete) {
            interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            timeout = setTimeout(() => {
                setAutoProceed(true);
                onProfileComplete && onProfileComplete(profile);
            }, 4000);
        }
        return () => { clearInterval(interval); clearTimeout(timeout); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Staggered animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div variants={item} className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <LayoutGrid className="w-6 h-6" />
                        </span>
                        Dataset Analysis
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        Comprehensive profiling and quality assessment of your data.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                        AI Analysis Active
                    </span>
                </div>
            </motion.div>

            {/* 3D Stat Cards Grid */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalysisStatCard
                    label="Total Rows"
                    value={profile.dimensions.rows.toLocaleString()}
                    icon={<Database className="w-6 h-6" />}
                    color="blue"
                    delay={0.1}
                />
                <AnalysisStatCard
                    label="Features"
                    value={profile.dimensions.columns}
                    icon={<BarChart3 className="w-6 h-6" />}
                    color="purple"
                    delay={0.2}
                />
                <AnalysisStatCard
                    label="Date Range"
                    value={`${profile.dimensions.timeSpanDays} Days`}
                    icon={<Calendar className="w-6 h-6" />}
                    color="green"
                    delay={0.3}
                />
                <AnalysisStatCard
                    label="Data Health"
                    value={`${profile.dataQuality.completeness}%`}
                    icon={<ShieldCheck className="w-6 h-6" />}
                    color={parseFloat(profile.dataQuality.completeness) > 90 ? 'blue' : 'yellow'}
                    delay={0.4}
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Key Business Insights - Left Column (2/3 width) */}
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Key Business Insights
                        </h3>

                        <div className="space-y-4 relative z-10">
                            {profile.businessInsights.length > 0 ? (
                                profile.businessInsights.map((insight, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (idx * 0.1) }}
                                        className="group p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                                                <Search className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                                                    {insight}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center p-8 text-slate-400">
                                    No specific insights detected. Try uploading a richer dataset.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quality Assessment Details */}
                    {profile.dataQuality.missingCount > 0 && (
                        <motion.div variants={item} className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-amber-900 mb-2">Data Quality Attention Needed</h4>
                                    <p className="text-amber-800 mb-4">
                                        We detected <span className="font-bold">{profile.dataQuality.missingCount} missing values</span> across your dataset.
                                        Don't worry - our preprocessing step can handle this automatically.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(profile.dataQuality.missingByColumn).map(([col, count]) => (
                                            count > 0 && (
                                                <span key={col} className="px-3 py-1 bg-white/60 text-amber-800 rounded-full text-sm border border-amber-200">
                                                    {col}: {count} missing
                                                </span>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Right Column - Actions & Summary */}
                <motion.div variants={item} className="space-y-6">
                    {/* Readiness Score Card */}
                    <div className={`p-6 rounded-2xl border ${profile.forecastingReadiness.ready
                        ? 'bg-gradient-to-br from-white to-green-50 border-green-100'
                        : 'bg-gradient-to-br from-white to-amber-50 border-amber-100'
                        } shadow-lg shadow-slate-200/50`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Readiness Score</h3>
                            {profile.forecastingReadiness.ready ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                            )}
                        </div>

                        <div className="mb-6">
                            <div className="text-4xl font-bold mb-1 text-slate-900">
                                {profile.forecastingReadiness.ready ? 'High' : 'Medium'}
                            </div>
                            <p className="text-sm text-slate-500">
                                {profile.forecastingReadiness.message}
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendations</h4>
                            <ul className="space-y-2">
                                {profile.forecastingReadiness.recommendations.slice(0, 3).map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Auto-proceed countdown */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            {autoProceed ? (
                                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    Processing your data…
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                                        {countdown}
                                    </div>
                                    <span className="text-sm text-slate-500">Auto-proceeding to preprocessing in {countdown}s…</span>
                                </div>
                            )}
                            <button
                                onClick={() => { onProfileComplete && onProfileComplete(profile); }}
                                disabled={autoProceed}
                                className="px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition-all disabled:opacity-50"
                            >
                                Proceed Now →
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats or Tips */}
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-700 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                        <div className="relative z-10">
                            <h4 className="font-bold text-lg mb-2">Did you know?</h4>
                            <p className="text-indigo-200 text-sm leading-relaxed">
                                Improving data completeness by just 10% can increase forecast accuracy by up to 25% in retail scenarios.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Helper: Generate profile from data if not provided
const generateProfile = (data) => {
    if (!data || !data.length) return getEmptyProfile();

    const columns = Object.keys(data[0] || {});
    const rows = data.length;

    // Detect date column (case-insensitive check)
    const dateColumn = columns.find(col => /date|time/i.test(col));

    // Calculate date range
    let dateRange = { min: null, max: null, span: 0 };
    if (dateColumn) {
        const dates = data
            .map(row => new Date(row[dateColumn]))
            .filter(d => !isNaN(d.getTime()));

        if (dates.length) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const diffTime = Math.abs(maxDate - minDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            dateRange = { min: minDate, max: maxDate, span: diffDays };
        }
    }

    // Missing Values
    const missingByColumn = {};
    let totalMissing = 0;
    columns.forEach(col => {
        const missingCount = data.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
        missingByColumn[col] = missingCount;
        totalMissing += missingCount;
    });

    // Business Insights Logic (Simplified)
    const businessInsights = [];
    const salesCol = columns.find(col => /sales|quantity|amount|revenue/i.test(col));

    if (salesCol) {
        const values = data.map(row => parseFloat(row[salesCol])).filter(n => !isNaN(n));
        if (values.length) {
            const sum = values.reduce((a, b) => a + b, 0);
            const mean = sum / values.length;
            businessInsights.push(`Average ${salesCol}: ${mean.toLocaleString(undefined, { maximumFractionDigits: 0 })} units per record.`);

            // Volatility
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const cv = (stdDev / mean) * 100;

            if (cv > 50) businessInsights.push(`High demand volatility detected (${cv.toFixed(1)}% CV). Seasonality check recommended.`);
            else if (cv < 20) businessInsights.push(`Stable demand pattern detected (${cv.toFixed(1)}% CV). Standard regression models should perform well.`);
        }
    }

    if (dateRange.span > 365) businessInsights.push(`Extensive historical data (${dateRange.span} days) available to capture annual seasonality.`);
    else if (dateRange.span > 0) businessInsights.push(`Data covers ${dateRange.span} days. Short-term forecasting is viable.`);

    businessInsights.push(`Dataset contains ${rows.toLocaleString()} records across ${columns.length} attributes.`);

    // Readiness
    const completeness = ((1 - (totalMissing / (rows * columns.length))) * 100).toFixed(1);
    const isReady = parseFloat(completeness) > 85 && rows > 50 && !!dateColumn;

    return {
        dimensions: { rows, columns: columns.length, timeSpanDays: dateRange.span },
        dataQuality: { missingCount: totalMissing, missingByColumn, completeness },
        businessInsights,
        forecastingReadiness: {
            ready: isReady,
            message: isReady ? 'Your dataset is in great shape for forecasting.' : 'Some data cleanup is recommended.',
            recommendations: [
                'Consider using Prophet or SARIMA models.',
                dateRange.span < 365 ? 'More historical data would improve seasonality detection.' : 'Annual patterns can be modeled robustly.',
                'Aggregation to weekly level might reduce noise.'
            ]
        }
    };
};

const getEmptyProfile = () => ({
    dimensions: { rows: 0, columns: 0, timeSpanDays: 0 },
    dataQuality: { missingCount: 0, missingByColumn: {}, completeness: '0.0' },
    businessInsights: [],
    forecastingReadiness: { ready: false, message: 'No data', recommendations: [] }
});

export default ProfessionalDatasetProfiler;
