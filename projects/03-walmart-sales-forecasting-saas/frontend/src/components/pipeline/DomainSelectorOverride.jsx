import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    BrainCircuit,
    CheckCircle,
    Info,
    X
} from 'lucide-react';

/**
 * Domain Selector Override Component
 * Allows users to manually override auto-detected domain
 */
const DomainSelectorOverride = ({
    currentDomain,
    domainScores,  // {domain_id: confidence_score}
    onDomainChange,
    onClose
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState(currentDomain);

    // Domain definitions with descriptions
    const domains = {
        'sales_forecast': {
            name: 'Sales Forecasting',
            description: 'Demand forecasting, revenue prediction, inventory optimization',
            icon: '📈',
            expectedColumns: ['date', 'quantity/sales', 'product (optional)']
        },
        'hr_analytics': {
            name: 'HR Analytics',
            description: 'Workforce planning, turnover analysis, talent management',
            icon: '👥',
            expectedColumns: ['employee ID', 'hire_date', 'department (optional)']
        },
        'financial_metrics': {
            name: 'Financial Metrics',
            description: 'Cash flow, budget variance, financial KPIs',
            icon: '💰',
            expectedColumns: ['date', 'amount', 'category (optional)']
        },
        'inventory_management': {
            name: 'Inventory Management',
            description: 'Stock levels, supply chain, reorder optimization',
            icon: '📦',
            expectedColumns: ['date', 'quantity', 'product', 'warehouse (optional)']
        },
        'marketing_analytics': {
            name: 'Marketing Analytics',
            description: 'Campaign performance, CAC, ROAS, conversion metrics',
            icon: '📊',
            expectedColumns: ['date', 'impressions/clicks', 'spend (optional)']
        },
        'generic': {
            name: 'Generic Time Series',
            description: 'General-purpose trend analysis and forecasting',
            icon: '🔍',
            expectedColumns: ['date', 'metric/value']
        }
    };

    const handleConfirm = () => {
        if (selectedDomain !== currentDomain) {
            onDomainChange(selectedDomain);
        }
        setIsOpen(false);
    };

    const getConfidenceColor = (score) => {
        if (score >= 80) return 'text-success-600 bg-success-50 border-success-200';
        if (score >= 60) return 'text-warning-600 bg-warning-50 border-warning-200';
        return 'text-slate-500 bg-slate-50 border-slate-200';
    };

    const getConfidenceLabel = (score) => {
        if (score >= 80) return 'High';
        if (score >= 60) return 'Medium';
        return 'Low';
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all group"
            >
                <BrainCircuit className="w-5 h-5 text-primary-600 group-hover:rotate-12 transition-transform" />
                <div className="text-left">
                    <div className="text-xs text-slate-500 font-medium">Domain</div>
                    <div className="text-sm font-bold text-slate-800">
                        {domains[currentDomain]?.name || currentDomain}
                    </div>
                </div>
                <Info className="w-4 h-4 text-slate-400" />
            </button>

            {/* Modal */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <BrainCircuit className="w-6 h-6 text-primary-600" />
                                        Select Analysis Domain
                                    </h2>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Override auto-detection if needed
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Domain Options */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="space-y-3">
                                {Object.entries(domains).map(([domainId, domain]) => {
                                    const score = domainScores[domainId] || 0;
                                    const isSelected = selectedDomain === domainId;
                                    const isCurrent = currentDomain === domainId;
                                    const confidenceColor = getConfidenceColor(score);

                                    return (
                                        <motion.button
                                            key={domainId}
                                            onClick={() => setSelectedDomain(domainId)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full p-5 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                                                    : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className="text-3xl shrink-0">
                                                    {domain.icon}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-slate-800">
                                                            {domain.name}
                                                        </h3>
                                                        {isCurrent && (
                                                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-3">
                                                        {domain.description}
                                                    </p>

                                                    {/* Expected Columns */}
                                                    <div className="mb-3">
                                                        <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                                            Expected Columns:
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {domain.expectedColumns.map((col, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded"
                                                                >
                                                                    {col}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Confidence Badge */}
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${confidenceColor}`}>
                                                        <div className="text-xs font-semibold">
                                                            Match: {Math.round(score)}%
                                                        </div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                        <div className="text-xs font-medium">
                                                            {getConfidenceLabel(score)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Selection Indicator */}
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="shrink-0"
                                                    >
                                                        <CheckCircle className="w-6 h-6 text-primary-600" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div className="text-sm text-slate-600">
                                <span className="font-medium">Selected:</span>{' '}
                                {domains[selectedDomain]?.name}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={selectedDomain === currentDomain}
                                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Domain
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default DomainSelectorOverride;
