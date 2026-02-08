import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    FileText,
    CheckCircle,
    Trash2,
    Eye,
    Download,
    MoreHorizontal,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Database,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useFlow } from '../context/FlowContext';
import { API_BASE_URL } from '../utils/constants';

const DataUpload = () => {
    const navigate = useNavigate();
    const { completeStep, uploadedData: existingData } = useFlow();
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isProcessingBackend, setIsProcessingBackend] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);

    // Mock Datasets for UI demonstration (plus the uploaded one)
    const [datasets, setDatasets] = useState([
        {
            id: 1,
            name: 'walmart_sales_2024.csv',
            path: '/uploads/walmart/',
            size: '45.2 MB',
            rows: '421,570',
            columns: 15,
            uploaded: '2 hours ago',
            status: 'Ready'
        },
        {
            id: 2,
            name: 'features_external.csv',
            path: '/uploads/walmart/',
            size: '8.1 MB',
            rows: '143',
            columns: 12,
            uploaded: '1 day ago',
            status: 'Processing'
        }
    ]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
        );

        if (droppedFiles.length > 0) {
            handleFiles(droppedFiles);
        } else {
            alert("Please upload a valid CSV file.");
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(
            file => file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
        );

        if (selectedFiles.length > 0) {
            handleFiles(selectedFiles);
        } else if (e.target.files.length > 0) {
            alert("Please select a valid CSV file.");
        }
    };

    const handleFiles = async (newFiles) => {
        setFiles(prev => [...prev, ...newFiles]);
        // Simulate upload for the first file
        if (newFiles.length > 0) {
            simulateUpload(newFiles[0]);
        }
    };

    const simulateUpload = async (file) => {
        try {
            const text = await file.text();
            const { headers, data } = parseCSV(text);

            // Guard against empty files
            if (headers.length === 0 || data.length === 0) {
                setUploadSuccess(false);
                setIsUploading(false);
                setFiles([]);
                alert(`Error: The CSV file appears to be empty or incorrectly formatted.`);
                return;
            }

            // Validation - Generic Time Series
            // 1. Check for a date-like column (expanded keywords for market data)
            const dateKeywords = ['date', 'time', 'year', 'month', 'day', 'timestamp', 'period', 'datetime', 'created', 'updated'];
            const hasDateColumn = headers.some(h => dateKeywords.some(k => h.toLowerCase().includes(k)));

            // 2. Check for at least one numeric column (excluding potential date columns)
            // Check multiple rows for numeric values to handle edge cases
            const numericTargetKeywords = ['price', 'close', 'open', 'high', 'low', 'volume', 'sales', 'demand', 'quantity', 'value', 'revenue', 'amount', 'total', 'count', 'adj', 'return', 'change', 'rate', 'index', 'score'];

            const hasNumericColumn = headers.some(h => {
                // First check if the header name suggests a numeric column
                const headerLower = h.toLowerCase();
                const isNumericHeader = numericTargetKeywords.some(k => headerLower.includes(k));

                // Then verify by checking actual values across multiple rows
                const sampleRows = data.slice(0, Math.min(5, data.length));
                const hasNumericValues = sampleRows.some(row => {
                    const value = row[h];
                    if (value === undefined || value === null || value === '') return false;
                    // Remove commas and check if numeric
                    const cleanValue = String(value).replace(/,/g, '');
                    return !isNaN(parseFloat(cleanValue)) && isFinite(parseFloat(cleanValue));
                });

                // Accept if header suggests numeric OR values are numeric (and not a date column)
                const isDateColumn = dateKeywords.some(k => headerLower.includes(k));
                return !isDateColumn && (isNumericHeader || hasNumericValues);
            });

            if (!hasDateColumn) {
                setUploadSuccess(false);
                setIsUploading(false);
                setFiles([]);
                alert(`Error: Invalid CSV format.\nCould not identify a Date column.\nPlease ensure your CSV has a column like 'Date', 'Timestamp', etc.`);
                return;
            }

            // We'll be lenient on numeric check for datasets with many columns
            if (!hasNumericColumn && headers.length < 2) {
                setUploadSuccess(false);
                setIsUploading(false);
                setFiles([]);
                alert(`Error: Invalid CSV format.\nCould not identify a numeric Value column for forecasting.`);
                return;
            }

            setIsUploading(true);
            setUploadProgress(0);

            // Mock progress
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 5;
                });
            }, 100);

            setTimeout(() => {
                setIsUploading(false);
                const newDataset = {
                    id: Date.now(),
                    name: file.name,
                    path: '/uploads/new/',
                    size: formatFileSize(file.size),
                    rows: data.length.toLocaleString(),
                    columns: headers.length,
                    uploaded: 'Just now',
                    status: 'Ready',
                    raw: { headers, data }
                };
                setDatasets(prev => [newDataset, ...prev]);

                // Store the file for backend upload
                setCurrentFile(file);

                // Validate and complete step in FlowContext
                const uploadData = {
                    rawData: data.slice(0, 1000),
                    allData: data,
                    columns: headers,
                    fileName: file.name,
                    totalRows: data.length,
                    uploadedAt: new Date().toISOString()
                };
                completeStep('upload', uploadData);
                setUploadSuccess(true);
            }, 2500);
        } catch (error) {
            console.error('Error processing upload:', error);
            setUploadSuccess(false);
            setIsUploading(false);
            setFiles([]);
            alert(`Error: Failed to process the CSV file.\n${error.message || 'Please check the file format.'}`);
        }
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        if (lines.length === 0) return { headers: [], data: [] };
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((h, i) => row[h] = values[i]);
            return row;
        }).filter(row => Object.keys(row).length === headers.length);
        return { headers, data };
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    /**
     * Handle proceeding to analysis by uploading to backend first
     */
    const handleProceedToAnalysis = async () => {
        if (!currentFile) {
            console.error('No file available for backend upload');
            alert('Please upload a file first');
            return;
        }

        setIsProcessingBackend(true);

        try {
            // Upload to backend API
            const formData = new FormData();
            formData.append('file', currentFile);

            const response = await fetch(`${API_BASE_URL}/api/analysis/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || 'Backend upload failed');
            }

            const result = await response.json();
            console.log('Backend upload successful:', result);

            // Update FlowContext with session ID
            const uploadData = {
                sessionId: result.session_id,
                rawData: result.sample_data,
                allData: result.sample_data, // Backend returns sample, full data is on server
                columns: result.columns,
                fileName: result.filename,
                totalRows: result.rows,
                uploadedAt: new Date().toISOString()
            };
            completeStep('upload', uploadData);

            // Save session to storage as backup
            sessionStorage.setItem('currentSessionId', result.session_id);

            // Navigate to analysis
            navigate('/analysis');
        } catch (error) {
            console.error('Backend upload error:', error);
            alert(`Failed to prepare analysis: ${error.message}. Please try again.`);
        } finally {
            setIsProcessingBackend(false);
        }
    };

    const togglePreview = (dataset) => {
        if (dataset.raw) {
            setPreviewData(dataset.raw);
        } else {
            // Mock preview data for demonstration if distinct from uploaded
            setPreviewData({
                headers: ['Store', 'Date', 'Weekly_Sales', 'Holiday_Flag', 'Temperature', 'Fuel_Price', 'CPI', 'Unemployment'],
                data: [
                    { 'Store': 1, 'Date': '05-02-2010', 'Weekly_Sales': 1643690.90, 'Holiday_Flag': 0, 'Temperature': 42.31, 'Fuel_Price': 2.572, 'CPI': 211.096, 'Unemployment': 8.106 },
                    { 'Store': 1, 'Date': '12-02-2010', 'Weekly_Sales': 1641957.44, 'Holiday_Flag': 1, 'Temperature': 38.51, 'Fuel_Price': 2.548, 'CPI': 211.242, 'Unemployment': 8.106 },
                    { 'Store': 1, 'Date': '19-02-2010', 'Weekly_Sales': 1611968.17, 'Holiday_Flag': 0, 'Temperature': 39.93, 'Fuel_Price': 2.514, 'CPI': 211.289, 'Unemployment': 8.106 },
                ]
            });
        }
        setShowPreview(true);
    };

    return (
        <Layout title="Data Management">
            <div className="space-y-8">
                {/* Upload Zone */}
                <section className="upload-section">
                    <div className="mb-6 p-4 bg-blue-50/5 border border-blue-200/20 rounded-lg">
                        <h4 className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                            <FileText className="w-4 h-4" /> CSV Format Instructions
                        </h4>
                        <p className="text-sm text-gray-400 mb-2">
                            Please upload a Time-Series CSV file.
                        </p>
                        <ul className="text-sm text-gray-400 mb-2 list-disc list-inside">
                            <li>Must contain a <strong>Date</strong> / Timestamp column.</li>
                            <li>Must contain at least one <strong>Numeric</strong> column (e.g., Sales, Demand).</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">
                            * The system will automatically detect date and target columns.
                        </p>
                    </div>

                    <motion.div
                        className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <div className="upload-zone-icon">
                            <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-display font-semibold text-text-primary mb-2">
                            Upload Your Dataset
                        </h3>
                        <p className="text-lg text-text-secondary mb-6">
                            Drag and drop CSV files here, or click to browse
                        </p>
                        <div className="flex justify-center gap-6 mb-8">
                            <span className="flex items-center gap-2 text-sm text-text-secondary">
                                <CheckCircle className="w-4 h-4 text-accent-green" /> CSV format
                            </span>
                            <span className="flex items-center gap-2 text-sm text-text-secondary">
                                <CheckCircle className="w-4 h-4 text-accent-green" /> Max 500 MB
                            </span>
                            <span className="flex items-center gap-2 text-sm text-text-secondary">
                                <CheckCircle className="w-4 h-4 text-accent-green" /> UTF-8 encoding
                            </span>
                        </div>
                        <input
                            type="file"
                            id="file-upload"
                            accept=".csv"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button className="btn-primary">
                            Choose Files
                        </button>
                    </motion.div>
                </section>

                {/* Upload Progress */}
                <AnimatePresence>
                    {isUploading && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-bg-secondary border border-border-primary rounded-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="font-mono font-semibold text-text-primary">
                                    {files[files.length - 1]?.name}
                                </div>
                                <div className="font-mono text-sm text-text-tertiary">
                                    {formatFileSize(files[files.length - 1]?.size || 0)}
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-3 text-sm text-text-secondary">
                                <span>Uploading...</span>
                                <span className="font-mono text-accent-blue">{uploadProgress}%</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success & Proceed Banner */}
                <AnimatePresence>
                    {uploadSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[rgba(16,185,129,0.1)] border border-[var(--accent-green)] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-[var(--accent-green)] text-white">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upload Complete!</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Your dataset has been successfully processed and is ready for analysis.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleProceedToAnalysis}
                                    disabled={isProcessingBackend}
                                    className="btn-primary"
                                >
                                    {isProcessingBackend ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Preparing Analysis...
                                        </>
                                    ) : (
                                        <>
                                            Proceed to Analysis <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Datasets Table */}
                <section className="bg-bg-secondary border border-border-primary rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-display font-semibold text-text-primary">Your Datasets</h2>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search datasets..."
                                    className="pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary text-sm focus:border-accent-blue focus:outline-none w-[300px]"
                                />
                            </div>
                            <select className="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary text-sm focus:border-accent-blue focus:outline-none min-w-[150px]">
                                <option>All Files</option>
                                <option>Recent</option>
                                <option>Favorites</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" className="rounded border-border-primary bg-bg-tertiary" /></th>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Rows</th>
                                    <th>Columns</th>
                                    <th>Uploaded</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasets.map((dataset) => (
                                    <motion.tr
                                        key={dataset.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileHover={{ backgroundColor: 'rgba(74, 158, 255, 0.05)' }}
                                    >
                                        <td><input type="checkbox" className="rounded border-border-primary bg-bg-tertiary" /></td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center text-text-secondary">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-text-primary font-mono text-sm">{dataset.name}</div>
                                                    <div className="text-xs text-text-tertiary font-mono">{dataset.path}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="font-mono text-sm text-text-primary">{dataset.size}</span></td>
                                        <td><span className="font-mono text-sm text-text-primary">{dataset.rows}</span></td>
                                        <td><span className="font-mono text-sm text-text-primary">{dataset.columns}</span></td>
                                        <td><span className="text-sm text-text-tertiary">{dataset.uploaded}</span></td>
                                        <td>
                                            <span className={`badge ${dataset.status === 'Ready' ? 'badge-success' : 'badge-warning'}`}>
                                                {dataset.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => togglePreview(dataset)}
                                                    className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-secondary hover:text-accent-blue transition-colors"
                                                    title="Preview"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-secondary hover:text-accent-blue transition-colors" title="Download">
                                                    <Download size={16} />
                                                </button>
                                                <button className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-secondary hover:text-accent-blue transition-colors" title="More">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-border-primary">
                        <div className="text-sm text-text-tertiary">
                            Showing 1-{datasets.length} of {datasets.length} datasets
                        </div>
                        <div className="flex gap-2">
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-primary text-text-secondary hover:bg-bg-tertiary disabled:opacity-50" disabled>
                                <ChevronLeft size={18} />
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent-blue text-white font-medium">1</button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-primary text-text-secondary hover:bg-bg-tertiary">2</button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-primary text-text-secondary hover:bg-bg-tertiary">3</button>
                            <span className="w-9 h-9 flex items-center justify-center text-text-tertiary">...</span>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-primary text-text-secondary hover:bg-bg-tertiary">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && previewData && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content modal-large"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Dataset Preview</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="bg-bg-tertiary border border-border-primary rounded-lg p-4 text-center">
                                        <div className="text-sm text-text-tertiary uppercase tracking-wider mb-2">Total Rows</div>
                                        <div className="font-mono text-2xl font-bold text-accent-blue">{previewData.data.length.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-bg-tertiary border border-border-primary rounded-lg p-4 text-center">
                                        <div className="text-sm text-text-tertiary uppercase tracking-wider mb-2">Columns</div>
                                        <div className="font-mono text-2xl font-bold text-accent-blue">{previewData.headers.length}</div>
                                    </div>
                                    <div className="bg-bg-tertiary border border-border-primary rounded-lg p-4 text-center">
                                        <div className="text-sm text-text-tertiary uppercase tracking-wider mb-2">Missing Values</div>
                                        <div className="font-mono text-2xl font-bold text-accent-blue">0%</div>
                                    </div>
                                    <div className="bg-bg-tertiary border border-border-primary rounded-lg p-4 text-center">
                                        <div className="text-sm text-text-tertiary uppercase tracking-wider mb-2">File Size</div>
                                        <div className="font-mono text-2xl font-bold text-accent-blue">~</div>
                                    </div>
                                </div>

                                <div className="overflow-auto max-h-[400px] border border-border-primary rounded-lg">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                {previewData.headers.map((header, i) => (
                                                    <th key={i}>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.data.slice(0, 10).map((row, i) => (
                                                <tr key={i}>
                                                    {previewData.headers.map((header, j) => (
                                                        <td key={j}>{row[header]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="btn-secondary"
                                >
                                    Close
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={async () => {
                                        // Find the dataset being previewed
                                        const currentDataset = datasets.find(d => d.raw === previewData);
                                        if (currentDataset && currentDataset.raw) {
                                            // Create a File object from the raw data
                                            const csv = [currentDataset.raw.headers.join(','),
                                            ...currentDataset.raw.data.map(row =>
                                                currentDataset.raw.headers.map(h => row[h]).join(','))
                                            ].join('\n');
                                            const file = new File([csv], currentDataset.name, { type: 'text/csv' });
                                            setCurrentFile(file);

                                            // Close preview first
                                            setShowPreview(false);

                                            // Trigger upload to backend
                                            setTimeout(() => handleProceedToAnalysis(), 100);
                                        } else {
                                            // Fallback for mock datasets
                                            setShowPreview(false);
                                            navigate('/analysis');
                                        }
                                    }}
                                    disabled={isProcessingBackend}
                                >
                                    {isProcessingBackend ? 'Preparing...' : 'Use This Dataset'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default DataUpload;
