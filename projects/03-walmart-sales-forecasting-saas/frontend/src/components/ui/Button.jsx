/**
 * Core Button Component - Enterprise Design System
 * Unified button with multiple variants and states
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isSuccess = false,
    disabled = false,
    className = '',
    icon: Icon,
    iconPosition = 'left',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm hover:shadow-md',
        secondary: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-brand-500 hover:bg-brand-50 focus:ring-brand-500',
        ghost: 'bg-transparent text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3.5 text-lg'
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const state = isSuccess ? 'success' : isLoading ? 'loading' : undefined;

    return (
        <motion.button
            className={classes}
            disabled={disabled || isLoading || isSuccess}
            data-state={state}
            whileHover={{ scale: disabled || isLoading || isSuccess ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading || isSuccess ? 1 : 0.98 }}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={18} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={18} />}
                </>
            )}
        </motion.button>
    );
};

export default Button;
