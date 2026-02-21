/**
 * AnimatedChartPreview Component
 * Live animated forecast chart for authentication pages visual side
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnimatedChartPreview = () => {
    // Sample forecast data
    const data = [
        { month: 'Jan', actual: 4000, forecast: null },
        { month: 'Feb', actual: 3000, forecast: null },
        { month: 'Mar', actual: 5000, forecast: null },
        { month: 'Apr', actual: 4500, forecast: null },
        { month: 'May', actual: 6000, forecast: null },
        { month: 'Jun', actual: null, forecast: 6200 },
        { month: 'Jul', actual: null, forecast: 6800 },
        { month: 'Aug', actual: null, forecast: 7200 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white/90">Live Forecast</span>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                    98.77% Accuracy
                </div>
            </div>

            {/* Chart */}
            <div className="h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="month"
                            stroke="rgba(255,255,255,0.5)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip
                            contentStyle={{
                                background: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#6366F1"
                            strokeWidth={2}
                            fill="url(#actualGradient)"
                        />

                        <Area
                            type="monotone"
                            dataKey="forecast"
                            stroke="#10B981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="url(#forecastGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-2xl font-mono font-bold text-white">$2.4M</div>
                    <div className="text-xs text-white/60">Forecasted Revenue</div>
                </div>
                <div>
                    <div className="text-2xl font-mono font-bold text-emerald-400">+12.5%</div>
                    <div className="text-xs text-white/60">Growth Trend</div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnimatedChartPreview;
