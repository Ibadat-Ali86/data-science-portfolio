import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    TrendingUp,
    CheckCircle,
    Activity,
    Target,
    Zap,
    Clock,
    BarChart3,
    Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

/**
 * ModelTrainingProgress - Shows real-time model training progress and metrics
 * Displays training status, performance metrics, and business-language insights
 */
const ModelTrainingProgress = ({ data, onTrainingComplete, sessionId }) => {
    const [progress, setProgress] = useState({ status: 'idle', percentage: 0, currentStep: '' });
    const [metrics, setMetrics] = useState(null);
    const [trainingStarted, setTrainingStarted] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Real training polling
    useEffect(() => {
        if (data && !trainingStarted && sessionId) {
            setTrainingStarted(true);
            startTraining();
        }
    }, [data, trainingStarted, sessionId]);

    const startTraining = async () => {
        try {
            // 1. Start Training Job
            // Use props for mapping if available, or default to standard names
            const mapping = data.columnMapping || { date: 'Date', target: 'Sales' };

            setProgress({ status: 'training', percentage: 5, currentStep: 'Initializing backend specific job...' });

            const response = await fetch(`${API_BASE_URL}/api/analysis/train/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_type: 'ensemble',
                    target_col: mapping.target,
                    date_col: mapping.date,
                    forecast_periods: 30
                })
            });

            if (!response.ok) throw new Error('Failed to start training');
            const { job_id } = await response.json();

            // 2. Poll for Status
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${API_BASE_URL}/api/analysis/status/${job_id}`);
                    const statusData = await statusRes.json();

                    setProgress({
                        status: statusData.status === 'completed' ? 'complete' : 'training',
                        percentage: statusData.progress || 0,
                        currentStep: statusData.current_step || 'Processing...'
                    });

                    if (statusData.status === 'completed') {
                        clearInterval(pollInterval);
                        // 3. Get Results
                        const resultRes = await fetch(`${API_BASE_URL}/api/analysis/results/${job_id}`);
                        const resultData = await resultRes.json();

                        // Merge metrics and forecast for upward flow
                        // Ensure metrics object exists to prevent spread of undefined/null
                        // Merge metrics, forecast, and insights
                        // Validate metrics object exists
                        const safeMetrics = resultData.metrics || {};

                        // Create structured object matching reportGenerator expectations
                        // We support both flat and nested usage by providing both
                        const fullResults = {
                            ...safeMetrics,     // For flat access (legacy components)
                            metrics: safeMetrics, // For reportGenerator (nested access)
                            forecast: resultData.forecast,
                            insights: resultData.insights
                        };

                        setMetrics(fullResults); // Store full results
                        setMetrics(fullResults); // Store full results including forecast

                        // Remove auto-redirect
                        // User must explicitly click "View Forecast Results"
                        setRedirecting(false);

                    } else if (statusData.status === 'failed') {
                        clearInterval(pollInterval);
                        alert(`Training failed: ${statusData.error}`);
                        setProgress(prev => ({ ...prev, status: 'error', currentStep: 'Training failed' }));
                    }

                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 1000);

        } catch (error) {
            console.error("Training error:", error);
            setProgress({ status: 'error', percentage: 0, currentStep: 'Failed to start training' });
        }
    };

    const handleContinue = () => {
        if (onTrainingComplete && metrics) {
            setRedirecting(true);
            // Small delay to show button state
            setTimeout(() => {
                onTrainingComplete(metrics);
            }, 500);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Model Training
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Training forecasting model on your data
                        </p>
                    </div>
                </div>

                {/* Training Progress */}
                {progress.status === 'training' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Training Progress
                            </span>
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {progress.percentage}%
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                            <motion.div
                                className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Activity className="w-4 h-4 animate-pulse text-purple-500" />
                            <span>{progress.currentStep}</span>
                        </div>
                    </div>
                )}

                {/* Training Complete Header - Only show if NO metrics yet (loading state gap) or keep simple */}
                {progress.status === 'complete' && !metrics && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                        <span className="text-green-800 dark:text-green-300 font-medium">Finalizing results...</span>
                    </div>
                )}
            </div>

            {/* Performance Metrics - INTERIM EVALUATION SCREEN */}
            {metrics && progress.status === 'complete' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                Model Training Successful
                            </h3>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                                Ready for Review
                            </span>
                        </div>

                        {/* Accuracy Rating Card */}
                        <div className={`p-6 rounded-xl mb-6 ${metrics.accuracyRating === 'Excellent'
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800'
                            : metrics.accuracyRating === 'Very Good'
                                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800'
                                : 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800'
                            }`}>
                            <div className="flex items-center gap-3 mb-3">
                                <Target className={`w-8 h-8 ${metrics.accuracyRating === 'Excellent'
                                    ? 'text-green-600 dark:text-green-400'
                                    : metrics.accuracyRating === 'Very Good'
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-yellow-600 dark:text-yellow-400'
                                    }`} />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall Performance</p>
                                    <p className={`text-2xl font-bold ${metrics.accuracyRating === 'Excellent'
                                        ? 'text-green-700 dark:text-green-300'
                                        : metrics.accuracyRating === 'Very Good'
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-yellow-700 dark:text-yellow-300'
                                        }`}>
                                        {metrics.accuracyRating}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {metrics.description}
                            </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <MetricCard
                                label="MAPE"
                                value={typeof metrics.mape === 'number' ? `${metrics.mape.toFixed(2)}%` : 'N/A'}
                                description="Mean Abs. Error %"
                                icon={<Target className="w-5 h-5" />}
                                color="blue"
                            />
                            <MetricCard
                                label="R² Score"
                                value={typeof metrics.r2Score === 'number' ? metrics.r2Score.toFixed(3) : 'N/A'}
                                description="Model Fit (0-1)"
                                icon={<TrendingUp className="w-5 h-5" />}
                                color="purple"
                            />
                            <MetricCard
                                label="RMSE"
                                value={typeof metrics.rmse === 'number' ? metrics.rmse.toFixed(2) : 'N/A'}
                                description="Root Mean Sq Error"
                                icon={<BarChart3 className="w-5 h-5" />}
                                color="green"
                            />
                            <MetricCard
                                label="MAE"
                                value={typeof metrics.mae === 'number' ? metrics.mae.toFixed(2) : 'N/A'}
                                description="Mean Abs. Error"
                                icon={<Activity className="w-5 h-5" />}
                                color="yellow"
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleContinue}
                                className="px-8 py-3 bg-[var(--accent-blue)] hover:bg-blue-600 text-white rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all"
                            >
                                <TrendingUp className="w-5 h-5" />
                                {redirecting ? "Loading Results..." : "View Detailed Forecasts"}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

/**
 * MetricCard component for displaying individual metrics
 */
const MetricCard = ({ label, value, description, icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    );
};

/**
 * Generate simulated metrics based on data
 */
const generateMetrics = (data) => {
    const rows = data?.length || 100;
    const trainSize = Math.floor(rows * 0.8);
    const testSize = rows - trainSize;

    // Generate realistic metrics
    const mape = 3 + Math.random() * 7; // 3-10% MAPE
    const r2 = 0.85 + Math.random() * 0.12; // 0.85-0.97 R²
    const rmse = 100 + Math.random() * 500;
    const mae = rmse * 0.7;

    // Determine accuracy rating
    let accuracyRating, description, recommendation;

    if (mape < 5) {
        accuracyRating = 'Excellent';
        description = 'Forecasts are highly reliable for business planning and inventory decisions.';
        recommendation = 'Use for detailed inventory planning, automated reordering, and precise demand planning.';
    } else if (mape < 10) {
        accuracyRating = 'Very Good';
        description = 'Forecasts are reliable with minor deviations expected.';
        recommendation = 'Suitable for strategic planning, budget forecasting, and trend analysis.';
    } else if (mape < 20) {
        accuracyRating = 'Good';
        description = 'Forecasts are generally reliable for strategic planning.';
        recommendation = 'Use for directional guidance and long-term planning. Consider safety stock buffers.';
    } else {
        accuracyRating = 'Fair';
        description = 'Forecasts show trends but may have significant deviations.';
        recommendation = 'Use for general trend identification. Validate with additional data sources.';
    }

    return {
        modelType: 'Prophet + XGBoost Ensemble',
        trainingSamples: trainSize,
        testingSamples: testSize,
        mape,
        rmse,
        mae,
        r2Score: Math.min(r2, 0.99),
        confidenceInterval: '95%',
        trainingTime: `${(2 + Math.random() * 3).toFixed(1)}s`,
        accuracyRating,
        description,
        recommendation,
        trainingDate: new Date().toISOString()
    };
};

export default ModelTrainingProgress;
