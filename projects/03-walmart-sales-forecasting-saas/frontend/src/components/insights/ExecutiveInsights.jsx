/**
 * ExecutiveInsights Component
 * Displays business-focused insights translated from ML forecasts
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    Lightbulb,
    CheckCircle2,
    Clock
} from 'lucide-react';

const ExecutiveInsights = ({ insights }) => {
    if (!insights) return null;

    const { executive_summary, revenue_impact, strategic_recommendations, risk_assessment, action_plan } = insights;

    const getTrendIcon = (rate) => {
        return rate > 0 ? (
            <TrendingUp className="w-6 h-6 text-success-600" />
        ) : (
            <TrendingDown className="w-6 h-6 text-error-600" />
        );
    };

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'high':
                return 'bg-error-50 text-error-700 border-error-200';
            case 'medium':
                return 'bg-warning-50 text-warning-700 border-warning-200';
            case 'low':
                return 'bg-success-50 text-success-700 border-success-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-error-100 text-error-800';
            case 'medium':
                return 'bg-warning-100 text-warning-800';
            case 'low':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Executive Summary */}
            {executive_summary && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-8 border border-primary-200"
                >
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                            {getTrendIcon(executive_summary.growth_rate)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {executive_summary.headline}
                            </h3>
                            <div className="grid grid-cols-3 gap-6 mb-4">
                                <div>
                                    <div className="text-sm text-gray-600">Growth Rate</div>
                                    <div className={`text-2xl font-bold ${executive_summary.growth_rate > 0 ? 'text-success-600' : 'text-error-600'}`}>
                                        {executive_summary.growth_rate > 0 ? '+' : ''}{executive_summary.growth_rate.toFixed(1)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Forecast Accuracy</div>
                                    <div className="text-2xl font-bold text-primary-600">
                                        {executive_summary.accuracy_rating.toFixed(1)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Confidence</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {executive_summary.confidence}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {executive_summary.key_insights.map((insight, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-700">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Revenue Impact */}
            {revenue_impact && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-success-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">Revenue Impact Analysis</h4>
                            <p className="text-sm text-gray-600">{revenue_impact.business_impact}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Worst Case</div>
                            <div className="text-xl font-bold text-error-600">
                                ${revenue_impact.worst_case_scenario.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-center p-4 bg-primary-50 rounded-lg border-2 border-primary-500">
                            <div className="text-xs text-primary-700 font-medium mb-1">Projected</div>
                            <div className="text-2xl font-bold text-primary-600">
                                ${revenue_impact.projected_revenue.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Best Case</div>
                            <div className="text-xl font-bold text-success-600">
                                ${revenue_impact.best_case_scenario.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Revenue Delta</span>
                        <span className={`text-lg font-bold ${revenue_impact.revenue_delta > 0 ? 'text-success-600' : 'text-error-600'}`}>
                            {revenue_impact.revenue_delta > 0 ? '+' : ''}${revenue_impact.revenue_delta.toLocaleString()}
                            <span className="text-sm ml-1">
                                ({revenue_impact.revenue_delta_pct > 0 ? '+' : ''}{revenue_impact.revenue_delta_pct.toFixed(1)}%)
                            </span>
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Strategic Recommendations */}
            {strategic_recommendations && strategic_recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-amber-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h4>
                    </div>

                    <div className="space-y-4">
                        {strategic_recommendations.map((rec, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                                <div className="flex items-start gap-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(rec.priority)}`}>
                                        {rec.priority?.toUpperCase()}
                                    </span>
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 mb-1">{rec.title}</h5>
                                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Expected Impact:</span> {rec.expected_impact}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Risk Assessment */}
            {risk_assessment && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${risk_assessment.risk_level === 'High' ? 'bg-error-100' :
                                risk_assessment.risk_level === 'Medium' ? 'bg-warning-100' : 'bg-success-100'
                            }`}>
                            <AlertTriangle className={`w-6 h-6 ${risk_assessment.risk_level === 'High' ? 'text-error-600' :
                                    risk_assessment.risk_level === 'Medium' ? 'text-warning-600' : 'text-success-600'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">Risk Assessment</h4>
                            <p className="text-sm text-gray-600">
                                Overall Risk Level: <span className="font-semibold">{risk_assessment.risk_level}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">{risk_assessment.overall_risk_score}/100</div>
                            <div className="text-xs text-gray-600">Risk Score</div>
                        </div>
                    </div>

                    {risk_assessment.identified_risks && risk_assessment.identified_risks.length > 0 && (
                        <div className="space-y-3">
                            {risk_assessment.identified_risks.map((risk, idx) => (
                                <div key={idx} className={`p-4 border rounded-lg ${getRiskColor(risk.level)}`}>
                                    <div className="font-semibold mb-1">{risk.type.replace(/_/g, ' ').toUpperCase()}</div>
                                    <p className="text-sm mb-2">{risk.description}</p>
                                    <div className="text-sm">
                                        <span className="font-medium">Mitigation:</span> {risk.mitigation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Action Plan */}
            {action_plan && action_plan.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Action Plan</h4>
                    </div>

                    <div className="space-y-6">
                        {action_plan.map((phase, idx) => (
                            <div key={idx}>
                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                                        {idx + 1}
                                    </span>
                                    {phase.timeframe}
                                </h5>
                                <ul className="space-y-2 ml-10">
                                    {phase.actions.map((action, actionIdx) => (
                                        <li key={actionIdx} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ExecutiveInsights;
