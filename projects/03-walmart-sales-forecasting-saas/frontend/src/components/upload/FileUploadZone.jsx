import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const FileUploadZone = ({ onFileSelect, error: propError, isProcessing }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(propError);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setError(null);
        if (rejectedFiles.length > 0) {
            setError('Please upload a valid CSV or Excel file under 10MB.');
            return;
        }

        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            onFileSelect(selectedFile);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1,
        maxSize: 10485760, // 10MB
        noClick: true,
        noKeyboard: true,
        disabled: isProcessing
    });

    const removeFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setError(null);
        onFileSelect(null);
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    relative overflow-hidden transition-all duration-300
                    border-2 border-dashed rounded-xl p-8 sm:p-12 text-center
                    ${isDragActive ? 'border-brand-500 bg-brand-50/50' : 'border-border-primary bg-bg-secondary'}
                    ${file ? 'border-success-500 bg-success-50/10' : ''}
                    ${error ? 'border-danger-300 bg-danger-50/10' : ''}
                `}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center"
                        >
                            <div className={`
                                w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm
                                ${isDragActive ? 'bg-brand-100 text-brand-600 scale-110' : 'bg-bg-tertiary text-text-tertiary'}
                                transition-all duration-300
                            `}>
                                <Upload className="w-10 h-10" />
                            </div>

                            <h3 className="text-xl font-bold text-text-primary mb-2">
                                {isDragActive ? 'Drop file to upload' : 'Upload Sales Data'}
                            </h3>

                            <p className="text-text-secondary max-w-sm mx-auto mb-8">
                                Drag and drop your CSV or Excel file here, or click the button below to browse.
                            </p>

                            <Button
                                onClick={open}
                                variant="primary"
                                disabled={isProcessing}
                                className="min-w-[160px]"
                            >
                                Browse Files
                            </Button>

                            <p className="text-xs text-text-tertiary mt-6">
                                Supported formats: .csv, .xlsx, .xls (Max 10MB)
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-success-100 text-success-600 flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10" />
                            </div>

                            <h3 className="text-lg font-bold text-text-primary mb-1">
                                File Ready
                            </h3>

                            <div className="flex items-center gap-3 bg-bg-tertiary px-4 py-3 rounded-lg border border-border-primary mt-2 mb-6 max-w-md w-full">
                                <FileText className="w-5 h-5 text-brand-600" />
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="font-medium text-text-primary truncate">{file.name}</p>
                                    <p className="text-xs text-text-tertiary">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="p-1.5 rounded-full hover:bg-bg-secondary text-text-tertiary hover:text-danger-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={open} variant="outline" size="sm">
                                    Change File
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-0 right-0 flex justify-center"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-danger-50 text-danger-700 text-sm font-medium rounded-full border border-danger-200 shadow-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default FileUploadZone;
