import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ArrowRight, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';
import { useNavigate } from 'react-router-dom';

function PredictiveActionHub() {
    const [suggestions, setSuggestions] = useState([]);
    const { currentPhase, datasetStats } = useFlow();
    const navigate = useNavigate();

    useEffect(() => {
        // Mocking an AI generation function
        const generateSuggestions = () => {
            const actions = [];

            // Pattern 1: Data upload detected, suggest analysis
            if (currentPhase === 'upload' && datasetStats) {
                actions.push({
                    id: 'analyze-now',
                    priority: 'high',
                    icon: <BrainCircuit className="w-5 h-5 text-brand-600" />,
                    title: 'Run Analysis on New Data',
                    description: `${datasetStats.rows || 'Various'} rows ready for forecasting`,
                    action: () => navigate('/analysis'),
                    confidence: 0.94,
                    timeEstimate: '3 min'
                });
            }

            // Pattern 2: Always suggest scenarios if they're exploring forecasts but haven't used scenarios
            if (currentPhase === 'forecast') {
                actions.push({
                    id: 'explore-scenarios',
                    priority: 'medium',
                    icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
                    title: 'Explore What-If Scenarios',
                    description: 'Model accuracy is excellent for simulation',
                    action: () => navigate('/scenario-simulator'),
                    confidence: 0.87
                });
            }

            // Pattern 3: Weekend approaching placeholder (Simulating the Friday condition)
            const today = new Date();
            if (today.getDay() === 5 || true) { // Always true for demonstration
                actions.push({
                    id: 'weekend-alert',
                    priority: 'alert',
                    icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
                    title: 'Weekend Surge Expected',
                    description: 'Historical data shows 28% higher weekend demand',
                    action: () => navigate('/reports'),
                    trend: '+28%',
                    confidence: 0.82
                });
            }

            return actions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
        };

        setSuggestions(generateSuggestions());
    }, [currentPhase, datasetStats, navigate]);

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-transparent">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-brand-600" />
                    <span className="font-semibold text-gray-900 tracking-tight">Next Best Actions</span>
                </div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Suggested
                </span>
            </div>
            <div className="divide-y divide-gray-50">
                <AnimatePresence>
                    {suggestions.map((suggestion, index) => (
                        <motion.div
                            key={suggestion.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                            className="p-4 hover:bg-gray-50 cursor-pointer group transition-colors"
                            onClick={suggestion.action}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                    {suggestion.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                                            {suggestion.title}
                                        </h4>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 mb-2 truncate">
                                        {suggestion.description}
                                    </p>

                                    {suggestion.confidence && (
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden w-24 max-w-full">
                                                <div
                                                    className={`h-full rounded-full ${suggestion.priority === 'high' ? 'bg-brand-500' : 'bg-emerald-500'}`}
                                                    style={{ width: (suggestion.confidence * 100) + '%' }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">
                                                {Math.round(suggestion.confidence * 100)}% Match
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default PredictiveActionHub;
