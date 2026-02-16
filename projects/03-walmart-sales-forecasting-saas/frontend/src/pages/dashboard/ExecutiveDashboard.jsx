/**
 * Executive Dashboard
 * C-suite level overview with high-level KPIs and business metrics
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    AlertTriangle,
    Download,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ExecutiveDashboard = ({ forecastData, historicalData, businessInsights }) => {
    const [timeRange, setTimeRange] = useState('30d');

    // KPI data from business insights
    const kpis = businessInsights?.executive_summary || {};
    const revenue = businessInsights?.revenue_impact || {};
    const risks = businessInsights?.risk_assessment || {};

    // Chart configurations
    const revenueChartData = {
        labels: forecastData?.dates || [],
        datasets: [
            {
                label: 'Projected Revenue',
                data: forecastData?.predictions?.map(p => p * (revenue.avg_price || 45)) || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Upper Bound',
                data: forecastData?.upper_bound?.map(p => p * (revenue.avg_price || 45)) || [],
                borderColor: 'rgba(34, 197, 94, 0.3)',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            },
            {
                label: 'Lower Bound',
                data: forecastData?.lower_bound?.map(p => p * (revenue.avg_price || 45)) || [],
                borderColor: 'rgba(239, 68, 68, 0.3)',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${(value / 1000).toFixed(0)}K`
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
                        <p className="text-gray-600 mt-1">Strategic overview and key business metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={`text-sm font-medium ${kpis.growth_rate > 0 ? 'text-success-600' : 'text-error-600'}`}>
                            {kpis.growth_rate > 0 ? '+' : ''}{kpis.growth_rate?.toFixed(1)}%
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Projected Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        ${(revenue.projected_revenue || 0).toLocaleString()}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">vs Last Period</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Forecast Accuracy</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {kpis.accuracy_rating?.toFixed(1)}%
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-success-600">Optimized</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Inventory Status</h3>
                    <p className="text-2xl font-bold text-gray-900">98.2%</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${risks.risk_level === 'High' ? 'bg-error-100' :
                                risks.risk_level === 'Medium' ? 'bg-warning-100' : 'bg-success-100'
                            }`}>
                            <AlertTriangle className={`w-6 h-6 ${risks.risk_level === 'High' ? 'text-error-600' :
                                    risks.risk_level === 'Medium' ? 'text-warning-600' : 'text-success-600'
                                }`} />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{risks.risk_level || 'Low'}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Risk Level</h3>
                    <p className="text-2xl font-bold text-gray-900">{risks.overall_risk_score || 0}/100</p>
                </motion.div>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Revenue Forecast Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View Details →
                        </button>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Line data={revenueChartData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Growth Opportunities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Strategic Opportunities</h3>
                    <div className="space-y-4">
                        {businessInsights?.opportunity_analysis?.slice(0, 3).map((opportunity, idx) => (
                            <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm font-semibold text-blue-900">{opportunity.title}</span>
                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                        {opportunity.priority?.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-700 mb-2">{opportunity.description}</p>
                                <div className="text-xs text-blue-600">
                                    Impact: <span className="font-medium">{opportunity.potential_impact}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Action Items */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Immediate Action Items</h3>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                        View Full Plan
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {businessInsights?.action_plan?.[0]?.actions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                            </div>
                            <p className="text-sm text-gray-700">{action}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default ExecutiveDashboard;
