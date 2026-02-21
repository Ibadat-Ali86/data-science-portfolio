/**
 * Toast Notification System - Enterprise Design System
 * Toast notifications with auto-dismiss and stacking
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[var(--z-tooltip)] space-y-2 max-w-md">
            <AnimatePresence>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertCircle,
        info: Info
    };

    const colors = {
        success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        error: 'bg-red-50 text-red-900 border-red-200',
        warning: 'bg-amber-50 text-amber-900 border-amber-200',
        info: 'bg-blue-50 text-blue-900 border-blue-200'
    };

    const iconColors = {
        success: 'text-emerald-600',
        error: 'text-red-600',
        warning: 'text-amber-600',
        info: 'text-blue-600'
    };

    const Icon = icons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${colors[toast.type]}`}
        >
            <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default ToastProvider;
