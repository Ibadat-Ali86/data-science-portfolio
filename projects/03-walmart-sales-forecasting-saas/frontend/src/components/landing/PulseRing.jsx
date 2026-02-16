import React from 'react';
import { motion } from 'framer-motion';

/**
 * PulseRing - Animated pulsing ring effect
 * Perfect for CTAs and important buttons to draw attention
 */
const PulseRing = ({
    children,
    className = '',
    pulseColor = 'rgba(59, 130, 246, 0.4)', // primary-500 with opacity
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6'
    };

    return (
        <div className="relative inline-flex">
            {/* Animated pulse rings */}
            {[0, 1, 2].map((index) => (
                <motion.span
                    key={index}
                    className={`absolute inset-0 rounded-full`}
                    style={{
                        border: `2px solid ${pulseColor}`,
                    }}
                    animate={{
                        scale: [1, 2, 2.5],
                        opacity: [0.8, 0.4, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.6,
                        ease: 'easeOut',
                    }}
                />
            ))}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default PulseRing;
