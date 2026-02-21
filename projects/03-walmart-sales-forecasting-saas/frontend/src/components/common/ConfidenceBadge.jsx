"""
Confidence Badge Component
Reusable component for displaying confidence scores throughout the app
"""

import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Info,
    HelpCircle
} from 'lucide-react';

/**
 * Universal confidence badge component
 * Used for domain detection, column mapping, KPI calculations, etc.
 */
const ConfidenceBadge = ({
    confidence,  // 0-100
    size = 'md',  // 'sm', 'md', 'lg'
    showLabel = true,
    showPercentage = true,
    tooltip = null,
    className = ''
}) => {
    // Determine confidence level
    let level, color, bgColor, borderColor, Icon;

    if (confidence >= 90) {
        level = 'Excellent';
        color = 'text-success-700';
        bgColor = 'bg-success-50';
        borderColor = 'border-success-200';
        Icon = CheckCircle;
    } else if (confidence >= 75) {
        level = 'Good';
        color = 'text-success-600';
        bgColor = 'bg-success-50';
        borderColor = 'border-success-200';
        Icon = CheckCircle;
    } else if (confidence >= 60) {
        level = 'Fair';
        color = 'text-warning-600';
        bgColor = 'bg-warning-50';
        borderColor = 'border-warning-200';
        Icon = AlertTriangle;
    } else if (confidence >= 40) {
        level = 'Low';
        color = 'text-warning-700';
        bgColor = 'bg-warning-50';
        borderColor = 'border-warning-300';
        Icon = AlertCircle;
    } else {
        level = 'Very Low';
        color = 'text-error-600';
        bgColor = 'bg-error-50';
        borderColor = 'border-error-200';
        Icon = AlertCircle;
    }

    // Size variants
    const sizeClasses = {
        sm: {
            container: 'px-2 py-1 text-xs gap-1',
            icon: 'w-3 h-3',
            dot: 'w-1 h-1'
        },
        md: {
            container: 'px-3 py-1.5 text-sm gap-2',
            icon: 'w-4 h-4',
            dot: 'w-1.5 h-1.5'
        },
        lg: {
            container: 'px-4 py-2 text-base gap-2',
            icon: 'w-5 h-5',
            dot: 'w-2 h-2'
        }
    };

    const sizes = sizeClasses[size] || sizeClasses.md;

    const badge = (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center ${sizes.container} rounded-full border font-semibold transition-all ${bgColor} ${borderColor} ${color} ${className}`}
        >
            <Icon className={sizes.icon} />

            {showPercentage && (
                <span className="font-bold">
                    {Math.round(confidence)}%
                </span>
            )}

            {showLabel && (
                <>
                    <div className={`rounded-full bg-current ${sizes.dot}`}></div>
                    <span>{level}</span>
                </>
            )}

            {tooltip && (
                <HelpCircle className={`${sizes.icon} opacity-60`} />
            )}
        </motion.div>
    );

    // Wrap with tooltip if provided
    if (tooltip) {
        return (
            <div className="relative group inline-block">
                {badge}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                </div>
            </div>
        );
    }

    return badge;
};

/**
 * Compact inline confidence indicator
 * For use in tables, lists, etc.
 */
export const ConfidenceIndicator = ({ confidence }) => {
    let color;
    if (confidence >= 75) color = 'bg-success-500';
    else if (confidence >= 60) color = 'bg-warning-500';
    else color = 'bg-error-500';

    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => {
                    const threshold = (i + 1) * 20;
                    return (
                        <div
                            key={i}
                            className={`w-1 h-4 rounded-sm ${confidence >= threshold ? color : 'bg-slate-200'
                                }`}
                        />
                    );
                })}
            </div>
            <span className="text-xs font-semibold text-slate-600">
                {Math.round(confidence)}%
            </span>
        </div>
    );
};

/**
 * Large confidence display for key metrics
 */
export const ConfidenceScore = ({
    confidence,
    label,
    description,
    size = 'lg'
}) => {
    let color, bgColor;

    if (confidence >= 75) {
        color = 'text-success-600';
        bgColor = 'bg-success-50';
    } else if (confidence >= 60) {
        color = 'text-warning-600';
        bgColor = 'bg-warning-50';
    } else {
        color = 'text-error-600';
        bgColor = 'bg-error-50';
    }

    const sizeClass = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-2xl';

    return (
        <div className={`p-6 rounded-xl ${bgColor} border border-current/20`}>
            <div className={`${sizeClass} font-bold ${color} mb-2`}>
                {Math.round(confidence)}%
            </div>
            {label && (
                <div className="text-sm font-semibold text-slate-700 mb-1">
                    {label}
                </div>
            )}
            {description && (
                <div className="text-xs text-slate-600">
                    {description}
                </div>
            )}
        </div>
    );
};

export default ConfidenceBadge;
