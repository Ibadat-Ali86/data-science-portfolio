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
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-500" />
                                Map Your Data
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Tell us how to read your file: <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">{fileInfo?.name}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">

                        {/* Time Column Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                1. Which column contains the **Date/Time**?
                            </label>
                            <div className="relative">
                                <select
                                    value={mappings.date}
                                    onChange={(e) => setMappings(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                                >
                                    <option value="" disabled>Select Date Column...</option>
                                    {columns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Used to track trends over time.
                            </p>
                        </div>

                        {/* Target Column Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                2. Which column is the **Target Value** to forecast?
                            </label>
                            <div className="relative">
                                <select
                                    value={mappings.target}
                                    onChange={(e) => setMappings(prev => ({ ...prev, target: e.target.value }))}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                                >
                                    <option value="" disabled>Select Value Column...</option>
                                    {columns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                E.g. Sales, Demand, Price, Quantity.
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!mappings.date || !mappings.target}
                            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all ${mappings.date && mappings.target
                                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
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
