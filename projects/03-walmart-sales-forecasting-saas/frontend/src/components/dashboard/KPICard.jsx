import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import Card from '../ui/Card';

// Helper component for animated numbers
const AnimatedNumber = ({ valueStr }) => {
    const [displayValue, setDisplayValue] = useState(valueStr);

    useEffect(() => {
        // If the value isn't a number-like string, just display it immediately
        if (typeof valueStr !== 'string' || !/\d/.test(valueStr)) {
            setDisplayValue(valueStr);
            return;
        }

        // Extract numbers and non-numbers
        const numericMatch = valueStr.match(/[\d.,]+/);
        if (!numericMatch) {
            setDisplayValue(valueStr);
            return;
        }

        const numStr = numericMatch[0].replace(/,/g, '');
        const target = parseFloat(numStr);

        if (isNaN(target)) {
            setDisplayValue(valueStr);
            return;
        }

        const prefix = valueStr.substring(0, numericMatch.index);
        const suffix = valueStr.substring(numericMatch.index + numericMatch[0].length);
        const hasDecimals = numStr.includes('.');

        let startTimestamp = null;
        const duration = 1200; // 1.2s countup

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentVal = target * easeProgress;

            let formattedNum = hasDecimals
                ? currentVal.toFixed(2)
                : Math.floor(currentVal).toLocaleString();

            setDisplayValue(`${prefix}${formattedNum}${suffix}`);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Formatting original with commas if it didn't have decimals but was large
                const finalFormatted = hasDecimals
                    ? target.toFixed(2)
                    : target.toLocaleString();
                setDisplayValue(`${prefix}${finalFormatted}${suffix}`);
            }
        };

        window.requestAnimationFrame(step);
    }, [valueStr]);

    return <span>{displayValue}</span>;
};

// SVG Visualizations
const ProgressRing = ({ percentage = 85, color }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg width="48" height="48" className="transform -rotate-90">
            <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-100 dark:text-gray-800" />
            <motion.circle
                cx="24" cy="24" r={radius}
                stroke="currentColor" strokeWidth="4" fill="none"
                className={color}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
            />
        </svg>
    );
};

const SparklineBar = () => {
    // 7-day mini histogram placeholder
    const heights = [40, 60, 45, 80, 50, 90, 75];
    return (
        <div className="flex items-end gap-1 h-12">
            {heights.map((h, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className="w-1.5 bg-brand-500 rounded-t-sm opacity-80"
                />
            ))}
        </div>
    );
};

const RiskGauge = ({ level }) => {
    // level: 'Low', 'Medium', 'High'
    const rotation = level === 'Low' ? -45 : level === 'Medium' ? 0 : 45;
    const colorClass = level === 'Low' ? 'text-green-500' : level === 'Medium' ? 'text-amber-500' : 'text-red-500';

    return (
        <div className="relative w-12 h-6 overflow-hidden flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-100 absolute top-0" />
            <div className={`w-12 h-12 rounded-full border-4 ${colorClass} absolute top-0 border-b-transparent border-r-transparent transform -rotate-45`} />
            <motion.div
                className="absolute bottom-0 w-1 h-6 bg-gray-800 origin-bottom rounded-full"
                initial={{ rotate: -90 }}
                animate={{ rotate: rotation }}
                transition={{ duration: 1.2, type: "spring", stiffness: 50 }}
            />
        </div>
    );
};


import { SkeletonTitle, SkeletonText } from '../common/SkeletonLoader';

const KPICard = ({ title, value, change, trend, icon: Icon, color = 'primary', visualizationType, index = 0, isLoading = false }) => {
    const isPositive = trend === 'up';
    const isNeutral = trend === 'neutral';

    const colorMap = {
        primary: 'text-brand-600 bg-brand-50',
        success: 'text-emerald-600 bg-emerald-50',
        warning: 'text-amber-600 bg-amber-50',
        danger: 'text-red-600 bg-red-50',
        info: 'text-blue-600 bg-blue-50',
        purple: 'text-purple-600 bg-purple-50'
    };

    const iconStyle = colorMap[color] || colorMap.primary;

    // Determine what visualization to show based on title heuristics if visualizationType isn't explicitly passed
    let Visual = null;
    if (visualizationType === 'ring' || title.toLowerCase().includes('accuracy')) {
        // Parse percentage
        const pct = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : 0;
        const ringColor = pct > 80 ? 'text-emerald-500' : pct > 60 ? 'text-amber-500' : 'text-red-500';
        Visual = <ProgressRing percentage={pct} color={ringColor} />;
    } else if (visualizationType === 'sparkline' || title.toLowerCase().includes('products')) {
        Visual = <SparklineBar />;
    } else if (visualizationType === 'gauge' || title.toLowerCase().includes('risk')) {
        const rLevel = (typeof value === 'string' && value.includes('High')) ? 'High' :
            (typeof value === 'string' && value.includes('Medium')) ? 'Medium' : 'Low';
        Visual = <RiskGauge level={rLevel} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", delay: index * 0.1 }}
            style={{ perspective: 1000 }}
            whileHover={{
                rotateX: 2,
                rotateY: -2,
                z: 10,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1)'
            }}
            className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden group"
        >
            {isLoading ? (
                <>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0 animate-pulse" />
                    </div>
                    <div className="relative z-10 space-y-3">
                        <SkeletonTitle width="50%" />
                        <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse mt-2" />
                        <SkeletonText width="30%" lines={1} className="mt-2" />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${iconStyle}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Right side visualization or standard change pill */}
                        {Visual ? (
                            <div className="flex-shrink-0">
                                {Visual}
                            </div>
                        ) : change && (
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : isNeutral
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-red-50 text-red-700'
                                }`}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{change}</span>
                            </div>
                        )}
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
                        <p className="font-mono text-3xl font-bold text-gray-900 tracking-tight">
                            <AnimatedNumber valueStr={value} />
                        </p>
                        {Visual && change && (
                            <p className="text-xs text-gray-500 mt-2 font-medium">{change}</p>
                        )}
                    </div>

                    {/* Subtle glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </>
            )}
        </motion.div>
    );
};

export default KPICard;
