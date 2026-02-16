import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Sparkles,
    Target,
    DollarSign,
    Package,
    ShoppingCart,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Info
} from 'lucide-react';

/**
 * BusinessInsights - Displays actionable business insights from forecast data
 * Includes executive summary, trend analysis, product recommendations, and risk analysis
 */
const BusinessInsights = ({ forecastData, metrics, onContinue }) => {
    const insights = generateBusinessInsights(forecastData, metrics);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Executive Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Executive Summary</h2>
                        <p className="text-blue-100 text-sm">Key findings from your forecast analysis</p>
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">{insights.executive.headline}</h3>
                    <p className="text-blue-100">{insights.executive.summary}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <p className="text-3xl font-bold">{insights.executive.forecastedDemand}</p>
                        <p className="text-sm text-blue-200">Forecasted Units</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <p className={`text-3xl font-bold flex items-center justify-center gap-1 ${insights.executive.growth > 0 ? 'text-green-300' : 'text-red-300'
                            }`}>
                            {insights.executive.growth > 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                            {Math.abs(insights.executive.growth).toFixed(1)}%
                        </p>
                        <p className="text-sm text-blue-200">Growth Rate</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <p className="text-3xl font-bold">{metrics?.confidenceInterval || '95%'}</p>
                        <p className="text-sm text-blue-200">Confidence Level</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <p className="text-3xl font-bold">{insights.executive.accuracy}</p>
                        <p className="text-sm text-blue-200">Forecast Accuracy</p>
                    </div>
                </div>
            </div>

            {/* Key Findings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Key Findings
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    {insights.keyFindings.map((finding, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                            <div className={`p-2 rounded-lg ${finding.positive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}>
                                {finding.positive ? <TrendingUp className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{finding.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{finding.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Trend Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Trend Analysis
                </h3>

                <div className="space-y-4">
                    {insights.trends.map((trend, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className={`p-3 rounded-lg ${trend.direction === 'up'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : trend.direction === 'down'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                {trend.direction === 'up' ? <TrendingUp className="w-5 h-5" /> :
                                    trend.direction === 'down' ? <TrendingDown className="w-5 h-5" /> :
                                        <Calendar className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{trend.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{trend.description}</p>
                                <div className="flex gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${trend.impact === 'high'
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        : trend.impact === 'medium'
                                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        }`}>
                                        {trend.impact} impact
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {trend.timeframe}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Risk Analysis
                </h3>

                <div className="space-y-4">
                    {insights.risks.map((risk, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-lg border-l-4 ${risk.severity === 'high'
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                : risk.severity === 'medium'
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className={`font-semibold ${risk.severity === 'high'
                                    ? 'text-red-900 dark:text-red-200'
                                    : risk.severity === 'medium'
                                        ? 'text-yellow-900 dark:text-yellow-200'
                                        : 'text-blue-900 dark:text-blue-200'
                                    }`}>
                                    {risk.type}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${risk.severity === 'high'
                                    ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                                    : risk.severity === 'medium'
                                        ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                                        : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                    }`}>
                                    {risk.severity.toUpperCase()}
                                </span>
                            </div>
                            <p className={`text-sm mb-3 ${risk.severity === 'high'
                                ? 'text-red-800 dark:text-red-300'
                                : risk.severity === 'medium'
                                    ? 'text-yellow-800 dark:text-yellow-300'
                                    : 'text-blue-800 dark:text-blue-300'
                                }`}>
                                {risk.description}
                            </p>
                            <div>
                                <p className={`text-xs font-medium mb-2 ${risk.severity === 'high'
                                    ? 'text-red-700 dark:text-red-400'
                                    : risk.severity === 'medium'
                                        ? 'text-yellow-700 dark:text-yellow-400'
                                        : 'text-blue-700 dark:text-blue-400'
                                    }`}>
                                    Mitigation Strategies:
                                </p>
                                <ul className="space-y-1">
                                    {risk.mitigation.map((m, i) => (
                                        <li key={i} className={`text-sm flex items-start gap-2 ${risk.severity === 'high'
                                            ? 'text-red-700 dark:text-red-300'
                                            : risk.severity === 'medium'
                                                ? 'text-yellow-700 dark:text-yellow-300'
                                                : 'text-blue-700 dark:text-blue-300'
                                            }`}>
                                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {m}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Opportunities */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Growth Opportunities
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    {insights.opportunities.map((opp, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-gray-900 dark:text-white">
                                    {opp.icon}
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{opp.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{opp.description}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                    {opp.potential}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{opp.timeline}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Continue Button */}
            {onContinue && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onContinue}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                    <DollarSign className="w-5 h-5" />
                    View Actionable Recommendations
                </motion.button>
            )}
        </motion.div>
    );
};

/**
 * Generate business insights from forecast data
 */
const generateBusinessInsights = (forecastData, metrics) => {
    // If real business insights are provided from backend, use them
    if (metrics?.business_insights && !metrics.business_insights.error) {
        const bi = metrics.business_insights;
        return {
            executive: {
                headline: bi.executive_summary.headline,
                summary: bi.executive_summary.key_insights[0], // Use first insight as summary
                forecastedDemand: bi.executive_summary.expected_total.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                growth: bi.executive_summary.growth_rate,
                accuracy: bi.executive_summary.accuracy_rating
            },
            keyFindings: bi.executive_summary.key_insights.map(insight => ({
                title: 'Insight', // Backend doesn't give titles yet, generic for now
                description: insight,
                positive: !insight.toLowerCase().includes('decline')
            })),
            trends: bi.strategic_recommendations.map(rec => ({
                title: rec.title || rec.category,
                description: rec.description,
                direction: 'neutral', // TODO: Add direction to backend or infer
                impact: rec.priority,
                timeframe: 'Strategic'
            })),
            risks: bi.risk_assessment.identified_risks.map(risk => ({
                type: risk.type,
                severity: risk.level,
                description: risk.description,
                mitigation: [risk.mitigation]
            })),
            opportunities: bi.opportunity_analysis.map(opp => ({
                title: opp.title,
                description: opp.description,
                potential: opp.potential_impact,
                timeline: 'Strategic',
                icon: <Target className="w-5 h-5 text-green-600" />
            }))
        };
    }

    // Fallback if no backend insights (should not happen with new backend)
    return {
        executive: {
            headline: "Analysis Complete",
            summary: "Detailed business insights are being generated.",
            forecastedDemand: "---",
            growth: 0,
            accuracy: "---"
        },
        keyFindings: [],
        trends: [],
        risks: [],
        opportunities: []
    };
};

export default BusinessInsights;
