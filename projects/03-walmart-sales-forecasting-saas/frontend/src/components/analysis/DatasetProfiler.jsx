import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Package,
    Database,
    Calendar,
    BarChart3,
    AlertCircle,
    Info
} from 'lucide-react';

/**
 * DatasetProfiler - Analyzes uploaded CSV data and displays comprehensive profiling
 * Follows UI/UX guidelines: 8px spacing, typography scale, color system
 */
const DatasetProfiler = ({ data, onProfileComplete, externalProfile }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    // Generate profile from data or use external profile
    const profile = externalProfile || generateProfile(data);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Dataset Analysis
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Comprehensive profiling of your uploaded data
                        </p>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Records"
                        value={profile.dimensions.rows.toLocaleString()}
                        icon={<Database className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        label="Columns"
                        value={profile.dimensions.columns}
                        icon={<BarChart3 className="w-5 h-5" />}
                        color="purple"
                    />
                    <StatCard
                        label="Date Range"
                        value={`${profile.dimensions.timeSpanDays} days`}
                        icon={<Calendar className="w-5 h-5" />}
                        color="green"
                    />
                    <StatCard
                        label="Data Quality"
                        value={`${profile.dataQuality.completeness}%`}
                        icon={<CheckCircle className="w-5 h-5" />}
                        color={profile.dataQuality.completeness > 95 ? 'green' : 'yellow'}
                    />
                </div>
            </div>

            {/* Business Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Key Business Insights
                </h3>
                <div className="space-y-3">
                    {profile.businessInsights.map((insight, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700 dark:text-gray-300">{insight}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Data Quality Assessment */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Data Quality Assessment
                </h3>

                {/* Missing Values Warning */}
                {profile.dataQuality.missingCount > 0 && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
                                Missing Values Detected
                            </h4>
                        </div>
                        <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                            {Object.entries(profile.dataQuality.missingByColumn).map(([col, count]) => (
                                count > 0 && (
                                    <li key={col} className="flex justify-between">
                                        <span>{col}</span>
                                        <span className="font-medium">
                                            {count} missing ({((count / profile.dimensions.rows) * 100).toFixed(2)}%)
                                        </span>
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}

                {/* Column Statistics Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Column
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Mean
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Std Dev
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Min
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Max
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {profile.statisticalSummary.map((stats) => (
                                <tr key={stats.column} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {stats.column}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${stats.type === 'number'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : stats.type === 'date'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {stats.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {stats.mean?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {stats.std?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {stats.min?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {stats.max?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Forecasting Readiness */}
            <div className={`rounded-xl p-6 border ${profile.forecastingReadiness.ready
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                <div className="flex items-center gap-2 mb-3">
                    {profile.forecastingReadiness.ready ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                        <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <h3 className={`text-xl font-semibold ${profile.forecastingReadiness.ready
                        ? 'text-green-900 dark:text-green-200'
                        : 'text-yellow-900 dark:text-yellow-200'
                        }`}>
                        {profile.forecastingReadiness.ready ? 'Ready for Forecasting' : 'Needs Attention'}
                    </h3>
                </div>
                <p className={`mb-4 ${profile.forecastingReadiness.ready
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                    {profile.forecastingReadiness.message}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className={`font-semibold mb-2 ${profile.forecastingReadiness.ready
                            ? 'text-green-900 dark:text-green-200'
                            : 'text-yellow-900 dark:text-yellow-200'
                            }`}>
                            Strengths
                        </h4>
                        <ul className={`space-y-1 text-sm ${profile.forecastingReadiness.ready
                            ? 'text-green-800 dark:text-green-300'
                            : 'text-yellow-800 dark:text-yellow-300'
                            }`}>
                            {profile.forecastingReadiness.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className={`font-semibold mb-2 ${profile.forecastingReadiness.ready
                            ? 'text-green-900 dark:text-green-200'
                            : 'text-yellow-900 dark:text-yellow-200'
                            }`}>
                            Recommendations
                        </h4>
                        <ul className={`space-y-1 text-sm ${profile.forecastingReadiness.ready
                            ? 'text-green-800 dark:text-green-300'
                            : 'text-yellow-800 dark:text-yellow-300'
                            }`}>
                            {profile.forecastingReadiness.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {onProfileComplete && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                        setIsProcessing(true);
                        const success = await onProfileComplete(profile);
                        if (success !== true) {
                            setIsProcessing(false);
                        }
                    }}
                    disabled={isProcessing}
                    className={`w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-all ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-5 h-5" />
                            Proceed to Data Preprocessing
                        </>
                    )}
                </motion.button>
            )}
        </motion.div>
    );
};

/**
 * StatCard - Reusable stat card component
 */
const StatCard = ({ label, value, icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
            <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};

/**
 * Generate profile from CSV data
 */
const generateProfile = (data) => {
    if (!data || !data.length) {
        return getEmptyProfile();
    }

    const columns = Object.keys(data[0] || {});
    const rows = data.length;

    // Detect date column
    const dateColumn = columns.find(col =>
        col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
    );

    // Calculate date range
    let dateRange = { min: null, max: null, span: 0 };
    if (dateColumn) {
        const dates = data.map(row => new Date(row[dateColumn])).filter(d => !isNaN(d));
        if (dates.length) {
            dateRange.min = new Date(Math.min(...dates));
            dateRange.max = new Date(Math.max(...dates));
            dateRange.span = Math.ceil((dateRange.max - dateRange.min) / (1000 * 60 * 60 * 24));
        }
    }

    // Calculate missing values
    const missingByColumn = {};
    let totalMissing = 0;
    columns.forEach(col => {
        const missing = data.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
        missingByColumn[col] = missing;
        totalMissing += missing;
    });

    // Calculate statistical summary for numeric columns
    const statisticalSummary = columns.map(col => {
        const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
        const numericValues = values.map(Number).filter(n => !isNaN(n));

        const type = numericValues.length === values.length && numericValues.length > 0
            ? 'number'
            : dateColumn === col
                ? 'date'
                : 'string';

        if (type === 'number' && numericValues.length > 0) {
            const sum = numericValues.reduce((a, b) => a + b, 0);
            const mean = sum / numericValues.length;
            const sorted = [...numericValues].sort((a, b) => a - b);
            const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length;

            return {
                column: col,
                type,
                mean,
                std: Math.sqrt(variance),
                min: sorted[0],
                max: sorted[sorted.length - 1],
                count: numericValues.length
            };
        }

        return {
            column: col,
            type,
            mean: null,
            std: null,
            min: null,
            max: null,
            count: values.length
        };
    });

    // Generate business insights
    const salesColumn = columns.find(col =>
        col.toLowerCase().includes('sales') || col.toLowerCase().includes('quantity') || col.toLowerCase().includes('amount')
    );

    const businessInsights = [];

    if (salesColumn) {
        const salesStats = statisticalSummary.find(s => s.column === salesColumn);
        if (salesStats && salesStats.mean) {
            businessInsights.push(`Average ${salesColumn}: ${salesStats.mean.toLocaleString(undefined, { maximumFractionDigits: 0 })} units per record`);

            const cv = (salesStats.std / salesStats.mean) * 100;
            if (cv > 50) {
                businessInsights.push(`High demand volatility detected (${cv.toFixed(1)}% coefficient of variation)`);
            } else if (cv < 20) {
                businessInsights.push(`Stable demand pattern with low variability (${cv.toFixed(1)}% CV)`);
            }
        }
    }

    if (dateRange.span > 30) {
        businessInsights.push(`${dateRange.span} days of historical data available for trend analysis`);
    }

    businessInsights.push(`Dataset contains ${rows.toLocaleString()} records across ${columns.length} attributes`);

    // Forecasting readiness assessment
    const completeness = ((1 - (totalMissing / (rows * columns.length))) * 100);
    const isReady = completeness > 90 && rows > 30 && dateColumn;

    const forecastingReadiness = {
        ready: isReady,
        message: isReady
            ? 'Your dataset meets the requirements for accurate demand forecasting.'
            : 'Some data quality improvements are recommended before forecasting.',
        strengths: [
            rows > 100 ? 'Sufficient historical data points' : 'Data loaded successfully',
            dateColumn ? 'Time series data detected' : 'Categorical data available',
            completeness > 95 ? 'Excellent data completeness' : 'Data structure validated'
        ],
        recommendations: [
            'Use seasonal models (Prophet, SARIMA) for best results',
            dateRange.span > 365 ? 'Annual seasonality can be captured' : 'Consider adding more historical data',
            'Weekly aggregation recommended for stability'
        ]
    };

    return {
        dimensions: {
            rows,
            columns: columns.length,
            dateRange: dateRange.min && dateRange.max
                ? `${dateRange.min.toLocaleDateString()} - ${dateRange.max.toLocaleDateString()}`
                : 'N/A',
            timeSpanDays: dateRange.span || 0
        },
        dataQuality: {
            missingCount: totalMissing,
            missingByColumn,
            completeness: completeness.toFixed(1),
            duplicates: 0 // Would need additional logic to detect
        },
        statisticalSummary,
        businessInsights,
        forecastingReadiness
    };
};

const getEmptyProfile = () => ({
    dimensions: { rows: 0, columns: 0, dateRange: 'N/A', timeSpanDays: 0 },
    dataQuality: { missingCount: 0, missingByColumn: {}, completeness: 0, duplicates: 0 },
    statisticalSummary: [],
    businessInsights: ['No data loaded yet'],
    forecastingReadiness: {
        ready: false,
        message: 'Please upload a dataset to begin analysis.',
        strengths: [],
        recommendations: ['Upload a CSV file with date and sales columns']
    }
});

export default DatasetProfiler;
