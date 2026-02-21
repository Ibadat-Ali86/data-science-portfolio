/**
 * Core Card Component - Enterprise Design System
 * Flexible card with variants for different use cases
 */

import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    variant = 'default',
    hoverable = true,
    className = '',
    ...props
}) => {
    const baseStyles = 'card-premium transition-all duration-200 overflow-hidden';

    const variants = {
        default: 'p-6',
        feature: 'p-8 relative',
        kpi: 'p-6',
        glass: 'p-6 bg-white/70 backdrop-blur-2xl',
        dark: 'p-6 bg-slate-900 border-slate-700/50',
    };

    const hoverStyles = hoverable
        ? 'cursor-pointer'
        : '';

    const classes = `${baseStyles} ${variants[variant] || variants.default} ${hoverStyles} ${className}`;

    if (hoverable) {
        return (
            <motion.div
                className={classes}
                whileHover={{ y: -2, scale: 1.002 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

// Card Header Subcomponent
Card.Header = ({ children, className = '' }) => (
    <div className={`flex justify-between items-center mb-4 pb-4 border-b border-border-default ${className}`}>
        {children}
    </div>
);

// Card Title Subcomponent
Card.Title = ({ children, className = '' }) => (
    <h3 className={`font-display text-xl font-semibold text-text-primary ${className}`}>
        {children}
    </h3>
);

// Card Body Subcomponent
Card.Body = ({ children, className = '' }) => (
    <div className={`py-4 ${className}`}>
        {children}
    </div>
);

// Card Footer Subcomponent
Card.Footer = ({ children, className = '' }) => (
    <div className={`pt-4 border-t border-border-default ${className}`}>
        {children}
    </div>
);

export default Card;
