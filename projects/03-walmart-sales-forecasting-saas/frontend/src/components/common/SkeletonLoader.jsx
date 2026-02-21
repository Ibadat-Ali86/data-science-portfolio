import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton Loader Components
 * Based on PDF recommendations for loading states
 * Uses shimmer animation for visual feedback
 */

// Base skeleton with shimmer animation
export const Skeleton = ({ className = '', style = {} }) => (
    <div
        className={`skeleton ${className}`}
        style={style}
    />
);

// Text line skeleton
export const SkeletonText = ({ width = '100%', lines = 1, className = '' }) => (
    <div className={className}>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className="skeleton skeleton-text"
                style={{
                    width: i === lines - 1 && lines > 1 ? '80%' : width,
                    marginBottom: i < lines - 1 ? '0.5rem' : 0
                }}
            />
        ))}
    </div>
);

// Title skeleton
export const SkeletonTitle = ({ width = '60%', className = '' }) => (
    <div
        className={`skeleton skeleton-title ${className}`}
        style={{ width }}
    />
);

// KPI number skeleton with animated entrance
export const SkeletonKPI = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex flex-col gap-2 ${className}`}
    >
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
        <div className="skeleton skeleton-kpi" />
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </motion.div>
);

// Card skeleton
export const SkeletonCard = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 ${className}`}
    >
        <div className="skeleton skeleton-title" style={{ width: '50%' }} />
        <div className="skeleton skeleton-kpi mt-4" />
        <div className="flex gap-4 mt-6">
            <div className="skeleton" style={{ height: '8px', flex: 1 }} />
            <div className="skeleton" style={{ height: '8px', flex: 1 }} />
            <div className="skeleton" style={{ height: '8px', flex: 1 }} />
        </div>
    </motion.div>
);

// Chart skeleton with animated bars
export const SkeletonChart = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl p-6 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 ${className}`}
    >
        <div className="skeleton skeleton-title" style={{ width: '30%' }} />
        <div className="flex items-end gap-2 mt-6 h-48">
            {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50].map((height, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="skeleton flex-1 rounded-t-md"
                />
            ))}
        </div>
        <div className="flex justify-between mt-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="skeleton" style={{ width: '40px', height: '10px' }} />
            ))}
        </div>
    </motion.div>
);

// Table skeleton
export const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 ${className}`}
    >
        {/* Header */}
        <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600">
            {Array.from({ length: cols }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '12px', flex: 1 }} />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
                key={rowIndex}
                className="flex gap-4 p-4 border-b border-gray-100 dark:border-slate-700 last:border-b-0"
            >
                {Array.from({ length: cols }).map((_, colIndex) => (
                    <div
                        key={colIndex}
                        className="skeleton"
                        style={{
                            height: '10px',
                            flex: 1,
                            animationDelay: `${(rowIndex * cols + colIndex) * 0.05}s`
                        }}
                    />
                ))}
            </div>
        ))}
    </motion.div>
);

// KPI Grid skeleton (4 cards)
export const SkeletonKPIGrid = ({ count = 4, className = '' }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

// Full page skeleton
export const SkeletonPage = ({ className = '' }) => (
    <div className={`space-y-8 ${className}`}>
        <div className="flex justify-between items-center">
            <SkeletonTitle width="200px" />
            <div className="flex gap-3">
                <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
                <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
            </div>
        </div>
        <SkeletonKPIGrid count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
        </div>
        <SkeletonTable rows={5} cols={5} />
    </div>
);

export default {
    Skeleton,
    SkeletonText,
    SkeletonTitle,
    SkeletonKPI,
    SkeletonCard,
    SkeletonChart,
    SkeletonTable,
    SkeletonKPIGrid,
    SkeletonPage
};
