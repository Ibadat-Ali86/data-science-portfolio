import React from 'react';
import { motion } from 'framer-motion';

/**
 * GradientText - Animated gradient text with shimmer effect
 * Creates eye-catching text with flowing gradient animation
 */
const GradientText = ({
    children,
    className = '',
    from = 'from-primary-600',
    via = 'via-secondary-500',
    to = 'to-primary-600',
    animate = true
}) => {
    return (
        <motion.span
            className={`bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent ${animate ? 'bg-[length:200%_100%]' : ''
                } ${className}`}
            {...(animate && {
                animate: {
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                },
                transition: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                },
            })}
            style={animate ? {
                backgroundSize: '200% 100%',
            } : {}}
        >
            {children}
        </motion.span>
    );
};

export default GradientText;
