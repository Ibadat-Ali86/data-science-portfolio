import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    Info,
    ShieldAlert,
    BrainCircuit,
    ArrowRight
} from 'lucide-react';

const GapAnalysisReport = ({ report, onProceed, onCancel }) => {
    if (!report) return null;

    const {
        domain,
        confidence,
        missing_critical,
        missing_optional,
        suggestions
    } = report;

    // Determine health level
    const isHighConfidence = confidence > 0.8;
    const isCriticalMissing = missing_critical && missing_critical.length > 0;

    let healthColor = 'text-accent-green';
    let healthBg = 'bg-accent-green/10';
    let healthBorder = 'border-accent-green/20';

    if (isCriticalMissing) {
        healthColor = 'text-error-500';
        healthBg = 'bg-error-500/10';
        healthBorder = 'border-error-500/20';
    } else if (!isHighConfidence) {
        healthColor = 'text-warning-500';
        healthBg = 'bg-warning-500/10';
        healthBorder = 'border-warning-500/20';
    }

    return (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto border border-slate-200">
            {/* Header */}
            <div className={`p-6 border-b ${healthBorder} ${healthBg}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${healthBg} ${healthColor}`}>
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Intelligent Domain Detection
                    </h2>
                </div>
                <p className="text-slate-600 ml-11">
                    We analyzed your data structure to optimize the analysis pipeline.
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Domain & Confidence */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Detected Domain</div>
                        <div className="text-2xl font-bold text-primary-600">{domain}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Confidence Score</div>
                        <div className={`text-2xl font-bold ${healthColor}`}>
                            {Math.round(confidence * 100)}%
                        </div>
                    </div>
                </div>

                {/* Critical Issues */}
                {missing_critical.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-error-50 border border-error-200 rounded-xl"
                    >
                        <div className="flex items-center gap-2 text-error-700 font-bold mb-2">
                            <ShieldAlert className="w-5 h-5" />
                            Missing Critical Columns
                        </div>
                        <p className="text-sm text-error-600 mb-3">
                            The following columns are required for full {domain} analysis:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {missing_critical.map(col => (
                                <span key={col} className="px-3 py-1 bg-white border border-error-200 text-error-700 text-sm font-mono rounded-md shadow-sm">
                                    {col}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 text-xs text-error-500 font-medium">
                            * Analysis will be limited without these columns.
                        </div>
                    </motion.div>
                )}

                {/* Optional Issues */}
                {missing_optional.length > 0 && !isCriticalMissing && (
                    <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
                        <div className="flex items-center gap-2 text-warning-700 font-bold mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            Missing Optional Columns
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {missing_optional.map(col => (
                                <span key={col} className="px-2 py-1 bg-white border border-warning-200 text-warning-700 text-xs font-mono rounded-md">
                                    {col}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary-500" /> Suggestions
                        </h4>
                        <ul className="text-sm text-slate-600 space-y-1 pl-6 list-disc">
                            {suggestions.map((sug, i) => (
                                <li key={i}>{sug}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isCriticalMissing && (
                    <div className="flex items-start gap-3 p-3 bg-success-50 rounded-lg text-success-700 text-sm">
                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>Structure matches expected schema for {domain}. You're good to go!</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onProceed}
                    className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/30 flex items-center gap-2 transition-all"
                >
                    Proceed with Analysis <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default GapAnalysisReport;
