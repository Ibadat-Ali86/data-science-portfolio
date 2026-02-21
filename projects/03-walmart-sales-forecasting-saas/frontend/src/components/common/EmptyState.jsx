import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { DatabaseZap, AlertCircle, RefreshCw, Layers, Sparkles } from 'lucide-react';

const emptyStateConfig = {
    'no-data': {
        icon: DatabaseZap,
        color: 'text-brand-500',
        bg: 'bg-brand-50',
        title: 'No Data Uploaded',
        description: 'Upload your historical sales data to start forecasting.',
        actionLabel: 'Upload CSV',
        actionPath: '/upload'
    },
    'no-forecasts': {
        icon: Layers,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        title: 'Ready for Analysis',
        description: 'Your data is uploaded. Run the AI pipeline to analyze and forecast.',
        actionLabel: 'Run Pipeline',
        actionPath: '/analysis'
    },
    'error': {
        icon: AlertCircle,
        color: 'text-danger-500',
        bg: 'bg-danger-50',
        title: 'Data Processing Error',
        description: 'We encountered an issue processing your dataset. Please check the format.',
        actionLabel: 'Try Again',
        actionType: 'retry'
    },
    'loading': {
        icon: RefreshCw,
        color: 'text-info-500',
        bg: 'bg-info-50',
        title: 'Processing Request',
        description: 'Our AI is currently crunching the numbers. This may take a moment.',
        spin: true
    }
};

const EmptyState = ({
    type = 'no-data',
    title,
    description,
    action,
    onAction,
    proTip
}) => {
    const config = emptyStateConfig[type] || emptyStateConfig['no-data'];
    const Icon = config.icon;
    const currentTitle = title || config.title;
    const currentDesc = description || config.description;

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full w-full">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/50 relative overflow-hidden ${config.bg} ${config.color}`}>
                    <Icon className={`w-10 h-10 relative z-10 ${config.spin ? 'animate-spin' : ''}`} />
                    {/* Subtle pulse animation behind icon */}
                    <div className="absolute inset-0 bg-current opacity-10 animate-ping" style={{ animationDuration: '3s' }} />
                </div>
            </motion.div>

            <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-gray-900 mb-2"
            >
                {currentTitle}
            </motion.h3>

            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 max-w-sm mx-auto mb-8"
            >
                {currentDesc}
            </motion.p>

            {(config.actionLabel || action) && onAction && (
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button onClick={onAction}>
                        {action || config.actionLabel}
                    </Button>
                </motion.div>
            )}

            {/* Pro Tip Section */}
            {proTip && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 max-w-md w-full bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl p-4 border border-indigo-100/50 text-left relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                    <div className="flex items-start gap-3 relative z-10">
                        <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">Pro Tip</span>
                            <p className="text-sm text-indigo-900/80 leading-relaxed">{proTip}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default EmptyState;
