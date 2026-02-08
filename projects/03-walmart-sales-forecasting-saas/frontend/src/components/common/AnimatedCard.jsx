import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedCard Component
 * Based on PDF recommendations for card interactions
 * Features: Glassmorphism, hover effects, entrance animations
 */

const AnimatedCard = ({
    children,
    className = '',
    delay = 0,
    variant = 'default', // 'default', 'glass', 'gradient', 'outline'
    hover = true,
    glow = false,
    onClick = null
}) => {
    // Variant styles
    const variants = {
        default: `
      bg-white dark:bg-slate-800 
      border border-gray-200 dark:border-slate-700
      shadow-sm
    `,
        glass: `
      glass-panel
    `,
        gradient: `
      bg-gradient-to-br from-purple-500/10 to-cyan-500/10 
      dark:from-purple-500/20 dark:to-cyan-500/20
      border border-purple-200/50 dark:border-purple-500/30
    `,
        outline: `
      bg-transparent
      border-2 border-dashed border-gray-300 dark:border-slate-600
      hover:border-purple-400 dark:hover:border-purple-500
    `,
        success: `
      bg-emerald-50 dark:bg-emerald-900/20
      border border-emerald-200 dark:border-emerald-500/30
    `,
        warning: `
      bg-amber-50 dark:bg-amber-900/20
      border border-amber-200 dark:border-amber-500/30
    `,
        danger: `
      bg-red-50 dark:bg-red-900/20
      border border-red-200 dark:border-red-500/30
    `
    };

    // Animation variants for Framer Motion
    const cardAnimations = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                delay,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        hover: hover ? {
            y: -4,
            scale: 1.01,
            transition: {
                duration: 0.25,
                ease: [0.175, 0.885, 0.32, 1.275]
            }
        } : {}
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            whileHover={hover ? "hover" : undefined}
            variants={cardAnimations}
            onClick={onClick}
            className={`
        rounded-xl p-6 
        transition-shadow duration-300
        ${variants[variant] || variants.default}
        ${hover ? 'cursor-pointer' : ''}
        ${glow ? 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]' : 'hover:shadow-lg'}
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
};

// Specialized KPI Card with animated number
export const KPIAnimatedCard = ({
    title,
    value,
    change,
    changeType = 'neutral', // 'positive', 'negative', 'neutral'
    icon: Icon,
    delay = 0,
    sparklineData = [],
    className = ''
}) => {
    const changeColors = {
        positive: 'text-emerald-500',
        negative: 'text-red-500',
        neutral: 'text-gray-500 dark:text-slate-400'
    };

    const iconBgColors = {
        positive: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        negative: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        neutral: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    };

    return (
        <AnimatedCard delay={delay} className={className} glow>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-small text-gray-500 dark:text-slate-400 font-medium mb-1">
                        {title}
                    </p>
                    <motion.h3
                        className="text-kpi text-gray-900 dark:text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
                    >
                        {value}
                    </motion.h3>
                    {change && (
                        <motion.p
                            className={`text-small mt-2 flex items-center gap-1 ${changeColors[changeType]}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: delay + 0.3 }}
                        >
                            {changeType === 'positive' && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            )}
                            {changeType === 'negative' && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                            {change}
                        </motion.p>
                    )}
                </div>

                {Icon && (
                    <div className={`p-3 rounded-xl ${iconBgColors[changeType]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>

            {/* Sparkline */}
            {sparklineData.length > 0 && (
                <div className="mt-4 flex items-end gap-1 h-8">
                    {sparklineData.map((value, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${value}%` }}
                            transition={{ delay: delay + 0.4 + i * 0.03, duration: 0.3 }}
                            className={`flex-1 rounded-full ${changeType === 'positive' ? 'bg-emerald-200 dark:bg-emerald-500/30' :
                                    changeType === 'negative' ? 'bg-red-200 dark:bg-red-500/30' :
                                        'bg-purple-200 dark:bg-purple-500/30'
                                }`}
                        />
                    ))}
                </div>
            )}
        </AnimatedCard>
    );
};

// Action Card with CTA button
export const ActionCard = ({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    variant = 'default',
    delay = 0,
    className = ''
}) => (
    <AnimatedCard delay={delay} variant={variant} className={className}>
        <div className="flex items-start gap-4">
            {Icon && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white flex-shrink-0">
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <div className="flex-1">
                <h3 className="text-h3 text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-small text-gray-500 dark:text-slate-400 mb-4">{description}</p>
                {actionLabel && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onAction}
                        className="btn-ripple px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-small font-medium rounded-lg transition-colors"
                    >
                        {actionLabel}
                    </motion.button>
                )}
            </div>
        </div>
    </AnimatedCard>
);

// Feature Card for Landing page
export const FeatureCard = ({
    title,
    description,
    icon: Icon,
    delay = 0,
    className = ''
}) => (
    <AnimatedCard delay={delay} hover glow className={className}>
        <div className="flex flex-col items-center text-center">
            {Icon && (
                <motion.div
                    className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 dark:from-purple-500/20 dark:to-cyan-500/20 mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </motion.div>
            )}
            <h3 className="text-h3 text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-small text-gray-500 dark:text-slate-400">{description}</p>
        </div>
    </AnimatedCard>
);

export default AnimatedCard;
