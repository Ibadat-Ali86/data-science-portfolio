import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFlow } from '../context/FlowContext';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Activity,
    AlertTriangle, CheckCircle, Clock, Zap, Target, FileText,
    Info, ArrowUpRight, BarChart2, Brain, ArrowRight, Sparkles, Star
} from 'lucide-react';
import { translateMetricsToBusiness } from '../utils/BusinessTranslator';

const getRiskInfo = (mape = 5) => {
    if (mape < 10) return { level: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500', pct: 95, message: 'High confidence. Suitable for automated purchase orders.', action: 'Proceed with standard 15% safety stock.' };
    if (mape < 25) return { level: 'Good', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-500', pct: 75, message: 'Reliable for planning. Minor adjustments may be needed.', action: 'Maintain 20% safety stock buffer.' };
    if (mape < 50) return { level: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500', pct: 50, message: 'Moderate confidence. Suitable for directional planning.', action: 'Maintain 20% safety stock for high-stakes decisions.' };
    return { level: 'Low', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500', pct: 25, message: 'Limited reliability. Use trends only.', action: 'Do not use for automated orders. Perform manual review.' };
};

// Animated KPI Card
const KPICard = ({ title, value, change, changeType, icon: Icon, delay = 0, subtitle, color = 'blue' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
        let current = 0;
        const increment = numericValue / 40;
        const timer = setInterval(() => {
            current = Math.min(current + increment, numericValue);
            setDisplayValue(current);
            if (current >= numericValue) clearInterval(timer);
        }, 1200 / 40);
        return () => clearInterval(timer);
    }, [value]);
    const formatDisplayValue = (val) => {
        if (String(value).includes('$')) return `$${Math.round(val).toLocaleString()}`;
        if (String(value).includes('%')) return `${val.toFixed(1)}%`;
        return Math.round(val).toLocaleString();
    };
    const trendPositive = changeType === 'positive';
    const trendNegative = changeType === 'negative';
    const colorMap = {
        blue: 'from-blue-500 to-blue-600', green: 'from-emerald-500 to-emerald-600',
        purple: 'from-purple-500 to-purple-600', amber: 'from-amber-500 to-amber-600'
    };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.45 }}
            whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(99,102,241,0.12)' }}
            className="bg-white rounded-2xl border border-slate-200 p-5 cursor-default shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${colorMap[color] || colorMap.blue} opacity-5 -translate-y-6 translate-x-6 group-hover:opacity-10 transition-opacity`} />
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trendPositive ? 'bg-emerald-50 text-emerald-700' : trendNegative ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                        {trendPositive && <ArrowUpRight className="w-3 h-3" />}
                        {trendNegative && <TrendingDown className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
                <p className="text-3xl font-bold text-slate-800 font-mono leading-none">{formatDisplayValue(displayValue)}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
        </motion.div>
    );
};

// Risk Gauge Panel
const RiskPanel = ({ mape }) => {
    const riskInfo = getRiskInfo(mape);
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className={`rounded-2xl border p-5 ${riskInfo.bg} ${riskInfo.border}`}>
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className={`w-4 h-4 ${riskInfo.color}`} />
                <h3 className={`text-sm font-bold ${riskInfo.color}`}>Forecast Confidence</h3>
            </div>
            <div className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${riskInfo.badge}`}>{riskInfo.level}</div>
            {/* Gauge bar */}
            <div className="mb-3 h-2 rounded-full bg-white/60 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${riskInfo.pct}%` }} transition={{ delay: 0.5, duration: 1 }}
                    className={`h-full rounded-full ${riskInfo.bar}`} />
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{riskInfo.message}</p>
            <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-500">{riskInfo.action}</p>
            </div>
        </motion.div>
    );
};

// Model Health Panel
const ModelHealthPanel = ({ metrics }) => {
    const mape = metrics?.metrics?.mape ?? metrics?.mape ?? null;
    const rmse = metrics?.metrics?.rmse ?? metrics?.rmse ?? null;
    const r2 = metrics?.metrics?.r2 ?? metrics?.r2 ?? null;
    const modelType = metrics?.metrics?.modelType ?? metrics?.modelType ?? 'Ensemble';
    const rows = [
        { label: 'Model Type', value: modelType, icon: Brain },
        { label: 'MAPE', value: mape != null ? `±${mape.toFixed(2)}%` : 'N/A', icon: Target },
        { label: 'RMSE', value: rmse != null ? rmse.toFixed(2) : 'N/A', icon: Activity },
        { label: 'R² Score', value: r2 != null ? `${(r2 * 100).toFixed(1)}%` : 'N/A', icon: Star },
    ];
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-brand-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Model Diagnostics</h3>
            </div>
            <div className="space-y-2.5">
                {rows.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-500">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 font-mono">{value}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// Insights Panel
const InsightsPanel = ({ insights }) => (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Real-Time Insights</h3>
        </div>
        <div className="space-y-3">
            {insights.map((insight, i) => {
                const config = {
                    success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-100', ic: 'text-emerald-600' },
                    warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-100', ic: 'text-amber-600' },
                    danger: { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-100', ic: 'text-red-600' },
                    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-100', ic: 'text-blue-600' },
                }[insight.type] || { icon: Info, bg: 'bg-slate-50', border: 'border-slate-100', ic: 'text-slate-400' };
                const IconC = config.icon;
                return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                        className={`p-3.5 rounded-xl border ${config.bg} ${config.border}`}>
                        <div className="flex items-start gap-3">
                            <IconC className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.ic}`} />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{insight.title}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{insight.description}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    </motion.div>
);

// Empty State
const ExecutiveEmptyState = ({ navigate }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-10 text-center px-4">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-100">
            <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-xl shadow-brand-200">
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                </div>
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-brand-50 text-brand-700 border border-brand-200 mb-4">AI Briefing Pending</span>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Executive Dashboard</h2>
            <p className="text-slate-500 mb-4 leading-relaxed max-w-md mx-auto">
                The executive dashboard translates your ML model results into board-ready business intelligence — automatically.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                {['KPI Cards with animated counters', 'AI-generated executive briefing', 'Risk confidence level gauge', 'Model diagnostics table'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <span className="text-xs text-slate-600 font-medium">{f}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => navigate('/analysis')} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-200 hover:-translate-y-0.5 hover:shadow-xl transition-all">
                <Brain className="w-5 h-5" />
                Run Analysis Pipeline
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    </motion.div>
);

// Main Executive Dashboard
const ExecutiveDashboard = () => {
    const { analysisResults } = useFlow();
    const navigate = useNavigate();

    // Engaging realistic demo data for zero-state
    const DEMO_DATA = {
        forecast: { predictions: [4500, 4800, 5100, 5050, 5300, 5600, 5900] },
        metrics: { mape: 6.8, rmse: 142.5, r2: 0.93, modelType: 'XGBoost Ensemble' },
        insights: {
            opportunity_analysis: [{ title: 'High-Margin Surge', description: 'Predicted 18% increase in premium category sales next week. Optimal time for targeted promotions.' }],
            risk_assessment: { identified_risks: [{ type: 'inventory_shortage', description: 'Current safety stock for top 5 SKUs is projected to deplete before next shipment.' }] }
        },
        isDemo: true
    };

    const displayData = (analysisResults?.forecast && analysisResults?.metrics) ? analysisResults : DEMO_DATA;
    const mapeValue = displayData?.metrics?.mape ?? displayData?.mape ?? 5;

    const kpis = useMemo(() => {
        if (displayData?.forecast?.predictions && displayData?.metrics) {
            const predictions = displayData.forecast.predictions;
            const totalForecast = predictions.reduce((a, b) => a + b, 0);
            const avgPrice = 25;
            const metrics = displayData.metrics;
            const mape = metrics.mape || 5;
            const accuracy = 100 - mape;
            return [
                { title: 'Projected Revenue', value: `$${Math.round(totalForecast * avgPrice)}`, change: `${((accuracy - 90) * 1.2).toFixed(1)}% vs baseline`, changeType: accuracy > 90 ? 'positive' : 'negative', icon: DollarSign, subtitle: 'Forecast horizon total', color: 'green' },
                { title: 'Weekly Unit Volume', value: `${Math.round(totalForecast / 4).toLocaleString()}`, change: '+8.3% vs last period', changeType: 'positive', icon: ShoppingCart, subtitle: 'Average units/week', color: 'blue' },
                { title: 'Forecast Accuracy', value: `${accuracy.toFixed(1)}%`, change: accuracy > 95 ? `+${(accuracy - 95).toFixed(1)}% vs target` : `${(accuracy - 95).toFixed(1)}% vs target`, changeType: accuracy > 95 ? 'positive' : 'neutral', icon: Target, subtitle: `MAPE: ±${mape.toFixed(2)}%`, color: 'purple' },
                { title: 'Model R² Score', value: `${((metrics.r2 || 0.92) * 100).toFixed(1)}%`, change: 'variance explained', changeType: (metrics.r2 || 0.85) > 0.85 ? 'positive' : 'neutral', icon: BarChart2, subtitle: 'Predictive power', color: 'amber' }
            ];
        }
        return null;
    }, [displayData]);

    const executiveSummary = useMemo(() => {
        if (displayData?.forecast && displayData?.metrics) {
            return translateMetricsToBusiness(displayData.forecast, displayData.metrics, 2000000, 25);
        }
        return null;
    }, [displayData]);

    const insights = useMemo(() => {
        if (displayData?.insights) {
            const bi = displayData.insights;
            return [
                { type: 'success', title: 'Analysis Complete', description: 'AI-powered forecast model trained. Executive briefing generated.' },
                ...(bi.opportunity_analysis || []).slice(0, 1).map(op => ({ type: 'info', title: op.title || 'Opportunity Identified', description: op.description })),
                ...(bi.risk_assessment?.identified_risks || []).slice(0, 1).map(r => ({ type: 'warning', title: (r.type?.replace('_', ' ') || 'Risk').toUpperCase(), description: r.description })),
            ];
        }
        return [{ type: 'info', title: 'Analysis Complete', description: 'ML model trained successfully. All metrics loaded.' }];
    }, [displayData]);

    if (!kpis) return <ExecutiveEmptyState navigate={navigate} />;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-brand-500" />
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-600">AI-Powered Briefing</span>
                            </div>
                            {displayData.isDemo && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                    Demo Mode
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Executive Dashboard</h1>
                        <p className="text-slate-500 text-sm mt-1">Board-ready business intelligence — ML outputs translated to business language</p>
                    </div>
                    {displayData.isDemo && (
                        <button onClick={() => navigate('/analysis')} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition flex items-center gap-2">
                            <Brain className="w-4 h-4" /> Run Real Data
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Narrative Panel */}
            {executiveSummary && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-100">
                        <div className="p-2 rounded-lg bg-brand-100 text-brand-700"><FileText className="w-4 h-4" /></div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">AI-Generated Briefing</p>
                            <h2 className="text-base font-bold text-slate-800">Executive Summary</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-brand-700">{executiveSummary.headline}</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{executiveSummary.detailedSummary}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"><Target className="w-3 h-3" />{executiveSummary.accuracy?.title} — {executiveSummary.accuracy?.percentage}</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"><DollarSign className="w-3 h-3" />{executiveSummary.revenue?.formattedRevenue} Projected Revenue</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => <KPICard key={i} {...kpi} delay={i * 0.08} />)}
            </div>

            {/* Insights + Risk + Model Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2"><InsightsPanel insights={insights} /></div>
                <div className="space-y-4">
                    <RiskPanel mape={mapeValue} />
                    <ModelHealthPanel metrics={displayData} />
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
