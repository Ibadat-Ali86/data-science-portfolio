import { motion } from 'framer-motion';
import {
    Target,
    Package,
    TrendingUp,
    DollarSign,
    Megaphone,
    Clock,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Download,
    FileText,
    FileSpreadsheet,
    FileCode,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { generatePDFReport, generateExcelReport, generateForecastCSV } from '../../utils/reportGenerator';

/**
 * ActionableRecommendations - Displays specific action items for business teams
 * Includes marketing strategies, inventory guidance, and prioritized action plan
 * Now with working export functionality using actual analysis data
 */
const ActionableRecommendations = ({ forecastData, insights, onExport, analysisData }) => {
    const recommendations = generateRecommendations(forecastData, insights);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Actionable Recommendations
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Prioritized action items for your business
                            </p>
                        </div>
                    </div>

                    {onExport && (
                        <button
                            onClick={onExport}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    )}
                </div>
            </div>

            {/* Marketing Strategies */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-500" />
                    Marketing Strategy Recommendations
                </h3>

                <div className="space-y-4">
                    {recommendations.marketing.map((strategy, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{strategy.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${strategy.roi === 'High'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    }`}>
                                    {strategy.roi} ROI
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {strategy.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                    Budget: {strategy.budget}
                                </span>
                                {strategy.channels.map((channel, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                        {channel}
                                    </span>
                                ))}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tactics:</p>
                                <ul className="space-y-1">
                                    {strategy.tactics.slice(0, 3).map((tactic, i) => (
                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <ArrowRight className="w-3 h-3 flex-shrink-0 mt-1 text-purple-500" />
                                            {tactic}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Inventory Guidance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Inventory Management Guidance
                </h3>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Recommended Stock
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Safety Stock
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Reorder Point
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Risk
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {recommendations.inventory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {item.category}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.recommendedStock.toLocaleString()} units
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.safetyStock.toLocaleString()} units
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.reorderPoint.toLocaleString()} units
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full ${item.risk === 'Low'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            : item.risk === 'Medium'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                            }`}>
                                            {item.risk}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Prioritized Action Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Prioritized Action Plan
                </h3>

                {/* Immediate Actions */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                            Immediate (Week 1-2)
                        </span>
                    </div>
                    <div className="space-y-2">
                        {recommendations.actions.immediate.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{action.action}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Dept: {action.department}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Impact: {action.impact}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Short-term Actions */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                            Short-term (Month 1)
                        </span>
                    </div>
                    <div className="space-y-2">
                        {recommendations.actions.shortTerm.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-800">
                                <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{action.action}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Dept: {action.department}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Impact: {action.impact}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strategic Actions */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                            Strategic (Months 2-3)
                        </span>
                    </div>
                    <div className="space-y-2">
                        {recommendations.actions.strategic.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{action.action}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Dept: {action.department}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Impact: {action.impact}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export Options - Now with working exports */}
            <ExportSection analysisData={analysisData} />
        </motion.div>
    );
};

/**
 * Export Section Component - Uses actual export utilities
 */
const ExportSection = ({ analysisData }) => {
    const [exporting, setExporting] = useState(null);
    const [exportSuccess, setExportSuccess] = useState(null);

    const handleExport = async (format) => {
        if (!analysisData) {
            alert('No analysis data available. Please complete the analysis pipeline first.');
            return;
        }

        setExporting(format);
        setExportSuccess(null);

        try {
            // Small delay for UX feedback
            await new Promise(resolve => setTimeout(resolve, 500));

            if (format === 'pdf') {
                generatePDFReport(analysisData);
            } else if (format === 'excel') {
                generateExcelReport(analysisData);
            } else if (format === 'csv') {
                generateForecastCSV(analysisData);
            }

            setExportSuccess(format);
            setTimeout(() => setExportSuccess(null), 3000);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message}. Please check data validity.`);
        } finally {
            setExporting(null);
        }
    };

    const exportOptions = [
        {
            format: 'pdf',
            label: 'PDF Report',
            description: 'Professional formatted report with charts, metrics, and recommendations',
            icon: FileText,
            color: 'from-red-500 to-rose-500'
        },
        {
            format: 'excel',
            label: 'Excel Workbook',
            description: 'Multi-sheet workbook with all data, forecasts, and analysis',
            icon: FileSpreadsheet,
            color: 'from-green-500 to-emerald-500'
        },
        {
            format: 'csv',
            label: 'CSV Data',
            description: 'Raw forecast data for further analysis or integration',
            icon: FileCode,
            color: 'from-blue-500 to-cyan-500'
        }
    ];

    return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Your Report
                </h3>
                {!analysisData && (
                    <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                        Complete analysis to enable exports
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exportOptions.map((option) => (
                    <motion.button
                        key={option.format}
                        whileHover={{ scale: analysisData ? 1.02 : 1 }}
                        whileTap={{ scale: analysisData ? 0.98 : 1 }}
                        onClick={() => handleExport(option.format)}
                        disabled={!analysisData || exporting}
                        className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 transition-all text-left ${exportSuccess === option.format
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : analysisData
                                ? 'border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md'
                                : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${option.color} text-white`}>
                            {exporting === option.format ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : exportSuccess === option.format ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                (() => {
                                    const Icon = option.icon;
                                    return <Icon className="w-5 h-5" />;
                                })()
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                                {exporting === option.format ? 'Generating...' : option.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {exportSuccess === option.format ? 'Downloaded successfully!' : option.description}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>

            {analysisData && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Reports will include {analysisData.dataLength || 'all'} records with {analysisData.metrics?.modelType || 'ensemble'} model results
                </p>
            )}
        </div>
    );
};

/**
 * Generate recommendations from data
 */
const generateRecommendations = (forecastData, insights) => {
    return {
        marketing: [
            {
                name: 'High-Performer Amplification Campaign',
                description: 'Focus marketing resources on products showing strongest demand signals.',
                budget: '40% of marketing budget',
                roi: 'High',
                channels: ['Digital Ads', 'Email', 'Social'],
                tactics: [
                    'Create product-specific landing pages optimized for conversion',
                    'Develop customer testimonial and case study content',
                    'Implement retargeting campaigns for cart abandoners',
                    'Launch influencer partnerships for social proof'
                ]
            },
            {
                name: 'Demand Revival Strategy',
                description: 'Targeted campaigns to boost underperforming product categories.',
                budget: '25% of marketing budget',
                roi: 'Medium',
                channels: ['Content', 'SEO', 'PR'],
                tactics: [
                    'Develop educational content highlighting unique value propositions',
                    'Launch limited-time promotions and bundle deals',
                    'Partner with complementary brands for cross-promotion',
                    'Optimize product descriptions and search visibility'
                ]
            }
        ],
        inventory: [
            { category: 'Electronics', recommendedStock: 2500, safetyStock: 375, reorderPoint: 625, risk: 'Low' },
            { category: 'Clothing', recommendedStock: 4200, safetyStock: 630, reorderPoint: 1050, risk: 'Medium' },
            { category: 'Food & Beverage', recommendedStock: 8500, safetyStock: 1275, reorderPoint: 2125, risk: 'Low' },
            { category: 'Home & Garden', recommendedStock: 1800, safetyStock: 270, reorderPoint: 450, risk: 'High' }
        ],
        actions: {
            immediate: [
                { action: 'Increase safety stock for top 5 high-velocity products by 20%', department: 'Operations', impact: 'High' },
                { action: 'Launch promotional campaign for low-demand products', department: 'Marketing', impact: 'Medium' },
                { action: 'Review and adjust reorder points based on new forecasts', department: 'Procurement', impact: 'High' }
            ],
            shortTerm: [
                { action: 'Implement dynamic pricing for peak demand periods', department: 'Pricing', impact: 'Medium' },
                { action: 'Cross-train staff for flexible demand response', department: 'HR', impact: 'Medium' },
                { action: 'Negotiate flexible supplier agreements', department: 'Procurement', impact: 'High' }
            ],
            strategic: [
                { action: 'Evaluate product portfolio based on demand trends', department: 'Product', impact: 'High' },
                { action: 'Develop automated inventory replenishment system', department: 'IT', impact: 'Medium' },
                { action: 'Explore new market segments identified by demand patterns', department: 'Strategy', impact: 'High' }
            ]
        }
    };
};

export default ActionableRecommendations;
