
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileDropZone = ({ onFileAccepted, accept, maxSize = 10485760, maxFiles = 1 }) => {
    const [fileError, setFileError] = useState(null);

    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
            const error = fileRejections[0].errors[0];
            if (error.code === 'file-too-large') {
                setFileError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
            } else if (error.code === 'file-invalid-type') {
                setFileError('Invalid file type');
            } else {
                setFileError(error.message);
            }
            return;
        }

        setFileError(null);
        if (acceptedFiles.length > 0) {
            onFileAccepted(acceptedFiles[0]);
        }
    }, [onFileAccepted, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles,
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center
                    ${isDragActive
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-border-default hover:border-brand-300 hover:bg-bg-secondary'
                    }
                    ${fileError ? 'border-red-300 bg-red-50' : ''}
                `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors
                        ${isDragActive ? 'bg-brand-100' : 'bg-bg-tertiary'}
                        ${fileError ? 'bg-red-100' : ''}
                    `}>
                        {isDragActive ? (
                            <UploadCloud className="w-8 h-8 text-brand-600 animate-bounce" />
                        ) : (
                            <UploadCloud className="w-8 h-8 text-text-tertiary" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-base font-semibold text-text-primary">
                            {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-text-tertiary">
                            CSV, Excel, or JSON (max {maxSize / 1024 / 1024}MB)
                        </p>
                    </div>
                </div>

                <AnimatePresence>
                    {fileError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 text-sm text-red-600 font-medium"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {fileError}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FileDropZone;
