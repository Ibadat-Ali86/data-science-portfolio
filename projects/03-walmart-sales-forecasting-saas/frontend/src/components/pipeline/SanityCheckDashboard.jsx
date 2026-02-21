/**
 * Phase 3: Sanity Check Dashboard
 * Validates forecast results with automated checks
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
    Activity,
    Zap,
    AlertCircle,
    Info
} from 'lucide-react';

const CHECKS = [
    {
        id: 'numeric_validity',
        name: 'Numeric Validity',
        description: 'All forecast values are valid numbers',
        icon: Activity
    },
    {
        id: 'continuity',
        name: 'Historical Continuity',
        description: 'Forecast starts from last historical value',
        icon: TrendingUp
    },
    {
        id: 'trend_stability',
        name: 'Trend Stability',
        description: 'No extreme jumps or unrealistic patterns',
        icon: Zap
    },
    {
        id: 'confidence_bounds',
        name: 'Confidence Bounds',
        description: 'Prediction intervals are reasonable',
        icon: AlertCircle
    }
];

function runSanityChecks(forecastData, historicalData) {
    const results = {};

    // Check 1: Numeric Validity
    const hasInvalidNumbers = forecastData.predictions.some(
        v => v === null || v === undefined || isNaN(v) || !isFinite(v)
    );
    results.numeric_validity = {
        passed: !hasInvalidNumbers,
        message: hasInvalidNumbers
            ? 'Found invalid or infinite values in predictions'
            : 'All forecast values are valid numbers',
        severity: hasInvalidNumbers ? 'error' : 'success'
    };

    // Check 2: Historical Continuity
    if (historicalData && historicalData.length > 0) {
        const lastHistorical = historicalData[historicalData.length - 1];
        const firstForecast = forecastData.predictions[0];
        const gap = Math.abs(firstForecast - lastHistorical);
        const threshold = lastHistorical * 0.5; // 50% jump threshold

        results.continuity = {
            passed: gap < threshold,
            message: gap < threshold
                ? `Smooth transition from ${lastHistorical.toFixed(2)} to ${firstForecast.toFixed(2)}`
                : `Large jump detected: ${lastHistorical.toFixed(2)} → ${firstForecast.toFixed(2)}`,
            severity: gap < threshold ? 'success' : 'warning'
        };
    } else {
        results.continuity = {
            passed: true,
            message: 'No historical data to compare',
            severity: 'info'
        };
    }

    // Check 3: Trend Stability
    const diffs = [];
    for (let i = 1; i < forecastData.predictions.length; i++) {
        diffs.push(Math.abs(forecastData.predictions[i] - forecastData.predictions[i - 1]));
    }
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const maxDiff = Math.max(...diffs);
    const isStable = maxDiff < avgDiff * 3; // No single jump more than 3x average

    results.trend_stability = {
        passed: isStable,
        message: isStable
            ? `Trend is stable (max change: ${maxDiff.toFixed(2)})`
            : `Detected large spike (${maxDiff.toFixed(2)} vs avg ${avgDiff.toFixed(2)})`,
        severity: isStable ? 'success' : 'warning'
    };

    // Check 4: Confidence Bounds
    const boundsValid = forecastData.predictions.every((pred, idx) => {
        const lower = forecastData.lower_bound[idx];
        const upper = forecastData.upper_bound[idx];
        return lower <= pred && pred <= upper && upper > lower;
    });

    results.confidence_bounds = {
        passed: boundsValid,
        message: boundsValid
            ? 'Confidence intervals are properly formed'
            : 'Some predictions fall outside confidence bounds',
        severity: boundsValid ? 'success' : 'error'
    };

    return results;
}

function CheckCard({ check, result }) {
    const Icon = check.icon;

    const config = {
        success: {
            icon: CheckCircle,
            color: 'green',
            bg: 'bg-green-50',
            border: 'border-green-200'
        },
        warning: {
            icon: AlertTriangle,
            color: 'yellow',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200'
        },
        error: {
            icon: XCircle,
            color: 'red',
            bg: 'bg-red-50',
            border: 'border-red-200'
        },
        info: {
            icon: Info,
            color: 'blue',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        }
    };

    const style = config[result.severity];
    const StatusIcon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border-2 ${style.border} ${style.bg}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-5 h-5 text-${style.color}-600`} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">{check.name}</h4>
                        <p className="text-xs text-gray-600">{check.description}</p>
                    </div>
                </div>
                <StatusIcon className={`w-6 h-6 text-${style.color}-600 flex-shrink-0`} />
            </div>

            <p className={`text-sm text-${style.color}-700 font-medium`}>
                {result.message}
            </p>
        </motion.div>
    );
}

export default function SanityCheckDashboard({ forecastData, historicalData }) {
    const [results, setResults] = useState(null);
    const [overallScore, setOverallScore] = useState(0);

    useEffect(() => {
        if (forecastData && forecastData.predictions) {
            const checkResults = runSanityChecks(forecastData, historicalData);
            setResults(checkResults);

            // Calculate overall score
            const passed = Object.values(checkResults).filter(r => r.passed).length;
            const score = (passed / Object.keys(checkResults).length) * 100;
            setOverallScore(Math.round(score));
        }
    }, [forecastData, historicalData]);

    if (!results) {
        return (
            <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No forecast data to validate</p>
            </div>
        );
    }

    const passed = Object.values(results).filter(r => r.passed).length;
    const total = Object.keys(results).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Forecast Sanity Checks</h3>
                <p className="text-gray-600">Automated validation of forecast quality and reliability</p>
            </div>

            {/* Overall Score */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Overall Health Score</p>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold text-gray-800">{overallScore}%</span>
                            <div>
                                <p className="text-lg font-semibold text-gray-700">
                                    {passed} / {total} Checks Passed
                                </p>
                                <p className="text-sm text-gray-600">
                                    {overallScore >= 75
                                        ? 'Forecast looks good ✓'
                                        : overallScore >= 50
                                            ? 'Some issues detected ⚠️'
                                            : 'Review required ⛔'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Circular progress */}
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="6"
                            />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                fill="none"
                                stroke={overallScore >= 75 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - overallScore / 100) }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Individual Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHECKS.map((check, idx) => (
                    <motion.div
                        key={check.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <CheckCard check={check} result={results[check.id]} />
                    </motion.div>
                ))}
            </div>

            {/* Summary */}
            {overallScore < 75 && (
                <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm text-yellow-700">
                        {!results.numeric_validity.passed && (
                            <li>• Review data preprocessing to eliminate invalid values</li>
                        )}
                        {!results.continuity.passed && (
                            <li>• Check for data quality issues at the historical/forecast boundary</li>
                        )}
                        {!results.trend_stability.passed && (
                            <li>• Consider using a more conservative model or smoothing parameters</li>
                        )}
                        {!results.confidence_bounds.passed && (
                            <li>• Verify model confidence level settings and recalculate bounds</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
