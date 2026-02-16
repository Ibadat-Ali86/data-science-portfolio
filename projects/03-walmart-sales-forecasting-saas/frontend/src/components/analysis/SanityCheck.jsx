
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity,
    TrendingUp,
    TrendingDown,
    ShieldCheck,
    AlertOctagon
} from 'lucide-react';

const SanityCheck = ({ forecastData, historicalData }) => {

    // Perform checks
    const report = useMemo(() => {
        const checks = [];
        let score = 100;
        let status = 'pass'; // pass, warn, fail

        if (!forecastData || !forecastData.predictions) return null;

        const predictions = forecastData.predictions;
        const dates = forecastData.dates;
        const historyValues = historicalData ? historicalData.map(d => Object.values(d).find(v => typeof v === 'number')) : [];
        const lastHistoryValue = historyValues.length > 0 ? historyValues[historyValues.length - 1] : 0;

        // 1. Negative Values Check
        const negativeCount = predictions.filter(p => p < 0).length;
        if (negativeCount > 0) {
            checks.push({
                id: 'negative_values',
                name: 'Numeric Validity',
                status: 'fail',
                message: `Found ${negativeCount} negative forecast values. Demand cannot be negative.`,
                icon: AlertOctagon
            });
            score -= 40;
            status = 'fail';
        } else {
            checks.push({
                id: 'negative_values',
                name: 'Numeric Validity',
                status: 'pass',
                message: 'All forecast values are non-negative.',
                icon: CheckCircle
            });
        }

        // 2. Continuity Check (Jump from last history point)
        if (lastHistoryValue > 0) {
            const firstForecast = predictions[0];
            const pctChange = Math.abs((firstForecast - lastHistoryValue) / lastHistoryValue);

            if (pctChange > 0.5) { // > 50% jump
                checks.push({
                    id: 'continuity',
                    name: 'History Continuity',
                    status: 'warn',
                    message: `Large jump detected (${(pctChange * 100).toFixed(0)}%) between history and forecast start.`,
                    icon: Activity
                });
                score -= 20;
                if (status !== 'fail') status = 'warn';
            } else {
                checks.push({
                    id: 'continuity',
                    name: 'History Continuity',
                    status: 'pass',
                    message: 'Forecast transitions smoothly from historical data.',
                    icon: TrendingUp
                });
            }
        }

        // 3. Trend Stability Check (Linear slope)
        // Simple linear regression on predictions
        const n = predictions.length;
        if (n > 1) {
            const x = Array.from({ length: n }, (_, i) => i);
            const y = predictions;
            const sumX = x.reduce((a, b) => a + b, 0);
            const sumY = y.reduce((a, b) => a + b, 0);
            const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
            const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const avgVal = sumY / n;

            // Normalize slope percentage
            const slopePct = avgVal !== 0 ? (slope / avgVal) * 100 : 0;

            if (Math.abs(slopePct) > 10) { // > 10% movement per step is aggressive
                checks.push({
                    id: 'trend',
                    name: 'Trend Stability',
                    status: 'warn',
                    message: `Aggressive trend detected (${slopePct.toFixed(1)}% per step). Verify model parameters.`,
                    icon: TrendingDown
                });
                score -= 10;
                if (status !== 'fail') status = 'warn';
            } else {
                checks.push({
                    id: 'trend',
                    name: 'Trend Stability',
                    status: 'pass',
                    message: 'Forecast trend is within stable bounds.',
                    icon: ShieldCheck
                });
            }
        }

        // 4. Outlier Check (Spikes)
        const mean = predictions.reduce((a, b) => a + b, 0) / n;
        const std = Math.sqrt(predictions.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
        const outliers = predictions.filter(p => Math.abs(p - mean) > 3 * std).length;

        if (outliers > 0) {
            checks.push({
                id: 'outliers',
                name: 'Outlier Detection',
                status: 'warn',
                message: `Found ${outliers} outliers (> 3 sigma). Verify these are not anomalies.`,
                icon: AlertTriangle
            });
            score -= 15;
            if (status !== 'fail') status = 'warn';
        } else {
            checks.push({
                id: 'outliers',
                name: 'Outlier Detection',
                status: 'pass',
                message: 'No significant statistical outliers detected.',
                icon: CheckCircle
            });
        }

        return { checks, score, status };
    }, [forecastData, historicalData]);

    if (!report) return null;

    const getStatusColor = (s) => {
        if (s === 'fail') return 'text-[var(--error-500)] border-[var(--error-200)] bg-[var(--error-50)]';
        if (s === 'warn') return 'text-[var(--warning-600)] border-[var(--warning-200)] bg-[var(--warning-50)]';
        return 'text-[var(--success-600)] border-[var(--success-200)] bg-[var(--success-50)]';
    };

    const getBadgeColor = (s) => {
        if (s === 'fail') return 'bg-[var(--error-100)] text-[var(--error-700)]';
        if (s === 'warn') return 'bg-[var(--warning-100)] text-[var(--warning-800)]';
        return 'bg-[var(--success-100)] text-[var(--success-700)]';
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-[var(--border-primary)] overflow-hidden"
            >
                <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-[var(--accent-blue)]" />
                            Model Sanity Check
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Automated validation of forecast reliability and physics.
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-lg border ${getStatusColor(report.status)}`}>
                        Score: {report.score}/100
                    </div>
                </div>

                <div className="p-6 grid gap-4 md:grid-cols-2">
                    {report.checks.map((check, idx) => (
                        <motion.div
                            key={check.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-xl border flex items-start gap-4 ${check.status === 'pass'
                                    ? 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
                                    : getStatusColor(check.status)
                                }`}
                        >
                            <div className={`mt-1 p-2 rounded-lg ${check.status === 'pass' ? 'bg-[var(--success-100)] text-[var(--success-600)]' : 'bg-white/50'}`}>
                                <check.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[var(--text-primary)]">{check.name}</h4>
                                <p className={`text-sm mt-1 ${check.status === 'pass' ? 'text-[var(--text-secondary)]' : 'font-medium'}`}>
                                    {check.message}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default SanityCheck;
