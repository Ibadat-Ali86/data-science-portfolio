import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const FloatingInput = ({
    label,
    error,
    icon: Icon,
    type = 'text',
    className = '',
    required = false,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    // Determine if the label should float
    const hasValue = value !== undefined ? String(value).length > 0 : String(defaultValue || '').length > 0;
    const shouldFloat = isFocused || hasValue || type === 'date';

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        <div className="space-y-1.5 w-full">
            <div className={`relative rounded-xl border-2 transition-all duration-200 bg-surface-default ${error
                ? 'border-border-error focus-within:border-border-error focus-within:ring-2 focus-within:ring-red-500/20'
                : 'border-border-default focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 hover:border-border-focus'
                }`}>
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${error ? 'text-accent-danger' : isFocused ? 'text-brand-500' : 'text-text-tertiary'
                        }`}>
                        <Icon size={20} />
                    </div>
                )}

                <div className="relative w-full h-[56px]">
                    <label
                        className={`absolute left-0 pointer-events-none transition-all duration-200 ease-in-out ${Icon ? 'pl-12' : 'pl-4'
                            } ${shouldFloat
                                ? 'top-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-text-tertiary'
                                : 'top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary'
                            } ${error ? 'text-accent-danger' : ''}`}
                    >
                        {label} {required && <span className="text-accent-error ml-0.5">*</span>}
                    </label>

                    <input
                        type={type}
                        value={value}
                        defaultValue={defaultValue}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`absolute inset-0 w-full h-full bg-transparent border-none outline-none focus:ring-0 text-text-primary px-4 pt-5 pb-1 ${Icon ? 'pl-12' : 'pl-4'
                            } ${className}`}
                        {...props}
                    />
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-1.5 text-accent-error text-xs font-medium pl-1 mt-1"
                    >
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingInput;
