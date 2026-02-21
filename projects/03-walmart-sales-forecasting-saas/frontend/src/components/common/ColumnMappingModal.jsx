import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, AlertCircle, RefreshCw, Database } from 'lucide-react';

const ColumnMappingModal = ({ isOpen, onClose, columns, onConfirm, fileInfo }) => {
    const [mappings, setMappings] = useState({
        date: '',
        target: ''
    });
    const [previewData, setPreviewData] = useState(null);

    // Auto-detect columns on open
    useEffect(() => {
        if (isOpen && columns.length > 0) {
            const lowerCols = columns.map(c => c.toLowerCase());

            // Try to find date
            const dateHigh = columns.find(c => ['date', 'timestamp', 'time', 'datetime', 'created_at', 'updated_at'].includes(c.toLowerCase()));
            const dateMed = columns.find(c => {
                const l = c.toLowerCase();
                return l.includes('date') || l.includes('time') || l.includes('year') || l.includes('period');
            });

            // Try to find target (sales, demand, quantity, price, value)
            const targetKeywords = ['sales', 'demand', 'quantity', 'value', 'revenue', 'close_price', 'close', 'price', 'amount', 'total', 'count', 'adj close', 'volume', 'return', 'forecast_target'];
            const targetHigh = columns.find(c => targetKeywords.includes(c.toLowerCase()));

            const targetMed = columns.find(c => {
                const l = c.toLowerCase();
                return l.includes('sales') || l.includes('demand') || l.includes('price') || l.includes('amount') || l.includes('metric') || l.includes('target') || l.includes('value');
            });

            setMappings({
                date: dateHigh || dateMed || '',
                target: targetHigh || targetMed || ''
            });
        }
    }, [isOpen, columns]);

    const handleSubmit = () => {
        if (mappings.date && mappings.target) {
            onConfirm(mappings);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-bg-secondary rounded-xl shadow-2xl max-w-lg w-full border border-border-primary overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border-primary flex justify-between items-center bg-bg-tertiary">
                        <div>
                            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                <Database className="w-5 h-5 text-brand-500" />
                                Map Your Data
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">
                                Tell us how to read your file: <span className="font-mono text-xs bg-bg-primary border border-border-primary px-1.5 py-0.5 rounded text-text-primary">{fileInfo?.name}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-tertiary hover:text-text-primary"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">

                        {/* Time Column Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-primary">
                                1. Which column contains the **Date/Time**?
                            </label>
                            <div className="relative">
                                <select
                                    value={mappings.date}
                                    onChange={(e) => setMappings(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full p-3 bg-bg-tertiary border border-border-primary rounded-lg appearance-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono text-sm text-text-primary"
                                >
                                    <option value="" disabled>Select Date Column...</option>
                                    {columns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                            <p className="text-xs text-text-tertiary flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Used to track trends over time.
                            </p>
                        </div>

                        {/* Target Column Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-primary">
                                2. Which column is the **Target Value** to forecast?
                            </label>
                            <div className="relative">
                                <select
                                    value={mappings.target}
                                    onChange={(e) => setMappings(prev => ({ ...prev, target: e.target.value }))}
                                    className="w-full p-3 bg-bg-tertiary border border-border-primary rounded-lg appearance-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all font-mono text-sm text-text-primary"
                                >
                                    <option value="" disabled>Select Value Column...</option>
                                    {columns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                            <p className="text-xs text-text-tertiary flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                E.g. Sales, Demand, Price, Quantity.
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border-primary bg-bg-tertiary flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-text-secondary hover:bg-bg-secondary rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!mappings.date || !mappings.target}
                            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all ${mappings.date && mappings.target
                                ? 'bg-brand-600 hover:bg-brand-700 text-white hover:scale-105'
                                : 'bg-bg-secondary border border-border-primary text-text-disabled cursor-not-allowed'
                                }`}
                        >
                            <Check className="w-4 h-4" />
                            Confirm Mapping
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ColumnMappingModal;
