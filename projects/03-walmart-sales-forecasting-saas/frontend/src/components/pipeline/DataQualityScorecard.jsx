/**
 * Phase 2: Data Quality Scorecard
 * Visual dashboard showing data quality metrics and issues
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
    Database,
    Calendar,
    BarChart3,
    Info
} from 'lucide-react';

const SCORE_MAP = {
    excellent: { color: 'green', text: 'Excellent', icon: CheckCircle, min: 90 },
    good: { color: 'blue', text: 'Good', icon: TrendingUp, min: 75 },
    fair: { color: 'yellow', text: 'Fair', icon: AlertTriangle, min: 60 },
    poor: { color: 'red', text: 'Poor', icon: XCircle, min: 0 }
};

function getScoreLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
}

function ScoreCircle({ score, label }) {
    const level = getScoreLevel(score);
    const config = SCORE_MAP[level];
    const Icon = config.icon;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke={`url(#gradient-${level})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - score / 100) }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                    <defs>
                        <linearGradient id={`gradient-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={level === 'excellent' ? '#10b981' : level === 'good' ? '#3b82f6' : level === 'fair' ? '#f59e0b' : '#ef4444'} />
                            <stop offset="100%" stopColor={level === 'excellent' ? '#059669' : level === 'good' ? '#2563eb' : level === 'fair' ? '#d97706' : '#dc2626'} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className={`w-6 h-6 text-${config.color}-500 mb-1`} />
                    <span className="text-3xl font-bold text-gray-800">{score}</span>
                    <span className="text-xs text-gray-500">/ 100</span>
                </div>
            </div>

            <div className="mt-3 text-center">
                <p className="font-semibold text-gray-700">{label}</p>
                <p className={`text-sm text-${config.color}-600 font-medium`}>{config.text}</p>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, status, details }) {
    const statusConfig = {
        success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle },
        warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: AlertTriangle },
        error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.success;
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border-2 ${config.border} ${config.bg}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Icon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{label}</p>
                        <p className={`text-2xl font-bold ${config.text}`}>{value}</p>
                    </div>
                </div>
                <StatusIcon className={`w-5 h-5 ${config.text}`} />
            </div>

            {details && (
                <p className="text-sm text-gray-600">{details}</p>
            )}
        </motion.div>
    );
}

export default function DataQualityScorecard({ scorecard }) {
    if (!scorecard) {
        return (
            <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No quality data available</p>
            </div>
        );
    }

    const {
        overall_score = 0,
        completeness = 0,
        consistency = 0,
        validity = 0,
        issues = [],
        recommendations = []
    } = scorecard;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Data Quality Scorecard</h3>
                <p className="text-gray-600">Automated assessment of your dataset's readiness for forecasting</p>
            </div>

            {/* Overall Score */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <ScoreCircle score={overall_score} label="Overall Quality Score" />

                    <div className="flex-1 grid grid-cols-3 gap-4">
                        <ScoreCircle score={completeness} label="Completeness" />
                        <ScoreCircle score={consistency} label="Consistency" />
                        <ScoreCircle score={validity} label="Validity" />
                    </div>
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard
                    icon={Database}
                    label="Missing Values"
                    value={scorecard.missing_count || 0}
                    status={scorecard.missing_count > 100 ? 'error' : scorecard.missing_count > 10 ? 'warning' : 'success'}
                    details={scorecard.missing_pct ? `${scorecard.missing_pct}% of total cells` : ''}
                />

                <MetricCard
                    icon={Calendar}
                    label="Date Coverage"
                    value={scorecard.date_range || 'N/A'}
                    status={scorecard.date_gaps ? 'warning' : 'success'}
                    details={scorecard.date_gaps ? `${scorecard.date_gaps} gaps detected` : 'Continuous timeline'}
                />

                <MetricCard
                    icon={BarChart3}
                    label="Outliers Detected"
                    value={scorecard.outlier_count || 0}
                    status={scorecard.outlier_count > 50 ? 'warning' : 'success'}
                    details={scorecard.outlier_pct ? `${scorecard.outlier_pct}% of data points` : ''}
                />

                <MetricCard
                    icon={TrendingUp}
                    label="Data Variance"
                    value={scorecard.variance_score || 'N/A'}
                    status={scorecard.low_variance ? 'warning' : 'success'}
                    details={scorecard.low_variance ? 'Low variance may affect predictions' : 'Healthy variance detected'}
                />
            </div>

            {/* Issues */}
            {issues.length > 0 && (
                <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                    <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Issues Found ({issues.length})
                    </h4>
                    <ul className="space-y-2">
                        {issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{issue}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Recommendations
                    </h4>
                    <ul className="space-y-2">
                        {recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
