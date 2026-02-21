import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    Info,
    ShieldAlert,
    BrainCircuit,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Sparkles,
    FileUp,
    Calculator,
    RefreshCw,
    XCircle,
    HelpCircle
} from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

/**
 * Enhanced Gap Analysis Report Component
 * Shows domain detection results, matched columns, missing columns, and actionable suggestions
 */
const GapAnalysisReport = ({ analysis, onProceed, onCancel, onDomainChange }) => {
    const [expandedGaps, setExpandedGaps] = useState({});

    if (!analysis) return null;

    const {
        domain,
        domain_confidence,
        matched_columns,
        gaps,
        can_proceed,
        proceed_with_limitations,
        limitations
    } = analysis;

    // Group gaps by type
    const criticalGaps = gaps.filter(g => g.gap_type === 'missing_critical');
    const formatGaps = gaps.filter(g => g.gap_type === 'wrong_format');
    const granularityGaps = gaps.filter(g => g.gap_type === 'wrong_granularity');
    const synonymGaps = gaps.filter(g => g.gap_type === 'synonym_mismatch');

    const toggleGap = (index) => {
        setExpandedGaps(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Get domain display name
    const domainNames = {
        'sales_forecast': 'Sales Forecasting',
        'hr_analytics': 'HR Analytics',
        'financial_metrics': 'Financial Metrics',
        'inventory_management': 'Inventory Management',
        'marketing_analytics': 'Marketing Analytics',
        'generic': 'Generic Time Series'
    };

    const domainName = domainNames[domain] || domain;

    // Determine health level
    const isHighConfidence = domain_confidence >= 80;
    const hasCriticalGaps = criticalGaps.length > 0;

    let statusColor, statusBg, statusBorder, statusIcon;

    if (hasCriticalGaps) {
        statusColor = 'text-error-600';
        statusBg = 'bg-error-50';
        statusBorder = 'border-error-200';
        statusIcon = ShieldAlert;
    } else if (!isHighConfidence) {
        statusColor = 'text-warning-600';
        statusBg = 'bg-warning-50';
        statusBorder = 'border-warning-200';
        statusIcon = AlertTriangle;
    } else {
        statusColor = 'text-success-600';
        statusBg = 'bg-success-50';
        statusBorder = 'border-success-200';
        statusIcon = CheckCircle;
    }

    const StatusIcon = statusIcon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full mx-auto border border-slate-200"
        >
            {/* Header */}
            <div className={`p-6 border-b ${statusBorder} ${statusBg}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${statusBg} ${statusColor} shadow-sm`}>
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Domain Detection Complete
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Intelligent schema analysis for optimal processing
                            </p>
                        </div>
                    </div>

                    {onDomainChange && (
                        <button
                            onClick={onDomainChange}
                            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Override Domain
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Domain Detection Result */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-100">
                        <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
                            Detected Domain
                        </div>
                        <div className="text-2xl font-bold text-primary-700 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            {domainName}
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${statusBorder} ${statusBg}`}>
                        <div className={`text-xs font-semibold ${statusColor} uppercase tracking-wider mb-2`}>
                            Confidence Score
                        </div>
                        <div className={`text-2xl font-bold ${statusColor} flex items-center gap-2`}>
                            <StatusIcon className="w-5 h-5" />
                            {formatPercent(domain_confidence, false)}
                        </div>
                    </div>
                </div>

                {/* Matched Columns */}
                {matched_columns && Object.keys(matched_columns).length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-success-600" />
                            Matched Columns ({Object.keys(matched_columns).length})
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(matched_columns).map(([schemaCol, [actualCol, confidence]]) => (
                                <div
                                    key={schemaCol}
                                    className="p-3 bg-success-50 border border-success-200 rounded-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-success-600 font-medium">
                                                {schemaCol}
                                            </div>
                                            <div className="text-sm font-mono text-slate-700 font-bold">
                                                {actualCol}
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-success-600">
                                            {formatPercent(confidence, false)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Critical Gaps */}
                {criticalGaps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <h3 className="font-bold text-error-700 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            Missing Critical Columns ({criticalGaps.length})
                        </h3>

                        {criticalGaps.map((gap, index) => (
                            <div
                                key={index}
                                className="border border-error-200 rounded-lg overflow-hidden bg-error-50"
                            >
                                <button
                                    onClick={() => toggleGap(index)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-error-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <XCircle className="w-5 h-5 text-error-600" />
                                        <div className="text-left">
                                            <div className="font-mono font-bold text-error-700">
                                                {gap.missing_column}
                                            </div>
                                            <div className="text-sm text-error-600 mt-1">
                                                {gap.suggestion}
                                            </div>
                                        </div>
                                    </div>
                                    {gap.options.length > 0 && (
                                        expandedGaps[index] ?
                                            <ChevronUp className="w-5 h-5 text-error-600" /> :
                                            <ChevronDown className="w-5 h-5 text-error-600" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedGaps[index] && gap.options.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-error-200 bg-white"
                                        >
                                            <div className="p-4 space-y-2">
                                                <div className="text-sm font-semibold text-slate-700 mb-3">
                                                    Available Options:
                                                </div>
                                                {gap.options.map((option, optIndex) => (
                                                    <button
                                                        key={optIndex}
                                                        className="w-full p-3 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-lg text-left transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {option.type === 'proxy_calculation' && <Calculator className="w-4 h-4 text-primary-600" />}
                                                            {option.type === 'upload_supplementary' && <FileUp className="w-4 h-4 text-primary-600" />}
                                                            {option.type === 'skip_kpi' && <Info className="w-4 h-4 text-slate-500" />}

                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-slate-700 group-hover:text-primary-700">
                                                                    {option.label}
                                                                </div>
                                                                {option.formula && (
                                                                    <div className="text-xs font-mono text-slate-500 mt-1">
                                                                        {option.formula}
                                                                    </div>
                                                                )}
                                                                {option.confidence && (
                                                                    <div className="text-xs text-primary-600 font-semibold mt-1">
                                                                        Confidence: {option.confidence}%
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Format Gaps */}
                {formatGaps.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-warning-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Format Issues ({formatGaps.length})
                        </h3>
                        {formatGaps.map((gap, index) => (
                            <div
                                key={index}
                                className="p-4 bg-warning-50 border border-warning-200 rounded-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-mono font-bold text-warning-700">
                                            {gap.missing_column}
                                        </div>
                                        <div className="text-sm text-warning-600 mt-1">
                                            {gap.suggestion}
                                        </div>
                                    </div>
                                    {gap.action_type === 'auto_fix' && (
                                        <span className="px-3 py-1 bg-success-100 text-success-700 text-xs font-semibold rounded-full">
                                            Auto-fix available
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Granularity Gaps */}
                {granularityGaps.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-info-700 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Granularity Suggestions
                        </h3>
                        {granularityGaps.map((gap, index) => (
                            <div
                                key={index}
                                className="p-4 bg-info-50 border border-info-200 rounded-lg"
                            >
                                <div className="text-sm text-info-700">
                                    {gap.suggestion}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Limitations */}
                {limitations.length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4" />
                            Analysis Limitations
                        </h4>
                        <ul className="text-sm text-slate-600 space-y-1 pl-5 list-disc">
                            {limitations.map((limitation, i) => (
                                <li key={i}>{limitation}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Success Message */}
                {can_proceed && criticalGaps.length === 0 && (
                    <div className="flex items-start gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-success-600" />
                        <div>
                            <div className="font-semibold text-success-700">
                                Ready to Proceed!
                            </div>
                            <p className="text-sm text-success-600 mt-1">
                                Your data structure matches the expected schema for {domainName}.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <div className="text-sm text-slate-600">
                    {can_proceed ? (
                        <span className="font-medium text-success-600">✓ All checks passed</span>
                    ) : proceed_with_limitations ? (
                        <span className="font-medium text-warning-600">⚠ Can proceed with limitations</span>
                    ) : (
                        <span className="font-medium text-error-600">✗ Critical issues found</span>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>

                    {(can_proceed || proceed_with_limitations) && (
                        <button
                            onClick={onProceed}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary-500/30 flex items-center gap-2 transition-all transform hover:scale-105"
                        >
                            {proceed_with_limitations ? 'Proceed with Limitations' : 'Proceed with Analysis'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default GapAnalysisReport;
