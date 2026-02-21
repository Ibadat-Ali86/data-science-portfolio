/**
 * Core Input Component - Enterprise Design System
 * Form input with label, validation states, and icon support
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const Input = ({
    label,
    error,
    icon: Icon,
    type = 'text',
    className = '',
    required = false,
    ...props
}) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-accent-error ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                        <Icon size={20} />
                    </div>
                )}

                <input
                    type={type}
                    className={`
            w-full px-4 py-2.5 
            ${Icon ? 'pl-11' : ''} 
            bg-surface-default 
            border-2 border-border-default
            rounded-lg 
            text-text-primary 
            placeholder-text-tertiary
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
            hover:border-border-hover
            disabled:bg-surface-disabled disabled:cursor-not-allowed
            ${error ? 'border-border-error focus:border-border-error focus:ring-red-500/20' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-1.5 text-accent-error text-sm"
                    >
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Input;
