/**
 * DataFormatConverter Component
 * 
 * Interactive multi-step wizard for:
 * 1. Upload dataset (any format)
 * 2. Auto-detect format and columns
 * 3. Confirm/adjust column mappings
 * 4. Convert to standard format
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    X,
    FileText,
    Loader
} from 'lucide-react';

const DataFormatConverter = ({ onConversionComplete, onCancel }) => {
    const [step, setStep] = useState('upload'); // upload | detect | map | convert | complete
    const [file, setFile] = useState(null);
    const [formatInfo, setFormatInfo] = useState(null);
    const [columnMapping, setColumnMapping] = useState({});
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (selectedFile) => {
        if (!selectedFile) return;

        setFile(selectedFile);
        setError(null);
        setStep('detect');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:8000/api/data-pipeline/detect-format', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Format detection failed');
            }

            const data = await response.json();
            setFormatInfo(data);
            setColumnMapping(data.suggested_mapping.mapping);
            setStep('map');
        } catch (err) {
            console.error('Format detection failed:', err);
            setError('Failed to detect file format. Please check the file and try again.');
            setStep('upload');
        }
    };

    const handleConversion = async () => {
        setConverting(true);
        setStep('convert');
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/data-pipeline/convert-format', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_path: formatInfo.file_path,
                    mapping: { mapping: columnMapping },
                    encoding: formatInfo.encoding,
                    separator: formatInfo.separator
                })
            });

            if (!response.ok) {
                throw new Error('Conversion failed');
            }

            const result = await response.json();

            if (result.success) {
                setStep('complete');
                setTimeout(() => {
                    onConversionComplete(result);
                }, 1500);
            } else {
                throw new Error(result.message || 'Validation failed');
            }
        } catch (err) {
            console.error('Conversion failed:', err);
            setError(err.message);
            setStep('map');
        } finally {
            setConverting(false);
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return 'text-success-600';
        if (confidence >= 70) return 'text-warning-600';
        return 'text-error-600';
    };

    const getConfidenceIcon = (confidence) => {
        if (confidence >= 90) return <CheckCircle className="w-5 h-5 text-success-500" />;
        if (confidence >= 70) return <AlertTriangle className="w-5 h-5 text-warning-500" />;
        return <AlertTriangle className="w-5 h-5 text-error-500" />;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {['upload', 'detect', 'map', 'convert', 'complete'].map((s, idx) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === s ? 'border-primary-500 bg-primary-500 text-white' :
                                    ['detect', 'map', 'convert', 'complete'].includes(step) && idx < ['upload', 'detect', 'map', 'convert', 'complete'].indexOf(step) ?
                                        'border-success-500 bg-success-500 text-white' :
                                        'border-gray-300 bg-white text-gray-400'
                                }`}>
                                {idx + 1}
                            </div>
                            {idx < 4 && (
                                <div className={`flex-1 h-0.5 mx-2 ${['detect', 'map', 'convert', 'complete'].includes(step) && idx < ['upload', 'detect', 'map', 'convert', 'complete'].indexOf(step) ?
                                        'bg-success-500' : 'bg-gray-300'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">Upload</span>
                    <span className="text-xs text-gray-600">Detect</span>
                    <span className="text-xs text-gray-600">Map</span>
                    <span className="text-xs text-gray-600">Convert</span>
                    <span className="text-xs text-gray-600">Done</span>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3"
                >
                    <AlertTriangle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-error-900">Error</h4>
                        <p className="text-sm text-error-700">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-error-600 hover:text-error-800">
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-10 h-10 text-primary-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                Upload Your Sales Data
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                We'll automatically detect the format and map columns for you.
                                Supports CSV, Excel, and various data layouts.
                            </p>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls,.tsv"
                                onChange={(e) => handleFileUpload(e.target.files[0])}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium cursor-pointer hover:bg-primary-600 transition-colors shadow-sm"
                            >
                                <FileText className="w-5 h-5" />
                                Choose File
                            </label>
                            {onCancel && (
                                <button
                                    onClick={onCancel}
                                    className="ml-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Detecting */}
                {step === 'detect' && (
                    <motion.div
                        key="detect"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-xl p-12 border border-gray-200"
                    >
                        <div className="text-center">
                            <div className="inline-block mb-4">
                                <Loader className="w-12 h-12 text-primary-500 animate-spin" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Analyzing Your Data Format
                            </h3>
                            <p className="text-gray-600">
                                Detecting encoding, separator, and column structure...
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Column Mapping */}
                {step === 'map' && formatInfo && (
                    <motion.div
                        key="map"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-xl p-8 border border-gray-200"
                    >
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                            Confirm Column Mapping
                        </h3>

                        {/* Confidence Score */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-900">
                                    Mapping Confidence
                                </span>
                                <span className="text-lg font-bold text-blue-700">
                                    {formatInfo.suggested_mapping.confidence_score.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${formatInfo.suggested_mapping.confidence_score}%` }}
                                />
                            </div>
                        </div>

                        {/* File Info */}
                        <div className="mb-6 grid grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-600">Encoding</div>
                                <div className="font-semibold text-gray-900">{formatInfo.encoding}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-600">Separator</div>
                                <div className="font-semibold text-gray-900">
                                    {formatInfo.separator === ',' ? 'Comma' :
                                        formatInfo.separator === '\t' ? 'Tab' :
                                            formatInfo.separator === ';' ? 'Semicolon' : formatInfo.separator}
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-600">Rows</div>
                                <div className="font-semibold text-gray-900">{formatInfo.num_rows.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Mapping Table */}
                        <div className="space-y-4 mb-6">
                            {Object.entries(columnMapping).map(([requiredCol, mapping]) => (
                                <div key={requiredCol} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {requiredCol.charAt(0).toUpperCase() + requiredCol.slice(1)}
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <select
                                            value={mapping.source_column}
                                            onChange={(e) => {
                                                setColumnMapping({
                                                    ...columnMapping,
                                                    [requiredCol]: {
                                                        ...mapping,
                                                        source_column: e.target.value,
                                                        confidence: 100 // Manual selection = 100% confidence
                                                    }
                                                });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            {formatInfo.columns.map(col => (
                                                <option key={col} value={col}>{col}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-shrink-0">
                                        {getConfidenceIcon(mapping.confidence)}
                                    </div>

                                    <div className="flex-shrink-0 w-16 text-right">
                                        <span className={`text-sm font-medium ${getConfidenceColor(mapping.confidence)}`}>
                                            {mapping.confidence}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Missing Columns Warning */}
                        {formatInfo.suggested_mapping.missing_columns.length > 0 && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Missing Required Columns
                                </h4>
                                <ul className="list-disc list-inside text-sm text-yellow-800">
                                    {formatInfo.suggested_mapping.missing_columns.map(col => (
                                        <li key={col}>{col}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preview Table */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Data Preview (First 5 Rows)
                            </h4>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {formatInfo.columns.map(col => (
                                                <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {formatInfo.sample_data.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                {formatInfo.columns.map(col => (
                                                    <td key={col} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                        {row[col]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('upload')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConversion}
                                disabled={formatInfo.suggested_mapping.missing_columns.length > 0}
                                className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                Convert & Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Converting */}
                {step === 'convert' && (
                    <motion.div
                        key="convert"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-xl p-12 border border-gray-200"
                    >
                        <div className="text-center">
                            <div className="inline-block mb-4">
                                <Loader className="w-12 h-12 text-primary-500 animate-spin" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Converting to Standard Format
                            </h3>
                            <p className="text-gray-600">
                                Mapping columns and validating data...
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Step 5: Complete */}
                {step === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-xl p-12 border border-gray-200"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-success-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                Conversion Successful!
                            </h3>
                            <p className="text-gray-600">
                                Your data has been converted to the standard format.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DataFormatConverter;
