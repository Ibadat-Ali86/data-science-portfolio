/**
 * ProgressBar Component - Enterprise Design System
 * Progress indicator with shimmer effect
 */

import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({
    value = 0,
    max = 100,
    variant = 'primary',
    size = 'md',
    showLabel = false,
    className = ''
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
        primary: 'bg-brand-600',
        success: 'bg-emerald-600',
        warning: 'bg-amber-500',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-secondary">Progress</span>
                    <span className="text-sm font-semibold text-text-primary">{percentage.toFixed(0)}%</span>
                </div>
            )}

            <div className={`w-full bg-bg-tertiary rounded-full overflow-hidden ${sizes[size]}`}>
                <motion.div
                    className={`${variants[variant]} ${sizes[size]} rounded-full relative overflow-hidden`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
            </div>
        </div>
    );
};

export default ProgressBar;
