import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    CheckCircle,
    Eye,
    Download,
    RefreshCw,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../utils/constants';
import ColumnMapper from '../components/pipeline/ColumnMapper';
import GapAnalysisReport from '../components/pipeline/GapAnalysisReport';
import SmartUploadZone from '../components/upload/SmartUploadZone';
import ValidationFeedback from '../components/common/ValidationFeedback';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import DataTable from '../components/tables/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const DataUpload = () => {
    const navigate = useNavigate();
    const { completeStep, uploadedData: existingData } = useFlow();
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isProcessingBackend, setIsProcessingBackend] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [uploadedSessionId, setUploadedSessionId] = useState(null);

    // Mapper State
    const [showMapper, setShowMapper] = useState(false);
    const [suggestedMapping, setSuggestedMapping] = useState(null);
    const [detectedColumns, setDetectedColumns] = useState([]);
    const [tempFilePath, setTempFilePath] = useState(null);
    const [gapReport, setGapReport] = useState(null);
    const [showGapReport, setShowGapReport] = useState(false);

    // Mock Datasets
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

    const handleFileSelect = (result) => {
        if (!result) return;

        const file = result.file || result;
        const sessionId = result.sessionId || null;
        const rows = result.rows || 0;
        const columns = result.columns || [];
        const adapterInfo = result.adapterInfo || {};

        setCurrentFile(file);

        // Store real sessionId from backend upload
        if (sessionId) {
            setUploadedSessionId(sessionId);
            sessionStorage.setItem('currentSessionId', sessionId);
            console.log('✅ Real sessionId stored:', sessionId);
        }

        // Build validation results for display
        if (adapterInfo.issues && adapterInfo.issues.length > 0) {
            setValidationResults({
                passed: Object.keys(adapterInfo.detected_columns || {}).map(k => `${k}_detected`),
                failed: [],
                warnings: adapterInfo.issues.map(issue => ({ message: issue }))
            });
        } else if (sessionId) {
            // Upload succeeded - show positive validation
            setValidationResults({
                passed: ['file_format', 'file_size', 'encoding', 'column_detection'],
                failed: [],
                warnings: []
            });
        }

        // Update flow context with real data
        const uploadData = {
            sessionId,
            rawData: [],
            allData: [],
            columns: columns,
            fileName: file.name,
            totalRows: rows,
            uploadedAt: new Date().toISOString(),
            qualityScore: adapterInfo.quality_score || 100
        };
        completeStep('upload', uploadData);
        setUploadSuccess(true);

        // Also process file locally for preview
        processFile(file);
    };

    // Removed handleFiles and simulateUpload as they were redundant/conflicting
    // Replaced with direct processing logic

    const { showToast } = useToast();

    const processFile = async (file) => {
        try {
            // Validate file size manually (50MB) just in case
            if (file.size > 50 * 1024 * 1024) {
                showToast('File exceeds 50MB. Please split your dataset or contact support.', 'error', 6000);
                setUploadSuccess(false);
                return;
            }

            // Read file content for preview/parsing
            const text = await file.text();
            const { headers, data } = parseCSV(text);

            // Guard against empty files
            if (headers.length === 0) {
                setUploadSuccess(false);
                showToast('Error: The CSV file appears to be empty or incorrectly formatted.', 'error', 5000);
                return;
            }

            // Validate minimum row count (50 rows)
            if (data.length < 50) {
                setUploadSuccess(false);
                showToast(`Your dataset has only ${data.length} rows. Minimum 50 required for reliable forecasting.`, 'error', 6000);
                return;
            }

            // Quick heuristic check for columns on the first 10 rows
            const sampleRows = data.slice(0, 10);
            let hasDateColumn = false;
            let hasNumericColumn = false;

            // Simple date regex for YYYY-MM-DD, MM/DD/YYYY, etc.
            const dateRegex = /^(\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})$/;

            headers.forEach(header => {
                let isNumericCount = .0;
                let isDateCount = .0;

                sampleRows.forEach(row => {
                    const val = String(row[header] || '').trim();
                    if (val && !isNaN(Number(val))) isNumericCount++;
                    if (val && dateRegex.test(val)) isDateCount++;
                    else if (val && !isNaN(Date.parse(val))) isDateCount++; // fallback native parse
                });

                if (isDateCount > sampleRows.length * 0.5) hasDateColumn = true;
                if (isNumericCount > sampleRows.length * 0.5) hasNumericColumn = true;
            });

            if (!hasDateColumn) {
                setUploadSuccess(false);
                showToast('Date column could not be parsed. Supported formats: YYYY-MM-DD, MM/DD/YYYY.', 'error', 6000);
                return;
            }

            if (!hasNumericColumn) {
                setUploadSuccess(false);
                showToast('Target column not found. Expecting numeric values for forecasting.', 'error', 6000);
                return;
            }

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
            setCurrentFile(file);
            setUploadSuccess(true);

            // Complete Flow Step
            const uploadData = {
                rawData: data.slice(0, 1000),
                allData: data,
                columns: headers,
                fileName: file.name,
                totalRows: data.length,
                uploadedAt: new Date().toISOString()
            };
            completeStep('upload', uploadData);

        } catch (error) {
            console.error('Error processing upload:', error);
            setUploadSuccess(false);
            alert(`Error: Failed to process file.`);
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

    const handleProceedToAnalysis = async () => {
        // Use real sessionId if available, otherwise navigate anyway
        if (uploadedSessionId) {
            sessionStorage.setItem('currentSessionId', uploadedSessionId);
        }
        navigate('/analysis');
    };

    const handleMappingConfirm = async (approvedMapping) => {
        setIsProcessingBackend(true);
        try {
            // 4. Convert Format
            const convertResponse = await fetch(`${API_BASE_URL}/api/data-pipeline/convert-format`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_path: tempFilePath,
                    mapping: approvedMapping,
                    encoding: 'utf-8', // default
                    separator: ',' // default
                })
            });

            if (!convertResponse.ok) throw new Error('Conversion failed');
            const convertResult = await convertResponse.json();

            // 5. Initialize Session
            const initResponse = await fetch(`${API_BASE_URL}/api/analysis/init-session-from-path`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_path: convertResult.converted_file_path,
                    filename: currentFile.name
                })
            });

            if (!initResponse.ok) throw new Error('Session init failed');
            const sessionResult = await initResponse.json();

            // 6. Complete & Navigate
            try {
                const uploadData = {
                    sessionId: sessionResult.session_id,
                    rawData: sessionResult.sample_data,
                    allData: sessionResult.sample_data,
                    columns: sessionResult.columns,
                    fileName: sessionResult.filename,
                    totalRows: sessionResult.rows,
                    uploadedAt: new Date().toISOString()
                };

                // Attempt to update context, but don't block navigation on it
                completeStep('upload', uploadData);
                sessionStorage.setItem('currentSessionId', sessionResult.session_id);

                console.log('Session initialized:', sessionResult.session_id);
            } catch (err) {
                console.warn('Flow context update failed, but proceeding:', err);
            }

            setShowMapper(false);
            // Small delay to ensure state updates propagate
            setTimeout(() => navigate('/analysis'), 100);

        } catch (error) {
            console.error('Mapping processing error:', error);
            alert(`Failed to process data: ${error.message}`);
        } finally {
            setIsProcessingBackend(false);
        }
    };

    const togglePreview = (dataset) => {
        setPreviewData(dataset.raw || { headers: [], data: [] });
        setShowPreview(true);
    };

    const tableColumns = useMemo(() => [
        {
            key: 'name',
            label: 'Name',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center text-text-secondary">
                        <FileText size={16} />
                    </div>
                    <div>
                        <div className="font-medium text-text-primary font-mono text-sm">{row.name}</div>
                        <div className="text-xs text-text-tertiary font-mono">{row.path}</div>
                    </div>
                </div>
            )
        },
        { key: 'size', label: 'Size', render: (val) => <span className="font-mono text-sm">{val}</span> },
        { key: 'rows', label: 'Rows', render: (val) => <span className="font-mono text-sm">{val}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <Badge variant={val === 'Ready' ? 'success' : 'warning'}>
                    {val}
                </Badge>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 h-auto text-text-secondary hover:text-brand-600"
                        onClick={() => togglePreview(row)}
                    >
                        <Eye size={16} />
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Data Management</h2>
                    <p className="text-text-secondary mt-1">Upload and manage your datasets for forecasting.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Upload Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <SmartUploadZone
                            onUploadComplete={handleFileSelect}
                            maxFileSize={50 * 1024 * 1024}
                        />

                        {/* Upload Progress */}
                        <AnimatePresence>
                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-text-primary">Uploading...</span>
                                        <span className="text-sm font-mono text-brand-600">{uploadProgress}%</span>
                                    </div>
                                    <ProgressBar value={uploadProgress} variant="primary" size="sm" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Validation Feedback */}
                    <AnimatePresence>
                        {validationResults && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <ValidationFeedback
                                    results={validationResults}
                                    qualityScore={validationResults.failed.length === 0 ? 95 : 60}
                                    compact={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success Banner */}
                    <AnimatePresence>
                        {uploadSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-emerald-950 mb-0.5">Upload Complete</h3>
                                        <p className="text-emerald-700/90 text-sm font-medium">
                                            {uploadedSessionId
                                                ? `Session ready: ${uploadedSessionId.slice(0, 16)}...`
                                                : 'Your dataset is ready for analysis.'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleProceedToAnalysis}
                                    disabled={isProcessingBackend}
                                    isLoading={isProcessingBackend}
                                    variant="primary"
                                    icon={ArrowRight}
                                    iconPosition="right"
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 border-none shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Proceed to Analysis
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Instructions */}
                <div className="space-y-6">
                    <Card className="bg-brand-50/50 border-brand-100">
                        <h3 className="font-bold text-brand-900 flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-brand-600" />
                            CSV Guidelines
                        </h3>
                        <ul className="space-y-3 text-sm text-brand-800">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5" />
                                <span>File must be in <strong>.csv</strong> format (max 500MB).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5" />
                                <span>Include a <strong>Date</strong> column (e.g., YYYY-MM-DD).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5" />
                                <span>Include numeric target columns (e.g., Sales, Demand).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5" />
                                <span>Ensure no merged cells or complex headers.</span>
                            </li>
                        </ul>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-text-primary mb-3">Recent Uploads</h3>
                        <div className="space-y-3">
                            {datasets.slice(0, 3).map(ds => (
                                <motion.div
                                    key={ds.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-default hover:shadow-sm border border-transparent hover:border-border-default transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-tertiary group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-text-primary truncate">{ds.name}</p>
                                        <p className="text-xs text-text-tertiary mt-0.5">{ds.uploaded}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Datasets Table */}
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-text-primary">Dataset Library</h3>
                </div>
                <DataTable
                    columns={tableColumns}
                    data={datasets}
                    pagination={true}
                    searchable={true}
                />
            </Card>

            {/* Modals */}
            <Modal
                isOpen={showGapReport}
                onClose={() => setShowGapReport(false)}
                title="Schema Analysis"
                size="lg"
            >
                <GapAnalysisReport
                    report={gapReport}
                    onProceed={() => {
                        setShowGapReport(false);
                        setShowMapper(true);
                    }}
                    onCancel={() => setShowGapReport(false)}
                />
            </Modal>

            <Modal
                isOpen={showMapper}
                onClose={() => setShowMapper(false)}
                title="Map CSV Columns"
                size="xl"
            >
                <ColumnMapper
                    sourceColumns={detectedColumns}
                    suggestedMapping={suggestedMapping}
                    onConfirm={handleMappingConfirm}
                    onCancel={() => setShowMapper(false)}
                    isLoading={isProcessingBackend}
                />
            </Modal>

            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Dataset Preview"
                size="xl"
            >
                {previewData && (
                    <div className="space-y-6">
                        <div className="overflow-auto max-h-[400px] border border-border-default rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-bg-tertiary text-text-secondary font-medium border-b border-border-default">
                                    <tr>
                                        {previewData.headers.map((header, i) => (
                                            <th key={i} className="px-4 py-3 whitespace-nowrap">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default">
                                    {previewData.data.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-bg-secondary transition-colors">
                                            {previewData.headers.map((header, j) => (
                                                <td key={j} className="px-4 py-3 text-text-secondary whitespace-nowrap">{row[header]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={() => setShowPreview(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DataUpload;
