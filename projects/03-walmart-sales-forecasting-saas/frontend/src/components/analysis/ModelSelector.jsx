/**
 * ModelSelector - Component for selecting ML model for training
 * Shows available models with descriptions and recommendations
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    TrendingUp,
    BarChart3,
    Layers,
    Check,
    Zap,
    Info
} from 'lucide-react';

const models = [
    {
        id: 'prophet',
        name: 'Prophet',
        description: 'Best for seasonal patterns and holidays',
        icon: TrendingUp,
        color: 'blue',
        strengths: ['Seasonal decomposition', 'Holiday effects', 'Missing data tolerance'],
        typicalAccuracy: '93-97%',
        trainingTime: 'Fast (~3s)',
        bestFor: 'Retail with clear weekly/yearly patterns'
    },
    {
        id: 'xgboost',
        name: 'XGBoost',
        description: 'Best for feature-rich datasets',
        icon: BarChart3,
        color: 'green',
        strengths: ['Non-linear patterns', 'Feature importance', 'High accuracy'],
        typicalAccuracy: '95-99%',
        trainingTime: 'Fast (~4s)',
        bestFor: 'Complex datasets with many variables'
    },
    {
        id: 'sarima',
        name: 'SARIMA',
        description: 'Statistical autoregressive modeling',
        icon: Brain,
        color: 'purple',
        strengths: ['Statistical rigor', 'Confidence intervals', 'Trend detection'],
        typicalAccuracy: '90-95%',
        trainingTime: 'Medium (~6s)',
        bestFor: 'Data with clear trends and patterns'
    },
    {
        id: 'ensemble',
        name: 'Ensemble',
        description: 'Combines all models for best accuracy',
        icon: Layers,
        color: 'amber',
        strengths: ['Combines all models', 'Weighted predictions', 'Most robust'],
        typicalAccuracy: '96-99%',
        trainingTime: 'Longer (~12s)',
        bestFor: 'Maximum accuracy requirements',
        recommended: true
    }
];

const ModelSelector = ({ selectedModel, onSelectModel, disabled = false }) => {
    const getColorClasses = (color, isSelected) => {
        const colorMap = {
            blue: {
                bg: isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-white dark:bg-gray-800',
                border: isSelected ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700',
                icon: 'text-blue-600 dark:text-blue-400',
                badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
            },
            green: {
                bg: isSelected ? 'bg-green-100 dark:bg-green-900/40' : 'bg-white dark:bg-gray-800',
                border: isSelected ? 'border-green-500' : 'border-gray-200 dark:border-gray-700',
                icon: 'text-green-600 dark:text-green-400',
                badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
            },
            purple: {
                bg: isSelected ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-white dark:bg-gray-800',
                border: isSelected ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700',
                icon: 'text-purple-600 dark:text-purple-400',
                badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
            },
            amber: {
                bg: isSelected ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-white dark:bg-gray-800',
                border: isSelected ? 'border-amber-500' : 'border-gray-200 dark:border-gray-700',
                icon: 'text-amber-600 dark:text-amber-400',
                badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
            }
        };
        return colorMap[color] || colorMap.blue;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Forecasting Model
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model) => {
                    const isSelected = selectedModel === model.id;
                    const colors = getColorClasses(model.color, isSelected);
                    const Icon = model.icon;

                    return (
                        <motion.button
                            key={model.id}
                            onClick={() => !disabled && onSelectModel(model.id)}
                            disabled={disabled}
                            whileHover={!disabled ? { scale: 1.02 } : {}}
                            whileTap={!disabled ? { scale: 0.98 } : {}}
                            className={`
                                relative p-4 rounded-xl border-2 text-left transition-all
                                ${colors.bg} ${colors.border}
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
                            `}
                        >
                            {/* Selected Check */}
                            {isSelected && (
                                <div className="absolute top-3 right-3">
                                    <div className={`p-1 rounded-full ${colors.icon} bg-white dark:bg-gray-800`}>
                                        <Check className="w-4 h-4" />
                                    </div>
                                </div>
                            )}

                            {/* Recommended Badge */}
                            {model.recommended && (
                                <div className="absolute -top-2 left-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                                        <Zap className="w-3 h-3" />
                                        Recommended
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${colors.icon} bg-white dark:bg-gray-900/50`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {model.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {model.description}
                                    </p>

                                    {/* Quick Stats */}
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className={`px-2 py-1 rounded ${colors.badge}`}>
                                            {model.typicalAccuracy} accuracy
                                        </span>
                                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                            {model.trainingTime}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details (when selected) */}
                            {isSelected && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                                >
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        <strong>Best for:</strong> {model.bestFor}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {model.strengths.map((strength, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                            >
                                                {strength}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 dark:text-blue-300">
                    <strong>Tip:</strong> The Ensemble model combines all algorithms for the most accurate predictions,
                    but takes longer to train. For quick results, try Prophet or XGBoost.
                </p>
            </div>
        </div>
    );
};

export default ModelSelector;
