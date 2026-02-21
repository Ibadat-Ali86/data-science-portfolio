/**
 * FeatureImportanceChart
 * Displays top contributing features to the ML forecast model
 * as a horizontal bar chart using Recharts, with premium light-mode styling.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Info, Sparkles } from 'lucide-react';

// Gradient colors for bars (top features get more prominent color)
const BAR_COLORS = [
    '#6D28D9', // brand-primary
    '#7C3AED',
    '#8B5CF6',
    '#A78BFA',
    '#C4B5FD',
    '#DDD6FE',
    '#EDE9FE',
];

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-surface-default border border-border-default rounded-xl p-3 shadow-md text-sm">
                <p className="font-semibold text-text-primary mb-1">{data.feature}</p>
                <p className="text-text-secondary">
                    Importance: <span className="font-bold text-brand-700">{(data.importance * 100).toFixed(1)}%</span>
                </p>
            </div>
        );
    }
    return null;
};

// Main Component
const FeatureImportanceChart = ({ analysisData }) => {
    // Build feature importance data from analysis results or generate sensible defaults
    const chartData = useMemo(() => {
        // Try to use real feature importance from the analysis data
        const featureImportance = analysisData?.metrics?.feature_importance ||
            analysisData?.feature_importance ||
            analysisData?.insights?.feature_importance;

        if (featureImportance && typeof featureImportance === 'object') {
            const entries = Object.entries(featureImportance);
            const total = entries.reduce((sum, [, v]) => sum + Math.abs(v), 0) || 1;
            return entries
                .map(([feature, importance]) => ({
                    feature: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    importance: Math.abs(importance) / total,
                }))
                .sort((a, b) => b.importance - a.importance)
                .slice(0, 7);
        }

        // Fallback defaults (interpretable business features for Walmart sales)
        return [
            { feature: 'Day of Week', importance: 0.28 },
            { feature: 'Weekly Trend', importance: 0.22 },
            { feature: 'Holiday Proximity', importance: 0.16 },
            { feature: 'Month of Year', importance: 0.14 },
            { feature: 'Lag (7 days)', importance: 0.09 },
            { feature: 'Lag (14 days)', importance: 0.07 },
            { feature: 'Rolling Average', importance: 0.04 },
        ];
    }, [analysisData]);

    const isDefaultData = !analysisData?.metrics?.feature_importance;

    return (
        <div className="bg-surface-default rounded-2xl border border-border-default p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-text-primary">Feature Importance</h3>
                        <p className="text-xs text-text-muted mt-0.5">Top drivers of your demand forecast</p>
                    </div>
                </div>
                {isDefaultData && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted bg-bg-subtle px-2.5 py-1 rounded-full border border-border-default">
                        <Info className="w-3.5 h-3.5" />
                        Illustrative — run pipeline for live data
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                        <XAxis
                            type="number"
                            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 'auto']}
                        />
                        <YAxis
                            dataKey="feature"
                            type="category"
                            width={120}
                            tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F0FE' }} />
                        <Bar dataKey="importance" radius={[0, 6, 6, 0]} maxBarSize={22}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={BAR_COLORS[index] || BAR_COLORS[BAR_COLORS.length - 1]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend pills */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border-default"
            >
                {chartData.slice(0, 4).map((item, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: `${BAR_COLORS[i]}15`, color: BAR_COLORS[i] }}
                    >
                        <span className="w-2 h-2 rounded-full" style={{ background: BAR_COLORS[i] }} />
                        {item.feature}: {(item.importance * 100).toFixed(1)}%
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export default FeatureImportanceChart;
