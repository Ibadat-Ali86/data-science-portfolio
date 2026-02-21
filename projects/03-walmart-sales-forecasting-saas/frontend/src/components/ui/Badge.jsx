/**
 * Badge Component - Enterprise Design System
 * Status indicators with semantic colors
 */

import React from 'react';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full border';

    const variants = {
        default: 'bg-gray-100 text-gray-700 border-gray-200',
        success: 'bg-success-50 text-success-700 border-success-200',
        warning: 'bg-warning-50 text-warning-700 border-warning-200',
        error: 'bg-error-50 text-error-700 border-error-200',
        info: 'bg-info-50 text-info-700 border-info-200',
        primary: 'bg-brand-50 text-brand-700 border-brand-200'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <span className={classes}>
            {children}
        </span>
    );
};

export default Badge;
