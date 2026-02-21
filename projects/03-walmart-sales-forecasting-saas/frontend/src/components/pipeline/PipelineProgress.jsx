/**
 * PipelineProgress - Enterprise 6-stage pipeline progress tracker
 * Features: Educational tips, elapsed time, animated progress line, stage icons
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Circle, Loader2, Sparkles,
    Database, Brain, LineChart, FileSearch,
    Settings, Zap, ChevronRight, Clock, Shield
} from 'lucide-react';

const STAGES = [
    {
        id: 'upload',
        label: 'Data Upload',
        icon: FileSearch,
        description: 'Securely transferring your data',
        estimatedTime: '2–5 seconds',
        color: 'blue',
        tips: [
            'Your data is encrypted during transfer using TLS 1.3',
            'We never store your raw data longer than necessary',
            'Large files are chunked for reliable upload'
        ]
    },
    {
        id: 'validation',
        label: 'Validation',
        icon: Shield,
        description: 'Checking data quality and format',
        estimatedTime: '3–8 seconds',
        color: 'purple',
        tips: [
            'We run 10 enterprise-grade validation checks',
            'Date formats are automatically detected and normalized',
            'A data quality score (0–100) is calculated at this stage'
        ]
    },
    {
        id: 'profiling',
        label: 'Data Profiling',
        icon: Database,
        description: 'Analyzing patterns and statistics',
        estimatedTime: '5–10 seconds',
        color: 'cyan',
        tips: [
            'Statistical summaries are generated for every column',
            'Seasonality patterns (weekly, monthly, yearly) are detected',
            'Missing value patterns and outliers are mapped'
        ]
    },
    {
        id: 'preprocessing',
        label: 'Preprocessing',
        icon: Settings,
        description: 'Cleaning and transforming data',
        estimatedTime: '8–15 seconds',
        color: 'amber',
        tips: [
            'Missing values are intelligently imputed using median/mode',
            'Categorical variables are encoded for ML models',
            'Features are scaled for optimal model performance'
        ]
    },
    {
        id: 'training',
        label: 'Model Training',
        icon: Brain,
        description: 'Training Prophet, XGBoost & SARIMA',
        estimatedTime: '20–45 seconds',
        color: 'rose',
        tips: [
            'Prophet captures seasonality trends and holiday effects',
            'XGBoost learns complex non-linear feature interactions',
            'SARIMA models time-series autocorrelation patterns',
            'Ensemble combines all predictions for maximum accuracy'
        ]
    },
    {
        id: 'ensemble',
        label: 'Results & Insights',
        icon: LineChart,
        description: 'Generating final forecast',
        estimatedTime: '5–10 seconds',
        color: 'green',
        tips: [
            'Weighted ensemble optimizes prediction accuracy',
            'Confidence intervals are calculated at 95% level',
            'Business insights are generated in plain language'
        ]
    }
];

const COLOR_MAP = {
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
    amber: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    rose: { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400', glow: 'shadow-rose-500/30' },
    green: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', glow: 'shadow-green-500/30' },
};

const PipelineProgress = ({ currentStage = 'upload', stageProgress = 0, onComplete }) => {
    const [currentTip, setCurrentTip] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    const isComplete = currentStage === 'completed';
    const currentStageIndex = isComplete
        ? STAGES.length
        : STAGES.findIndex(s => s.id === currentStage);

    // Elapsed time counter
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Rotate tips every 8 seconds
    useEffect(() => {
        const stage = STAGES.find(s => s.id === currentStage);
        if (!stage) return;
        const tipTimer = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % stage.tips.length);
        }, 8000);
        return () => clearInterval(tipTimer);
    }, [currentStage]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
    };

    const lineProgress = isComplete
        ? 100
        : ((currentStageIndex + (stageProgress / 100)) / Math.max(STAGES.length - 1, 1)) * 100;

    return (
        <div className="w-full max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 rounded-full border border-brand-500/20 mb-4"
                >
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="text-sm text-brand-600 font-medium">AI-Powered Analysis</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {isComplete ? '🎉 Analysis Complete!' : 'Processing Your Data'}
                </h2>
                <div className="flex items-center justify-center gap-2 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                        {isComplete
                            ? 'Your forecast is ready!'
                            : `Elapsed: ${formatTime(elapsedTime)}`}
                    </span>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="relative">
                {/* Vertical progress line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border-primary">
                    <motion.div
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-brand-500 to-success-500"
                        initial={{ height: '0%' }}
                        animate={{ height: `${lineProgress}%` }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                </div>

                <div className="space-y-3">
                    {STAGES.map((stage, index) => {
                        const isActive = index === currentStageIndex && !isComplete;
                        const isPast = index < currentStageIndex || isComplete;
                        const isFuture = index > currentStageIndex && !isComplete;
                        const Icon = stage.icon;
                        const colors = COLOR_MAP[stage.color];

                        return (
                            <motion.div
                                key={stage.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className={`
                                    relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300
                                    ${isActive ? `bg-bg-secondary border border-${stage.color}-500/30 shadow-lg ${colors.glow}` : ''}
                                    ${isPast ? 'opacity-70' : ''}
                                    ${isFuture ? 'opacity-40' : ''}
                                `}
                            >
                                {/* Stage Icon */}
                                <div className={`
                                    relative z-10 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                                    ${isActive ? `${colors.bg} border-2 ${colors.border} shadow-md` : ''}
                                    ${isPast ? 'bg-success-100 border-2 border-success-500' : ''}
                                    ${isFuture ? 'bg-bg-tertiary border-2 border-border-primary' : ''}
                                `}>
                                    {isActive ? (
                                        <Loader2 className={`w-8 h-8 ${colors.text} animate-spin`} />
                                    ) : isPast ? (
                                        <CheckCircle2 className="w-8 h-8 text-success-600" />
                                    ) : (
                                        <Icon className="w-8 h-8 text-text-tertiary" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold ${isActive ? 'text-text-primary' : isPast ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                                            {stage.label}
                                        </h3>
                                        {isActive && (
                                            <span className={`text-xs font-bold ${colors.text}`}>
                                                {stageProgress}%
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-text-secondary mb-2">
                                        {stage.description}
                                    </p>

                                    {/* Active stage details */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-3"
                                        >
                                            {/* Progress bar */}
                                            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full bg-gradient-to-r from-brand-500 to-${stage.color}-500`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stageProgress}%` }}
                                                    transition={{ duration: 0.4 }}
                                                />
                                            </div>

                                            {/* Educational tip */}
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={currentTip}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`flex items-start gap-2 p-3 ${colors.bg} rounded-lg border border-${stage.color}-500/20`}
                                                >
                                                    <Zap className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                                                    <p className={`text-sm ${colors.text}`}>
                                                        {STAGES.find(s => s.id === currentStage)?.tips[currentTip]}
                                                    </p>
                                                </motion.div>
                                            </AnimatePresence>

                                            <p className="text-xs text-text-tertiary flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Estimated: {stage.estimatedTime}
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Completion badge */}
                                    {isPast && !isComplete && (
                                        <span className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Completion CTA */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="mt-8 text-center"
                    >
                        <div className="inline-flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-success-600" />
                            </div>
                            <p className="text-text-secondary text-sm">
                                Completed in {formatTime(elapsedTime)}
                            </p>
                            <button
                                onClick={onComplete}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                            >
                                View Results
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PipelineProgress;
