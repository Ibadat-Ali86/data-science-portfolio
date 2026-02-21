/**
 * Modal Component - Enterprise Design System
 * Accessible modal with backdrop, animations, and ESC key support
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalContent } from '../../utils/animations/variants';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true
}) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    // ESC key support
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        variants={modalBackdrop}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        variants={modalContent}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`relative w-full ${sizes[size]} bg-surface-default rounded-2xl shadow-2xl overflow-hidden`}
                    >
                        {/* Header */}
                        {(title || showClose) && (
                            <div className="flex items-center justify-between p-6 border-b border-border-default">
                                {title && (
                                    <h2 className="text-2xl font-display font-bold text-text-primary">
                                        {title}
                                    </h2>
                                )}
                                {showClose && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
