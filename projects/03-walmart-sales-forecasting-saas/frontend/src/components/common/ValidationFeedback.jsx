/**
 * ValidationFeedback - Reusable component for displaying validation results
 * Shows data quality score, passed/warned/failed checks, and suggested actions
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
    Shield, Lightbulb, BarChart3
} from 'lucide-react';

const ValidationFeedback = ({ results, qualityScore = 0, suggestions = [], compact = false }) => {
    const [expanded, setExpanded] = useState(!compact);

    if (!results) return null;

    const { passed = [], failed = [], warnings = [] } = results;
    const totalChecks = passed.length + failed.length + warnings.length;

    // Quality score color
    const scoreColor = qualityScore >= 80
        ? 'text-success-600'
        : qualityScore >= 60
            ? 'text-warning-600'
            : 'text-danger-600';

    const scoreBg = qualityScore >= 80
        ? 'bg-success-100'
        : qualityScore >= 60
            ? 'bg-warning-100'
            : 'bg-danger-100';

    const scoreLabel = qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Fair' : 'Poor';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden"
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg-tertiary transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${scoreBg} flex items-center justify-center`}>
                        <Shield className={`w-5 h-5 ${scoreColor}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary text-sm">Data Quality Check</h3>
                        <p className="text-xs text-text-secondary">
                            {passed.length}/{totalChecks} checks passed
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Quality Score Gauge */}
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${scoreColor}`}>{Math.round(qualityScore)}%</div>
                        <div className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</div>
                    </div>

                    {/* Summary badges */}
                    <div className="flex gap-1">
                        {failed.length > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-danger-100 text-danger-600 rounded-full text-xs font-medium">
                                <XCircle className="w-3 h-3" />
                                {failed.length}
                            </span>
                        )}
                        {warnings.length > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-warning-100 text-warning-600 rounded-full text-xs font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                {warnings.length}
                            </span>
                        )}
                        {failed.length === 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-success-100 text-success-600 rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                Valid
                            </span>
                        )}
                    </div>

                    {expanded ? <ChevronUp className="w-4 h-4 text-text-tertiary" /> : <ChevronDown className="w-4 h-4 text-text-tertiary" />}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border-primary"
                    >
                        <div className="p-4 space-y-4">
                            {/* Quality Score Bar */}
                            <div>
                                <div className="flex justify-between text-xs text-text-secondary mb-1">
                                    <span>Data Quality Score</span>
                                    <span className={`font-semibold ${scoreColor}`}>{Math.round(qualityScore)}%</span>
                                </div>
                                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${qualityScore}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${qualityScore >= 80 ? 'bg-success-500' :
                                                qualityScore >= 60 ? 'bg-warning-500' : 'bg-danger-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Failed Checks */}
                            {failed.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-danger-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" />
                                        Issues Found ({failed.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {failed.map((item, i) => (
                                            <div key={i} className="flex items-start gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                                                <XCircle className="w-4 h-4 text-danger-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm text-danger-700 font-medium capitalize">
                                                        {(item.check || '').replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-xs text-danger-600 mt-0.5">
                                                        {item.error || item.message}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Warnings */}
                            {warnings.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-warning-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Warnings ({warnings.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {warnings.map((item, i) => (
                                            <div key={i} className="flex items-start gap-2 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                                                <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-warning-700">
                                                    {item.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Passed Checks */}
                            {passed.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-success-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Passed ({passed.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {passed.map((check, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-success-50 border border-success-200 text-success-700 rounded-full text-xs">
                                                <CheckCircle2 className="w-3 h-3" />
                                                {String(check).replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Actions */}
                            {suggestions.length > 0 && (
                                <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg">
                                    <h4 className="text-xs font-semibold text-brand-700 mb-2 flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3" />
                                        Suggested Actions
                                    </h4>
                                    <ul className="space-y-1">
                                        {suggestions.map((s, i) => (
                                            <li key={i} className="text-xs text-brand-600 flex items-start gap-1">
                                                <span className="mt-0.5">•</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ValidationFeedback;
