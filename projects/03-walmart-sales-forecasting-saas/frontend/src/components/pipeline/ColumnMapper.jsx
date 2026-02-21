
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Check,
    AlertTriangle,
    ArrowRight,
    HelpCircle,
    RotateCcw
} from 'lucide-react';

const REQUIRED_COLUMNS = [
    { key: 'date', label: 'Date / Timestamp', description: 'Transaction date' },
    { key: 'target', label: 'Target Value (Sales)', description: 'Value to forecast' },
    { key: 'item', label: 'Item / Product ID', description: 'Unique identifier' },
    { key: 'location', label: 'Location / Store', description: 'Store or Region' }
];

const ColumnMapper = ({
    sourceColumns,
    suggestedMapping,
    onConfirm,
    onCancel,
    isLoading
}) => {
    const [mapping, setMapping] = useState({});

    useEffect(() => {
        // Initialize with suggestions
        if (suggestedMapping && suggestedMapping.mapping) {
            const initial = {};
            // Extract just the source column source_column from the suggestion object
            Object.keys(suggestedMapping.mapping).forEach(key => {
                initial[key] = suggestedMapping.mapping[key].source_column;
            });
            setMapping(initial);
        }
    }, [suggestedMapping]);

    const handleChange = (targetKey, sourceCol) => {
        setMapping(prev => ({
            ...prev,
            [targetKey]: sourceCol
        }));
    };

    const getConfidenceColor = (targetKey) => {
        const suggestion = suggestedMapping?.mapping?.[targetKey];
        if (!suggestion || !suggestion.source_column) return 'text-gray-400';
        // If current selection matches suggestion
        if (mapping[targetKey] === suggestion.source_column) {
            if (suggestion.confidence >= 90) return 'text-green-500';
            if (suggestion.confidence >= 60) return 'text-yellow-500';
            return 'text-orange-500';
        }
        return 'text-blue-400'; // User manual selection
    };

    const getConfidenceScore = (targetKey) => {
        const suggestion = suggestedMapping?.mapping?.[targetKey];
        if (mapping[targetKey] === suggestion?.source_column) {
            return suggestion.confidence;
        }
        return null;
    };

    const isReady = mapping['date'] && mapping['target']; // Minimal requirements

    return (
        <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary max-w-4xl w-full mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-display font-bold text-text-primary">
                        Verify Column Mapping
                    </h3>
                    <p className="text-sm text-text-secondary">
                        Please confirm how your data columns match our required fields.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold bg-blue-50/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                        {suggestedMapping?.confidence_score || 0}% Match Confidence
                    </span>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {REQUIRED_COLUMNS.map((col) => (
                    <div
                        key={col.key}
                        className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg border border-border-primary"
                    >
                        {/* Target Field Info */}
                        <div className="w-1/3">
                            <div className="flex items-center gap-2 font-semibold text-text-primary">
                                {col.label}
                                {(col.key === 'date' || col.key === 'target') && (
                                    <span className="text-red-500">*</span>
                                )}
                            </div>
                            <div className="text-xs text-text-tertiary">{col.description}</div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-text-tertiary" />

                        {/* Source Column Selection */}
                        <div className="w-1/2 relative">
                            <select
                                value={mapping[col.key] || ''}
                                onChange={(e) => handleChange(col.key, e.target.value)}
                                className={`w-full p-2.5 rounded-lg bg-bg-secondary border font-mono text-sm focus:outline-none focus:border-accent-blue
                                    ${!mapping[col.key] ? 'border-border-primary text-text-tertiary' : 'border-border-secondary text-text-primary'}
                                `}
                            >
                                <option value="">Select Column...</option>
                                {sourceColumns.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* Status Indicator */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                {mapping[col.key] ? (
                                    <Check className={`w-4 h-4 ${getConfidenceColor(col.key)}`} />
                                ) : (col.key === 'date' || col.key === 'target') ? (
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(mapping)}
                    disabled={!isReady || isLoading}
                    className={`btn-primary flex items-center gap-2 ${(!isReady || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Processing...' : 'Confirm Mapping'}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {!isReady && (
                <p className="text-xs text-red-500 text-right mt-2">
                    * Date and Target columns are required.
                </p>
            )}
        </div>
    );
};

export default ColumnMapper;
