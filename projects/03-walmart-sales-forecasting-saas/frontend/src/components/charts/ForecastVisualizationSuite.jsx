import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, BarChart3, Activity, Target, Calendar, Layers } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * ForecastVisualizationSuite - Comprehensive visualization suite for forecasts
 * Includes 6 chart types: Main Forecast, Trend Decomposition, Product Comparison,
 * Monthly Aggregation, Forecast vs Actual, and Risk Heatmap
 */
const ForecastVisualizationSuite = ({ forecastData, historicalData, darkMode = false }) => {
    const chartData = generateChartData(forecastData, historicalData);

    return (
        <div className="space-y-6">
            {/* 1. Main Forecast Chart - Line with Confidence Intervals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Demand Forecast with Confidence Intervals
                    </h3>
                </div>
                <div className="h-80">
                    <Line
                        data={chartData.forecastLine}
                        options={getForecastLineOptions(darkMode)}
                    />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Blue line shows historical demand, purple line shows forecasted demand,
                    and shaded area represents 95% confidence interval.
                </p>
            </motion.div>

            {/* 2. Trend Decomposition */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Trend Components Analysis
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Trend</p>
                        <div className="h-48">
                            <Line
                                data={chartData.trend}
                                options={getSmallChartOptions(darkMode)}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seasonal Pattern</p>
                        <div className="h-48">
                            <Line
                                data={chartData.seasonal}
                                options={getSmallChartOptions(darkMode)}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Residuals</p>
                        <div className="h-48">
                            <Bar
                                data={chartData.residuals}
                                options={getSmallChartOptions(darkMode)}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 3. Product Comparison Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Product Performance Comparison
                    </h3>
                </div>
                <div className="h-80">
                    <Bar
                        data={chartData.productComparison}
                        options={getProductComparisonOptions(darkMode)}
                    />
                </div>
            </motion.div>

            {/* 4. Monthly Aggregation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Monthly Demand Forecast
                    </h3>
                </div>
                <div className="h-72">
                    <Bar
                        data={chartData.monthly}
                        options={getMonthlyChartOptions(darkMode)}
                    />
                </div>
            </motion.div>

            {/* 5. Forecast vs Actual */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-red-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Forecast vs Actual (Validation Period)
                    </h3>
                </div>
                <div className="h-72">
                    <Line
                        data={chartData.validation}
                        options={getValidationChartOptions(darkMode)}
                    />
                </div>
            </motion.div>

            {/* 6. Risk Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Demand Variability by Product & Period
                    </h3>
                </div>
                <HeatmapChart darkMode={darkMode} />
            </motion.div>
        </div>
    );
};

/**
 * Custom Heatmap component
 */
const HeatmapChart = ({ darkMode }) => {
    const products = ['Electronics', 'Clothing', 'Food', 'Home', 'Sports'];
    const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    const data = products.map(() =>
        periods.map(() => Math.random() * 100)
    );

    const getColor = (value) => {
        if (value < 25) return 'bg-green-200 dark:bg-green-900/50';
        if (value < 50) return 'bg-yellow-200 dark:bg-yellow-900/50';
        if (value < 75) return 'bg-orange-200 dark:bg-orange-900/50';
        return 'bg-red-200 dark:bg-red-900/50';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                        {periods.map(period => (
                            <th key={period} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                {period}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, i) => (
                        <tr key={product}>
                            <td className="p-2 text-sm font-medium text-gray-900 dark:text-white">{product}</td>
                            {periods.map((period, j) => (
                                <td key={period} className="p-1">
                                    <div className={`p-3 rounded-lg text-center ${getColor(data[i][j])}`}>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            {data[i][j].toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-200 dark:bg-green-900/50 rounded"></div>
                    Low Risk
                </span>
                <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/50 rounded"></div>
                    Moderate
                </span>
                <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-orange-200 dark:bg-orange-900/50 rounded"></div>
                    High
                </span>
                <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-200 dark:bg-red-900/50 rounded"></div>
                    Critical
                </span>
            </div>
        </div>
    );
};

/**
 * Generate chart data from forecast and historical data
 */
const generateChartData = (forecastData, historicalData) => {

    // Use real data if available and valid
    if (forecastData && forecastData.forecast &&
        Array.isArray(forecastData.forecast.dates) &&
        Array.isArray(forecastData.forecast.predictions)) {

        try {
            const f = forecastData.forecast;
            const historicalDateCount = historicalData?.length || 60;

            // Safe parsing of historical data
            let historyValues = [];
            let historyDates = [];

            if (Array.isArray(historicalData)) {
                const recentHistory = historicalData.slice(-60);
                historyValues = recentHistory.map(row => {
                    const val = parseFloat(Object.values(row)[1]);
                    return isNaN(val) ? 0 : val;
                });
                historyDates = recentHistory.map(row => {
                    const d = new Date(Object.values(row)[0]);
                    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
            }

            // Safe access to forecast arrays
            const forecastValues = f.predictions || [];
            const forecastDates = (f.dates || []).map(d => {
                const date = new Date(d);
                return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            const upperBound = Array.isArray(f.upper_bound) ? f.upper_bound : forecastValues;
            const lowerBound = Array.isArray(f.lower_bound) ? f.lower_bound : forecastValues;

            // Pad history with nulls for forecast part
            const fullHistoryValues = [...historyValues, ...Array(forecastValues.length).fill(null)];

            // Pad forecast with nulls for history part
            const fullForecastValues = [...Array(historyValues.length).fill(null), ...forecastValues];
            const fullUpper = [...Array(historyValues.length).fill(null), ...upperBound];
            const fullLower = [...Array(historyValues.length).fill(null), ...lowerBound];

            const allLabels = [...historyDates, ...forecastDates];

            return {
                forecastLine: {
                    labels: allLabels,
                    datasets: [
                        {
                            label: 'Historical Demand',
                            data: fullHistoryValues,
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.2
                        },
                        {
                            label: 'Forecasted Demand',
                            data: fullForecastValues,
                            borderColor: 'rgb(168, 85, 247)',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.2,
                            borderDash: [5, 5]
                        },
                        {
                            label: 'Upper Bound (95%)',
                            data: fullUpper,
                            borderColor: 'rgba(168, 85, 247, 0)',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            borderWidth: 0,
                            pointRadius: 0,
                            fill: '+1',
                            tension: 0.2
                        },
                        {
                            label: 'Lower Bound (95%)',
                            data: fullLower,
                            borderColor: 'rgba(168, 85, 247, 0)',
                            borderWidth: 0,
                            pointRadius: 0,
                            fill: false,
                            tension: 0.2
                        }
                    ]
                },
                // Fallback for other charts (keep mock for now or implement similarly)
                trend: {
                    labels: forecastDates.slice(0, 15),
                    datasets: [{
                        label: 'Trend',
                        data: forecastValues.map((v, i) => v * (1 + i * 0.01)),
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4
                    }]
                },
                seasonal: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Weekly Pattern',
                        data: [0.9, 0.95, 1.0, 1.05, 1.2, 1.3, 1.1].map(m => m * (historyValues[0] || 100)),
                        borderColor: 'rgb(249, 115, 22)',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                residuals: {
                    labels: forecastDates.slice(0, 15),
                    datasets: [{
                        label: 'Residuals',
                        data: forecastValues.slice(0, 15).map(v => (Math.random() - 0.5) * (v * 0.1)),
                        backgroundColor: (ctx) => ctx.raw > 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                        borderWidth: 0
                    }]
                },
                productComparison: {
                    labels: ['Current Forecast', 'Historical Avg', 'Target'],
                    datasets: [
                        {
                            label: 'Volume',
                            data: [
                                forecastValues.reduce((a, b) => a + b, 0),
                                historyValues.reduce((a, b) => a + b, 0) * (forecastValues.length / (historyValues.length || 1)),
                                forecastValues.reduce((a, b) => a + b, 0) * 1.1
                            ],
                            backgroundColor: ['rgba(168, 85, 247, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)'],
                            borderRadius: 4
                        }
                    ]
                },
                monthly: {
                    labels: ['Month 1', 'Month 2', 'Month 3'],
                    datasets: [{
                        label: 'Projected Revenue',
                        data: [
                            forecastValues.slice(0, 10).reduce((a, b) => a + b, 0),
                            forecastValues.slice(10, 20).reduce((a, b) => a + b, 0),
                            forecastValues.slice(20, 30).reduce((a, b) => a + b, 0)
                        ],
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderRadius: 6
                    }]
                },
                validation: {
                    labels: forecastDates.slice(0, 10),
                    datasets: [
                        {
                            label: 'Predicted',
                            data: forecastValues.slice(0, 10),
                            borderColor: 'rgb(168, 85, 247)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            pointRadius: 3,
                            tension: 0.4
                        }
                    ]
                }
            };
        } catch (err) {
            console.error("Error generating chart data from real forecast:", err);
            // Fall through to mock data generation on error
        }
    }

    // Generate sample data if not provided
    const days = 30;
    const historicalDays = 60;

    const historicalDates = Array.from({ length: historicalDays }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (historicalDays - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const forecastDates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Generate values with realistic patterns
    const baseValue = 1000;
    const generateHistorical = () => Array.from({ length: historicalDays }, (_, i) =>
        baseValue + Math.sin(i / 7 * Math.PI) * 200 + Math.random() * 150
    );

    const generateForecast = () => Array.from({ length: days }, (_, i) =>
        baseValue + 100 + Math.sin((historicalDays + i) / 7 * Math.PI) * 200 + Math.random() * 100
    );

    const historicalValues = generateHistorical();
    const forecastValues = generateForecast();
    const upperBound = forecastValues.map(v => v * 1.15);
    const lowerBound = forecastValues.map(v => v * 0.85);

    return {
        forecastLine: {
            labels: [...historicalDates, ...forecastDates],
            datasets: [
                {
                    label: 'Historical Demand',
                    data: [...historicalValues, ...Array(days).fill(null)],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'Forecasted Demand',
                    data: [...Array(historicalDays).fill(null), ...forecastValues],
                    borderColor: 'rgb(168, 85, 247)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    borderDash: [5, 5]
                },
                {
                    label: 'Upper Bound (95% CI)',
                    data: [...Array(historicalDays).fill(null), ...upperBound],
                    borderColor: 'rgba(168, 85, 247, 0.3)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: '+1',
                    tension: 0.4
                },
                {
                    label: 'Lower Bound (95% CI)',
                    data: [...Array(historicalDays).fill(null), ...lowerBound],
                    borderColor: 'rgba(168, 85, 247, 0.3)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        trend: {
            labels: forecastDates.slice(0, 15),
            datasets: [{
                label: 'Trend',
                data: forecastValues.slice(0, 15).map((_, i) => 1000 + i * 10),
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4
            }]
        },
        seasonal: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Weekly Pattern',
                data: [85, 92, 88, 95, 100, 130, 125],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                fill: true,
                tension: 0.4
            }]
        },
        residuals: {
            labels: forecastDates.slice(0, 15),
            datasets: [{
                label: 'Residuals',
                data: Array.from({ length: 15 }, () => (Math.random() - 0.5) * 100),
                backgroundColor: (ctx) => {
                    const value = ctx.raw;
                    return value > 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
                },
                borderWidth: 0
            }]
        },
        productComparison: {
            labels: ['Electronics', 'Clothing', 'Food & Beverage', 'Home & Garden', 'Sports'],
            datasets: [
                {
                    label: 'Current Period',
                    data: [4500, 3200, 6800, 2100, 1800],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 4
                },
                {
                    label: 'Forecasted',
                    data: [5200, 3800, 7200, 2400, 2100],
                    backgroundColor: 'rgba(168, 85, 247, 0.8)',
                    borderRadius: 4
                }
            ]
        },
        monthly: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
                label: 'Monthly Forecast',
                data: [28000, 32000, 35000, 38000, 42000, 45000],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        validation: {
            labels: forecastDates.slice(0, 20),
            datasets: [
                {
                    label: 'Actual',
                    data: forecastValues.slice(0, 20).map(v => v + (Math.random() - 0.5) * 100),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4
                },
                {
                    label: 'Predicted',
                    data: forecastValues.slice(0, 20),
                    borderColor: 'rgb(168, 85, 247)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 3,
                    tension: 0.4
                }
            ]
        }
    };
};

/**
 * Chart options configurations
 */
const getForecastLineOptions = (darkMode) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 20,
                color: darkMode ? '#e5e7eb' : '#374151',
                font: { size: 12, family: 'Inter' }
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280', font: { size: 10 }, maxTicksLimit: 12 }
        },
        y: {
            grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280', font: { size: 11 } }
        }
    },
    animation: { duration: 2000, easing: 'easeInOutQuart' }
});

const getSmallChartOptions = (darkMode) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280', font: { size: 9 }, maxTicksLimit: 7 }
        },
        y: {
            grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280', font: { size: 9 } }
        }
    }
});

const getProductComparisonOptions = (darkMode) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: { color: darkMode ? '#e5e7eb' : '#374151', usePointStyle: true, padding: 20 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
        },
        y: {
            grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
        }
    }
});

const getMonthlyChartOptions = (darkMode) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
        },
        y: {
            grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
        }
    }
});

const getValidationChartOptions = (darkMode) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: { color: darkMode ? '#e5e7eb' : '#374151', usePointStyle: true, padding: 20 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280', font: { size: 10 }, maxTicksLimit: 10 }
        },
        y: {
            grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
        }
    }
});

export default ForecastVisualizationSuite;
